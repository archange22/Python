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
- **Chat IA** (apps/chat-ia/) : assistant local expérimental avec trois modèles : LaMini-Flan-T5-77M, LaMini-Flan-T5-248M et SmolLM2-135M-Instruct, ce dernier utilisant le dépôt ONNX Community prévu pour Transformers.js. Le gestionnaire affiche la progression globale et par fichier, le volume transféré, la vitesse et une estimation du temps restant. Il permet de préparer une file ordonnée de modèles téléchargés séquentiellement, de la mettre en pause et de reprendre les tâches interrompues en réutilisant les fichiers terminés en cache. La file est conservée localement mais ne continue pas en arrière-plan après fermeture de la page. Le chat propose des longueurs de réponse courte, normale ou détaillée ; SmolLM2 affiche ses réponses progressivement. Les modèles restent compacts et expérimentaux ; SmolLM2 peut être moins fiable en français.
- Les statistiques de téléchargement sont conservées localement sur l'appareil et ne sont pas envoyées à un serveur. Elles servent au diagnostic local ; elles ne permettent pas de calculer le taux d'échec global de tous les utilisateurs.
- En cas de coupure, les fichiers entièrement téléchargés et mis en cache sont réutilisés au prochain essai. Le navigateur ne reprend pas nécessairement au dernier octet le fichier dont le téléchargement a été interrompu.

Les deux applications complémentaires possèdent leurs propres pages, manifestes et Service Workers. Elles ne partagent pas leurs données de conversation ou de code avec l’application Académique.


### Chat IA : robustesse du chargement

Le Chat IA utilise Transformers.js 4.3.2. Le chargement interroge le registre des modèles pour connaître les fichiers nécessaires, leur taille totale et leur présence dans le cache lorsque ces métadonnées sont accessibles. Le téléchargement applique trois tentatives sur les erreurs réseau temporaires, puis une nouvelle tentative de chargement du modèle. Le gestionnaire expose la progression par fichier et la file des modèles programmés. Les statistiques affichées sont strictement locales à l'appareil : elles ne sont pas envoyées à un serveur et ne mesurent donc pas le taux global d'échec.
