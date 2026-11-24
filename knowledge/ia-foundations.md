# IA pratique : jeux de données et évaluation

## Construire un jeu de données utile
Un jeu de données rassemble des exemples décrits par des caractéristiques. En apprentissage supervisé, chaque exemple possède une étiquette qui indique la réponse attendue. Les exemples doivent représenter les situations que le système rencontrera réellement. Des doublons, des erreurs ou des catégories déséquilibrées peuvent fausser l'apprentissage.

## Séparer entraînement, validation et test
Le jeu d'entraînement sert à ajuster les paramètres d'un modèle. La validation sert à comparer des réglages pendant le développement. Le jeu de test reste séparé jusqu'à l'évaluation finale afin d'estimer le comportement sur des exemples jamais utilisés pour apprendre. Mélanger ces ensembles peut produire une évaluation trop optimiste.

## Reconnaître le surapprentissage
Un modèle surapprend lorsqu'il mémorise trop les exemples d'entraînement et généralise mal à de nouveaux cas. On peut le repérer en comparant les résultats sur les données d'entraînement et de validation. Ajouter des exemples variés, simplifier le système ou utiliser une régularisation peut réduire ce problème. Une bonne performance sur les exemples connus ne prouve pas que le modèle comprend toutes les situations.

## Mesurer une classification : précision, rappel et F1
La précision mesure la part des prédictions positives qui sont correctes ; le rappel mesure la part des vrais positifs que le système retrouve. Le score F1 combine précision et rappel par leur moyenne harmonique. La matrice de confusion distingue vrais positifs, faux positifs, vrais négatifs et faux négatifs. Ces métriques aident à comprendre les erreurs d'une classification.

## Examiner les erreurs
Après une évaluation, regrouper les erreurs par type permet de comprendre ce qui manque aux exemples. Une confusion entre deux catégories peut signaler des étiquettes ambiguës ou des exemples trop semblables. Ajouter des exemples pertinents et réévaluer le système permet de vérifier si la correction améliore réellement les résultats.

## Références pour apprendre le machine learning
Le cours Machine Learning Crash Course de Google présente les jeux de données, la classification, la généralisation, le surapprentissage et les métriques de performance. Les notes locales sont rédigées en français et résument les notions ; les modules officiels restent la référence détaillée.
Référence : https://developers.google.com/machine-learning/crash-course
Référence : https://developers.google.com/machine-learning/crash-course/classification/
