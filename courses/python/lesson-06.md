# Python — Leçon 06 : Les boucles for et while

**Parcours :** Python  
**Numéro :** 06  
**Niveau :** Débutant  
**Durée indicative :** 60 à 80 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard  
**Prérequis :** Leçons 01 à 05 : affichage, variables, types, calculs, saisie, conversions et conditions.

## 1. Objectifs et prérequis

Jusqu'ici, tes instructions étaient souvent exécutées une seule fois. Pourtant, un programme doit parfois afficher dix nombres, répéter une question ou calculer plusieurs résultats. Une boucle répète un bloc d'instructions selon une règle.

À la fin, tu sauras :
- expliquer l'intérêt d'une boucle ;
- utiliser for et range ;
- distinguer début, fin et pas ;
- répéter avec while tant qu'une condition est vraie ;
- accumuler un total ;
- utiliser break et continue ;
- reconnaître une boucle infinie et une erreur de limite.

Les exemples fonctionnent dans Pydroid 3 sans module supplémentaire.

## 2. Pourquoi utiliser une boucle ?

Imagine que tu veuilles afficher le même message cent fois. Copier cent instructions print serait long et risquerait de créer des erreurs. Une boucle permet d'écrire l'action une seule fois et de demander à Python de la répéter.

~~~python
for repetition in range(5):
    print("Bonjour")
~~~

Le message est affiché cinq fois. La boucle contrôle le nombre de répétitions.

Analogie : imagine une consigne qui dit « répète cette action pour chaque objet dans la boîte ». Il faut connaître l'action à répéter et la règle qui permet de savoir quand s'arrêter.

Une boucle n'est pas une fonction magique : elle suit exactement les limites et les conditions écrites. Si la règle est incorrecte, le programme peut répéter trop peu, trop longtemps ou sans fin.

## 3. La boucle for

for est pratique lorsqu'on veut parcourir une suite de valeurs. La variable de boucle reçoit une valeur à chaque tour.

Syntaxe :

~~~python
for variable in sequence:
    instruction
~~~

Exemple :

~~~python
for numero in range(4):
    print("Tour :", numero)
~~~

Le résultat contient 0, 1, 2 et 3. range(4) commence à zéro et s'arrête avant quatre. La borne finale est exclue.

Les lignes indentées appartiennent à la boucle. Une instruction placée après le bloc, sans indentation, s'exécute une seule fois après les répétitions.

~~~python
for numero in range(3):
    print("Dans la boucle", numero)

print("Après la boucle")
~~~

L'indentation fait partie de la syntaxe Python. Utilise quatre espaces par niveau et conserve le même alignement dans le bloc.

## 4. Comprendre range

range peut recevoir un, deux ou trois paramètres :
- range(fin) : part de zéro et s'arrête avant fin ;
- range(debut, fin) : part de debut et s'arrête avant fin ;
- range(debut, fin, pas) : avance selon le pas indiqué.

~~~python
for n in range(1, 6):
    print(n)  # 1, 2, 3, 4, 5

for n in range(2, 11, 2):
    print(n)  # 2, 4, 6, 8, 10
~~~

Pour compter à rebours, utilise un pas négatif :

~~~python
for n in range(5, 0, -1):
    print(n)
print("Départ !")
~~~

Le pas ne peut pas être zéro. Un pas nul déclenche ValueError, car la suite ne pourrait pas avancer.

Avant d'exécuter une boucle, écris les premières valeurs sur papier. Cela aide à comprendre pourquoi la borne de fin n'apparaît pas.

## 5. Accumuler un résultat

Une boucle peut calculer une somme ou un total. On initialise la variable avant la boucle, puis on la met à jour à chaque tour.

~~~python
total = 0

for nombre in range(1, 6):
    total = total + nombre

print("Somme :", total)
~~~

La variable total reçoit successivement 1, puis 3, puis 6, puis 10 et enfin 15.

On peut utiliser l'écriture raccourcie :

~~~python
total = 0
for nombre in range(1, 6):
    total += nombre
print(total)
~~~

total += nombre signifie « ajouter nombre à la valeur actuelle de total ». Si tu places total = 0 dans la boucle, tu effaces les additions précédentes à chaque tour. L'initialisation doit rester avant la répétition.

## 6. La boucle while

while répète un bloc tant qu'une condition reste vraie. Elle est utile lorsque le nombre de répétitions n'est pas connu à l'avance.

~~~python
compteur = 1

while compteur <= 5:
    print(compteur)
    compteur += 1
