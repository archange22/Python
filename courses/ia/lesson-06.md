# Intelligence artificielle — Leçon 06 : Réseaux de neurones, du neurone artificiel au perceptron

**Parcours :** Intelligence artificielle  
**Numéro :** 06  
**Niveau :** Débutant avec pratique guidée  
**Durée indicative :** 100 à 130 minutes  
**Matériel :** Papier ou Pydroid 3 pour les calculs en Python standard.  
**Prérequis :** Familles de l'IA, données, caractéristiques, apprentissage supervisé, inférence, évaluation et premier modèle de Machine Learning.

## Objectifs et prérequis

Un réseau de neurones artificiels est un modèle de Machine Learning composé d'unités de calcul reliées entre elles. Son nom vient d'une inspiration très simplifiée du cerveau, mais un réseau artificiel n'est pas un cerveau humain.

Dans cette leçon, tu vas comprendre le calcul réalisé par un neurone artificiel, le rôle des poids et du biais, l'utilité d'une fonction d'activation et la différence entre entraînement et inférence. Tu vas programmer un petit perceptron en Python standard pour reconnaître la fonction logique ET.

À la fin, tu sauras :
- décrire un neurone artificiel avec ses entrées, ses poids et son biais ;
- expliquer le rôle d'une fonction d'activation ;
- distinguer couche d'entrée, couche cachée et couche de sortie ;
- comprendre l'idée générale de la mise à jour des poids ;
- exécuter un perceptron simple et tester ses prédictions ;
- expliquer ses limites et les précautions nécessaires.

Aucune bibliothèque spécialisée ni API payante n'est requise.

## Sommaire

1. Situer les réseaux de neurones dans l'IA
2. Comprendre le neurone artificiel
3. Calculer une somme pondérée
4. Comprendre le biais et l'activation
5. Organiser des neurones en couches
6. Distinguer propagation avant et apprentissage
7. Comprendre la fonction de perte et la mise à jour
8. Programmer un perceptron en Python
9. Tester les prédictions et analyser les résultats
10. Limites, biais et sécurité
11. Mini-projet guidé
12. Exercices progressifs
13. Corrigés expliqués
14. Fiche de révision

## 1. Situer les réseaux de neurones dans l'IA

Il faut distinguer trois familles de systèmes.

Un système à règles suit des instructions écrites par une personne. Exemple : si la température dépasse un seuil défini, afficher une alerte. La règle n'a pas été découverte par un entraînement.

Le Machine Learning ajuste un modèle à partir de données. L'algorithme cherche des paramètres qui permettent de produire des prédictions utiles. Les arbres de décision, les modèles linéaires et les réseaux de neurones appartiennent à cette grande famille.

L'IA générative produit du contenu, par exemple du texte, du son ou des images. Beaucoup de systèmes génératifs modernes utilisent des réseaux de neurones profonds, mais tous les réseaux de neurones ne sont pas des IA génératives. Un petit perceptron qui classe des valeurs ne rédige pas un texte.

Analogie : un neurone artificiel est comme une petite calculatrice qui reçoit plusieurs nombres, leur donne une importance différente, puis applique une règle de sortie. Un réseau relie plusieurs de ces calculatrices.

## 2. Comprendre le neurone artificiel

Un neurone artificiel reçoit une ou plusieurs entrées numériques. Chaque entrée est multipliée par un poids. Le modèle additionne les résultats, ajoute un biais, puis applique une fonction d'activation.

Les éléments principaux sont :
- entrée : une caractéristique fournie au modèle ;
- poids : nombre qui règle l'influence d'une entrée ;
- biais : valeur ajoutée au calcul ;
- activation : fonction qui transforme le résultat ;
- sortie : valeur produite par le neurone.

Exemple concret : un modèle pédagogique reçoit deux caractéristiques d'un fruit, son poids et son diamètre. Le poids et le diamètre sont des nombres. Les poids du modèle indiquent quelle importance leur attribuer. Le biais décale le résultat.

Les poids ne sont pas des notes de valeur morale. Ils sont des paramètres numériques appris pendant l'entraînement. Un poids positif peut augmenter le score, un poids négatif peut le diminuer. L'effet dépend aussi de l'échelle des données et des autres paramètres.

Un neurone artificiel ne comprend pas le sens d'une caractéristique comme une personne. Il réalise un calcul défini par son architecture et ses paramètres.

