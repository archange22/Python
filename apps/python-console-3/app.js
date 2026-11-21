const STORAGE_KEY = "academique-python-console-v2";
const LEGACY_STORAGE_KEY = "academique-python-console-v1";
const FILE_NAME_KEY = "academique-python-console-filename-v1";
const DEFAULT_CODE = "nom = input(\"Ton prénom ? \")\nprint(\"Bonjour\", nom)\nprint(\"Bienvenue dans Python 3 !\")\n\nfor nombre in range(1, 4):\n    print(\"Étape\", nombre)";
const MAX_TERMINAL_LINES = 1500;
const MAX_FILE_SIZE = 1024 * 1024;
const $ = (selector) => document.querySelector(selector);

const editor = $("#codeEditor");
const output = $("#terminalOutput");
const runButton = $("#runButton");
const stopButton = $("#stopButton");
const prepareButton = $("#prepareButton");
const stdinForm = $("#stdinForm");
const stdinValue = $("#stdinValue");
const lineNumbers = $("#lineNumbers");
const fileInput = $("#fileInput");

let worker = null;
let bootPromise = null;
let runtimeReady = false;
let isRunning = false;
let activeInputId = null;
let pendingCode = null;
let currentFileName = "main.py";
let startedAt = 0;
let saveTimer = null;

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

  while (output.children.length > MAX_TERMINAL_LINES) {
    output.firstElementChild.remove();
  }
  output.scrollTop = output.scrollHeight;
}

function updateEditorMeta() {
  const count = editor.value.length;
  const lines = editor.value.split("\n").length;
  $("#codeLength").textContent = count + " caractères · " + lines + (lines > 1 ? " lignes" : " ligne");
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => String(index + 1)).join("\n");
  lineNumbers.scrollTop = editor.scrollTop;
}

function setFileName(name) {
  const safeName = String(name || "main.py").split(/[\\/]/).pop().slice(0, 100);
  currentFileName = safeName.toLowerCase().endsWith(".py") ? safeName : safeName + ".py";
  $("#fileName").textContent = currentFileName;
  try {
    localStorage.setItem(FILE_NAME_KEY, currentFileName);
  } catch (error) {
    // Le nom du fichier reste disponible dans la session même si le stockage est plein.
  }
}

function saveEditor(showStatus = false) {
  try {
    localStorage.setItem(STORAGE_KEY, editor.value);
    localStorage.setItem(FILE_NAME_KEY, currentFileName);
    if (showStatus) setExecution("Code enregistré sur cet appareil");
  } catch (error) {
    addLine("Impossible d’enregistrer le code : le stockage local est peut-être plein.", "error");
  }
}

function scheduleSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveEditor, 350);
}

function setBusy(value) {
  isRunning = value;
  runButton.disabled = !runtimeReady || value;
  stopButton.disabled = !value;
  prepareButton.disabled = runtimeReady || value || Boolean(worker) || Boolean(bootPromise);
}

function destroyWorker() {
  if (worker) worker.terminate();
  worker = null;
  runtimeReady = false;
  activeInputId = null;
  stdinForm.hidden = true;
  setBusy(false);
  prepareButton.disabled = false;
  prepareButton.textContent = "Préparer hors ligne";
}

async function createWorker() {
  if (runtimeReady || worker) return;
  if (bootPromise) return bootPromise;

  setStatus("Chargement du moteur Python 3…");
  prepareButton.disabled = true;
  prepareButton.textContent = "Préparation…";
  addLine("Initialisation de Python WebAssembly. Le premier chargement nécessite Internet.", "info");

  bootPromise = (async () => {
    if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
      throw new Error("Ce navigateur ne prend pas en charge les fonctionnalités nécessaires à Python WebAssembly.");
    }

    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("./sw.js");
      } catch (error) {
        addLine("Le cache hors connexion n’a pas pu être activé dans ce navigateur.", "info");
      }
    }

    worker = new Worker("./python.worker.js", { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", (event) => {
      addLine("Erreur du moteur : " + (event.message || "échec du Worker."), "error");
      destroyWorker();
      setStatus("Le moteur Python n’a pas pu démarrer.", "error");
    });
    worker.postMessage({ type: "boot" });
  })().catch((error) => {
    destroyWorker();
    setStatus("Impossible de préparer le moteur Python.", "error");
    addLine(error && error.message ? error.message : String(error), "error");
  }).finally(() => {
    bootPromise = null;
    if (!runtimeReady && !worker && !isRunning) {
      prepareButton.disabled = false;
      prepareButton.textContent = "Réessayer";
    } else if (worker && !runtimeReady) {
      prepareButton.disabled = true;
      prepareButton.textContent = "Téléchargement…";
    }
  });

  return bootPromise;
}

function formatDuration(milliseconds) {
  const seconds = milliseconds / 1000;
  return seconds < 1 ? Math.round(milliseconds) + " ms" : seconds.toFixed(2) + " s";
}

