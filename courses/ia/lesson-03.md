# Intelligence artificielle — Leçon 03 : Premiers principes du Machine Learning

**Parcours :** Intelligence artificielle  
**Numéro :** 03  
**Niveau :** Débutant  
**Durée indicative :** 65 à 85 minutes  
**Matériel :** Téléphone ou ordinateur ; calculatrice facultative ; Python facultatif.  
**Prérequis :** Leçons 01 et 02 : familles de l'IA, données, caractéristiques, étiquettes, qualité et séparation des données.

## 1. Objectifs et prérequis

Cette leçon présente le Machine Learning, une famille de méthodes qui ajuste un modèle à partir d'exemples. À la fin, tu sauras :
- définir le Machine Learning ;
- distinguer règles écrites, apprentissage automatique et IA générative ;
- expliquer entraînement et inférence ;
- reconnaître les apprentissages supervisé, non supervisé et par renforcement ;
- distinguer paramètres et hyperparamètres ;
- reconnaître surapprentissage et sous-apprentissage ;
- comprendre des mesures d'évaluation ;
- décrire un petit projet de bout en bout.

Aucun compte payant ou téléchargement de modèle n'est obligatoire.

## 2. Qu'est-ce que le Machine Learning ?

Le Machine Learning, ou apprentissage automatique, est une partie de l'intelligence artificielle. Au lieu d'écrire chaque décision sous forme de règle, on fournit des exemples à un algorithme. Celui-ci ajuste un modèle pour repérer des régularités utiles.

Analogie : tu apprends à reconnaître des fruits en observant des exemples de pommes et de bananes. Tu remarques des tendances dans la couleur, la forme ou la masse. Un algorithme réalise un travail comparable avec des calculs, sans comprendre les fruits comme une personne.

Le résultat dépend du problème, des données, de la méthode et de l'évaluation. Un modèle peut apprendre une relation utile, mais aussi mémoriser des détails accidentels ou reproduire un biais.

Le Machine Learning n'est pas une garantie de vérité. C'est une méthode qui produit un modèle qu'il faut tester.

## 3. Trois approches différentes

**Système à règles :** une personne écrit les conditions. Exemple : « si la température dépasse un seuil, afficher une alerte ». Le programme applique ces règles ; il ne les apprend pas automatiquement à partir d'exemples.

**Machine Learning :** un algorithme ajuste un modèle à partir de données. Le modèle peut classer une observation, estimer une valeur ou regrouper des éléments.

**IA générative :** un modèle produit du contenu, par exemple du texte, une image ou du son, selon une entrée et son contexte.

Ces approches peuvent coexister dans un produit, mais elles ne désignent pas la même opération. Une liste de conditions n'est pas un modèle entraîné. Un classifieur n'est pas automatiquement génératif.

## 4. Le vocabulaire d'un modèle

Un modèle est une représentation calculée à partir d'une méthode et de données. Il reçoit une entrée et produit une sortie.

- Entrée : informations fournies au modèle.
- Caractéristique : propriété utilisée pour décrire l'entrée.
- Étiquette : réponse attendue dans un apprentissage supervisé.
- Paramètre : valeur interne ajustée pendant l'apprentissage.
- Hyperparamètre : réglage choisi pour organiser l'apprentissage.
- Prédiction : sortie produite pour une nouvelle entrée.

Exemple : pour estimer une durée de trajet, les entrées peuvent être la distance et l'heure. La sortie est une durée estimée.

Les paramètres ne sont pas forcément des règles compréhensibles par un humain. Ce sont des valeurs numériques ajustées par l'algorithme afin d'améliorer un objectif défini.

## 5. L'apprentissage supervisé

Dans l'apprentissage supervisé, les exemples d'entraînement comportent des entrées et des réponses attendues.

Deux tâches fréquentes :
- classification : choisir une catégorie, par exemple normal ou indésirable ;
- régression : estimer une valeur numérique, par exemple une durée.

