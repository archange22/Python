# Python — Leçon 10 : Lire et écrire des fichiers

**Parcours :** Python  
**Numéro :** 10  
**Niveau :** Débutant  
**Durée :** 100 à 120 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, conditions, boucles, listes, dictionnaires et fonctions.

## Objectifs et prérequis
Jusqu'ici, les données de tes programmes existaient surtout pendant l'exécution. Quand le programme se ferme, les variables ordinaires disparaissent. Un fichier permet de conserver des informations. À la fin, tu sauras ouvrir, lire, écrire et ajouter du texte, choisir un mode, manipuler les chemins, gérer des erreurs et sauvegarder des données en JSON. Tu construiras un gestionnaire de tâches persistant. Aucun service payant ni connexion Internet n'est nécessaire.

## Sommaire
1. Persistance ; 2. Chemins Android ; 3. open et with ; 4. Modes ; 5. Lecture ; 6. Écriture ; 7. Encodage ; 8. Exceptions ; 9. pathlib ; 10. JSON ; 11. Projet ; 12. Débogage ; 13. Exercices ; 14. Corrigés ; 15. Révision.

## 1. Pourquoi enregistrer des données ?
Une variable est conservée en mémoire pendant l'exécution. Fermer le programme met fin à cette exécution : les variables ordinaires ne sont pas une sauvegarde permanente. Un fichier joue le rôle d'un carnet. Tu peux y écrire aujourd'hui, fermer l'application, puis relire les informations demain.

Exemples : sauvegarder une liste de tâches, conserver le meilleur score d'un jeu, enregistrer des réglages, garder un historique ou exporter un résultat. Un fichier texte contient des caractères lisibles. CSV organise des valeurs en lignes et colonnes. JSON représente des données structurées avec des listes et des dictionnaires. Une base de données devient utile lorsque les informations sont nombreuses ou reliées.

Commence par le texte et JSON : ils suffisent pour beaucoup de petits projets.

## 2. Comprendre les chemins sur Android
Un chemin indique à Python où se trouve un fichier. Un chemin relatif comme `notes.txt` est interprété depuis le dossier de travail. Affiche ce dossier dans Pydroid 3 :

~~~python
from pathlib import Path
print("Dossier de travail :", Path.cwd())
~~~

Le dossier de travail dépend de la configuration et de la façon dont tu lances ton script. Ne suppose pas qu'il s'agit toujours de Téléchargements. Pour commencer, crée le fichier dans le dossier affiché. C'est plus simple et évite de demander inutilement l'accès à tout le stockage du téléphone.

Si tu choisis un dossier partagé Android, vérifie les autorisations de Pydroid 3 et utilise un chemin réellement visible par l'application. `PermissionError` signifie que l'application n'a pas le droit nécessaire. N'enregistre pas de mots de passe ou de tokens dans les exercices.

## 3. Ouvrir un fichier avec open() et with
`open()` ouvre un fichier et renvoie un objet qui permet de lire ou d'écrire. Sa forme courante est `open(chemin, mode, encoding="utf-8")`. Il faut fermer le fichier après usage. La construction `with` le ferme automatiquement, même si une erreur survient :

~~~python
with open("notes.txt", "r", encoding="utf-8") as fichier:
    contenu = fichier.read()

print(contenu)
~~~

Python ouvre le fichier, donne l'objet à la variable `fichier`, exécute le bloc indenté, puis ferme le fichier. Prends l'habitude d'utiliser `with open(...)` : cela évite d'oublier `close()`.

Le mode `r` demande la lecture. Si le fichier n'existe pas, une exception est déclenchée. Le bloc `with` ne remplace pas la gestion des erreurs ; il gère la fermeture de la ressource.

## 4. Choisir le mode d'ouverture
Les modes les plus utiles sont :

| Mode | Action | Fichier absent |
|---|---|---|
| `r` | Lire | Erreur |
| `w` | Écrire en remplaçant | Créé |
| `a` | Ajouter à la fin | Créé |
| `x` | Créer sans écraser | Erreur s'il existe |
| `r+` | Lire et écrire | Erreur |

Le mode `w` efface l'ancien contenu dès l'ouverture. Utilise-le seulement si tu souhaites réellement remplacer le fichier. Pour conserver un historique, préfère `a`.

~~~python
with open("nouveau.txt", "x", encoding="utf-8") as fichier:
    fichier.write("Premier contenu.\n")
~~~

Si le fichier existe déjà, Python déclenche `FileExistsError`. Ce comportement protège contre un remplacement accidentel. Retiens : `r` lit, `w` remplace, `a` ajoute et `x` crée sans écraser.

## 5. Lire un fichier
`read()` récupère tout le contenu sous forme de chaîne. Elle convient aux petits fichiers :

~~~python
with open("notes.txt", "r", encoding="utf-8") as fichier:
    texte = fichier.read()
print(texte)
~~~

`readline()` lit une ligne :

~~~python
with open("notes.txt", "r", encoding="utf-8") as fichier:
    premiere = fichier.readline()
    deuxieme = fichier.readline()
print(premiere, deuxieme)
~~~

