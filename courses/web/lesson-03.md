# Création de sites Web — Leçon 03 : CSS, sélecteurs, couleurs et mise en forme

**Parcours :** Création de sites Web  
**Numéro :** 03  
**Niveau :** Débutant  
**Durée indicative :** 65 à 85 minutes  
**Matériel :** Téléphone ou ordinateur, éditeur de texte et navigateur.  
**Prérequis :** Leçons 01 et 02 : HTML, titres, paragraphes, listes, liens, images et éléments sémantiques.

## 1. Objectifs et prérequis

HTML décrit le contenu et sa structure. CSS contrôle son apparence : couleurs, tailles, espacements, bordures et organisation visuelle.

À la fin, tu sauras :
- expliquer une règle CSS ;
- relier un fichier CSS à une page HTML ;
- utiliser des sélecteurs ;
- comprendre la cascade et la spécificité ;
- choisir couleurs et unités ;
- modifier les polices et espacements ;
- comprendre le modèle de boîte ;
- construire une carte lisible sur téléphone.

Un navigateur moderne suffit. Aucun service payant n'est nécessaire.

## 2. À quoi sert CSS ?

CSS signifie Cascading Style Sheets, ou feuilles de style en cascade. Il décrit comment le navigateur doit présenter les éléments HTML.

Analogie : HTML est le plan d'une maison. Il indique les pièces et leur fonction. CSS correspond à la décoration et à l'aménagement : couleurs, tailles, espaces et disposition.

Une règle comporte un sélecteur, puis des déclarations. Chaque déclaration contient une propriété et une valeur.

~~~css
p {
    color: navy;
    font-size: 18px;
}
~~~

Le sélecteur p cible les paragraphes. color définit la couleur du texte et font-size sa taille. Une déclaration se termine par un point-virgule. Les accolades entourent le bloc.

## 3. Relier CSS à HTML

Dans le dossier du site, crée index.html et style.css.

~~~text
mon-site/
    index.html
    style.css
~~~

Dans head, ajoute :

~~~html
<link rel="stylesheet" href="style.css">
~~~

Exemple :

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ma page stylisée</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Bienvenue</h1>
  <p>Ma page possède une feuille de style.</p>
</body>
</html>
~~~

Le chemin href doit correspondre au nom réel du fichier. Si le CSS est dans un dossier css, le chemin devient par exemple css/style.css.

On peut écrire du CSS dans un bloc style dans head pour un test rapide. Un fichier séparé est toutefois plus simple à maintenir lorsque le projet grandit.

## 4. Les sélecteurs de base

Un sélecteur détermine les éléments auxquels une règle s'applique.

Sélecteur d'élément :

~~~css
p {
    color: #333333;
}
~~~

Sélecteur de classe. HTML :

~~~html
<p class="important">À retenir.</p>
~~~

CSS :

~~~css
.important {
    font-weight: bold;
}
~~~

Le point indique une classe. Plusieurs éléments peuvent partager la même classe.

Sélecteur d'identifiant :

~~~html
<section id="presentation">...</section>
~~~

~~~css
#presentation {
    background-color: #f4eee8;
}
~~~

Le symbole # cible un id. Un identifiant doit être unique dans le document. Pour des styles réutilisables, préfère généralement les classes.

## 5. Combiner et grouper les sélecteurs

Les sélecteurs peuvent être combinés pour cibler plus précisément.

~~~css
nav a {
    color: #8a3d16;
}

.card p {
    line-height: 1.6;
}
~~~

La première règle cible les liens situés dans nav. La deuxième cible les paragraphes dans un élément ayant la classe card.

On peut grouper des sélecteurs :

~~~css
h1, h2, h3 {
    font-family: Arial, sans-serif;
}
~~~

La même déclaration s'applique aux trois niveaux de titres. Évite les sélecteurs trop complexes au début. Une classe bien nommée est souvent plus facile à comprendre et à réutiliser.

## 6. Comprendre la cascade et la spécificité

Plusieurs règles peuvent viser le même élément. Le navigateur détermine quelle déclaration appliquer selon l'importance, la spécificité et l'ordre dans la cascade.

~~~css
p {
    color: black;
}

.important {
    color: darkred;
}
~~~

Si un paragraphe possède la classe important, la règle de classe est généralement plus spécifique que le sélecteur d'élément.

Lorsque deux règles de même spécificité définissent la même propriété, celle placée plus tard peut l'emporter.

Évite de résoudre chaque conflit avec !important. Cherche d'abord quelle règle cible l'élément et pourquoi. Des styles trop spécifiques rendent les modifications futures difficiles.

## 7. Choisir des couleurs lisibles

CSS accepte des noms de couleurs, des valeurs hexadécimales et des fonctions comme rgb().

~~~css
h1 {
    color: darkslateblue;
}

p {
    color: #333333;
}

.card {
    background-color: rgb(245, 240, 235);
}
~~~

Une valeur hexadécimale commence par # et décrit les composantes rouge, verte et bleue. rgb() utilise les mêmes composantes.

Le contraste entre le texte et le fond est essentiel. Un gris clair sur blanc peut être difficile à lire. Une couleur jolie n'est pas forcément accessible.

