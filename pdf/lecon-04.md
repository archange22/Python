# Leçon 04 — Saisir des informations avec `input()` et convertir les données

**Parcours :** Python Facile  
**Niveau :** Débutant  
**Environnement :** Pydroid 3 sur Android  
**Durée indicative :** 45 à 60 minutes

## Objectifs

À la fin de cette leçon, tu sauras :
- demander une information avec `input()` ;
- enregistrer une réponse dans une variable ;
- comprendre que `input()` renvoie toujours du texte (`str`) ;
- convertir une réponse en entier avec `int()` ;
- convertir une réponse en décimal avec `float()` ;
- convertir une valeur en texte avec `str()` ;
- utiliser les réponses dans un calcul ;
- reconnaître les erreurs de conversion fréquentes.

## 1. Préparer Pydroid 3

Ouvre Pydroid 3 et crée un nouveau fichier Python. Les exemples utilisent uniquement les fonctions intégrées à Python : aucune bibliothèque à installer et aucune connexion Internet ne sont nécessaires.

Quand le programme arrive à `input()`, la console attend une réponse. Écris-la puis valide avec la touche Entrée du clavier Android.

## 2. À quoi sert input() ?

La fonction `input()` permet au programme de poser une question et de récupérer la réponse écrite par l'utilisateur.

Syntaxe :

```python
reponse = input("Écris quelque chose : ")
```

Le texte entre guillemets est affiché. Le programme attend une réponse, puis l'enregistre dans la variable `reponse`.

Exemple :

```python
pseudo = input("Quel est ton pseudo ? ")
print(f"Bienvenue, {pseudo} !")
```

Si tu écris `Nova`, le programme affiche :

```text
Quel est ton pseudo ? Nova
Bienvenue, Nova !
```

La réponse peut être réutilisée plus tard dans le programme.

## 3. Point essentiel : input() renvoie toujours du texte

Même si l'utilisateur écrit des chiffres, `input()` renvoie une chaîne de caractères (`str`).

```python
age = input("Quel âge as-tu ? ")
print(age)
print(type(age))
```

Si tu saisis `15`, le type affiché est `str`, et non `int`. Python ne traite donc pas automatiquement cette réponse comme un nombre.

```python
nombre = input("Écris un nombre : ")
print(nombre + nombre)
```

Si tu saisis `12`, le résultat sera `1212` : Python colle deux textes ensemble. Il ne fait pas une addition mathématique.

## 4. Convertir en nombre entier avec int()

La fonction `int()` transforme un texte représentant un entier en nombre entier.

```python
age = int(input("Quel âge as-tu ? "))
age_dans_un_an = age + 1
print(f"L'année prochaine, tu auras {age_dans_un_an} ans.")
```

Si tu saisis `15`, le programme calcule `16`. `int()` convient aux entiers comme `8`, `15` ou `-3`. Une saisie comme `15.5` ne peut pas être convertie directement avec `int()`.

## 5. Convertir en nombre décimal avec float()

La fonction `float()` transforme une valeur en nombre décimal. En Python, utilise un point : saisis `12.5`, et non `12,5`.

```python
prix = float(input("Prix d'un article : "))
quantite = int(input("Quantité : "))
total = prix * quantite
print(f"Total : {total:.2f} FCFA")
```

Le prix peut être décimal, tandis que la quantité est un entier.

## 6. Convertir en texte avec str()

La fonction `str()` transforme une valeur en texte. Cela peut être utile pour construire un message.

```python
score = 250
message = "Ton score est " + str(score)
print(message)
```

Sans `str(score)`, Python ne peut pas concaténer directement un texte et un entier avec `+`.

Tu peux aussi utiliser une f-string :

```python
score = 250
print(f"Ton score est {score}.")
```

Les deux méthodes permettent d'afficher une valeur dans une phrase. La f-string est souvent plus lisible.

## 7. Résumé des conversions

- `int("15")` donne l'entier `15`.
- `float("2.5")` donne le nombre décimal `2.5`.
- `str(25)` donne le texte `"25"`.

Une conversion ne réussit que si la valeur peut être interprétée dans le type demandé.

## 8. Les erreurs fréquentes

### A. Oublier la conversion

