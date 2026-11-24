# Compléments Python : modules, fichiers et outils

## Environnements virtuels avec venv
Un environnement virtuel isole les bibliothèques d'un projet afin qu'elles ne modifient pas les autres projets Python. La commande `python -m venv .venv` crée un environnement nommé .venv ; après son activation, les installations avec pip restent associées à ce projet.

## Installer et mettre à jour les bibliothèques
Le gestionnaire pip installe les paquets Python. Utiliser `python -m pip install nom_du_paquet` associe clairement pip à l'interpréteur choisi. Pour examiner les paquets installés, utiliser `python -m pip list`. Vérifier la documentation et la compatibilité avant d'ajouter une dépendance.

## Modules et importations
Un module est un fichier Python réutilisable. L'instruction `import math` donne accès aux fonctions du module math, par exemple `math.sqrt(25)`. Regrouper le code par responsabilités rend un projet plus facile à comprendre et à tester. Éviter de nommer un fichier comme un module standard, par exemple random.py ou json.py.

## Lire et écrire des fichiers
La construction `with open("notes.txt", "r", encoding="utf-8") as fichier` ouvre un fichier texte et le ferme automatiquement à la fin du bloc. Le mode r sert à lire, w à remplacer le contenu et a à ajouter à la fin. Vérifier le chemin et gérer les erreurs possibles, notamment FileNotFoundError et PermissionError.

## Enregistrer des données au format JSON
Le module standard json transforme les objets Python simples en texte JSON et permet de les relire. `json.dump(donnees, fichier, ensure_ascii=False, indent=2)` écrit des données lisibles dans un fichier ; `json.load(fichier)` les recharge. Ne pas enregistrer de mot de passe, de jeton privé ou de conversation personnelle dans un fichier d'exemple.

## Comprendre et traiter les exceptions
Une exception signale qu'une opération n'a pas pu être terminée normalement. Un bloc try contient l'opération à risque et except traite seulement les erreurs attendues, par exemple ValueError lors d'une conversion avec int(). Éviter un except trop général qui cacherait un vrai défaut du programme ; afficher un message clair et conserver une trace utile pour le débogage.

## Vérifier un programme avec des tests
Un test vérifie un comportement précis à partir d'une entrée et d'un résultat attendu. Commencer par les cas normaux, puis tester les valeurs vides, incorrectes et les limites. Le module unittest est inclus dans Python. Les tests de non-régression servent à confirmer qu'une correction ne casse pas une fonction qui marchait déjà.

## Références Python
La documentation officielle contient le tutoriel, la référence du langage, la bibliothèque standard, les guides HOWTO et les consignes d'installation des paquets. Ces fiches sont un complément pédagogique en français ; consulter la documentation officielle pour les détails propres à la version installée.
Référence : https://docs.python.org/3/
Référence : https://docs.python.org/3/tutorial/
Référence : https://docs.python.org/3/library/venv.html
