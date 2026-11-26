# Python — Leçon 13 : Créer des classes et des objets

**Parcours :** Python  
**Numéro :** 13  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 110 à 120 minutes  
**Environnement :** Pydroid 3 sur Android ou Python standard, sans bibliothèque externe.  
**Prérequis :** Variables, conditions, boucles, fonctions, listes, dictionnaires, fichiers et exceptions.

## 1. Fiche de départ : objectifs et prérequis

Jusqu'ici, tu as appris à organiser les données avec des listes et des dictionnaires, puis à organiser les instructions avec des fonctions. Quand un programme grandit, il devient utile de réunir les données d'un élément et les actions qui lui sont propres. C'est le rôle des classes et des objets.

À la fin de cette leçon, tu sauras expliquer la différence entre une classe et un objet, créer une classe avec un initialiseur, utiliser **self**, définir des attributs et des méthodes, créer plusieurs objets indépendants et afficher un objet de façon lisible. Tu apprendras aussi à protéger les règles importantes d'un objet et à composer plusieurs objets sans rendre le code inutilement compliqué.

Les exemples utilisent uniquement Python standard. Dans Pydroid 3, crée un fichier nommé **lecon13.py** et exécute les exemples séparément. Une classe n'est pas obligatoire pour tous les programmes : elle devient utile lorsque plusieurs valeurs décrivent la même entité et que plusieurs opérations doivent rester cohérentes.

## 2. Sommaire et méthode de travail

1. Pourquoi regrouper les données et les actions ?
2. Comprendre une classe et un objet
3. Définir une classe et créer des instances
4. Initialiser un objet avec __init__
5. Comprendre self et les attributs
6. Ajouter des méthodes
7. Afficher un objet avec __str__
8. Distinguer attributs d'instance et attributs de classe
9. Protéger les données et vérifier les règles
10. Composer des objets et découvrir l'héritage
11. Mini-projet : gestion d'une bibliothèque
12. Exercices progressifs
13. Corrigés expliqués
14. Fiche de révision et validation

Travaille par petites étapes : lis la définition, recopie le code, exécute-le, puis modifie une valeur. Lorsque tu crées deux objets, vérifie toujours que modifier l'un ne change pas l'autre par accident.

## 3. Pourquoi regrouper les données et les actions ?

Imagine une application qui gère des livres. Pour chaque livre, il faut mémoriser un titre, un auteur et un nombre de pages. Il faut aussi pouvoir afficher une fiche et vérifier si le livre possède un nombre de pages valide.

Avec un dictionnaire, tu peux stocker les informations. Avec des fonctions séparées, tu peux réaliser les opérations. Cela fonctionne très bien pour un petit programme. Mais si le projet contient de nombreux types d'éléments, tu dois te rappeler quelles fonctions vont avec quelles données.

La programmation orientée objet propose un regroupement : un objet contient son état, c'est-à-dire ses données, et expose des méthodes, c'est-à-dire ses actions. Une classe décrit la structure commune. Chaque objet créé à partir de cette classe possède ses propres valeurs.

Cette organisation aide à représenter une entité identifiable, éviter de transmettre de nombreux paramètres, regrouper les règles qui protègent les données et réutiliser une structure. Il ne faut pas transformer chaque variable en objet. Pour une simple addition, une fonction reste plus simple. Choisis l'approche qui rend le programme le plus clair.

## 4. Comprendre une classe et un objet

Une **classe** est un modèle qui décrit quelles données et quelles actions un type d'objet possède. Un **objet** est une instance concrète de cette classe. On peut comparer la classe au plan d'une maison et l'objet à une maison construite à partir de ce plan. Le plan n'est pas la maison ; il décrit comment la construire.

Exemple : la classe Livre décrit les informations d'un livre ; un premier objet représente « Le Petit Prince » ; un deuxième représente « L'Île au trésor ». Les deux objets suivent la même structure, mais leurs titres et leurs auteurs sont différents.

Le vocabulaire est important :
- **instance** : objet créé à partir d'une classe ;
- **attribut** : donnée stockée dans un objet ;
- **méthode** : fonction définie dans une classe et appelée sur un objet ;
- **état** : ensemble des valeurs actuelles des attributs.

