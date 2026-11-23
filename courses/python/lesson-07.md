# Python — Leçon 07 : Les listes, créer et manipuler une collection

**Parcours :** Python  
**Numéro :** 07  
**Niveau :** Débutant  
**Durée indicative :** 70 à 90 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, types simples, opérations, input(), conversions, conditions et boucles.

## Objectifs et prérequis

Une liste conserve plusieurs valeurs dans une seule variable. À la fin de cette leçon, tu sauras créer une liste, lire et modifier ses éléments, ajouter et supprimer des valeurs, rechercher un élément, parcourir la liste, extraire une partie et réaliser un petit gestionnaire de tâches.

Les exemples utilisent uniquement Python : aucune bibliothèque supplémentaire ni connexion Internet n'est nécessaire. Dans Pydroid 3, crée un fichier listes.py et exécute les exemples séparément.

## Sommaire

1. Comprendre et créer une liste
2. Lire et modifier les éléments
3. Ajouter et supprimer
4. Mesurer et rechercher
5. Parcourir avec for et enumerate
6. Extraire et copier
7. Listes imbriquées
8. Mini-projet : tâches
9. Erreurs et débogage
10. Exercices
11. Corrigés
12. Révision

## 1. Comprendre et créer une liste

Une liste est une collection ordonnée de valeurs. Imagine une rangée de casiers : chaque casier possède une position et contient une valeur. En Python, les crochets délimitent la liste et les virgules séparent les éléments.

~~~python
fruits = ["mangue", "banane", "orange"]
notes = [14, 17, 12]
melange = ["Nova", 15, True]

print(fruits)
print(notes)
print(melange)
~~~

Une liste peut contenir plusieurs types, mais il est souvent plus simple de regrouper des valeurs de même nature. Une liste est modifiable : on dit qu'elle est mutable. Tu peux changer son contenu après sa création.

Une liste vide s'écrit [] :

~~~python
taches = []
print(taches)
~~~

Elle est utile lorsque le programme doit collecter des valeurs au fur et à mesure. La variable existe même si elle ne contient encore aucun élément.

## 2. Lire et modifier les éléments

Les positions d'une liste sont appelées indices. En Python, le premier indice vaut zéro.

~~~python
couleurs = ["rouge", "vert", "bleu"]
print(couleurs[0])  # rouge
print(couleurs[1])  # vert
print(couleurs[2])  # bleu
~~~

On peut aussi compter depuis la fin avec des indices négatifs :

~~~python
print(couleurs[-1])  # dernier élément
print(couleurs[-2])  # avant-dernier
~~~

Pour remplacer une valeur, affecte une nouvelle valeur à son indice :

~~~python
couleurs[1] = "jaune"
print(couleurs)
~~~

La position reste la même ; seule la valeur change. Une liste de trois éléments possède les indices 0, 1 et 2. Demander couleurs[3] déclenche IndexError, car cette position n'existe pas.

Avant d'utiliser un indice calculé, vérifie la longueur avec len(). Le dernier indice valide est len(liste) - 1.

## 3. Ajouter et supprimer des éléments

append() ajoute un élément à la fin. insert() insère une valeur à une position précise.

~~~python
outils = ["crayon", "gomme"]
outils.append("règle")
outils.insert(1, "stylo")
print(outils)
~~~

remove() retire la première occurrence d'une valeur. pop() retire un élément par position et renvoie la valeur retirée. Sans argument, pop() retire le dernier élément.

~~~python
outils.remove("gomme")
retire = outils.pop(0)
print("Retiré :", retire)
print("Reste :", outils)
~~~

del supprime un élément par indice :

~~~python
nombres = [10, 20, 30, 40]
del nombres[1]
print(nombres)  # [10, 30, 40]
~~~

remove() provoque ValueError si la valeur est absente. Avant de retirer une valeur, vérifie sa présence avec in. pop() peut provoquer IndexError si la liste est vide ou si l'indice est invalide.

## 4. Mesurer et rechercher

len() renvoie le nombre d'éléments. in vérifie si une valeur est présente et renvoie True ou False.