function dispatchRun(code) {
  if (!worker || !runtimeReady || isRunning) return;
  output.querySelector(".terminal-welcome")?.remove();
  addLine(">>> Exécution de " + currentFileName, "input");
  setBusy(true);
  startedAt = performance.now();
  setExecution("Exécution…");

  try {
    worker.postMessage({ type: "run", code });
    saveEditor();
  } catch (error) {
    setBusy(false);
    setExecution("Erreur d’envoi");
    addLine(error && error.message ? error.message : String(error), "error");
  }
}

function handleWorkerMessage(event) {
  const data = event.data || {};

  if (data.type === "status") {
    setStatus(data.message || "Chargement du moteur…");
  } else if (data.type === "ready") {
    runtimeReady = true;
    runButton.disabled = isRunning;
    prepareButton.disabled = true;
    prepareButton.textContent = "Moteur préparé";
    setStatus("Python " + data.version + " prêt · moteur mis en cache", "ready");
    addLine("Python " + data.version + " est prêt. Tu peux exécuter tes programmes.", "info");
    setExecution("En attente");

    if (pendingCode !== null) {
      const code = pendingCode;
      pendingCode = null;
      dispatchRun(code);
    }
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
    setExecution("Terminé en " + formatDuration(performance.now() - startedAt));
    addLine("— exécution terminée —", "info");
  } else if (data.type === "run-error") {
    setBusy(false);
    stdinForm.hidden = true;
    setExecution("Erreur · " + formatDuration(performance.now() - startedAt));
    addLine(data.message || "Erreur Python.", "error");
  } else if (data.type === "boot-error") {
    destroyWorker();
    setStatus("Moteur indisponible. Une connexion peut être nécessaire au premier téléchargement.", "error");
    addLine(data.message || "Le téléchargement du moteur Python a échoué.", "error");
    pendingCode = null;
  } else if (data.type === "package-warning") {
    addLine(data.message, "info");
  }
}

async function runCode() {
  const code = editor.value;
  if (!code.trim()) {
    addLine("Écris du code avant de lancer le programme.", "info");
    return;
  }
  if (code.length > 200000) {
    addLine("Ce programme est trop volumineux pour être envoyé à la console (maximum : 200 000 caractères).", "error");
    return;
  }
  if (isRunning) {
    addLine("Un programme est déjà en cours d’exécution. Arrête-le avant d’en lancer un autre.", "info");
    return;
  }

  if (!runtimeReady || !worker) {
    const alreadyQueued = pendingCode !== null;
    pendingCode = code;
    if (!alreadyQueued) addLine("Ton programme sera lancé automatiquement dès que Python sera prêt.", "info");
    await createWorker();
    return;
  }

  dispatchRun(code);
}

function answerInput(event) {
  event.preventDefault();
  if (!worker || activeInputId === null) return;

  const value = stdinValue.value;
  addLine(value, "input");
  worker.postMessage({ type: "stdin-response", id: activeInputId, value });
  activeInputId = null;
  stdinForm.hidden = true;
  setExecution("Reprise du programme…");
}

function stopExecution() {
  if (!isRunning) return;
  destroyWorker();
  setStatus("Exécution arrêtée. Python sera relancé au prochain lancement.", "error");
  setExecution("Arrêté");
  addLine("Exécution interrompue. La mémoire de cette session Python a été réinitialisée.", "info");
}

function resetRuntime() {
  destroyWorker();
  pendingCode = null;
  output.textContent = "";
  setExecution("Moteur arrêté");
  setStatus("Moteur arrêté. Prépare Python pour recommencer.");
  addLine("La mémoire Python a été réinitialisée. Ton code est conservé dans l’éditeur.", "info");
  createWorker();
}

function insertText(text, selectionStart, selectionEnd, cursorOffset = null) {
  editor.setRangeText(text, selectionStart, selectionEnd, "end");
  if (cursorOffset !== null) {
    const position = selectionStart + cursorOffset;
    editor.setSelectionRange(position, position);
  }
  updateEditorMeta();
  scheduleSave();
}

function indentSelection(outdent = false) {
  const value = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const firstLineStart = value.lastIndexOf("\n", start - 1) + 1;

  if (start === end) {
    const lineEnd = value.indexOf("\n", start);
    const endOfLine = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(firstLineStart, endOfLine);
    const indent = (line.match(/^\s*/) || [""])[0];
    if (outdent) {
      const remove = indent.endsWith("\t") ? 1 : Math.min(4, indent.length);
      if (remove) editor.setRangeText("", firstLineStart, firstLineStart + remove, "end");
      const position = Math.max(firstLineStart, start - remove);
      editor.setSelectionRange(position, position);
    } else {
      insertText("    ", start, end, 4);
      return;
    }
    updateEditorMeta();
    scheduleSave();
    return;
  }

  const finalLineEndIndex = value.indexOf("\n", Math.max(start, end - 1));
  const finalLineEnd = finalLineEndIndex === -1 ? value.length : finalLineEndIndex;
  const block = value.slice(firstLineStart, finalLineEnd);
  const lines = block.split("\n");
  const adjusted = lines.map((line) => {
    if (!outdent) return "    " + line;
    if (line.startsWith("\t")) return line.slice(1);
    return line.replace(/^ {1,4}/, "");
  }).join("\n");

  editor.setRangeText(adjusted, firstLineStart, finalLineEnd, "select");
  editor.setSelectionRange(firstLineStart, firstLineStart + adjusted.length);
  updateEditorMeta();
  scheduleSave();
}