```python
age = input("Âge : ")
print(age + 1)  # Erreur : texte + entier

# Correction :
age = int(input("Âge : "))
print(age + 1)
```

### B. Saisir un texte qui n'est pas un entier

Si tu saisis `trois` dans `int(input(...))`, Python ne peut pas convertir ce texte en entier : une erreur `ValueError` apparaît.

### C. Utiliser une virgule pour un décimal

```python
prix = float("12,5")  # Conversion non valide
prix = float("12.5")  # Conversion valide
```

### D. Confondre texte et nombre

```python
a = "10"
b = "5"
print(a + b)  # 105 : concaténation de textes

a = int("10")
b = int("5")
print(a + b)  # 15 : addition de nombres
```

À retenir : `input()` fournit du texte. Utilise `int()` ou `float()` si tu dois faire un calcul.

## 9. Exercices progressifs

Réalise les exercices dans Pydroid 3 avant de consulter les corrections.

### Exercice 1 — Demander un pseudo

Demande le pseudo de l'utilisateur avec `input()`, puis affiche un message de bienvenue avec une f-string.

### Exercice 2 — Âge dans un an

Demande l'âge, convertis la réponse en entier, puis affiche l'âge qu'il aura l'année prochaine.

### Exercice 3 — Addition de deux nombres

Demande deux nombres entiers. Convertis les deux réponses avec `int()`, puis affiche leur somme.

### Exercice 4 — Prix d'un article

Demande le prix avec `float()` et la quantité avec `int()`. Calcule et affiche le montant total.

### Exercice 5 — Conversion en texte

Crée `points = 300`. Convertis cette valeur avec `str()`, puis assemble-la avec un message en utilisant `+`.

## 10. Mini-défi — Petit calculateur de dépenses

Écris un programme qui :
1. demande le nom d'un article ;
2. demande son prix unitaire ;
3. demande la quantité achetée ;
4. calcule le total ;
5. affiche un récapitulatif clair avec des f-strings et deux chiffres après le point pour le montant.

Exemple de saisie : article `Cahier`, prix `750`, quantité `4`. Le total attendu est `3000.00 FCFA`.

## 11. Corrigés — À consulter après les essais

### Correction de l'exercice 1

```python
pseudo = input("Quel est ton pseudo ? ")
print(f"Bienvenue, {pseudo} !")
```

### Correction de l'exercice 2

```python
age = int(input("Quel âge as-tu ? "))
print(f"L'année prochaine, tu auras {age + 1} ans.")
```

### Correction de l'exercice 3

```python
nombre1 = int(input("Premier nombre : "))
nombre2 = int(input("Deuxième nombre : "))
somme = nombre1 + nombre2
print(f"Somme : {somme}")
```

### Correction de l'exercice 4

```python
prix = float(input("Prix de l'article : "))
quantite = int(input("Quantité : "))
total = prix * quantite
print(f"Montant total : {total:.2f} FCFA")
```

### Correction de l'exercice 5

```python
points = 300
points_texte = str(points)
message = "Tu as " + points_texte + " points."
print(message)
```

### Exemple de mini-défi

```python
article = input("Nom de l'article : ")
prix = float(input("Prix unitaire : "))
quantite = int(input("Quantité : "))
total = prix * quantite

print("=== RÉCAPITULATIF ===")
print(f"Article : {article}")
print(f"Prix unitaire : {prix:.2f} FCFA")
print(f"Quantité : {quantite}")
print(f"Total : {total:.2f} FCFA")
```

Avec `Cahier`, `750` et `4`, le total affiché est `3000.00 FCFA`.

## 12. Vérification des acquis

Avant de passer à la leçon 05, vérifie que tu peux :
1. demander une réponse avec `input()` et la stocker ;
2. expliquer pourquoi `input()` renvoie un `str` ;
3. convertir en entier avec `int()` ;
4. convertir en décimal avec `float()` ;
5. transformer une valeur en texte avec `str()` ;
6. utiliser une saisie convertie dans un calcul ;
7. reconnaître une erreur `ValueError` liée à une conversion invalide.

**À retenir :** `input()` récupère une réponse sous forme de texte. Pour calculer avec une saisie, convertis-la dans le type numérique adapté.

---

*Python Facile — Leçon 04. Exemples conçus pour Pydroid 3 sur Android.*