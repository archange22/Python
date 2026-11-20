import { loadKnowledgeIndex, searchKnowledge } from "./knowledge.js";
import { getSmallTalkReply, appendSourceReferences } from "./conversation.js";

const STORAGE_KEY = "academique-chat-ia-v1";
const SELECTED_MODEL_KEY = "academique-chat-ia-selected-model-v1";
const STATS_KEY = "academique-chat-ia-download-stats-v1";
const QUEUE_KEY = "academique-chat-ia-download-queue-v2";
const FILES_KEY = "academique-chat-ia-download-files-v2";
const RESPONSE_LENGTH_KEY = "academique-chat-ia-response-length-v1";
const PERFORMANCE_MODE_KEY = "academique-chat-ia-performance-mode-v1";

const MODELS = {
  "lamini-77": {
    name: "LaMini-Flan-T5-77M",
    description: "Le modèle le plus léger. Utile pour découvrir le chat local, mais ses réponses peuvent rester limitées.",
    family: "T5"
  },
  "lamini-248": {
    name: "LaMini-Flan-T5-248M",
    description: "Un modèle T5 plus grand. Il demande plus de mémoire et de stockage ; la taille exacte est calculée avant son chargement.",
    family: "T5"
  },
  "smollm2-135": {
    name: "SmolLM2-135M-Instruct",
    description: "Modèle conversationnel ONNX fourni par ONNX Community. Il peut produire progressivement ses réponses ; son français reste expérimental.",
    family: "Conversation"
  }
};

const $ = (selector) => document.querySelector(selector);

function ensureKnowledgeIndex() {
  if (!knowledgeIndexPromise) {
    knowledgeIndexPromise = loadKnowledgeIndex().catch((error) => {
      knowledgeIndexPromise = null;
      throw error;
    });
  }
  return knowledgeIndexPromise;
}

function warmKnowledgeIndex() {
  $("#knowledgeStatus").textContent = "Préparation de la bibliothèque des cours…";
  ensureKnowledgeIndex().then((index) => {
    const count = Array.isArray(index.sources) ? index.sources.length : 0;
    $("#knowledgeStatus").textContent = count
      ? "Bibliothèque prête · " + count + " leçons consultables"
      : "Aucune leçon n’est encore indexée.";
  }).catch(() => {
    $("#knowledgeStatus").textContent =
      "Bibliothèque indisponible pour le moment · vérifie la connexion.";
  });
}

function cleanMarkdownForDisplay(value) {
  return String(value || "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\x60{1,3}/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
let worker = null;
let modelReady = false;
let loading = false;
let busy = false;
let history = [];
let selectedModel = "lamini-77";
let responseLength = "normal";
let performanceMode = "fast";
let stats = {};
let downloadQueue = [];
let downloadFiles = [];
let downloadFilesModelKey = "lamini-77";
let queueRunning = false;
let queueCurrentKey = null;
let queueOriginalModel = null;
let activeLoadPurpose = "manual";
let streamingMessage = null;
let lastSpeedSample = null;
let smoothedSpeed = 0;
let fileSavePending = false;
let downloadPlanTotalBytes = 0;
let knowledgeIndexPromise = null;
let currentSources = [];

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
}

function saveHistory() {
  persist(STORAGE_KEY, history.slice(-40));
}

function saveStats() {
  persist(STATS_KEY, stats);
  renderStats();
}

function saveQueue() {
  persist(QUEUE_KEY, downloadQueue);
  renderQueue();
}

function saveFilesSoon() {
  if (fileSavePending) return;
  fileSavePending = true;
  setTimeout(() => {
    fileSavePending = false;
    persist(FILES_KEY, {
      modelKey: downloadFilesModelKey,
      savedAt: Date.now(),
      files: downloadFiles
    });
  }, 500);
}

function renderStats() {
  const current = stats[selectedModel] || {
    attempts: 0, successes: 0, failures: 0, cancellations: 0
  };
  const completed = Math.max(0, current.attempts - (current.cancellations || 0));
  const failureRate = completed
    ? Math.round((current.failures / completed) * 100)
    : 0;
  $("#downloadStats").textContent = current.attempts
    ? current.successes + " réussi(s) · " + current.failures + " échec(s) · " +
      (current.cancellations || 0) + " arrêt(s) · " + failureRate +
      " % d’échec local pour ce modèle"
    : "Aucun essai enregistré sur cet appareil.";
}

function updateStat(field) {
  const current = stats[selectedModel] || {
    attempts: 0, successes: 0, failures: 0, cancellations: 0
  };
  current[field] = (current[field] || 0) + 1;
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
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return size.toFixed(size >= 100 || index === 0 ? 0 : 1) + " " + units[index];
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 60 * 60 * 24 * 14) return "—";
  const total = Math.ceil(seconds);
  if (total < 60) return total + " s";
  if (total < 3600) return Math.floor(total / 60) + " min " + (total % 60) + " s";
  return Math.floor(total / 3600) + " h " + Math.floor((total % 3600) / 60) + " min";
}

function setProgress(percent, loaded, total) {
  const value = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  $("#modelProgress").style.width = value + "%";
  $(".overall-progress").setAttribute("aria-valuenow", String(Math.round(value)));
  $("#downloadPercent").textContent = Math.round(value) + " %";
  if (Number.isFinite(loaded) && Number.isFinite(total) && total > 0) {
    $("#downloadDetails").textContent = formatBytes(loaded) + " / " + formatBytes(total);
    updateSpeed(loaded, total);
  }
}

