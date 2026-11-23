# Intelligence artificielle — Leçon 04 : Évaluer et comparer des modèles

**Parcours :** Intelligence artificielle  
**Numéro :** 04  
**Niveau :** Débutant avec notions intermédiaires  
**Durée indicative :** 75 à 95 minutes  
**Matériel :** Papier, calculatrice facultative et exemples de cette leçon.  
**Prérequis :** Leçons 01 à 03 : familles de l'IA, données, caractéristiques, étiquettes, entraînement, inférence et bases du Machine Learning.

## Objectifs et prérequis

Un modèle peut réussir quelques exemples et échouer dans des situations réelles. L'évaluation mesure ce qu'il sait faire, ce qu'il rate et dans quelles conditions il devient moins fiable.

À la fin, tu sauras distinguer entraînement, validation et test, lire une matrice de confusion, calculer accuracy, précision, rappel et F1, comprendre des mesures de régression, repérer une fuite de données et comparer différents types de systèmes.

## Sommaire

1. Pourquoi évaluer ?
2. Séparer les données
3. Construire une référence
4. Matrice de confusion
5. Accuracy, précision et rappel
6. F1 et seuil de décision
7. Mesures de régression
8. Pièges d'évaluation
9. IA générative
10. Comparaison équitable
11. Mini-projet
12. Exercices, corrigés et révision

## 1. Pourquoi mesurer les performances ?

L'évaluation vérifie si les sorties d'un système répondent au besoin défini. Une prédiction correcte sur un exemple ne prouve pas que le modèle sera fiable partout.

Analogie : relire un cours connu ne suffit pas pour savoir si tu maîtrises le sujet. Il faut résoudre des exercices nouveaux et variés. Un modèle doit également être testé sur des données qu'il n'a pas utilisées pour apprendre.

Commence par définir la tâche : classification, régression, regroupement ou génération. Détermine ensuite quelles erreurs sont les plus graves. Pour un filtre, laisser passer un élément indésirable et bloquer un élément normal n'ont pas nécessairement le même coût.

L'accuracy seule peut être trompeuse. Le bon indicateur dépend du contexte, de la fréquence des classes et des conséquences d'une erreur. L'évaluation ne transforme pas une prédiction en vérité : elle apporte des éléments mesurables pour décider si un système est adapté à un usage limité.

## 2. Séparer les données

On distingue souvent trois ensembles.

- Entraînement : le modèle ajuste ses paramètres sur ces exemples.
- Validation : on compare les réglages et choisit les hyperparamètres.
- Test : on mesure une dernière fois le résultat sur des exemples gardés à l'écart.

Analogie : l'entraînement ressemble aux exercices faits pendant le cours, la validation aux exercices utilisés pour choisir une méthode, et le test à une épreuve finale qui n'a pas servi à ajuster cette méthode.

Un partage possible est 70 % entraînement, 15 % validation et 15 % test. Ce n'est pas une règle universelle. Un petit jeu de données peut nécessiter une validation croisée.

Pour une classification, une séparation stratifiée conserve approximativement la proportion des classes. Pour des données temporelles, respecte l'ordre du temps : entraîne sur le passé et teste sur une période ultérieure.

Ne consulte pas le jeu de test à répétition pour choisir ton modèle. Sinon, il ne mesure plus une généralisation indépendante.

## 3. Construire une référence simple

Une baseline est une méthode simple qui sert de point de comparaison. Elle peut être une règle écrite, la classe majoritaire ou une prédiction élémentaire.

Exemple : un jeu contient 90 observations de classe A et 10 de classe B. Un modèle qui prédit toujours A obtient 90 % d'accuracy, mais ne reconnaît jamais B.

La question importante est : le modèle plus complexe apporte-t-il un progrès réel par rapport à cette référence ?

Les systèmes à règles appliquent des conditions écrites par une personne. Le Machine Learning ajuste un modèle à partir d'exemples. L'IA générative produit du contenu. Ces approches peuvent coexister dans un produit, mais elles ne se testent pas toutes de la même façon.

Un modèle n'est pas utile uniquement parce qu'il est nouveau. Il doit améliorer un indicateur pertinent sans rendre les coûts, délais ou risques excessifs.

## 4. Comprendre la matrice de confusion

