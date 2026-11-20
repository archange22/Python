const STORAGE_KEY = "academique-chat-ia-v1";
const $ = (selector) => document.querySelector(selector);
let worker = null;
let modelReady = false;
let busy = false;
let history = [];

function saveHistory() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-40))); } catch (error) {}
}

function setStatus(message, kind = "loading") {
  $("#modelStatus").textContent = message;
  $("#statusLabel").textContent = message;
  $("#statusDot").className = "online-indicator" + (kind === "ready" ? " ready" : kind === "error" ? " error" : "");
}

function setProgress(value) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  $("#modelProgress").style.width = percent + "%";
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
  title.textContent = role === "user" ? "Toi" : "Assistant local";
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
    addMessage("assistant", "Bonjour. Je peux t’aider à apprendre les bases de Python, comprendre des notions d’IA ou structurer un projet. Charge le modèle local pour commencer.", false);
    return;
  }
  for (const item of history) addMessage(item.role, item.content, false);
}

async function ensureWorker() {
  if (worker) return;
  setStatus("Préparation du moteur IA…");
  $("#loadModelButton").disabled = true;
  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("./sw.js");
      await navigator.serviceWorker.ready;
    }
    worker = new Worker("./chat.worker.js", { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", (event) => {
      setStatus("Le moteur IA a rencontré une erreur.", "error");
      $("#modelHint").textContent = event.message || "Vérifie la connexion initiale et le stockage disponible.";
      $("#loadModelButton").disabled = false;
      worker?.terminate();
      worker = null;
    });
    worker.postMessage({ type: "load" });
  } catch (error) {
    setStatus("Impossible de préparer le moteur IA.", "error");
    $("#modelHint").textContent = error.message || String(error);
    $("#loadModelButton").disabled = false;
  }
}

function handleWorkerMessage(event) {
  const data = event.data || {};
  if (data.type === "status") {
    setStatus(data.message || "Chargement du modèle…");
  } else if (data.type === "progress") {
    setProgress(data.progress);
    if (data.file) $("#modelHint").textContent = "Téléchargement : " + data.file;
  } else if (data.type === "ready") {
    modelReady = true;
    setProgress(100);
    setStatus("Modèle local prêt", "ready");
    $("#modelStatus").textContent = "Assistant prêt sur cet appareil";
    $("#modelHint").textContent = "Le modèle a été chargé et mis en cache par le navigateur. Tu peux maintenant discuter, même sans connexion si les fichiers restent conservés.";
    $("#loadModelButton").textContent = "Modèle prêt";
    $("#loadModelButton").disabled = true;
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
    worker?.terminate();
    worker = null;
    setStatus("Modèle non chargé", "error");
    $("#modelStatus").textContent = "Le modèle local n’a pas pu démarrer";
    $("#modelHint").textContent = data.message || "Connecte-toi pour effectuer le premier téléchargement, puis réessaie.";
    $("#loadModelButton").disabled = false;
    $("#loadModelButton").textContent = "Réessayer";
  }
}

function addTyping() {
  const article = addMessage("assistant", "Je prépare une réponse…", false);
  article.classList.add("typing");
  article.id = "typingMessage";
}

function removeTyping() {
  $("#typingMessage")?.remove();
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    setStatus("Mode hors connexion non initialisé", "error");
    $("#modelHint").textContent = "Le chat fonctionne encore en ligne, mais le cache hors connexion n’a pas pu être préparé : " + (error.message || String(error));
  });
}

$("#loadModelButton").addEventListener("click", ensureWorker);
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

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(saved)) history = saved.filter((item) => item && ["user","assistant"].includes(item.role) && typeof item.content === "string");
} catch (error) {}
renderHistory();
updateCounter();