function updateSpeed(loaded, total) {
  const now = Date.now();
  if (lastSpeedSample && now > lastSpeedSample.time && loaded >= lastSpeedSample.loaded) {
    const deltaTime = (now - lastSpeedSample.time) / 1000;
    const instant = (loaded - lastSpeedSample.loaded) / deltaTime;
    if (instant > 0 && Number.isFinite(instant)) {
      smoothedSpeed = smoothedSpeed ? smoothedSpeed * 0.7 + instant * 0.3 : instant;
    }
  }
  lastSpeedSample = { time: now, loaded };
  $("#downloadSpeed").textContent = smoothedSpeed > 0
    ? "Vitesse : " + formatBytes(smoothedSpeed) + "/s"
    : "Vitesse : calcul…";
  $("#downloadEta").textContent = smoothedSpeed > 0 && total >= loaded
    ? "Temps restant : " + formatDuration((total - loaded) / smoothedSpeed)
    : "Temps restant : calcul…";
}

function resetSpeed() {
  lastSpeedSample = null;
  smoothedSpeed = 0;
  $("#downloadSpeed").textContent = "Vitesse : —";
  $("#downloadEta").textContent = "Temps restant : —";
}

function setModelDescription() {
  const model = MODELS[selectedModel];
  $("#modelDescription").textContent = model.description;
  $("#modelHint").textContent = "La taille exacte et les fichiers nécessaires seront demandés au registre du modèle avant le chargement.";
  $("#clearModelCacheButton").textContent = "Effacer le cache de ce modèle";
  renderStats();
}

function statusLabel(status) {
  const labels = {
    cached: "Déjà en cache",
    waiting: "En attente",
    preparing: "Préparation",
    downloading: "Téléchargement",
    retry: "Nouvelle tentative",
    done: "Terminé",
    missing: "Introuvable",
    interrupted: "Interrompu"
  };
  return labels[status] || status || "En attente";
}

function renderFileList() {
  const container = $("#downloadFileList");
  container.textContent = "";

  if (!downloadFiles.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "La liste détaillée apparaît avant le chargement, lorsque le registre du modèle répond.";
    container.appendChild(empty);
    $("#fileCountLabel").textContent = "En attente d’un diagnostic";
    return;
  }

  const completed = downloadFiles.filter((file) =>
    ["cached", "done"].includes(file.status)
  ).length;
  $("#fileCountLabel").textContent = completed + " / " + downloadFiles.length + " fichiers terminés";

  for (const file of downloadFiles) {
    const item = document.createElement("article");
    item.className = "download-file";

    const line = document.createElement("div");
    line.className = "download-file-line";
    const name = document.createElement("span");
    name.className = "download-file-name";
    name.textContent = file.file;
    name.title = file.file;
    const status = document.createElement("span");
    status.className = "file-status file-status-" + (file.status || "waiting");
    status.textContent = statusLabel(file.status);
    line.append(name, status);

    const bar = document.createElement("div");
    bar.className = "file-progress-track";
    const fill = document.createElement("div");
    fill.className = "file-progress-fill";
    const percent = Number.isFinite(file.progress) ? Math.max(0, Math.min(100, file.progress)) : 0;
    fill.style.width = percent + "%";
    bar.appendChild(fill);

    const detail = document.createElement("div");
    detail.className = "download-file-detail";
    const loaded = file.cached || file.status === "done"
      ? (file.size || file.loaded || 0)
      : (file.loaded || 0);
    const sizeText = file.size ? formatBytes(loaded) + " / " + formatBytes(file.size) : formatBytes(loaded);
    const percentText = file.status === "cached" || file.status === "done"
      ? "100 %"
      : Math.round(percent) + " %";
    const size = document.createElement("span");
    size.textContent = sizeText;
    const progressText = document.createElement("span");
    progressText.textContent = percentText;
    detail.append(size, progressText);
    item.append(line, bar, detail);
    container.appendChild(item);
  }
}

function renderQueue() {
  const container = $("#downloadQueueList");
  container.textContent = "";
  const activeCount = downloadQueue.filter((item) => item.status === "running").length;
  const waitingCount = downloadQueue.filter((item) =>
    ["queued", "interrupted", "failed"].includes(item.status)
  ).length;
  const doneCount = downloadQueue.filter((item) => item.status === "done").length;

  $("#queueSummary").textContent = activeCount
    ? "Téléchargement en cours"
    : downloadQueue.length
      ? waitingCount + " en attente · " + doneCount + " terminé(s)"
      : "File vide";

  $("#startQueueButton").disabled = queueRunning || waitingCount === 0;
  $("#pauseQueueButton").hidden = !queueRunning;
  $("#clearQueueButton").disabled = queueRunning || downloadQueue.length === 0;
  $("#queueModelButton").disabled = queueRunning || loading;

  if (!downloadQueue.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Aucun modèle programmé.";
    container.appendChild(empty);
    return;
  }

  downloadQueue.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "queue-item";

    const info = document.createElement("div");
    info.className = "queue-item-info";
    const title = document.createElement("strong");
    title.textContent = (index + 1) + ". " + (MODELS[entry.modelKey]?.name || entry.modelKey);
    const state = document.createElement("span");
    state.textContent = statusLabel(entry.status) + (entry.lastError ? " · " + entry.lastError : "");
    info.append(title, state);

    const actions = document.createElement("div");
    actions.className = "queue-item-actions";

    const up = document.createElement("button");
    up.type = "button";
    up.className = "queue-order";
    up.textContent = "↑";
    up.title = "Monter dans la file";
    up.setAttribute("aria-label", "Monter " + (MODELS[entry.modelKey]?.name || entry.modelKey));
    up.disabled = queueRunning || index === 0;
    up.addEventListener("click", () => reorderQueue(entry.modelKey, -1));

    const down = document.createElement("button");
    down.type = "button";
    down.className = "queue-order";
    down.textContent = "↓";
    down.title = "Descendre dans la file";
    down.setAttribute("aria-label", "Descendre " + (MODELS[entry.modelKey]?.name || entry.modelKey));
    down.disabled = queueRunning || index === downloadQueue.length - 1;
    down.addEventListener("click", () => reorderQueue(entry.modelKey, 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "queue-remove";
    remove.textContent = "Retirer";
    remove.disabled = entry.status === "running" || queueRunning;
    remove.addEventListener("click", () => removeQueueItem(entry.modelKey));

    actions.append(up, down, remove);
    row.append(info, actions);
    container.appendChild(row);
  });
}

