const MODEL_PARTS = [
  "sun-neural-v1.part-01.txt",
  "sun-neural-v1.part-02.txt",
  "sun-neural-v1.part-03.txt",
  "sun-neural-v1.part-04.txt"
].map((file) => new URL("./models/" + file, import.meta.url));
const CONFIDENCE_THRESHOLD = 0.45;
let modelPromise = null;

function decodeBase64Bytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function decodeInt4(value, expectedLength) {
  const packed = decodeBase64Bytes(value);
  const weights = new Int8Array(expectedLength);
  for (let index = 0; index < expectedLength; index += 1) {
    const shift = (index & 1) * 4;
    const nibble = (packed[index >> 1] >> shift) & 0x0F;
    weights[index] = nibble >= 8 ? nibble - 16 : nibble;
  }
  return weights;
}

function decodeFloat32LE(value) {
  const bytes = decodeBase64Bytes(value);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const values = new Float32Array(bytes.byteLength / 4);
  for (let index = 0; index < values.length; index += 1) values[index] = view.getFloat32(index * 4, true);
  return values;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, " ")
    .trim();
}

function hashFeature(value, dimension) {
  let hash = 2166136261;
  const bytes = new TextEncoder().encode(value);
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % dimension;
}

export function extractSunFeatures(text, dimension = 512) {
  const tokens = normalizeText(text).split(/\s+/).filter(Boolean);
  const values = new Float32Array(dimension);
  const add = (feature, weight) => {
    values[hashFeature(feature, dimension)] += weight;
  };
  for (const token of tokens) add("w:" + token, 1);
  for (let index = 0; index + 1 < tokens.length; index += 1) {
    add("b:" + tokens[index] + "_" + tokens[index + 1], 0.7);
  }
  const padded = " " + tokens.join(" ") + " ";
  for (let index = 0; index + 2 < padded.length; index += 1) {
    add("c:" + padded.slice(index, index + 3), 0.15);
  }
  let norm = 0;
  for (const value of values) norm += value * value;
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let index = 0; index < values.length; index += 1) values[index] /= norm;
  }
  return values;
}

export function unpackSunModel(raw) {
  const architecture = raw?.architecture;
  const layers = raw?.layers;
  if (!architecture || !layers || architecture.input_dim !== 512 || !Array.isArray(architecture.labels)) {
    throw new Error("Le fichier SUN Neural est incomplet ou incompatible.");
  }
  return {
    labels: architecture.labels,
    inputDim: architecture.input_dim,
    hiddenDim: architecture.hidden_dim,
    hiddenWeights: decodeInt4(layers.hidden_weight_int4_b64, architecture.hidden_dim * architecture.input_dim),
    hiddenScale: layers.hidden_weight_scale,
    hiddenBias: decodeFloat32LE(layers.hidden_bias_f32le_b64),
    outputWeights: decodeInt4(layers.output_weight_int4_b64, architecture.labels.length * architecture.hidden_dim),
    outputScale: layers.output_weight_scale,
    outputBias: decodeFloat32LE(layers.output_bias_f32le_b64),
    confidenceThreshold: raw.training?.confidence_threshold || CONFIDENCE_THRESHOLD
  };
}

