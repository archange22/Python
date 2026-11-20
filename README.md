# Académique

Académique est une application web installable (PWA) consacrée à l'apprentissage du code. Son interface mobile reprend une direction visuelle simple : fond crème, cartes blanches, texte brun et accents orange.

## Domaines de formation

- Python
- Intelligence artificielle
- Développement Discord

Aucune matière scolaire et aucun système de quiz indépendant ne sont prévus. Les explications, exemples, exercices et corrections doivent être regroupés dans les documents pédagogiques PDF.

## Fonctionnalités de l'application

- Accueil présentant les trois domaines de formation.
- Bibliothèque organisée par domaine et par leçon.
- Lecture intégrée des PDF et téléchargement.
- Consultation hors connexion des PDF déjà chargés ou téléchargés.
- Suivi local des documents terminés.
- Page À propos, confidentialité, partage, contact et accès au projet.
- Interface adaptée aux téléphones et aux écrans plus larges.

## Déploiement actuel

Le dépôt est publié comme application web via GitHub Pages :

https://archange22.github.io/Python/

Sur Android, l'application peut être installée depuis le navigateur lorsqu'il propose l'option d'installation. Cette version est une PWA : elle n'est pas encore un paquet Android AAB prêt à envoyer sur Google Play. La publication Play Store nécessitera une étape de packaging Android, de signature et de vérification des exigences Google.

## Documents PDF

Les documents existants dans le dossier pdf sont conservés. Dans cette version, les PDF Python 02, 03 et 04 sont reliés à l'interface. Le fichier source de la leçon 01 est présent en Markdown, mais le PDF correspondant n'est pas actuellement dans le dépôt. Les cours IA et Discord sont prévus dans le catalogue, mais leurs PDF restent à produire.

## Données et confidentialité

La progression des documents terminés est conservée dans le stockage local du navigateur. Cette version ne demande pas de compte et ne synchronise pas la progression entre plusieurs appareils.