function reorderQueue(modelKey, offset) {
  if (queueRunning) return;
  const index = downloadQueue.findIndex((item) => item.modelKey === modelKey);
  const destination = index + offset;
  if (index < 0 || destination < 0 || destination >= downloadQueue.length) return;
  const [entry] = downloadQueue.splice(index, 1);
  downloadQueue.splice(destination, 0, entry);
  saveQueue();
}

function addQueueItem() {
  const existing = downloadQueue.find((item) => item.modelKey === selectedModel);
  if (existing) {
    if (["done", "failed", "interrupted"].includes(existing.status)) {
      existing.status = "queued";
      existing.lastError = "";
    } else {
      $("#queueSummary").textContent = "Ce modèle est déjà dans la file.";
      return;
    }
  } else {
    downloadQueue.push({
      modelKey: selectedModel,
      status: "queued",
      addedAt: Date.now(),
      lastError: ""
    });
  }
  saveQueue();
}

function removeQueueItem(modelKey) {
  if (queueRunning) return;
  downloadQueue = downloadQueue.filter((item) => item.modelKey !== modelKey);
  saveQueue();
}

function clearQueue() {
  if (queueRunning) return;
  downloadQueue = [];
  saveQueue();
}

async function prepareStorage() {
  let message = "Le navigateur gère la conservation du cache.";
  try {
    if (navigator.storage?.persist) {
      const persisted = await navigator.storage.persist();
      message = persisted
        ? "Le navigateur a accepté de protéger les fichiers IA contre une suppression automatique."
        : "La conservation du cache n’est pas garantie par le navigateur.";
    }
  } catch (error) {}
  return message;
}

function waitForServiceWorker(registration) {
  if (registration.active && registration.active.state === "activated") {
    return Promise.resolve();
  }
  const target = registration.installing || registration.waiting || registration.active;
  if (!target) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const onStateChange = () => {
      if (target.state === "activated") {
        target.removeEventListener("statechange", onStateChange);
        resolve();
      } else if (target.state === "redundant") {
        target.removeEventListener("statechange", onStateChange);
        reject(new Error("Le cache hors connexion n’a pas pu être activé."));
      }
    };
    target.addEventListener("statechange", onStateChange);
    onStateChange();
  });
}

function explainError(message) {
  const raw = String(message || "Erreur inconnue");
  const lower = raw.toLowerCase();

  if (!navigator.onLine) {
    return "Connexion Internet absente. Reconnecte-toi pour récupérer les fichiers manquants. " + raw;
  }
  if (/quota|storage|disk|space|stockage/.test(lower)) {
    return "Le navigateur manque probablement d’espace de stockage. Libère de l’espace puis réessaie. " + raw;
  }
  if (/429|too many requests/.test(lower)) {
    return "Le serveur limite temporairement les téléchargements. Attends avant de relancer. " + raw;
  }
  if (/403|404|not found|forbidden/.test(lower)) {
    return "Un fichier du modèle est inaccessible ou son adresse n’est plus valide. " + raw;
  }
  if (/wasm|webassembly|onnx|memory|allocation/.test(lower)) {
    return "Le moteur d’exécution ou la mémoire de l’appareil n’a pas pu initialiser le modèle. Essaie le modèle le plus léger. " + raw;
  }
  return raw + " Vérifie la connexion et l’espace libre, puis réessaie.";
}

function resetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  loading = false;
  modelReady = false;
  busy = false;
  streamingMessage = null;
  $("#cancelDownloadButton").hidden = true;
  $("#modelSelect").disabled = false;
  $("#loadModelButton").disabled = false;
  $("#messageInput").disabled = busy;
  $("#sendButton").disabled = busy;
  removeTyping();
}

function startModelLoad(purpose = "manual", modelKey = selectedModel) {
  if (loading) return;
  selectedModel = modelKey;
  $("#modelSelect").value = selectedModel;
  activeLoadPurpose = purpose;
  loading = true;
  modelReady = false;
  updateStat("attempts");
  resetSpeed();
  downloadFiles = [];
  renderFileList();
  setProgress(0);
  $("#loadModelButton").disabled = true;
  $("#modelSelect").disabled = true;
  $("#cancelDownloadButton").hidden = false;
  $("#modelHint").textContent = "Vérification du stockage, du registre et des fichiers du modèle…";
  $("#downloadDetails").textContent = "Préparation du téléchargement…";
  $("#messageInput").disabled = busy;
  $("#sendButton").disabled = busy;
  $("#generationStatus").textContent = purpose === "queue"
    ? "Préparation d’un modèle programmé…"
    : "Chargement du modèle avant la discussion.";
  setStatus("Préparation du modèle…");

  (async () => {
    try {
      const storageMessage = await prepareStorage();
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("./sw.js");
        await waitForServiceWorker(registration);
      }
      if (!loading) return;

      worker = new Worker("./chat.worker.js", { type: "module" });
      worker.addEventListener("message", handleWorkerMessage);
      worker.addEventListener("error", (event) => handleWorkerError(event.message));
      $("#modelHint").textContent = storageMessage;
      worker.postMessage({ type: "load", modelKey: selectedModel });
    } catch (error) {
      handleLoadFailure(error.message || String(error));
    }
  })();
}

