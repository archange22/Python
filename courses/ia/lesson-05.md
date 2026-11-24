# Intelligence artificielle — Leçon 05 : Construire un premier modèle de Machine Learning

**Parcours :** Intelligence artificielle  
**Numéro :** 05  
**Niveau :** Débutant avec pratique guidée  
**Durée indicative :** 90 à 120 minutes  
**Matériel :** Papier ou Pydroid 3 pour l'exemple Python facultatif.  
**Prérequis :** Leçons 01 à 04 : familles de l'IA, données, caractéristiques, étiquettes, apprentissage, inférence et évaluation.

## Objectifs et prérequis

Cette leçon transforme les notions précédentes en une petite expérience. Tu vas comprendre comment un modèle supervisé apprend à partir d'exemples étiquetés, puis comment il prédit une catégorie pour une nouvelle observation.

Tu vas construire un classifieur très simple en Python standard, sans bibliothèque externe. Il utilisera la méthode du plus proche centroïde. Ce modèle sert à apprendre le principe ; il n'est pas destiné à remplacer un système professionnel.

## Sommaire

1. Définir le problème
2. Distinguer règles, Machine Learning et IA générative
3. Comprendre les données et les caractéristiques
4. Préparer les données numériques
5. Construire une référence
6. Comprendre le plus proche centroïde
7. Entraîner le modèle
8. Réaliser une inférence
9. Évaluer et améliorer
10. Limites, biais et sécurité
11. Mini-projet guidé
12. Exercices et corrigés
13. Fiche de révision

## 1. Définir le problème

Avant de choisir un algorithme, formule le besoin en une phrase. Exemple : « À partir du poids et du diamètre d'un fruit, proposer une catégorie probable. »

Une tâche de classification consiste à choisir une catégorie parmi plusieurs. Une régression prédit une quantité numérique. Un regroupement rassemble des observations similaires sans étiquette connue à l'avance.

Dans notre exemple, les catégories sont pomme, orange et banane. Les caractéristiques sont le poids en grammes et le diamètre en centimètres. L'étiquette est le nom de la catégorie.

Un bon problème est limité et vérifiable. Nous n'essayons pas de reconnaître tous les fruits du monde. Nous testons une méthode sur un petit jeu inventé pour comprendre les étapes d'un apprentissage supervisé.

## 2. Distinguer règles, Machine Learning et IA générative

Un système à règles suit des instructions écrites par une personne. Exemple : « Si le poids est supérieur à 150 g, afficher catégorie A ». Il ne découvre pas cette règle à partir d'exemples ; quelqu'un l'a programmée.

Le Machine Learning ajuste un modèle à partir de données. La personne choisit la tâche, prépare les exemples et l'algorithme calcule des paramètres qui permettent de faire des prédictions.

L'IA générative produit du contenu, par exemple du texte ou une image, à partir d'un modèle entraîné sur de grandes quantités de données. Elle peut utiliser des prompts et produire des réponses variables.

Ces trois approches ne sont pas synonymes. Un produit peut combiner des règles de sécurité, un modèle de Machine Learning pour classer et une IA générative pour expliquer le résultat. Il faut savoir quelle partie réalise réellement chaque tâche.

## 3. Comprendre les données et les caractéristiques

Une observation représente un exemple. Une caractéristique décrit une propriété mesurée. Une étiquette indique la réponse attendue dans un apprentissage supervisé.

Exemple de ligne :

| Poids | Diamètre | Étiquette |
|---:|---:|---|
| 160 g | 7,1 cm | Pomme |
| 135 g | 6,5 cm | Orange |
| 120 g | 3,0 cm | Banane |

Chaque ligne est un exemple d'entraînement. Les deux premières colonnes sont les caractéristiques ; la dernière est l'étiquette.

La qualité des données compte autant que l'algorithme. Une balance imprécise, une unité mélangée ou une étiquette erronée peuvent rendre l'apprentissage trompeur.

Ne collecte que les informations nécessaires. Pour un exercice sur des fruits, il n'est pas utile d'ajouter des données personnelles. Dans un vrai projet, vérifie l'origine, l'autorisation d'utilisation et la représentativité des données.

## 4. Préparer les données numériques

Les caractéristiques peuvent avoir des échelles différentes. Le poids peut être autour de 150, alors que le diamètre peut être autour de 7. Une distance calculée directement pourrait donner trop d'importance au poids.

Une solution simple consiste à diviser le poids par 100 et le diamètre par 10. Les deux valeurs deviennent plus comparables. Dans un projet réel, on peut utiliser une normalisation ou une standardisation calculée uniquement sur les données d'entraînement.

Sépare les données avant d'ajuster les transformations. Si tu calcules les paramètres de normalisation avec le jeu de test, tu risques une fuite de données. Apprends les transformations sur l'entraînement, puis applique exactement les mêmes aux données de validation et de test.

Pour notre petit exemple, la transformation est fixée à l'avance et ne dépend pas des observations :