## 3. Calculer une somme pondérée

Pour deux entrées x1 et x2, deux poids w1 et w2 et un biais b, le neurone calcule :

~~~text
score = (x1 × w1) + (x2 × w2) + b
~~~

Exemple avec x1 = 2, x2 = 3, w1 = 0,5, w2 = 0,2 et b = -0,1 :

~~~text
score = (2 × 0,5) + (3 × 0,2) - 0,1
score = 1 + 0,6 - 0,1
score = 1,5
~~~

Le score n'est pas forcément la réponse finale. Il est transmis à une fonction d'activation.

En Python, on peut représenter les calculs ainsi :

~~~python
x1 = 2
x2 = 3

w1 = 0.5
w2 = 0.2
biais = -0.1

score = x1 * w1 + x2 * w2 + biais
print(score)  # 1.5
~~~

Les poids et le biais sont ici choisis manuellement pour l'exemple. Dans un vrai entraînement, l'algorithme les ajuste à partir des données et d'une méthode d'optimisation.

## 4. Comprendre le biais et l'activation

Le biais permet de déplacer le seuil de décision. Sans biais, la frontière de décision est contrainte de passer par une position particulière. Le biais donne plus de souplesse au modèle.

La fonction d'activation transforme le score. Dans un perceptron simple, on peut utiliser une fonction seuil :

~~~python
def activation(score):
    if score >= 0:
        return 1
    return 0
~~~

Un score positif ou nul donne 1 ; un score négatif donne 0. Cette fonction est facile à comprendre, mais elle ne convient pas à tous les problèmes.

D'autres réseaux utilisent des fonctions comme ReLU, sigmoïde ou tanh. ReLU renvoie zéro pour une entrée négative et conserve une entrée positive. La sigmoïde produit une valeur entre 0 et 1. Ces fonctions ont des propriétés mathématiques différentes.

Ne choisis pas une activation au hasard. Elle dépend de la tâche, de la sortie attendue et de la méthode d'apprentissage. Dans cette leçon, la fonction seuil suffit pour comprendre le perceptron.

## 5. Organiser des neurones en couches

Un réseau simple peut être organisé en couches.

- Couche d'entrée : reçoit les caractéristiques.
- Couches cachées : effectuent des calculs intermédiaires.
- Couche de sortie : produit le résultat utilisé par le programme.

Une couche peut contenir plusieurs neurones. Les sorties d'une couche deviennent les entrées de la suivante.

Le terme profond désigne généralement un réseau qui possède plusieurs couches cachées. Ajouter des couches augmente la capacité du modèle, mais rend aussi l'entraînement et l'analyse plus complexes.

Un réseau ne devient pas fiable uniquement parce qu'il est grand. Il lui faut des données adaptées, une tâche bien définie, une évaluation honnête et des contrôles de sécurité.

Analogie : imagine une chaîne de préparation. Une première étape lit les ingrédients, une deuxième combine certaines informations, une troisième produit un résultat. Chaque étape dépend des valeurs calculées avant elle.

## 6. Distinguer propagation avant et apprentissage

La propagation avant, ou forward pass, consiste à faire passer les données dans le réseau pour calculer une sortie. Les paramètres sont utilisés tels qu'ils sont à ce moment-là.

L'inférence correspond à l'utilisation du modèle pour obtenir une prédiction sur une nouvelle entrée. Elle ne signifie pas que le modèle apprend automatiquement à chaque question.

L'entraînement est différent. Le modèle reçoit des exemples, compare ses prédictions aux réponses attendues et ajuste ses paramètres selon une méthode d'apprentissage.

Le cycle général est :
1. fournir un exemple ;
2. calculer une prédiction ;
3. mesurer l'écart avec la réponse attendue ;
4. calculer comment modifier les paramètres ;
5. recommencer sur d'autres exemples.

Les données d'entraînement servent à ajuster les paramètres. Les données de validation aident à choisir les réglages. Les données de test servent à estimer les performances sur des exemples gardés à part.

Ne confonds pas l'inférence et l'apprentissage. Un modèle utilisé pour répondre n'est pas nécessairement en train de se réentraîner.

## 7. Comprendre la fonction de perte et la mise à jour

La fonction de perte mesure l'écart entre la prédiction et la cible selon une règle mathématique. Une perte faible indique que le résultat est proche de ce qui est attendu pour cette mesure, mais elle ne prouve pas à elle seule que le modèle sera fiable sur de nouvelles données.