Pour une classification binaire, on compare la classe réelle à la classe prédite.

| Situation | Signification |
|---|---|
| Vrai positif (VP) | Positif réel, prédit positif |
| Faux positif (FP) | Négatif réel, prédit positif |
| Vrai négatif (VN) | Négatif réel, prédit négatif |
| Faux négatif (FN) | Positif réel, prédit négatif |

Exemple : sur 100 messages, 20 sont indésirables. Le modèle en détecte 15 correctement, signale à tort 5 messages normaux et laisse passer 5 messages indésirables. Il reste 75 vrais négatifs.

On obtient VP = 15, FP = 5, FN = 5 et VN = 75. La matrice montre le type d'erreur, pas seulement le nombre de bonnes réponses. Pour plusieurs classes, on construit une ligne et une colonne par catégorie.

## 5. Accuracy, précision et rappel

L'accuracy est la part totale de prédictions correctes :

Accuracy = (VP + VN) / (VP + VN + FP + FN).

Avec l'exemple : (15 + 75) / 100 = 90 %.

La précision répond à la question : parmi les éléments prédits positifs, combien sont réellement positifs ?

Précision = VP / (VP + FP) = 15 / 20 = 75 %.

Le rappel répond à la question : parmi les positifs réels, combien ont été retrouvés ?

Rappel = VP / (VP + FN) = 15 / 20 = 75 %.

Une précision faible signifie beaucoup de fausses alertes. Un rappel faible signifie que beaucoup de cas positifs sont oubliés. Si le système doit éviter de manquer un événement, le rappel peut être prioritaire. Si chaque fausse alerte coûte cher, la précision peut être plus importante.

## 6. Score F1 et seuil de décision

F1 combine précision et rappel avec leur moyenne harmonique :

F1 = 2 × (précision × rappel) / (précision + rappel).

Avec deux valeurs de 0,75, F1 vaut 0,75. Si les valeurs sont très différentes, F1 diminue.

Un modèle peut fournir un score ou une probabilité. Un seuil transforme ce score en décision : par exemple, prédire positif si le score dépasse 0,5.

Un seuil plus bas détecte davantage de cas positifs, mais peut augmenter les fausses alertes. Un seuil plus haut peut réduire ces alertes et laisser passer davantage de cas positifs.

Choisis le seuil sur les données de validation, selon un objectif défini à l'avance. Ne règle pas le seuil après avoir consulté les résultats du jeu de test.

## 7. Évaluer une régression

La régression prédit une valeur numérique, par exemple une durée ou une consommation.

L'erreur absolue est la distance entre valeur réelle et valeur prédite. La MAE est la moyenne des erreurs absolues :

MAE = moyenne de |valeur réelle - valeur prédite|.

Exemple : les erreurs sont 2, 1 et 3. La MAE vaut (2 + 1 + 3) / 3 = 2 unités.

La MSE est la moyenne des erreurs au carré. Elle pénalise davantage les grandes erreurs. La RMSE est la racine carrée de la MSE et revient dans l'unité de la valeur prédite.

Une moyenne peut cacher des erreurs très fortes sur certains groupes. Examine aussi la distribution des erreurs, les cas extrêmes et les conditions dans lesquelles le modèle se trompe.

## 8. Détecter les pièges d'évaluation

Le déséquilibre de classes apparaît lorsqu'une catégorie est beaucoup plus fréquente. Une accuracy élevée peut alors masquer l'échec sur la classe rare. Regarde la matrice de confusion et les mesures par classe.

La fuite de données survient lorsqu'une information du test ou du futur se retrouve dans l'entraînement. Exemple : calculer une normalisation sur toutes les données avant la séparation peut transmettre des informations du test à l'entraînement.

Le surapprentissage se produit lorsque le modèle s'adapte trop aux exemples d'entraînement et généralise mal.

Vérifie la représentativité des données, les groupes sous-représentés et les biais possibles. Un test fiable doit représenter les situations d'utilisation sans être une copie des exemples d'entraînement.

## 9. Tester une IA générative

Une IA générative produit du texte, des images ou d'autres contenus. Son évaluation ne se réduit pas à l'accuracy.

Prépare des prompts couvrant plusieurs situations : question simple, demande ambiguë, information absente, consigne contradictoire, texte long et demande d'information privée.

