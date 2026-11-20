import test from "node:test";
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
  assert.match(getSmallTalkReply("wesh sava") || "", /SUN/);
});

test("SUN répond à une conversation courante sans modèle", () => {
  assert.match(getSmallTalkReply("je vais bien et toi") || "", /Tant mieux/);
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
