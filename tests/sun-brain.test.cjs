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
  "courses/ia/lesson-07.md",
  "courses/ia/lesson-08.md",
  "courses/ia/lesson-09.md",
  "courses/ia/lesson-10.md",
  "courses/python/lesson-05.md",
  "courses/python/lesson-06.md",
  "courses/python/lesson-07.md",
  "courses/python/lesson-08.md",
  "courses/python/lesson-09.md",
  "courses/python/lesson-10.md",
  "courses/python/lesson-11.md",
  "courses/python/lesson-12.md",
  "courses/python/lesson-13.md",
  "courses/discord/lesson-01.md",
  "courses/discord/lesson-02.md",
  "courses/discord/lesson-03.md",
  "courses/discord/lesson-04.md",
  "courses/discord/lesson-05.md",
  "courses/discord/lesson-06.md",
  "courses/discord/lesson-07.md",
  "courses/discord/lesson-08.md",
  "courses/discord/lesson-09.md",
  "courses/discord/lesson-10.md",
  "courses/web/lesson-01.md",
  "courses/web/lesson-02.md",
  "courses/web/lesson-03.md",
  "courses/web/lesson-04.md",
  "courses/web/lesson-05.md",
  "courses/web/lesson-06.md",
  "courses/web/lesson-07.md",
  "courses/web/lesson-08.md",
  "courses/web/lesson-09.md",
  "courses/web/lesson-10.md",
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
          { id: "discussion-global-v0.0.2", approved: true, path: "knowledge/imported/discussion-global-v0.0.2.md" },
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
      "courses/discord/lesson-03.md",
      "courses/discord/lesson-09.md"
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
    sources: ["courses/python/lesson-08.md", "courses/python/lesson-11.md", "courses/python/lesson-12.md"],
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
    sources: ["courses/web/lesson-05.md", "courses/web/lesson-01.md", "courses/web/lesson-07.md", "courses/web/lesson-08.md"],
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
  assert.equal(status.documents, DOCUMENTS.length + 2);
  assert.equal(status.total, DOCUMENTS.length + 2);
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
  assert.equal(requestedPaths.length, DOCUMENTS.length + 3);
  assert.ok(requestedPaths.every(request => request.startsWith("./")));
  assert.ok(requestedPaths.includes("./knowledge/catalog.json"));
  assert.ok(requestedPaths.includes("./knowledge/imported/test-approved.md"));
  assert.ok(requestedPaths.includes("./knowledge/imported/discussion-global-v0.0.2.md"));
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
  assert.ok(
    ["knowledge/imported/test-approved.md", "knowledge/imported/discussion-global-v0.0.2.md"].includes(topic.source),
    "Le sujet doit être retrouvé dans une source locale approuvée."
  );
  assert.match(topic.heading, /Documents PDF et lecture|Extraction et organisation des chapitres/i);
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

test("Le réseau neuronal v3 reconnaît les catégories de sujets en plus des intentions sociales", () => {
  const info = brain.modelInfo;
  assert.equal(info.version, "0.0.3");
  assert.equal(info.hiddenNeurons, 24);
  assert.equal(info.topicClasses, 13);
  assert.ok(info.trainingExamples >= 220, "Le modèle doit disposer d'un jeu d'entraînement élargi.");
  assert.ok(info.inputFeatures > 100, "Les mots, préfixes, suffixes et trigrammes doivent enrichir les entrées.");
  assert.equal(brain.classifyIntent("bonjour sun").intent, "greeting");
  assert.equal(brain.classifyIntent("bonjour sun").kind, "conversation");
});

