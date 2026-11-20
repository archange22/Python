const MODEL_CONFIG = {
  "lamini-77": {
    id: "Xenova/LaMini-Flan-T5-77M",
    task: "text2text-generation",
    label: "LaMini-Flan-T5-77M"
  },
  "lamini-248": {
    id: "Xenova/LaMini-Flan-T5-248M",
    task: "text2text-generation",
    label: "LaMini-Flan-T5-248M"
  },
  "smollm2-135": {
    id: "HuggingFaceTB/SmolLM2-135M-Instruct",
    task: "text-generation",
    label: "SmolLM2-135M-Instruct"
  }
};

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2";
const FETCH_RETRIES = 3;
const MODEL_LOAD_RETRIES = 2;

let generator = null;
let currentModelKey = null;
let loadingPromise = null;

function send(type, details = {}) {
  self.postMessage({ type, ...details });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return status === 408 || status === 425 || status === 429 ||
    status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchWithRetry(input, init = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      if (init.signal?.aborted) throw new DOMException("Téléchargement annulé", "AbortError");
      const response = await fetch(input, init);
      if (!isRetryableStatus(response.status) || attempt === FETCH_RETRIES) {
        return response;
      }
      try { await response.body?.cancel(); } catch (error) {}
      send("status", {
        message: "Le serveur distant répond temporairement (" + response.status + "). Nouvelle tentative…"
      });
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError" || attempt === FETCH_RETRIES) throw error;
      send("status", { message: "Coupure réseau détectée. Nouvelle tentative automatique…" });
    }
    await sleep(700 * Math.pow(2, attempt - 1));
  }
  throw lastError || new Error("Échec réseau après plusieurs tentatives.");
}

function onProgress(info) {
  if (!info || typeof info !== "object") return;
  if (info.status === "progress_total") {
    send("progress", {
      progress: info.progress,
      loaded: info.loaded,
      total: info.total,
      file: "Ensemble des fichiers du modèle"
    });
    return;
  }
  if (info.status === "progress") {
    send("progress", {
      file: info.file || "Fichier du modèle",
      fileProgress: info.progress,
      loaded: info.loaded,
      total: info.total
    });
    return;
  }
  if (info.status === "initiate" || info.status === "download") {
    send("status", {
      message: (info.status === "initiate" ? "Préparation : " : "Téléchargement : ") +
        (info.file || "fichiers du modèle")
    });
  }
}