Un objet peut changer d'état pendant le programme. Par exemple, un livre peut passer de disponible à emprunté. Une méthode peut vérifier que ce changement respecte les règles prévues.

## 5. Définir une classe et créer des instances

En Python, une classe commence avec le mot-clé **class**. Par convention, le nom d'une classe utilise le style CapWords : chaque mot commence par une majuscule.

~~~python
class Livre:
    pass  # La classe est encore vide


livre_a = Livre()
livre_b = Livre()

print(type(livre_a))
print(type(livre_b))
~~~

Le mot **pass** signifie qu'aucune instruction n'est encore nécessaire à cet endroit. Les parenthèses après Livre créent une nouvelle instance. Les variables livre_a et livre_b référencent deux objets distincts.

Tu peux vérifier leur identité avec l'opérateur **is** :

~~~python
premier = Livre()
second = Livre()

print(premier is second)  # False
~~~

Les deux objets sont construits à partir de la même classe, mais ils ne sont pas le même objet. Cette différence est essentielle lorsque tu modifies leurs attributs.

Évite de confondre le nom de la classe et celui d'une instance. Le nom Livre désigne le modèle ; livre_a désigne un objet concret. Cette convention rend le code plus facile à lire.

## 6. Initialiser un objet avec __init__

La méthode spéciale **__init__** est appelée automatiquement après la création d'une instance. Elle sert généralement à donner aux attributs leurs premières valeurs. On l'appelle souvent le constructeur dans les explications débutantes, même si son rôle précis est d'initialiser l'objet déjà créé.

~~~python
class Livre:
    def __init__(self, titre, auteur, pages):
        self.titre = titre
        self.auteur = auteur
        self.pages = pages


livre = Livre("Le Petit Prince", "Antoine de Saint-Exupéry", 96)

print(livre.titre)
print(livre.auteur)
print(livre.pages)
~~~

Lorsque tu écris Livre(...), Python transmet les arguments à __init__. Le paramètre self représente l'instance en cours. Les autres paramètres reçoivent les valeurs fournies entre parenthèses.

Un bon initialiseur établit un état cohérent. Si le nombre de pages doit être positif, vérifie-le avant d'enregistrer la valeur :

~~~python
class Livre:
    def __init__(self, titre, pages):
        if pages <= 0:
            raise ValueError("Le nombre de pages doit être positif.")
        self.titre = titre
        self.pages = pages
~~~

Cette vérification empêche de créer un objet qui ne respecte pas une règle fondamentale.

## 7. Comprendre self et les attributs

Le paramètre **self** désigne l'objet sur lequel une méthode travaille. Il permet de lire ou modifier les attributs de cette instance. Son nom est une convention très forte en Python ; il faut le conserver pour que le code reste compréhensible.

~~~python
class Joueur:
    def __init__(self, pseudo, points):
        self.pseudo = pseudo
        self.points = points


joueur = Joueur("Nova", 10)
print(joueur.pseudo)
print(joueur.points)
~~~

La ligne self.pseudo = pseudo signifie : « enregistre dans l'objet la valeur reçue par le paramètre pseudo ». À gauche, self.pseudo est un attribut de l'objet. À droite, pseudo est le paramètre local de la méthode.

Chaque instance garde ses propres attributs :

~~~python
joueur_a = Joueur("Lina", 10)
joueur_b = Joueur("Malo", 25)

joueur_a.points = 15

print(joueur_a.points)  # 15
print(joueur_b.points)  # 25
~~~

Modifier joueur_a ne modifie pas joueur_b. Si les deux objets partagent accidentellement une même liste ou un même dictionnaire défini au niveau de la classe, le résultat peut être différent : nous verrons cette distinction plus loin.

## 8. Ajouter des méthodes

Une méthode est une fonction placée dans une classe. Elle reçoit généralement self en premier paramètre et peut utiliser les attributs de l'objet.

~~~python
class Compte:
    def __init__(self, titulaire, solde):
        self.titulaire = titulaire
        self.solde = solde

    def afficher_solde(self):
        print("Titulaire :", self.titulaire)
        print("Solde :", self.solde)

    def deposer(self, montant):
        if montant <= 0:
            raise ValueError("Le montant doit être positif.")
        self.solde += montant


