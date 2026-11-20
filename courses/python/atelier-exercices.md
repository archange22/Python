# Python — Banque d'exercices progressifs et de tests

Ces exercices sont originaux et destinés à entraîner l'explication, l'analyse et la vérification de code. SUN doit demander le niveau souhaité lorsque cela change la difficulté. Il doit proposer des indices avant la solution complète, sauf demande contraire.

## Niveau 1 — Fondamentaux

### Exercice 1 : calculer une moyenne
Écrire une fonction qui reçoit une liste de notes et renvoie la moyenne. Que doit-elle faire si la liste est vide ?

Tests attendus :
- [10, 14, 16] donne 13.333333333333334 environ ;
- [5] donne 5 ;
- [] déclenche une erreur clairement expliquée.

### Exercice 2 : classifier une note
Écrire une fonction qui classe une note : « Très bien » à partir de 16, « Bien » à partir de 14, « Assez bien » à partir de 12, « Passable » à partir de 10, sinon « Insuffisant ». Contrôler les valeurs hors de l'intervalle 0 à 20.

Tests attendus : 18, 15, 13, 10, 7 et -1.

### Exercice 3 : compter les mots
Écrire une fonction qui reçoit un texte et renvoie un dictionnaire contenant le nombre d'occurrences de chaque mot. Définir clairement la règle de découpage et la gestion des majuscules.

Tests attendus : « Python est utile et Python est lisible » doit compter python deux fois et est deux fois.

## Niveau 2 — Collections et fonctions

### Exercice 4 : retirer les doublons
Créer une fonction qui retire les doublons d'une liste tout en gardant l'ordre de première apparition.

Tests attendus : [3, 1, 3, 2, 1] devient [3, 1, 2].

### Exercice 5 : regrouper des notes
Recevoir un dictionnaire élève -> liste de notes et construire un résultat contenant la moyenne de chaque élève. Gérer une liste de notes vide sans planter tout le traitement.

### Exercice 6 : analyser des fichiers
Écrire une fonction qui lit un fichier texte UTF-8 et compte les lignes, les mots et les caractères. Traiter proprement le cas où le fichier n'existe pas.

## Niveau 3 — Conception et robustesse

### Exercice 7 : gestionnaire de tâches
Créer une petite classe Tache avec un titre, un état terminé ou non, et une méthode terminer. Ajouter une collection permettant d'ajouter, lister et supprimer une tâche. Vérifier les titres vides et les identifiants inconnus.

### Exercice 8 : conversion CSV vers JSON
Lire un CSV d'étudiants, vérifier la présence des colonnes obligatoires, convertir les enregistrements puis écrire un JSON UTF-8. Les erreurs doivent désigner la ligne ou le champ concerné.

### Exercice 9 : pagination d'un générateur
Créer un générateur qui produit les nombres d'une plage sans construire une liste complète. Écrire ensuite une fonction qui récupère une page de taille donnée.

### Exercice 10 : tests d'une API métier
Créer une fonction qui ajoute un produit à un panier. Le prix et la quantité doivent être valides. Écrire des tests pour le cas normal, le prix négatif, la quantité nulle et le panier vide.

## Niveau 4 — Avancé

### Exercice 11 : journalisation
Créer un programme qui enregistre les actions dans un journal avec date, niveau et message. Distinguer une information, un avertissement et une erreur.

### Exercice 12 : appels concurrents
Comparer une version séquentielle et une version asynchrone d'une tâche qui attend plusieurs réponses réseau simulées. Expliquer pourquoi asyncio peut aider pour l'attente mais pas nécessairement pour un calcul CPU intensif.

### Exercice 13 : cache avec expiration
Créer un cache clé-valeur avec une durée de validité. Injecter une horloge de test afin de vérifier les expirations sans attendre réellement.

### Exercice 14 : validation de configuration
Lire un fichier JSON de configuration, vérifier le type de chaque champ, produire des messages d'erreur précis et ne pas exécuter de code contenu dans le fichier.

### Exercice 15 : profilage
Créer deux algorithmes qui recherchent des doublons, mesurer leur temps sur plusieurs tailles d'entrée et expliquer la différence de complexité. Les résultats doivent être reproductibles.

## Grille de vérification pour SUN

Pour chaque réponse de programmation, examiner :
- la syntaxe et l'indentation ;
- le type et la forme des valeurs retournées ;
- les entrées vides et invalides ;
- les cas limites ;
- les erreurs et exceptions ;
- la complexité temporelle et mémoire si elle est pertinente ;
- la lisibilité et les noms ;
- la présence de tests reproductibles ;
- la cohérence entre les tests annoncés et le résultat prétendu.

Une réponse correcte doit distinguer un exemple illustratif d'un code réellement exécuté. Un test non exécuté doit être présenté comme un test à lancer, pas comme un résultat vérifié.

## Format conseillé pour une correction pédagogique

1. Résumer l'objectif.
2. Donner un indice sur la prochaine étape.
3. Expliquer la notion utilisée.
4. Présenter une solution lisible.
5. Décrire les tests et leurs résultats attendus.
6. Montrer une erreur fréquente et sa correction.
7. Proposer une variante légèrement plus difficile.
