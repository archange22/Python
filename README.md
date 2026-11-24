# Sun IA

Sun IA est une application web progressive (PWA) à identité solaire. Sa page principale contient un assistant local expérimental, les formations, une bibliothèque de cours et la Console Python 3.

## Sun Brain — assistant documentaire local 0.0.2

- Un petit réseau neuronal artificiel à propagation avant, avec une couche cachée de 16 neurones, entraîné localement sur des exemples de phrases ; ses poids sont conservés dans le stockage local après le premier entraînement.
- Classification de huit intentions de base : salutations, questions simples sur l’état, demande de nom, identité, remerciements, départ, demande d’aide et discussion informelle.
- Compréhension de quelques abréviations françaises courantes, comme « ccmt », « cv », « bjr » et « slt ».
- Indexation locale de 32 fichiers Markdown : 23 leçons de cours, quatre sources de leçons complémentaires et cinq fiches documentaires sur Python, l'IA, le Web, Discord et la sécurité.
- Recherche documentaire pondérée (BM25), normalisation de plusieurs abréviations françaises et rapprochement de synonymes techniques.
- Analyse du type de demande : définition, explication, comparaison, procédure ou exemple.
- Composition de réponses à partir de phrases pertinentes extraites de plusieurs sections, avec attribution des fichiers sources ; les comparaisons HTML/CSS/JavaScript et les procédures multi-étapes sont prises en charge.
- Extraction d'exemples de code issus des cours, présentés avant leur explication.
- Suivi du contexte pour les demandes de précision et réponse de non-connaissance lorsque les sources sont insuffisantes.
- Réponse de non-connaissance explicite lorsque les cours ne contiennent pas de passage suffisamment pertinent.
- Tests de non-régression du moteur et de l'interface dans `tests/sun-brain.test.cjs` et `tests/sun-ui.test.cjs`, avec vérification de l'index, du cache hors connexion, du rendu et de la syntaxe JavaScript.
- Historique des conversations conservé sur l’appareil.
- Aucun service d’IA externe, aucune clé API et aucun grand modèle de langage.

**Limite importante :** ce n’est pas encore un assistant génératif comparable à ChatGPT, Claude ou Grok. Le réseau neuronal classe des intentions simples ; le moteur documentaire sélectionne des preuves et compose des réponses à partir de phrases présentes dans les cours. Ce mécanisme est une composition extractive, pas un grand modèle de langage qui rédige librement. Sun Brain ne sait pas encore répondre à toute question ni vérifier des faits absents de ses documents. Il n’apprend pas automatiquement de nouvelles connaissances à partir des conversations. Ajouter un cours à la liste permet de l’indexer, mais n’entraîne pas les poids neuronaux.

Les fichiers principaux sont \`sun-brain.js\` (classification neuronale et recherche documentaire), \`sun-ia.js\` (interface de discussion) et \`sun-ia.css\` (présentation).

### Corpus de discussion et import PDF 0.0.2

- Corpus original de conversation française : 36 chapitres, 216 situations et 432 formulations de réponse possibles.
- Thèmes : salutations, français familier, présentation, discussion générale, demandes d'aide, école, rédaction, langues, mathématiques, Python, Web, IA, Discord, sciences, culture, sécurité, dépannage, actualité et gestion des limites.
- Le corpus original est généré de manière déterministe à partir de 36 thèmes documentaires et de six situations par thème. Le PDF produit est relu page par page avec pypdf ; les chapitres, le texte extrait et les pages sources sont ensuite inscrits au catalogue local après contrôles.
- Sun Brain peut charger jusqu'à 100 documents Markdown supplémentaires marqués `approved: true` dans `knowledge/catalog.json`, sous le chemin sécurisé `knowledge/imported/`. Il expose aussi `recognizeTopic(query)` pour retrouver le sujet, le chapitre et la source la plus pertinente.
- Le Service Worker v20 met en cache le catalogue, les textes approuvés et leurs PDF locaux afin de pouvoir les rouvrir hors connexion après leur téléchargement.
- Le catalogue indique le PDF et le texte extraits lorsqu'ils ont été générés et publiés par le workflow de construction.

### Importer un autre PDF

Le moteur d'importation local accepte les PDF contenant une véritable couche texte. Il limite les fichiers à 30 Mo et 500 pages, extrait et normalise le texte, regroupe les passages sous les titres de chapitres, indique les pages sources et bloque l'indexation lorsqu'il repère des marqueurs d'e-mail, de téléphone ou de secrets. Sans validation, il ne produit qu'un aperçu dans `knowledge/staging/`.

Exemple après vérification manuelle de l'aperçu et de la licence :

```bash
python scripts/ingest_pdf_knowledge.py mon-document.pdf \
  --title "Guide de programmation" \
  --topic "Python et programmation" \
  --source "Documentation officielle de l'éditeur" \
  --license "CC BY 4.0" \
  --approve --publish-public
```

L'import crée d'abord un aperçu dans `knowledge/staging/`, dossier ignoré par Git. `--approve` confirme la vérification manuelle, mais ne publie rien à lui seul. Pour copier le fichier, son texte extrait et sa référence dans le dépôt public, il faut aussi indiquer explicitement `--publish-public`. N'utilise cette option que pour un document dont la redistribution est autorisée ; les documents privés doivent rester hors du dépôt public. Les PDF scannés ou constitués d'images sont refusés et nécessitent un OCR séparé qui n'est pas encore intégré. Le contrôle automatique des marqueurs sensibles ne garantit pas qu'un document ne contient aucune donnée personnelle : une lecture humaine reste obligatoire.

**Limite :** le réseau neuronal de Sun classe encore huit grandes intentions ; il ne devient pas un grand modèle de langage génératif. Le corpus et l'import PDF renforcent sa recherche documentaire et donnent plusieurs formulations de réponse, mais un sujet absent des documents nécessite une source supplémentaire ou une recherche réelle séparée.

## Formations et bibliothèque

Les contenus pédagogiques restent accessibles depuis l’application :

- Python
- Intelligence artificielle
- Discord et création de bots
- Création de sites Web (HTML, CSS et JavaScript)

Les sources sont organisées dans \`courses/<parcours>/lesson-NN.md\`. Les cours et PDF d’intelligence artificielle sont conservés. Les PDF associés sont générés par le workflow \`.github/workflows/build-course-pdfs.yml\`.

### Base documentaire complémentaire de Sun

Les fiches originales du dossier `knowledge/` sont indexées localement par Sun Brain et mises en cache par le Service Worker. Elles synthétisent des notions issues de documentations officielles, avec leurs références dans `knowledge/SOURCES.md`.

Sun Brain indexe le texte Markdown validé. Pour un PDF, le script local `ingest_pdf_knowledge.py` extrait d'abord la couche texte avec pypdf, vérifie la qualité et crée un aperçu structuré ; l'application n'analyse pas directement les octets du PDF dans le navigateur. Les documents ajoutés dans le catalogue ne sont disponibles hors connexion qu'après téléchargement et mise en cache sur l'appareil.

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
