(function () {
  "use strict";
  const paths = [
    "courses/ia/lesson-01.md", "courses/ia/lesson-02.md",
    "courses/ia/lesson-03.md", "courses/ia/lesson-04.md", "courses/ia/lesson-05.md", "courses/ia/lesson-06.md",
    "courses/python/lesson-05.md", "courses/python/lesson-06.md",
    "courses/python/lesson-07.md", "courses/python/lesson-08.md", "courses/python/lesson-09.md", "courses/discord/lesson-01.md",
    "courses/discord/lesson-02.md", "courses/discord/lesson-03.md",
    "courses/discord/lesson-04.md", "courses/discord/lesson-05.md", "courses/discord/lesson-06.md", "courses/web/lesson-01.md",
    "courses/web/lesson-02.md", "courses/web/lesson-03.md",
    "courses/web/lesson-04.md", "courses/web/lesson-05.md", "courses/web/lesson-06.md", "pdf/lecon-01.md", "pdf/lecon-02.md",
    "pdf/lecon-03.md", "pdf/lecon-04.md",
    "knowledge/python-practice.md", "knowledge/ia-foundations.md",
    "knowledge/web-practices.md", "knowledge/discord-development.md",
    "knowledge/security-and-privacy.md"
  ];
  const data = {
    greeting: ["bonjour", "salut", "yo", "coucou", "hello", "hey", "bonsoir", "bjr", "slt", "cc", "salut sun", "bonjour sun", "wesh", "bien le bonjour"],
    how: ["ça va", "cv", "comment ça va", "comment tu vas", "comment vas tu", "tu vas bien", "comment tu te sens", "ça roule", "tu vas bien sun", "comment allez vous"],
    name: ["comment tu t appelles", "c est quoi ton nom", "quel est ton nom", "ton nom c est quoi", "comment dois je t appeler", "tu t appelles comment", "quel est ton prénom"],
    thanks: ["merci", "merci beaucoup", "je te remercie", "c est gentil merci", "merci pour ton aide", "bien reçu merci"],
    bye: ["au revoir", "à bientôt", "bonne nuit", "ciao", "bye", "à plus tard", "je dois partir", "bonne journée"],
    identity: ["tu es qui", "qui es tu", "tu es quoi", "tu es une ia", "comment tu fonctionnes", "tu es un robot", "présente toi"],
    help: ["que sais tu faire", "tu peux faire quoi", "comment peux tu m aider", "quelles sont tes capacités", "aide moi à utiliser sun", "comment poser une question"],
    smalltalk: ["quoi de neuf", "tu fais quoi", "comment se passe ta journée", "on peut discuter", "parlons un peu", "raconte moi quelque chose", "tu es disponible", "ça dit quoi", "j aimerais discuter", "on parle de quoi"],

    topic_python: [
      "python programmation variables types conditions boucles fonctions listes dictionnaires",
      "explique moi le langage python et donne un exemple de code",
      "comment écrire une fonction avec def et return en python",
      "comment corriger une erreur dans mon programme python",
      "je veux apprendre à coder avec python",
      "à quoi servent les variables et les boucles python",
      "comment utiliser les listes et les dictionnaires python",
      "programmation python débutant exercices et algorithmes",
      "comment exécuter un script python sur android",
      "quelle est la différence entre for et while en python",
      "comment créer un programme python avec des conditions",
      "aide moi à comprendre la syntaxe python"
    ],
    topic_ia: [
      "intelligence artificielle machine learning deep learning réseau de neurones",
      "comment entraîner un modèle neuronal avec des données",
      "explique les perceptrons les poids les biais et activation",
      "comment fonctionne l apprentissage automatique",
      "classification précision rappel et score f1 pour une ia",
      "qu est ce qu un dataset et comment préparer les données",
      "comment fonctionne un réseau de neurones artificiels",
      "différence entre ia apprentissage automatique et deep learning",
      "comment faire une inférence avec un modèle entraîné",
      "algorithme de classification et modèle prédictif",
      "comment évaluer la qualité d un modèle ia",
      "je veux comprendre les neurones artificiels"
    ],
    topic_discord: [
      "discord bot discord py discord js serveur commande slash",
      "comment programmer un bot discord avec python",
      "comment sécuriser le token secret de mon bot discord",
      "rôles permissions intents gateway événements discord",
      "comment créer une commande pour un serveur discord",
      "comment gérer les erreurs et les journaux d un bot",
      "développer une application discord et un bot modérateur",
      "comment vérifier les permissions des rôles discord",
      "comment héberger un bot discord et le maintenir actif",
      "comment tester un bot discord avec unittest",
      "problème de connexion du bot discord à gateway",
      "je veux créer une communauté avec un bot discord"
    ],
    topic_web: [
      "création de site web html css javascript",
      "comment construire une page web responsive pour téléphone",
      "html structure css design et javascript interactions",
      "comment utiliser fetch async await pour une api",
      "comment créer un formulaire accessible dans un site",
      "comment corriger le css et améliorer interface utilisateur",
      "développement frontend web navigateur html",
      "comment gérer les événements avec addEventListener",
      "comment installer une application web progressive pwa",
      "site internet responsive mobile ordinateur",
      "comment créer une interface avec javascript dom",
      "aide moi à développer une application web"
    ],
    topic_documents: [
      "ouvrir un pdf extraire son texte organiser les chapitres",
      "comment analyser un document et indexer ses informations",
      "lire un fichier pdf et rechercher dans son contenu",
      "extraire texte d un pdf et créer une base documentaire",
      "comment classer des documents par sujet et chapitre",
      "organiser une bibliothèque de cours hors connexion",
      "importer un document texte et vérifier ses sources",
      "comment retrouver une information dans un fichier",
      "catalogue documentaire et recherche locale",
      "comment ouvrir un document word et extraire le texte",
      "comment reconnaître le sujet principal d un document",
      "indexation de fichiers et recherche par mots clés"
    ],
    topic_school: [
      "comment organiser mon travail scolaire et mes devoirs",
      "aide moi à comprendre une leçon avec des mots simples",
      "comment préparer une révision avant un examen",
      "comment résumer un cours et retenir les idées importantes",
      "comment mieux organiser mon temps pour étudier",
      "explique une notion scolaire étape par étape",
      "comment lire et comprendre un texte de cours",
      "comment mémoriser une leçon sans tout oublier",
      "je dois préparer un exposé pour l école",
      "comment résoudre un exercice scolaire et vérifier ma réponse",
      "comment planifier mes devoirs de la semaine",
      "donne une méthode pour apprendre une nouvelle leçon"
    ],
    topic_math: [
      "aide moi à faire un calcul mathématique",
      "explique les fractions et les opérations",
      "comment résoudre une équation avec une inconnue",
      "explique le raisonnement mathématique étape par étape",
      "comment additionner soustraire multiplier et diviser des nombres",
      "comment calculer une fraction et simplifier le résultat",
      "résoudre une équation du premier degré",
      "pourquoi ce résultat de calcul est il correct",
      "explique les nombres décimaux et les fractions",
      "comment vérifier un résultat en mathématiques",
      "aide moi à comprendre un problème de maths",
      "calculer un pourcentage et expliquer la méthode"
    ],
    topic_science: [
      "explique une notion de science et la méthode scientifique",
      "comment observer un phénomène et formuler une hypothèse",
      "qu est ce qu une expérience scientifique",
      "comment analyser les résultats d une observation",
      "explique une notion de physique ou de biologie",
      "comment faire une démarche scientifique simple",
      "différence entre observation hypothèse et conclusion",
      "comment vérifier une idée avec une expérience",
      "quelles sont les étapes d une recherche scientifique",
      "explique un phénomène naturel simplement",
      "comment distinguer un fait d une hypothèse",
      "aide moi à comprendre un sujet scientifique"
    ],
    topic_culture: [
      "explique un événement historique et sa chronologie",
      "quand a eu lieu cet événement dans l histoire",
      "explique une période historique simplement",
      "parle moi de la géographie et des pays du monde",
      "où se trouve cette ville ce pays ou cette région",
      "explique un livre et ses personnages principaux",
      "comment résumer l histoire d un livre",
      "présente un événement culturel et son contexte",
      "explique la chronologie d une histoire",
      "quels sont les lieux importants de cette région",
      "aide moi à comprendre un sujet d histoire",
      "aide moi à comprendre un sujet de géographie"
    ],
    topic_language: [
      "traduis cette phrase du français vers l anglais",
      "comment traduire un mot dans une autre langue",
      "aide moi à apprendre du vocabulaire en anglais",
      "explique la grammaire et la conjugaison française",
      "quelle est la signification de ce mot",
      "comment améliorer mon français écrit",
      "comment apprendre une nouvelle langue",
      "donne un synonyme et un antonyme de ce mot",
      "corrige cette phrase en français",
      "explique une règle de grammaire simplement",
      "comment prononcer et utiliser cette expression",
      "aide moi à comprendre une traduction"
    ],
    topic_writing: [
      "aide moi à rédiger un paragraphe cohérent",
      "comment écrire une introduction et une conclusion",
      "corrige mon texte et améliore la formulation",
      "comment construire un paragraphe avec des arguments",
      "aide moi à faire une rédaction en français",
      "comment organiser les idées dans un texte",
      "écris un résumé clair de ce passage",
      "comment structurer un exposé ou une présentation",
      "comment développer une argumentation simple",
      "aide moi à reformuler une phrase",
      "comment écrire une lettre ou un texte explicatif",
      "améliorer la ponctuation et l orthographe d un texte"
    ],
    topic_daily: [
      "mon téléphone a un problème comment le dépanner",
      "comment résoudre un problème simple sur android",
      "mon application ne fonctionne plus que faire",
      "comment vérifier les paramètres de mon appareil",
      "aide moi à comprendre une erreur sur mon téléphone",
      "comment gérer un problème de connexion internet",
      "mon navigateur ne charge pas une page",
      "comment libérer de l espace de stockage sur mon appareil",
      "comment utiliser une fonctionnalité de mon téléphone",
      "aide moi à résoudre un problème technique courant",
      "pourquoi mon application se ferme toute seule",
      "comment redémarrer et vérifier un appareil"
    ],
    topic_general: [
      "je veux discuter librement d un sujet",
      "donne moi un avis équilibré sur cette idée",
      "peux tu m expliquer un sujet du quotidien",
      "je ne comprends pas bien une situation peux tu clarifier",
      "aide moi à choisir entre plusieurs possibilités",
      "parlons d un sujet léger et intéressant",
      "je suis découragé aide moi à reprendre confiance dans mon travail",
      "comment répondre poliment dans cette situation",
      "peux tu développer cette idée et donner un exemple",
      "explique cette question de culture générale",
      "aide moi à réfléchir aux avantages et aux limites",
      "je voudrais simplement parler et poser des questions"
    ]
  };

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\bccmt\b/g, "comment").replace(/\bcmt\b/g, "comment")
      .replace(/\bbjr\b/g, "bonjour").replace(/\bslt\b/g, "salut")
      .replace(/\bcv\b/g, "ca va").replace(/\bc\s+ets\b/g, "c est")
      .replace(/\bj\s+voudrais\b/g, "je voudrais")
      .replace(/\bsvp\b/g, "s il vous plait")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }

  function feats(s) {
    const tokens = norm(s).split(/\s+/).filter(Boolean);
    const out = [];
    tokens.forEach((token, i) => {
      out.push("w:" + token);
      if (token.length >= 4) {
        out.push("p:" + token.slice(0, 3), "s:" + token.slice(-3));
        for (let j = 0; j <= token.length - 3; j++) out.push("c:" + token.slice(j, j + 3));
      }
      if (i + 1 < tokens.length) out.push("b:" + token + "_" + tokens[i + 1]);
    });
    return Array.from(new Set(out));
  }

  const labels = Object.keys(data);
  const vocab = Array.from(new Set(labels.flatMap(label => data[label].flatMap(feats))));
  const index = new Map(vocab.map((feature, i) => [feature, i]));
  const samples = [];
  labels.forEach((label, y) => data[label].forEach(phrase => {
    const active = Array.from(new Set(feats(phrase).filter(feature => index.has(feature)).map(feature => index.get(feature))));
    samples.push({ active, y });
  }));

  const MODEL_CACHE_KEY = "sun-ia-neural-model-v3";
  const modelSignature = JSON.stringify(data) + "|" + vocab.join("|");

  function rand(seed) {
    let n = seed >>> 0;
    return () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function softmax(values) {
    const maximum = Math.max(...values);
    const exponentials = values.map(value => Math.exp(value - maximum));
    const total = exponentials.reduce((sum, value) => sum + value, 0) || 1;
    return exponentials.map(value => value / total);
  }

  function trainNetwork() {
    const random = rand(41721);
    const hiddenSize = 24;
    const w1 = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: vocab.length }, () => (random() - 0.5) * 0.16));
    const b1 = new Array(hiddenSize).fill(0);
    const w2 = Array.from({ length: labels.length }, () =>
      Array.from({ length: hiddenSize }, () => (random() - 0.5) * 0.16));
    const b2 = new Array(labels.length).fill(0);
    const order = samples.map((_, i) => i);
    const learningRate = 0.035;
    const epochs = 280;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (const sampleIndex of order) {
        const sample = samples[sampleIndex];
        const hiddenValues = w1.map((row, j) => {
          let sum = b1[j];
          for (const featureIndex of sample.active) sum += row[featureIndex];
          return Math.tanh(sum);
        });
        const output = softmax(w2.map((row, k) =>
          row.reduce((sum, weight, j) => sum + weight * hiddenValues[j], b2[k])));
        const errors = output.map((probability, k) => probability - (k === sample.y ? 1 : 0));
        const back = new Array(hiddenSize).fill(0);

        for (let k = 0; k < labels.length; k++) {
          for (let j = 0; j < hiddenSize; j++) back[j] += errors[k] * w2[k][j];
        }
        for (let k = 0; k < labels.length; k++) {
          for (let j = 0; j < hiddenSize; j++) {
            w2[k][j] -= learningRate * (errors[k] * hiddenValues[j] + 0.00008 * w2[k][j]);
          }
          b2[k] -= learningRate * errors[k];
        }
        for (let j = 0; j < hiddenSize; j++) {
          const gradient = back[j] * (1 - hiddenValues[j] * hiddenValues[j]);
          for (const featureIndex of sample.active) {
            w1[j][featureIndex] -= learningRate * (gradient + 0.00008 * w1[j][featureIndex]);
          }
          b1[j] -= learningRate * gradient;
        }
      }
    }
    return { hidden: hiddenSize, w1, b1, w2, b2 };
  }

  function validNetwork(saved) {
    return !!(saved && saved.version === 3 && saved.signature === modelSignature &&
      saved.hidden === 24 && Array.isArray(saved.w1) && saved.w1.length === 24 &&
      saved.w1.every(row => Array.isArray(row) && row.length === vocab.length) &&
      Array.isArray(saved.b1) && saved.b1.length === 24 &&
      Array.isArray(saved.w2) && saved.w2.length === labels.length &&
      saved.w2.every(row => Array.isArray(row) && row.length === 24) &&
      Array.isArray(saved.b2) && saved.b2.length === labels.length);
  }

  function loadNetwork() {
    try {
      const saved = JSON.parse(localStorage.getItem(MODEL_CACHE_KEY) || "null");
      if (validNetwork(saved)) return saved;
    } catch (_) {}
    const trained = trainNetwork();
    const model = { version: 3, signature: modelSignature, ...trained };
    try { localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(model)); } catch (_) {}
    return model;
  }

  const network = loadNetwork();
  const hidden = network.hidden;
  const w1 = network.w1;
  const b1 = network.b1;
  const w2 = network.w2;
  const b2 = network.b2;

  function classify(s) {
    const active = Array.from(new Set(feats(s).filter(feature => index.has(feature)).map(feature => index.get(feature))));
    if (!active.length) return { intent: null, confidence: 0, margin: 0 };
    const hiddenValues = w1.map((row, j) => {
      let sum = b1[j];
      for (const featureIndex of active) sum += row[featureIndex];
      return Math.tanh(sum);
    });
    const output = softmax(w2.map((row, k) =>
      row.reduce((sum, weight, j) => sum + weight * hiddenValues[j], b2[k])));
    const sorted = output.map((confidence, labelIndex) => ({ confidence, label: labels[labelIndex] }))
      .sort((a, b) => b.confidence - a.confidence);
    const best = sorted[0];
    return {
      intent: best.label,
      confidence: best.confidence,
      margin: best.confidence - (sorted[1]?.confidence || 0),
      kind: best.label.startsWith("topic_") ? "topic" : "conversation"
    };
  }

  const SUBJECTS = {
    topic_python: { id: "python", label: "Python", paths: ["courses/python/", "knowledge/python-practice.md"] },
    topic_ia: { id: "ia", label: "Intelligence artificielle", paths: ["courses/ia/", "knowledge/ia-foundations.md"] },
    topic_discord: { id: "discord", label: "Discord", paths: ["courses/discord/", "knowledge/discord-development.md"] },
    topic_web: { id: "web", label: "Développement Web", paths: ["courses/web/", "knowledge/web-practices.md"] },
    topic_documents: { id: "documents", label: "Documents et PDF", paths: ["knowledge/pdfs/", "knowledge/imported/"] },
    topic_school: { id: "school", label: "Études et apprentissage", paths: ["knowledge/imported/"] },
    topic_math: { id: "math", label: "Mathématiques", paths: ["knowledge/imported/"] },
    topic_science: { id: "science", label: "Sciences", paths: ["knowledge/imported/"] },
    topic_culture: { id: "culture", label: "Histoire, géographie et culture", paths: ["knowledge/imported/"] },
    topic_language: { id: "language", label: "Langues et français", paths: ["knowledge/imported/"] },
    topic_writing: { id: "writing", label: "Rédaction et expression", paths: ["knowledge/imported/"] },
    topic_daily: { id: "daily", label: "Dépannage du quotidien", paths: ["knowledge/imported/"] },
    topic_general: { id: "general", label: "Discussion générale", paths: ["knowledge/imported/"] }
  };

  function detectTopicHint(query) {
    const text = norm(query);
    const tokens = new Set(text.split(" ").filter(Boolean));
    const has = (...values) => values.some(value => tokens.has(value));
    const includes = (...values) => values.some(value => text.includes(value));
    const hints = [
      ["topic_python", () => has("python", "def", "return", "variable", "variables", "boucle", "boucles", "liste", "dictionnaire")],
      ["topic_ia", () => includes("intelligence artificielle", "reseau neuronal", "machine learning", "deep learning", "perceptron") || has("ia", "neurone", "neurones")],
      ["topic_discord", () => has("discord", "bot", "bots", "gateway") || includes("serveur discord")],
      ["topic_web", () => has("html", "css", "javascript", "responsive", "frontend") || includes("site web", "navigateur web")],
      ["topic_documents", () => has("pdf", "document", "documents", "fichier", "extraction", "indexation", "chapitre", "chapitres") || includes("bibliotheque documentaire")],
      ["topic_math", () => has("fraction", "fractions", "equation", "equations", "calcul", "mathematique", "pourcentage", "numerateur", "denominateur")],
      ["topic_science", () => has("science", "scientifique", "experience", "hypothese", "observation", "biologie", "physique")],
      ["topic_culture", () => has("histoire", "historique", "geographie", "chronologie", "livre", "personnage") || includes("pays du monde")],
      ["topic_language", () => has("traduire", "traduis", "traduction", "anglais", "francais", "grammaire", "conjugaison", "vocabulaire", "langue", "langues")],
      ["topic_writing", () => has("rediger", "redaction", "paragraphe", "orthographe", "ponctuation", "argumentation")],
      ["topic_daily", () => has("telephone", "android", "depannage", "stockage") || includes("connexion internet", "application mobile")],
      ["topic_school", () => has("scolaire", "devoir", "devoirs", "examen", "revision", "reviser", "memorisation", "etudier", "etude", "etudes")],
      ["topic_general", () => includes("discussion libre", "discuter", "echanger", "culture generale", "avis equilibre", "parler simplement")]
    ];
    const match = hints.find(([, matches]) => matches());
    return match ? SUBJECTS[match[0]] : null;
  }

  function subjectFromPath(path, heading) {
    if (path.startsWith("courses/python/") || path === "knowledge/python-practice.md") return { id: "python", label: "Python" };
    if (path.startsWith("courses/ia/") || path === "knowledge/ia-foundations.md") return { id: "ia", label: "Intelligence artificielle" };
    if (path.startsWith("courses/discord/") || path === "knowledge/discord-development.md") return { id: "discord", label: "Discord" };
    if (path.startsWith("courses/web/") || path === "knowledge/web-practices.md") return { id: "web", label: "Développement Web" };
    if (path.startsWith("knowledge/pdfs/")) return { id: "documents", label: "Documents et PDF" };
    if (path.startsWith("knowledge/imported/") || path.startsWith("knowledge/discussion-global")) {
      const title = norm(heading || "");
      const mappings = [
        ["documents", /documents pdf|guide pdf|pdf et indexation|indexation|extraction et organisation des chapitres|disponibilite hors connexion/],
        ["math", /calculs et fractions|equations et raisonnement mathematique/],
        ["science", /sciences et methode d observation/],
        ["culture", /histoire et chronologie|geographie et lieux du monde|lecture et comprehension d un livre/],
        ["language", /francais familier|traduction et apprentissage des langues/],
        ["writing", /redaction et construction d un paragraphe/],
        ["school", /organisation du travail scolaire|expliquer une notion simplement|definir un mot|resumer un texte|revision et memorisation/],
        ["daily", /telephone et depannage simple/],
        ["general", /discussion libre|donner un avis|emotions ordinaires|demander de l aide|relancer une discussion|clarifier une question/]
      ];
      for (const [id, pattern] of mappings) {
        if (pattern.test(title)) return Object.values(SUBJECTS).find(subject => subject.id === id) || null;
      }
      return { id: "general", label: "Discussion générale" };
    }
    return null;
  }
  let sections = [];
  let searchIndex = [];
  let averageSectionLength = 0;
  let documentFrequency = new Map();
  let loaded = 0;
  let failed = 0;
  function clean(s) {
    return String(s).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "").replace(/^\s*\|?[-:| ]{3,}\|?\s*$/gm, "")
      .replace(/\x60([^\x60]+)\x60/g, "$1").replace(/~~~[\w-]*\n?/g, "\n[[CODE_BLOCK]]\n")
      .replace(/\n{3,}/g, "\n\n").trim();
  }
  function split(md, path) {
    const lines = md.split(/\r?\n/);
    const title = (lines.find(x => /^#\s/.test(x)) || path).replace(/^#\s*/, "");
    let heading = title, buffer = [], out = [], started = false;
    function flush() {
      const body = clean(buffer.join("\n"));
      if (started && body.length > 35) out.push({ title, heading, body, path });
      buffer = [];
    }
    lines.forEach((line, i) => {
      const m = line.match(/^#{2,4}\s+(.+)/);
      if (m) {
        if (started) flush();
        else buffer = [];
        heading = m[1];
        started = true;
      } else if (started && i > 0 && !/^#\s/.test(line)) {
        buffer.push(line);
      }
    });
    flush();
    return out;
  }
  let totalDocuments = paths.length;

  async function approvedDocumentPaths() {
    try {
      const response = await fetch("./knowledge/catalog.json", { credentials: "same-origin" });
      if (!response.ok) return [];
      const catalog = JSON.parse(await response.text());
      if (!catalog || !Array.isArray(catalog.documents)) return [];
      return catalog.documents
        .filter(entry => entry && entry.approved === true &&
          typeof entry.path === "string" &&
          /^knowledge\/imported\/[a-z0-9][a-z0-9.-]*\.md$/i.test(entry.path) &&
          !entry.path.includes(".."))
        .slice(0, 50)
        .map(entry => entry.path);
    } catch (_) {
      return [];
    }
  }

  const ready = (async () => {
    const importedPaths = await approvedDocumentPaths();
    const allPaths = Array.from(new Set(paths.concat(importedPaths)));
    totalDocuments = allPaths.length;
    const groups = await Promise.all(allPaths.map(async path => {
      try {
        const response = await fetch("./" + path, { credentials: "same-origin" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        loaded++;
        return split(await response.text(), path);
      } catch (_) {
        failed++;
        return [];
      }
    }));
    sections = groups.flat();
    buildSearchIndex();
    return status();
  })();

  function status() {
    return { documents: loaded, total: totalDocuments, sections: sections.length, failed };
  }

  function recognizeTopic(query) {
    const result = retrieveDocs(query);
    if (!result || !result.best) return null;
    const neural = classify(query);
    const documentSubject = subjectFromPath(result.best.section.path, result.best.section.heading);
    const lexicalSubject = detectTopicHint(query);
    const predictedSubject = lexicalSubject || (neural.kind === "topic" && neural.confidence >= 0.2
      ? SUBJECTS[neural.intent] || null
      : null);
    const subject = lexicalSubject || documentSubject || (predictedSubject
      ? { id: predictedSubject.id, label: predictedSubject.label }
      : null);
    const confidence = Math.max(0, Math.min(0.99,
      0.28 + result.coverage * 0.48 +
      (documentSubject ? 0.12 : 0) +
      (predictedSubject && documentSubject && predictedSubject.id === documentSubject.id
        ? neural.confidence * 0.1 : 0)
    ));
    return {
      title: result.best.section.title,
      heading: result.best.section.heading,
      source: result.best.section.path,
      subject: subject ? subject.label : "Sujet documentaire",
      subjectId: subject ? subject.id : "unknown",
      questionType: detectQuestionType(query),
      confidence: Number(confidence.toFixed(2)),
      score: result.best.score,
      coverage: result.coverage,
      relatedHeadings: result.alternatives.map(item => item.section.heading).slice(0, 3),
      neuralPrediction: neural.intent,
      neuralConfidence: Number(neural.confidence.toFixed(3))
    };
  }
  const STOP_QUERY_WORDS = new Set([
    "a", "au", "aux", "avec", "ce", "ces", "cette", "dans", "de", "des", "du",
    "en", "est", "et", "la", "le", "les", "un", "une", "pour", "par", "sur",
    "mon", "ma", "mes", "moi", "me", "toi", "ton", "ta", "tes", "nous", "vous",
    "qui", "que", "quoi", "quel", "quelle", "quels", "quelles", "comment",
    "pourquoi", "explique", "expliquer", "donne", "donner", "montre", "montrer",
    "faire", "fait", "fais", "cest", "estce", "peux", "peut", "on", "il", "elle",
    "entre", "vers", "difference", "fonctionne", "fonctionner", "une", "les", "leurs",
    "je", "tu", "ils", "elles", "aide", "y", "comme"
  ]);

  const QUERY_SYNONYMS = {
    ia: ["intelligence", "artificielle"],
    intelligence: ["ia", "artificielle"],
    artificielle: ["ia", "intelligence"],
    preparer: ["preparation", "donnees", "jeu"],
    prepare: ["preparation", "donnees", "jeu"],
    preparation: ["preparer", "donnees", "dataset", "jeu"],
    reseaux: ["reseau", "neurones", "deep"],
    reseau: ["reseaux", "neurone", "deep"],
    neuronal: ["neurone", "reseau", "reseaux"],
    neuronaux: ["neurone", "reseau", "reseaux"],
    machine: ["learning", "apprentissage", "automatique"],
    learning: ["machine", "apprentissage", "automatique"],
    apprentissage: ["machine", "learning"],
    automatique: ["machine", "learning"],
    neurone: ["reseau", "deep", "neurones"],
    reseau: ["neurone", "neurones", "deep"],
    donnees: ["data", "dataset"],
    data: ["donnees", "dataset"],
    code: ["python", "programmation"],
    programmer: ["python", "programmation", "code"],
    programmation: ["python", "code"],
    condition: ["if", "else", "elif", "conditions"],
    conditions: ["condition", "if", "else", "elif"],
    boucle: ["for", "while", "range", "boucles"],
    boucles: ["boucle", "for", "while", "range"],
    liste: ["listes", "collection"],
    listes: ["liste", "collection"],
    bot: ["discord", "robot"],
    bots: ["bot", "discord"],
    discord: ["bot", "bots"],
    site: ["web", "html", "css"],
    web: ["html", "css", "javascript"],
    javascript: ["js"],
    js: ["javascript"],
    style: ["css", "mise", "forme"],
    page: ["html", "web"],
    creer: ["creation", "construire"],
    cree: ["creation", "construire", "creer"],
    creation: ["creer", "construire"],
    fonction: ["def", "return", "parametre", "fonctionnalite"],
    fonctions: ["fonction", "def", "return"],
    parametre: ["parametres", "argument", "fonction"],
    arguments: ["argument", "parametre", "fonction"],
    dictionnaire: ["dict", "cle", "valeur", "get"],
    dictionnaires: ["dictionnaire", "dict", "cle", "valeur"],
    apprentissage: ["machine", "learning", "entrainement", "modele"],
    entrainer: ["entrainement", "apprentissage", "donnees", "modele"],
    entrainement: ["entrainer", "apprentissage", "modele", "poids"],
    pdf: ["document", "texte", "extraction", "chapitre"],
    document: ["fichier", "pdf", "contenu", "texte"],
    documents: ["document", "fichier", "pdf"],
    extraire: ["extraction", "texte", "contenu"],
    extraction: ["extraire", "texte", "pdf"],
    chapitre: ["chapitres", "section", "sujet"],
    chapitres: ["chapitre", "sections", "sujets"],
    interface: ["ui", "design", "css", "ergonomie"],
    ui: ["interface", "design", "ergonomie"],
    ergonomie: ["interface", "accessibilite", "navigation"],
    responsive: ["mobile", "ecran", "adaptation", "css"],
    mobile: ["telephone", "responsive", "android"],
    securiser: ["proteger", "secret", "token", "permission"],
    securite: ["protection", "validation", "injection"],
    api: ["fetch", "json", "requete", "http"],
    evenement: ["event", "listener", "addEventListener", "clic"],
    evenements: ["evenement", "event", "listener"],
    neurones: ["neurone", "reseau", "perceptron"],
    perceptron: ["neurone", "poids", "biais", "activation"],
    poids: ["parametre", "neurone", "modele"],
    biais: ["neurone", "perceptron", "poids"],
    organiser: ["organisation", "organise", "planifier", "scolaire"],
    organisation: ["organiser", "planifier", "scolaire"],
    devoir: ["devoirs", "scolaire", "revision"],
    devoirs: ["devoir", "scolaire", "revision"],
    reviser: ["revision", "memoriser", "memorisation", "examen"],
    revision: ["reviser", "memoriser", "memorisation", "devoirs", "examen"],
    examen: ["revision", "evaluation", "controle", "epreuve"],
    etudier: ["etude", "revision", "scolaire"],
    fraction: ["fractions", "calcul", "numerateur", "denominateur"],
    fractions: ["fraction", "calcul", "numerateur", "denominateur"],
    traduire: ["traduction", "langue", "anglais", "francais"],
    traduis: ["traduction", "traduire", "langue", "anglais", "francais"],
    rediger: ["redaction", "paragraphe", "texte", "ecrire"],
    telephone: ["mobile", "android", "appareil", "depannage"],
    chronologie: ["histoire", "historique", "evenement", "date"],
    hypothese: ["observation", "experience", "science", "scientifique"]
  };

  function canonicalToken(token) {
    let value = token;
    if (value === "donnees" || value === "donnee") return "donnees";
    if (value.length > 5 && value.endsWith("x")) value = value.slice(0, -1);
    if (value.length > 5 && value.endsWith("s")) value = value.slice(0, -1);
    return value;
  }

  function getQueryTerms(query) {
    const raw = norm(query).split(/\s+/).filter(Boolean).map(canonicalToken);
    let base = Array.from(new Set(raw.filter(token =>
      !STOP_QUERY_WORDS.has(token) && token.length > 1
    )));
    if (base.length > 1 && base.includes("ia")) base = base.filter(token => token !== "ia");
    const weighted = new Map();
    base.forEach(token => {
      weighted.set(token, Math.max(weighted.get(token) || 0, 1));
      (QUERY_SYNONYMS[token] || []).forEach(synonym => {
        const key = canonicalToken(synonym);
        if (!STOP_QUERY_WORDS.has(key)) weighted.set(key, Math.max(weighted.get(key) || 0, 0.48));
      });
    });
    return { base, weighted };
  }

  function tokenizeField(value) {
    return norm(value).split(/\s+/).filter(Boolean).map(canonicalToken);
  }

  function frequency(tokens) {
    const map = new Map();
    tokens.forEach(token => map.set(token, (map.get(token) || 0) + 1));
    return map;
  }

  function bm25(tf, length, averageLength, idf) {
    if (!tf) return 0;
    const k1 = 1.35;
    const b = 0.72;
    const denominator = tf + k1 * (1 - b + b * length / Math.max(1, averageLength));
    return idf * (tf * (k1 + 1)) / denominator;
  }

  function buildSearchIndex() {
    searchIndex = sections.map(section => {
      const titleTokens = tokenizeField(section.title);
      const headingTokens = tokenizeField(section.heading);
      const bodyTokens = tokenizeField(section.body);
      return {
        section,
        titleTokens,
        headingTokens,
        bodyTokens,
        titleCounts: frequency(titleTokens),
        headingCounts: frequency(headingTokens),
        bodyCounts: frequency(bodyTokens),
        allTokens: new Set(titleTokens.concat(headingTokens, bodyTokens)),
        bodyLength: bodyTokens.length
      };
    });
    averageSectionLength = searchIndex.reduce((sum, item) => sum + item.bodyLength, 0) / Math.max(1, searchIndex.length);
    documentFrequency = new Map();
    searchIndex.forEach(item => {
      item.allTokens.forEach(token => documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1));
    });
  }

  function retrieveDocs(query) {
    if (!searchIndex.length) return null;
    const queryData = getQueryTerms(query);
    if (!queryData.base.length) return null;

    const neural = classify(query);
    const lexicalSubject = detectTopicHint(query);
    const predictedSubject = lexicalSubject || (neural.kind === "topic" && neural.confidence >= 0.2
      ? SUBJECTS[neural.intent] || null
      : null);
    const subjectStrength = lexicalSubject ? 1 : neural.confidence;
    const ranked = searchIndex.map(item => {
      let score = 0;
      const matchedTokens = [];
      queryData.base.forEach(token => {
        const df = documentFrequency.get(token) || 0;
        const idf = Math.log(1 + (searchIndex.length - df + 0.5) / (df + 0.5));
        const titleTf = item.titleCounts.get(token) || 0;
        const headingTf = item.headingCounts.get(token) || 0;
        const bodyTf = item.bodyCounts.get(token) || 0;
        const synonymHit = (QUERY_SYNONYMS[token] || []).some(synonym =>
          item.allTokens.has(canonicalToken(synonym))
        );
        if (titleTf || headingTf || bodyTf || synonymHit) matchedTokens.push(token);
        score += 2.1 * bm25(titleTf, item.titleTokens.length, 8, idf);
        score += 3.0 * bm25(headingTf, item.headingTokens.length, 8, idf);
        score += 1.0 * bm25(bodyTf, item.bodyLength, averageSectionLength, idf);
      });

      queryData.weighted.forEach((weight, token) => {
        if (weight >= 1 || item.allTokens.has(token)) return;
        const df = documentFrequency.get(token) || 0;
        const idf = Math.log(1 + (searchIndex.length - df + 0.5) / (df + 0.5));
        const titleTf = item.titleCounts.get(token) || 0;
        const headingTf = item.headingCounts.get(token) || 0;
        const bodyTf = item.bodyCounts.get(token) || 0;
        score += 0.55 * weight * (
          2.1 * bm25(titleTf, item.titleTokens.length, 8, idf) +
          3.0 * bm25(headingTf, item.headingTokens.length, 8, idf) +
          0.75 * bm25(bodyTf, item.bodyLength, averageSectionLength, idf)
        );
      });

      const coverage = matchedTokens.length / queryData.base.length;
      const normalizedQuery = norm(query);
      const normalizedHeading = norm(item.section.heading);
      const normalizedTitle = norm(item.section.title);
      if (normalizedQuery.length > 5 &&
          (normalizedHeading.includes(normalizedQuery) || normalizedTitle.includes(normalizedQuery))) {
        score += 4.5;
      }
      if (coverage === 1) score += 1.2;
      else if (coverage >= 0.66) score += 0.45;
      const sectionSubject = subjectFromPath(item.section.path, item.section.heading);
      const sectionSubjectMatch = predictedSubject && sectionSubject &&
        sectionSubject.id === predictedSubject.id;
      const specificPathMatch = predictedSubject && predictedSubject.paths
        .filter(prefix => prefix !== "knowledge/imported/")
        .some(prefix => item.section.path === prefix || item.section.path.startsWith(prefix));
      if (sectionSubjectMatch) {
        score += 2.8 * subjectStrength;
      } else if (specificPathMatch) {
        score += 0.75 * subjectStrength;
      } else if (predictedSubject && predictedSubject.paths.includes("knowledge/imported/") &&
          item.section.path.startsWith("knowledge/imported/")) {
        score -= (lexicalSubject ? 1.1 : 0.35) * subjectStrength;
      } else if (predictedSubject && predictedSubject.paths.includes("knowledge/imported/") &&
          item.section.path.startsWith("courses/")) {
        score -= (lexicalSubject ? 1.8 : 0.8) * subjectStrength;
      }
      return { section: item.section, score, coverage, matchedTokens };
    }).sort((a, b) => b.score - a.score);

    let best = ranked[0];
    if (queryData.base.length >= 3 && best) {
      const completeMatch = ranked.find(item =>
        item.coverage === 1 && item.score >= best.score * 0.55
      );
      if (completeMatch) best = completeMatch;
    }
    const second = ranked.find(item => item !== best) || null;
    if (!best || best.score < 0.85 || best.coverage < 0.34) return null;
    if (queryData.base.length >= 3 && best.coverage < 0.5) return null;
    if (second && second.score >= best.score * 0.98 &&
        second.coverage > best.coverage && best.coverage < 0.6) return null;

    const covered = new Set(best.matchedTokens);
    const alternatives = [];
    if (queryData.base.length >= 3 && best.coverage < 0.9) {
      const subjectPrefix = best.section.path.split("/").slice(0, 2).join("/") + "/";
      queryData.base.filter(token => !covered.has(token)).forEach(token => {
        const candidate = ranked.find(item =>
          item.section.path.startsWith(subjectPrefix) &&
          item.matchedTokens.includes(token) &&
          item.section.path + "|" + item.section.heading !== best.section.path + "|" + best.section.heading &&
          !alternatives.some(existing => existing.section.path === item.section.path && existing.section.heading === item.section.heading)
        );
        if (candidate && candidate.score >= best.score * 0.1) {
          alternatives.push(candidate);
          candidate.matchedTokens.forEach(value => covered.add(value));
        }
      });

      for (const item of ranked.slice(1, 45)) {
        if (item.score < best.score * 0.18) continue;
        const addsCoverage = item.matchedTokens.some(token => !covered.has(token));
        if (!addsCoverage) continue;
        const alreadyAdded = alternatives.some(existing =>
          existing.section.path === item.section.path && existing.section.heading === item.section.heading
        );
        if (alreadyAdded) continue;
        alternatives.push(item);
        item.matchedTokens.forEach(token => covered.add(token));
        if (covered.size / queryData.base.length >= 0.9 || alternatives.length >= 3) break;
      }
    } else {
      ranked.slice(1, 12).forEach(item => {
        if (item.section.path === best.section.path &&
            item.score >= best.score * 0.58 && item.coverage >= 0.5 &&
            alternatives.length < 2) alternatives.push(item);
      });
    }

    return { best, alternatives, candidates: ranked.slice(0, 28), queryTerms: queryData.base, coverage: covered.size / queryData.base.length };
  }
  function buildContextQuery(message, history) {
    const current = norm(message);
    const wordCount = getQueryTerms(current).base.length;
    const followUp = /\b(exemple|un exemple|pourquoi|comment faire|et ensuite|et apres|la suite|plus simple|plus simplement|detaille|developpe|continue|resume|autre exemple|et ca|avec ca|celui ci|celle ci|lequel|laquelle|et pour|et si|dans ce cas)\b/.test(current) ||
      /^(et|donc|alors|mais|avec|sans|pour|ca|cela)\b/.test(current);
    if (!Array.isArray(history) || (!followUp && wordCount > 3)) return message;

    const previousUser = history.slice(0, -1).reverse().find(item =>
      item && item.role === "user" && typeof item.content === "string"
    );
    if (!previousUser) return message;
    return previousUser.content + " " + message;
  }

  function detectQuestionType(query) {
    const text = norm(query);
    if (/\b(difference|diff|comparer|compare|comparaison|versus|vs|opposer)\b/.test(text) ||
        /\bentre\b.*\bet\b/.test(text)) return "comparison";
    if (/\b(exemple|illustrer|montre moi|un cas concret|code complet|donne le code)\b/.test(text)) return "example";
    if (/\b(comment|etapes|etape|procedure|methode|creer|construire|installer|utiliser|preparer|securiser|proteger|adapter|faire|configurer|corriger|resoudre|programmer|developper|coder|ecrire|realiser|rediger|traduire|organiser|planifier|resumer|depanner)\b/.test(text) &&
        !/\b(fonctionne|fonctionner|marche|signifie|est ce que|pourquoi)\b/.test(text)) return "procedure";
    if (/\b(c est quoi|qu est ce|definition|definis|signifie|que signifie|qui est|que represente)\b/.test(text)) return "definition";
    return "explanation";
  }

  function answerSentences(section) {
    const text = String(section.body || "")
      .replace(/~~~[\w-]*\n?/g, "")
      .replace(/\x60{3}[\w-]*\n?/g, "")
      .replace(/\r/g, "");
    const output = [];
    text.split(/\n+/).forEach(line => {
      const cleaned = line.trim().replace(/^(?:[-*]\s+|\d+[.)]\s+)/, "").trim();
      if (!cleaned || cleaned.length < 18 || cleaned.startsWith("|") || cleaned === "[[CODE_BLOCK]]") return;
      const normalizedLine = norm(cleaned);
      if (/^(?:explique|expliquer|definis|definir|definition|ecris|reponds|repondre|complete|exercice|correction|objectif|a la fin|prochaine etape|avant la lecon|avant de|avant decrire|tu sauras|tu vas|essaie de|imagine que tu veuilles|quelle valeur|si tu ne peux pas|il faut|reponds aux questions|repere|identifie|dans cette lecon|a retenir)\b/.test(normalizedLine)) return;
      if (/^(?:if|elif|else|for|while|print|return|raise|import|from|class|def|const|let|var|py\s+utilise|py\s+permet)\b|^[a-z_][\w.]*\s*=\s*|^[{}()[\]]+$|^<\/?[a-z][^>]*>/i.test(cleaned)) return;
      const pieces = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned];
      pieces.forEach(piece => {
        const sentence = piece.trim();
        if (sentence.length >= 22 && !output.includes(sentence)) output.push(sentence);
      });
    });
    return output;
  }

  function sentenceRelevance(sentence, queryData) {
    const tokens = new Set(tokenizeField(sentence));
    let score = 0;
    let matched = 0;
    const matchedTokens = [];
    queryData.base.forEach(token => {
      if (tokens.has(token)) {
        score += 2;
        matched += 1;
        matchedTokens.push(token);
      } else {
        const synonymMatch = (QUERY_SYNONYMS[token] || []).some(synonym => tokens.has(canonicalToken(synonym)));
        if (synonymMatch) {
          score += 1.25;
          matched += 1;
          matchedTokens.push(token);
        }
      }
    });
    if (/\b(est|sont|designe|signifie|permet|sert|consiste|utilise|recoit|produit)\b/i.test(sentence)) score += 0.5;
    return { score, matched, matchedTokens };
  }

  function collectEvidence(query, result, limit) {
    const queryData = getQueryTerms(query);
    const preferredPrefix = result.best.section.path.split("/").slice(0, 2).join("/") + "/";
    const evidence = [];
    const seen = new Set();

    searchIndex.forEach(indexed => {
      const section = indexed.section;
      const headingTokens = new Set(indexed.headingTokens);
      const titleTokens = new Set(indexed.titleTokens);
      const contextMatches = queryData.base.filter(token => headingTokens.has(token) || titleTokens.has(token)).length;
      const sameTopic = section.path.startsWith(preferredPrefix);

      answerSentences(section).forEach((sentence, sentenceIndex) => {
        const relevance = sentenceRelevance(sentence, queryData);
        const minimumCoverage = Math.min(2, queryData.base.length);
        const headingContext = queryData.base.length > 1 && contextMatches >= minimumCoverage;
        if (relevance.score < 1.5 && !headingContext) return;
        if (relevance.matched === 0 && !headingContext) return;
        if (relevance.matched + Math.min(contextMatches, minimumCoverage) < minimumCoverage && !sameTopic) return;
        if (queryData.base.length > 1 && relevance.matched === 1 && contextMatches === 0 && !sameTopic) return;
        if (queryData.base.includes("neurone") && !queryData.base.some(token => token === "reseau" || token === "neurone") ) return;

        const key = norm(sentence);
        if (seen.has(key)) return;
        seen.add(key);

        const headingMatches = queryData.base.filter(token => headingTokens.has(token)).length;
        const titleMatches = queryData.base.filter(token => titleTokens.has(token)).length;
        const preferredBoost = section.path.startsWith(preferredPrefix) ? 1.2 : 0;
        const headingBoost = headingMatches * 3.6 + titleMatches * 1.8;
        const contextSentenceBoost = relevance.matched === 0 ? 3.0 : 0;
        let definitionBoost = /\b(est une|est un|sont des|désigne|signifie|correspond à|se définit)\b/i.test(sentence) ? 2.2 : 0;
        if (/\b(condition imbriquée|exemple|exercice|leçon|prochaine étape)\b/i.test(sentence)) definitionBoost -= 0.8;
        const score = relevance.score + headingBoost + preferredBoost + contextSentenceBoost + definitionBoost + (sentenceIndex === 0 ? 0.25 : 0);
        evidence.push({ sentence, section, score, matched: relevance.matched, matchedTokens: relevance.matchedTokens });
      });
    });

    return evidence.sort((a, b) => b.score - a.score).slice(0, limit || 6);
  }

  function findConceptEvidence(concept) {
    const token = canonicalToken(concept);
    const ranked = searchIndex.map(item => {
      const headingText = norm(item.section.heading);
      const titleText = norm(item.section.title);
      const startsWithConcept = headingText === token || headingText.startsWith(token + " ");
      const score = (startsWithConcept ? 35 : 0) +
        (item.headingCounts.get(token) || 0) * 10 +
        (item.titleCounts.get(token) || 0) * 3 +
        Math.min(item.bodyCounts.get(token) || 0, 3) * 0.35;
      return { item, score };
    }).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);
    if (!ranked.length) return null;

    const selected = ranked[0].item;
    const sentences = answerSentences(selected.section);
    const chosen = sentences.slice(0, 3);
    return { section: selected.section, sentences: chosen };
  }

  function displayConceptName(token) {
    const labels = {
      html: "HTML", css: "CSS", javascript: "JavaScript",
      python: "Python", discord: "Discord", ia: "IA",
      machine: "Machine Learning", learning: "Machine Learning",
      reseau: "Réseau de neurones", neurone: "Réseau de neurones",
      for: "for", while: "while"
    };
    return labels[token] || token.charAt(0).toUpperCase() + token.slice(1);
  }

  function composeComparison(query) {
    const concepts = getQueryTerms(query).base;
    if (concepts.length < 2 || concepts.length > 5) return null;
    const entries = [];
    concepts.forEach(concept => {
      const evidence = findConceptEvidence(concept);
      if (evidence && evidence.sentences.length) entries.push({ concept, evidence });
    });
    if (entries.length < 2) return null;

    let answer = "Ces notions sont liées, mais elles n’ont pas le même rôle :\n\n";
    entries.forEach(entry => {
      answer += displayConceptName(entry.concept) + " : " + entry.evidence.sentences.join(" ") + "\n";
      answer += "Source : " + entry.evidence.section.path + "\n\n";
    });
    if (["html", "css", "javascript"].every(token => concepts.includes(token))) {
      answer += "En résumé : HTML organise le contenu, CSS règle son apparence et JavaScript ajoute les interactions.";
    } else {
      answer += "En résumé : chaque notion répond à un besoin différent ; on les choisit selon la tâche à accomplir.";
    }
    return answer.trim();
  }

  function extractCodeExample(result, preferredPrefix) {
    const available = result.candidates || [result.best];
    const candidates = preferredPrefix
      ? available.filter(candidate => candidate.section.path.startsWith(preferredPrefix))
      : available;
    for (const candidate of candidates) {
      const body = String(candidate.section.body || "");
      const pieces = body.split("[[CODE_BLOCK]]");
      for (let index = 1; index < pieces.length; index += 2) {
        const code = pieces[index].trim().split(/\n/).filter(Boolean);
        if (code.length < 2) continue;
        const readable = code.slice(0, 9).join("\n");
        if (/\b(if|for|while|print|def|class|import|const|let|var)\b/.test(readable)) return readable;
      }
    }
    return "";
  }

  function composeProcedure(query, result) {
    const queryData = getQueryTerms(query);
    const basePathPrefix = result.best.section.path.split("/").slice(0, 2).join("/") + "/";
    const excludedHeading = /\b(objectifs?|exercices?|corrections?|fiche de revision|validation|sommaire|ressources|mini defi|mini projet)\b/i;
    const actionHeading = /\b(preparer|preparation|creer|creation|configurer|securiser|proteger|utiliser|boucle|conditions?|liste|token|intents|lancer|adapter|responsive|nettoyer|transformer|qualite|separer|entrainement|test|donnees|jeu de donnees|evenements?|ecouteur|unittest)\b/i;
    const queryText = norm(query);
    const focus = {
      create: /\b(creer|cree|creation)\b/.test(queryText),
      prepare: /\b(preparer|preparation)\b/.test(queryText),
      secure: /\b(securiser|proteger)\b/.test(queryText),
      use: /\b(utiliser|utilise)\b/.test(queryText),
      responsive: /\b(responsive|ecran|telephone)\b/.test(queryText),
      test: /\b(test|tester|tests)\b/.test(queryText),
      listen: /\b(addEventListener|evenement|event|clic)\b/.test(queryText),
      trainModel: /\b(entrainer|entrainement|modele|model)\b/.test(queryText),
      errors: /\b(erreur|erreurs|exception|fiabiliser)\b/.test(queryText)
    };

    const ranked = (result.candidates || [result.best])
      .filter(candidate => candidate.section.path.startsWith(basePathPrefix))
      .filter(candidate => !excludedHeading.test(norm(candidate.section.heading)))
      .map(candidate => {
        const heading = norm(candidate.section.heading);
        const body = norm(candidate.section.body);
        const headingMatches = queryData.base.filter(token => heading.includes(token)).length;
        const bodyMatches = queryData.base.filter(token => body.includes(token)).length;
        let actionBoost = actionHeading.test(heading) ? 3 : 0;
        if (focus.create && /\b(creer|creation)\b/.test(heading)) actionBoost += 8;
        if (focus.prepare && /\b(preparer|qualite|nettoyer|transformer|separer|jeu de donnees)\b/.test(heading)) actionBoost += 8;
        if (focus.secure && /\b(token|proteger|secret|securiser|environnement)\b/.test(heading)) actionBoost += 8;
        if (focus.use && /\b(utiliser|choisir|boucle|for|while)\b/.test(heading)) actionBoost += 6;
        if (focus.responsive && /\b(responsive|adapter|ecrans)\b/.test(heading)) actionBoost += 8;
        if (focus.test && /\b(test|tester|unittest)\b/.test(heading)) actionBoost += 8;
        if (focus.listen && /\b(evenements?|ecouteur|listener)\b/.test(heading)) actionBoost += 8;
        if (/\bmini projet\b/.test(heading) && !focus.prepare) actionBoost -= 5;
        return {
          ...candidate,
          procedureScore: candidate.score + headingMatches * 3 + bodyMatches * 0.15 + actionBoost
        };
      })
      .sort((a, b) => b.procedureScore - a.procedureScore);

    const chosen = [];
    const seenHeadings = new Set();
    const simpleCreation = focus.create && !focus.prepare && !focus.secure &&
      !/\b(bot|discord|site|page|application)\b/.test(queryText);
    const maxSteps = simpleCreation ? 1 : (focus.create && !focus.prepare && !focus.secure ? 2 : 3);
    for (const candidate of ranked) {
      const headingKey = norm(candidate.section.heading);
      if (seenHeadings.has(headingKey)) continue;
      const sentences = answerSentences(candidate.section);
      const headingContext = queryData.base.some(token => norm(candidate.section.heading).split(/\s+/).includes(token));
      const relevant = sentences.map(sentence => ({
        sentence,
        relevance: sentenceRelevance(sentence, queryData),
        toolBoost: focus.test && /unittest/i.test(sentence) ? 3 : 0,
        eventBoost: focus.listen && /addEventListener|evenement/i.test(sentence) ? 2 : 0
      })).filter(item => (item.relevance.score >= 1.5 || headingContext) &&
        !/^(?:avant|avant d|quelle valeur|reponds|tu dois|essaie|py utilise|py permet)/i.test(norm(item.sentence)))
        .sort((a, b) => (b.relevance.score + b.toolBoost + b.eventBoost) -
          (a.relevance.score + a.toolBoost + a.eventBoost));
      const summary = relevant[0]?.sentence || "";
      if (!summary || summary.length < 25) continue;
      chosen.push({ section: candidate.section, summary });
      seenHeadings.add(headingKey);
      if (chosen.length >= maxSteps) break;
    }

    if (!chosen.length) return "";
    let answer = "Voici une démarche possible, organisée à partir des cours :\n\n";
    chosen.forEach((step, index) => {
      answer += (index + 1) + ". " + step.section.heading + "\n";
      answer += step.summary + "\n";
      answer += "Source : " + step.section.path + "\n\n";
    });
    const functionCode = focus.create && /\bpython\b/.test(queryText)
      ? extractCodeExample(result, basePathPrefix)
      : "";
    if (functionCode) {
      const codeSource = (result.candidates || [result.best]).find(candidate =>
        candidate.section.path.startsWith(basePathPrefix) &&
        String(candidate.section.body || "").includes(functionCode.split("\n")[0])
      );
      answer += "\n\nExemple en Python :\n\n```python\n" + functionCode + "\n```";
      if (codeSource) answer += "\nSource : " + codeSource.section.path;
    }

    if (focus.trainModel) {
      const inferenceSection = searchIndex.find(item =>
        item.section.path.startsWith(basePathPrefix) && /\binference\b/.test(norm(item.section.heading))
      );
      const inferenceSentence = inferenceSection &&
        answerSentences(inferenceSection.section).find(sentence => /inference/.test(norm(sentence)));
      if (inferenceSentence && !answer.includes(inferenceSentence)) {
        answer += "\n\nAprès l'entraînement — inférence : " + inferenceSentence +
          "\nSource : " + inferenceSection.section.path;
      }
    }

    if (focus.errors && /discord/.test(basePathPrefix)) {
      const logSection = searchIndex.find(item =>
        item.section.path === "courses/discord/lesson-06.md" &&
        /journ/.test(norm(item.section.heading))
      );
      const logSentence = logSection &&
        answerSentences(logSection.section).find(sentence => /journ|log/.test(norm(sentence)));
      if (logSentence && !answer.includes(logSentence)) {
        answer += "\n\nJournalisation : " + logSentence +
          "\nSource : " + logSection.section.path;
      }
    }

    if (focus.test && /discord/.test(basePathPrefix)) {
      const testSection = searchIndex.find(item =>
        item.section.path === "courses/discord/lesson-06.md" &&
        /unittest/.test(norm(item.section.heading))
      );
      const testSentence = testSection &&
        answerSentences(testSection.section).find(sentence => /unittest/.test(norm(sentence)));
      if (testSentence && !answer.includes(testSentence)) {
        answer += "\n\nPour les tests : " + testSentence +
          "\nSource : " + testSection.section.path;
      }
    }

    if (/\b(permission|permissions|role|roles|droit|droits)\b/.test(queryText)) {
      const leastPrivilege = searchIndex.find(item =>
        item.section.path === "courses/discord/lesson-05.md" &&
        /moindre privilege/.test(norm(item.section.heading))
      );
      const principle = leastPrivilege &&
        answerSentences(leastPrivilege.section).find(sentence => /moindre privilege/.test(norm(sentence)));
      if (principle) {
        answer += "\n\nRègle de sécurité : " + principle +
          "\nSource : " + leastPrivilege.section.path;
      }
    }

    answer += "\n\nSuis ces étapes dans l’ordre et vérifie le résultat après chaque étape.";
    return answer.trim();
  }

  function findDirectEvidence(query, type) {
    const queryData = getQueryTerms(query);
    const candidates = [];
    searchIndex.forEach(indexed => {
      const section = indexed.section;
      const headingTokens = new Set(indexed.headingTokens);
      const titleTokens = new Set(indexed.titleTokens);
      const contextMatches = queryData.base.filter(token => headingTokens.has(token) || titleTokens.has(token)).length;
      answerSentences(section).forEach(sentence => {
        const relevance = sentenceRelevance(sentence, queryData);
        const minimumCoverage = Math.min(2, queryData.base.length);
        const headingContext = queryData.base.length > 1 && contextMatches >= minimumCoverage;
        if (relevance.matched === 0 && !(type === "definition" && headingContext)) return;
        if (relevance.matched + Math.min(contextMatches, minimumCoverage) < minimumCoverage) return;
        const headingMatches = queryData.base.filter(token => headingTokens.has(token)).length;
        const titleMatches = queryData.base.filter(token => titleTokens.has(token)).length;
        const normalizedSentence = norm(sentence);
        const definitionVerb = /\b(est|sont|designe|signifie|correspond|represente|se definit)\b/;
        const verbIndex = normalizedSentence.search(definitionVerb);
        const subjectBeforeVerb = verbIndex > 0 && queryData.base.some(token =>
          normalizedSentence.slice(0, verbIndex).split(/\s+/).includes(token)
        );
        const contextOnlyTokens = new Set(["python", "discord", "web", "html", "css", "javascript", "ia"]);
        const topicTokens = queryData.base.filter(token => !contextOnlyTokens.has(token));
        const startsWithTopic = topicTokens.length > 0 && topicTokens.some(token =>
          new RegExp("^(?:(?:un|une|le|la|l|les|des|du)\\s+)?" + token + "\\b").test(normalizedSentence)
        );
        const definitionBoost = type === "definition" && subjectBeforeVerb && startsWithTopic ? 28 : 0;
        const contextSentenceBoost = 0;
        const narrowDefinitionPenalty = /\b(imbriquee|particulier|exemple)\b/.test(normalizedSentence) ? 1.5 : 0;
        const explanatoryBoost = type !== "definition" && /\b(utilise|apprend|ajuste|fonctionne|permet|recoit|produit|calcule|transmet)\b/.test(normalizedSentence) ? 3.5 : 0;
        const topicDefinitionBoost = type !== "definition" && subjectBeforeVerb && startsWithTopic ? 7 : 0;
        const exampleBoost = type === "example" && /\b(exemple|par exemple|while|for|utilise)\b/.test(normalizedSentence) ? 4 : 0;
        const score = relevance.score + headingMatches * 3.5 + titleMatches * 1.8 +
          definitionBoost + contextSentenceBoost + explanatoryBoost + topicDefinitionBoost + exampleBoost - narrowDefinitionPenalty;
        candidates.push({ sentence, section, score, matched: relevance.matched });
      });
    });
    return candidates.sort((a, b) => b.score - a.score).slice(0, 30);
  }

  function composeEvidence(query, result, evidence, type) {
    if (!evidence.length) {
      return "J’ai retrouvé un passage dans les cours, mais je n’ai pas assez d’éléments pour en construire une réponse fiable. Reformule la question ou précise le point que tu veux comprendre.";
    }
    const chosen = [];
    const queryData = getQueryTerms(query);
    const codeExample = type === "example" ? extractCodeExample(result) : "";
    const direct = findDirectEvidence(query, type).filter(item =>
      type !== "example" || !/^(?:avant|quelle valeur|reponds|tu dois|essaie)/i.test(norm(item.sentence))
    );
    const first = direct[0] || evidence[0];
    if (first) chosen.push(first);
    if (type === "definition" && first && /\bcondition\b/i.test(first.sentence)) {
      const ifSupport = direct.find(item =>
        item.section.path === first.section.path && /\bmot[- ]clé if\b/i.test(item.sentence)
      );
      if (ifSupport && !chosen.some(item => norm(item.sentence) === norm(ifSupport.sentence))) chosen.push(ifSupport);
    }
    const maxItems = type === "definition" ? 2 : type === "explanation" ? 5 : 3;
    if (type === "explanation" && first) {
      const neighbouringSentences = answerSentences(first.section);
      const firstIndex = neighbouringSentences.findIndex(sentence => norm(sentence) === norm(first.sentence));
      if (firstIndex >= 0) {
        neighbouringSentences.slice(firstIndex + 1, firstIndex + 3).forEach(sentence => {
          if (chosen.length >= maxItems) return;
          if (chosen.some(item => norm(item.sentence) === norm(sentence))) return;
          chosen.push({ sentence, section: first.section, score: first.score * 0.9, matched: first.matched });
        });
      }
    }
    if (type === "explanation" && first) {
      const subjectPrefix = result.best.section.path.split("/").slice(0, 2).join("/") + "/";
      const covered = new Set();
      const markCovered = item => {
        const matches = sentenceRelevance(item.sentence, queryData).matchedTokens || [];
        matches.forEach(token => covered.add(token));
        tokenizeField(item.section.heading).forEach(token => {
          if (queryData.base.includes(token)) covered.add(token);
        });
      };
      chosen.forEach(markCovered);

      evidence.forEach(item => {
        if (chosen.length >= maxItems) return;
        if (!item.section.path.startsWith(subjectPrefix)) return;
        if (chosen.some(existing => norm(existing.sentence) === norm(item.sentence))) return;
        if (item.score < chosen[0].score * 0.24) return;
        const matchedTokens = item.matchedTokens ||
          sentenceRelevance(item.sentence, queryData).matchedTokens || [];
        const headingTokens = tokenizeField(item.section.heading);
        const newMatches = queryData.base.filter(token =>
          !covered.has(token) && (matchedTokens.includes(token) || headingTokens.includes(token))
        );
        if (!newMatches.length) return;
        chosen.push(item);
        newMatches.forEach(token => covered.add(token));
      });
    } else {
      evidence.forEach(item => {
        if (chosen.length >= maxItems) return;
        if (chosen.some(existing => norm(existing.sentence) === norm(item.sentence))) return;
        if (chosen.length && item.score < chosen[0].score * 0.58) return;
        if (chosen.length && item.section.path !== chosen[0].section.path) return;
        chosen.push(item);
      });
    }

    let answer = type === "definition"
      ? "En clair : " + chosen[0].sentence
      : type === "example"
        ? "Voici l’idée illustrée par les cours : " + chosen[0].sentence
        : "Voici l’explication que je peux construire à partir des cours : " + chosen[0].sentence;

    const resultHeading = result.best && result.best.section.heading;
    const queryTerms = getQueryTerms(query).base;
    const headingTokens = resultHeading ? tokenizeField(resultHeading) : [];
    const matchedHeadingTerms = queryTerms.filter(token =>
      token.length >= 4 && headingTokens.includes(token)
    );
    if (type === "explanation" && matchedHeadingTerms.length) {
      answer = "Partie du cours : " + resultHeading + "\n\n" + answer;
    }

    if (chosen.length > 1) {
      answer += "\n\nPour compléter :\n";
      chosen.slice(1).forEach(item => { answer += "- " + item.sentence + "\n"; });
    }
    if (type === "example" && codeExample) {
      const sourceCandidate = (result.candidates || [result.best]).find(candidate =>
        String(candidate.section.body || "").includes(codeExample.split("\n")[0])
      ) || result.best;
      const explanationEvidence = findDirectEvidence(query, "explanation").find(item =>
        /\b(tant que|repete un bloc|condition reste vraie|compteur|boucle)\b/i.test(item.sentence) &&
        !/^(?:avant|quelle valeur|reponds)/i.test(norm(item.sentence))
      );
      let codeFirst = "Exemple en Python :\n\n" + codeExample;
      if (explanationEvidence) codeFirst += "\n\nExplication : " + explanationEvidence.sentence;
      const sourcePaths = [sourceCandidate?.section.path, explanationEvidence?.section.path].filter(Boolean);
      codeFirst += "\n\nSource : " + Array.from(new Set(sourcePaths)).join(" ; ");
      return codeFirst;
    }
    if (type === "example") {
      const example = chosen.find(item => /\b(exemple|par exemple|analogie|imagine)\b/i.test(item.sentence));
      if (example && !answer.includes(example.sentence)) answer += "\nExemple : " + example.sentence;
    }
    if (type === "explanation" &&
        queryTerms.includes("reseau") && queryTerms.includes("neurone")) {
      const deepLearningSection = searchIndex.find(item =>
        item.section.path === "courses/ia/lesson-01.md" &&
        /deep learning/.test(norm(item.section.heading))
      );
      const layerSentence = deepLearningSection &&
        answerSentences(deepLearningSection.section).find(sentence =>
          /plusieurs couches de calcul/.test(norm(sentence))
        );
      if (layerSentence && !answer.includes(layerSentence)) {
        answer += "\n\nPour aller plus loin : " + layerSentence +
          "\nSource : " + deepLearningSection.section.path;
      }
    }

    const citedPaths = chosen.map(item => item.section.path);
    if (type === "explanation" && matchedHeadingTerms.length && result.best?.section.path) {
      citedPaths.push(result.best.section.path);
    }
    answer += "\n\nSources : " + Array.from(new Set(citedPaths)).join(" ; ");
    return answer;
  }

  function composePerceptronExplanation(result) {
    const candidates = (result.candidates || [result.best]).filter(item =>
      item.section.path === "courses/ia/lesson-06.md"
    );
    const evidence = [];
    candidates.forEach(candidate => answerSentences(candidate.section).forEach(sentence => {
      if (/\b(poids|biais|activation|perceptron|sortie|entree)\b/i.test(sentence) &&
          !evidence.includes(sentence)) evidence.push(sentence);
    }));
    const selected = [];
    ["poids", "biais", "activation"].forEach(term => {
      const sentence = evidence.find(value => norm(value).includes(term));
      if (sentence && !selected.includes(sentence)) selected.push(sentence);
    });
    evidence.forEach(sentence => {
      if (selected.length < 5 && !selected.includes(sentence)) selected.push(sentence);
    });
    if (!selected.length) return "";
    return "Un perceptron est un modèle neuronal simple. Pour comprendre son calcul :\n\n" +
      selected.map(sentence => "- " + sentence).join("\n") +
      "\n\nSource : courses/ia/lesson-06.md";
  }

  function searchDocs(query) {
    const result = retrieveDocs(query);
    if (!result) {
      return "Je n’ai pas trouvé de passage suffisamment fiable dans les cours pour répondre à cette question. Tu peux préciser le sujet ou poser une question plus ciblée. Je préfère signaler cette limite plutôt que d’inventer une réponse.";
    }
    const type = detectQuestionType(query);
    if (type === "explanation" &&
        /\b(perceptron|poids|biais|activation)\b/.test(norm(query))) {
      const perceptron = composePerceptronExplanation(result);
      if (perceptron) return perceptron;
    }
    if (type === "comparison") {
      const comparison = composeComparison(query);
      if (comparison) return comparison;
    }
    if (type === "procedure") {
      const procedure = composeProcedure(query, result);
      if (procedure) return procedure;
    }
    return composeEvidence(query, result, collectEvidence(query, result, 30), type);
  }
  function extractName(s) {
    const m = norm(s).match(/(?:je m appelle|moi c est|mon nom est|appelle moi|je suis)\s+([a-z]{2,22})/);
    if (!m || ["sun", "ia", "bien", "fatigue"].includes(m[1])) return "";
    return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }
  async function reply(message, history) {
    const text = norm(message);
    let givenName = extractName(message);
    const previousAssistant = Array.isArray(history)
      ? history.slice(0, -1).reverse().find(item => item && item.role === "assistant")
      : null;
    if (!givenName && previousAssistant && /comment puis je t appeler/.test(norm(previousAssistant.content))) {
      const singleWord = text.match(/^([a-z]{2,22})$/);
      if (singleWord && !["oui", "non", "ok", "merci", "salut", "bonjour"].includes(singleWord[1])) {
        givenName = singleWord[1].charAt(0).toUpperCase() + singleWord[1].slice(1);
      }
    }
    if (givenName) {
      try { localStorage.setItem("sun-ia-user-name", givenName); } catch (_) {}
      return "Enchanté, " + givenName + " ! Je peux t’appeler comme ça dans nos prochaines discussions sur cet appareil.";
    }
    let savedName = "";
    try { savedName = localStorage.getItem("sun-ia-user-name") || ""; } catch (_) {}
    const greeting = /\b(bonjour|salut|yo|coucou|hello|hey|bonsoir|wesh|cc)\b/.test(text);
    const how = /\b(ca va|comment vas tu|comment tu vas|tu vas bien|comment allez vous)\b/.test(text);
    const asksName = /\b(ton nom|ton prenom|tu t appelles|tu appelles comment|comment dois je t appeler|comment t appelles tu)\b/.test(text);
    if (greeting && how) return "Bonjour" + (savedName ? " " + savedName : "") + " ! Ça va bien, merci. Et toi, comment se passe ta journée ?";
    if (how && /\bet toi\b/.test(text)) return "De mon côté, tout fonctionne correctement" + (savedName ? ", " + savedName : "") + ". Et toi, comment vas-tu ?";
    const prediction = classify(message);
    if (prediction.confidence >= .34) {
      switch (prediction.intent) {
        case "greeting":
          if (greeting) return "Salut" + (savedName ? " " + savedName : "") + " ! ☀️ Je suis Sun IA. Comment ça va ?";
          break;
        case "how":
          if (how) return "Ça va bien, merci" + (savedName ? ", " + savedName : "") + " ! Et toi ?";
          break;
        case "name":
          if (asksName) return "Je m’appelle Sun IA. Et toi, comment puis-je t’appeler ?";
          break;
        case "thanks":
          if (/\b(merci|remercie)\b/.test(text)) return "Avec plaisir ! Tu peux continuer.";
          break;
        case "bye":
          if (/\b(au revoir|a bientot|a plus|bonne nuit|bonne journee|ciao|bye)\b/.test(text)) return "À bientôt ! Tes conversations restent enregistrées sur cet appareil.";
          break;
        case "identity":
          if (/\b(qui es tu|tu es qui|tu es quoi|tu es une ia|intelligence artificielle|comment tu fonctionnes)\b/.test(text)) return "Je suis Sun IA. J’utilise un petit réseau neuronal local pour reconnaître quelques intentions, puis je recherche dans les cours de l’application. Je n’ai pas encore de grand modèle de langage : mes réponses restent limitées.";
          break;
        case "help":
          if (/\b(que sais tu faire|tu peux faire quoi|comment peux tu m aider|capacites|comment utiliser sun ia)\b/.test(text)) {
            await ready;
            return "Je peux discuter simplement et rechercher des explications dans les cours Python, IA, Discord et Web chargés depuis l’application. Je fonctionne sans API externe.";
          }
          break;
        case "smalltalk":
          if (/\b(quoi de neuf|tu fais quoi|on peut discuter|parlons|tu es disponible|ca dit quoi)\b/.test(text)) return "Je suis là pour discuter avec toi et retrouver des explications dans les cours. Qu’est-ce que tu aimerais raconter ou découvrir ?";
          break;
      }
    }
    await ready;
    const contextualQuery = buildContextQuery(message, history);
    return searchDocs(contextualQuery);
  }
  window.SunBrain = {
    ready: () => ready,
    reply,
    classifyIntent: classify,
    searchDocuments: query => retrieveDocs(query),
    recognizeTopic,
    status,
    analyzeQuestion: query => {
      const topic = recognizeTopic(query);
      const prediction = classify(query);
      return {
        subject: topic ? topic.subject : "Sujet non confirmé",
        subjectId: topic ? topic.subjectId : null,
        questionType: detectQuestionType(query),
        confidence: topic ? topic.confidence : 0,
        source: topic ? topic.source : null,
        neuralClass: prediction.intent,
        neuralConfidence: prediction.confidence
      };
    },
    modelInfo: {
      version: "0.0.3",
      type: "local-feedforward-neural-message-and-topic-classifier",
      hiddenNeurons: hidden,
      intents: labels.length,
      topicClasses: Object.keys(SUBJECTS).length,
      trainingExamples: samples.length,
      inputFeatures: vocab.length,
      epochs: 280,
      trainedLocally: true
    }
  };
})();