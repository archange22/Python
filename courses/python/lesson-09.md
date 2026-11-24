# Python — Leçon 09 : Les dictionnaires, organiser des données avec des clés

**Parcours :** Python  
**Numéro :** 09  
**Niveau :** Débutant  
**Durée indicative :** 90 à 120 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard.  
**Prérequis :** Variables, types, conditions, boucles, listes et fonctions.  

## Objectifs et prérequis

Une liste range des éléments dans un ordre et permet de les retrouver avec leur position. Un dictionnaire permet plutôt de retrouver une information grâce à une clé qui décrit cette information. C'est pratique pour représenter une fiche de profil, un produit, un réglage ou un inventaire.

À la fin de cette leçon, tu sauras :
- créer un dictionnaire avec des paires clé-valeur ;
- lire, ajouter, modifier et supprimer une information ;
- éviter les erreurs de clé absente avec get() et in ;
- parcourir les clés, les valeurs et les paires ;
- organiser des dictionnaires imbriqués et des listes de dictionnaires ;
- construire un petit inventaire en fonctions.

Aucune bibliothèque externe ni connexion Internet n'est nécessaire. Dans Pydroid 3, crée un fichier dictionnaires.py et exécute les exemples séparément.

## Sommaire

1. Comprendre le rôle d'un dictionnaire
2. Créer un dictionnaire
3. Lire une valeur sans provoquer d'erreur
4. Ajouter et modifier des informations
5. Supprimer une entrée
6. Parcourir un dictionnaire
7. Utiliser des dictionnaires imbriqués
8. Choisir entre liste et dictionnaire
9. Copier et combiner des dictionnaires
10. Erreurs fréquentes et débogage
11. Mini-projet : inventaire d'une petite boutique
12. Exercices progressifs
13. Corrigés expliqués
14. Fiche de révision

## 1. Comprendre le rôle d'un dictionnaire

Un dictionnaire Python est une collection qui associe une clé à une valeur. Imagine une fiche d'identité : le champ « prénom » mène à une valeur, le champ « ville » mène à une autre. La clé sert d'étiquette pour retrouver la donnée.

Exemple :

~~~python
profil = {
    "prenom": "Awa",
    "ville": "Abidjan",
    "niveau": "Débutant"
}

print(profil["prenom"])
~~~

Le programme affiche Awa. La clé est prenom et la valeur associée est Awa.

Une liste utilise surtout des positions numériques : element 0, element 1, etc. Un dictionnaire utilise des clés explicites. Cela rend le code plus compréhensible lorsque chaque donnée possède un nom.

Les dictionnaires sont utiles pour :
- décrire un utilisateur avec un pseudo, une ville et un niveau ;
- décrire un article avec un prix et une quantité ;
- stocker des paramètres comme le volume ou le thème ;
- représenter une réponse structurée reçue d'une API ;
- compter le nombre d'occurrences de mots.

Dans un dictionnaire, les clés doivent être uniques. Une nouvelle valeur affectée à une clé déjà présente remplace l'ancienne valeur. Les valeurs peuvent être des textes, nombres, booléens, listes ou autres dictionnaires.

## 2. Créer un dictionnaire

On crée un dictionnaire avec des accolades. Chaque entrée contient une clé, deux-points, puis une valeur. Les entrées sont séparées par des virgules.

~~~python
joueur = {
    "pseudo": "Nova",
    "niveau": 12,
    "actif": True
}

print(joueur)
print(type(joueur))
~~~

Le type affiché est dict. Les clés de cet exemple sont des chaînes de caractères. Les clés peuvent aussi être des nombres ou d'autres objets immuables, mais utilise des chaînes descriptives pour commencer.

Un dictionnaire vide s'écrit ainsi :

~~~python
inventaire = {}
inventaire["cahier"] = 10
print(inventaire)
~~~

Tu peux aussi utiliser dict() :

~~~python
profil = dict(prenom="Koffi", ville="Bouake")
print(profil)
~~~

Avec dict(), les noms de paramètres doivent être des identifiants Python valides. Les accolades sont plus souples pour les clés qui contiennent des espaces ou des caractères particuliers.

Respecte les virgules et les guillemets. Une clé écrite sans guillemets, comme prenom, serait interprétée comme le nom d'une variable.

## 3. Lire une valeur sans provoquer d'erreur

Pour lire une valeur, place sa clé entre crochets :

~~~python
profil = {"prenom": "Awa", "ville": "Abidjan"}

print(profil["ville"])
~~~

Si la clé n'existe pas, Python déclenche KeyError. Cette erreur indique que le programme demande une entrée absente.

