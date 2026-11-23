# Sun IA

Sun IA est une application web progressive (PWA) à identité solaire. Sa page principale contient un assistant local expérimental, les formations, une bibliothèque de cours et la Console Python 3.

## Sun Brain — version locale 1

- Un petit réseau neuronal artificiel à propagation avant, avec une couche cachée de 16 neurones, entraîné localement sur des exemples de phrases ; ses poids sont conservés dans le stockage local après le premier entraînement.
- Classification de huit intentions de base : salutations, questions simples sur l’état, demande de nom, identité, remerciements, départ, demande d’aide et discussion informelle.
- Compréhension de quelques abréviations françaises courantes, comme « ccmt », « cv », « bjr » et « slt ».
- Indexation locale de 19 fichiers pédagogiques en Markdown : cours Python, IA, Discord et Web.
- Recherche de passages pertinents dans les cours, avec le chemin du document source dans la réponse.
- Historique des conversations conservé sur l’appareil.
- Aucun service d’IA externe, aucune clé API et aucun grand modèle de langage.

**Limite importante :** ce n’est pas encore un assistant génératif comparable à ChatGPT, Claude ou Grok. Le réseau neuronal classe des intentions simples ; un moteur distinct recherche des extraits dans les cours. Il ne comprend pas librement toutes les phrases et n’apprend pas encore automatiquement de nouvelles connaissances à partir des conversations. L’ajout d’un nouveau cours à la liste de documents permet de l’indexer, mais n’entraîne pas les poids du réseau neuronal.

Les fichiers principaux sont \`sun-brain.js\` (classification neuronale et recherche documentaire), \`sun-ia.js\` (interface de discussion) et \`sun-ia.css\` (présentation).

## Formations et bibliothèque

Les contenus pédagogiques restent accessibles depuis l’application :

- Python
- Intelligence artificielle
- Discord et création de bots
- Création de sites Web (HTML, CSS et JavaScript)

Les sources sont organisées dans \`courses/<parcours>/lesson-NN.md\`. Les cours et PDF d’intelligence artificielle sont conservés. Les PDF associés sont générés par le workflow \`.github/workflows/build-course-pdfs.yml\`.

## Console Python 3

La Console Python 3 (\`apps/python-console-3/\`) reste une application indépendante. Elle utilise CPython avec Pyodide/WebAssembly. Une première initialisation en ligne est nécessaire pour mettre son moteur Python en cache ; les scripts utilisant les ressources déjà téléchargées peuvent ensuite fonctionner hors connexion.

## Données et confidentialité

Les conversations et le prénom éventuellement fourni sont conservés dans le stockage local du navigateur. Le moteur Sun Brain lit les fichiers pédagogiques hébergés avec l’application et le Service Worker les met en cache pour un usage hors connexion après leur téléchargement. Aucun texte de conversation n’est envoyé à une API externe.

## Installation

Sun IA peut être installé depuis un navigateur compatible sous forme de PWA. Cette version ne fournit pas encore de fichier APK indépendant. Une publication sur Google Play nécessitera une étape distincte de packaging, de signature et de vérification des exigences Google.

## Contact

archangekouaho@gmail.com

## Site

https://archange22.github.io/Python/