| Distance | Durée observée | Catégorie |
|---:|---:|---|
| 2 km | 8 min | courte |
| 5 km | 18 min | moyenne |
| 12 km | 40 min | longue |

Les caractéristiques peuvent être la distance et l'heure. L'étiquette est la catégorie ou la durée que l'on veut prédire.

Les données doivent représenter les situations réelles. Si tous les exemples ont été mesurés à une heure calme, le modèle risque d'être moins fiable aux heures de forte circulation.

## 6. L'apprentissage non supervisé

Dans l'apprentissage non supervisé, les données ne comportent pas nécessairement d'étiquettes. L'algorithme cherche une organisation, des ressemblances ou des groupes.

Le clustering, ou regroupement, rassemble des observations proches selon certaines caractéristiques. Une application fictive pourrait découvrir plusieurs groupes de comportements d'utilisation.

Un groupe calculé n'est pas automatiquement une catégorie vraie. L'algorithme peut regrouper selon une distance numérique sans comprendre le sens humain des groupes.

Le résultat dépend de la représentation des données et de la mesure de similarité. Changer l'échelle d'une caractéristique peut modifier les groupes obtenus.

## 7. L'apprentissage par renforcement

Dans l'apprentissage par renforcement, un agent agit dans un environnement et reçoit un signal de récompense ou de pénalité selon les conséquences de ses actions.

Vocabulaire :
- agent : système qui choisit une action ;
- environnement : ce avec quoi l'agent interagit ;
- état : situation actuelle ;
- action : choix réalisé ;
- récompense : signal qui indique le résultat selon un objectif défini.

Exemple : un personnage de jeu essaie des déplacements pour atteindre une zone. Il reçoit une récompense lorsqu'il se rapproche de l'objectif.

La récompense ne représente pas forcément une valeur morale. Si elle est mal définie, l'agent peut maximiser le score sans respecter l'intention humaine. Cette méthode demande souvent de nombreuses interactions ou simulations.

## 8. Le cycle d'entraînement

L'entraînement est la phase où l'algorithme ajuste les paramètres du modèle à partir des données d'apprentissage.

Cycle simplifié :
1. définir le problème ;
2. préparer les données ;
3. choisir une méthode ;
4. initialiser le modèle ;
5. produire des prédictions sur les exemples ;
6. mesurer l'erreur ;
7. ajuster les paramètres ;
8. répéter jusqu'à un critère d'arrêt.

Une fonction de perte quantifie un écart entre prédictions et réponses attendues. Réduire cette perte sur les données d'entraînement ne garantit pas une bonne performance sur de nouveaux exemples.

Il faut noter les versions des données, la méthode, les réglages et les résultats. Sans suivi, il devient difficile de reproduire ou comparer une expérience.

## 9. Inférence : utiliser le modèle

L'inférence consiste à utiliser un modèle déjà entraîné pour produire une sortie à partir d'une nouvelle entrée.

Analogie : pendant l'entraînement, l'élève apprend avec des exercices corrigés. Pendant l'inférence, il répond à un nouvel exercice.

~~~text
Entrée : distance = 6 km
Modèle entraîné : estimation de durée
Sortie : environ 22 minutes
~~~

Cette sortie est une prédiction, pas une certitude. Il faut vérifier si la nouvelle situation ressemble aux exemples d'entraînement.

En utilisation réelle, les habitudes et les données peuvent changer. Une baisse de performance peut apparaître même si le code du modèle n'a pas changé.

## 10. Paramètres et hyperparamètres

Les paramètres sont ajustés par l'algorithme pendant l'entraînement. Les hyperparamètres sont choisis pour définir comment l'apprentissage se déroule.

Exemples d'hyperparamètres :
- nombre de voisins dans une méthode des plus proches voisins ;
- profondeur maximale d'un arbre ;
- taux d'apprentissage ;
- nombre d'itérations.