Pour parcourir toutes les lignes, utilise une boucle :

~~~python
with open("notes.txt", "r", encoding="utf-8") as fichier:
    for ligne in fichier:
        print(ligne.strip())
~~~

`strip()` retire les espaces et retours à la ligne aux extrémités. Ne l'utilise pas si ces espaces ont une signification. Pour un grand fichier, la lecture ligne par ligne évite de charger tout le contenu en mémoire.

## 6. Écrire et ajouter du texte
`write()` écrit une chaîne. Elle n'ajoute pas automatiquement de retour à la ligne :

~~~python
with open("journal.txt", "w", encoding="utf-8") as fichier:
    fichier.write("Première ligne.\n")
    fichier.write("Deuxième ligne.\n")
~~~

Le caractère `\n` représente un retour à la ligne. Pour ajouter une note sans effacer l'ancien contenu :

~~~python
with open("journal.txt", "a", encoding="utf-8") as fichier:
    fichier.write("Réviser les fonctions\n")
~~~

`writelines()` écrit plusieurs chaînes, mais n'ajoute pas les retours à la ligne à ta place :

~~~python
lignes = ["Python\n", "Fichiers\n", "JSON\n"]
with open("sujets.txt", "w", encoding="utf-8") as fichier:
    fichier.writelines(lignes)
~~~

Avant d'utiliser `w`, demande-toi si tu souhaites réellement remplacer le contenu.

## 7. Encodage et caractères accentués
L'encodage décrit la façon dont les caractères sont représentés. UTF-8 prend en charge les accents et de nombreuses écritures. Précise-le à l'écriture et à la lecture :

~~~python
with open("message.txt", "w", encoding="utf-8") as fichier:
    fichier.write("Bonjour, bienvenue à Abidjan !")

with open("message.txt", "r", encoding="utf-8") as fichier:
    print(fichier.read())
~~~

Si le fichier vient d'un autre logiciel, son encodage peut être différent. Une erreur de décodage invite à vérifier l'encodage d'origine, pas à supprimer les accents au hasard. En mode texte, Python adapte normalement les fins de ligne. Pour ces exercices, utilise `\n`.

## 8. Gérer les erreurs
Un programme fiable prévoit les cas ordinaires : fichier absent, accès refusé ou contenu illisible.

~~~python
try:
    with open("notes.txt", "r", encoding="utf-8") as fichier:
        contenu = fichier.read()
except FileNotFoundError:
    print("Le fichier n'existe pas encore.")
else:
    print(contenu)
~~~

`try` contient l'opération risquée, `except` traite l'erreur attendue et `else` s'exécute si aucune exception n'a été déclenchée. Pour un accès refusé :

~~~python
try:
    with open("notes.txt", "w", encoding="utf-8") as fichier:
        fichier.write("Essai")
except PermissionError:
    print("Pydroid 3 ne peut pas écrire dans ce dossier.")
~~~

Évite un `except:` vide : il masque les problèmes. Traite les exceptions que tu sais expliquer.

## 9. Manipuler les chemins avec pathlib
Le module standard `pathlib` rend les chemins plus lisibles :

~~~python
from pathlib import Path

dossier = Path.cwd()
chemin = dossier / "notes.txt"
print("Chemin :", chemin)
print("Existe :", chemin.exists())
~~~

L'opérateur `/` combine des parties de chemin. Pour créer un dossier :

~~~python
dossier = Path("donnees")
dossier.mkdir(parents=True, exist_ok=True)
~~~

Pour un petit fichier, `Path` peut lire et écrire directement :

~~~python
chemin = Path("donnees") / "message.txt"
chemin.write_text("Bonjour !\n", encoding="utf-8")
print(chemin.read_text(encoding="utf-8"))
~~~

Ces méthodes sont pratiques pour de petits contenus. Pour lire un gros fichier ligne par ligne, préfère `open()`.

## 10. Enregistrer des données en JSON
JSON est pratique pour conserver une liste ou un dictionnaire. Le module `json` est fourni avec Python.

~~~python
import json

profil = {"pseudo": "Nova", "niveau": 3, "actif": True}
with open("profil.json", "w", encoding="utf-8") as fichier:
    json.dump(profil, fichier, ensure_ascii=False, indent=2)
~~~

`dump()` écrit une structure Python dans un fichier. `ensure_ascii=False` conserve les accents et `indent=2` rend le document lisible.

Pour relire :

~~~python
import json

with open("profil.json", "r", encoding="utf-8") as fichier:
    profil = json.load(fichier)
print(profil["pseudo"])
~~~

`load()` reconstruit les types compatibles : dictionnaire, liste, texte, nombre, booléen ou valeur nulle. Traite `json.JSONDecodeError` et vérifie les clés avant de les utiliser.

## 11. Mini-projet : gestionnaire de tâches
Ce programme conserve les tâches dans un fichier JSON. Il sépare chargement, sauvegarde et affichage.

~~~python
import json
from pathlib import Path

FICHIER = Path("taches.json")

