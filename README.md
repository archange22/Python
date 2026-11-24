# Sun IA

Sun IA est une application web progressive (PWA) à identité solaire. Sa page principale contient un assistant local expérimental, les formations, une bibliothèque de cours et la Console Python 3.

## Sun Brain — version locale 1.2

- Un petit réseau neuronal artificiel à propagation avant, avec une couche cachée de 16 neurones, entraîné localement sur des exemples de phrases ; ses poids sont conservés dans le stockage local après le premier entraînement.
- Classification de huit intentions de base : salutations, questions simples sur l’état, demande de nom, identité, remerciements, départ, demande d’aide et discussion informelle.
- Compréhension de quelques abréviations françaises courantes, comme « ccmt », « cv », « bjr » et « slt ».
- Indexation locale de 24 fichiers Markdown : cours Python, IA, Discord et Web, complétés par cinq fiches françaises sur Python avancé, les fondamentaux IA, les pratiques Web, le développement Discord et la sécurité.
- Recherche documentaire pondérée (BM25), normalisation de plusieurs abréviations françaises et rapprochement de synonymes techniques.
- Analyse du type de demande : définition, explication, comparaison, procédure ou exemple.
- Composition de réponses à partir de phrases pertinentes extraites de plusieurs sections, avec attribution des fichiers sources ; les comparaisons HTML/CSS/JavaScript et les procédures multi-étapes sont prises en charge.
- Extraction d'exemples de code issus des cours, présentés avant leur explication.
- Suivi du contexte pour les demandes de précision et réponse de non-connaissance lorsque les sources sont insuffisantes.
- Réponse de non-connaissance explicite lorsque les cours ne contiennent pas de passage suffisamment pertinent.
- Tests de non-régression automatisés dans `tests/sun-brain.test.cjs`, exécutés par GitHub Actions sur les modifications du cerveau et des cours.
- Historique des conversations conservé sur l’appareil.
- Aucun service d’IA externe, aucune clé API et aucun grand modèle de langage.

**Limite importante :** ce n’est pas encore un assistant génératif comparable à ChatGPT, Claude ou Grok. Le réseau neuronal classe des intentions simples ; le moteur documentaire sélectionne des preuves et compose des réponses à partir de phrases présentes dans les cours. Ce mécanisme est une composition extractive, pas un grand modèle de langage qui rédige librement. Sun Brain ne sait pas encore répondre à toute question ni vérifier des faits absents de ses documents. Il n’apprend pas automatiquement de nouvelles connaissances à partir des conversations. Ajouter un cours à la liste permet de l’indexer, mais n’entraîne pas les poids neuronaux.

Les fichiers principaux sont \`sun-brain.js\` (classification neuronale et recherche documentaire), \`sun-ia.js\` (interface de discussion) et \`sun-ia.css\` (présentation).

## Formations et bibliothèque

Les contenus pédagogiques restent accessibles depuis l’application :

- Python
- Intelligence artificielle
- Discord et création de bots
- Création de sites Web (HTML, CSS et JavaScript)

Les sources sont organisées dans \`courses/<parcours>/lesson-NN.md\`. Les cours et PDF d’intelligence artificielle sont conservés. Les PDF associés sont générés par le workflow \`.github/workflows/build-course-pdfs.yml\`.

### Base documentaire complémentaire de Sun

Les fiches originales du dossier `knowledge/` sont indexées localement par Sun Brain et mises en cache par le Service Worker. Elles synthétisent des notions issues de documentations officielles, avec leurs références dans `knowledge/SOURCES.md`.

Sun Brain lit actuellement le Markdown ; il ne décode pas directement les fichiers PDF binaires. Pour les intégrer ultérieurement, le texte d'un PDF devra être extrait et vérifié avant d'être ajouté comme document indexable. Aucun service d'IA payant ni aucune conversation privée ne sert à constituer cette base.

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
