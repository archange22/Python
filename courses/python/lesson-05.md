# Python — Leçon 05 : Conditions et opérateurs logiques

**Parcours :** Python  
**Numéro :** 05  
**Niveau :** Débutant  
**Durée indicative :** 55 à 70 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard  
**Prérequis :** Leçons 01 à 04 : affichage, variables, types, calculs, saisie et conversions.

## 1. Objectifs et prérequis

Un programme ne doit pas toujours exécuter exactement les mêmes instructions. Il peut devoir choisir une action selon une situation : afficher un message si un score est suffisant, refuser une quantité négative ou proposer un résultat différent selon une note.

À la fin de cette leçon, tu sauras :
- comparer deux valeurs ;
- reconnaître les résultats booléens True et False ;
- écrire une condition avec if ;
- ajouter une alternative avec else ;
- gérer plusieurs cas avec elif ;
- combiner plusieurs conditions avec and, or et not ;
- lire et corriger une condition simple.

Tu dois déjà savoir créer une variable, effectuer une comparaison simple dans ta tête, utiliser input() et convertir une réponse avec int() ou float().

**Matériel :** Pydroid 3 suffit. Aucun module externe, compte payant ou accès Internet n'est nécessaire.

## 2. Pourquoi un programme doit-il prendre des décisions ?

Imagine un jeu qui affiche « Niveau débloqué » lorsque le joueur atteint 100 points. Sans condition, le programme afficherait toujours le même message, même si le score vaut 20.

Une condition est une question à laquelle Python répond par vrai ou faux. Selon la réponse, le programme exécute un bloc d'instructions ou un autre.

Analogie : un feu de circulation. Si le feu est vert, tu peux avancer ; sinon, tu attends. Le programme suit une règle définie à l'avance.

Exemple en langage courant :

- Si le score est au moins égal à 100, afficher « Niveau débloqué ».
- Sinon, afficher « Continue à jouer ».

En Python, la condition ne devine pas l'intention. Elle évalue exactement l'expression que tu écris. Il faut donc choisir les bons opérateurs et vérifier les limites.

## 3. Comparer des valeurs

Les opérateurs de comparaison examinent deux valeurs. Le résultat est toujours un booléen : True ou False.

| Opérateur | Signification | Exemple | Résultat |
|---|---|---|---|
| == | égal à | 5 == 5 | True |
| != | différent de | 5 != 3 | True |
| > | strictement supérieur | 8 > 4 | True |
| < | strictement inférieur | 2 < 7 | True |
| >= | supérieur ou égal | 5 >= 5 | True |
| <= | inférieur ou égal | 3 <= 2 | False |

Teste ces exemples :

~~~python
score = 120

print(score >= 100)  # True
print(score < 100)   # False
print(score == 120)  # True
print(score != 120)  # False
~~~

Attention à la différence entre = et ==. Le signe = affecte une valeur à une variable. Le double signe == compare deux valeurs.

~~~python
points = 50       # Affectation
print(points == 50)  # Comparaison
~~~

Une comparaison n'efface pas la variable. Elle produit simplement une réponse logique.

## 4. Comprendre les booléens

Un booléen est une valeur logique. En Python, il existe seulement deux valeurs booléennes : True et False. La première lettre est une majuscule.

~~~python
est_connecte = True
a_termine = False

print(est_connecte)
print(a_termine)
print(type(est_connecte))
~~~

Les comparaisons produisent aussi des booléens :

~~~python
age = 16
est_majeur = age >= 18

print(est_majeur)  # False
~~~

La variable est_majeur contient le résultat de la comparaison. Si age change puis que tu recalcules est_majeur, le résultat peut changer.

Un booléen est utile pour représenter un état : porte ouverte ou fermée, tâche terminée ou non, utilisateur autorisé ou non. Il ne remplace pas une explication : choisis un nom qui décrit clairement ce que True signifie.

## 5. Écrire une première condition avec if

Le mot-clé if signifie « si ». Il est suivi d'une expression qui peut être vraie ou fausse, de deux-points, puis d'un bloc indenté.

Syntaxe :

~~~python
if condition:
    instruction
~~~

Exemple :

~~~python
score = 125

if score >= 100:
    print("Niveau débloqué !")
~~~

Si score vaut 125, la condition est vraie et le message s'affiche. Si score vaut 70, le bloc n'est pas exécuté.

