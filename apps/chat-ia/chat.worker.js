const MODEL_CONFIG = {
  "lamini-77": {
    id: "Xenova/LaMini-Flan-T5-77M",
    task: "text2text-generation",
    label: "LaMini-Flan-T5-77M",
    family: "t5"
  },
  "lamini-248": {
    id: "Xenova/LaMini-Flan-T5-248M",
    task: "text2text-generation",
    label: "LaMini-Flan-T5-248M",
    family: "t5"
  },
  "smollm2-135": {
    id: "onnx-community/SmolLM2-135M-Instruct-ONNX-GQA",
    task: "text-generation",
    label: "SmolLM2-135M-Instruct",
    family: "causal"
  }
};

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2";
const FETCH_RETRIES = 3;
const MODEL_LOAD_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

let generator = null;
let TextStreamerClass = null;
let currentModelKey = null;
let loadingPromise = null;

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
  } catch (error) {
    return "fichier distant";
  }
}

async function fetchWithRetry(input, init = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      if (init.signal?.aborted) {
        throw new DOMException("Téléchargement annulé", "AbortError");
      }

      const response = await fetch(input, init);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === FETCH_RETRIES) {
        return response;
      }

      try { await response.body?.cancel(); } catch (error) {}
      send("network-retry", {
        attempt: attempt + 1,
        maxAttempts: FETCH_RETRIES,
        file: shortRequestName(input),
        reason: "HTTP " + response.status
      });
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError" || attempt === FETCH_RETRIES) {
        throw error;
      }
      send("network-retry", {
        attempt: attempt + 1,
        maxAttempts: FETCH_RETRIES,
        file: shortRequestName(input),
        reason: error?.message || "Connexion interrompue"
      });
    }

    await sleep(600 * Math.pow(2, attempt - 1));
  }

  throw lastError || new Error("Échec réseau après plusieurs tentatives.");
}

function safeMetadataSize(metadata) {
  return Number.isFinite(metadata?.size) && metadata.size > 0 ? metadata.size : null;
}

async function inspectModel(config, ModelRegistry) {
  const options = config.options || {};
  const files = await ModelRegistry.get_pipeline_files(config.task, config.id, options);

  let cacheResult = null;
  try {
    cacheResult = await ModelRegistry.is_pipeline_cached_files(config.task, config.id, options);
  } catch (error) {
    // File metadata remains useful even if the cache index is temporarily unavailable.
  }

  const cachedMap = new Map(
    (cacheResult?.files || []).map((item) => [item.file, Boolean(item.cached)])
  );

  const fileDetails = await Promise.all(files.map(async (file) => {
    let metadata = null;
    try {
      metadata = await ModelRegistry.get_file_metadata(config.id, file, options);
    } catch (error) {}

    return {
      file,
      size: safeMetadataSize(metadata),
      exists: metadata ? metadata.exists !== false : null,
      cached: cachedMap.get(file) === true,
      status: cachedMap.get(file) === true ? "cached" : "waiting",
      progress: cachedMap.get(file) === true ? 100 : 0,
      loaded: cachedMap.get(file) === true ? safeMetadataSize(metadata) : 0
    };
  }));

  const totalBytes = fileDetails.reduce((sum, item) => sum + (item.size || 0), 0);
  const cachedBytes = fileDetails.reduce((sum, item) =>
    sum + (item.cached ? (item.size || 0) : 0), 0
  );

  send("download-plan", {
    modelKey: Object.keys(MODEL_CONFIG).find((key) => MODEL_CONFIG[key] === config),
    model: config.label,
    files: fileDetails,
    totalBytes,
    cachedBytes,
    cachedCount: fileDetails.filter((item) => item.cached).length,
    fileCount: fileDetails.length
  });
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
    return;
  }

  if (info.status === "initiate" || info.status === "download") {
    send("file-status", {
      file: info.file || "Fichier du modèle",
      status: info.status === "initiate" ? "preparing" : "downloading",
      name: info.name || ""
    });
    return;
  }

  if (info.status === "progress") {
    send("file-progress", {
      file: info.file || "Fichier du modèle",
      progress: info.progress,
      loaded: info.loaded,
      total: info.total
    });
    return;
  }

  if (info.status === "done") {
    send("file-complete", {
      file: info.file || "Fichier du modèle"
    });
  }
}

