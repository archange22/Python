import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/";
let pyodide = null;
let nextInputId = 1;
const pendingInputs = new Map();

function send(type, details = {}) {
  self.postMessage({ type, ...details });
}

async function boot() {
  if (pyodide) return;
  send("status", { message: "Téléchargement du moteur Python 3…" });

  pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
  pyodide.setStdout({ batched: (text) => send("output", { text }) });
  pyodide.setStderr({ batched: (text) => send("stderr", { text }) });

  pyodide.registerJsModule("console_bridge", {
    ask_input: (prompt) => new Promise((resolve) => {
      const id = nextInputId++;
      pendingInputs.set(id, resolve);
      send("input", { id, prompt: String(prompt || "") });
    })
  });

  await pyodide.runPythonAsync([
    "import ast",
    "from console_bridge import ask_input",
    "",
    "async def input(prompt=''):",
    "    return await ask_input(str(prompt))",
    "",
    "class _AcademiqueInputTransformer(ast.NodeTransformer):",
    "    def visit_Call(self, node):",
    "        self.generic_visit(node)",
    "        if isinstance(node.func, ast.Name) and node.func.id == 'input':",
    "            return ast.copy_location(ast.Await(value=node), node)",
    "        return node",
    "",
    "async def _academique_run(source):",
    "    tree = ast.parse(source, filename='<console>')",
    "    tree = _AcademiqueInputTransformer().visit(tree)",
    "    if tree.body and isinstance(tree.body[-1], ast.Expr):",
    "        last = tree.body[-1].value",
    "        tree.body[-1] = ast.Expr(value=ast.Call(func=ast.Name(id='print', ctx=ast.Load()), args=[last], keywords=[]))",
    "    ast.fix_missing_locations(tree)",
    "    compiled = compile(tree, '<console>', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)",
    "    result = eval(compiled, globals(), globals())",
    "    if hasattr(result, '__await__'):",
    "        await result"
  ].join("\n"));

  const version = pyodide.runPython("import sys; sys.version.split()[0]");
  send("ready", { version: String(version) });
}

async function runCode(source) {
  if (!pyodide) throw new Error("Le moteur Python n’est pas prêt.");
  try {
    await pyodide.loadPackagesFromImports(source);
  } catch (error) {
    send("package-warning", {
      message: "Une bibliothèque supplémentaire n’a pas pu être téléchargée. La bibliothèque standard reste disponible ; vérifie la connexion ou le nom du paquet."
    });
  }
  await pyodide.runPythonAsync("await _academique_run(" + JSON.stringify(source) + ")");
}

self.addEventListener("message", async (event) => {
  const data = event.data || {};
  if (data.type === "boot") {
    try {
      await boot();
    } catch (error) {
      send("boot-error", { message: error && error.message ? error.message : String(error) });
    }
    return;
  }

  if (data.type === "stdin-response") {
    const resolve = pendingInputs.get(data.id);
    if (resolve) {
      pendingInputs.delete(data.id);
      resolve(String(data.value ?? ""));
    }
    return;
  }

  if (data.type === "check") {
    try {
      await pyodide.runPythonAsync("import ast\\nast.parse(" + JSON.stringify(String(data.code || "")) + ", filename='<console>')");
      send("check-result", { ok: true, message: "Aucune erreur de syntaxe détectée." });
    } catch (error) {
      send("check-result", { ok: false, message: error && error.message ? error.message : String(error) });
    }
    return;
  }

  if (data.type === "install-package") {
    try {
      await pyodide.loadPackage("micropip");
      pyodide.globals.set("_academique_package_name", String(data.name || ""));
      await pyodide.runPythonAsync("import micropip\\nawait micropip.install(_academique_package_name)");
      pyodide.globals.delete("_academique_package_name");
      send("package-result", { ok: true, message: "Bibliothèque installée : " + String(data.name || "") });
    } catch (error) {
      send("package-result", { ok: false, message: "Installation impossible : " + (error && error.message ? error.message : String(error)) });
    }
    return;
  }

  if (data.type === "run") {
    try {
      await runCode(String(data.code || ""));
      send("done");
    } catch (error) {
      send("run-error", { message: error && error.message ? error.message : String(error) });
    }
  }
});