Un réglage trop élevé ou trop faible peut nuire au résultat. On compare plusieurs réglages à l'aide d'un ensemble de validation.

Modifier un hyperparamètre ne signifie pas que le modèle a appris une nouvelle observation. Il faut généralement relancer l'entraînement pour mesurer son effet.

## 11. Surapprentissage et sous-apprentissage

Le surapprentissage, ou overfitting, apparaît quand un modèle s'adapte trop précisément aux exemples d'entraînement, y compris à leurs détails accidentels. Il réussit très bien sur les exemples connus mais généralise mal.

Le sous-apprentissage, ou underfitting, apparaît lorsqu'un modèle est trop simple ou insuffisamment entraîné pour saisir la relation utile.

| Situation | Entraînement | Test | Interprétation |
|---|---|---|---|
| Bonne généralisation | Bon | Bon | Modèle utile sur les deux |
| Surapprentissage | Très bon | Faible | Mémorisation possible |
| Sous-apprentissage | Faible | Faible | Modèle insuffisant |

Pour réduire le surapprentissage, on peut obtenir plus de données pertinentes, simplifier le modèle ou utiliser une régularisation. La solution dépend du problème.

Un écart entre entraînement et test est un signal à examiner, pas une preuve unique.

## 12. Évaluer correctement un modèle

L'évaluation mesure la qualité du modèle sur des exemples qui n'ont pas servi à ajuster ses paramètres.

Pour une classification :
- exactitude : proportion de prédictions correctes ;
- précision : parmi les prédictions positives, part qui est correcte ;
- rappel : parmi les vrais cas positifs, part retrouvée.

Exemple : sur 20 messages réellement indésirables, le modèle en détecte 15. Le rappel est 15 / 20 = 75 %.

Si le modèle annonce 18 messages indésirables et que 15 le sont vraiment, la précision est 15 / 18, soit environ 83,3 %.

Aucune mesure ne suffit dans tous les contextes. Si manquer un message est coûteux, le rappel peut être important. Si accuser à tort un message normal est gênant, la précision compte aussi.

Pour une régression, on mesure l'écart entre les valeurs prédites et réelles avec des métriques adaptées.

## 13. Exemple pédagogique : le plus proche voisin

Voici un mini-exemple d'apprentissage supervisé par voisin le plus proche. Chaque exemple connu possède une taille et une catégorie. Le programme cherche l'exemple dont la taille est la plus proche de la nouvelle valeur.

~~~python
exemples = [
    (3, "petit"),
    (4, "petit"),
    (9, "grand"),
    (10, "grand")
]

nouvelle_taille = 8
meilleure_distance = None
categorie = None

for taille, etiquette in exemples:
    distance = abs(taille - nouvelle_taille)
    if meilleure_distance is None or distance < meilleure_distance:
        meilleure_distance = distance
        categorie = etiquette

print("Catégorie estimée :", categorie)
~~~

Le programme compare la nouvelle valeur aux exemples étiquetés et retient le plus proche. Il illustre une méthode supervisée très simple.

Limites : une seule caractéristique est utilisée ; les données sont fictives ; deux catégories peuvent être à égalité ; l'échelle influence la distance. Ce code est pédagogique, pas un système fiable pour une décision importante.

## 14. Prompts et IA générative

Un prompt est une instruction ou un contexte donné à un système génératif. Il peut préciser la tâche, le public, le format et les contraintes.

Exemple : « Explique la différence entre classification et régression à un débutant, avec un exemple de chaque. »

Un prompt précis améliore souvent la pertinence, mais ne garantit pas la vérité. Un modèle génératif peut produire une phrase fluide qui contient une erreur ou une information inventée.

Pour utiliser une IA générative avec prudence :
- ne partage pas de données privées ou de secrets ;
- vérifie les calculs et les faits importants ;
- demande les hypothèses utilisées ;
- distingue une réponse plausible d'une réponse démontrée ;
- garde un contrôle humain pour les décisions importantes.