export async function loadSunNeural() {
  if (!modelPromise) {
    modelPromise = Promise.all(MODEL_PARTS.map(async (url) => {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) throw new Error("Impossible de lire une partie du modèle SUN Neural intégré (HTTP " + response.status + ").");
      return response.text();
    })).then((parts) => unpackSunModel(JSON.parse(parts.join("")))).catch((error) => {
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

export function predictSunIntent(text, model) {
  if (!model || !model.labels || model.labels.length === 0) throw new Error("Modèle neuronal non chargé.");
  const input = extractSunFeatures(text, model.inputDim);
  const hidden = new Float32Array(model.hiddenDim);
  for (let row = 0; row < model.hiddenDim; row += 1) {
    let value = model.hiddenBias[row];
    const offset = row * model.inputDim;
    for (let column = 0; column < model.inputDim; column += 1) {
      value += input[column] * model.hiddenWeights[offset + column] * model.hiddenScale;
    }
    hidden[row] = Math.max(0, value);
  }
  const logits = new Float32Array(model.labels.length);
  let maxLogit = -Infinity;
  for (let row = 0; row < model.labels.length; row += 1) {
    let value = model.outputBias[row];
    const offset = row * model.hiddenDim;
    for (let column = 0; column < model.hiddenDim; column += 1) {
      value += hidden[column] * model.outputWeights[offset + column] * model.outputScale;
    }
    logits[row] = value;
    if (value > maxLogit) maxLogit = value;
  }
  let total = 0;
  const probabilities = logits.map((value) => {
    const probability = Math.exp(value - maxLogit);
    total += probability;
    return probability;
  });
  for (let index = 0; index < probabilities.length; index += 1) probabilities[index] /= total;
  let bestIndex = 0;
  for (let index = 1; index < probabilities.length; index += 1) {
    if (probabilities[index] > probabilities[bestIndex]) bestIndex = index;
  }
  return {
    intent: model.labels[bestIndex],
    confidence: probabilities[bestIndex],
    accepted: model.labels[bestIndex] !== "unknown" && probabilities[bestIndex] >= model.confidenceThreshold,
    probabilities: model.labels.map((label, index) => ({ label, probability: probabilities[index] }))
      .sort((a, b) => b.probability - a.probability)
  };
}

const ANSWERS = {
  greeting: "Bonjour ! Je suis SUN Neural, un petit modèle neuronal intégré à Académique. Je peux répondre à quelques questions ciblées sur les bases de Python. Pour les demandes plus larges, la version actuelle ne sait pas encore générer une réponse adaptée.",
  python_variable_equal: "En Python, une variable sert à garder une valeur sous un nom.\n\nExemple :\nnom = \"Awa\"\nage = 15\n\nAttention : le signe = affecte une valeur. Le signe == compare deux valeurs et donne True ou False.\n\nExemple :\nage == 15  # True",
  python_control_flow: "Les conditions permettent de choisir quoi faire. Les boucles permettent de répéter des instructions.\n\nCondition :\nage = 15\nif age >= 18:\n    print(\"Majeur\")\nelse:\n    print(\"Mineur\")\n\nBoucle :\nfor nombre in range(3):\n    print(nombre)\n\nLa boucle affiche 0, puis 1, puis 2.",
  python_function: "Une fonction regroupe des instructions que tu peux réutiliser. On la définit avec def.\n\nExemple :\ndef addition(a, b):\n    return a + b\n\nresultat = addition(3, 4)\nprint(resultat)  # 7\n\nLes paramètres a et b reçoivent les valeurs envoyées à la fonction. return renvoie le résultat.",
  python_collections: "Python propose plusieurs collections.\n\nUne liste conserve plusieurs éléments dans un ordre :\nnotes = [12, 15, 18]\nprint(notes[0])  # 12\n\nUn dictionnaire associe des clés à des valeurs :\neleve = {\"nom\": \"Awa\", \"age\": 15}\nprint(eleve[\"nom\"])  # Awa",
  python_input_files: "La fonction input() demande un texte à l'utilisateur. Même un nombre saisi est reçu comme du texte :\nage_texte = input(\"Ton âge : \")\nage = int(age_texte)\nprint(age + 1)\n\nPour lire un fichier texte :\nwith open(\"notes.txt\", \"r\", encoding=\"utf-8\") as fichier:\n    contenu = fichier.read()\n\nVérifie que le fichier existe et que le chemin est correct.",
  python_error: "Pour comprendre une erreur Python, lis le traceback de bas en haut. La dernière ligne donne généralement le type d'erreur et son message. Repère ensuite le fichier et le numéro de ligne indiqué. Vérifie les noms de variables, les deux-points après les conditions et fonctions, l'indentation et les types de données.\n\nSUN Neural peut t'aider sur les erreurs courantes, mais il faut le code et le message exact pour diagnostiquer un cas précis.",
  python_beginner: "Pour commencer Python, avance dans cet ordre :\n1. print() et les commentaires.\n2. Variables et types : int, float, str et bool.\n3. Calculs et comparaisons.\n4. Conditions if / elif / else.\n5. Boucles for et while.\n6. Listes et dictionnaires.\n7. Fonctions avec def et return.\n\nAprès chaque notion, écris un petit programme et teste-le.",
  unknown: "Cette version de SUN Neural est encore spécialisée sur quelques notions de base de Python. Je n'ai pas identifié une réponse suffisamment fiable. Reformule la question ou consulte les passages retrouvés dans la bibliothèque de cours."
};

export async function generateSunNeuralReply(message, sources = []) {
  const model = await loadSunNeural();
  const prediction = predictSunIntent(message, model);
  let text = prediction.accepted ? ANSWERS[prediction.intent] : ANSWERS.unknown;
  const source = Array.isArray(sources) ? sources.find((item) => item && typeof item.text === "string") : null;
  if (source && prediction.accepted) {
    const excerpt = source.text.replace(/\s+/g, " ").trim().slice(0, 420);
    if (excerpt) text += "\n\nPassage retrouvé dans la bibliothèque :\n" + excerpt;
  }
  return { text, intent: prediction.intent, confidence: prediction.confidence, accepted: prediction.accepted };
}