function ensureWorker() {
  if (loading || modelReady || queueRunning) return;
  startModelLoad("manual", selectedModel);
}

function handleWorkerError(message) {
  if (!loading) return;
  handleLoadFailure(message || "Erreur du moteur Web Worker.");
}

function markIncompleteFilesInterrupted() {
  let changed = false;
  for (const file of downloadFiles) {
    if (["preparing", "downloading", "retry"].includes(file.status)) {
      file.status = "interrupted";
      changed = true;
    }
  }
  if (changed) {
    renderFileList();
    saveFilesSoon();
  }
}

function handleLoadFailure(message) {
  updateStat("failures");
  markIncompleteFilesInterrupted();
  const failedKey = selectedModel;
  const purpose = activeLoadPurpose;
  const item = downloadQueue.find((entry) => entry.modelKey === failedKey);

  resetWorker();
  setStatus("Chargement impossible", "error");
  $("#modelStatus").textContent = "Le modèle n’a pas pu démarrer";
  $("#modelHint").textContent = explainError(message);
  $("#downloadDetails").textContent = "Échec du chargement. Les fichiers validés restent susceptibles d’être présents dans le cache.";
  $("#loadModelButton").textContent = "Réessayer";
  $("#generationStatus").textContent = "Le modèle n’est pas prêt.";

  if (purpose === "queue" && item) {
    item.status = "failed";
    item.lastError = String(message || "Erreur").slice(0, 160);
    saveQueue();
    queueCurrentKey = null;
    setTimeout(processQueue, 250);
  }
}

function updatePlan(data) {
  downloadFilesModelKey = data.modelKey || selectedModel;
  const heading = $(".file-list-heading strong");
  if (heading) heading.textContent = "Fichiers · " + (MODELS[downloadFilesModelKey]?.name || "Modèle IA");
  downloadPlanTotalBytes = Number.isFinite(data.totalBytes) ? data.totalBytes : 0;
  downloadFiles = (data.files || []).map((file) => ({
    file: file.file,
    size: file.size || null,
    exists: file.exists,
    cached: Boolean(file.cached),
    status: file.cached ? "cached" : file.exists === false ? "missing" : "waiting",
    progress: file.cached ? 100 : 0,
    loaded: file.cached ? (file.size || 0) : 0
  }));
  renderFileList();
  saveFilesSoon();

  const cached = data.cachedCount || 0;
  const total = data.fileCount || downloadFiles.length;
  const totalBytes = data.totalBytes || 0;
  $("#modelHint").textContent = totalBytes
    ? "Fichiers requis : " + total + " · taille totale connue : " + formatBytes(totalBytes) +
      " · déjà en cache : " + cached + "."
    : "Le registre a listé " + total + " fichier(s), mais n’a pas fourni une taille totale exploitable.";

  if (totalBytes > 0 && navigator.storage?.estimate) {
    navigator.storage.estimate().then((estimate) => {
      if (!loading || !Number.isFinite(estimate.quota) || !Number.isFinite(estimate.usage)) return;
      const free = Math.max(0, estimate.quota - estimate.usage);
      const remainingRequired = Math.max(0, totalBytes - cachedBytes);
      if (free < remainingRequired) {
        $("#modelHint").textContent += " Attention : espace estimé restant " + formatBytes(free) +
          ", inférieur au volume encore à récupérer (" + formatBytes(remainingRequired) + ").";
      } else {
        $("#modelHint").textContent += " Espace estimé restant : " + formatBytes(free) + ".";
      }
    }).catch(() => {});
  }

  const cachedBytes = data.cachedBytes || 0;
  const pct = totalBytes > 0 ? (cachedBytes / totalBytes) * 100 : (total ? cached / total * 100 : 0);
  setProgress(pct, cachedBytes, totalBytes);
  $("#downloadDetails").textContent = cached + " / " + total + " fichiers déjà en cache";
}

function updateFileStatus(data) {
  const file = downloadFiles.find((item) => item.file === data.file);
  if (!file) return;
  file.status = data.status;
  if (data.status === "preparing" || data.status === "downloading") {
    $("#downloadDetails").textContent = (data.status === "preparing" ? "Préparation : " : "Téléchargement : ") + data.file;
  }
  renderFileList();
  saveFilesSoon();
}

