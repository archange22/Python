# Leçon 02 — Les variables et les types de données

**Parcours :** Python Facile  
**Niveau :** Débutant  
**Environnement :** Pydroid 3 sur Android  
**Durée indicative :** 40 à 55 minutes

## Objectifs

À la fin de cette leçon, tu sauras :
- expliquer ce qu'est une variable ;
- créer une variable et lui donner une valeur ;
- choisir un nom de variable correct ;
- reconnaître les types `str`, `int`, `float` et `bool` ;
- vérifier le type d'une valeur avec `type()` ;
- utiliser des variables dans des affichages et des calculs ;
- afficher une phrase contenant une variable avec une f-string.

## 1. Qu'est-ce qu'une variable ?

Une variable est un nom associé à une valeur. Elle permet de conserver une information pour la réutiliser plus tard dans le programme.

Imagine une boîte étiquetée : le nom de la boîte est le nom de la variable et ce qu'elle contient est sa valeur.

Syntaxe :

```python
pseudo = "Nova"
```

- `pseudo` est le nom de la variable ;
- `=` affecte une valeur à la variable ;
- `"Nova"` est la valeur enregistrée.

Le signe `=` signifie ici « donner cette valeur à cette variable ». Ce n'est pas le signe qui sert à vérifier si deux valeurs sont égales.

## 2. Créer et utiliser une variable

Dans Pydroid 3, écris ce programme :

```python
# Je mémorise deux informations
pseudo = "Nova"
niveau = 1

# J'affiche les valeurs
print(pseudo)
print(niveau)
```

Résultat :

```text
Nova
1
```

Une variable peut être utilisée plusieurs fois. Si sa valeur change, les utilisations suivantes prennent en compte la nouvelle valeur.

```python
score = 10
print(score)

score = 25
print(score)
```

Résultat :

```text
10
25
```

La deuxième affectation remplace la valeur précédente de `score`.

## 3. Bien choisir le nom d'une variable

Un nom de variable doit respecter quelques règles :

- il peut contenir des lettres, des chiffres et le caractère `_` ;
- il ne doit pas commencer par un chiffre ;
- il ne doit pas contenir d'espace ;
- il ne faut pas utiliser un mot réservé de Python comme `if`, `for` ou `class` ;
- les majuscules et minuscules sont différentes : `score` et `Score` sont deux noms distincts.

Exemples :

```python
nom_joueur = "Alex"   # Correct
niveau2 = 3           # Correct
score_total = 150     # Correct

# 2joueurs = 2         # Incorrect : commence par un chiffre
# nom joueur = "Alex"  # Incorrect : contient un espace
```

Choisis des noms qui expliquent le contenu. `age` est plus clair que `x` si la variable contient un âge.

## 4. Les principaux types de données

Le type indique la nature d'une valeur. Pour commencer, retiens ces quatre types.

### A. Le texte : `str`

`str` signifie *string* (chaîne de caractères). Un texte est écrit entre guillemets.

```python
prenom = "Maya"
jeu = 'Minecraft'
```

Même un nombre entre guillemets est du texte :

```python
code = "2026"
```

### B. Le nombre entier : `int`

`int` représente un nombre entier, sans partie décimale.

```python
age = 15
score = 250
temperature = -2
```

### C. Le nombre décimal : `float`

`float` représente un nombre qui peut avoir une partie décimale. En Python, on utilise un point et non une virgule.

```python
prix = 2.5
moyenne = 14.75
```

Écris `14.75`, pas `14,75`.

### D. Le booléen : `bool`

Un booléen ne peut avoir que deux valeurs : `True` (vrai) ou `False` (faux). Attention : les premières lettres sont en majuscule.

```python
est_connecte = True
a_termine = False
```

## 5. Vérifier le type avec type()

La fonction `type()` indique le type d'une valeur ou d'une variable.

```python
pseudo = "Nova"
age = 15
moyenne = 14.5
est_pret = True

print(type(pseudo))
print(type(age))
print(type(moyenne))
print(type(est_pret))
```

Résultat :

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
```

Tu n'as pas besoin de mémoriser tout le texte affiché : retiens surtout `str`, `int`, `float` et `bool`.

## 6. Utiliser des variables dans un calcul

Les variables contenant des nombres peuvent servir dans les opérations mathématiques.

```python
# Deux nombres sont mémorisés
nombre_a = 12
nombre_b = 4

print(nombre_a + nombre_b)  # Addition : 16
print(nombre_a - nombre_b)  # Soustraction : 8
print(nombre_a * nombre_b)  # Multiplication : 48
print(nombre_a / nombre_b)  # Division : 3.0
```

Quelques opérateurs utiles :

| Opérateur | Signification | Exemple |
|---|---|---|
| `+` | Addition | `5 + 2` donne `7` |
| `-` | Soustraction | `5 - 2` donne `3` |
| `*` | Multiplication | `5 * 2` donne `10` |
| `/` | Division | `5 / 2` donne `2.5` |
| `//` | Division entière | `5 // 2` donne `2` |
| `%` | Reste de la division | `5 % 2` donne `1` |
| `**` | Puissance | `5 ** 2` donne `25` |