La méthode get() permet de fournir une valeur de remplacement :

~~~python
profil = {"prenom": "Awa"}

ville = profil.get("ville", "Ville inconnue")
print(ville)
~~~

Ici, le programme affiche Ville inconnue sans arrêter l'exécution. Si la clé existe, get() renvoie sa valeur. Sinon, il renvoie la valeur de remplacement, ou None si tu n'en donnes pas.

Tu peux tester la présence d'une clé avec in :

~~~python
if "prenom" in profil:
    print("Le prénom est enregistré.")
else:
    print("Aucun prénom.")
~~~

Attention : l'opérateur in vérifie les clés d'un dictionnaire, pas directement ses valeurs. Pour chercher dans les valeurs, utilise values().

Choisis les crochets lorsque la clé doit obligatoirement exister. Choisis get() lorsque l'absence est normale et doit être gérée.

## 4. Ajouter et modifier des informations

L'affectation avec des crochets sert à ajouter une entrée ou à remplacer sa valeur.

~~~python
produit = {"nom": "Cahier", "prix": 750}

produit["quantite"] = 8   # Nouvelle clé
produit["prix"] = 800     # Valeur modifiée

print(produit)
~~~

Python distingue une nouvelle clé d'une clé déjà présente. Il n'est pas nécessaire d'utiliser une instruction spéciale pour modifier une entrée.

update() permet de modifier plusieurs entrées en une fois :

~~~python
profil = {"prenom": "Awa", "ville": "Abidjan"}

profil.update({
    "ville": "Bouake",
    "niveau": "Intermediaire"
})

print(profil)
~~~

La ville est remplacée et le niveau est ajouté.

Pour éviter de remplacer une valeur par erreur, teste d'abord la clé :

~~~python
if "email" not in profil:
    profil["email"] = "awa@example.test"
~~~

Dans un vrai programme, ne place pas de données personnelles réelles dans un exercice partagé. Utilise des valeurs fictives.

## 5. Supprimer une entrée

del supprime une entrée lorsqu'on connaît sa clé :

~~~python
profil = {"prenom": "Awa", "ville": "Abidjan"}
del profil["ville"]
print(profil)
~~~

Si la clé n'existe pas, del provoque KeyError. Vérifie sa présence avant de supprimer.

pop() retire une entrée et renvoie sa valeur :

~~~python
stock = {"cahier": 8, "stylo": 20}

quantite = stock.pop("cahier", 0)
print("Quantite retiree :", quantite)
print(stock)
~~~

Le deuxième argument de pop() est une valeur de remplacement si la clé est absente. Cela évite une erreur.

clear() vide entièrement le dictionnaire :

~~~python
parametres = {"theme": "sombre", "son": True}
parametres.clear()
print(parametres)
~~~

N'utilise clear() que si tu veux réellement supprimer toutes les entrées. Dans un programme important, vérifie toujours l'action avant de vider une collection.

## 6. Parcourir un dictionnaire

Une boucle for parcourt les clés par défaut :

~~~python
profil = {"prenom": "Awa", "ville": "Abidjan", "niveau": "Debutant"}

for cle in profil:
    print(cle)
~~~

keys() renvoie une vue des clés. values() renvoie une vue des valeurs. items() permet de récupérer les deux en même temps.

~~~python
for cle, valeur in profil.items():
    print(f"{cle} : {valeur}")
~~~

Cette forme est très pratique pour afficher une fiche complète. Les deux variables cle et valeur reçoivent chaque paire à chaque tour de boucle.

Pour compter les entrées, utilise len() :

~~~python
print("Nombre de champs :", len(profil))
~~~

Pour vérifier si une valeur existe :

~~~python
if "Abidjan" in profil.values():
    print("La ville est présente.")
~~~

Évite de modifier la taille du dictionnaire pendant que tu le parcours directement. Si tu dois supprimer plusieurs clés, crée d'abord une liste des clés concernées, puis effectue les suppressions après le parcours.

## 7. Utiliser des dictionnaires imbriqués

Une valeur peut elle-même être un dictionnaire. On parle alors de dictionnaires imbriqués.

~~~python
boutique = {
    "cahier": {
        "prix": 750,
        "quantite": 10
    },
    "stylo": {
        "prix": 250,
        "quantite": 25
    }
}

print(boutique["cahier"]["prix"])
~~~

La première clé choisit le produit. La deuxième clé choisit une information de ce produit.

Cette organisation ressemble à un classeur : chaque produit possède sa propre fiche. Elle est utile lorsque plusieurs objets ont les mêmes champs.

Pour lire une valeur sans supposer que toutes les clés existent, vérifie chaque niveau :

