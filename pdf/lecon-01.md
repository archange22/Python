# Leçon 01 — Découvrir Python et écrire ses premières instructions

**Parcours :** Python Facile  
**Niveau :** Débutant  
**Environnement :** Pydroid 3 sur Android  
**Durée indicative :** 35 à 50 minutes

## Objectifs

À la fin de cette leçon, tu sauras :
- expliquer à quoi sert Python ;
- lancer un programme dans Pydroid 3 ;
- reconnaître une instruction et l'ordre d'exécution ;
- afficher du texte et des nombres avec `print()` ;
- écrire des commentaires avec `#` ;
- repérer quelques erreurs simples.

## 1. Qu'est-ce que Python ?

Python est un langage de programmation. Il permet de donner des instructions à un ordinateur pour automatiser des tâches, faire des calculs, créer des jeux, analyser des données ou développer des applications.

Un programme est une suite d'instructions que l'ordinateur exécute. En général, Python lit les instructions de haut en bas.

## 2. Préparer Pydroid 3

1. Ouvre Pydroid 3 sur ton téléphone.
2. Ouvre l'éditeur de code.
3. Si un ancien code est présent, sélectionne-le et remplace-le pour cet exercice.
4. Écris le programme ci-dessous.
5. Appuie sur le bouton d'exécution (▶).
6. Lis le résultat dans la console.

Aucune connexion Internet ni installation supplémentaire n'est nécessaire pour ces exemples.

## 3. Première instruction : print()

La fonction intégrée `print()` affiche une information dans la console.

Syntaxe :

```python
print("Bonjour !")
```

Résultat :

```text
Bonjour !
```

Les parenthèses contiennent ce que l'on veut afficher. Pour afficher du texte, on l'écrit entre guillemets simples ou doubles.

Exemples :

```python
print("Je commence Python.")
print('J'apprends avec Pydroid 3.')
print(2026)
print(7 + 5)
```

Résultat :

```text
Je commence Python.
J'apprends avec Pydroid 3.
2026
12
```

Python calcule ici `7 + 5`, puis affiche le résultat. Il ne faut pas mettre de guillemets autour d'un calcul que l'on veut réellement effectuer.

## 4. Plusieurs instructions

Chaque instruction est exécutée dans l'ordre où elle apparaît.

```python
print("Étape 1")
print("Étape 2")
print("Étape 3")
```

La console affiche les trois lignes dans le même ordre.

## 5. Les commentaires

Un commentaire est une note destinée aux personnes qui lisent le code. Python ne l'exécute pas.

On commence un commentaire avec le symbole `#`.

```python
# Mon premier programme
print("Salut !")  # Affiche un message
```

Tout ce qui suit `#` sur la même ligne est ignoré par Python.

Les commentaires servent à expliquer une partie du programme ou à noter une idée. Ils ne remplacent pas les instructions.

## 6. Texte et nombres : ne pas les confondre

```python
print("15")
print(15)
print("15 + 5")
print(15 + 5)
```

Résultat :

```text
15
15
15 + 5
20
```

- `"15"` est du texte.
- `15` est un nombre entier.
- `"15 + 5"` est une suite de caractères affichée telle quelle.
- `15 + 5` est un calcul.

Nous étudierons les types de données plus en détail dans une prochaine leçon.

## 7. Erreurs fréquentes

| Erreur | Pourquoi ? | Correction |
|---|---|---|
| `print("Bonjour)` | Le guillemet final manque. | `print("Bonjour")` |
| `Print("Salut")` | Python distingue majuscules et minuscules. | `print("Salut")` |
| `print "Salut"` | Les parenthèses sont nécessaires ici. | `print("Salut")` |
| `print(7 + )` | Le calcul est incomplet. | `print(7 + 2)` |

Une erreur de syntaxe empêche généralement le programme de démarrer. Lis le message d'erreur et vérifie d'abord la ligne indiquée, les parenthèses et les guillemets.

## 8. Exercices progressifs

Essaie chaque exercice dans Pydroid 3 avant de consulter les corrections.

### Exercice 1 — Un message
Écris un programme qui affiche :
- Bonjour !
- Je m'appelle [ton pseudo].
- J'apprends Python.

### Exercice 2 — Trois lignes
Affiche trois lignes différentes : le nom d'un jeu, ton langage de programmation préféré et le mot « Terminé ».

### Exercice 3 — Calcul simple
Écris quatre instructions `print()` pour afficher le résultat de :
- 8 + 4
- 15 - 6
- 3 * 5
- 20 / 4

### Exercice 4 — Commentaires
Ajoute un commentaire au-dessus de chaque instruction pour expliquer ce qu'elle affiche ou calcule.

## 9. Mini-défi — Ma fiche de présentation

Crée un programme qui affiche une petite fiche avec :
- un titre « MA FICHE » ;
- un pseudo ;
- ton objectif d'apprentissage ;
- le résultat d'un calcul de ton choix.

Ajoute au moins deux commentaires. Le programme doit afficher au moins cinq lignes.

## 10. Corrigés — À consulter après les essais

### Correction de l'exercice 1

```python
print("Bonjour !")
print("Je m'appelle Nova.")
print("J'apprends Python.")
```

Remplace « Nova » par le pseudo de ton choix.

### Correction de l'exercice 2

```python
print("Free Fire")
print("Python")
print("Terminé")
```

Les réponses personnelles peuvent être différentes.

### Correction de l'exercice 3

```python
print(8 + 4)
print(15 - 6)
print(3 * 5)
print(20 / 4)
```

Résultats : 12, 9, 15 et 5.0.

### Correction de l'exercice 4

```python
# Affiche une salutation
print("Bonjour")

# Affiche un nombre
print(25)

# Effectue une addition
print(10 + 5)
```

### Exemple de mini-défi

```python
# Titre de ma fiche
print("MA FICHE")

# Quelques informations
print("Pseudo : Nova")
print("Objectif : apprendre Python")
print("Niveau : débutant")

# Un petit calcul
print("Résultat :", 12 + 8)
```

Il existe plusieurs bonnes solutions. L'important est que le programme s'exécute et affiche les informations demandées.

## 11. Vérification des acquis

Tu peux passer à la leçon suivante si tu sais répondre à ces questions :

1. À quoi sert Python ?
2. Quelle fonction affiche un message dans la console ?
3. Pourquoi met-on du texte entre guillemets ?
4. Quel symbole commence un commentaire ?
5. Dans quel ordre Python exécute-t-il normalement les instructions d'un script ?

**À retenir :** `print()` affiche une information, les guillemets délimitent le texte et `#` commence un commentaire. La pratique régulière est la meilleure façon de progresser.

---
*Python Facile — Leçon 01. Exemples conçus pour Pydroid 3 sur Android.*
