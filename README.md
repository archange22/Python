# Académique

Académique est une application web progressive (PWA) consacrée à trois parcours : Python, intelligence artificielle et développement Discord.

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
- Développement Discord

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
- **Chat IA** (apps/chat-ia/) : assistant local expérimental avec trois modèles au choix : LaMini-Flan-T5-77M, LaMini-Flan-T5-248M et SmolLM2-135M-Instruct. Un seul modèle est chargé à la fois ; chaque modèle doit être téléchargé séparément. Le téléchargement bénéficie de nouvelles tentatives réseau, d'une progression agrégée lorsqu'elle est fournie par le moteur, d'une estimation du stockage, d'un cache navigateur et d'un bouton de réinitialisation du cache. SmolLM2 est principalement documenté pour l'anglais et peut être moins fiable en français. Les réponses restent moins avancées que celles d’un grand modèle cloud.
- Les statistiques de téléchargement sont conservées localement sur l'appareil et ne sont pas envoyées à un serveur. Elles servent au diagnostic local ; elles ne permettent pas de calculer le taux d'échec global de tous les utilisateurs.
- En cas de coupure, les fichiers entièrement téléchargés et mis en cache sont réutilisés au prochain essai. Le navigateur ne reprend pas nécessairement au dernier octet le fichier dont le téléchargement a été interrompu.

Les deux applications complémentaires possèdent leurs propres pages, manifestes et Service Workers. Elles ne partagent pas leurs données de conversation ou de code avec l’application Académique.