function toggleComment() {
  const value = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const firstLineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lastLineStart = value.lastIndexOf("\n", Math.max(start, end - 1)) + 1;
  const nextBreak = value.indexOf("\n", lastLineStart);
  const blockEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(firstLineStart, blockEnd);
  const lines = block.split("\n");
  const uncomment = lines.every((line) => !line.trim() || /^\s*#/.test(line));
  const changed = lines.map((line) => {
    if (!line.trim()) return line;
    return uncomment ? line.replace(/^(\s*)# ?/, "$1") : line.replace(/^(\s*)/, "$1# ");
  }).join("\n");

  editor.setRangeText(changed, firstLineStart, blockEnd, "select");
  editor.setSelectionRange(firstLineStart, firstLineStart + changed.length);
  updateEditorMeta();
  scheduleSave();
}

function handleEditorKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runCode();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveEditor(true);
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "/") {
    event.preventDefault();
    toggleComment();
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    indentSelection(event.shiftKey);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = editor.value.slice(lineStart, start);
    const indent = (currentLine.match(/^\s*/) || [""])[0];
    const extraIndent = /:\s*(#.*)?$/.test(currentLine) ? "    " : "";
    insertText("\n" + indent + extraIndent, start, end, 1 + indent.length + extraIndent.length);
    return;
  }

  const pairs = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
  const isModifierPressed = event.ctrlKey || event.metaKey || event.altKey;

  if ([")", "]", "}"].includes(event.key) && !isModifierPressed) {
    const start = editor.selectionStart;
    if (start === editor.selectionEnd && editor.value[start] === event.key) {
      event.preventDefault();
      editor.setSelectionRange(start + 1, start + 1);
      return;
    }
  }

  if (Object.prototype.hasOwnProperty.call(pairs, event.key) && !isModifierPressed) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    if ((event.key === "\"" || event.key === "'") && start === end && value[start] === event.key) {
      event.preventDefault();
      editor.setSelectionRange(start + 1, start + 1);
      return;
    }

    event.preventDefault();
    const selected = value.slice(start, end);
    editor.setRangeText(event.key + selected + pairs[event.key], start, end, "end");
    const cursor = start + 1 + selected.length;
    editor.setSelectionRange(cursor, cursor);
    updateEditorMeta();
    scheduleSave();
  }
}

function downloadCode() {
  const blob = new Blob([editor.value], { type: "text/x-python;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = currentFileName || "main.py";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setExecution("Fichier téléchargé");
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const temporary = document.createElement("textarea");
      temporary.value = text;
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("Copie non prise en charge.");
    }
    setExecution(successMessage);
  } catch (error) {
    addLine("La copie a échoué. Sélectionne le texte manuellement.", "error");
  }
}

async function openPythonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    addLine("Ce fichier dépasse la limite de 1 Mo.", "error");
    fileInput.value = "";
    return;
  }
  try {
    editor.value = await file.text();
    setFileName(file.name);
    updateEditorMeta();
    saveEditor();
    addLine("Fichier " + currentFileName + " ouvert.", "info");
  } catch (error) {
    addLine("Impossible de lire ce fichier.", "error");
  }
  fileInput.value = "";
}

editor.addEventListener("input", () => {
  updateEditorMeta();
  scheduleSave();
});
editor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editor.scrollTop;
});
editor.addEventListener("keydown", handleEditorKeydown);

runButton.addEventListener("click", runCode);
prepareButton.addEventListener("click", createWorker);
stopButton.addEventListener("click", stopExecution);
$("#clearButton").addEventListener("click", () => {
  output.textContent = "";
  addLine("Terminal effacé.", "info");
});
$("#copyOutputButton").addEventListener("click", () => copyText(output.innerText || output.textContent || "", "Sortie copiée"));
$("#resetButton").addEventListener("click", resetRuntime);
$("#sampleButton").addEventListener("click", () => {
  editor.value = DEFAULT_CODE;
  setFileName("main.py");
  updateEditorMeta();
  scheduleSave();
  editor.focus();
});
$("#openFileButton").addEventListener("click", () => fileInput.click());
$("#downloadButton").addEventListener("click", downloadCode);
fileInput.addEventListener("change", openPythonFile);
stdinForm.addEventListener("submit", answerInput);
window.addEventListener("pagehide", saveEditor);

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  const legacySaved = saved === null ? localStorage.getItem(LEGACY_STORAGE_KEY) : null;
  const savedName = localStorage.getItem(FILE_NAME_KEY);
  if (saved !== null) editor.value = saved;
  else if (legacySaved !== null) editor.value = legacySaved;
  if (savedName) setFileName(savedName);
} catch (error) {
  addLine("Le stockage local est indisponible. Le code ne sera pas conservé après fermeture.", "info");
}

updateEditorMeta();
setBusy(false);
createWorker();