async function loadModel(modelKey) {
  if (generator && currentModelKey === modelKey) return generator;
  if (loadingPromise) return loadingPromise;

  const config = MODEL_CONFIG[modelKey];
  if (!config) throw new Error("Modèle inconnu. Recharge l’application et sélectionne un modèle disponible.");

  loadingPromise = (async () => {
    send("status", { message: "Chargement de la bibliothèque d’intelligence artificielle…" });
    const { pipeline, env, ModelRegistry } = await import(TRANSFORMERS_URL);
    env.useBrowserCache = true;
    env.useWasmCache = true;
    env.allowRemoteModels = true;
    env.fetch = fetchWithRetry;

    // Best-effort metadata lookup: it tells the interface the real aggregate
    // model size and whether the browser already has every required artifact.
    try {
      const files = await ModelRegistry.get_pipeline_files(config.task, config.id, {});
      const metadata = await Promise.all(files.map((file) =>
        ModelRegistry.get_file_metadata(config.id, file)
      ));
      const totalBytes = metadata.reduce((sum, item) =>
        sum + (Number.isFinite(item?.size) ? item.size : 0), 0
      );
      const cached = await ModelRegistry.is_pipeline_cached(config.task, config.id, {});
      send("model-info", {
        model: config.label,
        totalBytes,
        cached: Boolean(cached),
        fileCount: files.length
      });
    } catch (metadataError) {
      send("status", {
        message: "Taille exacte indisponible ; le chargement du modèle continue."
      });
    }

    let lastError = null;
    for (let attempt = 1; attempt <= MODEL_LOAD_RETRIES; attempt += 1) {
      try {
        send("status", {
          message: attempt === 1
            ? "Préparation du modèle " + config.label + "…"
            : "Nouvel essai du chargement du modèle…"
        });
        generator = await pipeline(config.task, config.id, {
          progress_callback: onProgress
        });
        currentModelKey = modelKey;
        send("ready", { model: config.label });
        return generator;
      } catch (error) {
        generator = null;
        currentModelKey = null;
        lastError = error;
        if (attempt < MODEL_LOAD_RETRIES) {
          send("retry", {
            attempt: attempt + 1,
            maxAttempts: MODEL_LOAD_RETRIES,
            message: "Une tentative a échoué. Le moteur va réessayer ; les fichiers déjà terminés et mis en cache pourront être réutilisés."
          });
          await sleep(1000 * attempt);
        }
      }
    }
    throw lastError || new Error("Le modèle n’a pas pu être chargé.");
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

function buildT5Prompt(message, history) {
  const previous = (Array.isArray(history) ? history : []).slice(-6).map((item) => {
    return (item.role === "user" ? "Élève : " : "Assistant : ") + String(item.content || "").slice(0, 500);
  }).join("\n");

  return [
    "Tu es un assistant pédagogique francophone pour une personne qui apprend Python, l'intelligence artificielle et le développement.",
    "Réponds en français simple, avec des explications exactes, courtes et structurées. Décompose les étapes si c'est utile.",
    "N'invente pas de faits. Signale clairement tes incertitudes.",
    "Historique récent :",
    previous || "Aucun échange précédent.",
    "Nouvelle question :",
    String(message || "").slice(0, 1200),
    "Réponse en français :"
  ].join("\n\n");
}

async function buildSmolPrompt(message, history, model) {
  const messages = [
    {
      role: "system",
      content: "Tu es un assistant pédagogique. Réponds toujours en français simple. Aide à apprendre Python, l'intelligence artificielle, les mathématiques et le développement. Explique clairement, n'invente pas et reconnais tes incertitudes."
    },
    ...(Array.isArray(history) ? history.slice(-6) : []).map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content || "").slice(0, 500)
    })),
    { role: "user", content: String(message || "").slice(0, 1200) }
  ];

  try {
    const tokenizer = model.tokenizer;
    if (tokenizer && typeof tokenizer.apply_chat_template === "function") {
      return await tokenizer.apply_chat_template(messages, {
        tokenize: false,
        add_generation_prompt: true
      });
    }
  } catch (error) {}

  return messages.map((item) =>
    (item.role === "system" ? "Instruction" : item.role === "user" ? "Élève" : "Assistant") +
    ": " + item.content
  ).join("\n") + "\nAssistant :";
}

self.addEventListener("message", async (event) => {
  const data = event.data || {};

  if (data.type === "load") {
    try {
      await loadModel(String(data.modelKey || "lamini-77"));
    } catch (error) {
      send("load-error", {
        message: (error && error.message ? error.message : String(error)) +
          " Le chargement a été essayé plusieurs fois. Vérifie la connexion, l’espace libre et réessaie."
      });
    }
    return;
  }

  if (data.type === "generate") {
    try {
      const modelKey = String(data.modelKey || currentModelKey || "lamini-77");
      const model = await loadModel(modelKey);
      const config = MODEL_CONFIG[modelKey];
      const prompt = config.task === "text-generation"
        ? await buildSmolPrompt(String(data.message || ""), data.history, model)
        : buildT5Prompt(String(data.message || ""), data.history);
      const result = await model(prompt, {
        max_new_tokens: config.task === "text-generation" ? 144 : 120,
        do_sample: false,
        repetition_penalty: 1.1,
        return_full_text: false
      });
      let reply = Array.isArray(result) && result[0]
        ? String(result[0].generated_text || result[0].text || "")
        : "";
      if (reply.startsWith(prompt)) reply = reply.slice(prompt.length);
      send("reply", { text: reply.trim() });
    } catch (error) {
      send("error", { message: error && error.message ? error.message : String(error) });
    }
  }
});