L'algorithme d'optimisation utilise cette mesure pour modifier les paramètres. La descente de gradient est une méthode courante : elle estime dans quelle direction changer les poids pour réduire la perte, puis effectue une petite mise à jour.

Le taux d'apprentissage règle la taille de cette mise à jour. S'il est trop grand, l'entraînement peut devenir instable. S'il est trop petit, l'apprentissage peut être très lent.

Le perceptron de cette leçon utilise une règle de mise à jour plus simple que la descente de gradient utilisée dans de nombreux réseaux modernes. Il sert à comprendre l'idée générale : les paramètres changent lorsque la prédiction est incorrecte.

L'entraînement doit être contrôlé. Il faut suivre les résultats sur des données séparées, surveiller le surapprentissage et éviter de sélectionner un modèle uniquement parce qu'il réussit sur les exemples qu'il a déjà vus.

## 8. Programmer un perceptron en Python

Nous allons apprendre la fonction logique ET. Elle renvoie 1 uniquement lorsque les deux entrées valent 1.

| Entrée A | Entrée B | Résultat attendu |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Le code suivant utilise uniquement Python standard. Il ajuste deux poids et un biais sur ces quatre exemples.

~~~python
def activation(score):
    return 1 if score >= 0 else 0

donnees = [
    ([0, 0], 0),
    ([0, 1], 0),
    ([1, 0], 0),
    ([1, 1], 1)
]

poids = [0.0, 0.0]
biais = 0.0
taux = 0.1

for epoque in range(12):
    erreurs = 0

    for entrees, cible in donnees:
        score = sum(
            poids[i] * entrees[i]
            for i in range(2)
        ) + biais

        prediction = activation(score)
        erreur = cible - prediction

        if erreur != 0:
            erreurs += 1

        for i in range(2):
            poids[i] += taux * erreur * entrees[i]

        biais += taux * erreur

    print("Epoque", epoque + 1, "erreurs :", erreurs)

print("Poids appris :", poids)
print("Biais appris :", biais)
~~~

Le modèle commence avec des poids nuls. Il calcule une prédiction, compare celle-ci à la cible, puis ajuste les paramètres lorsqu'il se trompe.

La boucle externe représente les époques : plusieurs passages sur les données. La boucle interne traite les exemples un par un.

## 9. Tester les prédictions et analyser les résultats

Après l'entraînement, on utilise les paramètres appris pour effectuer une inférence :

~~~python
def predire(entrees, poids, biais):
    score = sum(
        poids[i] * entrees[i]
        for i in range(len(entrees))
    ) + biais

    return activation(score)

for entrees, cible in donnees:
    resultat = predire(entrees, poids, biais)
    print(entrees, "->", resultat, "| attendu :", cible)
~~~

Compare chaque prédiction à la cible. Pour ce petit problème, tu peux vérifier les quatre combinaisons.

Une réussite sur quatre exemples ne démontre pas qu'un modèle est prêt pour une utilisation réelle. Le jeu est minuscule et entièrement contrôlé. Dans un vrai projet, il faut des exemples plus nombreux, variés et représentatifs, ainsi qu'un jeu de test séparé.

Un test doit aussi vérifier les entrées inhabituelles : valeur manquante, format incorrect ou valeur hors de la plage prévue. Le modèle doit être entouré de contrôles qui protègent l'application.

## 10. Limites, biais et sécurité

Un perceptron à une seule couche ne peut pas apprendre toutes les relations possibles. Par exemple, la fonction XOR renvoie 1 lorsque les deux entrées sont différentes. Elle n'est pas séparable par une seule frontière linéaire ; le perceptron simple ne peut donc pas la représenter correctement.

Un réseau avec des couches cachées peut apprendre des relations plus complexes, mais il demande davantage de données, de calcul et de contrôle.

Les limites à connaître :
- des données biaisées peuvent produire des prédictions injustes ;
- une caractéristique mal mesurée peut fausser le résultat ;
- un modèle peut échouer sur des exemples différents de ceux de l'entraînement ;
- une prédiction est une estimation, pas une certitude ;
- une sortie numérique ne constitue pas une explication complète.

Ne fournis pas de données personnelles inutiles. Vérifie que les données peuvent être utilisées légalement et avec une autorisation adaptée. Ne laisse pas un modèle décider seul d'une action importante sans contrôle humain et procédure de recours.