## 7. Afficher une variable dans une phrase

Une f-string permet d'insérer directement une variable dans un texte. Elle commence par la lettre `f` avant les guillemets. La variable est placée entre accolades.

```python
pseudo = "Nova"
score = 120

print(f"Joueur : {pseudo}")
print(f"Score : {score} points")
```

Résultat :

```text
Joueur : Nova
Score : 120 points
```

C'est souvent plus lisible que de découper une phrase en plusieurs morceaux.

## 8. Erreurs fréquentes

| Erreur | Pourquoi ? | Correction |
|---|---|---|
| `2nom = "Ali"` | Le nom commence par un chiffre. | `nom2 = "Ali"` |
| `age = "15"` puis `age + 1` | `"15"` est du texte, pas un entier. | Utiliser `15` pour un calcul numérique. |
| `pret = true` | Le booléen Python s'écrit avec une majuscule. | `pret = True` |
| `prix = 2,5` | La virgule ne crée pas un nombre décimal Python. | `prix = 2.5` |
| `print(Pseudo)` | Le nom ne correspond pas à `pseudo`. | Respecter exactement les majuscules. |

## 9. Exercices progressifs

Fais les exercices dans Pydroid 3. Essaie avant de regarder les corrections à la fin.

### Exercice 1 — Mes premières variables

Crée trois variables :
- `pseudo` contenant un texte ;
- `age` contenant un entier ;
- `ville` contenant un texte.

Affiche chaque variable avec `print()`.

### Exercice 2 — Reconnaître les types

Crée les variables suivantes, puis affiche leur type avec `type()` :
- `nom = "Lina"`
- `points = 80`
- `moyenne = 12.5`
- `est_actif = True`

Indique dans ton cahier le type de chacune.

### Exercice 3 — Calcul avec des variables

Crée `a = 18` et `b = 6`. Affiche :
- leur somme ;
- leur différence ;
- leur produit ;
- leur division.

### Exercice 4 — Modifier une valeur

Crée `vies = 3`. Affiche la valeur, remplace-la par `2`, puis affiche-la encore.

Explique pourquoi les deux affichages sont différents.

### Exercice 5 — Une phrase personnalisée

Crée `pseudo` et `score`, puis affiche une phrase avec une f-string, par exemple : « Nova a obtenu 120 points. »

## 10. Mini-défi — Carte de joueur

Crée un petit programme qui affiche une carte de joueur contenant :
- un pseudo ;
- un niveau ;
- un score ;
- un statut de connexion (`True` ou `False`) ;
- le résultat d'un calcul qui ajoute 50 points au score.

Utilise au moins quatre variables et deux commentaires. Présente les informations avec des f-strings.

## 11. Corrigés — À consulter après les essais

### Correction de l'exercice 1

```python
pseudo = "Nova"
age = 15
ville = "Abidjan"

print(pseudo)
print(age)
print(ville)
```

Les valeurs personnelles peuvent être différentes.

### Correction de l'exercice 2

```python
nom = "Lina"
points = 80
moyenne = 12.5
est_actif = True

print(type(nom))       # str
print(type(points))    # int
print(type(moyenne))   # float
print(type(est_actif)) # bool
```

### Correction de l'exercice 3

```python
a = 18
b = 6

print(a + b)  # 24
print(a - b)  # 12
print(a * b)  # 108
print(a / b)  # 3.0
```

### Correction de l'exercice 4

```python
vies = 3
print(vies)

vies = 2
print(vies)
```

La variable reçoit d'abord la valeur `3`, puis la nouvelle valeur `2`. Le deuxième affichage utilise la valeur la plus récente.

### Correction de l'exercice 5

```python
pseudo = "Nova"
score = 120

print(f"{pseudo} a obtenu {score} points.")
```

### Exemple de mini-défi

```python
# Informations du joueur
pseudo = "Nova"
niveau = 2
score = 120
est_connecte = True

# Bonus de points
nouveau_score = score + 50

print("=== CARTE DE JOUEUR ===")
print(f"Pseudo : {pseudo}")
print(f"Niveau : {niveau}")
print(f"Connecté : {est_connecte}")
print(f"Score actuel : {score}")
print(f"Score après bonus : {nouveau_score}")
```

## 12. Vérification des acquis

Avant de passer à la leçon 03, vérifie que tu peux :

1. expliquer ce qu'est une variable ;
2. créer une variable avec `=` ;
3. donner un nom valide à une variable ;
4. distinguer `str`, `int`, `float` et `bool` ;
5. vérifier un type avec `type()` ;
6. effectuer un calcul avec deux variables ;
7. afficher une variable dans une phrase avec une f-string.

**À retenir :** une variable associe un nom à une valeur. Le type décrit la nature de cette valeur. Les types de base à connaître sont `str`, `int`, `float` et `bool`.

---

*Python Facile — Leçon 02. Exemples conçus pour Pydroid 3 sur Android.*
