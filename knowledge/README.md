# Entretien du corpus documentaire Sun

- Ajouter des fiches Markdown pédagogiques rédigées ou synthétisées avec attribution et licences.
- Séparer les nouvelles notions des cours existants pour éviter les collisions de recherche.
- Utiliser des titres de section `##` et des paragraphes explicatifs complets.
- Ajouter chaque chemin à `sun-brain.js`, au tableau de documents des tests et au cache statique `sw.js`.
- Ajouter un test de non-régression qui vérifie la bonne fiche retournée.
- Ne jamais entraîner le modèle sur des conversations privées, noms, identifiants ou secrets.
- Le moteur actuel indexe le Markdown ; les PDF binaires nécessitent une extraction textuelle contrôlée avant intégration.
- Vérifier les sources et licences avant toute redistribution.


## Sécurité des imports PDF

Les aperçus d'extraction sont placés dans `knowledge/staging/`, dossier local ignoré par Git. Une validation manuelle (`--approve`) ne publie pas le document. L'ajout au catalogue partagé et au site public exige aussi `--publish-public`. Cette option ne doit être utilisée que pour un document dont la redistribution est explicitement autorisée. Les documents personnels ne doivent pas être copiés dans le dépôt public.

Les PDF scannés sans couche texte ne sont pas indexés. La détection automatique de marqueurs sensibles est une précaution supplémentaire, pas une garantie d'absence de données personnelles.