~~~python
def transformer(poids, diametre):
    return (poids / 100, diametre / 10)

print(transformer(160, 7.1))
~~~

La fonction transforme les unités sans changer l'étiquette. Une transformation doit être cohérente entre l'entraînement et l'inférence.

## 5. Construire une référence simple

Avant d'utiliser un modèle, construis une baseline. Une baseline est une méthode simple qui donne un point de comparaison.

Pour ce jeu, une baseline pourrait toujours prédire la catégorie la plus fréquente. Une autre pourrait utiliser une règle écrite à la main. Si le modèle appris ne fait pas mieux sur des données de test, sa complexité n'apporte pas de bénéfice démontré.

Note les résultats avant de modifier l'algorithme. Une comparaison correcte utilise les mêmes exemples de test, les mêmes étiquettes et la même mesure.

Le but n'est pas de faire gagner le modèle à tout prix. Le but est de vérifier s'il répond mieux au besoin défini et de comprendre les erreurs qu'il produit.

## 6. Comprendre le plus proche centroïde

Un centroïde est le centre moyen d'un groupe de points. Pour chaque catégorie, on calcule la moyenne de chaque caractéristique à partir des exemples d'entraînement.

Lorsqu'un nouveau fruit arrive, on calcule sa distance à chaque centroïde. Le modèle choisit la catégorie dont le centroïde est le plus proche.

Analogie : imagine trois groupes de points sur une feuille. Chaque groupe représente une catégorie. Tu places un nouveau point et tu regardes quel centre est le plus proche.

Cette méthode est simple et rapide. Elle suppose toutefois que la moyenne représente correctement chaque catégorie. Si les formes d'un groupe sont très variées ou si les groupes se chevauchent, le résultat peut être mauvais.

La distance euclidienne entre deux points à deux dimensions est la racine carrée de la somme des carrés des différences. Les caractéristiques doivent être préparées avec la même transformation.

## 7. Entraîner le modèle

L'entraînement consiste ici à regrouper les exemples par étiquette et à calculer le centroïde de chaque groupe.

~~~python
donnees = [
    ("pomme", 150, 7.0),
    ("pomme", 170, 7.4),
    ("pomme", 160, 7.1),
    ("orange", 130, 6.5),
    ("orange", 140, 6.7),
    ("orange", 125, 6.3),
    ("banane", 120, 3.0),
    ("banane", 135, 3.2),
    ("banane", 110, 2.8)
]

def transformer(poids, diametre):
    return poids / 100, diametre / 10

def entrainer(exemples):
    groupes = {}
    for etiquette, poids, diametre in exemples:
        groupes.setdefault(etiquette, []).append(
            transformer(poids, diametre)
        )

    centres = {}
    for etiquette, points in groupes.items():
        moyenne_poids = sum(p[0] for p in points) / len(points)
        moyenne_diametre = sum(p[1] for p in points) / len(points)
        centres[etiquette] = (moyenne_poids, moyenne_diametre)

    return centres

centres = entrainer(donnees)
print(centres)
~~~

Le dictionnaire centres associe une étiquette à un point moyen. Cette opération est notre phase d'apprentissage. Elle ne crée pas une intelligence générale : elle calcule des valeurs utiles à une tâche précise.

## 8. Réaliser une inférence

L'inférence est l'utilisation du modèle déjà entraîné pour produire une prédiction sur une nouvelle observation.

~~~python
def distance(point_a, point_b):
    return (
        (point_a[0] - point_b[0]) ** 2
        + (point_a[1] - point_b[1]) ** 2
    ) ** 0.5

def predire(centres, poids, diametre):
    nouveau_point = transformer(poids, diametre)
    distances = {}

    for etiquette, centre in centres.items():
        distances[etiquette] = distance(nouveau_point, centre)

    meilleure_classe = min(distances, key=distances.get)
    return meilleure_classe, distances

classe, details = predire(centres, 155, 7.2)
print("Catégorie proposée :", classe)
print("Distances :", details)
~~~

Le modèle compare la nouvelle observation aux centres appris. La plus petite distance donne la classe proposée.

Une prédiction n'est pas une certitude. Si toutes les distances sont grandes, le fruit peut être très différent des exemples. Une application réelle devrait pouvoir signaler « inconnu » ou demander une vérification humaine.

## 9. Évaluer et améliorer

Ne mesure pas le modèle uniquement sur les exemples qu'il vient de voir. Garde quelques observations de côté avant l'entraînement. Compare ensuite les prédictions aux étiquettes connues.

~~~python
test = [
    ("pomme", 165, 7.2),
    ("orange", 132, 6.4),
    ("banane", 125, 3.1)
]

correctes = 0
for etiquette_reelle, poids, diametre in test:
    prediction, _ = predire(centres, poids, diametre)
    print(etiquette_reelle, "=>", prediction)
    if prediction == etiquette_reelle:
        correctes += 1

