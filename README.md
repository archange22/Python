# Sun IA

Sun IA est une application web progressive (PWA) dont la page d’accueil est une interface de discussion à identité solaire. Elle conserve également les formations, la bibliothèque de cours, les PDF et la Console Python 3.

## Interface Sun IA

- Interface de chat responsive pour Android, tablette et ordinateur.
- Création de conversations, navigation dans l’historique et suppression des conversations.
- Historique enregistré uniquement dans le stockage local du navigateur.
- Aucune API de génération et aucun moteur d’intelligence artificielle intégrés.
- Les messages saisis ne sont pas transmis à un serveur et aucune réponse intelligente n’est générée.

**État actuel : Sun IA est une interface de discussion, pas encore un assistant IA fonctionnel.** Ajouter un véritable moteur de réponse nécessitera ultérieurement un modèle local ou un service de génération. Cette version n’en contient aucun.

## Formations et bibliothèque

Les contenus pédagogiques sont conservés et restent accessibles depuis la navigation :

- Python
- Intelligence artificielle
- Discord et création de bots
- Création de sites Web (HTML, CSS et JavaScript)

Les sources sont organisées dans \`courses/<parcours>/lesson-NN.md\`. Les cours et PDF d’intelligence artificielle sont conservés, même si aucun moteur IA n’est intégré à l’application.

Les leçons publiées doivent comporter des explications accessibles, des exemples commentés, des erreurs fréquentes, des exercices, un mini-défi et des corrigés. Le workflow \`.github/workflows/build-course-pdfs.yml\` génère les PDF associés.

## Console Python 3

La Console Python 3 (\`apps/python-console-3/\`) reste une application indépendante. Elle utilise CPython avec Pyodide/WebAssembly. Une première initialisation en ligne est nécessaire pour mettre son moteur Python en cache ; les scripts utilisant les ressources déjà téléchargées peuvent ensuite fonctionner hors connexion.

## Données et confidentialité

Les conversations Sun IA, les favoris, les notes, l’historique de lecture et la progression sont conservés localement dans le navigateur. Il n’y a pas de compte ni de synchronisation entre appareils dans cette version.

Le chat ne contacte aucun serveur pour obtenir des réponses. Le Service Worker met en cache les fichiers de l’application et les documents consultés.

## Installation

Sun IA peut être installé depuis un navigateur compatible sous forme de PWA. Cette version ne fournit pas encore de fichier APK indépendant. Une publication sur Google Play nécessitera une étape distincte de packaging, de signature et de vérification des exigences Google.

## Contact

archangekouaho@gmail.com

## Site

https://archange22.github.io/Python/
