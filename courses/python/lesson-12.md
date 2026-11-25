# Python — Leçon 12 : Gérer les erreurs et sécuriser les saisies

**Parcours :** Python  
**Numéro :** 12  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 100 à 110 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, types, conditions, boucles, fonctions, dictionnaires, fichiers et modules.

## 1. Fiche de départ : objectifs et prérequis

Un programme peut contenir une bonne idée et malgré tout s'arrêter lorsqu'un utilisateur saisit une valeur inattendue, qu'un fichier manque ou qu'une opération n'est pas possible. Cette leçon apprend à prévoir ces situations et à réagir proprement.

À la fin, tu sauras distinguer une erreur de syntaxe d'une exception, lire un message d'erreur, utiliser **try**, **except**, **else** et **finally**, déclencher une erreur avec **raise**, valider une saisie et éviter de masquer les problèmes.

Tu dois déjà savoir utiliser les fonctions et les conditions. Les exemples utilisent uniquement Python standard : aucune installation, aucun compte et aucune connexion Internet ne sont nécessaires. Dans Pydroid 3, crée un fichier nommé **lecon12.py** et exécute les exemples séparément.

## 2. Sommaire et méthode de travail

1. Pourquoi prévoir les erreurs ?
2. Erreur de syntaxe et exception
3. Comprendre try et except
4. Choisir le bon type d'exception
5. Utiliser else et finally
6. Déclencher une erreur avec raise
7. Valider une saisie utilisateur
8. Créer des fonctions de saisie réutilisables
9. Protéger les opérations sur les fichiers
10. Lire une trace et déboguer
11. Organiser une gestion d'erreurs fiable
12. Mini-projet : calculateur de budget robuste
13. Exercices progressifs
14. Corrigés expliqués
15. Fiche de révision

Méthode conseillée : lis une section, recopie l'exemple dans Pydroid 3, modifie une valeur, observe le résultat puis passe à la suivante. Une erreur rencontrée pendant un exercice est une information utile : elle indique ce que le programme n'a pas encore prévu.

## 3. Pourquoi prévoir les erreurs ?

Une erreur est un événement qui empêche une opération de se dérouler comme prévu. Elle peut venir du code, des données saisies, du système de fichiers ou d'une ressource indisponible.

Imagine un formulaire papier. Si une case demande un âge et qu'une personne écrit un mot, la personne qui lit le formulaire doit demander une correction au lieu de faire un calcul impossible. Un programme doit appliquer une logique similaire : vérifier les données, expliquer ce qui est attendu et continuer lorsque cela reste sûr.

Exemples de situations :
- une division reçoit zéro comme diviseur ;
- une conversion en entier reçoit le texte « douze » ;
- un dictionnaire ne contient pas la clé demandée ;
- un fichier n'existe pas à l'emplacement indiqué ;
- une liste est vide alors que le programme veut prendre son premier élément.

Toutes les erreurs ne doivent pas être ignorées. Une erreur de calcul peut invalider un résultat. Une erreur de fichier peut signifier que des données n'ont pas été sauvegardées. Le programme doit distinguer les cas récupérables des cas qui nécessitent un arrêt.

## 4. Erreur de syntaxe et exception

Une **erreur de syntaxe** apparaît lorsque Python ne peut pas comprendre la structure du programme. Par exemple, un deux-points oublié après une condition empêche le fichier de démarrer.

~~~python
# SyntaxError : le deux-points manque
if 5 > 2
    print("Cinq est plus grand")
~~~

Une **exception** apparaît pendant l'exécution d'une instruction valide. Par exemple, diviser un nombre par zéro est une opération que Python sait reconnaître, mais qu'il ne peut pas effectuer.

~~~python
# ZeroDivisionError à l'exécution
resultat = 10 / 0
print(resultat)
~~~

Le message d'erreur contient généralement le type de problème et l'emplacement où il s'est produit. Ne confonds pas la ligne signalée avec la cause complète : une valeur incorrecte peut avoir été créée plusieurs lignes avant.