async function loadModel(modelKey) {
  if (generator && currentModelKey === modelKey) return generator;
  if (loadingPromise) return loadingPromise;

  const config = MODEL_CONFIG[modelKey];
  if (!config) {
    throw new Error("Modèle inconnu. Recharge l’application et sélectionne un modèle disponible.");
  }

  loadingPromise = (async () => {
    send("status", { message: "Initialisation de la bibliothèque IA…" });

    const { pipeline, env, ModelRegistry, TextStreamer, LogLevel } = await import(TRANSFORMERS_URL);
    TextStreamerClass = TextStreamer || null;

    env.useBrowserCache = true;
    env.useWasmCache = true;
    env.allowRemoteModels = true;
    env.fetch = fetchWithRetry;
    if (LogLevel) env.logLevel = LogLevel.WARNING;

    try {
      await inspectModel(config, ModelRegistry);
    } catch (error) {
      send("plan-warning", {
        message: "Le détail des fichiers n’a pas pu être obtenu avant le chargement. Le moteur va quand même essayer."
      });
    }

    let lastError = null;
    for (let attempt = 1; attempt <= MODEL_LOAD_RETRIES; attempt += 1) {
      try {
        send("status", {
          message: attempt === 1
            ? "Préparation du modèle " + config.label + "…"
            : "Nouvelle tentative de préparation du modèle…"
        });

        generator = await pipeline(config.task, config.id, {
          ...(config.options || {}),
          progress_callback: onProgress
        });

        currentModelKey = modelKey;
        send("ready", { model: config.label, modelKey, family: config.family });
        return { generator, TextStreamer };
      } catch (error) {
        generator = null;
        currentModelKey = null;
        lastError = error;

        if (attempt < MODEL_LOAD_RETRIES) {
          send("load-retry", {
            attempt: attempt + 1,
            maxAttempts: MODEL_LOAD_RETRIES,
            reason: error?.message || String(error)
          });
          await sleep(900 * attempt);
        }
      }
    }

    throw lastError || new Error("Le modèle n’a pas pu être chargé.");
  })();

  try {
    const loaded = await loadingPromise;
    return loaded.generator;
  } finally {
    loadingPromise = null;
  }
}

function buildT5Prompt(message, history, responseLength) {
  const previous = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map((item) => {
      const role = item.role === "assistant" ? "Assistant" : "Élève";
      return role + " : " + String(item.content || "").slice(0, 360);
    })
    .join("\n");

  const lengthInstruction = responseLength === "short"
    ? "Réponds en quelques phrases."
    : responseLength === "detailed"
      ? "Donne une explication progressive, avec les étapes et un exemple si utile, sans répéter."
      : "Réponds de façon claire et structurée, avec un exemple si utile.";

  return [
    "Tu es l’assistant pédagogique d’Académique.",
    "Tu aides un élève francophone à apprendre Python, la programmation, les mathématiques et les notions d’intelligence artificielle.",
    "Écris en français simple. Sois exact, patient et méthodique.",
    lengthInstruction,
    "Pour une question de code, explique l’idée puis donne un petit exemple exécutable.",
    "Pour un calcul, détaille les étapes et vérifie le résultat.",
    "N’invente pas de faits, de résultats de test ou de sources. Dis quand tu n’es pas certain.",
    "Historique de la discussion :",
    previous || "Aucun historique.",
    "Question actuelle :",
    String(message || "").slice(0, 1600),
    "Réponse :"
  ].join("\n\n");
}