taux = correctes / len(test)
print(f"Exactitude sur ce mini-test : {taux:.0%}")
~~~

Avec seulement trois exemples de test, le taux varie beaucoup. Il ne permet pas d'affirmer que le modèle fonctionnera dans la vie réelle.

Pour améliorer une expérience, collecte des exemples plus nombreux et représentatifs, vérifie les étiquettes, examine les erreurs et compare une baseline. Ne modifie pas le modèle après chaque observation du test sans créer un nouveau jeu de test indépendant.

## 10. Limites, biais et sécurité

Un modèle apprend les régularités présentes dans les données, y compris leurs défauts. Si une catégorie est peu représentée, il peut mal la reconnaître. Si les mesures ont été prises dans des conditions différentes, il peut apprendre une différence liée au matériel plutôt qu'au fruit.

Les données de test doivent représenter les conditions d'utilisation. Une bonne performance moyenne peut cacher un mauvais résultat pour un sous-groupe ou une situation rare.

N'utilise pas ce mini-classifieur pour décider d'une action importante. Il est construit avec très peu de données inventées et ne possède aucune garantie de fiabilité.

Pour un système réel, documente la provenance des données, les limites, les mesures, les erreurs connues et les possibilités de recours. Protège les données personnelles et demande une validation humaine lorsque les conséquences d'une erreur sont importantes.

## 11. Mini-projet guidé : classer une nouvelle observation

Reprends le code des sections précédentes et ajoute une fonction qui demande le poids et le diamètre à l'utilisateur. Convertis les saisies en nombres, appelle predire(), puis affiche la catégorie proposée et les distances.

~~~python
def demander_nombre(message):
    return float(input(message))

def tester_un_fruit(centres):
    poids = demander_nombre("Poids en grammes : ")
    diametre = demander_nombre("Diamètre en centimètres : ")

    classe, distances = predire(centres, poids, diametre)

    print(f"Catégorie proposée : {classe}")
    for etiquette, valeur in distances.items():
        print(f"{etiquette} : {valeur:.3f}")

tester_un_fruit(centres)
~~~

Teste des valeurs proches des exemples, puis des valeurs très éloignées. Observe comment les distances changent. Ajoute un contrôle pour refuser un poids ou un diamètre négatif.

Le programme ne doit pas annoncer que le résultat est certain. Affiche plutôt « catégorie proposée par le modèle éducatif ». Cette formulation rappelle qu'il s'agit d'une prédiction limitée.

## 12. Exercices et corrigés

1. Identifie les caractéristiques et l'étiquette dans une ligne de données.
2. Explique pourquoi les unités doivent être cohérentes.
3. Calcule le centroïde de trois points (1, 2), (3, 4) et (5, 3).
4. Explique la différence entre entraînement et inférence.
5. Pourquoi un test de trois observations ne prouve-t-il pas une fiabilité générale ?
6. Défi : ajoute une fonction qui renvoie la classe et la distance minimale, puis affiche un avertissement si cette distance dépasse un seuil choisi pour l'exercice.

**Corrigé 1 :** poids et diamètre sont les caractéristiques ; pomme, orange ou banane est l'étiquette.

**Corrigé 2 :** des unités incohérentes changent artificiellement les distances et donc l'influence des caractéristiques.

**Corrigé 3 :** moyenne de x = (1 + 3 + 5) / 3 = 3 ; moyenne de y = (2 + 4 + 3) / 3 = 3. Le centroïde est (3, 3).

**Corrigé 4 :** l'entraînement calcule les centres à partir des exemples étiquetés ; l'inférence utilise ces centres pour classer une nouvelle observation.

**Corrigé 5 :** un petit échantillon peut être chanceux, déséquilibré et peu représentatif. Une seule erreur change fortement le pourcentage.

**Corrigé 6 :** calcule min(distances.values()) et compare ce nombre au seuil. Le seuil doit être testé et documenté ; il n'est pas une garantie universelle.

## 13. Fiche de révision et validation

- Une classification prédit une catégorie.
- Une caractéristique décrit l'observation ; une étiquette donne la réponse attendue.
- Le supervisé apprend à partir d'exemples étiquetés.
- Un système à règles suit des conditions écrites.
- Le Machine Learning ajuste un modèle à partir de données.
- L'IA générative produit du contenu à partir d'un modèle génératif.
- L'entraînement prépare le modèle ; l'inférence l'utilise.
- Un centroïde est une moyenne de points.
- Une distance permet de comparer une observation aux centres.
- Les transformations apprises doivent être calculées sur l'entraînement.
- Le test doit rester indépendant.
- Une petite expérience pédagogique ne prouve pas une fiabilité réelle.

Avant la leçon 06, tu dois pouvoir expliquer les étapes d'un apprentissage supervisé et faire la différence entre une règle écrite et un modèle appris.

**©pythonschool — Intelligence artificielle, leçon 05.**