"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { before, test } = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const DOCUMENTS = [
  "courses/ia/lesson-01.md",
  "courses/ia/lesson-02.md",
  "courses/ia/lesson-03.md",
  "courses/ia/lesson-04.md",
  "courses/python/lesson-05.md",
  "courses/python/lesson-06.md",
  "courses/python/lesson-07.md",
  "courses/discord/lesson-01.md",
  "courses/discord/lesson-02.md",
  "courses/discord/lesson-03.md",
  "courses/discord/lesson-04.md",
  "courses/web/lesson-01.md",
  "courses/web/lesson-02.md",
  "courses/web/lesson-03.md",
  "courses/web/lesson-04.md",
  "pdf/lecon-01.md",
  "pdf/lecon-02.md",
  "pdf/lecon-03.md",
  "pdf/lecon-04.md",
  "knowledge/python-practice.md",
  "knowledge/ia-foundations.md",
  "knowledge/web-practices.md",
  "knowledge/discord-development.md",
  "knowledge/security-and-privacy.md"
];

const values = new Map();
let storageWrites = 0;
const localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    storageWrites += 1;
    values.set(key, String(value));
  }
};

const requestedPaths = [];
async function localFetch(input) {
  const request = String(input);
  requestedPaths.push(request);
  if (!request.startsWith("./")) {
    return { ok: false, status: 400, text: async () => "" };
  }

  const relative = request.slice(2);
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(ROOT + path.sep) || !fs.existsSync(filePath)) {
    return { ok: false, status: 404, text: async () => "" };
  }

  return {
    ok: true,
    status: 200,
    text: async () => fs.readFileSync(filePath, "utf8")
  };
}

function createBrain() {
  const source = fs.readFileSync(path.join(ROOT, "sun-brain.js"), "utf8");
  const window = {};
  vm.runInNewContext(source, { window, localStorage, fetch: localFetch }, {
    filename: "sun-brain.js",
    timeout: 10000
  });
  return window.SunBrain;
}

let brain;

before(async () => {
  brain = createBrain();
  await brain.ready();
});

const QA_CASES = [
  {
    question: "c est quoi l intelligence artificielle",
    sources: ["courses/ia/lesson-01.md"],
    required: ["techniques informatiques", "reconnaître une image"]
  },
  {
    question: "explique le machine learning",
    sources: ["courses/ia/lesson-03.md", "courses/ia/lesson-01.md"],
    required: ["apprentissage automatique", "exemples"]
  },
  {
    question: "comment preparer les donnees pour une ia",
    sources: ["courses/ia/lesson-02.md"],
    required: ["jeu de données", "qualité des données", "nettoyer et transformer"]
  },
  {
    question: "comment fonctionne un reseau de neurones",
    sources: ["courses/ia/lesson-01.md", "courses/ia/lesson-03.md"],
    required: ["réseaux de neurones", "couches de calcul"]
  },
  {
    question: "c est quoi une condition en python",
    sources: ["courses/python/lesson-05.md"],
    required: ["condition", "if"]
  },
  {
    question: "comment utiliser les boucles for et while",
    sources: ["courses/python/lesson-06.md"],
    required: ["while", "for"]
  },
  {
    question: "comment creer une liste python",
    sources: ["courses/python/lesson-07.md"],
    required: ["liste", "crochets"]
  },
  {
    question: "comment creer un bot discord",
    sources: [
      "courses/discord/lesson-01.md",
      "courses/discord/lesson-02.md",
      "courses/discord/lesson-03.md"
    ],
    required: ["bot", "discord"]
  },
  {
    question: "comment securiser le token d un bot",
    sources: ["courses/discord/lesson-01.md", "courses/discord/lesson-02.md", "courses/discord/lesson-03.md"],
    required: ["secret", "token"]
  },
  {
    question: "quelle est la difference entre html css javascript",
    sources: [
      "courses/web/lesson-01.md",
      "courses/web/lesson-02.md",
      "courses/web/lesson-03.md"
    ],
    required: ["html", "css", "javascript"]
  },
  {
    question: "comment faire une page web responsive",
    sources: [
      "courses/web/lesson-01.md",
      "courses/web/lesson-03.md",
      "courses/web/lesson-04.md"
    ],
    required: ["responsive", "écrans", "meta viewport"]
  }
];

test("Sun Brain charge tous les documents pédagogiques prévus", () => {
  const status = brain.status();
  assert.equal(status.documents, DOCUMENTS.length);
  assert.equal(status.failed, 0);
  assert.ok(status.sections >= 250, "Le découpage des cours doit produire suffisamment de passages.");
});

test("Sun Brain reconnaît les salutations et les abréviations françaises", async () => {
  assert.equal(brain.classifyIntent("bonjour").intent, "greeting");
  assert.equal(brain.classifyIntent("yo").intent, "greeting");
  assert.equal(brain.classifyIntent("cv").intent, "how");
  assert.equal(brain.classifyIntent("ccmt c ets quoi ton nom").intent, "name");
  assert.match(await brain.reply("yo"), /Salut/i);
  assert.match(await brain.reply("cv"), /Ça va bien/i);
});