function updateFileProgress(data) {
  if (!downloadFilesModelKey) downloadFilesModelKey = selectedModel;
  let file = downloadFiles.find((item) => item.file === data.file);
  if (!file) {
    file = {
      file: data.file,
      size: data.total || null,
      status: "downloading",
      progress: 0,
      loaded: 0
    };
    downloadFiles.push(file);
  }
  if (Number.isFinite(data.total) && data.total > 0) file.size = data.total;
  if (Number.isFinite(data.loaded)) file.loaded = data.loaded;
  if (Number.isFinite(data.progress)) file.progress = data.progress;
  file.status = "downloading";

  const knownTotal = downloadPlanTotalBytes ||
    downloadFiles.reduce((sum, item) => sum + (item.size || 0), 0);
  const loaded = downloadFiles.reduce((sum, item) => {
    if (["cached", "done"].includes(item.status)) return sum + (item.size || item.loaded || 0);
    return sum + (item.loaded || 0);
  }, 0);

  if (knownTotal > 0) {
    setProgress((loaded / knownTotal) * 100, loaded, knownTotal);
  } else if (Number.isFinite(data.progress)) {
    $("#modelProgress").style.width = Math.max(0, Math.min(100, data.progress)) + "%";
    $("#downloadPercent").textContent = Math.round(data.progress) + " %";
  }

  $("#downloadDetails").textContent = data.file + " · " +
    formatBytes(data.loaded || 0) + " / " + formatBytes(data.total || file.size || 0);

  renderFileList();
  saveFilesSoon();
}

function updateOverallProgress(data) {
  if (Number.isFinite(data.total) && data.total > 0) downloadPlanTotalBytes = data.total;
  if (data.files && typeof data.files === "object") {
    for (const [fileName, value] of Object.entries(data.files)) {
      let file = downloadFiles.find((item) => item.file === fileName);
      if (!file) {
        file = { file: fileName, size: value.total || null, loaded: 0, progress: 0, status: "downloading" };
        downloadFiles.push(file);
      }
      if (Number.isFinite(value.total) && value.total > 0) file.size = value.total;
      if (Number.isFinite(value.loaded)) file.loaded = value.loaded;
      if (file.size) file.progress = Math.min(100, (file.loaded / file.size) * 100);
      if (file.progress >= 100) file.status = "done";
      else if (file.loaded > 0) file.status = "downloading";
    }
    renderFileList();
    saveFilesSoon();
  }

  setProgress(data.progress, data.loaded, data.total);
  if (Number.isFinite(data.loaded) && Number.isFinite(data.total)) {
    $("#downloadDetails").textContent = "Progression globale : " +
      formatBytes(data.loaded) + " / " + formatBytes(data.total);
  }
}

function completeFile(fileName) {
  const file = downloadFiles.find((item) => item.file === fileName);
  if (file) {
    file.status = "done";
    file.progress = 100;
    if (file.size) file.loaded = file.size;
  }
  renderFileList();
  saveFilesSoon();
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
  title.textContent = role === "user" ? "Toi" : "SUN";
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
  return { article, paragraph };
}

function renderHistory() {
  $("#messages").textContent = "";
  if (!history.length) {
    addMessage("assistant", "Bonjour ! Je suis SUN, l’assistant d’Académique. Tu peux me parler normalement ou me poser une question sur les leçons et les documents de cours.", false);
    return;
  }
  for (const item of history) addMessage(item.role, item.content, false);
}

function addTyping() {
  const message = addMessage("assistant", "Le modèle prépare sa réponse…", false);
  message.article.classList.add("typing");
  message.article.id = "typingMessage";
}

function removeTyping() {
  $("#typingMessage")?.remove();
}

function beginAssistantStream() {
  if (streamingMessage) return;
  removeTyping();
  const message = addMessage("assistant", "", false);
  message.article.classList.add("streaming");
  streamingMessage = { ...message, text: "" };
}

function appendAssistantToken(token) {
  if (!streamingMessage) beginAssistantStream();
  streamingMessage.text += token;
  streamingMessage.paragraph.textContent = streamingMessage.text;
  $("#messages").scrollTop = $("#messages").scrollHeight;
}

function finishAssistantStream(finalText) {
  if (!streamingMessage) {
    if (finalText) addMessage("assistant", finalText);
    return;
  }

  const text = String(finalText || streamingMessage.text).trim();
  streamingMessage.paragraph.textContent = text || "Le modèle n’a pas fourni de réponse.";
  if (text) {
    history.push({ role: "assistant", content: text });
    history = history.slice(-40);
    saveHistory();
  }
  streamingMessage.article.classList.remove("streaming");
  streamingMessage = null;
}

function updateGenerationControls(isBusy) {
  busy = isBusy;
  $("#sendButton").disabled = isBusy;
  $("#messageInput").disabled = isBusy;
}

function handleQueueReady() {
  const finishedKey = queueCurrentKey;
  const item = downloadQueue.find((entry) => entry.modelKey === finishedKey);
  if (item) {
    item.status = "done";
    item.lastError = "";
    item.completedAt = Date.now();
    saveQueue();
  }

  if (worker) worker.terminate();
  worker = null;
  markIncompleteFilesInterrupted();
  loading = false;
  modelReady = false;
  queueCurrentKey = null;
  $("#cancelDownloadButton").hidden = true;
  $("#loadModelButton").disabled = false;
  $("#loadModelButton").textContent = "Charger pour réponses avancées";
  $("#modelSelect").disabled = false;
  updateGenerationControls(false);
  $("#generationStatus").textContent =
    "Modèle téléchargé, pas encore chargé en mémoire. Tu peux discuter sans lui ou le charger pour les réponses libres.";
  $("#downloadDetails").textContent = "Téléchargement terminé · " + downloadFiles.length + " fichier(s) suivis.";
  $("#downloadSpeed").textContent = "Vitesse : terminée";
  $("#downloadEta").textContent = "Temps restant : 0 s";
  setStatus("SUN prêt · modèle téléchargé", "ready");
  $("#modelStatus").textContent = MODELS[finishedKey]?.name + " · fichiers prêts";
  setTimeout(processQueue, 200);
}

