function normalizeInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSmallTalkReply(message) {
  const value = normalizeInput(message);
  if (!value) return null;

  const greetings = /^(bonjour|bonsoir|salut|slt|bjr|coucou|cc|yo|hey|hello)$/;
  const greetingWithFollowUp = /^(bonjour|bonsoir|salut|slt|bjr|coucou|cc|yo|hey|hello) (cv|cava|ca va|comment ca va|comment vas tu|comment tu vas|tu vas bien|ca roule)$/;
  const howAreYou = /^(cv|cava|ca va|comment ca va|comment vas tu|comment tu vas|tu vas bien|ca roule)$/;

  if (greetings.test(value)) {
    return "Bonjour ! Je suis SUN, l’assistant d’Académique. Tu peux me parler normalement ou me poser une question sur les cours.";
  }
  if (greetingWithFollowUp.test(value) || howAreYou.test(value)) {
    return "Je suis opérationnel, merci ! Et toi, comment ça va ?";
  }
  if (/^(merci|merci beaucoup|merci bcp|thx|thanks)$/.test(value)) {
    return "Avec plaisir. Tu peux continuer, je suis là pour t’aider.";
  }
  if (/^(au revoir|a bientot|a plus|bonne nuit|bye|ciao)$/.test(value)) {
    return "À bientôt ! Tu pourras reprendre la discussion quand tu reviendras.";
  }
  if (/^(qui es tu|tu es qui|c est qui|ton nom|comment tu t appelles|tu t appelles comment)$/.test(value)) {
    return "Je suis SUN, l’assistant intégré à Académique. Je peux discuter, expliquer les cours et rechercher des informations dans les leçons disponibles.";
  }
  if (/^(tu peux m aider|tu peux aider|aide moi|on peut discuter|tu es la)$/.test(value)) {
    return "Oui. Tu peux me parler normalement ou me poser directement ta question. Pour les explications détaillées, charge un modèle local.";
  }
  return null;
}

export function appendSourceReferences(response, sources) {
  const text = String(response || "").trim();
  const unique = [];
  const seen = new Set();

  for (const source of Array.isArray(sources) ? sources : []) {
    if (!source?.label || seen.has(source.label)) continue;
    seen.add(source.label);
    unique.push(source);
  }
  if (!unique.length) return text;

  const missing = unique.filter((source) => !text.toLowerCase().includes(source.label.toLowerCase()));
  if (!missing.length) return text;

  const references = missing.slice(0, 3).map((source) => {
    const section = source.section && source.section !== source.title
      ? " · " + source.section
      : "";
    return "- " + source.label + section;
  });
  const heading = references.length > 1
    ? "Références retrouvées dans les cours :"
    : "Référence retrouvée dans les cours :";
  return (text || "Voici les passages du cours que j’ai retrouvés.") +
    "\n\n" + heading + "\n" + references.join("\n");
}
