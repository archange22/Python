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

function compactAliases(value) {
  return value
    .replace(/\bcv\b/g, "ca va")
    .replace(/\bcava\b/g, "ca va")
    .replace(/\bsava\b/g, "ca va")
    .replace(/\bslt\b/g, "salut")
    .replace(/\bbjr\b/g, "bonjour")
    .replace(/\bbcp\b/g, "beaucoup")
    .replace(/\bstp\b/g, "s il te plait")
    .replace(/\bsvp\b/g, "s il vous plait");
}

function lastAssistantMessage(history) {
  if (!Array.isArray(history)) return "";
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]?.role === "assistant") return normalizeInput(history[i].content);
  }
  return "";
}

export function getSmallTalkReply(message, history = []) {
  const value = compactAliases(normalizeInput(message));
  if (!value) return null;

  const greetings = /^(bonjour|bonsoir|salut|coucou|cc|yo|hey|hello|wesh)$/;
  const greetingWithFollowUp = /^(bonjour|bonsoir|salut|coucou|cc|yo|hey|hello|wesh) (ca va|comment ca va|comment vas tu|comment tu vas|tu vas bien|ca roule)$/;
  const howAreYou = /^(ca va|comment ca va|comment vas tu|comment tu vas|tu vas bien|ca roule)$/;

  if (greetings.test(value)) {
    return "Bonjour ! Je suis SUN, l’assistant d’Académique. Tu peux me parler normalement, me poser une question ou chercher une notion dans les leçons.";
  }
  if (greetingWithFollowUp.test(value) || howAreYou.test(value)) {
    return "Je fonctionne correctement, merci ! Et toi, comment ça va ?";
  }
  if (/^(et toi|et toi ca va|et toi comment ca va)$/.test(value)) {
    return "Je fonctionne correctement et je suis prêt à t’aider. Tu veux parler de quoi ?";
  }
  if (/^(je vais bien|ca va bien|tres bien|super|tranquille|nickel|bien merci|ca va merci|rien de special|rien de nouveau|pas grand chose)( et toi)?$/.test(value)) {
    return "Tant mieux ! Qu’est-ce que tu aimerais faire ou découvrir aujourd’hui ?";
  }
  if (/^(pas trop|pas tres bien|ca va pas|je ne vais pas bien|bof|fatigue|fatiguee|fatigue)$/.test(value)) {
    return "D’accord. Tu peux m’expliquer ce qui te préoccupe, ou on peut parler d’un sujet qui te change les idées.";
  }
  if (/^(merci|merci beaucoup|merci bcp|thx|thanks)$/.test(value)) {
    return "Avec plaisir. Tu peux continuer, je suis disponible pour t’aider.";
  }
  if (/^(au revoir|a bientot|a plus|bonne nuit|bye|ciao|a demain)$/.test(value)) {
    return "À bientôt ! Tu pourras reprendre la discussion quand tu reviendras.";
  }
  if (/^(qui es tu|tu es qui|c est qui|ton nom|comment tu t appelles|tu t appelles comment)$/.test(value)) {
    return "Je suis SUN, l’assistant intégré à Académique. Je peux discuter sur des sujets courants, rechercher dans les leçons et utiliser un modèle local pour les réponses plus développées.";
  }
  if (/^(tu fais quoi|que fais tu|tu fais quoi la|quoi de neuf|ca dit quoi|tu racontes quoi)$/.test(value)) {
    return "Je suis prêt à discuter, à chercher dans les cours d’Académique ou à t’aider à comprendre une notion.";
  }
  if (/^(tu peux m aider|tu peux aider|aide moi|on peut discuter|tu es la|t es la)$/.test(value)) {
    return "Oui. Tu peux écrire directement ici, même sans télécharger de modèle. Je peux gérer les échanges courants et rechercher dans les leçons déjà disponibles.";
  }
  if (/^(je veux discuter|parlons|on parle|parle moi|raconte moi quelque chose)$/.test(value)) {
    return "D’accord. On peut parler de programmation, de jeux, de sciences, de technologie ou d’un sujet de ton choix. Qu’est-ce qui t’intéresse ?";
  }
  if (/^(comment utiliser sun|comment te parler|comment poser une question|comment chercher un cours)$/.test(value)) {
    return "Écris ta question comme tu la formulerais à une personne. Pour retrouver une leçon, donne le sujet ou le mot-clé ; je peux indiquer le parcours, le numéro de leçon et la section.";
  }
  if (/^(tu peux lire les pdf|tu lis les pdf|tu peux lire un pdf)$/.test(value)) {
    return "Je peux rechercher dans les leçons d’Académique déjà indexées. Pour l’instant, les PDF de cours sont lus à partir de leurs sources Markdown ; les PDF importés manuellement ne sont pas encore pris en charge.";
  }
  if (/^(tu peux fonctionner sans modele|tu marches sans modele|sans telecharger|sans modele)$/.test(value)) {
    return "Oui pour les échanges courants et la recherche dans les leçons déjà chargées. Pour rédiger librement des réponses complexes, il faut un modèle local ou un service IA en ligne.";
  }

  const previous = lastAssistantMessage(history);
  if (/^(oui|ouais|yep|ok|d accord)$/.test(value) &&
      /et toi|qu est ce que tu aimerais|tu peux m expliquer/.test(previous)) {
    return "Très bien. Dis-moi ce que tu souhaites faire, et je te guiderai.";
  }
  if (/^(non|nan|pas vraiment)$/.test(value) && /et toi|comment ca va/.test(previous)) {
    return "Pas de souci. On peut parler d’autre chose si tu préfères.";
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

  const missing = unique.filter((source) =>
    !text.toLowerCase().includes(source.label.toLowerCase())
  );
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