Les espaces au début de la ligne sont importants. On utilise généralement quatre espaces pour indenter le contenu d'un bloc. Dans Pydroid 3, garde la même indentation pour toutes les instructions du même bloc.

Un bloc peut contenir plusieurs instructions :

~~~python
score = 150

if score >= 100:
    print("Bravo !")
    print("Tu peux passer au niveau suivant.")
~~~

Les deux lignes indentées appartiennent à la condition.

## 6. Ajouter une alternative avec else

Le mot-clé else signifie « sinon ». Il permet de prévoir le cas où la condition du if est fausse.

~~~python
score = 75

if score >= 100:
    print("Niveau débloqué.")
else:
    print("Il manque encore des points.")
~~~

Un seul des deux blocs est exécuté. Si la condition est vraie, Python exécute le bloc if. Sinon, il exécute le bloc else.

else ne reçoit pas de condition après lui. Il représente tous les cas qui n'ont pas satisfait le if précédent.

Exemple avec une saisie :

~~~python
points = int(input("Combien de points as-tu ? "))

if points >= 100:
    print("Tu as atteint l'objectif.")
else:
    print("Continue tes efforts.")
~~~

Cette version suppose que la personne saisit un entier valide. Si elle écrit des lettres, int() peut provoquer ValueError. Nous reverrons la gestion robuste des erreurs dans une leçon consacrée à ce sujet.

## 7. Traiter plusieurs cas avec elif

Quand il existe plus de deux possibilités, elif permet de tester un autre cas. Python examine les conditions dans l'ordre et exécute le premier bloc dont la condition est vraie.

~~~python
note = 15

if note >= 16:
    print("Très bon résultat")
elif note >= 12:
    print("Bon résultat")
elif note >= 10:
    print("Résultat suffisant")
else:
    print("Il faut revoir le cours")
~~~

Avec note = 15, la deuxième condition est vraie. Les conditions suivantes ne sont pas examinées.

L'ordre est important. Si tu places note >= 10 en premier, une note de 18 entrera déjà dans ce bloc et les cas plus élevés ne seront jamais atteints.

Pour une note sur 20, tu peux aussi vérifier les limites :

~~~python
note = int(input("Note sur 20 : "))

if note < 0 or note > 20:
    print("La note doit être comprise entre 0 et 20.")
elif note >= 10:
    print("Résultat suffisant.")
else:
    print("Résultat insuffisant.")
~~~

Cette vérification est utile, mais elle ne protège pas encore contre une saisie non numérique.

## 8. Combiner des conditions avec and, or et not

Les opérateurs logiques permettent de combiner des expressions booléennes.

- and signifie « et » : les deux conditions doivent être vraies.
- or signifie « ou » : au moins une condition doit être vraie.
- not signifie « non » : il inverse le résultat logique.

~~~python
age = 16
autorisation = True

if age >= 13 and autorisation:
    print("Accès au club de programmation.")
~~~

Avec and, les deux parties doivent être vraies. Si l'une est fausse, le résultat global est faux.

~~~python
jour = "samedi"
vacances = False

if jour == "samedi" or vacances:
    print("Temps libre prévu.")
~~~

Avec or, une seule condition vraie suffit.

~~~python
maintenance = False

if not maintenance:
    print("Le service est disponible.")
~~~

not transforme False en True et True en False. Lis les conditions à voix basse : cela aide à repérer les phrases qui deviennent difficiles à comprendre.

## 9. Construire une condition claire

Une condition peut être correcte tout en étant difficile à lire. Utilise des noms explicites et des parenthèses lorsque plusieurs opérateurs sont combinés.

~~~python
score = 140
a_termine_le_tutoriel = True
compte_actif = True

if (score >= 100 and a_termine_le_tutoriel) and compte_actif:
    print("Défi disponible.")
else:
    print("Termine les étapes nécessaires.")
~~~

Les parenthèses ne sont pas toujours obligatoires, mais elles rendent l'intention plus visible.

Python applique une priorité aux opérateurs logiques : not est évalué avant and, puis or. Si tu hésites, ajoute des parenthèses au lieu de compter sur ta mémoire.

Évite les conditions interminables. Si une expression contient beaucoup de règles, découpe-la en variables booléennes :

~~~python
score_suffisant = score >= 100
tutoriel_termine = a_termine_le_tutoriel
conditions_ok = score_suffisant and tutoriel_termine

if conditions_ok:
    print("Tu peux commencer.")
~~~

