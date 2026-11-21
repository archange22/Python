# Académique

Académique est une application web progressive (PWA) consacrée à quatre parcours : Python, intelligence artificielle, Discord et création de sites Web.

## Fonctionnalités

- Interface responsive pour Android, tablette et ordinateur.
- Thème sombre et thème clair.
- Accueil, formations, bibliothèque et espace de progression.
- Recherche parmi les cours et les leçons en préparation.
- Lecture des cours directement dans l’application.
- Téléchargement des documents PDF lorsqu’ils sont publiés.
- Favoris, historique, notes personnelles et reprise de lecture.
- Progression conservée localement sur l’appareil.
- Installation PWA depuis un navigateur compatible.
- Cache hors connexion pour l’interface et les contenus déjà chargés.

## Installation

Sur le site GitHub Pages, ouvre « À propos » puis « Installer Académique ». Selon le navigateur et l’appareil, l’installation est proposée directement ou expliquée étape par étape.

Cette version est une PWA. Elle ne fournit pas encore de fichier APK indépendant. Une publication sur Google Play nécessitera une étape distincte de packaging, de signature et de vérification des exigences Google.

## Parcours pédagogiques

- Python
- Intelligence artificielle
- Discord et création de bots
- Création de sites Web (HTML, CSS et JavaScript)

Les cours disponibles doivent intégrer les explications, exemples, exercices et corrections dans le même document. Les leçons en préparation restent identifiées comme telles dans la bibliothèque.

## Données personnelles

La progression, les favoris, les notes et l’historique sont conservés dans le stockage local du navigateur. Cette version ne demande pas de compte et ne synchronise pas les données entre plusieurs appareils.

## Contact

archangekouaho@gmail.com

## Site

https://archange22.github.io/Python/



## Applications complémentaires

Académique regroupe trois applications distinctes :

- **Académique** : formations et bibliothèque de cours.
- **Console Python 3** (apps/python-console-3/) : interpréteur CPython avec Pyodide/WebAssembly. Une première initialisation en ligne est nécessaire pour mettre le moteur en cache ; les scripts utilisant la bibliothèque standard peuvent ensuite être exécutés hors connexion.
- **SUN** (apps/chat-ia/) : assistant conversationnel local avec un seul modèle IA, nommé **SUN** dans l'application. Son moteur génératif est basé sur Qwen3-0.6B-Instruct (ONNX, licence Apache 2.0), exécuté avec Transformers.js et ONNX Runtime Web. WebGPU q4f16 est utilisé lorsque disponible, avec un repli WASM int8. SUN conserve un historique court, dialogue librement dans les limites d'un petit modèle et utilise la recherche documentaire pour exploiter les leçons et documents importés. Le modèle est lourd pour un téléphone d'entrée de gamme : environ 648 Mio de poids en WebGPU ou 754 Mio en WASM, plus les fichiers auxiliaires. La personnalisation par LoRA est préparée mais n'a pas encore été entraînée ni exportée dans l'application.
- Les statistiques d'initialisation sont conservées localement sur l'appareil et ne sont pas envoyées à un serveur.
- En cas de coupure, les fichiers entièrement téléchargés et mis en cache peuvent être réutilisés. Le navigateur ne reprend pas nécessairement au dernier octet un fichier dont le transfert a été interrompu.

Les applications complémentaires possèdent leurs propres pages, manifestes et Service Workers. Les conversations et les scripts ne sont pas synchronisés entre les appareils. La recherche documentaire de SUN conserve localement un index des leçons déjà téléchargées ; le premier chargement des sources nécessite une connexion.

### SUN : dialogue génératif et mémoire documentaire

Le sélecteur d'Académique ne propose qu'un modèle : SUN. Le moteur neuronal conversationnel est un Transformer autoregressif d'environ 0,6 milliard de paramètres, basé sur Qwen3-0.6B-Instruct converti en ONNX. Le nom affiché dans l'application est SUN ; le modèle de base reste attribué dans la documentation et dans `training/sun-model.json`. Le modèle répond aux questions générales, tient compte d'un historique court et peut s'appuyer sur les passages retrouvés par recherche BM25. La qualité reste limitée par la taille du modèle et par les ressources du téléphone.

La mémoire documentaire est différente de l'entraînement des poids. Quand un PDF est importé, SUN extrait son texte, le stocke localement dans IndexedDB et l'ajoute à l'index BM25. Lors d'une question, les extraits pertinents sont injectés dans le contexte de SUN et cités dans la réponse. Supprimer le document le retire de la mémoire documentaire ; cela ne modifie pas les poids neuronaux.

Le système d'importation actuel sait lire les PDF contenant du texte sélectionnable. Limites : 12 Mo, 120 pages, 160 000 caractères extraits par document, 20 documents et 2 millions de caractères cumulés. Les PDF scannés sans couche texte nécessitent encore un OCR qui n'est pas implémenté. Les fichiers originaux ne sont pas envoyés à un serveur par le module d'importation ; le texte extrait reste dans le stockage local du navigateur.

La personnalisation neuronale est préparée dans `training/` : 126 exemples originaux en français et en anglais, couvrant les mathématiques, la physique, la chimie, Python, JavaScript, Java, C, HTML/CSS, SQL et les dialogues ; séparation stratifiée train/validation/test ; benchmark de 37 questions ; fine-tuning SFT/LoRA ; fusion de l'adaptateur et génération de réponses de test. **L'entraînement LoRA n'a pas encore été exécuté.** Le modèle actuellement utilisé par la PWA est toujours le checkpoint ONNX de base non adapté. La fusion d'un adaptateur n'est pas à elle seule un export navigateur : le checkpoint doit encore être converti en ONNX, quantifié et validé avant de remplacer le modèle.