Définis une grille : exactitude factuelle, pertinence, clarté, respect du format, refus approprié et protection des données. Pour les réponses importantes, une vérification humaine est nécessaire.

Une réponse fluide peut être fausse. Vérifie les faits avec des sources fiables, teste les cas limites et note les incertitudes. Les résultats peuvent varier selon le modèle et ses réglages.

Ne fournis pas de données personnelles ou confidentielles à un service sans comprendre leur traitement. Un test ne doit pas exposer de vraies informations privées.

## 10. Comparer plusieurs modèles correctement

Les modèles doivent recevoir les mêmes données de test et être évalués avec les mêmes règles. Note la version du modèle, les paramètres, la date, les données et le code d'évaluation.

Compare plusieurs dimensions : qualité, vitesse, mémoire, coût, stabilité, sécurité et maintenance. Un modèle un peu moins précis peut être préférable s'il est beaucoup plus rapide et suffisamment fiable pour la tâche.

Pour un système à règles, teste les conditions et leurs limites. Pour le Machine Learning, mesure les performances sur des données séparées. Pour l'IA générative, utilise des scénarios, une grille et une vérification humaine.

Répète les expériences lorsque l'entraînement comporte de l'aléatoire. Présente les résultats avec leur contexte, pas seulement un chiffre isolé.

## 11. Mini-projet : évaluer un classifieur fictif

Un système classe des messages comme « à vérifier » ou « normal ». Sur 100 messages, VP = 18, FP = 6, FN = 6 et VN = 70.

Calcule accuracy, précision, rappel et F1. Résultats attendus : accuracy = 88 %, précision = 75 %, rappel = 75 % et F1 = 75 %.

Rédige une conclusion : le système repère trois quarts des messages réellement à vérifier, mais il manque encore un quart de ces messages et crée des fausses alertes. Son usage dépend du coût des erreurs et d'une validation sur des données représentatives.

## 12. Exercices progressifs

1. Explique la différence entre entraînement, validation et test.
2. Un modèle obtient 95 % d'accuracy sur un jeu contenant 95 % de classe A. Pourquoi ce score peut-il tromper ?
3. Avec VP = 8, FP = 2, FN = 4 et VN = 6, calcule accuracy, précision et rappel.
4. Donne un exemple de fuite de données.
5. Propose trois critères pour évaluer un assistant génératif.
6. Explique pourquoi deux modèles doivent être testés sur le même jeu.
7. Défi : rédige un protocole pour évaluer un assistant de cours sans utiliser de données privées.

## 13. Corrigés expliqués

1. L'entraînement ajuste les paramètres ; la validation choisit les réglages ; le test mesure la généralisation sur des exemples gardés à l'écart.
2. Un modèle qui répond toujours A obtient déjà 95 %. Il ne détecte aucune observation B.
3. Total = 20. Accuracy = (8 + 6) / 20 = 70 %. Précision = 8 / 10 = 80 %. Rappel = 8 / 12 = 66,7 % environ.
4. Exemple : inclure une colonne calculée après l'événement que le modèle doit prédire.
5. Exactitude, pertinence, respect des consignes, sécurité ou clarté peuvent être évalués avec une grille.
6. Sinon, la différence peut venir des données et non du modèle.
7. Prépare des questions fictives, définis les réponses attendues, note exactitude et clarté, teste les ambiguïtés, fais vérifier les réponses et consigne les limites.

## 14. Fiche de révision et validation

- Définir la tâche et le coût des erreurs.
- Séparer entraînement, validation et test.
- Construire une baseline.
- Lire VP, FP, VN et FN.
- Accuracy mesure la part totale de réponses correctes.
- Précision mesure la fiabilité des prédictions positives.
- Rappel mesure la part des positifs retrouvés.
- F1 combine précision et rappel.
- MAE, MSE et RMSE mesurent des erreurs de régression.
- Rechercher déséquilibre, fuite, biais et surapprentissage.
- Évaluer une IA générative avec scénarios, grille et vérification humaine.
- Comparer les systèmes dans les mêmes conditions.

Avant la leçon 05, tu dois pouvoir choisir une mesure adaptée, calculer les indicateurs de base et expliquer les limites d'un résultat.

**©pythonschool — Intelligence artificielle, leçon 04.**