compte = Compte("Awa", 5000)
compte.deposer(1500)
compte.afficher_solde()
~~~

L'appel compte.deposer(1500) transmet automatiquement compte comme premier argument, donc self représente cet objet. Tu n'écris pas compte.deposer(compte, 1500).

Une méthode peut renvoyer une valeur avec **return**. Par exemple, une méthode calculer_total peut renvoyer le prix multiplié par la quantité. Utilise return lorsque le résultat doit être réutilisé ailleurs ; utilise print uniquement lorsque l'objectif est d'afficher directement une information.

Une classe claire possède des méthodes courtes et cohérentes. Une méthode ne devrait pas envoyer un message Discord, ouvrir un fichier et calculer un prix si ces tâches ne font pas partie du même rôle.

## 9. Afficher un objet avec __str__

Par défaut, afficher un objet peut produire une représentation technique peu utile. La méthode spéciale **__str__** permet de définir un texte lisible pour les humains.

~~~python
class Livre:
    def __init__(self, titre, auteur):
        self.titre = titre
        self.auteur = auteur

    def __str__(self):
        return self.titre + " — " + self.auteur


livre = Livre("L'Île au trésor", "Robert Louis Stevenson")
print(livre)
~~~

La méthode doit renvoyer une chaîne de caractères. Elle ne doit pas utiliser print à la place de return. Lorsque print reçoit un objet, Python utilise généralement sa méthode __str__ pour obtenir le texte à afficher.

Tu peux aussi définir **__repr__** pour fournir une représentation utile au développement et au diagnostic. Pour cette première étape, retiens surtout que __str__ sert à présenter l'objet de manière lisible.

Une bonne représentation contient les informations importantes, mais évite les données privées. N'affiche jamais un mot de passe, un jeton d'accès ou une information personnelle simplement parce qu'un objet possède cet attribut.

## 10. Attributs de classe, encapsulation et composition

Un attribut d'instance est créé avec self et appartient à un objet particulier. Un attribut de classe est défini directement dans la classe et partagé par toutes les instances qui ne le remplacent pas.

~~~python
class Joueur:
    jeu = "Académique"  # Attribut de classe

    def __init__(self, pseudo):
        self.pseudo = pseudo  # Attribut d'instance


a = Joueur("Lina")
b = Joueur("Malo")

print(a.jeu)
print(b.jeu)
~~~

Attention aux listes et dictionnaires partagés : une liste mutable définie comme attribut de classe peut être modifiée par toutes les instances. Pour une collection propre à chaque objet, initialise-la dans __init__ avec une nouvelle liste.

Python utilise des conventions pour signaler les attributs internes. Un nom qui commence par un souligné, comme _solde, indique qu'il ne devrait pas être modifié directement depuis l'extérieur. Ce n'est pas une sécurité absolue, mais une règle de conception.

La **composition** consiste à utiliser un objet à l'intérieur d'un autre. Une bibliothèque peut posséder une liste de livres. Cette relation signifie « possède » ou « utilise ». L'**héritage** permet de créer une classe spécialisée à partir d'une classe plus générale. Utilise-le seulement lorsqu'une relation « est un » est réellement présente.

## 11. Mini-projet : gestion d'une bibliothèque

Le projet contient deux classes : Livre représente un livre ; Bibliotheque regroupe plusieurs livres. Chaque bibliothèque crée sa propre liste dans son initialiseur.

~~~python
class Livre:
    def __init__(self, titre, auteur):
        self.titre = titre
        self.auteur = auteur
        self.disponible = True

    def emprunter(self):
        if not self.disponible:
            return False
        self.disponible = False
        return True

    def rendre(self):
        self.disponible = True

    def __str__(self):
        etat = "disponible" if self.disponible else "emprunté"
        return self.titre + " — " + self.auteur + " (" + etat + ")"


class Bibliotheque:
    def __init__(self):
        self.livres = []

    def ajouter(self, livre):
        self.livres.append(livre)

    def afficher(self):
        for livre in self.livres:
            print(livre)

    def rechercher(self, titre):
        for livre in self.livres:
            if livre.titre.lower() == titre.lower():
                return livre
        return None


