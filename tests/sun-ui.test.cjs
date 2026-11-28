"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const brain = read("sun-brain.js");
const ui = read("sun-ia.js");
const css = read("sun-ia.css");
const sw = read("sw.js");

test("Les scripts JavaScript de Sun et de l'application sont syntaxiquement valides", () => {
  for (const file of ["sun-brain.js", "sun-ia.js", "app.js"]) {
    assert.doesNotThrow(() => new Function(read(file)), file + " doit être analysable");
  }
});

test("Chaque leçon réellement présente est indexée et mise en cache hors connexion", () => {
  const tracks = ["ia", "python", "discord", "web"];
  const courseFiles = tracks.flatMap(track =>
    fs.readdirSync(path.join(ROOT, "courses", track))
      .filter(file => /^lesson-\d+\.md$/.test(file))
      .map(file => "courses/" + track + "/" + file)
  );

  assert.ok(courseFiles.length >= 23, "Le corpus de cours doit contenir au moins 23 leçons.");
  courseFiles.forEach(file => {
    assert.ok(brain.includes(JSON.stringify(file)), "Leçon absente de l'index de Sun : " + file);
    assert.ok(sw.includes(JSON.stringify("./" + file)), "Leçon absente du cache hors connexion : " + file);
  });
});

test("Le style ne contient plus de séquences d'échappement CSS invalides", () => {
  assert.doesNotMatch(css, /\\n/, "Un antislash-n littéral ne doit pas séparer des sélecteurs CSS.");
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const opened = (withoutComments.match(/\{/g) || []).length;
  const closed = (withoutComments.match(/\}/g) || []).length;
  assert.equal(opened, closed, "Les blocs CSS doivent être correctement refermés.");
  assert.match(css, /@media \(max-width: 700px\)/);
});

test("Les réponses affichent le code, les sources et échappent le contenu", () => {
  assert.match(ui, /function richMessageContent/);
  assert.match(ui, /escapeHtml\(code\)/);
  assert.match(ui, /sun-source-citations/);
  assert.match(ui, /data-sun-action="copy-code"/);
  assert.match(ui, /navigator\.clipboard/);
  assert.doesNotMatch(ui, /knowledge\/pdfs\/sun-discussion-global-v0\.0\.2\.pdf/,
    "L'accueil ne doit pas présenter un lien vers un PDF qui n'est pas garanti.");
});

test("Le Service Worker utilise le cache actualisé", () => {
  assert.match(sw, /academique-shell-v24/);
  assert.match(sw, /knowledge\/catalog\.json/);
});
test("L'interface Sun 0.0.3 propose une recherche d'historique et des actions sur les réponses", () => {
  assert.match(ui, /sunHistorySearch/);
  assert.match(ui, /copy-message/);
  assert.match(ui, /Copier la réponse/);
  assert.match(ui, /composerDraft/);
  assert.match(ui, /analyzeQuestion/);
  assert.match(ui, /chat\\.messages\\.slice\\(-12\\)/, "Le moteur reçoit plusieurs tours récents pour préserver le contexte.");
  assert.match(css, /sun-history-search-wrap/);
  assert.match(css, /sun-message-actions/);
  assert.match(css, /sun-thinking-pulse/);
});
