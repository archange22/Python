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
- **Console Python 3** (apps/python-console-3/) : interpréteur CPython avec Pyodide/WebAssembly. Une première initialisation en ligne est nécessaire pour mettre le moteur en cache ; les scripts utilisant la bibliothèque standard peuvent ensuite être exécutés hors connexion.

La Console Python possède sa propre page, son manifeste et son Service Worker. Les scripts ne sont pas synchronisés entre les appareils.


## Leçons quotidiennes et bibliothèque

Le catalogue dynamique se trouve dans `courses/catalog.json`. Les sources Markdown sont organisées dans `courses/<parcours>/lesson-NN.md`. Les leçons Python 02 à 04 historiques restent dans `pdf/lecon-02.md` à `pdf/lecon-04.md`.

Chaque leçon publiée doit comporter des explications accessibles, des exemples commentés, des erreurs fréquentes, des exercices, un mini-défi et des corrigés. Le workflow `.github/workflows/build-course-pdfs.yml` génère le PDF associé et vérifie qu'il contient entre 10 et 20 pages. Le lecteur `pdf/reader.html` affiche directement le Markdown dans l'application installée ; le site Web classique propose le PDF au lecteur natif du navigateur ou au téléchargement.

Le catalogue est actualisé depuis le dépôt au démarrage de l'application. Les sources déjà ouvertes sont mises en cache par le Service Worker pour permettre leur relecture hors connexion.
