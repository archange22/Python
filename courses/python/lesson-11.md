# Python — Leçon 11 : Organiser un programme avec des modules

**Parcours :** Python  
**Numéro :** 11  
**Niveau :** Débutant à intermédiaire  
**Durée :** 100 à 120 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, conditions, boucles, fonctions, dictionnaires et lecture de fichiers.

## Objectifs et prérequis
Un programme peut commencer avec quelques lignes, puis devenir difficile à comprendre lorsque toutes les fonctions sont rangées dans un seul fichier. Les modules permettent de séparer les responsabilités. À la fin de cette leçon, tu sauras importer un module, utiliser la bibliothèque standard, créer tes propres fichiers Python, protéger le code de démarrage avec la condition principale et organiser un petit projet en plusieurs fichiers. Les exemples fonctionnent sans connexion Internet et sans bibliothèque payante.

Tu dois déjà savoir définir une fonction et appeler une fonction depuis un autre endroit du même fichier. Si les fonctions sont encore nouvelles, révise leur principe avant de continuer.

## Sommaire
1. Pourquoi organiser le code ?
2. Module, bibliothèque et package
3. Importer un module
4. Choisir entre import et from
5. Donner un alias et éviter les conflits
6. Découvrir la bibliothèque standard
7. Créer son premier module
8. Comprendre le nom d'un module
9. Protéger le démarrage avec __main__
10. Organiser un projet en dossiers
11. Éviter les pièges d'importation
12. Mini-projet en plusieurs fichiers
13. Débogage et bonnes pratiques
14. Exercices progressifs
15. Corrigés expliqués
16. Fiche de révision

## 1. Pourquoi organiser le code ?
Imagine un cahier où les recettes, les dépenses, les notes et les contacts sont tous mélangés. Tu peux encore retrouver une information dans un petit cahier, mais cela devient compliqué lorsque le cahier grandit. Un programme monofichier présente le même problème : les fonctions sont proches, mais leurs responsabilités peuvent être très différentes.

Un module est un fichier Python qui regroupe du code réutilisable. Tu peux placer les calculs dans un module, la lecture des données dans un autre et l'interface dans un troisième. Le fichier principal coordonne le tout.

Cette séparation facilite la lecture, les tests et les corrections. Elle évite aussi de recopier la même fonction dans plusieurs programmes. Un module ne rend pas automatiquement un programme meilleur : il doit avoir un rôle clair et une taille raisonnable.

## 2. Module, bibliothèque et package
Un **module** est généralement un fichier qui se termine par `.py`. Une **bibliothèque** est un ensemble de fonctionnalités réutilisables, parfois composé de nombreux modules. Un **package** regroupe plusieurs modules dans une structure de dossiers.

| Terme | Exemple | Idée |
|---|---|---|
| Module | `calculs.py` | Un fichier Python |
| Package | `outils/` | Un dossier de modules |
| Bibliothèque standard | `math`, `json` | Fournie avec Python |
| Bibliothèque externe | `requests` | Installée séparément |

Analogie : un module est un chapitre, un package est un classeur et une bibliothèque est une collection de classeurs. Cette comparaison aide à comprendre l'organisation, mais un vrai package possède aussi des règles de découverte et d'importation.

Pour commencer, tu n'as besoin que de fichiers Python placés dans le même dossier.

## 3. Importer un module
Le mot-clé `import` demande à Python de charger un module afin d'utiliser ses objets.

~~~python
import math

resultat = math.sqrt(81)
print(resultat)  # 9.0
~~~

Ici, `math` est un module de la bibliothèque standard. La notation `math.sqrt` signifie « utiliser la fonction `sqrt` du module `math` ».

L'avantage est la clarté : on voit immédiatement d'où vient la fonction. Le nom du module sert de préfixe et limite les collisions entre noms identiques.

Un import se place généralement au début du fichier, après une éventuelle docstring. Regroupe les imports standards, externes et locaux pour rendre les dépendances visibles.

## 4. Choisir entre import et from
Tu peux importer le module entier ou seulement un nom précis.

~~~python
import math
print(math.ceil(4.2))

from math import ceil
print(ceil(4.2))
~~~

Les deux exemples affichent `5`. La première forme garde le préfixe. La seconde permet d'appeler directement le nom importé.

Pour un débutant, `import module` est souvent plus facile à relire dans un projet : l'origine de la fonction reste visible. `from module import nom` peut être pratique lorsque le nom est très utilisé et qu'il est suffisamment distinctif.

Évite `from math import *`. L'étoile importe de nombreux noms et peut rendre leur origine difficile à retrouver. Deux modules pourraient fournir un nom identique.

## 5. Donner un alias et éviter les conflits
Le mot-clé `as` permet de donner un alias, c'est-à-dire un autre nom local.

~~~python
import statistics as stats

notes = [12, 15, 14, 18]
print(stats.mean(notes))
~~~

L'alias `stats` est plus court, mais le code reste compréhensible. Les alias courants sont utiles lorsqu'ils sont reconnus dans la communauté du langage. Ne crée pas des abréviations mystérieuses.