~~~python
article = boutique.get("gomme")

if article is None:
    print("Produit inconnu.")
else:
    print(article.get("prix", "Prix absent"))
~~~

Ne multiplie pas les niveaux sans raison. Un dictionnaire trop profond devient difficile à lire. Si la structure devient complexe, crée des fonctions qui cachent les détails.

## 8. Choisir entre liste et dictionnaire

Une liste convient lorsque l'ordre et la position sont importants. Un dictionnaire convient lorsque tu veux retrouver une valeur par une clé.

~~~python
couleurs = ["rouge", "vert", "bleu"]
print(couleurs[0])

profil = {"prenom": "Koffi", "ville": "Yamoussoukro"}
print(profil["ville"])
~~~

Tu peux combiner les deux. Une liste de dictionnaires représente par exemple plusieurs produits :

~~~python
produits = [
    {"nom": "Cahier", "prix": 750},
    {"nom": "Stylo", "prix": 250},
    {"nom": "Gomme", "prix": 150}
]

for produit in produits:
    print(produit["nom"], produit["prix"])
~~~

La liste conserve l'ordre des produits. Chaque dictionnaire décrit un produit.

Pour retrouver souvent un produit par son identifiant, un dictionnaire de dictionnaires peut être plus adapté :

~~~python
produits = {
    "A01": {"nom": "Cahier", "prix": 750},
    "A02": {"nom": "Stylo", "prix": 250}
}
~~~

Choisis la structure selon les opérations les plus fréquentes, pas selon une règle absolue.

## 9. Copier et combiner des dictionnaires

L'affectation ne crée pas une nouvelle copie :

~~~python
original = {"theme": "clair"}
autre = original
autre["theme"] = "sombre"

print(original["theme"])
~~~

Le résultat est sombre, car les deux variables désignent le même dictionnaire.

copy() crée une copie superficielle :

~~~python
original = {"theme": "clair", "volume": 5}
copie = original.copy()
copie["theme"] = "sombre"

print(original["theme"])
print(copie["theme"])
~~~

Ici, les deux dictionnaires principaux sont distincts. Mais si une valeur contient une liste ou un autre dictionnaire, cette valeur imbriquée peut rester partagée. On appelle cela une copie superficielle.

update() permet de combiner des entrées. En Python récent, l'opérateur | crée aussi un nouveau dictionnaire combiné :

~~~python
base = {"theme": "clair", "son": True}
personnalisation = {"theme": "sombre"}

resultat = base | personnalisation
print(resultat)
~~~

Quand une clé existe des deux côtés, la valeur de droite est retenue. Vérifie la version de Python si tu utilises des fonctionnalités récentes.

## 10. Erreurs fréquentes et débogage

**KeyError :** le programme demande une clé absente. Affiche le dictionnaire, vérifie l'orthographe et utilise get() si l'absence est normale.

**Mauvaise clé :** "Prix" et "prix" sont deux clés différentes. Les chaînes sont sensibles aux majuscules.

**Confondre clé et valeur :** profil["ville"] cherche une clé nommée ville. profil.values() parcourt les valeurs.

**Oublier les accolades :** un dictionnaire utilise { } et non [ ].

**Écraser une entrée :** affecter une valeur à une clé existante remplace son ancienne valeur. Utilise in pour tester avant.

Pour déboguer, affiche les clés avec list(mon_dictionnaire.keys()), puis vérifie le type avec type(). Teste une petite structure avant d'ajouter les autres champs.

~~~python
donnees = {"nom": "Nova"}

print("Cles :", list(donnees.keys()))
print("Type :", type(donnees))

if "nom" in donnees:
    print("Valeur :", donnees["nom"])
~~~

Lis la dernière ligne du message d'erreur et repère la ligne du programme concernée. Corrige une cause à la fois.

## 11. Mini-projet : inventaire d'une petite boutique

Le projet stocke des produits avec leur prix et leur quantité. Il permet d'afficher l'inventaire, d'ajouter un produit et de modifier un stock. Les données restent en mémoire : elles disparaissent lorsque le programme se termine. La sauvegarde dans un fichier sera étudiée plus tard.

~~~python
inventaire = {
    "cahier": {"prix": 750, "quantite": 10},
    "stylo": {"prix": 250, "quantite": 20}
}

def afficher_inventaire():
    print("\\n--- INVENTAIRE ---")
    for nom, infos in inventaire.items():
        print(
            f"{nom} : {infos['quantite']} unite(s), "
            f"{infos['prix']} FCFA"
        )

