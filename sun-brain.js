(function () {
  "use strict";
  const paths = [
    "courses/ia/lesson-01.md", "courses/ia/lesson-02.md",
    "courses/ia/lesson-03.md", "courses/ia/lesson-04.md",
    "courses/python/lesson-05.md", "courses/python/lesson-06.md",
    "courses/python/lesson-07.md", "courses/discord/lesson-01.md",
    "courses/discord/lesson-02.md", "courses/discord/lesson-03.md",
    "courses/discord/lesson-04.md", "courses/web/lesson-01.md",
    "courses/web/lesson-02.md", "courses/web/lesson-03.md",
    "courses/web/lesson-04.md", "pdf/lecon-01.md", "pdf/lecon-02.md",
    "pdf/lecon-03.md", "pdf/lecon-04.md"
  ];
  const data = {
    greeting: ["bonjour", "salut", "yo", "coucou", "hello", "hey", "bonsoir", "bjr", "slt", "cc"],
    how: ["ça va", "cv", "comment ça va", "comment tu vas", "comment vas tu", "tu vas bien"],
    name: ["comment tu t appelles", "c est quoi ton nom", "quel est ton nom", "ton nom c est quoi"],
    thanks: ["merci", "merci beaucoup", "je te remercie"],
    bye: ["au revoir", "à bientôt", "bonne nuit", "ciao", "bye"],
    identity: ["tu es qui", "qui es tu", "tu es quoi", "tu es une ia"],
    help: ["que sais tu faire", "tu peux faire quoi", "comment peux tu m aider"],
    smalltalk: ["quoi de neuf", "tu fais quoi", "comment se passe ta journée", "on peut discuter", "parlons un peu", "raconte moi quelque chose", "tu es disponible", "ça dit quoi"]
  };
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\bccmt\b/g, "comment").replace(/\bcmt\b/g, "comment")
      .replace(/\bbjr\b/g, "bonjour").replace(/\bslt\b/g, "salut")
      .replace(/\bcv\b/g, "ca va").replace(/\bc\s+ets\b/g, "c est")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  function feats(s) {
    const t = norm(s).split(/\s+/).filter(Boolean);
    const out = t.slice();
    for (let i = 0; i + 1 < t.length; i++) out.push(t[i] + "_" + t[i + 1]);
    return out;
  }
  const labels = Object.keys(data);
  const vocab = Array.from(new Set(labels.flatMap(k => data[k].flatMap(feats))));
  const index = new Map(vocab.map((t, i) => [t, i]));
  const samples = [];
  labels.forEach((label, y) => data[label].forEach(phrase => {
    const x = new Array(vocab.length).fill(0);
    feats(phrase).forEach(t => { if (index.has(t)) x[index.get(t)] = 1; });
    samples.push({ x, y });
  }));
  const MODEL_CACHE_KEY = "sun-ia-neural-model-v1";
  const modelSignature = JSON.stringify(data) + "|" + vocab.join("|");

  function rand(seed) {
    let n = seed >>> 0;
    return () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function softmax(a) {
    const m = Math.max(...a), e = a.map(v => Math.exp(v - m)), sum = e.reduce((x, y) => x + y, 0);
    return e.map(v => v / sum);
  }

  function trainNetwork() {
    const random = rand(41721);
    const hiddenSize = 16;
    const w1 = Array.from({ length: hiddenSize }, () => Array.from({ length: vocab.length }, () => (random() - .5) * .2));
    const b1 = new Array(hiddenSize).fill(0);
    const w2 = Array.from({ length: labels.length }, () => Array.from({ length: hiddenSize }, () => (random() - .5) * .2));
    const b2 = new Array(labels.length).fill(0);

    for (let epoch = 0; epoch < 350; epoch++) {
      samples.forEach(sample => {
        const h = w1.map((row, j) => Math.tanh(row.reduce((sum, w, i) => sum + w * sample.x[i], b1[j])));
        const out = softmax(w2.map((row, k) => row.reduce((sum, w, j) => sum + w * h[j], b2[k])));
        const err = out.map((p, k) => p - (k === sample.y ? 1 : 0));
        const back = new Array(hiddenSize).fill(0);
        for (let k = 0; k < labels.length; k++) {
          for (let j = 0; j < hiddenSize; j++) {
            back[j] += err[k] * w2[k][j];
            w2[k][j] -= .055 * err[k] * h[j];
          }
          b2[k] -= .055 * err[k];
        }
        for (let j = 0; j < hiddenSize; j++) {
          const d = back[j] * (1 - h[j] * h[j]);
          for (let i = 0; i < vocab.length; i++) w1[j][i] -= .055 * d * sample.x[i];
          b1[j] -= .055 * d;
        }
      });
    }
    return { hidden: hiddenSize, w1, b1, w2, b2 };
  }

  function loadNetwork() {
    try {
      const saved = JSON.parse(localStorage.getItem(MODEL_CACHE_KEY) || "null");
      if (saved && saved.version === 1 && saved.signature === modelSignature &&
          Array.isArray(saved.w1) && Array.isArray(saved.w2) &&
          saved.w1.length === 16 && saved.w2.length === labels.length) return saved;
    } catch (_) {}
    const trained = trainNetwork();
    const model = { version: 1, signature: modelSignature, ...trained };
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
    const x = new Array(vocab.length).fill(0);
    feats(s).forEach(t => { if (index.has(t)) x[index.get(t)] = 1; });
    if (!x.some(Boolean)) return { intent: null, confidence: 0 };
    const h = w1.map((row, j) => Math.tanh(row.reduce((sum, w, i) => sum + w * x[i], b1[j])));
    const out = softmax(w2.map((row, k) => row.reduce((sum, w, j) => sum + w * h[j], b2[k])));
    const best = out.indexOf(Math.max(...out));
    return { intent: labels[best], confidence: out[best] };
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
      .replace(/\x60([^\x60]+)\x60/g, "$1").replace(/~~~[\w-]*\n?/g, "")
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
  const ready = Promise.all(paths.map(async path => {
    try {
      const response = await fetch("./" + path, { credentials: "same-origin" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      loaded++;
      return split(await response.text(), path);
    } catch (_) { failed++; return []; }
  })).then(groups => { sections = groups.flat(); buildSearchIndex(); return status(); });
  function status() { return { documents: loaded, total: paths.length, sections: sections.length, failed }; }
  const STOP_QUERY_WORDS = new Set([
    "a", "au", "aux", "avec", "ce", "ces", "cette", "dans", "de", "des", "du",
    "en", "est", "et", "la", "le", "les", "un", "une", "pour", "par", "sur",
    "mon", "ma", "mes", "moi", "me", "toi", "ton", "ta", "tes", "nous", "vous",
    "qui", "que", "quoi", "quel", "quelle", "quels", "quelles", "comment",
    "pourquoi", "explique", "expliquer", "donne", "donner", "montre", "montrer",
    "faire", "fait", "fais", "cest", "estce", "peux", "peut", "on", "il", "elle",
    "entre", "difference", "fonctionne", "fonctionner", "une", "les", "leurs",
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
    creation: ["creer", "construire"]
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

    const ranked = searchIndex.map(item => {
      let score = 0;
      const matchedTokens = [];
      queryData.base.forEach(token => {
        const df = documentFrequency.get(token) || 0;
        const idf = Math.log(1 + (searchIndex.length - df + 0.5) / (df + 0.5));
        const titleTf = item.titleCounts.get(token) || 0;
        const headingTf = item.headingCounts.get(token) || 0;
        const bodyTf = item.bodyCounts.get(token) || 0;
        if (titleTf || headingTf || bodyTf) matchedTokens.push(token);
        score += 2.1 * bm25(titleTf, item.titleTokens.length, 8, idf);
        score += 3.0 * bm25(headingTf, item.headingTokens.length, 8, idf);
        score += 1.0 * bm25(bodyTf, item.bodyLength, averageSectionLength, idf);
      });

      queryData.weighted.forEach((weight, token) => {
        if (weight >= 1 || item.allTokens.has(token)) return;
        const df = documentFrequency.get(token) || 0;
        const idf = Math.log(1 + (searchIndex.length - df + 0.5) / (df + 0.5));
        const tf = item.bodyCounts.get(token) || 0;
        if (tf) score += 0.55 * weight * bm25(tf, item.bodyLength, averageSectionLength, idf);
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
      return { section: item.section, score, coverage, matchedTokens };
    }).sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const second = ranked[1] || null;
    if (!best || best.score < 0.85 || best.coverage < 0.34) return null;
    if (queryData.base.length >= 3 && best.coverage < 0.5) return null;
    if (second && second.score >= best.score * 0.98 &&
        second.coverage > best.coverage && best.coverage < 0.6) return null;

    const covered = new Set(best.matchedTokens);
    const alternatives = [];
    if (queryData.base.length >= 3 && best.coverage < 0.9) {
      for (const item of ranked.slice(1, 18)) {
        if (item.score < best.score * 0.18) continue;
        const addsCoverage = item.matchedTokens.some(token => !covered.has(token));
        if (!addsCoverage) continue;
        alternatives.push(item);
        item.matchedTokens.forEach(token => covered.add(token));
        if (covered.size / queryData.base.length >= 0.9 || alternatives.length >= 3) break;
      }
    } else {
      ranked.slice(1, 3).forEach(item => {
        if (item.score >= best.score * 0.72 && item.coverage >= 0.5) alternatives.push(item);
      });
    }

    return { best, alternatives, queryTerms: queryData.base, coverage: covered.size / queryData.base.length };
  }
  function buildContextQuery(message, history) {
    const current = norm(message);
    const wordCount = getQueryTerms(current).base.length;
    const followUp = /\b(exemple|un exemple|pourquoi|comment faire|et ensuite|et apres|la suite|plus simple|plus simplement|detaille|developpe|continue|resume|autre exemple)\b/.test(current);
    if (!Array.isArray(history) || (!followUp && wordCount > 3)) return message;

    const previousUser = history.slice(0, -1).reverse().find(item =>
      item && item.role === "user" && typeof item.content === "string"
    );
    if (!previousUser) return message;
    return previousUser.content + " " + message;
  }

  function makeExcerpt(section, limit) {
    let excerpt = section.body
      .replace(/~~~[\w-]*\n?/g, "")
      .replace(/\x60{3}[\w-]*\n?/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (excerpt.length <= limit) return excerpt;
    const boundary = excerpt.lastIndexOf(". ", limit);
    const cut = boundary > Math.floor(limit * 0.55) ? boundary + 1 : limit;
    return excerpt.slice(0, cut).trim() + "…";
  }

  function searchDocs(query) {
    const result = retrieveDocs(query);
    if (!result) {
      return "Je n’ai pas trouvé de passage suffisamment fiable dans les cours pour répondre à cette question. Tu peux préciser le sujet ou poser une question plus ciblée. Je préfère signaler cette limite plutôt que d’inventer une réponse.";
    }

    const sectionsToAnswer = [result.best].concat(result.alternatives || []);
    const unique = [];
    const seen = new Set();
    sectionsToAnswer.forEach(item => {
      const key = item.section.path + "|" + item.section.heading;
      if (!seen.has(key)) { seen.add(key); unique.push(item.section); }
    });
    let answer = "Voici ce que j’ai trouvé dans les cours de l’application :\n\n";
    unique.forEach((section, index) => {
      if (index) answer += "\n\n";
      answer += section.title + "\n";
      answer += "Partie : " + section.heading + "\n\n";
      answer += makeExcerpt(section, unique.length > 1 ? 520 : 980);
      answer += "\nSource : " + section.path;
    });
    return answer;
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
    status,
    modelInfo: { type: "small-feedforward-neural-intent-classifier", hiddenNeurons: hidden, intents: labels.length, trainingExamples: samples.length }
  };
})();