~~~

Le programme affiche 1 à 5. Après chaque tour, compteur augmente. Quand il vaut 6, la condition devient fausse et la boucle s'arrête.

Avant d'écrire une boucle while, réponds à trois questions :
1. Quelle valeur démarre la boucle ?
2. Quelle condition permet de continuer ?
3. Quelle instruction fera devenir la condition fausse ?

Si tu ne peux pas répondre à la troisième question, ta boucle risque de ne jamais s'arrêter.

## 7. Éviter une boucle infinie

Une boucle infinie continue parce que sa condition reste vraie. L'erreur la plus fréquente consiste à oublier de modifier la variable de contrôle.

Exemple incorrect :

~~~python
compteur = 1
while compteur <= 5:
    print(compteur)
    # compteur n'augmente jamais
~~~

La condition reste vraie puisque compteur vaut toujours 1.

Correction :

~~~python
compteur = 1
while compteur <= 5:
    print(compteur)
    compteur += 1
~~~

Dans Pydroid 3, si l'exécution semble bloquée, arrête le programme, vérifie la variable de contrôle et relance après correction. Ne compte pas sur la fermeture de l'application pour résoudre la logique.

## 8. Choisir entre for et while

Utilise généralement for quand tu connais la suite à parcourir : cinq répétitions, une série de nombres ou chaque élément d'une collection.

Utilise while quand la répétition dépend d'une situation : attendre une réponse, continuer tant qu'un compteur reste positif ou tant qu'un jeu n'est pas terminé.

~~~python
for tour in range(3):
    print("Entraînement", tour + 1)

energie = 3
while energie > 0:
    print("Énergie :", energie)
    energie -= 1
~~~

Les deux boucles peuvent parfois résoudre le même problème. Choisis celle qui rend l'objectif le plus clair. Une boucle for avec range est souvent plus simple pour un nombre fixe de tours.

## 9. Arrêter avec break

break quitte immédiatement la boucle la plus proche.

~~~python
for nombre in range(1, 10):
    if nombre == 5:
        break
    print(nombre)
~~~

Le programme affiche 1 à 4. Quand nombre vaut 5, break arrête la boucle avant l'affichage.

On peut aussi l'utiliser dans une boucle volontairement ouverte :

~~~python
compteur = 0
while True:
    compteur += 1
    print("Essai", compteur)
    if compteur == 3:
        break
~~~

while True ne possède pas de condition naturelle d'arrêt. Dans cet exemple, break fournit la sortie. Toute boucle de ce type doit avoir une sortie claire.

## 10. Passer un tour avec continue

continue abandonne le reste du tour actuel et passe au suivant. La boucle continue ensuite normalement.

~~~python
for nombre in range(1, 6):
    if nombre == 3:
        continue
    print(nombre)
~~~

Le programme affiche 1, 2, 4 et 5. Le nombre 3 est ignoré.

Dans une boucle while, attention à ne pas placer continue avant l'instruction qui fait avancer le compteur. Si le compteur n'évolue plus, la condition peut rester vraie indéfiniment.

N'utilise pas continue partout. Une condition simple est parfois plus lisible.

## 11. Boucles imbriquées et parcours de texte

Une boucle imbriquée se trouve à l'intérieur d'une autre boucle. Pour chaque tour extérieur, la boucle intérieure réalise tous ses tours.

~~~python
for ligne in range(1, 4):
    for colonne in range(1, 3):
        print("Ligne", ligne, "Colonne", colonne)
~~~

Il y a trois lignes et deux colonnes, donc six affichages. Les boucles imbriquées servent à parcourir une grille ou construire une table.

for peut aussi parcourir les caractères d'un texte :

~~~python
mot = "PYTHON"
for lettre in mot:
    print(lettre)
~~~

À chaque tour, lettre reçoit le caractère suivant. Plus tard, tu utiliseras la même logique pour parcourir une liste.

## 12. Erreurs fréquentes et débogage

| Problème | Cause | Correction |
|---|---|---|
| La boucle ne s'arrête pas | Condition de while inchangée | Faire évoluer le compteur |
| Le dernier nombre manque | range exclut la borne finale | Augmenter la borne si nécessaire |
| Le total est faux | Total réinitialisé dans la boucle | Initialiser avant la boucle |
| IndentationError | Espaces incohérents | Aligner les instructions |
| Aucun tour n'est exécuté | Condition fausse au départ | Vérifier la valeur initiale |
| Trop de répétitions | Borne ou pas incorrect | Tester les premières valeurs |

