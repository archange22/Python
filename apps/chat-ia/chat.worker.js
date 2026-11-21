import {
  SUN_FOUNDATION_MODEL,
  SUN_MODEL_KEY,
  SUN_MODEL_LABEL,
  buildSunMessages,
  cleanSunOutput,
  getSunGenerationOptions,
  getSunRuntimePlan
} from "./sun-core.js";

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2";
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const FETCH_RETRIES = 3;

let generator = null;
let TextStreamerClass = null;
let modelPromise = null;
let currentRuntime = null;
let currentModelOptions = null;

function send(type, details = {}) {
  self.postMessage({ type, ...details });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shortRequestName(input) {
  try {
    const url = new URL(typeof input === "string" ? input : input.url);
    return url.pathname.split("/").slice(-2).join("/");
  } catch {
    return "fichier du modèle SUN";
  }
}

async function fetchWithRetry(input, init = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      if (init.signal?.aborted) throw new DOMException("Chargement annulé", "AbortError");
      const response = await fetch(input, init);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === FETCH_RETRIES) return response;
      try { await response.body?.cancel(); } catch {}
      send("network-retry", {
        attempt: attempt + 1,
        maxAttempts: FETCH_RETRIES,
        file: shortRequestName(input),
        reason: "HTTP " + response.status
      });
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError" || attempt === FETCH_RETRIES) throw error;
      send("network-retry", {
        attempt: attempt + 1,
        maxAttempts: FETCH_RETRIES,
        file: shortRequestName(input),
        reason: error?.message || "Connexion interrompue"
      });
    }
    await sleep(700 * Math.pow(2, attempt - 1));
  }
  throw lastError || new Error("Téléchargement de SUN interrompu.");
}

function onProgress(info) {
  if (!info || typeof info !== "object") return;
  if (info.status === "progress_total") {
    send("overall-progress", {
      progress: info.progress,
      loaded: info.loaded,
      total: info.total,
      files: info.files || null
    });
  } else if (info.status === "initiate" || info.status === "download") {
    send("file-status", {
      file: info.file || "Fichier SUN",
      status: info.status === "initiate" ? "preparing" : "downloading",
      name: info.name || ""
    });
  } else if (info.status === "progress") {
    send("file-progress", {
      file: info.file || "Fichier SUN",
      progress: info.progress,
      loaded: info.loaded,
      total: info.total
    });
  } else if (info.status === "done") {
    send("file-complete", { file: info.file || "Fichier SUN" });
  }
}

async function inspectModel(ModelRegistry, options) {
  try {
    const files = await ModelRegistry.get_pipeline_files(
      "text-generation",
      SUN_FOUNDATION_MODEL,
      options
    );
    let cacheResult = null;
    try {
      cacheResult = await ModelRegistry.is_pipeline_cached_files(
        "text-generation",
        SUN_FOUNDATION_MODEL,
        options
      );
    } catch {}

    const cachedMap = new Map((cacheResult?.files || []).map((item) => [
      item.file,
      Boolean(item.cached)
    ]));

    const details = await Promise.all((files || []).map(async (file) => {
      let metadata = null;
      try {
        metadata = await ModelRegistry.get_file_metadata(SUN_FOUNDATION_MODEL, file, options);
      } catch {}
      return {
        file,
        size: Number.isFinite(metadata?.size) ? metadata.size : null,
        exists: metadata ? metadata.exists !== false : null,
        cached: cachedMap.get(file) === true,
        status: cachedMap.get(file) === true ? "cached" : "waiting",
        progress: cachedMap.get(file) === true ? 100 : 0,
        loaded: cachedMap.get(file) === true ? metadata?.size || 0 : 0
      };
    }));

    const totalBytes = details.reduce((sum, item) => sum + (item.size || 0), 0);
    const cachedBytes = details.reduce((sum, item) => sum + (item.cached ? item.size || 0 : 0), 0);
    send("download-plan", {
      modelKey: SUN_MODEL_KEY,
      model: SUN_MODEL_LABEL,
      files: details,
      totalBytes,
      cachedBytes,
      cachedCount: details.filter((item) => item.cached).length,
      fileCount: details.length
    });
  } catch (error) {
    send("plan-warning", {
      message: "Le registre n’a pas pu estimer tous les fichiers. SUN va quand même essayer de se charger."
    });
  }
}

async function createRuntime(pipeline, env, ModelRegistry, LogLevel) {
  env.useBrowserCache = true;
  env.useWasmCache = true;
  env.allowRemoteModels = true;
  env.fetch = fetchWithRetry;

  try {
    const cores = Number(self.navigator?.hardwareConcurrency) || 2;
    env.backends.onnx.wasm.numThreads = self.crossOriginIsolated
      ? Math.max(1, Math.min(4, cores))
      : 1;
  } catch {}
  if (LogLevel) env.logLevel = LogLevel.WARNING;

  const webGpuAvailable = Boolean(self.navigator?.gpu);
  const preferred = getSunRuntimePlan(webGpuAvailable);
  const candidates = webGpuAvailable
    ? [preferred, { device: "wasm", dtype: "int8", approximateWeightBytes: 754 * 1024 * 1024 }]
    : [preferred];

  let lastError = null;
  for (let index = 0; index < candidates.length; index += 1) {
    const runtime = candidates[index];
    const options = {
      device: runtime.device,
      dtype: runtime.dtype,
      progress_callback: onProgress
    };
    if (index === 0) {
      send("status", {
        message: runtime.device === "webgpu"
          ? "Préparation de SUN sur l’accélération graphique du navigateur…"
          : "Pas de WebGPU détecté. Préparation de SUN sur le processeur…"
      });
    } else {
      send("status", {
        message: "L’accélération graphique n’a pas fonctionné. Nouvelle tentative de SUN sur le processeur…"
      });
    }

    await inspectModel(ModelRegistry, options);
    try {
      const instance = await pipeline("text-generation", SUN_FOUNDATION_MODEL, options);
      return { instance, runtime, options };
    } catch (error) {
      lastError = error;
      send("runtime-warning", {
        message: runtime.device === "webgpu"
          ? "Le moteur graphique n’a pas pu initialiser SUN : " + (error?.message || String(error))
          : "Le moteur local n’a pas pu initialiser SUN : " + (error?.message || String(error))
      });
      if (index === candidates.length - 1) break;
    }
  }
  throw lastError || new Error("Aucun moteur local compatible n’a pu charger SUN.");
}

