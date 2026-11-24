# Python — Leçon 08 : Les fonctions, organiser et réutiliser son code

**Parcours :** Python  
**Numéro :** 08  
**Niveau :** Débutant  
**Durée indicative :** 75 à 100 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, types, opérations, input(), conversions, conditions, boucles et listes.

## Objectifs et prérequis

Une fonction est un bloc de code nommé qui réalise une tâche. Elle évite de recopier les mêmes instructions et rend un programme plus facile à lire, tester et corriger.

À la fin de cette leçon, tu sauras définir une fonction avec def, l'appeler, lui transmettre des paramètres, récupérer un résultat avec return, utiliser des valeurs par défaut et organiser un petit programme en plusieurs fonctions.

Aucune bibliothèque externe ni connexion Internet n'est nécessaire. Dans Pydroid 3, crée un fichier fonctions.py et exécute les exemples séparément.

## Sommaire

1. Pourquoi utiliser des fonctions ?
2. Définir et appeler une fonction
3. Paramètres et arguments
4. Renvoyer une valeur avec return
5. Variables locales et portée
6. Valeurs par défaut et arguments nommés
7. Documenter et nommer une fonction
8. Découper un problème
9. Erreurs fréquentes et débogage
10. Mini-projet : calculateur de budget
11. Exercices progressifs
12. Corrigés expliqués
13. Fiche de révision

## 1. Pourquoi utiliser des fonctions ?

Imagine une recette que tu prépares souvent. Au lieu de réécrire toutes les étapes à chaque fois, tu lui donnes un nom et tu suis ce bloc d'instructions lorsque tu en as besoin. Une fonction joue ce rôle dans un programme.

Sans fonction, le même calcul peut être copié à plusieurs endroits. Si tu dois le corriger, tu risques d'oublier une copie. Avec une fonction, tu modifies un seul endroit.

Une fonction aide à :
- donner un nom clair à une action ;
- éviter la répétition ;
- séparer un problème compliqué en petites tâches ;
- tester une partie sans relancer tout le programme ;
- réutiliser du code dans plusieurs projets.

Une fonction ne rend pas automatiquement un programme meilleur. Une fonction trop longue ou qui fait beaucoup de choses différentes devient difficile à comprendre. Cherche une responsabilité précise : calculer un total, afficher un menu, vérifier une saisie ou convertir une valeur.

## 2. Définir et appeler une fonction

En Python, le mot-clé def commence une définition. Le nom est suivi de parenthèses et de deux-points. Les instructions du bloc sont indentées.

~~~python
def dire_bonjour():
    print("Bonjour !")

dire_bonjour()
~~~

La définition prépare la fonction, mais ne l'exécute pas immédiatement. L'appel, écrit avec le nom et les parenthèses, lance son contenu.

Une fonction peut être appelée plusieurs fois :

~~~python
def afficher_ligne():
    print("----------------")

afficher_ligne()
print("MON PROGRAMME")
afficher_ligne()
~~~

Respecte l'indentation. Les instructions appartenant à la fonction doivent être décalées de façon cohérente. En Python, quatre espaces sont une convention courante.

Un nom de fonction doit expliquer l'action. Préfère calculer_total à faire_truc. Les noms utilisent généralement des minuscules et des underscores.

## 3. Paramètres et arguments

Un paramètre est une variable indiquée dans la définition. Un argument est la valeur fournie lors de l'appel.

~~~python
def saluer(prenom):
    print(f"Bonjour {prenom} !")

saluer("Awa")
saluer("Moussa")
~~~

Ici, prenom est le paramètre. "Awa" et "Moussa" sont les arguments. La même fonction fonctionne avec plusieurs valeurs.

Une fonction peut recevoir plusieurs paramètres :

~~~python
def presenter(prenom, ville):
    print(f"{prenom} habite à {ville}.")

presenter("Awa", "Abidjan")
~~~

Les arguments positionnels suivent l'ordre des paramètres. Si tu inverses les valeurs, le résultat peut être incorrect sans provoquer d'erreur. Les noms de paramètres doivent donc être clairs.

Tu peux transmettre des variables :

~~~python
prix = 500
quantite = 3

def afficher_prix(prix_unitaire, nombre):
    print(f"Total : {prix_unitaire * nombre} FCFA")

afficher_prix(prix, quantite)
~~~

Une fonction reçoit les valeurs au moment de l'appel. Elle ne devine pas les informations dont elle a besoin : indique-les explicitement.

## 4. Renvoyer une valeur avec return

print() affiche un résultat à l'écran. return renvoie une valeur au programme qui a appelé la fonction. Ce sont deux rôles différents.

~~~python
def additionner(a, b):
    resultat = a + b
    return resultat

somme = additionner(4, 6)
print(somme)
~~~

La fonction calcule puis renvoie 10. La variable somme reçoit cette valeur. Tu peux ensuite la réutiliser dans un autre calcul.

Une fonction peut renvoyer directement une expression :

~~~python
def carre(nombre):
    return nombre * nombre

