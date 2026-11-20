const CACHE_KEY = "sun-course-index-v1";
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;
const CATALOG_URL = new URL("../../courses/catalog.json", import.meta.url);

const LEGACY_PYTHON_LESSONS = ["01", "02", "03", "04"].map((number) => ({
  id: "python-" + number,
  subject: "Python Facile",
  title: "Python Facile — Leçon " + number,
  lessonNumber: number,
  url: new URL("../../pdf/lecon-" + number + ".md", import.meta.url).href
}));

const SUBJECT_NAMES = {
  python: "Python",
  ia: "Intelligence artificielle",
  discord: "Discord",
  web: "Création de sites Web"
};

const STOP_WORDS = new Set([
  "a", "ai", "au", "aux", "avec", "ce", "ces", "cet", "cette", "dans", "de",
  "des", "du", "elle", "en", "est", "et", "eux", "il", "ils", "je", "la",
  "le", "les", "leur", "lui", "ma", "mais", "me", "mes", "mon", "ne", "nos",
  "notre", "nous", "on", "ou", "par", "pas", "pour", "que", "qui", "sa", "se",
  "ses", "son", "sur", "ta", "te", "tes", "toi", "ton", "tu", "un", "une",
  "vos", "votre", "vous", "y", "c", "estce", "quoi", "comment", "faire",
  "peux", "peut", "dans", "lecon", "cours", "pdf"
]);

const SYNONYMS = {
  afficher: ["print", "affichage", "console", "montrer"],
  print: ["afficher", "affichage", "console"],
  variable: ["variables", "valeur", "stockage", "donnee"],
  variables: ["variable", "valeur", "stockage"],
  boucle: ["for", "while", "repeter", "iteration"],
  fonction: ["def", "procedure", "parametre"],
  python: ["py", "programmation", "code"],
  code: ["programmation", "python", "programme"],
  discord: ["serveur", "salon", "bot", "role"],
  bot: ["discord", "robot", "automatisation"],
  ia: ["intelligence", "artificielle", "modele", "apprentissage"],
  modele: ["ia", "intelligence", "artificielle"],
  calcul: ["addition", "soustraction", "multiplication", "division"],
  nombre: ["entier", "decimal", "numerique"],
  texte: ["chaine", "caractere", "string"],
  erreur: ["bug", "exception", "syntaxe", "corriger"],
  web: ["html", "css", "javascript", "page", "site"]
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token) &&
      (token.length > 1 || /^\d{1,2}$/.test(token)));
}

function lessonNumberFrom(value) {
  const match = String(value || "").match(/(?:leçon|lesson|lecon)[^\d]{0,8}0*(\d{1,3})/i);
  return match ? String(Number(match[1])).padStart(2, "0") : null;
}

function markdownSections(markdown, fallbackTitle) {
  const sections = [];
  let heading = fallbackTitle || "Contenu";
  let lines = [];

  const flush = () => {
    const body = lines.join("\n").trim();
    if (body) sections.push({ heading, body });
    lines = [];
  };

  for (const line of String(markdown || "").replace(/\r/g, "").split("\n")) {
    const match = line.match(/^#{1,4}\s+(.+?)\s*#*\s*$/);
    if (match) {
      flush();
      heading = match[1].trim();
    } else {
      lines.push(line);
    }
  }
  flush();

  if (!sections.length && String(markdown || "").trim()) {
    sections.push({ heading: fallbackTitle || "Contenu", body: String(markdown).trim() });
  }
  return sections;
}

function splitSection(section, maxChars = 850) {
  const paragraphs = section.body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) chunks.push(current);
      current = "";
      for (let offset = 0; offset < paragraph.length; offset += maxChars) {
        chunks.push(paragraph.slice(offset, offset + maxChars));
      }
      continue;
    }
    if (current && current.length + paragraph.length + 2 > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? current + "\n\n" + paragraph : paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function buildSearchIndex(sources) {
  const chunks = [];
  const validSources = [];

  for (const source of Array.isArray(sources) ? sources : []) {
    if (!source || typeof source.content !== "string" || !source.content.trim()) continue;
    const lessonNumber = source.lessonNumber || lessonNumberFrom(source.title) || "—";
    const label = source.label || (
      String(source.subject || "Cours") + " — Leçon " + lessonNumber
    );
    const metadata = {
      id: String(source.id || label),
      subject: String(source.subject || "Cours"),
      title: String(source.title || label),
      lessonNumber,
      label,
      url: String(source.url || "")
    };
    validSources.push(metadata);

    const sections = markdownSections(source.content, metadata.title);
    for (const section of sections) {
      for (const text of splitSection(section)) {
        const tokens = tokenize(
          metadata.subject + " " + metadata.title + " " + section.heading + " " + text
        );
        if (!tokens.length) continue;
        chunks.push({
          ...metadata,
          section: section.heading,
          text,
          tokens,
          titleTokens: tokenize(metadata.title + " " + metadata.subject),
          headingTokens: tokenize(section.heading),
          length: tokens.length
        });
      }
    }
  }

  const documentFrequency = Object.create(null);
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
    for (const term of new Set(chunk.tokens)) {
      documentFrequency[term] = (documentFrequency[term] || 0) + 1;
    }
  }

  return {
    version: 1,
    savedAt: Date.now(),
    sources: validSources,
    chunks,
    documentFrequency,
    averageLength: chunks.length ? totalLength / chunks.length : 0
  };
}

