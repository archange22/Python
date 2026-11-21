import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { predictSunIntent, unpackSunModel } from "./sun-neural.js";

const partNames = [
  "sun-neural-v1.part-01.txt",
  "sun-neural-v1.part-02.txt",
  "sun-neural-v1.part-03.txt",
  "sun-neural-v1.part-04.txt"
];
const parts = await Promise.all(partNames.map((name) =>
  readFile(new URL("./models/" + name, import.meta.url), "utf8")
));
const model = unpackSunModel(JSON.parse(parts.join("")));

test("SUN Neural reconnaît une question sur les variables", () => {
  const result = predictSunIntent("Comment créer une variable en Python ?", model);
  assert.equal(result.intent, "python_variable_equal");
  assert.ok(result.confidence > 0.45);
});

test("SUN Neural reconnaît une salutation", () => {
  const result = predictSunIntent("Salut SUN", model);
  assert.equal(result.intent, "greeting");
});

test("SUN Neural repère une demande concernant une erreur Python", () => {
  const result = predictSunIntent("J'ai une erreur SyntaxError dans mon code Python", model);
  assert.equal(result.intent, "python_error");
});

test("SUN Neural ne force pas une réponse Python pour une question hors sujet", () => {
  const result = predictSunIntent("Quelle sera la météo demain ?", model);
  assert.equal(result.intent, "unknown");
});