## 15. Sécurité et responsabilité

Les données d'entraînement peuvent contenir des informations privées, des erreurs ou des éléments protégés. Il faut connaître leur provenance et les règles qui autorisent leur utilisation.

Bonnes pratiques :
- collecter uniquement les données nécessaires ;
- expliquer l'objectif du traitement ;
- protéger les fichiers et limiter les accès ;
- documenter les biais possibles ;
- tester des situations différentes ;
- prévoir un contrôle humain lorsque les conséquences sont importantes.

Un modèle peut être utilisé dans un contexte différent de celui prévu. La sécurité fait donc partie de la qualité technique du projet.

## 16. Exercices progressifs

**Exercice 1 :** un programme applique « si le score dépasse 50, afficher réussite ». Est-ce un système à règles, du Machine Learning ou de l'IA générative ? Justifie.

**Exercice 2 :** associe chaque situation à une famille : apprendre avec des messages étiquetés ; regrouper des comportements sans étiquettes ; apprendre à un agent avec des récompenses.

**Exercice 3 :** un modèle déjà entraîné reçoit une nouvelle observation et produit une prédiction. Quelle phase est réalisée ?

**Exercice 4 :** un modèle réussit très bien sur l'entraînement mais échoue sur le test. Quelle difficulté suspectes-tu ? Donne deux vérifications.

**Exercice 5 :** un filtre doit retrouver le plus possible de messages indésirables. Quelle mesure indique la part des vrais messages retrouvés ? Pourquoi regarder aussi les faux positifs ?

## 17. Mini-projet : fiche de conception d'un modèle

Imagine une application qui classe des objets fictifs selon deux caractéristiques. Prépare une fiche :
1. question à résoudre ;
2. caractéristiques disponibles ;
3. étiquettes attendues ;
4. méthode envisagée ;
5. séparation entraînement, validation et test ;
6. mesure d'évaluation ;
7. trois limites ou risques ;
8. méthode de vérification des erreurs.

Tu peux inventer dix observations. Ne présente pas le résultat comme une preuve scientifique : le but est de construire un protocole clair et reproductible.

## 18. Corrigés expliqués et fiche de révision

**Exercice 1 :** c'est un système à règles. Une personne a écrit la condition. Aucun paramètre n'est ajusté à partir d'exemples.

**Exercice 2 :** messages étiquetés : supervisé ; regroupement sans étiquette : non supervisé ; agent et récompenses : renforcement.

**Exercice 3 :** c'est l'inférence : le modèle déjà entraîné produit une sortie pour une nouvelle entrée.

**Exercice 4 :** le surapprentissage est possible. Vérifie la séparation des données, une fuite éventuelle, la complexité du modèle et la représentativité du test.

**Exercice 5 :** le rappel mesure la part des vrais messages indésirables retrouvés. Les faux positifs comptent aussi, car un message normal pourrait être classé à tort.

| Terme | Idée essentielle |
|---|---|
| Machine Learning | Ajuster un modèle à partir d'exemples |
| Supervisé | Exemples avec réponses attendues |
| Non supervisé | Chercher des structures sans étiquettes |
| Renforcement | Apprendre par actions et récompenses |
| Entraînement | Ajuster les paramètres |
| Inférence | Utiliser le modèle sur une nouvelle entrée |
| Hyperparamètre | Réglage de l'expérience |
| Overfitting | Très bon sur entraînement, faible sur test |
| Underfitting | Modèle insuffisant |
| Précision | Fiabilité des prédictions positives |
| Rappel | Part des vrais positifs retrouvés |

Avant la leçon 04, tu dois pouvoir distinguer les familles d'apprentissage, expliquer entraînement et inférence, repérer le surapprentissage et choisir une mesure.

**Prochaine étape :** évaluer plusieurs expériences et comparer les résultats d'un modèle.

---

*Académique — Intelligence artificielle, leçon 03.*  
*©pythonschool*