async function loadModel(modelKey = SUN_MODEL_KEY) {
  if (modelKey !== SUN_MODEL_KEY) {
    throw new Error("SUN est le seul modèle IA disponible dans Académique.");
  }
  if (generator) return generator;
  if (!modelPromise) {
    modelPromise = (async () => {
      send("status", { message: "Initialisation du moteur neuronal SUN…" });
      const { pipeline, env, ModelRegistry, TextStreamer, LogLevel } = await import(TRANSFORMERS_URL);
      TextStreamerClass = TextStreamer || null;
      const loaded = await createRuntime(pipeline, env, ModelRegistry, LogLevel);
      generator = loaded.instance;
      currentRuntime = loaded.runtime;
      currentModelOptions = loaded.options;
      send("ready", {
        model: SUN_MODEL_LABEL,
        modelKey: SUN_MODEL_KEY,
        family: "SUN · Qwen3-0.6B-Instruct · ONNX",
        device: currentRuntime.device,
        dtype: currentRuntime.dtype,
        foundationModel: SUN_FOUNDATION_MODEL
      });
      return generator;
    })().catch((error) => {
      generator = null;
      currentRuntime = null;
      currentModelOptions = null;
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

function extractGeneratedText(result, prompt) {
  const generated = Array.isArray(result) && result[0] ? result[0].generated_text : null;
  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1];
    return cleanSunOutput(last?.content || "");
  }
  if (typeof generated === "string") {
    const answer = prompt && generated.startsWith(prompt) ? generated.slice(prompt.length) : generated;
    return cleanSunOutput(answer);
  }
  return "";
}

async function clearModelCache() {
  const { ModelRegistry } = await import(TRANSFORMERS_URL);
  const results = [];
  for (const dtype of ["q4f16", "int8"]) {
    try {
      const result = await ModelRegistry.clear_pipeline_cache(
        "text-generation",
        SUN_FOUNDATION_MODEL,
        { dtype }
      );
      results.push(result);
    } catch {}
  }
  send("cache-cleared", {
    model: SUN_MODEL_LABEL,
    filesDeleted: results.reduce((sum, result) => sum + (result?.filesDeleted || 0), 0),
    filesCached: 0
  });
}

async function generateReply(data) {
  const startedAt = Date.now();
  await loadModel(String(data.modelKey || SUN_MODEL_KEY));
  const messages = buildSunMessages(
    String(data.message || ""),
    Array.isArray(data.history) ? data.history : [],
    Array.isArray(data.sources) ? data.sources : []
  );

  let prompt;
  try {
    prompt = generator.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
      enable_thinking: false
    });
  } catch (error) {
    throw new Error("Le format de conversation du modèle SUN n’a pas pu être préparé : " + (error?.message || String(error)));
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Le modèle SUN n’a pas produit de prompt de conversation valide.");
  }

  const generationOptions = getSunGenerationOptions(data.performanceMode, data.responseLength);
  send("generation-start", {
    model: SUN_MODEL_LABEL,
    device: currentRuntime?.device || "local",
    profile: data.performanceMode || "balanced",
    maxTokens: generationOptions.max_new_tokens,
    startedAt
  });

  let streamer = null;
  if (typeof TextStreamerClass === "function" && generator.tokenizer) {
    streamer = new TextStreamerClass(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (piece) => {
        if (piece) send("token", { text: piece });
      }
    });
  }

  const result = await generator(prompt, {
    ...generationOptions,
    streamer
  });
  const finalText = extractGeneratedText(result, prompt);
  send("reply", {
    text: finalText,
    streamed: Boolean(streamer),
    durationMs: Date.now() - startedAt,
    performanceMode: data.performanceMode || "balanced",
    device: currentRuntime?.device || "local"
  });
}

async function handleMessage(data) {
  if (data.type === "load") {
    try {
      await loadModel(String(data.modelKey || SUN_MODEL_KEY));
    } catch (error) {
      send("load-error", {
        message: (error?.message || String(error)) +
          " Vérifie l’espace libre, la connexion et la compatibilité WebGPU ou WASM du téléphone."
      });
    }
    return;
  }

  if (data.type === "generate") {
    try {
      await generateReply(data);
    } catch (error) {
      send("generation-error", { message: error?.message || String(error) });
    }
    return;
  }

  if (data.type === "clear-cache") {
    try {
      await clearModelCache();
    } catch (error) {
      send("cache-clear-error", { message: error?.message || String(error) });
    }
  }
}

self.addEventListener("message", (event) => {
  void handleMessage(event.data || {});
});