def ajouter_produit(nom, prix, quantite):
    if nom in inventaire:
        print("Ce produit existe deja.")
        return False

    if prix < 0 or quantite < 0:
        print("Prix et quantite doivent etre positifs.")
        return False

    inventaire[nom] = {
        "prix": prix,
        "quantite": quantite
    }
    return True

def modifier_stock(nom, variation):
    produit = inventaire.get(nom)

    if produit is None:
        print("Produit inconnu.")
        return False

    nouvelle_quantite = produit["quantite"] + variation

    if nouvelle_quantite < 0:
        print("Stock insuffisant.")
        return False

    produit["quantite"] = nouvelle_quantite
    return True

ajouter_produit("gomme", 150, 12)
modifier_stock("stylo", -3)
afficher_inventaire()
~~~

Observe la séparation des responsabilités :
- afficher_inventaire() ne fait que présenter les données ;
- ajouter_produit() vérifie puis ajoute ;
- modifier_stock() contrôle que la quantité ne devient pas négative.

Le programme utilise des fonctions pour éviter de recopier les mêmes instructions. Tu peux ensuite ajouter un menu avec une boucle while et des saisies avec input(). Pour cette première version, les appels sont écrits directement afin de se concentrer sur la structure des données.

## 12. Exercices progressifs

Réalise les exercices dans Pydroid 3 avant de consulter les corrections.

1. Crée un dictionnaire personne avec les clés prenom, ville et age. Affiche le prénom.
2. Ajoute une clé langage avec la valeur Python.
3. Modifie la ville, puis affiche toutes les paires avec items().
4. Utilise get() pour lire une clé absente avec une valeur de remplacement.
5. Crée un dictionnaire notes avec trois matières et leurs notes. Calcule la moyenne des valeurs.
6. Crée une liste de trois dictionnaires représentant des produits. Affiche leur nom et leur prix.
7. Défi : écris une fonction compter_stock(inventaire) qui renvoie la somme de toutes les quantités.

Pour chaque exercice, prévois un exemple de résultat attendu. Si le résultat est différent, affiche les clés et les valeurs pour comprendre la structure.

## 13. Corrigés expliqués

~~~python
# Exercice 1
personne = {
    "prenom": "Awa",
    "ville": "Abidjan",
    "age": 15
}
print(personne["prenom"])

# Exercice 2
personne["langage"] = "Python"

# Exercice 3
personne["ville"] = "Bouake"
for cle, valeur in personne.items():
    print(cle, ":", valeur)

# Exercice 4
telephone = personne.get("telephone", "Non renseigne")
print(telephone)

# Exercice 5
notes = {"maths": 14, "francais": 12, "anglais": 16}
moyenne = sum(notes.values()) / len(notes)
print(f"Moyenne : {moyenne:.2f}")

# Exercice 6
produits = [
    {"nom": "Cahier", "prix": 750},
    {"nom": "Stylo", "prix": 250},
    {"nom": "Gomme", "prix": 150}
]

for produit in produits:
    print(produit["nom"], produit["prix"])
~~~

Correction du défi :

~~~python
def compter_stock(inventaire):
    total = 0

    for informations in inventaire.values():
        total += informations["quantite"]

    return total

exemple = {
    "cahier": {"prix": 750, "quantite": 10},
    "stylo": {"prix": 250, "quantite": 20}
}

print(compter_stock(exemple))  # 30
~~~

La fonction parcourt les valeurs du dictionnaire principal. Chaque valeur est un dictionnaire de produit. Elle lit la quantité et l'ajoute au total. return transmet le résultat à la suite du programme.

## 14. Fiche de révision et validation

- Un dictionnaire associe des clés à des valeurs.
- Les clés sont uniques ; une nouvelle affectation peut remplacer une valeur.
- Les crochets lisent une clé et provoquent KeyError si elle manque.
- get() permet de fournir une valeur de remplacement.
- in vérifie la présence d'une clé.
- update() ajoute ou modifie plusieurs entrées.
- del et pop() suppriment une entrée.
- items() parcourt les clés et les valeurs.
- Un dictionnaire peut contenir une liste ou un autre dictionnaire.
- copy() effectue une copie superficielle.
- Une liste de dictionnaires représente une collection d'objets structurés.

Avant de passer à la leçon 10, vérifie que tu peux créer un dictionnaire, modifier une valeur, gérer une clé absente, parcourir les entrées et écrire une fonction qui exploite plusieurs dictionnaires.

**Prochaine étape :** apprendre à lire et écrire des fichiers pour conserver les données après la fermeture du programme.

---

*Python Facile — Leçon 09. Exemples compatibles avec Pydroid 3 et Python standard.*

©pythonschool