test("Sun Brain sait demander puis retenir un prénom dans le navigateur", async () => {
  const firstQuestion = "comment tu t appelles";
  const firstAnswer = await brain.reply(firstQuestion, []);
  assert.match(firstAnswer, /Je m’appelle Sun IA/);

  const secondAnswer = await brain.reply("Archange", [
    { role: "user", content: firstQuestion },
    { role: "assistant", content: firstAnswer },
    { role: "user", content: "Archange" }
  ]);
  assert.match(secondAnswer, /Enchanté, Archange/);
  assert.match(await brain.reply("salut"), /Archange/);
});

for (const item of QA_CASES) {
  test("Réponse documentaire : " + item.question, async () => {
    const result = brain.searchDocuments(item.question);
    assert.ok(result && result.best, "Une section pertinente doit être retrouvée.");
    assert.ok(
      item.sources.includes(result.best.section.path),
      "La source principale doit appartenir au parcours attendu. Source reçue : " + result.best.section.path
    );

    const answer = await brain.reply(item.question, []);
    const sourceMatches = Array.from(answer.matchAll(/Sources? : ([^\s\n]+)/g)).map(match => match[1]);
    assert.ok(sourceMatches.length > 0, "La réponse doit citer son fichier source.");
    sourceMatches.forEach(source => {
      assert.ok(item.sources.includes(source), "Source secondaire hors sujet : " + source);
    });

    const normalizedAnswer = answer.toLowerCase();
    item.required.forEach(term => {
      assert.ok(normalizedAnswer.includes(term.toLowerCase()), "La réponse ne contient pas le point attendu : " + term);
    });
  });
}

test("Une question absente des cours ne déclenche pas de réponse inventée", async () => {
  const question = "explique les volcans de mars et leur température exacte";
  assert.equal(brain.searchDocuments(question), null);
  const answer = await brain.reply(question, []);
  assert.match(answer, /pas trouvé de passage suffisamment fiable/i);
});

test("Sun Brain conserve le contexte pour une demande de précision", async () => {
  const history = [
    { role: "user", content: "c est quoi une condition python" },
    { role: "assistant", content: "Une condition permet de choisir." },
    { role: "user", content: "donne un exemple" }
  ];
  const answer = await brain.reply("donne un exemple", history);
  assert.match(answer, /if/i);
  assert.match(answer, /Source : courses\/python\/lesson-05\.md/);
});

test("Les documents sont lus localement et les poids du réseau sont réutilisés", () => {
  assert.equal(requestedPaths.length, DOCUMENTS.length);
  assert.ok(requestedPaths.every(request => request.startsWith("./")));
  const writesBeforeReload = storageWrites;
  const secondBrain = createBrain();
  assert.ok(secondBrain);
  assert.equal(storageWrites, writesBeforeReload, "Le modèle neuronal déjà sauvegardé doit être rechargé sans nouvel entraînement.");
});


test("Une question de définition commence par la définition du concept", async () => {
  const answer = await brain.reply("c est quoi une condition en python", []);
  assert.match(
    answer,
    /En clair : Une condition est une question à laquelle Python répond par vrai ou faux/
  );
  assert.doesNotMatch(answer, /and signifie « et »/);
});

test("Une réponse de comparaison distingue HTML, CSS et JavaScript", async () => {
  const answer = await brain.reply("quelle est la difference entre html css javascript", []);
  assert.match(answer, /HTML organise le contenu/);
  assert.match(answer, /CSS règle son apparence/);
  assert.match(answer, /JavaScript ajoute les interactions/);
});

test("Un exemple de code est présenté avant son explication", async () => {
  const answer = await brain.reply("donne un exemple de boucle while python", []);
  const codeLabel = answer.indexOf("Exemple en Python");
  const whileLine = answer.indexOf("while compteur <= 5");
  const explanation = answer.indexOf("Explication :");
  assert.ok(codeLabel >= 0, "La réponse doit annoncer l'exemple.");
  assert.ok(whileLine > codeLabel, "Le code doit apparaître après son titre.");
  assert.ok(explanation > whileLine, "L'explication doit suivre le code.");
  assert.match(answer, /Source : courses\/python\/lesson-06\.md/);
});

test("Les procédures restent centrées sur les étapes utiles", async () => {
  const answer = await brain.reply("comment creer une liste python", []);
  assert.match(answer, /Comprendre et créer une liste/);
  assert.doesNotMatch(answer, /start=1/);
  assert.doesNotMatch(answer, /mini-projet/i);
});


test("Sun Brain indexe les cinq nouvelles fiches documentaires locales", () => {
  const cases = [
    ["comment utiliser venv pour installer un paquet python", "knowledge/python-practice.md"],
    ["quelles metriques precision rappel score f1 classification", "knowledge/ia-foundations.md"],
    ["comment faire un formulaire accessible avec etiquette clavier html", "knowledge/web-practices.md"],
    ["quels evenements les intents gateway permettent ils de recevoir", "knowledge/discord-development.md"],
    ["comment eviter injection xss et valider une entree utilisateur", "knowledge/security-and-privacy.md"]
  ];

  cases.forEach(([question, expectedPath]) => {
    const result = brain.searchDocuments(question);
    assert.ok(result && result.best, "Une fiche doit être retrouvée pour : " + question);
    assert.equal(result.best.section.path, expectedPath);
    assert.ok(result.best.section.body.length > 35);
  });
});