~~~python
membres = ["Awa", "Moussa", "Koffi"]
print(len(membres))       # 3
print("Awa" in membres)   # True
print("Lina" in membres)  # False
~~~

Une recherche peut être utilisée dans une condition :

~~~python
nom = input("Nom à rechercher : ")
if nom in membres:
    print("Nom présent.")
else:
    print("Nom introuvable.")
~~~

count() compte les occurrences d'une valeur. index() renvoie la position de sa première occurrence.

~~~python
votes = ["A", "B", "A", "C", "A"]
print(votes.count("A"))  # 3
print(votes.index("C"))  # 3
~~~

index() provoque ValueError si la valeur n'existe pas. Vérifie avec in avant de l'appeler.

## 5. Parcourir une liste

for permet de traiter chaque élément dans l'ordre. La variable de boucle reçoit une valeur différente à chaque tour.

~~~python
langages = ["Python", "Java", "JavaScript"]
for langage in langages:
    print("J'apprends", langage)
~~~

Si tu as aussi besoin de la position, utilise enumerate() :

~~~python
for position, langage in enumerate(langages):
    print(position, langage)

for numero, langage in enumerate(langages, start=1):
    print(f"{numero}. {langage}")
~~~

enumerate() commence à zéro par défaut. start=1 est pratique pour afficher une liste numérotée à une personne.

Évite de modifier la taille d'une liste pendant que tu la parcours directement : des éléments peuvent être sautés. Pour filtrer, crée plutôt une nouvelle liste ou parcours une copie.

## 6. Extraire et copier une liste

Une tranche, ou slice, extrait une partie. La forme liste[debut:fin] inclut le début mais exclut la fin.

~~~python
jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"]
print(jours[1:4])  # mardi, mercredi, jeudi
print(jours[:2])   # les deux premiers
print(jours[2:])   # du troisième à la fin
print(jours[::2])  # un élément sur deux
~~~

L'affectation simple ne copie pas une liste :

~~~python
originale = [1, 2, 3]
reference = originale
reference.append(4)
print(originale)  # [1, 2, 3, 4]
~~~

Les deux variables désignent le même objet. Pour une copie superficielle indépendante, utilise copy() :

~~~python
originale = [1, 2, 3]
copie = originale.copy()
copie.append(4)
print(originale)  # [1, 2, 3]
print(copie)      # [1, 2, 3, 4]
~~~

Cette copie simple ne duplique pas récursivement les sous-listes. Pour l'instant, retiens surtout la différence entre référence partagée et copie indépendante.

## 7. Listes imbriquées

Une liste peut contenir d'autres listes. Cela permet de représenter des lignes et des colonnes.

~~~python
notes = [
    [12, 15, 14],
    [16, 13, 18]
]
print(notes[0])     # première ligne
print(notes[1][2])  # troisième valeur de la deuxième ligne
~~~

Le premier indice choisit la sous-liste. Le deuxième choisit une valeur dans cette sous-liste.

Deux boucles permettent de parcourir toutes les valeurs :

~~~python
for ligne in notes:
    for note in ligne:
        print(note)
~~~

Les listes imbriquées servent à représenter des grilles ou des tableaux simples. Vérifie que la ligne existe et qu'elle contient l'indice demandé avant d'y accéder.

## 8. Mini-projet : gestionnaire de tâches

Ce programme permet d'ajouter, afficher et supprimer des tâches. Il réutilise input(), les listes, les conditions et les boucles.

~~~python
taches = []

while True:
    print("\\n1. Ajouter")
    print("2. Afficher")
    print("3. Supprimer")
    print("4. Quitter")
    choix = input("Ton choix : ")

    if choix == "1":
        nouvelle = input("Nouvelle tâche : ").strip()
        if nouvelle:
            if nouvelle not in taches:
                taches.append(nouvelle)
                print("Tâche ajoutée.")
            else:
                print("Cette tâche existe déjà.")
        else:
            print("Le texte ne peut pas être vide.")

    elif choix == "2":
        if not taches:
            print("Aucune tâche.")
        else:
            for numero, tache in enumerate(taches, start=1):
                print(f"{numero}. {tache}")

    elif choix == "3":
        for numero, tache in enumerate(taches, start=1):
            print(f"{numero}. {tache}")
        saisie = input("Numéro à supprimer : ")
        if saisie.isdigit():
            position = int(saisie) - 1
            if 0 <= position < len(taches):
                print("Supprimée :", taches.pop(position))
            else:
                print("Numéro hors de la liste.")
        else:
            print("Écris un nombre entier.")

    elif choix == "4":
        print("Fin du programme.")
        break
    else:
        print("Choix inconnu.")