function handleWorkerMessage(event) {
  const data = event.data || {};

  if (data.type === "status") {
    setStatus(data.message || "Chargement du modèle…");
    $("#generationStatus").textContent = data.message || "Préparation du moteur IA.";
    return;
  }

  if (data.type === "download-plan") {
    updatePlan(data);
    return;
  }

  if (data.type === "plan-warning") {
    $("#modelHint").textContent = data.message || "Détail du téléchargement indisponible.";
    return;
  }

  if (data.type === "network-retry") {
    $("#downloadDetails").textContent = "Nouvelle tentative " + data.attempt + "/" +
      data.maxAttempts + " · " + (data.file || "fichier") + " · " + (data.reason || "");
    const file = downloadFiles.find((item) => item.file === data.file || item.file.endsWith(data.file || "\u0000"));
    if (file) file.status = "retry";
    renderFileList();
    return;
  }

  if (data.type === "load-retry") {
    $("#downloadDetails").textContent = "Nouvel essai du modèle " + data.attempt + "/" + data.maxAttempts;
    $("#modelHint").textContent = "Une tentative complète a échoué : " + (data.reason || "erreur inconnue");
    return;
  }

  if (data.type === "file-status") {
    updateFileStatus(data);
    return;
  }

  if (data.type === "file-progress") {
    updateFileProgress(data);
    return;
  }

  if (data.type === "overall-progress") {
    updateOverallProgress(data);
    return;
  }

  if (data.type === "file-complete") {
    completeFile(data.file);
    return;
  }

  if (data.type === "ready") {
    loading = false;
    updateStat("successes");
    setProgress(100);
    for (const file of downloadFiles) {
      if (file.status === "waiting" || file.status === "downloading" || file.status === "preparing") {
        file.status = "done";
        file.progress = 100;
        if (file.size) file.loaded = file.size;
      }
    }
    renderFileList();
    saveFilesSoon();

    if (activeLoadPurpose === "queue") {
      handleQueueReady();
      return;
    }

    modelReady = true;
    const matchingQueueItem = downloadQueue.find((item) => item.modelKey === selectedModel);
    if (matchingQueueItem && ["queued", "interrupted", "failed"].includes(matchingQueueItem.status)) {
      matchingQueueItem.status = "done";
      matchingQueueItem.lastError = "";
      matchingQueueItem.completedAt = Date.now();
      saveQueue();
    }
    setStatus("Modèle local prêt", "ready");
    $("#modelStatus").textContent = MODELS[selectedModel].name + " est prêt";
    $("#modelHint").textContent = "Le modèle est chargé et les fichiers requis ont été vérifiés par le moteur.";
    $("#downloadDetails").textContent = "Initialisation terminée · " + downloadFiles.length + " fichiers suivis.";
    $("#loadModelButton").textContent = "Modèle prêt";
    $("#loadModelButton").disabled = true;
    $("#cancelDownloadButton").hidden = true;
    $("#modelSelect").disabled = false;
    $("#messageInput").disabled = false;
    $("#sendButton").disabled = false;
    $("#generationStatus").textContent = "Modèle local chargé · SUN peut répondre librement.";
    $("#downloadSpeed").textContent = "Vitesse : terminée";
    $("#downloadEta").textContent = "Temps restant : 0 s";
    $("#messageInput").focus();
    return;
  }

  if (data.type === "generation-start") {
    $("#generationStatus").textContent = MODELS[selectedModel].name + " génère une réponse…";
    return;
  }

  if (data.type === "token") {
    appendAssistantToken(data.text || "");
    return;
  }

  if (data.type === "reply") {
    removeTyping();
    const response = appendSourceReferences(
      data.text || (streamingMessage?.text || "Je n’ai pas réussi à formuler une réponse. Reformule ta question."),
      currentSources
    );
    currentSources = [];
    if (data.streamed) finishAssistantStream(response);
    else addMessage("assistant", response);
    updateGenerationControls(false);
    const seconds = Number.isFinite(data.durationMs) ? (data.durationMs / 1000).toFixed(1) : null;
    $("#generationStatus").textContent = seconds
      ? "Réponse terminée en " + seconds + " s · mode " +
        ({ fast: "rapide", balanced: "équilibré", quality: "approfondi" }[data.performanceMode] || "local")
      : "Réponse terminée.";
    return;
  }

  if (data.type === "generation-error") {
    removeTyping();
    currentSources = [];
    if (streamingMessage) finishAssistantStream(streamingMessage.text);
    addMessage("assistant", explainError(data.message || "Erreur pendant la génération."));
    updateGenerationControls(false);
    $("#generationStatus").textContent = "La génération a rencontré une erreur.";
    return;
  }

  if (data.type === "load-error") {
    handleLoadFailure(data.message || "Erreur de téléchargement.");
  }
}

function pauseQueue() {
  if (!queueRunning) return;
  queueRunning = false;
  if (queueCurrentKey) {
    const current = downloadQueue.find((item) => item.modelKey === queueCurrentKey);
    if (current) current.status = "interrupted";
    updateStat("cancellations");
  }
  if (worker) worker.terminate();
  worker = null;
  loading = false;
  modelReady = false;
  queueCurrentKey = null;
  activeLoadPurpose = "manual";
  $("#cancelDownloadButton").hidden = true;
  $("#loadModelButton").disabled = false;
  $("#modelSelect").disabled = false;
  $("#downloadDetails").textContent = "File mise en pause. Les fichiers terminés restent potentiellement en cache.";
  $("#modelHint").textContent = "Relance la file pour réessayer les fichiers manquants.";
  $("#generationStatus").textContent = "File de téléchargement en pause.";
  saveQueue();
}

