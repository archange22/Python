const STORAGE_KEY = "academique-chat-ia-v1";
const SELECTED_MODEL_KEY = "academique-chat-ia-selected-model-v1";
const STATS_KEY = "academique-chat-ia-download-stats-v1";

const MODELS = {
  "lamini-77": {
    name: "LaMini-Flan-T5-77M",
    description: "Le modèle le plus léger. Adapté aux essais et aux questions simples ; ses réponses restent limitées.",
    estimateMB: 160
  },
  "lamini-248": {
    name: "LaMini-Flan-T5-248M",
    description: "Modèle plus volumineux de la même famille, avec davantage de capacité. Prévois plusieurs centaines de Mo libres.",
    estimateMB: 430
  },
  "smollm2-135": {
    name: "SmolLM2-135M-Instruct",
    description: "Petit modèle conversationnel quantifié d’environ 137 Mo pour son poids principal. Il est surtout documenté pour l’anglais : le français peut être moins fiable.",
    estimateMB: 155
  }
};

const $ = (selector) => document.querySelector(selector);
let worker = null;
let modelReady = false;
let loading = false;
let busy = false;
let history = [];
let selectedModel = "lamini-77";
let stats = {};

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveHistory() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-40))); } catch (error) {}
}

function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (error) {}
  renderStats();
}

function renderStats() {
  const current = stats[selectedModel] || { attempts: 0, successes: 0, failures: 0 };
  const completed = Math.max(0, current.attempts - (current.cancellations || 0));
  const failureRate = completed
    ? Math.round((current.failures / completed) * 100)
    : 0;
  $("#downloadStats").textContent = current.attempts
    ? "Sur cet appareil : " + current.successes + " réussi(s), " + current.failures +
      " échec(s), " + (current.cancellations || 0) + " annulation(s) · " + failureRate +
      " % d’échec parmi les chargements terminés"
    : "Aucun essai enregistré sur cet appareil. Ces statistiques ne sont pas envoyées.";
}

function recordAttempt() {
  const current = stats[selectedModel] || { attempts: 0, successes: 0, failures: 0 };
  current.attempts += 1;
  stats[selectedModel] = current;
  saveStats();
}

function recordSuccess() {
  const current = stats[selectedModel] || { attempts: 0, successes: 0, failures: 0 };
  current.successes += 1;
  stats[selectedModel] = current;
  saveStats();
}

function recordFailure() {
  const current = stats[selectedModel] || { attempts: 0, successes: 0, failures: 0, cancellations: 0 };
  current.failures += 1;
  stats[selectedModel] = current;
  saveStats();
}

function recordCancellation() {
  const current = stats[selectedModel] || { attempts: 0, successes: 0, failures: 0, cancellations: 0 };
  current.cancellations = (current.cancellations || 0) + 1;
  stats[selectedModel] = current;
  saveStats();
}

function setStatus(message, kind = "loading") {
  $("#modelStatus").textContent = message;
  $("#statusLabel").textContent = message;
  $("#statusDot").className = "online-indicator" +
    (kind === "ready" ? " ready" : kind === "error" ? " error" : "");
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "";
  const units = ["o", "Ko", "Mo", "Go"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return size.toFixed(size >= 100 || index === 0 ? 0 : 1) + " " + units[index];
}

function setProgress(value, loaded, total) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  $("#modelProgress").style.width = percent + "%";
  $(".progress-track").setAttribute("aria-valuenow", String(Math.round(percent)));
  $("#downloadPercent").textContent = Math.round(percent) + " %";
  if (Number.isFinite(loaded) && Number.isFinite(total) && total > 0) {
    $("#downloadDetails").textContent = formatBytes(loaded) + " / " + formatBytes(total);
  }
}

function setModelDescription() {
  const model = MODELS[selectedModel];
  $("#modelDescription").textContent = model.description;
  $("#modelHint").textContent = "Taille indicative à prévoir : environ " +
    model.estimateMB + " Mo au minimum. Le volume réel peut varier selon les fichiers requis et le cache.";
  $("#loadModelButton").textContent = "Télécharger ce modèle";
  renderStats();
}

function resetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  loading = false;
  modelReady = false;
  busy = false;
  $("#cancelDownloadButton").hidden = true;
  $("#modelSelect").disabled = false;
  $("#loadModelButton").disabled = false;
  $("#messageInput").disabled = true;
  $("#sendButton").disabled = true;
  removeTyping();
}

function explainError(message) {
  const raw = String(message || "Erreur inconnue");
  const lower = raw.toLowerCase();
  if (!navigator.onLine) {
    return "Connexion Internet absente. Reconnecte-toi pour télécharger les fichiers manquants, puis réessaie. " + raw;
  }
  if (/quota|storage|disk|space|stockage/.test(lower)) {
    return "Le navigateur manque probablement d’espace de stockage. Libère de l’espace sur l’appareil, puis réessaie. " + raw;
  }
  if (/429|too many requests/.test(lower)) {
    return "Le serveur limite temporairement les téléchargements. Attends un peu avant de réessayer. " + raw;
  }
  if (/403|404|not found|forbidden/.test(lower)) {
    return "Un fichier du modèle est inaccessible. Le lien du modèle ou le serveur distant peut être en cause. " + raw;
  }
  return raw + " Vérifie la connexion et l’espace libre, puis relance le téléchargement.";
}

function addMessage(role, text, save = true) {
  const article = document.createElement("article");
  article.className = "message " + (role === "user" ? "user" : "assistant");
  const avatar = document.createElement("span");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "•" : "✦";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  const title = document.createElement("strong");
  title.textContent = role === "user" ? "Toi" : MODELS[selectedModel].name;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.append(title, paragraph);
  article.append(avatar, bubble);
  $("#messages").appendChild(article);
  $("#messages").scrollTop = $("#messages").scrollHeight;
  if (save) {
    history.push({ role, content: text });
    history = history.slice(-40);
    saveHistory();
  }
  return article;
}

function renderHistory() {
  $("#messages").textContent = "";
  if (!history.length) {
    addMessage("assistant", "Bonjour. Je peux t’aider à apprendre les bases de Python, comprendre des notions d’IA ou structurer un projet. Charge un modèle local pour commencer.", false);
    return;
  }
  for (const item of history) addMessage(item.role, item.content, false);
}

function addTyping() {
  const article = addMessage("assistant", "Je prépare une réponse…", false);
  article.classList.add("typing");
  article.id = "typingMessage";
}

function removeTyping() {
  $("#typingMessage")?.remove();
}

async function prepareStorage() {
  if (!navigator.storage) return "Le navigateur ne fournit pas d’estimation du stockage.";
  let persistence = "La conservation du cache dépend des règles du navigateur.";
  try {
    if (typeof navigator.storage.persist === "function") {
      const persisted = await navigator.storage.persist();
      persistence = persisted
        ? "Le navigateur a accepté de protéger le cache contre une suppression automatique."
        : "Le navigateur n’a pas garanti la conservation du cache.";
    }
  } catch (error) {}
  try {
    const estimate = await navigator.storage.estimate();
    if (Number.isFinite(estimate.quota) && Number.isFinite(estimate.usage)) {
      const free = Math.max(0, estimate.quota - estimate.usage);
      const required = MODELS[selectedModel].estimateMB * 1024 * 1024;
      if (free < required) {
        return persistence + " Espace estimé disponible : " + formatBytes(free) +
          ", inférieur à la taille indicative du modèle. Le téléchargement peut échouer.";
      }
      return persistence + " Espace estimé disponible : " + formatBytes(free) + ".";
    }
  } catch (error) {}
  return persistence;
}

