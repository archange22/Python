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
  function rand(seed) {
    let n = seed >>> 0;
    return () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const random = rand(41721);
  const hidden = 16;
  const w1 = Array.from({ length: hidden }, () => Array.from({ length: vocab.length }, () => (random() - .5) * .2));
  const b1 = new Array(hidden).fill(0);
  const w2 = Array.from({ length: labels.length }, () => Array.from({ length: hidden }, () => (random() - .5) * .2));
  const b2 = new Array(labels.length).fill(0);
  function softmax(a) {
    const m = Math.max(...a), e = a.map(v => Math.exp(v - m)), sum = e.reduce((x, y) => x + y, 0);
    return e.map(v => v / sum);
  }
  for (let epoch = 0; epoch < 350; epoch++) {
    samples.forEach(sample => {
      const h = w1.map((row, j) => Math.tanh(row.reduce((sum, w, i) => sum + w * sample.x[i], b1[j])));
      const out = softmax(w2.map((row, k) => row.reduce((sum, w, j) => sum + w * h[j], b2[k])));
      const err = out.map((p, k) => p - (k === sample.y ? 1 : 0));
      const back = new Array(hidden).fill(0);
      for (let k = 0; k < labels.length; k++) {
        for (let j = 0; j < hidden; j++) {
          back[j] += err[k] * w2[k][j];
          w2[k][j] -= .055 * err[k] * h[j];
        }
        b2[k] -= .055 * err[k];
      }
      for (let j = 0; j < hidden; j++) {
        const d = back[j] * (1 - h[j] * h[j]);
        for (let i = 0; i < vocab.length; i++) w1[j][i] -= .055 * d * sample.x[i];
        b1[j] -= .055 * d;
      }
    });
  }
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
    let heading = title, buffer = [], out = [];
    function flush() {
      const body = clean(buffer.join("\n"));
      if (body.length > 35) out.push({ title, heading, body, path });
      buffer = [];
    }
    lines.forEach((line, i) => {
      const m = line.match(/^#{2,4}\s+(.+)/);
      if (m) { flush(); heading = m[1]; }
      else if (i > 0 && !/^#\s/.test(line)) buffer.push(line);
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
  })).then(groups => { sections = groups.flat(); return status(); });
  function status() { return { documents: loaded, total: paths.length, sections: sections.length, failed }; }
  function searchDocs(query) {
    let terms = norm(query).split(/\s+/).filter(t => (t.length > 2 || t === "ia") && !["comment", "pourquoi", "explique", "donne", "moi", "dans", "quoi", "cest"].includes(t));
    const expanded = terms.slice();
    terms.forEach(t => {
      if (t === "ia") expanded.push("intelligence", "artificielle");
      if (t === "neurone" || t === "neurones") expanded.push("reseau", "reseaux", "deep");
      if (t === "machine" || t === "learning") expanded.push("apprentissage", "automatique", "machine", "learning");
      if (t === "python") expanded.push("programmation");
    });
    terms = Array.from(new Set(expanded));
    let best = null;
    sections.forEach(section => {
      const headingTerms = norm(section.heading).split(/\s+/);
      const titleTerms = norm(section.title).split(/\s+/);
      const bodyTerms = norm(section.body).split(/\s+/);
      let score = 0;
      terms.forEach(term => {
        if (headingTerms.includes(term)) score += 4;
        else if (titleTerms.includes(term)) score += 0.8;
        const occurrences = bodyTerms.filter(word => word === term).length;
        score += Math.min(occurrences, 3) * 0.7;
      });
      if (!best || score > best.score) best = { section, score };
    });
    if (!best || best.score < 1) return "Je n’ai pas trouvé de passage assez pertinent dans les cours chargés. Précise le sujet et je relancerai la recherche.";
    let excerpt = best.section.body;
    if (excerpt.length > 750) excerpt = excerpt.slice(0, 740) + "…";
    return "Dans le cours « " + best.section.title + " », partie « " + best.section.heading + " » :\n\n" + excerpt + "\n\nSource : " + best.section.path;
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
    return searchDocs(message);
  }
  window.SunBrain = {
    ready: () => ready,
    reply,
    classifyIntent: classify,
    status,
    modelInfo: { type: "small-feedforward-neural-intent-classifier", hiddenNeurons: hidden, intents: labels.length, trainingExamples: samples.length }
  };
})();