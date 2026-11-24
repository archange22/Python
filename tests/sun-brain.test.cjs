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
  "courses/ia/lesson-05.md",
  "courses/ia/lesson-06.md",
  "courses/python/lesson-05.md",
  "courses/python/lesson-06.md",
  "courses/python/lesson-07.md",
  "courses/python/lesson-08.md",
  "courses/python/lesson-09.md",
  "courses/discord/lesson-01.md",
  "courses/discord/lesson-02.md",
  "courses/discord/lesson-03.md",
  "courses/discord/lesson-04.md",
  "courses/discord/lesson-05.md",
  "courses/discord/lesson-06.md",
  "courses/web/lesson-01.md",
  "courses/web/lesson-02.md",
  "courses/web/lesson-03.md",
  "courses/web/lesson-04.md",
  "courses/web/lesson-05.md",
  "courses/web/lesson-06.md",
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

  if (request === "./knowledge/catalog.json") {
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        version: 1,
        documents: [
          { id: "approved-test", approved: true, path: "knowledge/imported/test-approved.md" },
          { id: "pending-test", approved: false, path: "knowledge/imported/test-pending.md" },
          { id: "unsafe-test", approved: true, path: "../private.md" }
        ]
      })
    };
  }

  if (request === "./knowledge/imported/test-approved.md") {
    return {
      ok: true,
      status: 200,
      text: async () => [
        "# Guide PDF et indexation",
        "",
        "## Extraction et organisation des chapitres",
        "",
        "Ouvrir un PDF textuel, extraire son texte, organiser les informations par chapitres et sujets, vérifier la qualité de l'extraction, puis ajouter les connaissances approuvées au moteur de recherche local.",
        "",
        "## Disponibilité hors connexion",
        "",
        "Le texte validé et le PDF associé sont conservés dans les caches locaux pour être consultés sans réseau."
      ].join("\n")
    };
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
    sources: ["courses/ia/lesson-03.md", "courses/ia/lesson-01.md", "courses/ia/lesson-05.md"],
    required: ["apprentissage automatique", "exemples"]
  },
  {
    question: "comment preparer les donnees pour une ia",
    sources: ["courses/ia/lesson-02.md", "courses/ia/lesson-05.md"],
    required: ["jeu de données", "qualité des données", "nettoyer et transformer"]
  },
  {
    question: "comment fonctionne un reseau de neurones",
    sources: ["courses/ia/lesson-01.md", "courses/ia/lesson-03.md", "courses/ia/lesson-06.md"],
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
      "courses/web/lesson-03.md",
      "courses/web/lesson-05.md"
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
  },
  {
    question: "comment entrainer un modele simple avec le plus proche centroide",
    sources: ["courses/ia/lesson-05.md", "courses/ia/lesson-03.md"],
    required: ["plus proche centroïde", "entraîner", "inférence"]
  },
  {
    question: "comment fonctionne un perceptron avec poids biais et activation",
    sources: ["courses/ia/lesson-06.md"],
    required: ["perceptron", "poids", "biais"]
  },
  {
    question: "comment créer une fonction python avec def et return",
    sources: ["courses/python/lesson-08.md"],
    required: ["fonction", "def", "return"]
  },
  {
    question: "comment utiliser un dictionnaire python avec des clés et valeurs",
    sources: ["courses/python/lesson-09.md"],
    required: ["dictionnaire", "clé", "valeur"]
  },
  {
    question: "comment vérifier les rôles et permissions dans un bot discord",
    sources: ["courses/discord/lesson-05.md"],
    required: ["permissions", "rôle", "moindre privilège"]
  },
  {
    question: "comment tester et gérer les erreurs d'un bot discord",
    sources: ["courses/discord/lesson-06.md", "courses/discord/lesson-05.md"],
    required: ["erreurs", "unittest", "journal"]
  },
  {
    question: "comment utiliser javascript et addEventListener pour un clic",
    sources: ["courses/web/lesson-05.md", "courses/web/lesson-01.md"],
    required: ["javascript", "événement", "addEventListener"]
  },
  {
    question: "comment utiliser fetch async await pour lire une api json",
    sources: ["courses/web/lesson-06.md"],
    required: ["fetch", "async", "json"]
  },
];

test("Sun Brain charge tous les documents pédagogiques prévus", () => {
  const status = brain.status();
  assert.equal(status.documents, DOCUMENTS.length + 1);
  assert.equal(status.total, DOCUMENTS.length + 1);
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
  assert.equal(requestedPaths.length, DOCUMENTS.length + 2);
  assert.ok(requestedPaths.every(request => request.startsWith("./")));
  assert.ok(requestedPaths.includes("./knowledge/catalog.json"));
  assert.ok(requestedPaths.includes("./knowledge/imported/test-approved.md"));
  assert.ok(!requestedPaths.includes("./knowledge/imported/test-pending.md"));
  assert.ok(!requestedPaths.includes("./../private.md"));
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
    ["environnements virtuels venv", "knowledge/python-practice.md"],
    ["classification precision rappel f1", "knowledge/ia-foundations.md"],
    ["formulaires accessibles clavier etiquette", "knowledge/web-practices.md"],
    ["intents gateway evenements", "knowledge/discord-development.md"],
    ["validation injection xss", "knowledge/security-and-privacy.md"]
  ];

  cases.forEach(([question, expectedPath]) => {
    const result = brain.searchDocuments(question);
    assert.ok(result && result.best, "Une fiche doit être retrouvée pour : " + question);
    assert.equal(result.best.section.path, expectedPath);
    assert.ok(result.best.section.body.length > 35);
  });
});


test("Sun Brain reconnaît un sujet dans un document PDF importé et approuvé", () => {
  const topic = brain.recognizeTopic("comment ouvrir un pdf extraire le texte organiser les chapitres et indexer hors connexion");
  assert.ok(topic, "Le moteur doit reconnaître le sujet du document importé.");
  assert.equal(topic.source, "knowledge/imported/test-approved.md");
  assert.match(topic.heading, /Extraction et organisation des chapitres/i);
});

test("Les documents non approuvés ou aux chemins non sûrs sont ignorés", () => {
  assert.ok(!requestedPaths.includes("./knowledge/imported/test-pending.md"));
  assert.ok(!requestedPaths.includes("./../private.md"));
  assert.equal(typeof brain.recognizeTopic, "function");
});


test("Les huit nouvelles leçons sont bien indexées par Sun Brain", () => {
  const cases = [
    ["plus proche centroïde modèle machine learning", "courses/ia/lesson-05.md"],
    ["neurone artificiel perceptron poids biais", "courses/ia/lesson-06.md"],
    ["fonction def paramètres return", "courses/python/lesson-08.md"],
    ["dictionnaire clé valeur get", "courses/python/lesson-09.md"],
    ["permissions rôles moindre privilège", "courses/discord/lesson-05.md"],
    ["cooldown unittest journaux erreurs", "courses/discord/lesson-06.md"],
    ["javascript DOM événements addEventListener", "courses/web/lesson-05.md"],
    ["fetch async await api json", "courses/web/lesson-06.md"]
  ];
  cases.forEach(([question, source]) => {
    const result = brain.searchDocuments(question);
    assert.ok(result && result.best, "Leçon introuvable : " + source);
    assert.equal(result.best.section.path, source);
  });
});