function makeCatalogSources(catalog) {
  const sources = [];
  for (const subject of Array.isArray(catalog?.subjects) ? catalog.subjects : []) {
    for (const course of Array.isArray(subject?.courses) ? subject.courses : []) {
      if (course?.available === false || !course?.content) continue;
      const number = lessonNumberFrom(course.duration || course.content) || "01";
      const subjectName = SUBJECT_NAMES[subject.id] || subject.id || "Cours";
      sources.push({
        id: String(course.id || subject.id + "-" + number),
        subject: subjectName,
        title: String(course.title || subjectName),
        lessonNumber: number,
        label: subjectName + " — Leçon " + number,
        url: new URL(course.content, CATALOG_URL).href
      });
    }
  }
  return sources;
}

function readCachedIndex() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (saved?.version === 1 && Array.isArray(saved.chunks)) return saved;
  } catch (error) {}
  return null;
}

function saveCachedIndex(index) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(index));
  } catch (error) {
    // The chat and model caches must remain usable if storage is full.
  }
}

export async function loadKnowledgeIndex(options = {}) {
  const cached = readCachedIndex();
  const forceRefresh = options.forceRefresh === true;
  if (!forceRefresh && cached && Date.now() - Number(cached.savedAt || 0) < CACHE_MAX_AGE) {
    return cached;
  }

  try {
    const catalogResponse = await fetch(CATALOG_URL.href);
    if (!catalogResponse.ok) throw new Error("Catalogue des cours indisponible.");
    const catalog = await catalogResponse.json();
    const definitions = [
      ...makeCatalogSources(catalog),
      ...LEGACY_PYTHON_LESSONS
    ];
    const unique = new Map();
    for (const source of definitions) {
      unique.set(source.id, source);
    }

    const results = await Promise.allSettled(
      [...unique.values()].map(async (source) => {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error("Impossible de lire " + source.label);
        const content = await response.text();
        const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
        return {
          ...source,
          title: source.id.startsWith("python-")
            ? (heading || source.title)
            : source.title,
          content
        };
      })
    );

    const sources = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    if (!sources.length) throw new Error("Aucune leçon n’a pu être chargée.");

    const index = buildSearchIndex(sources);
    saveCachedIndex(index);
    return index;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

export function searchKnowledge(index, query, limit = 3) {
  if (!index || !Array.isArray(index.chunks) || !index.chunks.length) return [];

  const queryTokens = tokenize(query);
  const explicitLesson = normalize(query).match(/\b(?:lecon|lesson)\s+(\d{1,2})\b/);
  const requestedLesson = explicitLesson
    ? String(Number(explicitLesson[1])).padStart(2, "0")
    : null;

  const weights = new Map();
  for (const token of queryTokens) {
    weights.set(token, Math.max(weights.get(token) || 0, 1));
    for (const synonym of SYNONYMS[token] || []) {
      if (!weights.has(synonym)) weights.set(synonym, 0.48);
    }
  }

  const resultsBySource = new Map();
  const total = index.chunks.length;
  const averageLength = Math.max(1, Number(index.averageLength || 1));
  const k1 = 1.35;
  const b = 0.72;

  for (const chunk of index.chunks) {
    if (requestedLesson && chunk.lessonNumber !== requestedLesson) continue;

    let score = 0;
    for (const [term, weight] of weights) {
      const frequency = chunk.tokens.reduce((count, token) => count + (token === term ? 1 : 0), 0);
      if (!frequency) continue;

      const df = index.documentFrequency?.[term] || 0;
      const idf = Math.log(1 + (total - df + 0.5) / (df + 0.5));
      const denominator = frequency + k1 * (
        1 - b + b * chunk.length / averageLength
      );
      score += weight * idf * (frequency * (k1 + 1)) / denominator;
      if (chunk.titleTokens.includes(term)) score += weight * idf * 1.15;
      if (chunk.headingTokens.includes(term)) score += weight * idf * 1.45;
    }

    const normalizedQuery = normalize(query);
    if (normalizedQuery.length > 4 && normalize(chunk.section).includes(normalizedQuery)) {
      score += 1.2;
    }
    if (!score && requestedLesson) score = 0.8;

    const previous = resultsBySource.get(chunk.id);
    if (!previous || score > previous.score) {
      resultsBySource.set(chunk.id, {
        id: chunk.id,
        subject: chunk.subject,
        title: chunk.title,
        lessonNumber: chunk.lessonNumber,
        label: chunk.label,
        section: chunk.section,
        url: chunk.url,
        text: chunk.text.slice(0, 950),
        score
      });
    }
  }

  return [...resultsBySource.values()]
    .filter((result) => result.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(5, limit)));
}