bibliotheque = Bibliotheque()
bibliotheque.ajouter(Livre("Le Petit Prince", "A. de Saint-Exupéry"))
bibliotheque.ajouter(Livre("L'Île au trésor", "R. L. Stevenson"))
bibliotheque.afficher()
~~~

Améliore le projet en ajoutant une méthode emprunter(titre) dans Bibliotheque. Elle doit rechercher le livre, vérifier qu'il existe, puis appeler sa méthode emprunter. Si aucun livre ne correspond, renvoie False ou affiche un message clair. Ajoute ensuite une méthode rendre(titre).

Teste trois cas : un livre disponible, le même livre déjà emprunté et un titre absent. Les trois situations doivent produire un résultat compréhensible.

## 12. Exercices progressifs et débogage

**Exercice A — Produit :** crée une classe Produit avec nom et prix. Ajoute une méthode afficher qui présente les deux informations.

**Exercice B — Compteur :** crée une classe Compteur qui commence à zéro. Ajoute incrementer() et reinitialiser().

**Exercice C — Validation :** refuse un prix négatif dans __init__ en levant ValueError.

**Exercice D — Indépendance :** crée deux paniers, chacun avec sa propre liste d'articles. Vérifie qu'ajouter un article dans le premier ne modifie pas le second.

**Exercice E — Extension :** ajoute une méthode est_disponible() à la classe Livre du mini-projet.

Erreurs fréquentes : oublier self dans une méthode ; écrire self = paramètre au lieu de self.attribut = paramètre ; appeler une méthode sans parenthèses ; utiliser une variable locale qui n'existe pas dans la méthode ; partager une liste de classe alors que chaque objet doit avoir sa propre liste ; utiliser print dans __str__ au lieu de renvoyer une chaîne.

Pour déboguer, lis le message complet, repère le nom de l'attribut manquant et affiche type(objet). Vérifie ensuite que l'objet a bien été créé avec les arguments attendus. Teste une méthode sur un seul objet avant de l'utiliser dans une boucle.

## 13. Corrigés expliqués

### Correction A

~~~python
class Produit:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def afficher(self):
        print(self.nom, ":", self.prix, "FCFA")


article = Produit("Cahier", 750)
article.afficher()
~~~

Les données sont initialisées dans __init__. La méthode utilise self pour accéder à l'objet.

### Correction B

~~~python
class Compteur:
    def __init__(self):
        self.valeur = 0

    def incrementer(self):
        self.valeur += 1

    def reinitialiser(self):
        self.valeur = 0


compteur = Compteur()
compteur.incrementer()
print(compteur.valeur)
~~~

La valeur appartient à l'instance. Deux compteurs peuvent donc évoluer séparément.

### Correction C

~~~python
class Produit:
    def __init__(self, prix):
        if prix < 0:
            raise ValueError("Prix négatif interdit.")
        self.prix = prix
~~~

La règle est vérifiée au moment de la création. Le programme appelant peut traiter ValueError avec try et except.

### Correction D

~~~python
class Panier:
    def __init__(self):
        self.articles = []

    def ajouter(self, article):
        self.articles.append(article)


a = Panier()
b = Panier()
a.ajouter("Stylo")
print(a.articles)
print(b.articles)
~~~

La liste est créée dans __init__, donc chaque instance possède sa propre collection.

## 14. Fiche de révision et validation

| Notion | À retenir |
|---|---|
| class | Déclare un modèle d'objet |
| Instance | Objet créé à partir d'une classe |
| __init__ | Initialise les attributs |
| self | Désigne l'instance courante |
| Attribut | Donnée associée à un objet |
| Méthode | Fonction définie dans une classe |
| __str__ | Texte lisible d'un objet |
| Encapsulation | Contrôler les changements d'état |
| Composition | Un objet utilise un autre objet |
| Héritage | Spécialiser une classe existante |

Avant de passer à la leçon suivante, vérifie que tu sais créer une classe, construire deux instances indépendantes, ajouter une méthode, utiliser self et expliquer pourquoi une liste d'instance doit être créée dans __init__.

**À retenir :** une classe décrit une structure ; un objet est une instance concrète. Regroupe les données et les actions lorsqu'elles représentent réellement la même entité. Une fonction simple reste préférable lorsque la notion d'objet n'apporte rien.

---

*©pythonschool — Python, Leçon 13.*