Méthode de débogage :
1. affiche temporairement le compteur ;
2. prédis les trois premiers tours ;
3. vérifie la condition d'arrêt ;
4. vérifie la borne et le pas ;
5. teste avec de petites valeurs ;
6. retire les affichages de diagnostic une fois le problème compris.

Une boucle doit avoir une intention claire : ce qui est répété, combien de fois ou jusqu'à quelle condition.

## 13. Exercices progressifs

Réalise les exercices avant de lire les corrections.

**Exercice 1 — Compter :** affiche les nombres de 1 à 10 avec for et range.

**Exercice 2 — Nombres pairs :** affiche les nombres pairs de 2 à 20 en utilisant un pas adapté.

**Exercice 3 — Somme :** calcule la somme des nombres de 1 à 100 avec une variable total.

**Exercice 4 — Compte à rebours :** utilise while pour afficher 5, 4, 3, 2, 1 puis « Départ ! ».

**Exercice 5 — Ignorer une valeur :** affiche 1 à 8, mais ignore 4 avec continue.

**Exercice 6 — Table :** demande un entier et affiche sa table de multiplication de 1 à 10.

## 14. Mini-projet : calculateur de tables

Construis un programme qui demande un nombre, affiche sa table de multiplication de 1 à 10, puis demande si l'utilisateur veut en afficher une autre.

Étapes :
1. demande un entier ;
2. utilise for pour afficher dix produits ;
3. demande une réponse oui ou non ;
4. utilise while pour recommencer si la réponse vaut oui ;
5. affiche un message final lorsque la personne arrête.

La boucle extérieure gère le fait de recommencer. La boucle intérieure affiche les dix lignes d'une table. Elles ont deux responsabilités différentes.

Pour cette première version, tu peux supposer que l'utilisateur saisit un entier valide. La validation avancée des saisies sera étudiée dans une autre leçon.

## 15. Corrigés expliqués

**Exercice 1**

~~~python
for nombre in range(1, 11):
    print(nombre)
~~~

11 est exclu, donc le dernier affichage est 10.

**Exercice 2**

~~~python
for nombre in range(2, 21, 2):
    print(nombre)
~~~

Le départ est 2, la fin 21 est exclue et le pas vaut 2.

**Exercice 3**

~~~python
total = 0
for nombre in range(1, 101):
    total += nombre
print("Somme :", total)
~~~

101 est exclu : 100 est donc inclus. Le résultat attendu est 5050.

**Exercice 4**

~~~python
compteur = 5
while compteur > 0:
    print(compteur)
    compteur -= 1
print("Départ !")
~~~

La valeur diminue jusqu'à zéro, puis la condition devient fausse.

**Exercice 5**

~~~python
for nombre in range(1, 9):
    if nombre == 4:
        continue
    print(nombre)
~~~

continue saute seulement le tour où nombre vaut 4.

**Exercice 6**

~~~python
nombre = int(input("Choisis un nombre : "))
for multiplicateur in range(1, 11):
    resultat = nombre * multiplicateur
    print(nombre, "x", multiplicateur, "=", resultat)
~~~

La boucle effectue dix calculs. La saisie doit être un entier valide.

## 16. Mini-projet corrigé et fiche de révision

~~~python
reponse = "oui"

while reponse == "oui":
    nombre = int(input("Nombre pour la table : "))

    for multiplicateur in range(1, 11):
        resultat = nombre * multiplicateur
        print(nombre, "x", multiplicateur, "=", resultat)

    reponse = input("Une autre table ? (oui/non) ").lower()

print("Calculateur terminé.")
~~~

while permet de recommencer. for affiche les dix multiplications. lower() met la réponse en minuscules. Cette version suppose que le nombre saisi est valide.

| Élément | Rôle |
|---|---|
| for | Parcourir une suite |
| range(fin) | De zéro à fin exclu |
| range(début, fin, pas) | Définir le pas |
| while | Répéter tant qu'une condition est vraie |
| break | Quitter la boucle |
| continue | Passer au tour suivant |
| Indentation | Délimiter le bloc |

Avant la leçon 07, vérifie que tu peux choisir for ou while, expliquer la borne exclue de range, calculer une somme, garantir l'arrêt d'un while et distinguer break de continue.

**Prochaine étape :** les listes, pour stocker plusieurs valeurs dans une seule variable et les parcourir avec des boucles.

---

*Académique — Python, leçon 06.*  
*©pythonschool*