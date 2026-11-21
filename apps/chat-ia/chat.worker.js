import { generateSunNeuralReply, loadSunNeural } from "./sun-neural.js";

const MODEL_KEY = "sun-neural";
const MODEL_LABEL = "SUN Neural 0.1";
const PERFORMANCE_LABELS = {
  fast: "Rapide",
  balanced: "Équilibré",
  quality: "Approfondi"
};

let modelPromise = null;
let modelReady = false;

function send(type, details = {}) {
  self.postMessage({ type, ...details });
}

async function loadModel(modelKey) {
  if (modelKey !== MODEL_KEY) {
    throw new Error("SUN Neural est le seul modèle disponible dans Académique.");
  }
  if (modelReady) return true;
  if (!modelPromise) {
    modelPromise = (async () => {
      send("status", { message: "Chargement des poids du réseau neuronal SUN…" });
      await loadSunNeural();
      modelReady = true;
      send("ready", {
        model: MODEL_LABEL,
        modelKey: MODEL_KEY,
        family: "SUN Neural · MLP local"
      });
      return true;
    })().catch((error) => {
      modelPromise = null;
      modelReady = false;
      throw error;
    });
  }
  return modelPromise;
}

async function generateReply(data) {
  const startedAt = Date.now();
  const modelKey = String(data.modelKey || MODEL_KEY);
  if (modelKey !== MODEL_KEY) {
    throw new Error("SUN Neural est le seul modèle disponible.");
  }
  await loadModel(modelKey);

  const performanceMode = Object.hasOwn(PERFORMANCE_LABELS, data.performanceMode)
    ? data.performanceMode
    : "fast";
  send("generation-start", {
    model: MODEL_LABEL,
    profile: PERFORMANCE_LABELS[performanceMode],
    startedAt
  });

  const result = await generateSunNeuralReply(
    String(data.message || ""),
    Array.isArray(data.sources) ? data.sources : []
  );
  send("reply", {
    text: result.text,
    streamed: false,
    durationMs: Date.now() - startedAt,
    performanceMode,
    intent: result.intent,
    confidence: result.confidence,
    accepted: result.accepted
  });
}

async function handleMessage(data) {
  if (data.type === "load") {
    try {
      await loadModel(String(data.modelKey || MODEL_KEY));
    } catch (error) {
      send("load-error", {
        message: (error?.message || String(error)) +
          " Vérifie que les fichiers du modèle SUN sont présents dans l'application."
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
    return;
  }

  if (data.type === "clear-cache") {
    send("cache-cleared", {
      model: MODEL_LABEL,
      filesDeleted: 0,
      filesCached: 4,
      message: "SUN est intégré à l'application. Aucun modèle tiers n'est à nettoyer."
    });
  }
}

self.addEventListener("message", (event) => {
  void handleMessage(event.data || {});
});