function processQueue() {
  if (!queueRunning || loading) return;

  const next = downloadQueue.find((item) =>
    ["queued", "interrupted"].includes(item.status)
  );

  if (!next) {
    queueRunning = false;
    queueCurrentKey = null;
    if (queueOriginalModel && MODELS[queueOriginalModel]) {
      selectedModel = queueOriginalModel;
      $("#modelSelect").value = selectedModel;
      setModelDescription();
    }
    $("#modelSelect").disabled = false;
    $("#loadModelButton").disabled = false;
    $("#loadModelButton").textContent = "Charger pour réponses avancées";
    $("#generationStatus").textContent = "Tous les modèles programmés ont été traités.";
    setStatus("File de téléchargement terminée", "ready");
    renderQueue();
    return;
  }

  next.status = "running";
  next.lastError = "";
  queueCurrentKey = next.modelKey;
  selectedModel = next.modelKey;
  $("#modelSelect").value = selectedModel;
  setModelDescription();
  saveQueue();
  startModelLoad("queue", next.modelKey);
}

function startQueue() {
  if (queueRunning || loading) return;
  for (const item of downloadQueue) {
    if (item.status === "failed") {
      item.status = "queued";
      item.lastError = "";
    }
  }
  const hasWork = downloadQueue.some((item) =>
    ["queued", "interrupted"].includes(item.status)
  );
  if (!hasWork) return;
  queueOriginalModel = selectedModel;
  queueRunning = true;
  processQueue();
  renderQueue();
}

function cancelDownload() {
  if (!loading) return;

  if (activeLoadPurpose === "queue") {
    pauseQueue();
    return;
  }

  updateStat("cancellations");
  resetWorker();
  markIncompleteFilesInterrupted();
  setStatus("Chargement arrêté", "error");
  $("#modelHint").textContent = "Le chargement a été arrêté. Les fichiers complètement enregistrés peuvent être réutilisés au prochain essai.";
  $("#downloadDetails").textContent = "Arrêt demandé.";
  $("#loadModelButton").textContent = "Reprendre / réessayer";
  $("#generationStatus").textContent = "Chargement interrompu.";
}

function changeModel() {
  if (loading || queueRunning) return;
  const next = $("#modelSelect").value;
  if (!MODELS[next] || next === selectedModel) return;

  resetWorker();
  selectedModel = next;
  persist(SELECTED_MODEL_KEY, selectedModel);
  setProgress(0);
  resetSpeed();
  setStatus("Modèle non chargé");
  $("#modelStatus").textContent = "SUN prêt · modèle optionnel";
  $("#downloadDetails").textContent = "Aucun chargement en cours.";
  $("#loadModelButton").textContent = "Charger pour réponses avancées";
  setModelDescription();
  renderHistory();
}

function changeResponseLength() {
  responseLength = $("#responseLengthSelect").value;
  persist(RESPONSE_LENGTH_KEY, responseLength);
}

function changePerformanceMode() {
  performanceMode = $("#performanceModeSelect").value;
  persist(PERFORMANCE_MODE_KEY, performanceMode);
  const labels = { fast: "Rapide", balanced: "Équilibré", quality: "Approfondi" };
  $("#generationStatus").textContent = "Mode " + labels[performanceMode] + " sélectionné.";
}

function clearModelCache() {
  if (loading || queueRunning) return;
  const confirmed = window.confirm("Effacer les fichiers en cache de " + MODELS[selectedModel].name + " ? Les prochains chargements devront retélécharger les fichiers.");
  if (!confirmed) return;

  const cacheWorker = new Worker("./chat.worker.js", { type: "module" });
  $("#clearModelCacheButton").disabled = true;
  $("#modelHint").textContent = "Nettoyage du cache de ce modèle…";
  cacheWorker.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "cache-cleared") {
      cacheWorker.terminate();
      $("#clearModelCacheButton").disabled = false;
      setProgress(0);
      resetSpeed();
      $("#modelHint").textContent = "Cache du modèle effacé. Les conversations et les autres modèles sont conservés.";
      $("#downloadDetails").textContent = data.filesDeleted + " fichier(s) supprimé(s) du cache.";
      $("#modelStatus").textContent = "Cache du modèle effacé";
      if (downloadFilesModelKey === selectedModel) {
        downloadFiles = [];
        downloadPlanTotalBytes = 0;
        const heading = $(".file-list-heading strong");
        if (heading) heading.textContent = "Fichiers · cache effacé";
        saveFilesSoon();
      }
      const queueEntry = downloadQueue.find((item) => item.modelKey === selectedModel);
      if (queueEntry && queueEntry.status === "done") {
        queueEntry.status = "queued";
        queueEntry.lastError = "";
        saveQueue();
      }
      setStatus("Cache réinitialisé", "ready");
      renderFileList();
    } else if (data.type === "cache-clear-error") {
      cacheWorker.terminate();
      $("#clearModelCacheButton").disabled = false;
      $("#modelHint").textContent = explainError(data.message);
      setStatus("Nettoyage impossible", "error");
    }
  });
  cacheWorker.addEventListener("error", (event) => {
    cacheWorker.terminate();
    $("#clearModelCacheButton").disabled = false;
    $("#modelHint").textContent = explainError(event.message);
    setStatus("Nettoyage impossible", "error");
  });
  cacheWorker.postMessage({ type: "clear-cache", modelKey: selectedModel });
}