def charger_taches():
    if not FICHIER.exists():
        return []
    try:
        with FICHIER.open("r", encoding="utf-8") as fichier:
            donnees = json.load(fichier)
        if isinstance(donnees, list):
            return donnees
        print("Le fichier ne contient pas une liste.")
    except (json.JSONDecodeError, OSError) as erreur:
        print("Lecture impossible :", erreur)
    return []

def sauvegarder_taches(taches):
    with FICHIER.open("w", encoding="utf-8") as fichier:
        json.dump(taches, fichier, ensure_ascii=False, indent=2)

def afficher_taches(taches):
    if not taches:
        print("Aucune tâche enregistrée.")
        return
    for numero, tache in enumerate(taches, start=1):
        print(f"{numero}. {tache}")

taches = charger_taches()
while True:
    print("\n1. Afficher\n2. Ajouter\n3. Quitter")
    choix = input("Ton choix : ").strip()
    if choix == "1":
        afficher_taches(taches)
    elif choix == "2":
        nom = input("Nouvelle tâche : ").strip()
        if nom:
            taches.append(nom)
            sauvegarder_taches(taches)
            print("Tâche sauvegardée.")
        else:
            print("La tâche ne peut pas être vide.")
    elif choix == "3":
        sauvegarder_taches(taches)
        break
    else:
        print("Choix invalide.")
~~~

Dans Pydroid 3, `taches.json` sera créé dans le dossier de travail. Affiche `Path.cwd()` si tu ne sais pas où le retrouver. Amélioration : ajouter la suppression d'une tâche en demandant son numéro et en vérifiant qu'il est valide.

## 12. Erreurs fréquentes et débogage
- **FileNotFoundError :** chemin inexistant ; affiche `Path.cwd()` et vérifie le nom.
- **PermissionError :** autorisation absente ; essaie le dossier de travail de Pydroid 3.
- **Contenu effacé :** le mode `w` remplace le fichier ; utilise `a` pour ajouter ou `x` pour refuser l'écrasement.
- **Accents incorrects :** précise UTF-8 et vérifie l'encodage d'origine.
- **Lignes collées :** ajoute `\n` si nécessaire.
- **JSONDecodeError :** vérifie guillemets, virgules et accolades.
- **Données inattendues :** vérifie les types avec `isinstance()` et la présence des clés.

Méthode : lis le type d'exception, repère la ligne, affiche le chemin, vérifie mode et encodage, puis reproduis le problème avec un petit fichier de test.

## 13. Exercices progressifs
1. Crée `bonjour.txt`, écris une phrase avec un accent, puis relis-la.
2. Ajoute une deuxième phrase sans effacer la première.
3. Parcours un fichier et compte les lignes non vides.
4. Sauvegarde trois matières dans `matieres.json`, recharge la liste et affiche la deuxième matière.
5. Essaie de lire `inconnu.txt` et affiche un message compréhensible si le fichier manque.

## 14. Corrigés expliqués

### Exercice 1
~~~python
with open("bonjour.txt", "w", encoding="utf-8") as fichier:
    fichier.write("Bonjour, bienvenue à Abidjan !\n")
with open("bonjour.txt", "r", encoding="utf-8") as fichier:
    print(fichier.read())
~~~
Le premier bloc écrit, le second relit le fichier.

### Exercice 2
~~~python
with open("bonjour.txt", "a", encoding="utf-8") as fichier:
    fichier.write("Je découvre les fichiers Python.\n")
~~~
Le mode `a` conserve la première phrase.

### Exercice 3
~~~python
compte = 0
with open("bonjour.txt", "r", encoding="utf-8") as fichier:
    for ligne in fichier:
        if ligne.strip():
            compte += 1
print("Lignes non vides :", compte)
~~~

### Exercice 4
~~~python
import json
matieres = ["Python", "IA", "Web"]
with open("matieres.json", "w", encoding="utf-8") as fichier:
    json.dump(matieres, fichier, ensure_ascii=False, indent=2)
with open("matieres.json", "r", encoding="utf-8") as fichier:
    copie = json.load(fichier)
print(copie[1])
~~~

### Exercice 5
~~~python
try:
    with open("inconnu.txt", "r", encoding="utf-8") as fichier:
        print(fichier.read())
except FileNotFoundError:
    print("Crée d'abord le fichier inconnu.txt.")
~~~

## 15. Fiche de révision et validation
| Élément | À retenir |
|---|---|
| `open()` | Ouvre un fichier |
| `with` | Ferme automatiquement |
| `r` | Lire |
| `w` | Remplacer |
| `a` | Ajouter |
| `x` | Créer sans écraser |
| `read()` | Lire le texte |
| `write()` | Écrire une chaîne |
| `Path` | Manipuler un chemin |
| `json.dump()` | Écrire JSON |
| `json.load()` | Lire JSON |

Avant la leçon 11, vérifie que tu peux ouvrir un fichier, choisir son mode, lire et écrire en UTF-8, gérer un fichier absent et sauvegarder une liste en JSON.

**À retenir :** un fichier conserve les données après la fermeture du programme. Utilise `with`, choisis le bon mode et vérifie le chemin et le contenu.

---

*©pythonschool — Python, Leçon 10.*
