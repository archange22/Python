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
- **Chat IA** (apps/chat-ia/) : assistant local expérimental avec trois modèles : LaMini-Flan-T5-77M, LaMini-Flan-T5-248M et SmolLM2-135M-Instruct au format ONNX. Le gestionnaire affiche la progression globale et par fichier, les octets transférés, la vitesse et une estimation du temps restant. Il gère une file ordonnée de modèles, les télécharge séquentiellement, permet pause et reprise, et conserve localement la file si l’application est fermée. La file ne continue pas en arrière-plan : il faut rouvrir l’application et relancer le traitement. SmolLM2 affiche les réponses progressivement ; les longueurs courte, normale et détaillée sont disponibles.
- Les statistiques de téléchargement sont conservées localement sur l'appareil et ne sont pas envoyées à un serveur. Elles servent au diagnostic local et ne mesurent pas le taux d'échec global.
- En cas de coupure, les fichiers entièrement téléchargés et mis en cache peuvent être réutilisés. Le navigateur ne reprend pas nécessairement au dernier octet un fichier dont le transfert a été interrompu.

Les applications complémentaires possèdent leurs propres pages, manifestes et Service Workers. Les conversations et les scripts ne sont pas synchronisés entre les appareils.

### Chat IA : robustesse et suivi

Le Chat IA utilise Transformers.js 4.3.2 et le registre de modèles pour lister les fichiers requis, leurs tailles et leur état de cache lorsque les métadonnées sont disponibles. Les erreurs réseau temporaires déclenchent des tentatives automatiques. Les réponses restent celles de modèles compacts : elles peuvent être inexactes ou moins fiables en français, notamment avec SmolLM2.


## Leçons quotidiennes et bibliothèque

Le catalogue dynamique se trouve dans `courses/catalog.json`. Les sources Markdown sont organisées dans `courses/<parcours>/lesson-NN.md`. Les leçons Python 02 à 04 historiques restent dans `pdf/lecon-02.md` à `pdf/lecon-04.md`.

Chaque leçon publiée doit comporter des explications accessibles, des exemples commentés, des erreurs fréquentes, des exercices, un mini-défi et des corrigés. Le workflow `.github/workflows/build-course-pdfs.yml` génère le PDF associé et vérifie qu'il contient entre 10 et 20 pages. Le lecteur `pdf/reader.html` affiche directement le Markdown dans l'application installée ; le site Web classique propose le PDF au lecteur natif du navigateur ou au téléchargement.

Le catalogue est actualisé depuis le dépôt au démarrage de l'application. Les sources déjà ouvertes sont mises en cache par le Service Worker pour permettre leur relecture hors connexion.