Cette méthode facilite le débogage : tu peux afficher chaque variable pour comprendre ce qui bloque.

## 10. Conditions imbriquées et cas limites

Une condition imbriquée est une condition placée à l'intérieur d'un autre bloc. Elle peut être utile lorsqu'un deuxième choix n'a de sens que si le premier est validé.

~~~python
score = 130
compte_actif = True

if score >= 100:
    if compte_actif:
        print("Défi accessible.")
    else:
        print("Active ton compte.")
else:
    print("Atteins d'abord 100 points.")
~~~

N'imbrique pas toutes les conditions par habitude. Trop de niveaux rendent le programme difficile à suivre. Quand c'est possible, utilise and ou elif.

Pense aussi aux limites exactes. Si le seuil est 100, demande-toi ce qui doit arriver à 99, 100 et 101. Un test à la limite révèle souvent une erreur de comparaison.

Exemple :
- 99 >= 100 donne False.
- 100 >= 100 donne True.
- 101 >= 100 donne True.

La différence entre > et >= change donc le résultat lorsque les valeurs sont égales.

## 11. Utiliser les conditions avec input()

Les conditions deviennent utiles lorsque le programme reçoit une réponse.

~~~python
pseudo = input("Ton pseudo : ")
choix = input("Veux-tu commencer ? (oui/non) ")

if choix == "oui":
    print(f"Bienvenue, {pseudo} !")
elif choix == "non":
    print("Tu pourras revenir plus tard.")
else:
    print("Réponds par oui ou non.")
~~~

Les textes sont comparés exactement. "Oui", "OUI" et "oui" sont différents. Pour un premier exercice, demande une réponse dans une forme précise. Dans une prochaine étape, tu pourras normaliser la saisie avec lower() et strip().

Pour les nombres, convertis avant de comparer :

~~~python
niveau = int(input("Choisis un niveau entre 1 et 3 : "))

if niveau == 1:
    print("Débutant")
elif niveau == 2:
    print("Intermédiaire")
elif niveau == 3:
    print("Avancé")
else:
    print("Choix inconnu")
~~~

Si l'utilisateur saisit 0 ou 4, le dernier bloc s'exécute. S'il saisit "deux", la conversion échoue : ne confonds pas une valeur hors limites avec une valeur impossible à convertir.

## 12. Erreurs fréquentes et méthode de débogage

| Problème | Cause probable | Vérification |
|---|---|---|
| SyntaxError après if | Deux-points manquants | Vérifier la fin de la ligne |
| IndentationError | Espaces incohérents | Aligner les instructions du bloc |
| Le mauvais cas s'affiche | Conditions dans le mauvais ordre | Tester les valeurs limites |
| Une égalité ne fonctionne pas | Un seul = a été utilisé | Comparer avec == |
| La saisie provoque ValueError | Texte converti en entier | Vérifier ce qui est saisi |
| Un texte ne correspond pas | Majuscule ou espace supplémentaire | Afficher la valeur exacte |

Méthode de débogage en cinq étapes :
1. Lis le message d'erreur jusqu'au bout.
2. Repère le numéro de ligne indiqué.
3. Vérifie les deux-points et l'indentation.
4. Affiche les variables utilisées dans la condition.
5. Teste un cas vrai, un cas faux et une valeur limite.

Exemple :

~~~python
note = 10
print("Note reçue :", note)
print("La note est suffisante :", note >= 10)

if note >= 10:
    print("Validé")
else:
    print("À retravailler")
~~~

Ne modifie pas plusieurs lignes au hasard. Change une chose, relance le programme et observe le résultat.

## 13. Exercices progressifs

Fais les exercices dans Pydroid 3. Écris ton propre code avant de regarder les corrections.

### Exercice 1 — Positif ou négatif

Crée une variable nombre. Avec if et else, affiche « Positif ou nul » si nombre >= 0, sinon affiche « Négatif ».

### Exercice 2 — Pair ou impair

Demande un entier avec input() et int(). Utilise le reste de la division par 2. Si le reste vaut 0, affiche « Pair », sinon « Impair ».

### Exercice 3 — Catégories de score

Demande un score entre 0 et 100. Affiche :
- « Débutant » si le score est inférieur à 40 ;
- « Confirmé » de 40 à 79 ;
- « Expert » à partir de 80.
Prévois un message si le score est en dehors de 0 à 100.

### Exercice 4 — Vérifier deux conditions