## 5. Comprendre try et except

Le bloc **try** contient une opération susceptible d'échouer. Le bloc **except** indique quoi faire lorsqu'une exception correspondante se produit.

~~~python
try:
    nombre = int(input("Écris un entier : "))
    print("Tu as écrit", nombre)
except ValueError:
    print("Saisie invalide : écris un nombre entier.")
~~~

Si la saisie est correcte, le programme exécute le bloc try et ignore except. Si la conversion échoue, Python passe dans except. Le programme ne s'arrête donc pas brutalement.

Place dans try uniquement les instructions qui peuvent réellement échouer pour la raison prévue. Un bloc trop long rend difficile l'identification de l'instruction responsable. Une gestion d'erreur précise aide à corriger le programme et à expliquer le problème à l'utilisateur.

## 6. Choisir le bon type d'exception

Python possède plusieurs types d'exceptions. Il est préférable de traiter celle que tu attends plutôt que de capturer toutes les erreurs sans distinction.

| Exception | Situation fréquente |
|---|---|
| ValueError | Valeur impossible à convertir |
| TypeError | Opération incompatible entre types |
| ZeroDivisionError | Division par zéro |
| IndexError | Indice absent dans une liste |
| KeyError | Clé absente d'un dictionnaire |
| FileNotFoundError | Fichier introuvable |
| PermissionError | Accès au fichier refusé |

Exemple :

~~~python
numerateur = 20

try:
    diviseur = int(input("Diviseur : "))
    resultat = numerateur / diviseur
except ValueError:
    print("Il faut saisir un entier.")
except ZeroDivisionError:
    print("Le diviseur ne peut pas être zéro.")
else:
    print("Résultat :", resultat)
~~~

Deux problèmes différents reçoivent deux messages adaptés. L'utilisateur sait quoi corriger. Si une exception inattendue apparaît, elle reste visible : c'est utile pendant le développement.

## 7. Utiliser else et finally

Le bloc **else** s'exécute uniquement si aucune exception n'a été déclenchée dans le try. Le bloc **finally** s'exécute dans tous les cas, qu'une exception soit apparue ou non.

~~~python
try:
    age = int(input("Âge : "))
except ValueError:
    print("L'âge doit être un entier.")
else:
    print("Âge enregistré :", age)
finally:
    print("Fin de la tentative.")
~~~

Utilise else pour séparer le traitement normal de la gestion d'erreur. Utilise finally pour une opération de nettoyage qui doit être effectuée dans les deux cas. Par exemple, fermer une ressource ouverte ou afficher une fin de traitement.

N'ajoute pas un finally simplement pour décorer le code. Il doit avoir une fonction précise. Pour les fichiers, le gestionnaire **with** est généralement plus simple et plus sûr ; il ferme le fichier automatiquement.

## 8. Déclencher une erreur avec raise

La commande **raise** permet de signaler qu'une valeur ne respecte pas une règle. C'est utile lorsqu'une fonction reçoit des données impossibles à accepter.

~~~python
def calculer_moyenne(total, nombre):
    if nombre <= 0:
        raise ValueError("Le nombre de notes doit être positif.")
    return total / nombre

print(calculer_moyenne(42, 3))
~~~

Ici, la fonction refuse un nombre de notes nul ou négatif. La règle est vérifiée au plus près de l'opération concernée.

Une exception doit expliquer le problème sans exposer de donnée privée. Évite les messages vagues comme « erreur ». Préfère une explication courte qui indique la règle attendue. Une fonction peut laisser remonter une exception à son appelant : celui-ci décidera alors de l'afficher, de réessayer ou d'arrêter le traitement.

## 9. Valider une saisie utilisateur

Une conversion réussie ne garantit pas qu'une valeur est acceptable. Un âge de -400 est un entier valide pour Python, mais ne correspond pas à une règle de saisie habituelle.

~~~python
age = int(input("Âge : "))

