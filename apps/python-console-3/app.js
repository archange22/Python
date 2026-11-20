const PYODIDE_VERSION = "314.0.8";
const STORAGE_KEY = "academique-python-console-v1";
const DEFAULT_CODE = 'nom = input("Comment tu t\\'appelles ? ")\\nprint("Bonjour", nom)\\nprint("Bienvenue dans Python 3 !")\\n\\nfor nombre in range(1, 4):\\n    print("Étape", nombre)';
const $ = (selector) => document.querySelector(selector);

const editor = $("#codeEditor");
const output = $("#terminalOutput");
const runButton = $("#runButton");
const stopButton = $("#stopButton");
const prepareButton = $("#prepareButton");
const stdinForm = $("#stdinForm");
const stdinValue = $("#stdinValue");
let worker = null;
let runtimeReady = false;
let isRunning = false;
let activeInputId = null;

function setStatus(message, kind = "loading") {
  $("#runtimeStatus").textContent = message;
  $("#statusDot").className = "status-dot" + (kind === "ready" ? " ready" : kind === "error" ? " error" : "");
}

function setExecution(message) {
  $("#executionState").textContent = message;
}

function addLine(text, kind = "normal") {
  const line = document.createElement("div");
  line.className = "terminal-line" + (kind === "error" ? " error" : kind === "input" ? " input" : kind === "info" ? " info" : "");
  line.textContent = String(text);
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function updateCodeLength() {
  const count = editor.value.length;
  $("#codeLength").textContent = count + " caractère" + (count > 1 ? "s" : "");
}

function setBusy(value) {
  isRunning = value;
  runButton.disabled = !runtimeReady || value;
  stopButton.disabled = !value;
  prepareButton.disabled = value;
}

function destroyWorker(message) {
  if (worker) worker.terminate();
  worker = null;
  runtimeReady = false;
  activeInputId = null;
  stdinForm.hidden = true;
  runButton.disabled = true;
  stopButton.disabled = true;
  if (message) setStatus(message, "error");
}

async function createWorker() {
  if (worker) return;
  setStatus("Chargement du moteur Python 3…");
  addLine("Initialisation du moteur Python WebAssembly. La première ouverture nécessite Internet.", "info");

  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("./sw.js");
      await navigator.serviceWorker.ready;
    }
    worker = new Worker("./python.worker.js", { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", (event) => {
      addLine("Erreur du moteur : " + (event.message || "échec du Worker."), "error");
      destroyWorker("Le moteur Python n’a pas pu démarrer.");
    });
    worker.postMessage({ type: "boot" });
  } catch (error) {
    destroyWorker("Impossible de préparer le moteur Python.");
    addLine(error.message || String(error), "error");
  }
}

function handleWorkerMessage(event) {
  const data = event.data || {};
  if (data.type === "status") {
    setStatus(data.message || "Chargement du moteur…");
  } else if (data.type === "ready") {
    runtimeReady = true;
    runButton.disabled = isRunning;
    setStatus("Python " + data.version + " prêt · moteur mis en cache", "ready");
    addLine("Python " + data.version + " est prêt. La bibliothèque standard peut être utilisée hors connexion.", "info");
    setExecution("En attente");
    prepareButton.textContent = "Moteur préparé";
  } else if (data.type === "output") {
    addLine(data.text);
  } else if (data.type === "stderr") {
    addLine(data.text, "error");
  } else if (data.type === "input") {
    activeInputId = data.id;
    $("#stdinPrompt").textContent = data.prompt || "Python attend une valeur :";
    stdinForm.hidden = false;
    stdinValue.value = "";
    stdinValue.focus();
    setExecution("Entrée attendue");
  } else if (data.type === "done") {
    setBusy(false);
    stdinForm.hidden = true;
    setExecution("Terminé");
    addLine("— exécution terminée —", "info");
  } else if (data.type === "run-error") {
    setBusy(false);
    stdinForm.hidden = true;
    setExecution("Erreur");
    addLine(data.message || "Erreur Python.", "error");
  } else if (data.type === "boot-error") {
    destroyWorker("Moteur indisponible. Une connexion peut être nécessaire pour le premier téléchargement.");
    addLine(data.message || "Le téléchargement du moteur Python a échoué.", "error");
  } else if (data.type === "package-warning") {
    addLine(data.message, "info");
  }
}

async function runCode() {
  const code = editor.value.trim();
  if (!code) {
    addLine("Écris du code avant de lancer le programme.", "info");
    return;
  }
  if (!worker || !runtimeReady) {
    await createWorker();
    addLine("Le moteur démarre. Appuie de nouveau sur Exécuter lorsqu’il est prêt.", "info");
    return;
  }
  output.querySelector(".terminal-welcome")?.remove();
  addLine(">>> Exécution du script", "input");
  setBusy(true);
  setExecution("Exécution…");
  worker.postMessage({ type: "run", code });
  try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (error) {}
}

function answerInput(event) {
  event.preventDefault();
  if (!worker || !activeInputId) return;
  const value = stdinValue.value;
  addLine(value, "input");
  worker.postMessage({ type: "stdin-response", id: activeInputId, value });
  activeInputId = null;
  stdinForm.hidden = true;
  setExecution("Reprise du programme…");
}

function stopExecution() {
  if (!isRunning) return;
  destroyWorker("Exécution arrêtée. Le moteur sera relancé au prochain lancement.");
  setBusy(false);
  setExecution("Arrêté");
  addLine("Exécution interrompue. Les variables de cette session ont été réinitialisées.", "info");
}

function resetRuntime() {
  if (worker) worker.terminate();
  worker = null;
  runtimeReady = false;
  isRunning = false;
  activeInputId = null;
  stdinForm.hidden = true;
  output.textContent = "";
  setExecution("Réinitialisation");
  setStatus("Moteur arrêté. Préparation au prochain lancement.");
  runButton.disabled = true;
  stopButton.disabled = true;
  prepareButton.disabled = false;
  addLine("La mémoire Python a été réinitialisée.", "info");
}

editor.addEventListener("input", updateCodeLength);
editor.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    runCode();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText("    ", start, end, "end");
  }
});

runButton.addEventListener("click", runCode);
prepareButton.addEventListener("click", createWorker);
stopButton.addEventListener("click", stopExecution);
$("#clearButton").addEventListener("click", () => {
  output.textContent = "";
  addLine("Terminal effacé.", "info");
});
$("#resetButton").addEventListener("click", resetRuntime);
$("#sampleButton").addEventListener("click", () => {
  editor.value = DEFAULT_CODE;
  updateCodeLength();
  editor.focus();
});
stdinForm.addEventListener("submit", answerInput);

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) editor.value = saved;
} catch (error) {}
updateCodeLength();
setBusy(false);
createWorker();
