import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const worker = await readFile(new URL("./chat.worker.js", import.meta.url), "utf8");
const serviceWorker = await readFile(new URL("./sw.js", import.meta.url), "utf8");

test("SUN is the only model option exposed in the interface", () => {
  const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(options, ["sun-neural"]);
});

test("the application registry contains only SUN Neural", () => {
  const registry = app.match(/const MODELS = \{([\s\S]*?)\n\};/)?.[1] || "";
  assert.match(registry, /"sun-neural"/);
  assert.doesNotMatch(registry, /lamini|smollm|LaMini|SmolLM/i);
  assert.match(app, /\|\| "sun-neural"/);
});

test("the worker refuses all model keys except SUN", () => {
  assert.match(worker, /const MODEL_KEY = "sun-neural"/);
  assert.match(worker, /generateSunNeuralReply/);
  assert.doesNotMatch(worker, /LaMini|SmolLM|Xenova|onnx-community/i);
});

test("the offline cache includes SUN Neural and all its weight fragments", () => {
  for (const asset of [
    "./sun-neural.js",
    "./models/sun-neural-v1.part-01.txt",
    "./models/sun-neural-v1.part-02.txt",
    "./models/sun-neural-v1.part-03.txt",
    "./models/sun-neural-v1.part-04.txt"
  ]) {
    assert.ok(serviceWorker.includes(asset), "Missing offline asset: " + asset);
  }
});
