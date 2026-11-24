# Fondamentaux IA : données, classification et réseaux neuronaux

## Construire un jeu de données utile
Un jeu de données rassemble des exemples décrits par des caractéristiques. En apprentissage supervisé, chaque exemple peut aussi posséder une étiquette qui indique la réponse attendue. Les exemples doivent représenter les situations que le modèle rencontrera réellement. Des doublons, des erreurs ou des catégories déséquilibrées peuvent fausser l'apprentissage.

## Séparer entraînement, validation et test
Le jeu d'entraînement sert à ajuster les paramètres du modèle. La validation sert à comparer des réglages pendant le développement. Le jeu de test reste séparé jusqu'à l'évaluation finale afin d'estimer le comportement sur des exemples jamais utilisés pour apprendre. Mélanger ces ensembles peut produire une évaluation trop optimiste.

## Reconnaître le surapprentissage
Un modèle surapprend lorsqu'il mémorise trop les exemples d'entraînement et généralise mal à de nouveaux cas. On peut le repérer en comparant les résultats sur les données d'entraînement et de validation. Ajouter des exemples variés, simplifier le modèle ou utiliser une régularisation peut réduire ce problème. Une bonne performance sur les exemples connus ne prouve pas que le modèle comprend toutes les situations.

## Mesurer une classification : précision, rappel et F1
La précision mesure la part des prédictions positives qui sont correctes ; le rappel mesure la part des vrais positifs que le modèle retrouve. Le score F1 combine précision et rappel par leur moyenne harmonique. La matrice de confusion distingue vrais positifs, faux positifs, vrais négatifs et faux négatifs. Ces métriques aident à comprendre les erreurs d'un modèle de classification.

## Comprendre les neurones et les couches
Un réseau neuronal transforme des valeurs d'entrée en prédictions à travers des couches de calcul. Une couche cachée combine les entrées avec des poids et des biais ; une fonction d'activation introduit une transformation non linéaire. La couche de sortie produit les scores associés aux catégories. Le nombre de neurones ne garantit pas, à lui seul, une meilleure qualité.

## Entraîner et évaluer un réseau
Pendant l'entraînement, le réseau calcule une prédiction, mesure une fonction de perte puis ajuste ses poids pour réduire cette perte. La rétropropagation calcule comment les poids contribuent à l'erreur ; un optimiseur applique ensuite les mises à jour. Il faut suivre les résultats sur des données séparées et vérifier les cas où le modèle hésite ou se trompe.

## Ce que fait réellement Sun Brain
Dans Sun, le petit réseau neuronal classe quelques intentions de conversation. Le moteur documentaire recherche ensuite des passages pertinents dans les fichiers Markdown locaux et compose une réponse à partir de ces passages. Ajouter une fiche enrichit donc la recherche documentaire ; cela ne réentraîne pas automatiquement les poids du réseau et ne transforme pas Sun en grand modèle de langage.

## Références pour apprendre le machine learning
Le cours Machine Learning Crash Course de Google présente les données, la classification, la généralisation, le surapprentissage, les réseaux neuronaux et leurs composants. Les notes locales sont rédigées en français et résument les notions ; les modules officiels restent la référence détaillée.
Référence : https://developers.google.com/machine-learning/crash-course
Référence : https://developers.google.com/machine-learning/crash-course/classification/
Référence : https://developers.google.com/machine-learning/crash-course/neural-networks