Crée deux variables : a_un_compte et a_le_code. Affiche « Connexion autorisée » seulement si les deux valent True. Sinon, affiche « Vérifie les informations ».

### Exercice 5 — Choisir une opération

Demande deux nombres entiers et un choix parmi +, - et *. Utilise if, elif et else pour afficher le résultat ou un message si l'opération n'est pas reconnue.

## 14. Mini-projet — Gestionnaire de rang

Construis un petit programme qui demande un pseudo et un score. Il doit :
1. refuser un score inférieur à 0 ou supérieur à 1000 ;
2. attribuer le rang « Explorateur » de 0 à 199 ;
3. attribuer « Constructeur » de 200 à 599 ;
4. attribuer « Maître des défis » à partir de 600 ;
5. afficher le pseudo et le rang ;
6. ajouter un message spécial si le score atteint au moins 900.

Commence par écrire les règles en français. Transforme ensuite chaque règle en condition. Teste au minimum les scores 0, 199, 200, 599, 600, 900 et 1001.

Exemple de structure, à compléter :

~~~python
pseudo = input("Pseudo : ")
score = int(input("Score : "))

if score < 0 or score > 1000:
    print("Score invalide.")
elif score >= 600:
    rang = "Maître des défis"
elif score >= 200:
    rang = "Constructeur"
else:
    rang = "Explorateur"

# Ajoute ici l'affichage du rang et le message spécial.
~~~

## 15. Corrigés expliqués et fiche de révision

### Correction de l'exercice 1

~~~python
nombre = -4

if nombre >= 0:
    print("Positif ou nul")
else:
    print("Négatif")
~~~

La condition nombre >= 0 inclut zéro. Avec -4, elle est fausse, donc else est exécuté.

### Correction de l'exercice 2

~~~python
nombre = int(input("Entier : "))

if nombre % 2 == 0:
    print("Pair")
else:
    print("Impair")
~~~

Le reste de la division par 2 vaut zéro pour les nombres pairs.

### Correction de l'exercice 3

~~~python
score = int(input("Score entre 0 et 100 : "))

if score < 0 or score > 100:
    print("Score invalide.")
elif score < 40:
    print("Débutant")
elif score < 80:
    print("Confirmé")
else:
    print("Expert")
~~~

Le contrôle des limites est placé avant les catégories. Ensuite, les seuils sont testés du plus petit au plus grand.

### Correction de l'exercice 4

~~~python
a_un_compte = True
a_le_code = False

if a_un_compte and a_le_code:
    print("Connexion autorisée")
else:
    print("Vérifie les informations")
~~~

and exige que les deux valeurs soient vraies. Ici, la deuxième est fausse.

### Correction de l'exercice 5

~~~python
a = int(input("Premier nombre : "))
b = int(input("Deuxième nombre : "))
operation = input("Opération (+, - ou *) : ")

if operation == "+":
    print(a + b)
elif operation == "-":
    print(a - b)
elif operation == "*":
    print(a * b)
else:
    print("Opération inconnue.")
~~~

Chaque branche traite une opération. else couvre tous les choix non reconnus.

### Exemple de mini-projet

~~~python
pseudo = input("Pseudo : ")
score = int(input("Score : "))

if score < 0 or score > 1000:
    print("Score invalide.")
else:
    if score >= 600:
        rang = "Maître des défis"
    elif score >= 200:
        rang = "Constructeur"
    else:
        rang = "Explorateur"

    print(f"{pseudo} : rang {rang}")

    if score >= 900:
        print("Bonus : score remarquable !")
~~~

La première condition vérifie la validité. Le classement ne s'exécute que si le score est valide.

### Fiche de révision

| Notion | À retenir |
|---|---|
| Comparaison | Produit True ou False |
| if | Exécute un bloc si la condition est vraie |
| else | Traite le cas contraire |
| elif | Teste un autre cas |
| and | Toutes les conditions doivent être vraies |
| or | Au moins une condition doit être vraie |
| not | Inverse un booléen |
| Indentation | Délimite les blocs d'instructions |
| Valeur limite | Valeur située près d'un seuil |

**Validation avant la leçon 06 :** tu dois pouvoir écrire un if/else, utiliser au moins un elif, comparer des valeurs, combiner deux conditions et tester les limites d'une règle.

**Prochaine étape :** les boucles for et while permettront de répéter des instructions sans recopier le même code.

---

*Académique — Python, leçon 05.*  
*©pythonschool*