print(carre(5))
print(carre(5) + 2)
~~~

Quand Python rencontre return, la fonction se termine. Les instructions placées après ce return dans le même chemin ne sont pas exécutées.

Si une fonction n'utilise pas return, elle renvoie implicitement None. None signifie qu'aucune valeur utile n'a été renvoyée.

~~~python
def afficher_message():
    print("Prêt !")

resultat = afficher_message()
print(resultat)  # None
~~~

N'utilise pas print() à la place de return lorsque le programme doit récupérer le résultat pour continuer un calcul.

## 5. Variables locales et portée

Une variable créée dans une fonction est généralement locale : elle est utilisable dans cette fonction, mais pas directement à l'extérieur.

~~~python
def calculer():
    resultat = 7 * 3
    print(resultat)

calculer()
# print(resultat)  # NameError : resultat n'existe pas ici
~~~

Pour récupérer la valeur à l'extérieur, utilise return :

~~~python
def calculer():
    resultat = 7 * 3
    return resultat

valeur = calculer()
print(valeur)
~~~

Une variable globale est définie en dehors des fonctions. Elle peut être lue dans une fonction, mais modifier une variable globale avec global rend le programme plus difficile à suivre. Pour débuter, préfère transmettre une valeur comme paramètre et renvoyer un résultat.

~~~python
taux = 0.10

def calculer_remise(prix):
    return prix * taux

print(calculer_remise(1000))
~~~

Ici, la fonction lit taux. Pour un programme plus évolutif, tu pourrais aussi transmettre le taux comme deuxième paramètre afin que toutes ses dépendances soient visibles.

## 6. Valeurs par défaut et arguments nommés

Un paramètre peut recevoir une valeur par défaut. Elle est utilisée si l'appel ne fournit pas cet argument.

~~~python
def saluer(prenom, message="Bienvenue"):
    print(f"{message}, {prenom} !")

saluer("Awa")
saluer("Koffi", "Bonjour")
~~~

Le premier appel utilise le message par défaut. Le deuxième fournit son propre message.

Les arguments nommés précisent le paramètre visé :

~~~python
def fiche(nom, ville, niveau):
    print(f"{nom} — {ville} — {niveau}")

fiche(niveau="Débutant", nom="Awa", ville="Bouaké")
~~~

Cette forme améliore la lisibilité lorsqu'une fonction reçoit plusieurs paramètres. Les paramètres obligatoires doivent être placés avant les paramètres avec valeur par défaut.

Évite les valeurs par défaut qui sont des listes ou dictionnaires modifiables lorsque tu débutes : elles peuvent être partagées entre plusieurs appels. Utilise plutôt None puis crée la liste dans la fonction.

## 7. Documenter et nommer une fonction

Une docstring est une courte description placée juste après la ligne def. Elle explique le rôle de la fonction.

~~~python
def aire_rectangle(longueur, largeur):
    """Renvoie l'aire d'un rectangle."""
    return longueur * largeur

print(aire_rectangle(5, 3))
print(aire_rectangle.__doc__)
~~~

Une bonne docstring indique ce que la fonction fait, ce qu'elle reçoit et ce qu'elle renvoie lorsque cela n'est pas évident.

Les annotations de type donnent des indications au lecteur :

~~~python
def multiplier(a: float, b: float) -> float:
    return a * b
~~~

Ces annotations ne convertissent pas automatiquement les valeurs et ne bloquent pas toutes les erreurs. Elles documentent l'intention et peuvent aider certains outils.

Utilise un verbe dans le nom : lire_notes, calculer_moyenne, afficher_menu. Une fonction qui renvoie une valeur peut être nommée obtenir_total. Une fonction qui effectue une action peut être nommée afficher_resultat.

## 8. Découper un problème

Pour construire un programme, commence par décrire les étapes en français. Transforme ensuite chaque responsabilité en fonction.

Exemple : calculer une moyenne de notes.
1. demander les notes ;
2. vérifier que la liste n'est pas vide ;
3. calculer la moyenne ;
4. afficher le résultat.

~~~python
def calculer_moyenne(notes):
    if len(notes) == 0:
        return None
    return sum(notes) / len(notes)

notes = [12, 15, 14]
moyenne = calculer_moyenne(notes)

if moyenne is None:
    print("Aucune note.")
else:
    print(f"Moyenne : {moyenne:.2f}")
~~~

La fonction de calcul ne demande pas elle-même les notes et n'affiche pas le résultat. Cette séparation permet de réutiliser le calcul dans une application, une console ou un test.

Une fonction doit recevoir ce dont elle a besoin et renvoyer ce que la suite du programme doit utiliser. Évite de mélanger saisie, calcul, sauvegarde et affichage dans un seul bloc.

## 9. Erreurs fréquentes et débogage

**Oublier les parenthèses lors de l'appel :** écrire saluer au lieu de saluer() désigne la fonction, mais ne l'appelle pas.

**Oublier les deux-points :** chaque définition def doit se terminer par :.

**Mauvaise indentation :** les instructions du corps doivent être indentées.

