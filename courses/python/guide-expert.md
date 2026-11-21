# Python — Référence approfondie et parcours expert

Niveau : débutant à avancé. Langue : français.
Objectif : fournir à SUN une référence structurée pour expliquer Python, analyser du code, proposer des corrections et enseigner de bonnes pratiques. Ce document est une synthèse pédagogique originale. Pour les détails exacts d'une version, la documentation officielle reste prioritaire.

## 1. Comprendre l'exécution de Python

Python est un langage généraliste dont les implémentations courantes exécutent le code source via une chaîne d'analyse, de compilation en bytecode et d'exécution par une machine virtuelle. L'utilisateur écrit du code dans un fichier .py ou dans un interpréteur interactif.

Une instruction est une unité de code exécutée par l'interpréteur. Une expression produit une valeur. Une affectation associe un nom à un objet ; elle ne copie pas nécessairement cet objet.

    prix = 12.5
    total = prix * 3
    print(total)

Un nom est une référence vers un objet. Cette distinction explique pourquoi deux variables peuvent désigner la même liste et pourquoi une modification de cette liste est visible par les deux variables.

    a = [1, 2]
    b = a
    b.append(3)
    print(a)  # [1, 2, 3]

Pour obtenir une copie superficielle d'une liste, utiliser list(a), a.copy() ou a[:]. Pour les objets imbriqués, une copie superficielle conserve les références internes ; copy.deepcopy peut être nécessaire lorsque la copie récursive est réellement souhaitée.

## 2. Types fondamentaux et conversions

Types fréquemment utilisés :
- int : entiers ;
- float : nombres à virgule flottante, avec les limites de représentation binaire ;
- bool : True ou False ;
- str : texte Unicode ;
- NoneType : absence de valeur, représentée par None ;
- list : séquence modifiable ;
- tuple : séquence non modifiable ;
- dict : association clé-valeur ;
- set et frozenset : ensembles sans doublons, modifiable ou non ;
- bytes et bytearray : données binaires.

La conversion explicite évite de supposer que l'entrée utilisateur est déjà numérique.

    age = int("15")
    prix = float("12.50")
    texte = str(42)

Une conversion peut échouer. Une entrée utilisateur doit être contrôlée et l'erreur ValueError traitée.

    try:
        nombre = int(input("Nombre : "))
    except ValueError:
        print("Entre un nombre entier valide.")

La comparaison d'égalité utilise ==. L'identité d'objet utilise is. Pour comparer à None, privilégier is None. Ne pas utiliser is pour comparer des nombres ou des chaînes.

## 3. Opérateurs, conditions et boucles

Les opérateurs arithmétiques incluent +, -, *, /, //, %, et **. La division / produit un flottant, tandis que // effectue une division entière arrondie vers le bas. Le reste est donné par %.

Les comparaisons comprennent ==, !=, <, <=, > et >=. Les opérateurs logiques sont and, or et not. Python applique une évaluation paresseuse : la seconde partie de and ou or peut ne pas être exécutée si le résultat est déjà déterminé.

Une condition if/elif/else choisit une branche.

    if note >= 16:
        mention = "Très bien"
    elif note >= 10:
        mention = "Admis"
    else:
        mention = "À retravailler"

Une boucle for parcourt un itérable. range(n) fournit des entiers de 0 à n-1. Une boucle while répète tant que sa condition est vraie. Il faut toujours vérifier qu'une boucle while possède une condition d'arrêt atteignable.

break termine la boucle, continue passe à l'itération suivante, et else sur une boucle s'exécute si la boucle se termine normalement sans break.

## 4. Choisir la bonne structure de données

### Listes

Une liste est ordonnée et modifiable. Elle convient à une collection d'éléments que l'on parcourt ou modifie.

    notes = [12, 15, 18]
    notes.append(14)
    moyenne = sum(notes) / len(notes)

Accès par indice : O(1). Recherche par valeur : généralement O(n). Ajouter à la fin : amorti O(1). Insérer au début : O(n), car les autres éléments doivent être déplacés.

### Tuples

Un tuple représente un groupe ordonné de valeurs qui ne doit pas être modifié. Il est utile pour retourner plusieurs résultats ou représenter des enregistrements simples.

    point = (4, 7)
    x, y = point

### Dictionnaires

Un dictionnaire associe une clé unique à une valeur. Les clés doivent être hachables. Les recherches, insertions et suppressions sont généralement en O(1) en moyenne.

    utilisateur = {"nom": "Awa", "niveau": 2}
    utilisateur["niveau"] = 3
    utilisateur["ville"] = "Abidjan"

Utiliser get pour une lecture avec valeur par défaut. Utiliser setdefault seulement lorsque son effet d'insertion est souhaité. Ne pas parcourir un dictionnaire tout en modifiant sa taille.

### Ensembles

Un set supprime les doublons et permet des tests d'appartenance efficaces en moyenne.

    vus = {1, 2, 2, 3}
    uniques = set(vus)
    communs = {1, 2} & {2, 3}