if age < 0 or age > 120:
    print("Âge hors de la plage prévue.")
else:
    print("Âge accepté.")
~~~

La validation comporte donc deux étapes :
1. vérifier que le texte peut être converti ;
2. vérifier que le nombre respecte les règles du programme.

Pour un prix, tu peux exiger une valeur positive. Pour une quantité, tu peux exiger un entier supérieur à zéro. Pour un nom, tu peux refuser une chaîne vide après avoir utilisé **strip()** pour retirer les espaces au début et à la fin.

Ne suppose pas qu'une saisie est correcte simplement parce qu'elle vient d'un formulaire ou d'un autre programme. Les données doivent être vérifiées à l'endroit où elles sont utilisées.

## 10. Créer des fonctions de saisie réutilisables

Lorsque plusieurs parties d'un programme demandent un entier, une fonction évite de recopier le même try/except.

~~~python
def demander_entier(message, minimum=None):
    while True:
        texte = input(message)
        try:
            valeur = int(texte)
        except ValueError:
            print("Écris un nombre entier.")
            continue

        if minimum is not None and valeur < minimum:
            print("La valeur minimale est", minimum)
            continue

        return valeur

quantite = demander_entier("Quantité : ", minimum=1)
print("Quantité validée :", quantite)
~~~

La boucle recommence lorsqu'une conversion ou une règle échoue. **continue** passe directement à la prochaine tentative. **return** termine la fonction lorsque la valeur est correcte.

Une bonne fonction de saisie a un rôle précis, reçoit son message en paramètre et renvoie une valeur validée. Elle ne doit pas modifier des variables globales ou effectuer des opérations sans rapport avec la saisie.

## 11. Protéger les opérations sur les fichiers

Une application peut lire un fichier qui n'existe pas encore. La bonne réaction consiste à prévoir ce cas et à expliquer ce qui est possible.

~~~python
from pathlib import Path

chemin = Path("notes.txt")

try:
    contenu = chemin.read_text(encoding="utf-8")
except FileNotFoundError:
    print("Le fichier notes.txt n'existe pas encore.")
except PermissionError:
    print("Le programme n'a pas accès à ce fichier.")
else:
    print("Contenu :", contenu)
~~~

Pour écrire, utilise **write_text** ou un bloc **with open(...)**. Vérifie que le dossier choisi est accessible. Sur Android, Pydroid 3 peut utiliser un dossier de travail différent selon la configuration de l'application.

Ne masque pas une erreur d'écriture : si le programme annonce « sauvegarde terminée » alors que le fichier n'a pas été créé, l'utilisateur risque de perdre ses données. Affiche un succès uniquement après l'opération réelle.

## 12. Lire une trace et déboguer

Une **trace d'exécution** (traceback) décrit le chemin suivi par Python jusqu'à l'exception. Lis-la du bas vers le haut : la dernière ligne indique souvent le type et le message de l'erreur. Les lignes précédentes indiquent les appels qui ont conduit au problème.

Méthode de débogage :
1. recopie le type d'exception ;
2. repère le fichier et le numéro de ligne ;
3. examine la valeur utilisée à cet endroit ;
4. vérifie le type avec **type(valeur)** ;
5. réduis le programme à un exemple court ;
6. corrige la cause puis relance le test.

Pendant le développement, **print()** peut afficher une valeur ou un type. Pour un programme plus long, le module standard **logging** permet de noter des informations, avertissements et erreurs. Ne mets jamais un token, un mot de passe ou une donnée personnelle dans un journal.

## 13. Mini-projet : calculateur de budget robuste

Le programme suivant demande un prix et une quantité, vérifie les saisies et calcule le total. Il fonctionne dans Pydroid 3.

~~~python
def demander_prix():
    while True:
        try:
            prix = float(input("Prix unitaire : "))
        except ValueError:
            print("Écris un nombre, par exemple 12.5.")
            continue

        if prix < 0:
            print("Le prix ne peut pas être négatif.")
            continue

        return prix


