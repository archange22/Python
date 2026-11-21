import test from "node:test";
import assert from "node:assert/strict";
import {
  extractPdfDocument,
  validatePdfFile,
  MAX_PDF_SIZE_BYTES
} from "./document-library.js";

function mockPdfFile(name = "cours.pdf", content = "%PDF-1.7\n") {
  const bytes = new TextEncoder().encode(content);
  return {
    name,
    type: "application/pdf",
    size: bytes.length,
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    )
  };
}

test("le lecteur refuse les fichiers qui ne sont pas des PDF", () => {
  assert.throws(() => validatePdfFile(mockPdfFile("cours.txt")), /extension \.pdf/);
  assert.throws(() => validatePdfFile(mockPdfFile("vide.pdf", "")), /vide|valide/i);
});

test("le lecteur applique la limite de taille avant extraction", () => {
  const file = {
    name: "trop-grand.pdf",
    size: MAX_PDF_SIZE_BYTES + 1,
    arrayBuffer: async () => new ArrayBuffer(0)
  };
  assert.throws(() => validatePdfFile(file), /12 Mo/);
});

test("le lecteur extrait les textes par page avec un extracteur PDF simulé", async () => {
  const file = mockPdfFile("python.pdf");
  const fakePdfjs = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 2,
        getPage: async (number) => ({
          getTextContent: async () => ({
            items: [
              { str: number === 1 ? "Les variables Python" : "Les fonctions Python", hasEOL: true },
              { str: number === 1 ? "Une variable conserve une valeur." : "Une fonction utilise def.", hasEOL: false }
            ]
          })
        }),
        destroy: async () => {}
      })
    })
  };

  const result = await extractPdfDocument(file, {
    pdfjsLoader: async () => fakePdfjs
  });
  assert.equal(result.totalPages, 2);
  assert.equal(result.extractedPages, 2);
  assert.match(result.content, /## Page 1/);
  assert.match(result.content, /## Page 2/);
  assert.match(result.content, /Les variables Python/);
  assert.equal(result.storage, "indexeddb-local-only");
});

test("un PDF sans texte sélectionnable reçoit un message explicite sur l'OCR", async () => {
  const file = mockPdfFile("scan.pdf");
  const fakePdfjs = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({ items: [] })
        }),
        destroy: async () => {}
      })
    })
  };
  await assert.rejects(
    extractPdfDocument(file, { pdfjsLoader: async () => fakePdfjs }),
    /scanné|OCR/i
  );
});

test("un fichier avec une extension PDF mais sans signature PDF est rejeté", async () => {
  const file = mockPdfFile("faux.pdf", "Ceci n'est pas un PDF");
  await assert.rejects(
    extractPdfDocument(file, { pdfjsLoader: async () => { throw new Error("Ne devrait pas charger"); } }),
    /PDF valide/
  );
});
