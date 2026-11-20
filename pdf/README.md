# Ressources pédagogiques — Académique

## Organisation des cours

- `lecon-01-python-school.pdf` : première leçon Python historique, conservée.
- `lecon-02.md` à `lecon-04.md` : sources des leçons Python 02 à 04.
- `courses/<parcours>/lesson-NN.md` : sources des nouvelles leçons Python, IA, Discord et Web.
- `courses/catalog.json` : catalogue dynamique consommé par l’application.
- `courses/<parcours>-NN.pdf` : PDF générés dans ce dossier pour chaque source de cours.
- `reader.html` : lecteur pédagogique commun, utilisé uniquement dans l’application Académique installée.
- `lecon-01-reader.html` : ancien lecteur réservé à la leçon 01, conservé pour compatibilité.

## Règles de production

Chaque nouvelle leçon vise 10 à 20 pages PDF A4. Elle doit contenir des explications adaptées aux débutants, des exemples commentés, des erreurs fréquentes, des exercices progressifs, un mini-défi et des corrigés. Le pied de page porte la mention ©pythonschool.

Le workflow `.github/workflows/build-course-pdfs.yml` génère automatiquement les PDF dès que des sources ou le catalogue changent. Il vérifie le nombre réel de pages avant de publier les fichiers.

## Lecture sans téléchargement manuel

Dans l’application PWA installée, `reader.html` affiche directement le fichier Markdown du cours. La progression, la recherche, la taille du texte, les thèmes et la position de lecture sont conservés localement. Le Service Worker met en cache les sources après leur premier chargement.

Depuis le site ouvert dans un navigateur classique, le lecteur intégré n’est pas utilisé : l’utilisateur ouvre le PDF avec son lecteur natif ou télécharge le fichier. Le PDF reste donc une solution de secours et une copie consultable séparément.