async function sendMessage(event) {
  event.preventDefault();
  const text = $("#messageInput").value.trim();
  if (!text || busy) return;

  $("#messageInput").value = "";
  updateCounter();
  addMessage("user", text);

  const smallTalk = getSmallTalkReply(text, history.slice(0, -1));
  if (smallTalk) {
    currentSources = [];
    addMessage("assistant", smallTalk);
    $("#generationStatus").textContent = "Échange simple · aucune génération nécessaire.";
    return;
  }

  updateGenerationControls(true);
  $("#generationStatus").textContent = "Recherche dans les leçons et les PDF de cours…";
  addTyping();

  let sources = [];
  try {
    const index = await ensureKnowledgeIndex();
    sources = searchKnowledge(index, text, 3);
    const count = Array.isArray(index.sources) ? index.sources.length : 0;
    $("#knowledgeStatus").textContent =
      "Bibliothèque prête · " + count + " leçons consultables";
  } catch (error) {
    $("#knowledgeStatus").textContent =
      "Recherche documentaire indisponible · réponse générale possible.";
  }
  currentSources = sources;

  if (!worker || !modelReady) {
    removeTyping();
    if (sources.length) {
      const excerpt = cleanMarkdownForDisplay(sources[0].text).slice(0, 720);
      const reply = appendSourceReferences(
        "J’ai retrouvé ce passage dans le cours :\n\n" + excerpt,
        sources
      );
      addMessage("assistant", reply);
      $("#generationStatus").textContent = "Extrait retrouvé sans charger le modèle.";
    } else {
      addMessage(
        "assistant",
        "Pour répondre à cette question avec une explication complète, charge un modèle local. Les salutations et les recherches dans les leçons restent disponibles sans lui."
      );
      $("#generationStatus").textContent = "Modèle local nécessaire pour cette réponse.";
    }
    currentSources = [];
    updateGenerationControls(false);
    return;
  }

  $("#generationStatus").textContent = sources.length
    ? "Le modèle prépare une réponse avec " + sources.length + " référence(s)…"
    : "Le modèle prépare sa réponse…";

  worker.postMessage({
    type: "generate",
    modelKey: selectedModel,
    message: text,
    history: history.slice(0, -1).slice(-8),
    responseLength,
    performanceMode,
    sources: sources.map((source) => ({
      label: source.label,
      section: source.section,
      text: source.text
    }))
  });
}

function updateCounter() {
  $("#counter").textContent = $("#messageInput").value.length + " / 1600";
}

function initializeApp() {
  selectedModel = localStorage.getItem(SELECTED_MODEL_KEY) || "lamini-77";
  if (!MODELS[selectedModel]) selectedModel = "lamini-77";

  responseLength = localStorage.getItem(RESPONSE_LENGTH_KEY) || "normal";
  if (!["short", "normal", "detailed"].includes(responseLength)) responseLength = "normal";

  performanceMode = localStorage.getItem(PERFORMANCE_MODE_KEY) || "fast";
  if (!["fast", "balanced", "quality"].includes(performanceMode)) performanceMode = "fast";

  stats = readJSON(STATS_KEY, {});
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) stats = {};

  const savedQueue = readJSON(QUEUE_KEY, []);
  downloadQueue = Array.isArray(savedQueue)
    ? savedQueue.filter((item) => item && MODELS[item.modelKey])
    : [];
  for (const item of downloadQueue) {
    if (item.status === "running") item.status = "interrupted";
  }

  const savedFiles = readJSON(FILES_KEY, null);
  if (savedFiles && Array.isArray(savedFiles.files)) {
    downloadFilesModelKey = MODELS[savedFiles.modelKey] ? savedFiles.modelKey : selectedModel;
    const heading = $(".file-list-heading strong");
    if (heading) heading.textContent = "Fichiers · " + (MODELS[downloadFilesModelKey]?.name || "Modèle IA");
    downloadFiles = savedFiles.files.map((file) => ({
      ...file,
      status: ["downloading", "preparing"].includes(file.status) ? "interrupted" : file.status
    }));
  }

  const savedHistory = readJSON(STORAGE_KEY, []);
  history = Array.isArray(savedHistory)
    ? savedHistory.filter((item) =>
      item && ["user", "assistant"].includes(item.role) && typeof item.content === "string"
    ).slice(-40)
    : [];

  $("#modelSelect").value = selectedModel;
  $("#responseLengthSelect").value = responseLength;
  $("#performanceModeSelect").value = performanceMode;
  setModelDescription();
  renderQueue();
  renderFileList();
  renderHistory();
  updateCounter();
  warmKnowledgeIndex();
  updateGenerationControls(false);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      $("#modelHint").textContent = "Le cache hors connexion n’a pas pu être préparé : " +
        (error.message || String(error));
    });
  }
}

$("#loadModelButton").addEventListener("click", ensureWorker);
$("#cancelDownloadButton").addEventListener("click", cancelDownload);
$("#modelSelect").addEventListener("change", changeModel);
$("#responseLengthSelect").addEventListener("change", changeResponseLength);
$("#performanceModeSelect").addEventListener("change", changePerformanceMode);
$("#clearModelCacheButton").addEventListener("click", clearModelCache);
$("#queueModelButton").addEventListener("click", addQueueItem);
$("#startQueueButton").addEventListener("click", startQueue);
$("#pauseQueueButton").addEventListener("click", pauseQueue);
$("#clearQueueButton").addEventListener("click", clearQueue);
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
  currentSources = [];
  saveHistory();
  renderHistory();
});

initializeApp();