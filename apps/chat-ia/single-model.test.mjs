import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const worker = await readFile(new URL("./chat.worker.js", import.meta.url), "utf8");
const core = await readFile(new URL("./sun-core.js", import.meta.url), "utf8");
const serviceWorker = await readFile(new URL("./sw.js", import.meta.url), "utf8");

test("SUN est le seul modèle proposé dans l'interface", () => {
  const select = html.match(/<select id="modelSelect">([\s\S]*?)<\/select>/)?.[1] || "";
  const options = [...select.matchAll(/<option value="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(options, ["sun-core"]);
});

test("le registre applicatif ne contient qu'une seule entrée SUN", () => {
  const registry = app.match(/const MODELS = \{([\s\S]*?)\n\};/)?.[1] || "";
  assert.match(registry, /"sun-core"/);
  assert.doesNotMatch(registry, /lamini|smollm|LaMini|SmolLM|sun-neural/i);
  assert.match(app, /let selectedModel = "sun-core"/);
});

test("le worker ne peut charger que le moteur génératif SUN", () => {
  assert.match(worker, /SUN_MODEL_KEY/);
  assert.match(worker, /SUN_FOUNDATION_MODEL/);
  assert.match(worker, /Qwen3-0\.6B-Instruct-ONNX/);
  assert.match(worker, /buildSunMessages/);
  assert.match(worker, /apply_chat_template\(messages/);
  assert.match(worker, /enable_thinking: false/);
  assert.match(worker, /generator\(prompt/);
  assert.doesNotMatch(worker, /LaMini|SmolLM|Xenova\/LaMini|SmolLM2/i);
  assert.match(core, /Tu es SUN/);
  assert.match(core, /history/);
});

test("le cache hors connexion inclut le moteur de conversation SUN", () => {
  assert.ok(serviceWorker.includes('"./sun-core.js"'));
  assert.ok(serviceWorker.includes('"./chat.worker.js"'));
  assert.ok(!serviceWorker.includes("sun-neural-v1.part"));
});

test("la migration supprime du cache les anciens moteurs tiers", () => {
  assert.ok(serviceWorker.includes("removeRetiredModelFiles"));
  assert.ok(serviceWorker.includes("Xenova/LaMini-Flan-T5-77M/"));
  assert.ok(serviceWorker.includes("Xenova/LaMini-Flan-T5-248M/"));
  assert.ok(serviceWorker.includes("onnx-community/SmolLM2-135M-Instruct-ONNX-GQA/"));
});
