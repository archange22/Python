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
    "pdf/lecon-03.md", "pdf/lecon-04.md",
    "knowledge/python-practice.md", "knowledge/ia-foundations.md",
    "knowledge/web-practices.md", "knowledge/discord-development.md",
    "knowledge/security-and-privacy.md"
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
    return {
      title: result.best.section.title,
      heading: result.best.section.heading,
      source: result.best.section.path,
      score: result.best.score,
      coverage: result.best.coverage
    };
  }
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
    const followUp = /\b(exemple|un exemple|pourquoi|comment faire|et ensuite|et apres|la suite|plus simple|plus simplement|detaille|developpe|continue|resume|autre exemple)\b/.test(current);
    if (!Array.isArray(history) || (!followUp && wordCount > 3)) return message;

    const previousUser = history.slice(0, -1).reverse().find(item =>
      item && item.role === "user" && typeof item.content === "string"
    );
    if (!previousUser) return message;
    return previousUser.content + " " + message;
  }

  function detectQuestionType(query) {
    const text = norm(query);
    if (/\b(difference|diff|comparer|compare|comparaison|versus|vs)\b/.test(text) ||
        /\bentre\b.*\bet\b/.test(text)) return "comparison";
    if (/\b(exemple|illustrer|montre moi|un cas concret)\b/.test(text)) return "example";
    if (/\b(comment|etapes|etape|procedure|methode|creer|construire|installer|utiliser|preparer|securiser|proteger|adapter|faire)\b/.test(text) &&
        !/\b(fonctionne|fonctionner|marche|signifie|est ce que)\b/.test(text)) return "procedure";
    if (/\b(c est quoi|qu est ce|definition|definis|signifie|que signifie)\b/.test(text)) return "definition";
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
    queryData.base.forEach(token => {
      if (tokens.has(token)) {
        score += 2;
        matched += 1;
      } else {
        const synonymMatch = (QUERY_SYNONYMS[token] || []).some(synonym => tokens.has(canonicalToken(synonym)));
        if (synonymMatch) {
          score += 1.25;
          matched += 1;
        }
      }
    });
    if (/\b(est|sont|designe|signifie|permet|sert|consiste|utilise|recoit|produit)\b/i.test(sentence)) score += 0.5;
    return { score, matched };
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

      answerSentences(section).forEach((sentence, sentenceIndex) => {
        const relevance = sentenceRelevance(sentence, queryData);
        const minimumCoverage = Math.min(2, queryData.base.length);
        const headingContext = queryData.base.length > 1 && contextMatches >= minimumCoverage;
        if (relevance.score < 1.5 && !headingContext) return;
        if (relevance.matched === 0 && !headingContext) return;
        if (relevance.matched + Math.min(contextMatches, minimumCoverage) < minimumCoverage) return;
        if (queryData.base.length > 1 && relevance.matched === 1 && contextMatches === 0) return;
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
        evidence.push({ sentence, section, score, matched: relevance.matched });
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

  function extractCodeExample(result) {
    const candidates = result.candidates || [result.best];
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
    const actionHeading = /\b(preparer|preparation|creer|creation|configurer|securiser|proteger|utiliser|boucle|conditions?|liste|token|intents|lancer|adapter|responsive|nettoyer|transformer|qualite|separer|entrainement|test|donnees|jeu de donnees)\b/i;
    const queryText = norm(query);
    const focus = {
      create: /\b(creer|cree|creation)\b/.test(queryText),
      prepare: /\b(preparer|preparation)\b/.test(queryText),
      secure: /\b(securiser|proteger)\b/.test(queryText),
      use: /\b(utiliser|utilise)\b/.test(queryText),
      responsive: /\b(responsive|ecran|telephone)\b/.test(queryText)
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
      const relevant = sentences.map(sentence => ({
        sentence,
        relevance: sentenceRelevance(sentence, queryData)
      })).filter(item => item.relevance.score >= 1.5 &&
        !/^(?:avant|avant d|quelle valeur|reponds|tu dois|essaie|py utilise|py permet)/i.test(norm(item.sentence)))
        .sort((a, b) => b.relevance.score - a.relevance.score);
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
    answer += "Suis ces étapes dans l’ordre et vérifie le résultat après chaque étape.";
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
        const exampleBoost = type === "example" && /\b(exemple|par exemple|while|for|utilise)\b/.test(normalizedSentence) ? 4 : 0;
        const score = relevance.score + headingMatches * 3.5 + titleMatches * 1.8 +
          definitionBoost + contextSentenceBoost + explanatoryBoost + exampleBoost - narrowDefinitionPenalty;
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
    const maxItems = type === "definition" ? 2 : 3;
    if (type === "explanation" && first && chosen.length < maxItems) {
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
    evidence.forEach(item => {
      if (chosen.length >= maxItems) return;
      if (chosen.some(existing => norm(existing.sentence) === norm(item.sentence))) return;
      if (chosen.length && item.score < chosen[0].score * 0.58) return;
      if (chosen.length && item.section.path !== chosen[0].section.path) return;
      chosen.push(item);
    });

    let answer = type === "definition"
      ? "En clair : " + chosen[0].sentence
      : type === "example"
        ? "Voici l’idée illustrée par les cours : " + chosen[0].sentence
        : "Voici l’explication que je peux construire à partir des cours : " + chosen[0].sentence;

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
    answer += "\n\nSources : " + Array.from(new Set(chosen.map(item => item.section.path))).join(" ; ");
    return answer;
  }

  function searchDocs(query) {
    const result = retrieveDocs(query);
    if (!result) {
      return "Je n’ai pas trouvé de passage suffisamment fiable dans les cours pour répondre à cette question. Tu peux préciser le sujet ou poser une question plus ciblée. Je préfère signaler cette limite plutôt que d’inventer une réponse.";
    }
    const type = detectQuestionType(query);
    if (type === "comparison") {
      const comparison = composeComparison(query);
      if (comparison) return comparison;
    }
    if (type === "procedure") {
      const procedure = composeProcedure(query, result);
      if (procedure) return procedure;
    }
    return composeEvidence(query, result, collectEvidence(query, result, 8), type);
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
    modelInfo: { version: "0.0.2", type: "small-feedforward-neural-intent-classifier", hiddenNeurons: hidden, intents: labels.length, trainingExamples: samples.length }
  };
})();