def demander_quantite():
    while True:
        try:
            quantite = int(input("Quantité : "))
        except ValueError:
            print("La quantité doit être un entier.")
            continue

        if quantite <= 0:
            print("La quantité doit être supérieure à zéro.")
            continue

        return quantite


def main():
    nom = input("Nom de l'article : ").strip()
    if not nom:
        nom = "Article sans nom"

    prix = demander_prix()
    quantite = demander_quantite()
    total = prix * quantite

    print("--- RÉCAPITULATIF ---")
    print("Article :", nom)
    print("Prix :", f"{prix:.2f}")
    print("Quantité :", quantite)
    print("Total :", f"{total:.2f}")


if __name__ == "__main__":
    main()
~~~

Teste avec un prix décimal, une quantité entière, puis avec une saisie incorrecte. Le programme doit redemander une valeur sans perdre les autres informations. Il ne prétend pas sauvegarder un fichier : son rôle est uniquement de calculer et d'afficher.

## 14. Exercices progressifs et corrigés

Réalise d'abord les exercices sans regarder la correction.

**Exercice A — Division sûre :** demande deux entiers et affiche leur division. Prévois une saisie invalide et un diviseur égal à zéro.

**Exercice B — Âge contrôlé :** demande un âge entier et accepte uniquement les valeurs de 0 à 120.

**Exercice C — Fichier absent :** essaie de lire un fichier texte et affiche un message clair s'il n'existe pas.

**Exercice D — Fonction :** écris une fonction qui reçoit une liste de nombres et déclenche ValueError si la liste est vide.

### Correction A

~~~python
try:
    a = int(input("Numérateur : "))
    b = int(input("Diviseur : "))
    resultat = a / b
except ValueError:
    print("Saisis deux entiers.")
except ZeroDivisionError:
    print("Division par zéro impossible.")
else:
    print("Résultat :", resultat)
~~~

Les exceptions sont séparées afin de donner le bon message. Le résultat n'est affiché que si le calcul a réussi.

### Correction B

~~~python
try:
    age = int(input("Âge : "))
    if 0 <= age <= 120:
        print("Âge accepté.")
    else:
        print("Âge hors limites.")
except ValueError:
    print("Écris un entier.")
~~~

La conversion et la validation de plage sont deux contrôles différents.

### Correction C

~~~python
from pathlib import Path

try:
    texte = Path("notes.txt").read_text(encoding="utf-8")
except FileNotFoundError:
    print("Aucune note enregistrée.")
else:
    print(texte)
~~~

Le bloc else ne s'exécute que si la lecture a réussi.

### Correction D

~~~python
def moyenne(valeurs):
    if len(valeurs) == 0:
        raise ValueError("La liste ne doit pas être vide.")
    return sum(valeurs) / len(valeurs)

print(moyenne([12, 15, 18]))
~~~

La fonction protège son contrat : elle exige au moins une valeur.

## 15. Fiche de révision et validation

| Élément | Utilité |
|---|---|
| try | Encadrer une opération risquée |
| except | Traiter une exception précise |
| else | Exécuter le chemin normal |
| finally | Effectuer un nettoyage |
| raise | Signaler un problème volontairement |
| ValueError | Valeur impossible à convertir |
| TypeError | Types incompatibles |
| FileNotFoundError | Fichier absent |
| traceback | Trace de l'erreur |
| logging | Enregistrer des événements |

Avant de passer à la leçon 13, vérifie que tu sais :
- expliquer la différence entre syntaxe et exception ;
- traiter une ValueError sans masquer les autres erreurs ;
- utiliser else et finally correctement ;
- valider une valeur après conversion ;
- créer une fonction de saisie réutilisable ;
- lire le type et la ligne indiqués dans un traceback.

**À retenir :** un programme robuste ne prétend pas que tout fonctionne. Il vérifie les données, traite les situations prévues et laisse visibles les erreurs inattendues pour qu'elles puissent être corrigées.

---

*©pythonschool — Python, Leçon 12.*