test("L'analyse sémantique identifie correctement les sujets et le type de demande", () => {
  const cases = [
    ["je veux programmer une boucle python avec for et while", "python", "procedure"],
    ["explique le perceptron et le biais d un neurone artificiel", "ia", "explanation"],
    ["comment sécuriser le token de mon bot discord", "discord", "procedure"],
    ["quelle différence entre html css et javascript", "web", "comparison"],
    ["comment ouvrir un pdf et extraire ses chapitres", "documents", "procedure"],
    ["comment organiser mes devoirs et réviser pour un examen", "school", "procedure"],
    ["explique les fractions et les opérations mathématiques", "math", "explanation"],
    ["traduis cette phrase du français vers l anglais", "language", "procedure"],
    ["explique une expérience scientifique et une hypothèse", "science", "explanation"],
    ["raconte un événement historique et sa chronologie", "culture", "explanation"],
    ["aide moi à rédiger un paragraphe argumentatif", "writing", "procedure"],
    ["mon téléphone android ne fonctionne plus comment le dépanner", "daily", "procedure"]
  ];
  const allowedSources = {
    python: ["courses/python/", "knowledge/python-practice.md"],
    ia: ["courses/ia/", "knowledge/ia-foundations.md"],
    discord: ["courses/discord/", "knowledge/discord-development.md"],
    web: ["courses/web/", "knowledge/web-practices.md"],
    documents: ["knowledge/imported/", "knowledge/pdfs/"],
    school: ["knowledge/imported/"],
    math: ["knowledge/imported/"],
    science: ["knowledge/imported/"],
    culture: ["knowledge/imported/"],
    language: ["knowledge/imported/"],
    writing: ["knowledge/imported/"],
    daily: ["knowledge/imported/"],
    general: ["knowledge/imported/"]
  };
  cases.forEach(([question, expectedSubject, expectedType]) => {
    const analysis = brain.analyzeQuestion(question);
    assert.equal(analysis.subjectId, expectedSubject, "Sujet mal identifié pour : " + question);
    assert.equal(analysis.questionType, expectedType, "Type de demande incorrect pour : " + question);
    assert.ok(analysis.confidence > 0 && analysis.confidence <= 0.99);
    assert.ok(analysis.source, "L'analyse doit s'appuyer sur un document.");
    assert.ok(allowedSources[expectedSubject].some(prefix =>
      analysis.source === prefix || analysis.source.startsWith(prefix)
    ), "La source doit correspondre au sujet " + expectedSubject + " : " + analysis.source);
  });
});

test("L'analyse ne transforme pas un sujet absent du corpus en connaissance prétendument reconnue", () => {
  const analysis = brain.analyzeQuestion("quelle est la température exacte des volcans sur mars");
  assert.equal(analysis.subjectId, null);
  assert.equal(analysis.source, null);
  assert.equal(analysis.confidence, 0);
});

test("Le classificateur neuronal distingue les formulations hors jeu d'entraînement dans les treize familles", () => {
  const cases = [
    ["comment écrire une fonction python avec def et return", "topic_python"],
    ["comment entraîner un réseau de neurones artificiels avec des données", "topic_ia"],
    ["comment programmer un bot discord et protéger son token", "topic_discord"],
    ["comment construire un site responsive en html css et javascript", "topic_web"],
    ["comment extraire le texte d un pdf et indexer son contenu", "topic_documents"],
    ["comment planifier mes devoirs et organiser mes révisions scolaires", "topic_school"],
    ["comment calculer et simplifier des fractions mathématiques", "topic_math"],
    ["comment mener une expérience scientifique et tester une hypothèse", "topic_science"],
    ["explique la chronologie d un événement historique", "topic_culture"],
    ["comment traduire une phrase et apprendre du vocabulaire anglais", "topic_language"],
    ["comment rédiger un paragraphe clair et corriger le texte", "topic_writing"],
    ["comment dépanner mon téléphone android", "topic_daily"],
    ["je voudrais discuter librement d un sujet et échanger", "topic_general"]
  ];
  cases.forEach(([question, expected]) => {
    const prediction = brain.classifyIntent(question);
    assert.equal(prediction.intent, expected,
      "Le réseau doit classer ce sujet : " + question + " ; reçu " + prediction.intent +
      " (" + prediction.confidence.toFixed(3) + ")");
    assert.equal(prediction.kind, "topic");
  });
});

test("Le type de question distingue expliquer un fonctionnement et demander une action", () => {
  assert.equal(brain.analyzeQuestion("comment fonctionne un neurone artificiel").questionType, "explanation");
  assert.equal(brain.analyzeQuestion("mon téléphone ne fonctionne plus, comment le dépanner").questionType, "procedure");
});
