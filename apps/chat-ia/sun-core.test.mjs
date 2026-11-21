import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSunMessages,
  cleanSunOutput,
  getSunGenerationOptions,
  getSunRuntimePlan
} from "./sun-core.js";

test("SUN construit un prompt conversationnel avec mémoire et documents", () => {
  const messages = buildSunMessages(
    "Explique cette fonction",
    [{ role: "user", content: "Je débute en Python." }, { role: "assistant", content: "D'accord." }],
    [{ label: "Python.pdf", section: "Fonctions", text: "def addition(a, b): return a + b" }]
  );
  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /\[D1\] Python\.pdf/);
  assert.equal(messages[1].content, "Je débute en Python.");
  assert.equal(messages.at(-1).content, "Explique cette fonction");
});

test("SUN limite les documents et l'historique transmis au modèle", () => {
  const history = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 ? "assistant" : "user",
    content: "Message " + index
  }));
  history.push({ role: "system", content: "message system injecté" });
  const sources = Array.from({ length: 6 }, (_, index) => ({
    label: "doc-" + index,
    text: "x".repeat(1400)
  }));
  const messages = buildSunMessages("Question", history, sources);
  assert.equal(messages.length, 1 + 8 + 1);
  assert.match(messages[0].content, /\[D3\] doc-2/);
  assert.doesNotMatch(messages[0].content, /\[D4\] doc-3/);
  assert.ok(messages[0].content.length < 4000);
});

test("SUN retire les balises de réflexion du texte affiché", () => {
  assert.equal(cleanSunOutput("<think>private notes</think>Réponse utile."), "Réponse utile.");
  assert.equal(cleanSunOutput("Réponse sans marqueur"), "Réponse sans marqueur");
});

test("SUN fixe des limites de génération par mode de performance", () => {
  assert.equal(getSunGenerationOptions("fast", "short").max_new_tokens, 64);
  assert.equal(getSunGenerationOptions("quality", "detailed").max_new_tokens, 320);
});

test("SUN utilise un seul modèle avec un runtime adapté aux capacités disponibles", () => {
  assert.deepEqual(getSunRuntimePlan(true), {
    device: "webgpu", dtype: "q4f16", approximateWeightBytes: 648 * 1024 * 1024
  });
  assert.equal(getSunRuntimePlan(false).device, "wasm");
  assert.equal(getSunRuntimePlan(false).dtype, "int8");
});