Attention aux noms de fichiers. Ne nomme pas ton fichier `random.py` si tu veux importer le module standard `random`. Ton fichier pourrait être trouvé à la place du vrai module. Évite aussi `json.py`, `math.py` ou `statistics.py` pour des exercices qui utilisent ces modules.

## 6. Découvrir la bibliothèque standard
Python est livré avec une bibliothèque standard : un ensemble de modules disponibles sans installation supplémentaire.

| Module | Utilité | Exemple |
|---|---|---|
| `math` | Mathématiques | `math.sqrt(25)` |
| `random` | Choix pseudo-aléatoires | `random.choice(liste)` |
| `statistics` | Statistiques simples | `statistics.mean(notes)` |
| `json` | Données structurées | `json.load(fichier)` |
| `pathlib` | Chemins de fichiers | `Path("notes.txt")` |
| `datetime` | Dates et heures | `date.today()` |
| `collections` | Structures spécialisées | `Counter(mots)` |

Exemple avec `random` :

~~~python
import random

couleurs = ["bleu", "vert", "orange"]
choix = random.choice(couleurs)
print("Couleur choisie :", choix)
~~~

Le résultat peut changer à chaque exécution. Le module `random` convient aux jeux et aux simulations simples, mais pas à la génération de mots de passe ou de secrets de sécurité. Pour ces usages, Python propose le module `secrets`.

## 7. Créer son premier module
Dans Pydroid 3, crée deux fichiers dans le même dossier : `calculs.py` et `main.py`.

Contenu de `calculs.py` :

~~~python
def addition(a, b):
    """Retourne la somme de deux nombres."""
    return a + b

def moyenne(a, b):
    """Calcule la moyenne de deux nombres."""
    return (a + b) / 2
~~~

Contenu de `main.py` :

~~~python
import calculs

print(calculs.addition(7, 5))
print(calculs.moyenne(7, 5))
~~~

Lance `main.py`. Python trouve `calculs.py` dans le même dossier, charge ses définitions puis permet de les appeler.

Le nom utilisé après `import` est le nom du fichier sans `.py`. N'ajoute pas l'extension dans l'instruction d'importation.

## 8. Comprendre le nom d'un module
Python attribue une variable spéciale appelée `__name__` à chaque module. Lorsque le fichier est lancé directement, sa valeur est `"__main__"`. Lorsqu'il est importé depuis un autre fichier, sa valeur est le nom du module.

Teste dans `calculs.py` :

~~~python
print("Nom du module :", __name__)
~~~

Lance d'abord `calculs.py` directement, puis lance `main.py`. Tu verras que la valeur change selon la manière dont le fichier est utilisé.

Cette différence est utile pour séparer les définitions réutilisables des instructions de test ou de démarrage. Un module importé ne devrait pas lancer toute une application par surprise.

## 9. Protéger le démarrage avec __main__
La condition suivante protège le code qui ne doit s'exécuter que lorsque le fichier est lancé directement.

~~~python
def addition(a, b):
    return a + b

if __name__ == "__main__":
    print("Test du module")
    print(addition(4, 6))
~~~

Si tu lances le fichier, le test s'exécute. Si un autre fichier l'importe, la fonction est disponible, mais le bloc protégé ne se lance pas.

La comparaison utilise deux signes égal, car elle vérifie une égalité. Les deux caractères de soulignement autour de `name` sont importants : écris exactement `__name__` et `"__main__"`.

## 10. Organiser un projet en dossiers
Quand le projet grandit, un dossier peut regrouper les modules qui travaillent ensemble. Une structure simple :

~~~text
budget/
    main.py
    calculs.py
    affichage.py
    donnees/
        exemple.json
~~~

Chaque fichier a une responsabilité :
- `main.py` coordonne les étapes ;
- `calculs.py` réalise les opérations ;
- `affichage.py` présente les résultats ;
- `donnees/` contient des fichiers de données.

Un dossier de package peut contenir un fichier `__init__.py`. Dans les versions modernes de Python, certains packages peuvent fonctionner sans ce fichier, mais le créer rend l'intention plus explicite pour un premier projet.

Sur Android, commence avec des fichiers placés dans le même dossier. Ajoute des sous-dossiers seulement lorsque tu comprends comment Python trouve les modules.

## 11. Éviter les pièges d'importation
Un import exécute le code placé au niveau principal du module. C'est pourquoi il faut éviter de mettre des opérations inattendues directement en dehors des fonctions.

Mauvaise organisation :

~~~python
# Ce code se lance dès que le module est importé.
nom = input("Ton nom : ")
print("Bonjour", nom)
~~~

Organisation plus réutilisable :

~~~python
def demander_nom():
    return input("Ton nom : ")

def main():
    nom = demander_nom()
    print("Bonjour", nom)

if __name__ == "__main__":
    main()
~~~

Autres pièges :
- deux fichiers portant le même nom qu'un module standard ;
- un nom de module mal orthographié ;
- un import circulaire où A importe B et B importe A ;
- un fichier placé dans un dossier que Python ne recherche pas ;
- un changement de nom sans redémarrer l'interpréteur.