Bonnes habitudes :
- utiliser un texte foncé sur fond clair ou l'inverse ;
- ne pas transmettre une information uniquement par la couleur ;
- vérifier le contraste des petits textes ;
- garder une palette limitée ;
- tester avec une luminosité d'écran faible.

## 8. Polices et lisibilité

font-family définit la famille de polices. Prévois des polices de secours.

~~~css
body {
    font-family: Arial, Helvetica, sans-serif;
}

h1 {
    font-size: 2rem;
    font-weight: 700;
}

p {
    line-height: 1.6;
}
~~~

font-size contrôle la taille. font-weight contrôle l'épaisseur. line-height contrôle la hauteur de ligne.

Unités courantes :
- px : pixels CSS ;
- rem : unité relative à la taille de police racine ;
- % : proportion d'une valeur de référence ;
- em : unité relative à la taille de police de l'élément ou de son contexte.

rem facilite souvent une mise à l'échelle cohérente. Ne réduis pas trop le texte pour faire tenir beaucoup d'informations sur un petit écran.

## 9. Marges et modèle de boîte

Un élément peut être compris comme une boîte composée de plusieurs zones :
- content : contenu ;
- padding : espace intérieur ;
- border : bordure ;
- margin : espace extérieur.

~~~css
.card {
    margin: 16px;
    padding: 20px;
    border: 1px solid #e2d5ca;
}
~~~

padding éloigne le texte de la bordure. margin sépare la carte des autres éléments. border dessine le contour.

Pour rendre les dimensions plus prévisibles :

~~~css
* {
    box-sizing: border-box;
}
~~~

Avec border-box, la largeur déclarée inclut le contenu, le padding et la bordure. Une marge extérieure n'est pas un padding intérieur : choisis la bonne propriété selon le problème.

## 10. Largeurs et dimensions flexibles

Une largeur fixe peut déborder sur un téléphone. Une carte peut utiliser toute la largeur disponible tout en gardant une limite.

~~~css
.card {
    width: 100%;
    max-width: 520px;
    margin: 20px auto;
}
~~~

width: 100% utilise l'espace disponible. max-width empêche la carte de devenir trop large. Les marges automatiques la centrent lorsque l'espace le permet.

Évite de fixer une hauteur trop petite à un bloc contenant du texte. Le contenu peut grandir selon la largeur ou la taille de police.

Les unités relatives comme %, rem, vw et vh ont des usages différents. Teste sur un écran étroit avant de conclure que les dimensions sont correctes.

## 11. Construire une carte de présentation

HTML :

~~~html
<main>
  <article class="card">
    <p class="label">PROJET</p>
    <h1>Mon premier site</h1>
    <p>J'apprends à organiser une page Web.</p>
    <a class="link" href="#details">Voir les détails</a>
  </article>
</main>
~~~

CSS :

~~~css
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 24px;
    font-family: Arial, sans-serif;
    color: #28231f;
    background: #f5efe9;
}

.card {
    width: 100%;
    max-width: 520px;
    margin: 24px auto;
    padding: 24px;
    background: white;
    border: 1px solid #e5d8cd;
    border-radius: 16px;
}

.label {
    color: #a34d20;
    font-size: 0.8rem;
    font-weight: bold;
}
~~~

Le HTML décrit le contenu. Le CSS définit la palette, les espacements et les dimensions. Tu peux changer les couleurs sans réécrire la structure.

## 12. Pseudo-classes et états

Une pseudo-classe cible un état ou une position particulière.

~~~css
a:hover {
    text-decoration: underline;
}

a:focus-visible {
    outline: 3px solid #e58b45;
    outline-offset: 3px;
}
~~~

:hover s'applique lorsque le pointeur survole un élément. Sur un écran tactile, cet état peut être absent ou différent.

:focus-visible rend visible l'élément qui reçoit le focus clavier. Ne supprime pas l'indicateur de focus sans alternative claire.

D'autres pseudo-classes existent, comme :first-child ou :checked. Elles seront utiles avec les formulaires et les listes.

## 13. Débuter avec le responsive design

Responsive signifie que la présentation s'adapte à différentes tailles d'écran. Il ne suffit pas de réduire tout le contenu : il faut préserver la lisibilité.

~~~css
.card {
    padding: 24px;
}

@media (max-width: 480px) {
    .card {
        padding: 16px;
    }

    .card h1 {
        font-size: 1.6rem;
    }
}
~~~

Les règles de la media query s'appliquent lorsque la fenêtre ne dépasse pas 480 pixels CSS.

Le meta viewport dans HTML aide le navigateur mobile à adapter la largeur de la page. Teste un écran étroit, moyen et large, ainsi qu'une taille de texte augmentée.

Le responsive ne consiste pas à cacher automatiquement les informations qui ne rentrent pas. Il faut choisir une disposition qui conserve le contenu essentiel.

## 14. Erreurs fréquentes et débogage

