# Sun IA

Sun IA est une application web progressive (PWA) à identité solaire. Sa page principale contient un assistant local expérimental, les formations, une bibliothèque de cours et la Console Python 3.

## Sun Brain — assistant documentaire local 0.0.3

- Un réseau neuronal artificiel local à propagation avant, avec 24 neurones cachés, entraîné sur 224 formulations françaises réparties entre huit intentions de conversation et treize familles de sujets ; ses poids sont conservés localement après le premier entraînement.
- Classification neuronale de huit intentions sociales et de treize familles de sujets : Python, IA, Discord, Web, documents/PDF, études, mathématiques, sciences, culture, langues, rédaction, dépannage et discussion générale.
- Analyse de mots, bigrammes, préfixes, suffixes et trigrammes de caractères pour mieux reconnaître les variantes d’écriture, les abréviations et les formulations proches.
- Indexation locale du noyau documentaire de 32 fichiers Markdown : 23 leçons de cours, quatre fiches d'exercices et cinq fiches documentaires. Les imports du catalogue ne sont chargés qu'après revue explicite et présence des métadonnées de provenance, de licence, d'extraction et d'empreinte.
- Recherche documentaire pondérée (BM25), normalisation de plusieurs abréviations françaises, rapprochement de synonymes techniques et léger signal de routage issu de la classification neuronale.
- Analyse du type de demande : définition, explication, comparaison, procédure ou exemple ; contexte enrichi pour les demandes de suivi courtes.
- Composition de réponses à partir de phrases pertinentes extraites de plusieurs sections, avec attribution des fichiers sources ; les comparaisons HTML/CSS/JavaScript et les procédures multi-étapes sont prises en charge.
- Extraction d'exemples de code issus des cours, présentés avant leur explication.
- Suivi du contexte pour les demandes de précision et réponse de non-connaissance lorsque les sources sont insuffisantes.
- Réponse de non-connaissance explicite lorsque les cours ne contiennent pas de passage suffisamment pertinent.
- Tests de non-régression du moteur et de l'interface dans `tests/sun-brain.test.cjs` et `tests/sun-ui.test.cjs`, avec vérification de l'index, du cache hors connexion, du rendu et de la syntaxe JavaScript.
- Historique des conversations conservé sur l’appareil.
- Aucun service d’IA externe, aucune clé API et aucun grand modèle de langage.

**Limite importante :** ce n’est pas encore un assistant génératif comparable à ChatGPT, Claude ou Grok. Le réseau neuronal reconnaît des intentions et propose treize familles de sujets, puis la recherche documentaire sélectionne des preuves et compose des réponses à partir des passages disponibles. Cette architecture améliore le repérage du sujet, mais ne produit pas une compréhension générale du monde ni une rédaction libre de type grand modèle de langage. Sun ne peut pas garantir une réponse sur un fait absent de ses documents. Il n’apprend pas automatiquement de nouvelles connaissances à partir des conversations. Ajouter un cours à l’index améliore les documents consultables, mais ne met pas à jour les poids neuronaux.

Les fichiers principaux sont \`sun-brain.js\` (classification neuronale et recherche documentaire), \`sun-ia.js\` (interface de discussion) et \`sun-ia.css\` (présentation).

### Archive synthétique historique (hors index documentaire)

- L'ancien corpus synthétique de discussion est conservé comme artefact historique du projet, mais il est explicitement exclu de l'index documentaire et du cache des imports approuvés.
- Il ne constitue pas une source documentaire vérifiée et n'est pas utilisé pour apprendre à partir des échanges avec les utilisateurs.
- Les domaines sans document validé peuvent être reconnus comme sujets possibles, mais Sun doit s'abstenir de présenter une réponse comme documentée lorsqu'aucune source locale pertinente n'existe.
- Sun Brain peut charger jusqu'à 50 documents Markdown supplémentaires dans `knowledge/imported/` uniquement si le catalogue indique une approbation et une revue explicites, un auteur ou organisme, une source canonique HTTPS, une langue, une licence exacte et son URL, un état et une méthode d'extraction, une date de collecte et une empreinte SHA-256.
- Le Service Worker v25 applique les mêmes exigences avant de mettre en cache les textes et PDF importés. Les cours et fiches documentaires intégrés restent disponibles selon le cache hors connexion existant.
- Les archives synthétiques ne sont pas supprimées ; leur statut de publication est désactivé. Le script qui reconstruit le PDF conserve également cet état et ne peut pas les réapprouver automatiquement.

### Importer un autre PDF

Le moteur d'importation local accepte les PDF contenant une véritable couche texte. Il limite les fichiers à 30 Mo et 500 pages, extrait et normalise le texte, regroupe les passages sous les titres de chapitres, indique les pages sources et bloque l'indexation lorsqu'il repère des marqueurs d'e-mail, de téléphone ou de secrets. Sans validation, il ne produit qu'un aperçu dans `knowledge/staging/`.

Exemple après vérification manuelle de l'aperçu et de la licence :

```bash
python scripts/ingest_pdf_knowledge.py mon-document.pdf \
  --title "Guide de programmation" \
  --topic "Python et programmation" \
  --source "Documentation officielle Python" \
  --source-url "https://docs.python.org/3/" \
  --author "Python Software Foundation" \
  --language "en" \
  --license "Python Software Foundation License Version 2" \
  --license-url "https://docs.python.org/3/license.html" \
  --approve --publish-public
```

L'import crée d'abord un aperçu dans `knowledge/staging/`, dossier ignoré par Git. Pour valider un document, renseigne l'auteur ou l'organisme, l'URL canonique de la source, la langue et l'URL de la licence exacte. La date de publication reste facultative lorsqu'elle est inconnue ; la date de collecte est enregistrée automatiquement. Le script vérifie la présence et la forme HTTPS des URL, mais ne vérifie pas lui-même les droits d'auteur ni la permission de redistribution : cette vérification reste humaine et doit précéder `--approve`. Cette option enregistre la revue sans publier. Pour copier le fichier, son texte extrait et sa référence dans le dépôt public, il faut aussi indiquer explicitement `--publish-public`. N'utilise cette option que si la redistribution est autorisée ; les documents privés doivent rester hors du dépôt public. Les PDF scannés ou constitués d'images sont refusés et nécessitent un OCR séparé qui n'est pas encore intégré. Le contrôle automatique des marqueurs sensibles ne garantit pas qu'un document ne contient aucune donnée personnelle : une lecture humaine reste obligatoire.

**Limite :** le réseau neuronal classe huit intentions et treize familles de sujets ; il ne devient pas un grand modèle de langage génératif. Un sujet reconnu sans document local validé ne suffit pas à produire une réponse : Sun doit signaler l'absence de preuve. Les poids ne sont pas entraînés sur les conversations des utilisateurs.

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
