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

## Leçon 01 — PythonSchool

La première leçon Python est disponible dans l'application, avec une lecture intégrée adaptée aux téléphones. Elle explique les bases de la programmation, la prise en main de Pydroid 3, `print()`, le texte, les nombres, les commentaires et les erreurs fréquentes. Elle comprend 10 exercices progressifs, leurs corrigés, un mini-projet et une validation des acquis.

- Lecteur intégré : `pdf/lecon-01-reader.html`
- Contenu pédagogique source compressé : `pdf/lecon-01-content.md.gz.b64`
- Version PDF de 41 pages : fournie séparément ; le fichier PDF binaire n'est pas encore stocké dans ce dépôt.

Les leçons suivantes restent à préparer et à relier à la bibliothèque. Les cours IA et Discord sont également prévus dans le catalogue, mais leurs documents restent à produire.

## Données et confidentialité

La progression des documents terminés est conservée dans le stockage local du navigateur. Cette version ne demande pas de compte et ne synchronise pas la progression entre plusieurs appareils.
