# Leçon 03 — Les opérations et les expressions en Python

**Parcours :** Python Facile  
**Niveau :** Débutant  
**Environnement :** Pydroid 3 sur Android  
**Durée indicative :** 40 à 55 minutes

## Objectifs

À la fin de cette leçon, tu sauras :
- utiliser les principaux opérateurs mathématiques de Python ;
- distinguer la division classique \`/\` de la division entière \`//\` ;
- calculer un reste avec \`%\` et une puissance avec \`**\` ;
- comprendre l'ordre de priorité des opérations ;
- utiliser des parenthèses pour rendre un calcul clair ;
- effectuer des calculs à partir de variables ;
- arrondir et présenter un résultat décimal.

## 1. Préparer Pydroid 3

Ouvre Pydroid 3, crée un nouveau fichier ou efface le code de l'exercice précédent, puis écris les exemples de cette leçon. Appuie sur le bouton d'exécution et observe le résultat dans la console.

Les opérations présentées ici utilisent uniquement Python : aucune bibliothèque, connexion Internet ou installation supplémentaire n'est nécessaire.

## 2. Les quatre opérations de base

Python reconnaît les signes mathématiques suivants :

| Opérateur | Opération | Exemple | Résultat |
|---|---|---|---|
| \`+\` | Addition | \`8 + 3\` | \`11\` |
| \`-\` | Soustraction | \`8 - 3\` | \`5\` |
| \`*\` | Multiplication | \`8 * 3\` | \`24\` |
| \`/\` | Division | \`8 / 4\` | \`2.0\` |

Exemple à tester :

\`\`\`python
print(8 + 3)   # Addition : 11
print(8 - 3)   # Soustraction : 5
print(8 * 3)   # Multiplication : 24
print(8 / 4)   # Division : 2.0
\`\`\`

Attention : en Python, la multiplication s'écrit avec \`*\`, et non avec le symbole \`×\`. La division s'écrit avec \`/\`, et non avec \`÷\`.

## 3. La division classique et la division entière

L'opérateur \`/\` donne une division classique. Le résultat est généralement un nombre décimal (\`float\`), même si la division tombe juste.

\`\`\`python
print(9 / 2)   # 4.5
print(8 / 2)   # 4.0
\`\`\`

L'opérateur \`//\` donne le quotient entier : la partie décimale est écartée selon la règle de la division entière.

\`\`\`python
print(9 // 2)  # 4
print(8 // 2)  # 4
\`\`\`

À retenir :
- \`/\` : division classique ;
- \`//\` : division entière.

## 4. Le reste d'une division : %

Le symbole \`%\` calcule le reste d'une division entière.

\`\`\`python
print(10 % 3)  # 1, car 10 = 3 * 3 + 1
print(12 % 4)  # 0, car 12 est divisible par 4
\`\`\`

Le reste est utile pour vérifier si un nombre est pair ou impair :

\`\`\`python
nombre = 14

print(nombre % 2)  # 0 : le nombre est pair
\`\`\`

Si le reste de la division par 2 vaut \`0\`, le nombre est pair. Sinon, il est impair.

## 5. Les puissances : **

L'opérateur \`**\` permet d'élever un nombre à une puissance.

\`\`\`python
print(2 ** 3)  # 8 : 2 * 2 * 2
print(5 ** 2)  # 25 : 5 * 5
print(9 ** 0)  # 1
\`\`\`

Ne confonds pas \`**\` (puissance) avec \`*\` (multiplication).

## 6. L'ordre des opérations

Python respecte les priorités mathématiques habituelles. En simplifiant, les puissances sont calculées avant les multiplications et les divisions, puis viennent les additions et les soustractions.

\`\`\`python
print(2 + 3 * 4)      # 14
print((2 + 3) * 4)    # 20
\`\`\`

Dans le premier calcul, Python effectue \`3 * 4\` avant l'addition. Dans le deuxième, les parenthèses imposent de calculer \`2 + 3\` en premier.

Utilise des parenthèses lorsque tu veux imposer un ordre précis ou rendre un calcul plus facile à lire.

## 7. Calculer avec des variables

Une variable peut contenir un nombre que tu réutilises dans plusieurs opérations.

\`\`\`python
prix = 250
quantite = 3

total = prix * quantite

print(total)  # 750
\`\`\`

Tu peux ensuite modifier une variable et refaire le calcul :

\`\`\`python
prix = 250
quantite = 3
total = prix * quantite
print(total)  # 750

quantite = 5
total = prix * quantite
print(total)  # 1250
\`\`\`

L'opérateur \`+=\` ajoute une valeur à une variable existante :

\`\`\`python
score = 10
score += 5
print(score)  # 15
\`\`\`

Cette instruction est équivalente à \`score = score + 5\`.

## 8. Les nombres décimaux et l'arrondi

Un nombre décimal s'écrit avec un point en Python :

\`\`\`python
prix = 2.5
moyenne = 13.75
\`\`\`

La fonction \`round()\` permet d'arrondir un nombre :

\`\`\`python
resultat = 10 / 3

print(resultat)
print(round(resultat, 2))  # Arrondi à 2 chiffres après le point
\`\`\`

Tu peux aussi contrôler l'affichage avec une f-string :

\`\`\`python
prix = 12.5
print(f"Prix : {prix:.2f}")
\`\`\`

Le format \`:.2f\` demande un affichage avec deux chiffres après le point. Il ne transforme pas nécessairement la variable d'origine : il règle la présentation du résultat.

## 9. Erreurs fréquentes

| Erreur | Pourquoi ? | Correction |
|---|---|---|
| \`8 x 3\` | \`x\` n'est pas un opérateur de multiplication. | \`8 * 3\` |
| \`10 / 0\` | On ne peut pas diviser par zéro. | Vérifier le diviseur avant le calcul. |
| \`prix = 2,5\` | La virgule ne représente pas un décimal Python. | \`prix = 2.5\` |
| \`print("5" + 2)\` | On mélange du texte et un entier. | Utiliser \`5 + 2\` ou convertir la valeur. |
| \`2 + 3 * 4\` interprété comme 20 | La multiplication est prioritaire. | Écrire \`(2 + 3) * 4\` si c'est le calcul voulu. |

Une erreur \`ZeroDivisionError\` apparaît si le programme tente une division par zéro. Une erreur \`TypeError\` peut apparaître lorsque des types incompatibles sont utilisés ensemble.

## 10. Exercices progressifs

Essaie les exercices dans Pydroid 3 avant de consulter les corrections.

### Exercice 1 — Les opérations

Écris quatre instructions pour afficher :
- \`17 + 5\`
- \`17 - 5\`
- \`17 * 5\`
- \`17 / 5\`

### Exercice 2 — Comprendre les divisions

Sans exécuter le code, prédis les résultats, puis vérifie-les dans Pydroid 3 :

\`\`\`python
print(11 / 2)
print(11 // 2)
print(11 % 2)
\`\`\`

Explique la différence entre les trois résultats.

### Exercice 3 — Priorités

Calcule puis affiche :
- \`4 + 2 * 5\`
- \`(4 + 2) * 5\`
- \`3 ** 2 + 1\`

### Exercice 4 — Variables

Crée \`prix = 1200\` et \`quantite = 4\`. Calcule le total, puis affiche-le dans une phrase avec une f-string.

### Exercice 5 — Pair ou impair

Crée une variable \`nombre\`. Affiche le reste de sa division par 2. Détermine ensuite si le nombre est pair ou impair en observant ce reste.

## 11. Mini-défi — Calculateur de prix

Crée un programme qui :
1. mémorise le prix d'un article ;
2. mémorise la quantité achetée ;
3. calcule le sous-total ;
4. calcule une remise de 10 % ;
5. calcule le prix final ;
6. affiche le sous-total, la remise et le prix final.

Utilise au moins trois variables et des f-strings. Pour calculer 10 % d'un montant, multiplie ce montant par \`0.10\`.

## 12. Corrigés — À consulter après les essais

### Correction de l'exercice 1

\`\`\`python
print(17 + 5)  # 22
print(17 - 5)  # 12
print(17 * 5)  # 85
print(17 / 5)  # 3.4
\`\`\`

### Correction de l'exercice 2

\`\`\`python
print(11 / 2)   # 5.5
print(11 // 2)  # 5
print(11 % 2)   # 1
\`\`\`

\`/\` donne le résultat de la division classique, \`//\` donne le quotient entier et \`%\` donne le reste.

### Correction de l'exercice 3

\`\`\`python
print(4 + 2 * 5)     # 14
print((4 + 2) * 5)   # 30
print(3 ** 2 + 1)    # 10
\`\`\`

### Correction de l'exercice 4

\`\`\`python
prix = 1200
quantite = 4
total = prix * quantite

print(f"Total : {total} FCFA")
\`\`\`

### Exemple de correction de l'exercice 5

\`\`\`python
nombre = 18
reste = nombre % 2

print("Reste :", reste)

if reste == 0:
    print("Le nombre est pair.")
else:
    print("Le nombre est impair.")
\`\`\`

Cet exemple utilise \`if\` et \`else\`, qui seront étudiés plus en détail dans une prochaine leçon. Pour cet exercice, tu peux aussi simplement observer si le reste vaut \`0\`.

### Exemple de mini-défi

\`\`\`python
prix = 1500
quantite = 3

sous_total = prix * quantite
remise = sous_total * 0.10
prix_final = sous_total - remise

print(f"Sous-total : {sous_total:.2f} FCFA")
print(f"Remise : {remise:.2f} FCFA")
print(f"Prix final : {prix_final:.2f} FCFA")
\`\`\`

Résultats attendus : sous-total de 4500 FCFA, remise de 450 FCFA et prix final de 4050 FCFA.

## 13. Vérification des acquis

Avant de passer à la leçon 04, vérifie que tu peux :

1. utiliser \`+\`, \`-\`, \`*\` et \`/\` ;
2. expliquer la différence entre \`/\` et \`//\` ;
3. calculer un reste avec \`%\` ;
4. calculer une puissance avec \`**\` ;
5. prévoir l'ordre des opérations ;
6. utiliser des parenthèses ;
7. calculer avec des variables ;
8. arrondir un résultat avec \`round()\`.

**À retenir :** Python utilise des opérateurs précis pour les calculs. Les parenthèses permettent de maîtriser l'ordre des opérations. Les variables rendent les calculs réutilisables.

---

*Python Facile — Leçon 03. Exemples conçus pour Pydroid 3 sur Android.*