En cas de doute, affiche `__file__` pour savoir quel fichier a été chargé, puis vérifie son emplacement.

## 12. Mini-projet : calculateur de budget organisé
Crée trois fichiers dans un même dossier.

`calculs.py` :

~~~python
def total_depenses(depenses):
    return sum(depenses)

def reste_budget(budget, depenses):
    return budget - total_depenses(depenses)
~~~

`affichage.py` :

~~~python
def afficher_resume(budget, depenses, reste):
    print("=== BUDGET ===")
    print(f"Budget initial : {budget:.2f}")
    print(f"Dépenses : {depenses:.2f}")
    print(f"Reste : {reste:.2f}")
~~~

`main.py` :

~~~python
import calculs
import affichage

def main():
    budget = 50000.0
    depenses = [8500.0, 12000.0, 4500.0]
    total = calculs.total_depenses(depenses)
    reste = calculs.reste_budget(budget, depenses)
    affichage.afficher_resume(budget, total, reste)

if __name__ == "__main__":
    main()
~~~

Lance `main.py`. Les résultats attendus sont 25 000 de dépenses et 25 000 de budget restant. Le projet montre comment un fichier principal peut utiliser des fonctions définies dans deux modules distincts.

Amélioration : demande les dépenses à l'utilisateur, puis déplace la saisie dans une fonction du module `affichage.py` ou dans un module `saisie.py`. Garde une seule responsabilité par module.

## 13. Débogage et bonnes pratiques
- **Module introuvable :** vérifie le nom du fichier, son extension et le dossier de lancement.
- **Mauvais module chargé :** affiche `module.__file__` et renomme les fichiers qui masquent la bibliothèque standard.
- **Nom inconnu :** vérifie si tu as écrit `module.fonction` ou importé directement la fonction.
- **Code exécuté à l'import :** place le démarrage dans une fonction `main()` et protège-le avec `if __name__ == "__main__":`.
- **Import circulaire :** déplace une fonction commune dans un troisième module plus simple.
- **Modification non prise en compte :** redémarre l'interpréteur et vérifie que tu modifies le bon fichier.

Une méthode de diagnostic efficace consiste à tester un import seul, afficher le chemin du module, puis lancer le programme principal. Corrige une erreur à la fois.

## 14. Exercices progressifs
1. Crée `salutations.py` avec une fonction `dire_bonjour(nom)`. Importe-la depuis `main.py`.
2. Importe `statistics` et calcule la moyenne de cinq notes.
3. Ajoute un bloc `if __name__ == "__main__":` dans ton module de calcul.
4. Crée `convertisseurs.py` avec deux fonctions : convertir des minutes en secondes et des heures en minutes.
5. Organise un mini-projet avec `main.py` et `calculs.py`. Vérifie que l'importation ne lance pas de saisie inattendue.

## 15. Corrigés expliqués

### Exercice 1
~~~python
# salutations.py
def dire_bonjour(nom):
    print(f"Bonjour {nom} !")
~~~

~~~python
# main.py
import salutations
salutations.dire_bonjour("Nova")
~~~

Le premier fichier définit la fonction ; le second l'importe et l'appelle.

### Exercice 2
~~~python
import statistics

notes = [12, 14, 16, 13, 15]
print(statistics.mean(notes))
~~~

`mean` calcule la moyenne arithmétique.

### Exercice 3
~~~python
def carre(nombre):
    return nombre * nombre

if __name__ == "__main__":
    print(carre(5))
~~~

Le test est exécuté uniquement lorsque ce fichier est lancé directement.

### Exercice 4
~~~python
def minutes_en_secondes(minutes):
    return minutes * 60

def heures_en_minutes(heures):
    return heures * 60
~~~

Chaque fonction reçoit une valeur et retourne le résultat. Elle ne dépend pas de la console.

### Exercice 5
~~~python
# calculs.py
def total(prix, quantite):
    return prix * quantite
~~~

~~~python
# main.py
import calculs

if __name__ == "__main__":
    print(calculs.total(750, 4))
~~~

Le résultat attendu est `3000`. Le module de calcul peut maintenant être réutilisé dans un autre projet.

## 16. Fiche de révision et validation
| Notion | À retenir |
|---|---|
| Module | Fichier Python réutilisable |
| import | Charge un module |
| from | Importe un nom précis |
| as | Donne un alias |
| Bibliothèque standard | Modules fournis avec Python |
| __name__ | Indique le contexte d'exécution du module |
| __main__ | Valeur lorsque le fichier est lancé directement |
| __file__ | Chemin du fichier chargé |
| Package | Organisation de plusieurs modules |
| Import circulaire | Dépendance circulaire entre modules |

Avant de passer à la leçon 12, vérifie que tu peux créer deux fichiers Python, importer une fonction, expliquer la condition `__main__` et corriger un module introuvable.

**À retenir :** un bon module a une responsabilité claire, expose des fonctions réutilisables et évite de lancer des actions inattendues lors de son importation.

---

*©pythonschool — Python, Leçon 11.*