async function ensureWorker() {
  if (loading || modelReady) return;
  loading = true;
  recordAttempt();
  $("#loadModelButton").disabled = true;
  $("#modelSelect").disabled = true;
  $("#cancelDownloadButton").hidden = false;
  $("#modelHint").textContent = "Préparation du cache et vérification du stockage…";
  $("#downloadDetails").textContent = "Connexion au moteur de téléchargement…";
  setProgress(0);

  try {
    const storageMessage = await prepareStorage();
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("./sw.js");
      await navigator.serviceWorker.ready;
    }

    worker = new Worker("./chat.worker.js", { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", (event) => {
      if (!loading) return;
      recordFailure();
      resetWorker();
      setStatus("Le moteur IA a rencontré une erreur.", "error");
      $("#modelHint").textContent = explainError(event.message || "Erreur du moteur Web Worker.");
      $("#downloadDetails").textContent = "Échec du chargement.";
      $("#loadModelButton").textContent = "Réessayer";
    });
    $("#modelHint").textContent = storageMessage;
    worker.postMessage({ type: "load", modelKey: selectedModel });
  } catch (error) {
    recordFailure();
    resetWorker();
    setStatus("Impossible de préparer le moteur IA.", "error");
    $("#modelHint").textContent = explainError(error.message || String(error));
    $("#downloadDetails").textContent = "Échec de la préparation.";
    $("#loadModelButton").textContent = "Réessayer";
  }
}

async function handleWorkerMessage(event) {
  const data = event.data || {};
  if (data.type === "status") {
    setStatus(data.message || "Chargement du modèle…");
  } else if (data.type === "retry") {
    setStatus("Nouvelle tentative de téléchargement…");
    $("#modelHint").textContent = data.message || "Le réseau a répondu par une erreur temporaire. Les fichiers déjà en cache seront réutilisés.";
    $("#downloadDetails").textContent = "Tentative " + data.attempt + " / " + data.maxAttempts;
  } else if (data.type === "model-info") {
    if (Number.isFinite(data.totalBytes) && data.totalBytes > 0) {
      const realSize = formatBytes(data.totalBytes);
      $("#modelHint").textContent = data.cached
        ? "Modèle déjà présent dans le cache : " + realSize + " · " + data.fileCount + " fichiers vérifiés."
        : "Taille réelle estimée par le registre du modèle : " + realSize + " · " +
          data.fileCount + " fichiers à charger. Garde une marge d’espace libre.";
      try {
        const estimate = await navigator.storage?.estimate?.();
        if (estimate && Number.isFinite(estimate.quota) && Number.isFinite(estimate.usage)) {
          const free = Math.max(0, estimate.quota - estimate.usage);
          if (free < data.totalBytes) {
            $("#modelHint").textContent += " Attention : l’espace estimé disponible (" +
              formatBytes(free) + ") est inférieur à cette taille.";
          }
        }
      } catch (error) {}
    }
  } else if (data.type === "progress") {
    if (Number.isFinite(data.progress)) setProgress(data.progress, data.loaded, data.total);
    if (data.file) {
      const fileProgress = Number.isFinite(data.fileProgress) ? " · " + Math.round(data.fileProgress) + " %" : "";
      $("#downloadDetails").textContent = "Fichier : " + data.file + fileProgress;
    }
  } else if (data.type === "ready") {
    loading = false;
    modelReady = true;
    recordSuccess();
    setProgress(100);
    setStatus("Modèle local prêt", "ready");
    $("#modelStatus").textContent = MODELS[selectedModel].name + " est prêt";
    $("#modelHint").textContent = "Le modèle a été chargé. Le navigateur peut le réutiliser depuis son cache lors des prochaines ouvertures.";
    $("#downloadDetails").textContent = "Téléchargement et initialisation terminés.";
    $("#loadModelButton").textContent = "Modèle prêt";
    $("#loadModelButton").disabled = true;
    $("#cancelDownloadButton").hidden = true;
    $("#modelSelect").disabled = false;
    $("#messageInput").disabled = false;
    $("#sendButton").disabled = false;
    $("#messageInput").focus();
  } else if (data.type === "reply") {
    removeTyping();
    busy = false;
    $("#sendButton").disabled = !modelReady;
    $("#messageInput").disabled = !modelReady;
    addMessage("assistant", data.text || "Je n’ai pas réussi à formuler une réponse. Reformule ta question.");
  } else if (data.type === "error") {
    removeTyping();
    busy = false;
    $("#sendButton").disabled = !modelReady;
    $("#messageInput").disabled = !modelReady;
    addMessage("assistant", data.message || "Une erreur est survenue pendant la génération.");
  } else if (data.type === "load-error") {
    recordFailure();
    resetWorker();
    setStatus("Modèle non chargé", "error");
    $("#modelStatus").textContent = "Le modèle local n’a pas pu démarrer";
    $("#modelHint").textContent = explainError(data.message || "Erreur de téléchargement non détaillée.");
    $("#downloadDetails").textContent = "Échec du chargement. Les fichiers déjà terminés peuvent rester en cache.";
    $("#loadModelButton").textContent = "Réessayer";
  }
}