| Problème | Cause possible | Vérification |
|---|---|---|
| Aucun style | Fichier CSS introuvable | Vérifier href |
| Une règle ne s'applique pas | Sélecteur incorrect | Comparer classe et HTML |
| Couleur inchangée | Règle plus spécifique | Examiner la cascade |
| Contenu débordant | Largeur fixe ou padding | Tester max-width et box-sizing |
| Texte illisible | Taille ou contraste faible | Augmenter taille et contraste |
| Focus invisible | Style supprimé | Ajouter :focus-visible |

Méthode :
1. enregistre HTML et CSS ;
2. recharge le navigateur ;
3. vérifie le nom et le chemin du CSS ;
4. teste une règle simple ;
5. corrige un problème à la fois.

Sur téléphone, le cache peut conserver une ancienne version. Recharge la page et vérifie le bon dossier avant de conclure que le CSS est cassé.

## 15. Exercices progressifs

**Exercice 1 :** rends les h1 bleu foncé et donne-leur une taille de 2rem.

**Exercice 2 :** ajoute une classe important à un paragraphe et rends son texte plus épais.

**Exercice 3 :** crée une carte avec 20px de padding, une bordure de 1px et une marge de 16px. Explique les différences.

**Exercice 4 :** donne à une carte une largeur de 100%, une largeur maximale de 500px et centre-la.

**Exercice 5 :** ajoute un style :focus-visible aux liens et teste avec la touche Tab.

## 16. Mini-projet : carte de profil responsive

Crée une page de profil fictive contenant un titre, une présentation, une liste de trois compétences et un lien interne.

La carte doit avoir :
- une largeur maximale ;
- une palette de deux ou trois couleurs ;
- un texte lisible ;
- un focus visible ;
- des espacements adaptés ;
- une adaptation simple sous 480 pixels.

Commence par HTML, puis ajoute CSS dans un fichier séparé. Teste sur téléphone en portrait et en paysage si possible. L'objectif est de comprendre les sélecteurs, la cascade, les couleurs, les espacements et les dimensions.

## 17. Corrigés expliqués

**Exercice 1**

~~~css
h1 {
    color: #172554;
    font-size: 2rem;
}
~~~

Le sélecteur h1 cible les titres. La couleur est hexadécimale et la taille utilise rem.

**Exercice 2**

~~~html
<p class="important">Lis attentivement cette consigne.</p>
~~~

~~~css
.important {
    font-weight: bold;
}
~~~

Le point indique une classe réutilisable.

**Exercice 3**

~~~css
.card {
    padding: 20px;
    border: 1px solid #dddddd;
    margin: 16px;
}
~~~

padding est intérieur, border dessine le contour et margin est extérieur.

**Exercice 4**

~~~css
.card {
    width: 100%;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}
~~~

La carte peut utiliser l'espace disponible sans dépasser 500px. Les marges automatiques la centrent.

**Exercice 5**

~~~css
a:focus-visible {
    outline: 3px solid #e58b45;
    outline-offset: 3px;
}
~~~

La règle rend le focus visible au clavier. Ne retire pas cet indicateur sans remplacement.

## 18. Mini-projet corrigé et fiche de révision

HTML :

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Profil de démonstration</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <article class="card">
      <p class="label">MON PROFIL</p>
      <h1>Développeur en apprentissage</h1>
      <p>Je découvre HTML et CSS sur téléphone.</p>
      <h2>Compétences</h2>
      <ul>
        <li>Structure HTML</li>
        <li>Sélecteurs CSS</li>
        <li>Mise en page</li>
      </ul>
      <a href="#details">Lire les détails</a>
    </article>
    <section id="details">
      <h2>Détails</h2>
      <p>Page de démonstration responsive.</p>
    </section>
  </main>
</body>
</html>
~~~

CSS :

~~~css
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 20px;
    font-family: Arial, sans-serif;
    color: #29231f;
    background: #f5efe9;
}

.card {
    width: 100%;
    max-width: 520px;
    margin: 20px auto;
    padding: 24px;
    border: 1px solid #e1d5ca;
    border-radius: 14px;
    background: white;
}

.label {
    color: #9b431c;
    font-weight: bold;
}

a:focus-visible {
    outline: 3px solid #e58b45;
    outline-offset: 3px;
}

@media (max-width: 480px) {
    body { padding: 12px; }
    .card { padding: 16px; }
}
~~~

| Élément | Rôle |
|---|---|
| Sélecteur | Choisit les éléments |
| Propriété | Type de style |
| Valeur | Réglage |
| Classe | Sélection réutilisable avec un point |
| ID | Identifiant ciblé avec # |
| Cascade | Détermine le style final |
| color | Couleur du texte |
| background-color | Couleur du fond |
| padding | Espace intérieur |
| border | Bordure |
| margin | Espace extérieur |
| box-sizing | Calcul des dimensions |
| @media | Règles selon l'écran |

Avant la leçon 04, vérifie que tu peux relier un CSS, cibler une classe, expliquer la cascade, créer une carte lisible et adapter les espacements à un petit écran.

**Prochaine étape :** Flexbox et les mises en page responsive avec plusieurs zones de contenu.

---

*Académique — Création de sites Web, leçon 03.*  
*©pythonschool*