## 5. Fonctions, paramètres et portée

Une fonction regroupe une tâche réutilisable. Elle reçoit des arguments et peut renvoyer un résultat avec return. Sans return explicite, elle renvoie None.

    def moyenne(valeurs):
        if not valeurs:
            raise ValueError("La liste ne peut pas être vide.")
        return sum(valeurs) / len(valeurs)

Python distingue les paramètres positionnels, nommés, avec valeur par défaut, *args et **kwargs. Éviter les valeurs par défaut mutables.

Mauvais modèle :
    def ajouter(element, elements=[]):
        elements.append(element)
        return elements

Modèle sûr :
    def ajouter(element, elements=None):
        if elements is None:
            elements = []
        elements.append(element)
        return elements

Une fonction locale peut lire les variables de son environnement. Un paramètre local masque un nom externe. Les mots-clés global et nonlocal modifient la portée ; les fonctions courtes et explicites sont souvent préférables à leur utilisation.

Une fonction lambda est une petite fonction anonyme limitée à une expression. Elle est utile pour une transformation courte, mais une fonction nommée est plus lisible lorsque la logique devient complexe.

## 6. Compréhensions, itérateurs et générateurs

Une compréhension construit une collection à partir d'un itérable.

    carres = [n * n for n in range(10)]
    pairs = [n for n in range(20) if n % 2 == 0]
    index = {nom: len(nom) for nom in ["Awa", "Koffi"]}

Un itérable peut être parcouru avec for. Un itérateur fournit les valeurs une par une avec next. Un générateur produit les valeurs progressivement avec yield ; il permet de traiter de grandes séquences sans tout garder en mémoire.

    def compter(jusqua):
        nombre = 1
        while nombre <= jusqua:
            yield nombre
            nombre += 1

Ne transformer une génération en liste que si toute la séquence doit réellement être conservée.

## 7. Gestion des erreurs et exceptions

Une exception signale qu'une opération n'a pas pu être menée normalement. Le bloc try protège l'opération risquée ; except traite uniquement les exceptions attendues ; else s'exécute si aucune exception n'est levée ; finally s'exécute dans tous les cas.

    try:
        valeur = int("abc")
    except ValueError as erreur:
        print("Conversion impossible :", erreur)
    else:
        print(valeur)
    finally:
        print("Fin du traitement.")

Éviter except Exception sans raison et ne jamais masquer une erreur en renvoyant silencieusement un résultat inventé. Lever ValueError pour un argument invalide, FileNotFoundError pour un fichier absent, et définir une exception métier seulement si cela clarifie réellement l'API.

## 8. Fichiers, chemins et sérialisation

Utiliser pathlib pour construire des chemins indépendants du système.

    from pathlib import Path
    chemin = Path("donnees") / "notes.txt"
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_text("Bonjour", encoding="utf-8")
    contenu = chemin.read_text(encoding="utf-8")

Préférer with open(...) pour fermer automatiquement un fichier.

    import json
    with open("profil.json", "w", encoding="utf-8") as fichier:
        json.dump({"nom": "Awa"}, fichier, ensure_ascii=False, indent=2)

    with open("profil.json", encoding="utf-8") as fichier:
        profil = json.load(fichier)

JSON convient aux données simples. CSV convient aux tableaux. SQLite convient aux données relationnelles locales. Ne jamais charger un fichier pickle reçu d'une source non fiable : sa désérialisation peut exécuter du code.

## 9. Modules, paquets et environnements

Un module est généralement un fichier Python importable. Un paquet organise plusieurs modules sous une arborescence. Les imports doivent rester explicites et éviter les effets de bord lors de l'importation.

    if __name__ == "__main__":
        main()

Cet idiome exécute main uniquement lorsque le fichier est lancé directement, et non lorsqu'il est importé.

Un environnement virtuel isole les dépendances d'un projet. pip installe les paquets. Un projet propre documente ses dépendances et versions, conserve un fichier de configuration reproductible et évite de versionner l'environnement virtuel lui-même.

## 10. Programmation orientée objet

Une classe définit un type d'objet. Une instance contient un état et expose des méthodes. __init__ initialise l'objet. self désigne l'instance courante.

    class Compte:
        def __init__(self, titulaire, solde=0):
            self.titulaire = titulaire
            self.solde = solde

        def deposer(self, montant):
            if montant <= 0:
                raise ValueError("Le montant doit être positif.")
            self.solde += montant

Encapsulation, composition, héritage et polymorphisme sont des outils, pas des objectifs. Préférer la composition quand un objet utilise un autre objet sans être réellement une spécialisation de son type.

dataclasses.dataclass réduit le code des classes qui stockent principalement des données. typing.Protocol permet de définir un contrat structurel sans imposer une classe parente commune.

## 11. Typage et contrats

Les annotations précisent les types attendus et améliorent la documentation, l'autocomplétion et l'analyse statique. Elles ne valident pas automatiquement les données à l'exécution.

    def moyenne(notes: list[float]) -> float:
        if not notes:
            raise ValueError("Aucune note.")
        return sum(notes) / len(notes)