**Confondre print et return :** print affiche, return transmet une valeur.

**Mauvais nombre d'arguments :** vérifie que l'appel fournit les paramètres obligatoires.

**Nom de variable inaccessible :** une variable locale n'est pas disponible partout.

Pour déboguer, ajoute temporairement des print() aux endroits importants, teste la fonction avec une petite valeur connue et lis la dernière ligne de l'erreur. Une fonction courte est plus facile à isoler.

~~~python
def diviser(a, b):
    if b == 0:
        return None
    return a / b

print(diviser(10, 2))
print(diviser(10, 0))
~~~

La vérification empêche une division par zéro. Le programme appelant doit ensuite décider comment traiter None.

## 10. Mini-projet : calculateur de budget

Le programme suivant sépare la saisie, le calcul et l'affichage. Il utilise des fonctions, des paramètres, return, des conditions et une boucle.

~~~python
def demander_prix():
    return float(input("Prix unitaire : "))

def demander_quantite():
    return int(input("Quantité : "))

def calculer_total(prix, quantite):
    return prix * quantite

def afficher_recapitulatif(article, prix, quantite, total):
    print("\\n=== RÉCAPITULATIF ===")
    print(f"Article : {article}")
    print(f"Prix : {prix:.2f} FCFA")
    print(f"Quantité : {quantite}")
    print(f"Total : {total:.2f} FCFA")

def main():
    article = input("Nom de l'article : ").strip()
    if not article:
        print("Le nom ne peut pas être vide.")
        return

    prix = demander_prix()
    quantite = demander_quantite()

    if prix < 0 or quantite < 0:
        print("Le prix et la quantité doivent être positifs.")
        return

    total = calculer_total(prix, quantite)
    afficher_recapitulatif(article, prix, quantite, total)

main()
~~~

La fonction main() coordonne le programme. Les fonctions demander_prix et demander_quantite s'occupent des saisies. calculer_total réalise uniquement le calcul. afficher_recapitulatif présente le résultat.

Dans une version plus robuste, tu ajouteras une gestion des erreurs de saisie avec try/except. Cette amélioration sera plus simple parce que chaque tâche est isolée.

## 11. Exercices progressifs

Réalise les exercices dans Pydroid 3 avant de consulter les corrections.

1. Crée une fonction afficher_titre() qui affiche le nom de ton projet.
2. Crée saluer(prenom) qui affiche un message personnalisé.
3. Crée additionner(a, b) qui renvoie la somme. Affiche le résultat après l'appel.
4. Crée est_pair(nombre) qui renvoie True si le nombre est pair, sinon False.
5. Crée calculer_moyenne(notes) qui renvoie la moyenne ou None si la liste est vide.
6. Crée convertir_minutes(minutes) qui renvoie le nombre d'heures et de minutes restantes sous forme de deux valeurs.
7. Défi : transforme un programme de calcul de prix en fonctions distinctes pour saisir, calculer et afficher.

Pour chaque fonction, écris un exemple d'appel et le résultat attendu avant de lancer le code.

## 12. Corrigés expliqués

~~~python
# 1
def afficher_titre():
    print("Mon premier projet")
afficher_titre()

# 2
def saluer(prenom):
    print(f"Bonjour {prenom} !")
saluer("Awa")

# 3
def additionner(a, b):
    return a + b
resultat = additionner(8, 5)
print(resultat)

# 4
def est_pair(nombre):
    return nombre % 2 == 0
print(est_pair(6))
print(est_pair(7))

# 5
def calculer_moyenne(notes):
    if not notes:
        return None
    return sum(notes) / len(notes)

# 6
def convertir_minutes(minutes):
    heures = minutes // 60
    reste = minutes % 60
    return heures, reste

h, m = convertir_minutes(135)
print(h, "heure(s) et", m, "minute(s)")
~~~

return permet de récupérer les résultats. L'opérateur modulo % donne le reste d'une division ; un entier pair a un reste nul lorsqu'il est divisé par deux. // calcule le quotient entier. Une fonction qui renvoie deux valeurs permet de les recevoir dans deux variables.

Pour le défi, la fonction de calcul ne doit pas demander de saisie : elle reçoit ses valeurs en paramètres. Cela la rend testable avec plusieurs exemples.

## 13. Fiche de révision et validation

- def définit une fonction ; le nom suivi de parenthèses l'appelle.
- Les paramètres sont indiqués dans la définition.
- Les arguments sont transmis lors de l'appel.
- print() affiche ; return renvoie une valeur.
- Une variable locale appartient à sa fonction.
- Une valeur par défaut rend un paramètre facultatif.
- Les arguments nommés améliorent la lisibilité.
- Une docstring décrit le rôle de la fonction.
- Une fonction courte doit avoir une responsabilité claire.
- Teste une fonction avec des valeurs simples et des cas limites.

Avant la leçon 09, tu dois pouvoir écrire une fonction avec paramètres et return, expliquer la portée d'une variable et découper un petit programme en plusieurs fonctions.

**©pythonschool — Python, leçon 08.**