Limites : SUN reste un petit modèle et peut produire des erreurs, des approximations ou du code incorrect. Son cache WebGPU q4f16 nécessite environ 648 Mo de poids ; le repli WASM int8 environ 754 Mo, auxquels s'ajoutent les fichiers du tokenizer et la mémoire de calcul. Certains téléphones ne pourront pas le charger. Voir `training/README.md` pour l'architecture, les étapes de mémoire documentaire et la personnalisation supervisée.

## Leçons quotidiennes et bibliothèque

Le catalogue dynamique se trouve dans `courses/catalog.json`. Les sources Markdown sont organisées dans `courses/<parcours>/lesson-NN.md`. Les leçons Python 02 à 04 historiques restent dans `pdf/lecon-02.md` à `pdf/lecon-04.md`.

Chaque leçon publiée doit comporter des explications accessibles, des exemples commentés, des erreurs fréquentes, des exercices, un mini-défi et des corrigés. Le workflow `.github/workflows/build-course-pdfs.yml` génère le PDF associé et vérifie qu'il contient entre 10 et 20 pages. Le lecteur `pdf/reader.html` affiche directement le Markdown dans l'application installée ; le site Web classique propose le PDF au lecteur natif du navigateur ou au téléchargement.

Le catalogue est actualisé depuis le dépôt au démarrage de l'application. Les sources déjà ouvertes sont mises en cache par le Service Worker pour permettre leur relecture hors connexion.


### Chat IA : profils de performance

- **Rapide** (profil par défaut) : contexte réduit et plafond de génération plus bas pour limiter le temps de calcul.
- **Équilibré** : compromis entre contexte, longueur et vitesse.
- **Approfondi** : davantage de contexte et de tokens, au prix d'une génération généralement plus lente.
- Le nombre de threads WASM est limité à un sur les navigateurs sans isolation cross-origin et ajusté à 4 au maximum lorsque le navigateur autorise le multithreading.
- Les générations affichent leur durée mesurée. Ce chiffre dépend du téléphone, du navigateur, du modèle chargé et de la température de l'appareil.
- Ces réglages optimisent l'exécution ; ils ne transforment pas les petits modèles en modèles de grande capacité et ne garantissent pas une qualité supérieure.


### SUN : bibliothèque PDF locale et entraînement

L'espace SUN propose l'import de fichiers PDF personnels. Le module \`apps/chat-ia/document-library.js\` charge PDF.js 6.5.438 à la demande, extrait le texte page par page et conserve uniquement le texte extrait dans IndexedDB. L'index documentaire l'ajoute à la recherche BM25 ; les résultats comportent le titre du fichier et la page d'origine. Les PDF scannés sans texte sélectionnable nécessitent encore un OCR qui n'est pas implémenté. Limites actuelles : 12 Mo, 120 pages, 160 000 caractères extraits par document, 20 documents et 2 millions de caractères dans la bibliothèque locale.

Les PDF importés restent sur l'appareil. Ils ne sont pas copiés dans GitHub et ne sont pas envoyés par le module d'importation à un serveur. Seul le texte extrait est conservé, afin de permettre la recherche locale. La bibliothèque peut être gérée depuis l'interface SUN (ajout et suppression).

Le dossier \`training/\` contient un pipeline séparé :
- \`prepare_sft_dataset.py\` vérifie les droits, la revue de confidentialité, le statut qualité, les rôles et les doublons, puis sépare les conversations par groupe en train/validation/test.
- \`evaluate_dataset.py\` vérifie les splits et les fuites de conversations.
- \`evaluate_responses.py\` compare des réponses SUN à un benchmark Python et conversation indépendant, avec une couverture de concepts indicative et un score humain facultatif.
- \`train_sft.py\` fournit un point d'entrée facultatif pour un fine-tuning SFT avec Hugging Face TRL et LoRA. Il nécessite un modèle causal conversationnel compatible et un environnement de calcul adapté.
- \`training/data/seed.jsonl\` contient 20 exemples français originaux, créés pour le projet. Ils constituent un jeu de départ très petit, pas un corpus suffisant pour un assistant expert.

Commandes depuis la racine du dépôt :

\`\`\`bash
python training/prepare_sft_dataset.py
python training/evaluate_dataset.py
python -m unittest discover -s training/tests -v
\`\`\`

Pour un entraînement, installer les dépendances de \`training/requirements.txt\` sur une machine avec un GPU adapté, vérifier la licence du modèle choisi et exécuter \`training/train_sft.py\`. Le fine-tuning n'est pas exécuté dans l'application Android ni dans un Cloudflare Worker. Le script a été ajouté, mais aucun modèle n'a été entraîné dans ce dépôt. La perte du jeu de test ne remplace pas une évaluation humaine et l'exécution réelle des tests de code.

PDF.js est distribué par Mozilla sous licence MPL 2.0 : https://github.com/mozilla/pdf.js/


SUN Neural 0.1 est un petit MLP à inférence locale, avec des poids int4 intégrés et un pipeline de réentraînement sur un corpus synthétique français original. Il classe neuf intentions, surtout liées aux bases de Python, puis sélectionne une explication préparée. **Ce prototype n'est pas un LLM conversationnel et ne génère pas librement du texte.** Sur son petit jeu de test synthétique (39 messages), il obtient environ 59 % d'exactitude ; il reste expérimental. C'est le seul modèle IA proposé dans l'application. Voir `training/README.md` pour son architecture, ses limites et sa procédure d'entraînement.
