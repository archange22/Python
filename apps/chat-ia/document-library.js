const DATABASE_NAME = "academique-sun-documents";
const DATABASE_VERSION = 1;
const STORE_NAME = "documents";
const LIBRARY_VERSION_KEY = "academique-sun-document-library-version-v1";

export const PDFJS_VERSION = "6.5.438";
export const MAX_PDF_SIZE_BYTES = 12 * 1024 * 1024;
export const MAX_PDF_PAGES = 120;
export const MAX_EXTRACTED_CHARACTERS = 160000;
export const MAX_DOCUMENTS = 20;
export const MAX_LIBRARY_CHARACTERS = 2000000;

function openDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Le stockage local sécurisé n’est pas disponible dans ce navigateur."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Ouverture de la bibliothèque impossible."));
    request.onblocked = () => reject(new Error("La bibliothèque est utilisée dans un autre onglet. Ferme les autres onglets SUN puis réessaie."));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Opération de bibliothèque impossible."));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Écriture locale impossible."));
    transaction.onabort = () => reject(transaction.error || new Error("Écriture locale annulée."));
  });
}

export function getDocumentLibraryVersion() {
  try {
    return localStorage.getItem(LIBRARY_VERSION_KEY) || "0";
  } catch (error) {
    return "0";
  }
}

function bumpDocumentLibraryVersion() {
  try {
    localStorage.setItem(LIBRARY_VERSION_KEY, String(Date.now()));
  } catch (error) {
    // IndexedDB remains the source of truth if localStorage is unavailable.
  }
}

async function loadPdfJs() {
  const moduleUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@" +
    PDFJS_VERSION + "/build/pdf.min.mjs";
  const workerUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@" +
    PDFJS_VERSION + "/build/pdf.worker.min.mjs";
  const pdfjs = await import(moduleUrl);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

export function validatePdfFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Sélectionne un fichier PDF valide.");
  }
  if (!/\.pdf$/i.test(String(file.name || ""))) {
    throw new Error("Seuls les fichiers avec l’extension .pdf sont acceptés.");
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error("Le fichier PDF est vide ou sa taille est inconnue.");
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("Ce PDF dépasse la limite locale de 12 Mo. Réduis sa taille ou importe-le en plusieurs parties.");
  }
}

function extractPageText(items) {
  const lines = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (typeof item?.str !== "string" || !item.str) continue;
    lines.push(item.str + (item.hasEOL ? "\n" : " "));
  }
  return lines.join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeDocumentId(file, content) {
  const fallback = Date.now().toString(36) + "-" +
    Math.random().toString(36).slice(2, 10);
  return "pdf-" + fallback;
}

export async function extractPdfDocument(file, options = {}) {
  validatePdfFile(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = new TextDecoder().decode(bytes.slice(0, 1024));
  if (!header.includes("%PDF-")) {
    throw new Error("Le fichier sélectionné ne semble pas être un PDF valide.");
  }

  const pdfjsLoader = options.pdfjsLoader || loadPdfJs;
  const pdfjs = await pdfjsLoader();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useWorkerFetch: false
  });

  let pdf;
  try {
    pdf = await loadingTask.promise;
    const totalPages = Number(pdf.numPages) || 0;
    if (totalPages < 1) throw new Error("Ce PDF ne contient aucune page lisible.");

    const pageLimit = Math.min(totalPages, MAX_PDF_PAGES);
    const pages = [];
    let totalCharacters = 0;

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = extractPageText(textContent.items);
      if (!text) continue;

      const available = MAX_EXTRACTED_CHARACTERS - totalCharacters;
      if (available <= 0) break;
      const pageText = text.slice(0, available);
      pages.push({ page: pageNumber, text: pageText });
      totalCharacters += pageText.length;
      if (pageText.length < text.length) break;
    }

    if (!pages.length) {
      throw new Error("Aucun texte sélectionnable n’a été trouvé. Ce PDF est peut-être un scan ou une image ; l’OCR des PDF scannés n’est pas encore activé.");
    }

    const markdown = [
      "# " + String(file.name).replace(/\.pdf$/i, ""),
      "",
      "Document PDF importé localement dans SUN. Texte extrait avec PDF.js.",
      "",
      ...pages.flatMap((page) => ["## Page " + page.page, "", page.text, ""])
    ].join("\n").trim();

    return {
      id: makeDocumentId(file, markdown),
      name: String(file.name).slice(0, 180),
      mimeType: "application/pdf",
      size: file.size,
      totalPages,
      extractedPages: pages.length,
      truncated: totalPages > pageLimit || totalCharacters >= MAX_EXTRACTED_CHARACTERS,
      characterCount: totalCharacters,
      importedAt: new Date().toISOString(),
      storage: "indexeddb-local-only",
      content: markdown
    };
  } finally {
    try { await pdf?.destroy?.(); } catch (error) {}
  }
}

export async function saveImportedDocument(document) {
  if (!document || !document.id || typeof document.content !== "string") {
    throw new Error("Le document extrait est incomplet.");
  }

  const existing = await listImportedDocuments();
  const previous = existing.find((item) => item.id === document.id);
  const totalCharacters = existing.reduce((sum, item) =>
    sum + (item.id === document.id ? 0 : item.characterCount || 0), 0
  );

  if (!previous && existing.length >= MAX_DOCUMENTS) {
    throw new Error("La bibliothèque contient déjà 20 PDF. Supprime un document avant d’en ajouter un autre.");
  }
  if (totalCharacters + document.characterCount > MAX_LIBRARY_CHARACTERS) {
    throw new Error("La bibliothèque locale atteindrait sa limite de 2 millions de caractères. Supprime d’abord des documents.");
  }

  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(document);
    await transactionDone(transaction);
    bumpDocumentLibraryVersion();
  } finally {
    database.close();
  }
  return document;
}

export async function importPdfFile(file, options = {}) {
  const document = await extractPdfDocument(file, options);
  return saveImportedDocument(document);
}

export async function listImportedDocuments() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const result = await requestResult(transaction.objectStore(STORE_NAME).getAll());
    return (Array.isArray(result) ? result : [])
      .sort((left, right) => String(right.importedAt).localeCompare(String(left.importedAt)));
  } finally {
    database.close();
  }
}

export async function deleteImportedDocument(id) {
  if (!id) return false;
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(String(id));
    await transactionDone(transaction);
    bumpDocumentLibraryVersion();
    return true;
  } finally {
    database.close();
  }
}