Utiliser les types génériques, les unions et les types optionnels lorsque cela rend le contrat plus clair. Ne pas ajouter des annotations approximatives qui promettent plus que le code ne garantit.

## 12. Décorateurs et gestionnaires de contexte

Un décorateur reçoit une fonction et retourne généralement une fonction modifiée. Il permet d'ajouter une responsabilité transversale comme la mesure de durée, la journalisation ou une vérification d'accès.

Un gestionnaire de contexte encadre une opération avec une entrée et une sortie sûres, par exemple l'ouverture d'un fichier. Le mot-clé with garantit l'appel de la logique de fermeture même si une exception survient.

## 13. Concurrence et programmation asynchrone

Threading convient surtout aux tâches d'attente d'entrées-sorties. Multiprocessing permet d'exploiter plusieurs processus pour des calculs lourds, au prix d'une communication et d'une mémoire plus coûteuses. asyncio organise des opérations d'entrée-sortie coopératives avec async et await.

Le choix dépend du profil réel de la charge. Ne pas remplacer automatiquement tout code synchrone par asyncio. Mesurer d'abord, puis choisir le modèle de concurrence le plus simple qui répond au besoin.

## 14. Bibliothèque standard à connaître

- pathlib : chemins et fichiers ;
- os et shutil : système de fichiers ;
- sys et argparse : environnement et arguments ;
- json, csv et sqlite3 : stockage structuré ;
- datetime et zoneinfo : dates et fuseaux horaires ;
- re : expressions régulières ;
- collections et itertools : structures et itération ;
- math, statistics et decimal : calculs ;
- logging : journaux ;
- unittest : tests intégrés ;
- subprocess : lancement de programmes externes avec précautions ;
- urllib : accès réseau de base ;
- asyncio, threading et multiprocessing : concurrence.

## 15. Tests, débogage et qualité

Écrire des fonctions testables, limiter les effets de bord et séparer le cœur métier de l'interface. Un test unitaire vérifie une petite unité ; un test d'intégration vérifie la collaboration de plusieurs composants.

Tester les cas normaux, les limites, les entrées invalides, les collections vides et les erreurs attendues. Utiliser des assertions précises et des noms de tests qui décrivent le comportement.

Le débogage consiste à reproduire le défaut, lire la trace complète, isoler le cas minimal, formuler une hypothèse, vérifier cette hypothèse et ajouter un test de non-régression. Ne pas corriger au hasard uniquement la dernière ligne du traceback.

PEP 8 donne des conventions de style. Un formateur et un linter peuvent automatiser une partie de la cohérence. La lisibilité et la simplicité priment sur les astuces compactes.

## 16. Performance et complexité

La notation O(n) décrit comment le coût évolue avec la taille de l'entrée. Un double parcours imbriqué peut être O(n²), tandis qu'un accès moyen à un dictionnaire est souvent O(1).

Utiliser timeit pour mesurer une petite opération et cProfile pour profiler un programme. Optimiser le véritable point lent, pas une partie choisie au hasard. L'utilisation de générateurs et d'algorithmes adaptés peut réduire la mémoire et le temps.

## 17. Sécurité et robustesse

Valider les entrées externes. Ne pas construire une commande shell en concaténant des données utilisateur. Éviter eval et exec sur des entrées non fiables. Ne pas désactiver la validation TLS. Protéger les secrets dans des variables d'environnement ou un gestionnaire adapté, jamais dans le dépôt Git. Restreindre les chemins d'accès aux fichiers pour éviter les traversées de répertoires. Mettre à jour les dépendances et vérifier leurs sources.

## 18. Méthode de réponse attendue de SUN pour Python

Quand l'élève pose une question :
1. Identifier son niveau, son objectif et le langage ou la version s'ils sont connus.
2. Reformuler brièvement le problème si nécessaire, sans faire répéter les informations déjà fournies.
3. Expliquer le concept avec des mots accessibles.
4. Montrer un exemple minimal puis, si utile, un exemple plus réaliste.
5. Expliquer chaque partie importante du code.
6. Indiquer comment exécuter et tester le code.
7. Contrôler les cas limites et les erreurs possibles.
8. Si du code est fourni, ne pas inventer des API ou bibliothèques. Signaler les dépendances et hypothèses.
9. Si la question concerne une version récente, vérifier la documentation officielle correspondante.
10. Ne pas prétendre avoir exécuté le code si aucun interpréteur n'a réellement été utilisé.

## Références principales

- Documentation Python en français : https://docs.python.org/fr/3/
- Tutoriel officiel : https://docs.python.org/fr/3/tutorial/
- Historique et licences : https://docs.python.org/fr/3/license.html
- PEP 8 : https://peps.python.org/pep-0008/
- Tests unittest : https://docs.python.org/fr/3/library/unittest.html
- Documentation Python 3.15 : https://docs.python.org/3.15/