~~~

Le programme retire 1 au numéro affiché, car la personne voit une numérotation à partir de 1 tandis que Python indexe à partir de 0. Les tâches ne sont pas sauvegardées après fermeture : l'enregistrement dans un fichier sera vu plus tard.

## 9. Erreurs fréquentes et débogage

- IndexError : l'indice dépasse les limites. Affiche len(liste) et vérifie la position.
- ValueError : remove() ou index() ne trouve pas la valeur. Vérifie avec in.
- append sans parenthèses : une méthode s'appelle avec des parenthèses.
- Confusion append/extend : append ajoute un seul élément ; extend ajoute chaque élément d'une séquence.

~~~python
a = [1, 2]
a.append([3, 4])
print(a)  # [1, 2, [3, 4]]

b = [1, 2]
b.extend([3, 4])
print(b)  # [1, 2, 3, 4]
~~~

Pour déboguer, affiche la liste avant et après une opération. Teste trois situations : liste vide, cas normal et valeur absente. Lis la dernière ligne du message d'erreur : elle indique souvent le type du problème.

## 10. Exercices progressifs

1. Crée une liste de quatre villes et affiche la première et la dernière.
2. Remplace le deuxième élément par une autre ville.
3. Ajoute une ville avec append(), puis retire une valeur avec remove().
4. Demande un prénom et vérifie s'il est présent dans une liste.
5. Parcours cinq nombres et affiche ceux qui sont supérieurs à 10.
6. Copie une liste, modifie la copie et vérifie que l'originale ne change pas.
7. Défi : améliore le gestionnaire pour compter les tâches et empêcher les doublons.

Écris le résultat attendu avant de lancer chaque programme. Teste aussi une recherche qui échoue et une liste vide.

## 11. Corrigés expliqués

~~~python
# 1 et 2
villes = ["Abidjan", "Bouaké", "Korhogo", "Yamoussoukro"]
print(villes[0], villes[-1])
villes[1] = "Daloa"
print(villes)

# 3
villes.append("Man")
if "Korhogo" in villes:
    villes.remove("Korhogo")

# 4
prenoms = ["Awa", "Moussa", "Koffi"]
recherche = input("Prénom : ")
if recherche in prenoms:
    print("Présent")
else:
    print("Absent")

# 5
nombres = [4, 12, 7, 19, 10]
for nombre in nombres:
    if nombre > 10:
        print(nombre)

# 6
originale = [2, 4, 6]
copie = originale.copy()
copie.append(8)
print(originale)
print(copie)
~~~

L'indice -1 désigne le dernier élément. in protège remove(). La boucle associe chaque nombre à une condition. copy() crée une liste distincte pour les opérations simples. Pour le défi, utilise len(taches) pour compter et vérifie nouvelle not in taches avant append().

## 12. Fiche de révision et validation

- Une liste est ordonnée et modifiable.
- Les indices commencent à 0 ; -1 désigne le dernier élément.
- append() ajoute à la fin ; insert() insère à une position.
- remove() retire une valeur ; pop() retire une position et renvoie l'élément.
- len() compte ; in recherche.
- for parcourt les valeurs ; enumerate() fournit aussi la position.
- liste[debut:fin] extrait une tranche, sans inclure fin.
- copy() crée une copie superficielle.
- IndexError signale souvent un indice hors limites.
- ValueError peut signaler une valeur absente.

Avant la leçon 08, tu dois pouvoir créer, modifier, parcourir et rechercher dans une liste, puis expliquer la différence entre append() et extend().

**©pythonschool — Python, leçon 07.**
