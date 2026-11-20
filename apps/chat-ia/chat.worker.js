const MODEL_ID = "Xenova/LaMini-Flan-T5-77M";
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

let generator = null;
let loadingPromise = null;

function send(type, details = {}) {
  self.postMessage({ type, ...details });
}

async function loadModel() {
  if (generator) return generator;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    send("status", { message: "Chargement de la bibliothèque IA…" });
    const { pipeline, env } = await import(TRANSFORMERS_URL);
    env.useBrowserCache = true;
    env.allowRemoteModels = true;

    send("status", { message: "Téléchargement du modèle local…" });
    generator = await pipeline("text2text-generation", MODEL_ID, {
      progress_callback: (info) => {
        const progress = Number.isFinite(info.progress) ? info.progress : 0;
        send("progress", { progress, file: info.file || info.name || "fichiers du modèle" });
      }
    });
    send("ready");
    return generator;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
}

function buildPrompt(message, history) {
  const previous = (Array.isArray(history) ? history : []).slice(-6).map((item) => {
    return (item.role === "user" ? "Élève : " : "Assistant : ") + String(item.content || "").slice(0, 500);
  }).join("\n");

  return [
    "Tu es un assistant pédagogique francophone pour un adolescent qui apprend Python, l'intelligence artificielle et le développement.",
    "Réponds en français simple, de manière claire, courte et structurée. Explique étape par étape si c'est utile.",
    "Ne prétends pas avoir vérifié une information si tu ne l'as pas fait. Si tu ne sais pas, dis-le.",
    "Historique récent :",
    previous || "Aucun échange précédent.",
    "Nouvelle question de l'élève :",
    message,
    "Réponse en français :"
  ].join("\n\n");
}

self.addEventListener("message", async (event) => {
  const data = event.data || {};
  if (data.type === "load") {
    try {
      await loadModel();
    } catch (error) {
      send("load-error", {
        message: (error && error.message ? error.message : String(error)) +
          " Connecte-toi une première fois pour télécharger le moteur et ses fichiers, puis réessaie."
      });
    }
    return;
  }

  if (data.type === "generate") {
    try {
      const model = await loadModel();
      const prompt = buildPrompt(String(data.message || ""), data.history);
      const result = await model(prompt, {
        max_new_tokens: 120,
        do_sample: false,
        repetition_penalty: 1.12
      });
      const text = Array.isArray(result) && result[0] ? String(result[0].generated_text || "") : "";
      send("reply", { text: text.trim() });
    } catch (error) {
      send("error", { message: error && error.message ? error.message : String(error) });
    }
  }
});