Un prompt destiné à une IA générative est une instruction en langage naturel. Il ne remplace pas l'entraînement d'un réseau. Un modèle génératif peut utiliser un réseau neuronal, mais le prompt décrit la tâche à effectuer pendant l'inférence.

## 11. Mini-projet guidé : tester une porte logique

Améliore le programme précédent pour :
1. afficher le nombre d'erreurs à chaque époque ;
2. afficher les poids finaux ;
3. tester les quatre combinaisons ;
4. compter les prédictions correctes ;
5. afficher un taux de réussite.

~~~python
correctes = 0

for entrees, cible in donnees:
    resultat = predire(entrees, poids, biais)

    if resultat == cible:
        correctes += 1

taux_reussite = correctes / len(donnees) * 100

print(
    "Resultat :",
    correctes,
    "/",
    len(donnees),
    "soit",
    taux_reussite,
    "%"
)
~~~

Explique pourquoi ce taux de réussite est seulement pédagogique. Ajoute ensuite une deuxième expérience avec la fonction OU : elle renvoie 1 si au moins une entrée vaut 1. Compare les deux tableaux.

Ne prétends pas que ce perceptron est un assistant intelligent général. Il apprend uniquement une relation très limitée à partir de quatre exemples.

## 12. Exercices progressifs

1. Identifie les entrées, les poids, le biais et la sortie dans la formule du neurone.
2. Calcule à la main le score pour x1 = 1, x2 = 2, w1 = 0,4, w2 = 0,3 et b = -0,2.
3. Écris une fonction seuil qui renvoie 1 si le score est supérieur ou égal à zéro.
4. Modifie le programme pour apprendre la fonction OU.
5. Explique pourquoi une séparation entraînement/test reste nécessaire même si un petit exemple semble fonctionner.
6. Explique pourquoi un prompt n'est pas la même chose qu'un poids du réseau.
7. Défi : écris une fonction qui compare les prédictions aux cibles et renvoie le nombre de réponses correctes.

## 13. Corrigés expliqués

~~~python
# Exercice 2
score = 1 * 0.4 + 2 * 0.3 - 0.2
print(score)  # 0.8

# Exercice 3
def seuil(score):
    if score >= 0:
        return 1
    return 0

# Exercice 4 : données de la fonction OU
donnees_ou = [
    ([0, 0], 0),
    ([0, 1], 1),
    ([1, 0], 1),
    ([1, 1], 1)
]
~~~

Pour le défi :

~~~python
def compter_correctes(donnees, poids, biais):
    total = 0

    for entrees, cible in donnees:
        resultat = predire(entrees, poids, biais)

        if resultat == cible:
            total += 1

    return total
~~~

La fonction ne modifie pas les paramètres du modèle. Elle mesure seulement le nombre de réponses égales aux cibles. Cette séparation entre prédiction et évaluation rend le code plus facile à tester.

Réponses conceptuelles :
- les poids règlent l'influence des entrées ;
- le biais décale le score ;
- l'activation transforme le score ;
- l'entraînement ajuste les paramètres ;
- l'inférence utilise les paramètres appris ;
- un prompt est une instruction fournie à un modèle génératif, pas un paramètre appris.

## 14. Fiche de révision et validation

- Un neurone artificiel calcule une somme pondérée, ajoute un biais et applique une activation.
- Les poids et le biais sont des paramètres du modèle.
- Les couches organisent les calculs.
- La propagation avant calcule une sortie.
- L'entraînement ajuste les paramètres à partir d'exemples.
- L'inférence utilise le modèle entraîné pour prédire.
- Une fonction de perte mesure un écart selon une règle définie.
- Le taux d'apprentissage influence la taille des mises à jour.
- Un perceptron simple ne peut pas représenter toutes les fonctions.
- Les résultats doivent être évalués sur des données séparées.
- Les biais, la confidentialité et les limites doivent être examinés.

Avant la leçon 07, vérifie que tu peux expliquer la formule d'un neurone, distinguer entraînement et inférence, exécuter le perceptron et décrire au moins deux limites.

**Prochaine étape :** étudier comment préparer et comparer des architectures de modèles, puis comprendre pourquoi les réseaux profonds nécessitent des méthodes d'entraînement plus avancées.

---

*Académique — Intelligence artificielle, Leçon 06.*

©pythonschool