function buildSmolMessages(message, history) {
  const messages = [
    {
      role: "system",
      content: "Tu es NOVA, l’assistant pédagogique local d’Académique. Tu aides en français à apprendre Python, la programmation, les mathématiques et les bases de l’intelligence artificielle. Réponds dans la langue de l’élève, avec des phrases claires et des étapes simples. Pour le code, donne un exemple court et explique comment l’exécuter. Pour les calculs, montre les étapes. Ne prétends jamais avoir exécuté du code ou consulté Internet. Si tu ne sais pas, reconnais-le."
    }
  ];

  for (const item of (Array.isArray(history) ? history.slice(-6) : [])) {
    messages.push({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content || "").slice(0, 420)
    });
  }

  messages.push({
    role: "user",
    content: String(message || "").slice(0, 1600)
  });

  return messages;
}

function extractTextGenerationReply(result) {
  const generated = Array.isArray(result) && result[0] ? result[0].generated_text : null;
  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1];
    return typeof last?.content === "string" ? last.content : "";
  }
  return typeof generated === "string" ? generated : "";
}

async function generateReply(data) {
  const modelKey = String(data.modelKey || currentModelKey || "lamini-77");
  const config = MODEL_CONFIG[modelKey];

  if (!config) throw new Error("Modèle de réponse inconnu.");

  const model = await loadModel(modelKey);
  const TextStreamer = TextStreamerClass;

  const responseLength = ["short", "normal", "detailed"].includes(data.responseLength)
    ? data.responseLength
    : "normal";
  const maxTokens = responseLength === "short" ? 72 : responseLength === "detailed" ? 180 : 120;

  send("generation-start", { model: config.label });

  if (config.family === "causal" && typeof TextStreamer === "function" && model.tokenizer) {
    const messages = buildSmolMessages(String(data.message || ""), data.history);
    const streamer = new TextStreamer(model.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (piece) => {
        if (piece) send("token", { text: piece });
      }
    });

    const result = await model(messages, {
      max_new_tokens: maxTokens,
      do_sample: false,
      repetition_penalty: 1.12,
      streamer
    });

    const finalText = extractTextGenerationReply(result).trim();
    send("reply", { text: finalText, streamed: true });
    return;
  }

  const prompt = buildT5Prompt(
    String(data.message || ""),
    data.history,
    responseLength
  );
  const result = await model(prompt, {
    max_new_tokens: maxTokens,
    do_sample: false,
    repetition_penalty: 1.12
  });

  const finalText = Array.isArray(result) && result[0]
    ? String(result[0].generated_text || "")
    : "";
  send("reply", { text: finalText.trim(), streamed: false });
}

async function clearModelCache(modelKey) {
  const config = MODEL_CONFIG[modelKey];
  if (!config) throw new Error("Modèle inconnu.");

  const { ModelRegistry } = await import(TRANSFORMERS_URL);
  const result = await ModelRegistry.clear_pipeline_cache(
    config.task,
    config.id,
    config.options || {}
  );
  send("cache-cleared", {
    model: config.label,
    filesDeleted: result?.filesDeleted || 0,
    filesCached: result?.filesCached || 0
  });
}

self.addEventListener("message", async (event) => {
  const data = event.data || {};

  if (data.type === "clear-cache") {
    try {
      await clearModelCache(String(data.modelKey || "lamini-77"));
    } catch (error) {
      send("cache-clear-error", {
        message: error?.message || String(error)
      });
    }
    return;
  }

  if (data.type === "load") {
    try {
      await loadModel(String(data.modelKey || "lamini-77"));
    } catch (error) {
      send("load-error", {
        message: (error?.message || String(error)) +
          " Vérifie la connexion, le stockage disponible et la compatibilité de l’appareil, puis réessaie."
      });
    }
    return;
  }

  if (data.type === "generate") {
    try {
      await generateReply(data);
    } catch (error) {
      send("generation-error", {
        message: error?.message || String(error)
      });
    }
  }
});