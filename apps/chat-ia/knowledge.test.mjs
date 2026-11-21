import test from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { buildSearchIndex, searchKnowledge, tokenize } from "./knowledge.js";
import { appendSourceReferences, getSmallTalkReply } from "./conversation.js";

const index = buildSearchIndex([
  {
    id: "python-01",
    subject: "Python Facile",
    title: "Découvrir Python",
    lessonNumber: "01",
    content: "# Leçon 01 — Découvrir Python\n\n## Afficher avec print()\n\nLa fonction print() affiche du texte ou le résultat d’un calcul dans la console.",
    label: "Python Facile — Leçon 01"
  },
  {
    id: "python-02",
    subject: "Python Facile",
    title: "Les variables",
    lessonNumber: "02",
    content: "# Leçon 02 — Les variables\n\n## Stocker une valeur\n\nUne variable permet de conserver une valeur dans un programme.",
    label: "Python Facile — Leçon 02"
  }
]);

test("SUN comprend les salutations et abréviations sans modèle", () => {
  assert.match(getSmallTalkReply("Bonjour") || "", /SUN/);
  assert.match(getSmallTalkReply("slt cv ?") || "", /fonctionne correctement/);
  assert.match(getSmallTalkReply("ça va ?") || "", /fonctionne correctement/);
  assert.match(getSmallTalkReply("wesh sava") || "", /fonctionne correctement/);
});

test("SUN répond à une conversation courante sans modèle", () => {
  assert.match(getSmallTalkReply("je vais bien et toi") || "", /Tant mieux/);
  assert.match(getSmallTalkReply("et toi") || "", /fonctionne correctement/);
  assert.match(getSmallTalkReply("tu fais quoi") || "", /discuter/);
  assert.match(getSmallTalkReply("on peut discuter") || "", /Oui/);
  assert.match(getSmallTalkReply("tu peux fonctionner sans modèle") || "", /Oui/);
});

test("un suivi bref tient compte du contexte précédent", () => {
  assert.match(
    getSmallTalkReply("oui", [{ role: "assistant", content: "Et toi, comment ça va ?" }]) || "",
    /Pas de souci|Très bien/
  );
});

test("une question de cours n'est pas traitée comme une simple salutation", () => {
  assert.equal(getSmallTalkReply("Bonjour, explique-moi les variables en Python."), null);
});

test("la recherche retrouve la bonne leçon et sa section", () => {
  const results = searchKnowledge(index, "à quoi sert print pour afficher du texte ?");
  assert.equal(results[0]?.label, "Python Facile — Leçon 01");
  assert.match(results[0]?.section || "", /print/i);
});

test("la recherche tolère une petite faute de frappe", () => {
  const results = searchKnowledge(index, "a quoi sert pritn pour afficher");
  assert.equal(results[0]?.label, "Python Facile — Leçon 01");
});

test("une demande avec seulement le numéro de leçon trouve ses passages", () => {
  const results = searchKnowledge(index, "leçon 02");
  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.lessonNumber === "02"));
});

test("une demande explicite de numéro de leçon filtre les résultats", () => {
  const results = searchKnowledge(index, "leçon numéro 02 variable");
  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.lessonNumber === "02"));
});

test("les accents sont normalisés pour la recherche", () => {
  assert.deepEqual(tokenize("Écrire des nombres et des chaînes"), ["ecrire", "nombres", "chaines"]);
});

test("la réponse ajoute une référence précise", () => {
  const result = appendSourceReferences("print() affiche un message.", [{
    label: "Python Facile — Leçon 01",
    section: "Afficher avec print()"
  }]);
  assert.match(result, /Python Facile — Leçon 01/);
  assert.match(result, /Afficher avec print/);
});

test("le champ de discussion reste actif sans modèle et après le téléchargement", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
  const textarea = html.match(/<textarea[^>]*id="messageInput"[^>]*>/)?.[0] || "";
  const sendButton = html.match(/<button[^>]*id="sendButton"[^>]*>/)?.[0] || "";
  assert.ok(textarea);
  assert.ok(sendButton);
  assert.doesNotMatch(textarea, /\bdisabled\b/);
  assert.doesNotMatch(sendButton, /\bdisabled\b/);
  assert.match(app, /function handleQueueReady\(\)[\s\S]*?updateGenerationControls\(false\)/);
  assert.match(app, /function initializeApp\(\)[\s\S]*?updateGenerationControls\(false\)/);
});

test("l’interface indique que le modèle est facultatif", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.match(html, /SUN prêt · modèle optionnel/);
  assert.match(html, /Charger pour réponses avancées/);
  assert.match(html, /SUN est prêt sans modèle/);
});


test("le catalogue inclut la bibliothèque Python, l'IA et les dialogues", () => {
  const catalog = JSON.parse(readFileSync(
    new URL("../../courses/catalog.json", import.meta.url), "utf8"
  ));
  const subjects = new Map(catalog.subjects.map((subject) => [subject.id, subject]));
  assert.ok(subjects.has("python"));
  assert.ok(subjects.has("ia"));
  assert.ok(subjects.has("conversation"));

  const contentPaths = [
    "./python/guide-expert.md",
    "./python/atelier-exercices.md",
    "./ia/methodes-apprentissage.md",
    "./ia/bibliotheque-ressources.md",
    "./conversation/dialogues-reference.md"
  ];
  for (const contentPath of contentPaths) {
    const fileUrl = new URL(contentPath, new URL("../../courses/catalog.json", import.meta.url));
    assert.ok(readFileSync(fileUrl, "utf8").length > 500, contentPath + " doit être indexable");
  }
});

test("la bibliothèque permet de retrouver des notions Python avancées et des méthodes IA", () => {
  const pythonGuide = readFileSync(
    new URL("../../courses/python/guide-expert.md", import.meta.url), "utf8"
  );
  const aiGuide = readFileSync(
    new URL("../../courses/ia/methodes-apprentissage.md", import.meta.url), "utf8"
  );
  const expanded = buildSearchIndex([
    { id: "python05", subject: "Python", title: "Python expert", lessonNumber: "05", content: pythonGuide },
    { id: "ia02", subject: "Intelligence artificielle", title: "Méthodes IA", lessonNumber: "02", content: aiGuide }
  ]);
  const pythonResults = searchKnowledge(expanded, "générateurs décorateurs context managers asyncio");
  const aiResults = searchKnowledge(expanded, "LoRA fine tuning SFT RAG embeddings");
  assert.equal(pythonResults[0]?.id, "python05");
  assert.equal(aiResults[0]?.id, "ia02");
});
