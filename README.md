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
- **SUN** (apps/chat-ia/) : assistant local avec un seul modèle IA sélectionnable, **SUN Neural 0.1**. Ce petit MLP 512 → 32 → 9 est intégré au projet, chargé par le worker local et exécuté dans le navigateur ; aucun modèle tiers n'est proposé ni téléchargé. Il reconnaît neuf catégories de demandes en français, surtout sur les bases de Python, puis choisit une explication pédagogique préparée. La recherche BM25 dans les cours et les PDF personnels fonctionne en complément du modèle.
- Les statistiques de téléchargement sont conservées localement sur l'appareil et ne sont pas envoyées à un serveur. Elles servent au diagnostic local et ne mesurent pas le taux d'échec global.
- En cas de coupure, les fichiers entièrement téléchargés et mis en cache peuvent être réutilisés. Le navigateur ne reprend pas nécessairement au dernier octet un fichier dont le transfert a été interrompu.

Les applications complémentaires possèdent leurs propres pages, manifestes et Service Workers. Les conversations et les scripts ne sont pas synchronisés entre les appareils. La recherche documentaire de SUN conserve localement un index des leçons déjà téléchargées ; le premier chargement des sources nécessite une connexion.

### SUN : conversation, recherche documentaire et robustesse

SUN propose désormais quatre modèles au choix : un prototype neuronal local SUN Neural 0.1 et trois modèles compacts servis par Transformers.js 4.3.2. Les échanges courants (salutations et abréviations comme « slt », « cv » et « sava », questions de suivi, remerciements, présentation de SUN et questions sur son fonctionnement) sont traités localement sans téléchargement de modèle. Les questions de cours sont recherchées dans le catalogue `courses/catalog.json` et dans les quatre leçons Python historiques `pdf/lecon-01.md` à `pdf/lecon-04.md`.

Les PDF des cours Académique étant générés depuis ces sources Markdown, SUN indexe leur contenu source avec une recherche BM25, des synonymes et une tolérance aux petites fautes de frappe. Il transmet des extraits adaptés à la taille du modèle et ajoute la référence du parcours, le numéro de leçon et la section. Sans modèle chargé, le champ de discussion reste actif : SUN peut tenir les échanges courants et afficher un extrait retrouvé avec sa référence. Le téléchargement par file ne bloque plus le chat ; charger le modèle reste une action optionnelle pour obtenir une génération libre. L’index est conservé localement ; le premier chargement des documents nécessite une connexion.

Limites : SUN Neural 0.1 est un classificateur neuronal spécialisé, et non un LLM génératif. Son score de 59 % sur 39 exemples synthétiques est insuffisant pour en faire un expert ou pour garantir des réponses exactes. Il ne couvre pas encore les demandes générales hors de ses neuf catégories. SUN permet d’importer des PDF personnels : PDF.js extrait le texte sélectionnable dans le navigateur, puis le texte seul est enregistré dans IndexedDB sur l’appareil et ajouté à l’index de recherche. Les fichiers originaux ne sont pas envoyés ni conservés par SUN. La limite actuelle est de 12 Mo et 120 pages par fichier, avec un plafond de 160 000 caractères extraits et 20 documents personnels. Les PDF scannés sans couche texte ne sont pas encore traités par OCR. Le support des PDF privés dépend du navigateur et de son stockage local.


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