function cancelDownload() {
  if (!loading) return;
  recordCancellation();
  resetWorker();
  setStatus("Téléchargement annulé", "error");
  $("#modelHint").textContent = "Le chargement a été arrêté. Les fichiers déjà terminés peuvent rester en cache ; relance pour continuer.";
  $("#downloadDetails").textContent = "Annulé par l’utilisateur.";
  $("#loadModelButton").textContent = "Reprendre / réessayer";
}

function changeModel() {
  const next = $("#modelSelect").value;
  if (!MODELS[next] || next === selectedModel) return;
  if (loading) recordCancellation();
  resetWorker();
  selectedModel = next;
  try { localStorage.setItem(SELECTED_MODEL_KEY, selectedModel); } catch (error) {}
  setProgress(0);
  setStatus("Modèle non chargé");
  $("#modelStatus").textContent = "Modèle non chargé";
  $("#downloadDetails").textContent = "Aucun téléchargement en cours.";
  setModelDescription();
  renderHistory();
}

async function clearModelCache() {
  const confirmed = window.confirm("Supprimer les modèles et fichiers IA mis en cache dans ce navigateur ? Les prochains chargements devront retélécharger les fichiers.");
  if (!confirmed) return;
  if (loading) recordCancellation();
  resetWorker();
  try {
    const keys = await caches.keys();
    const targets = keys.filter((key) => key === "transformers-cache" || key.startsWith("transformers-cache-"));
    await Promise.all(targets.map((key) => caches.delete(key)));
    setProgress(0);
    setStatus("Cache IA réinitialisé");
    $("#modelStatus").textContent = "Cache IA supprimé";
    $("#modelHint").textContent = "Les conversations ont été conservées. Le prochain chargement téléchargera à nouveau les fichiers du modèle.";
    $("#downloadDetails").textContent = targets.length
      ? "Cache supprimé. " + targets.length + " espace(s) de cache nettoyé(s)."
      : "Aucun cache de modèle trouvé dans ce navigateur.";
    $("#loadModelButton").textContent = "Télécharger ce modèle";
  } catch (error) {
    setStatus("Nettoyage du cache impossible", "error");
    $("#modelHint").textContent = error.message || String(error);
  }
}

async function sendMessage(event) {
  event.preventDefault();
  const text = $("#messageInput").value.trim();
  if (!text || !worker || !modelReady || busy) return;
  $("#messageInput").value = "";
  updateCounter();
  addMessage("user", text);
  busy = true;
  $("#sendButton").disabled = true;
  $("#messageInput").disabled = true;
  addTyping();
  worker.postMessage({ type: "generate", message: text, history: history.slice(-8, -1) });
}

function updateCounter() {
  $("#counter").textContent = $("#messageInput").value.length + " / 1200";
}

$("#loadModelButton").addEventListener("click", ensureWorker);
$("#cancelDownloadButton").addEventListener("click", cancelDownload);
$("#modelSelect").addEventListener("change", changeModel);
$("#clearModelCacheButton").addEventListener("click", clearModelCache);
$("#chatForm").addEventListener("submit", sendMessage);
$("#messageInput").addEventListener("input", updateCounter);
$("#messageInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("#chatForm").requestSubmit();
  }
});
$("#clearButton").addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
});

selectedModel = localStorage.getItem(SELECTED_MODEL_KEY) || "lamini-77";
if (!MODELS[selectedModel]) selectedModel = "lamini-77";
$("#modelSelect").value = selectedModel;
stats = readJSON(STATS_KEY, {});
if (!stats || typeof stats !== "object" || Array.isArray(stats)) stats = {};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(saved)) {
    history = saved.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string");
  }
} catch (error) {}
setModelDescription();
renderHistory();
updateCounter();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    $("#modelHint").textContent = "Le chat reste accessible en ligne, mais le cache hors connexion n’a pas pu être préparé : " +
      (error.message || String(error));
  });
}