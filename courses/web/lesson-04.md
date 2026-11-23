# Création de sites Web — Leçon 04 : Flexbox et mises en page adaptatives

**Parcours :** Création de sites Web  
**Numéro :** 04  
**Niveau :** Débutant  
**Durée indicative :** 70 à 90 minutes  
**Matériel :** Téléphone ou ordinateur, éditeur de texte et navigateur moderne.  
**Prérequis :** HTML, CSS, sélecteurs, couleurs, cascade, espacements et modèle de boîte.

## Objectifs et prérequis

Flexbox organise des éléments dans une ligne ou une colonne. Il sert à construire des menus, des cartes, des barres d'actions et des mises en page qui s'adaptent à différentes tailles d'écran.

À la fin, tu sauras distinguer conteneur et éléments flex, utiliser les propriétés d'alignement, gérer les retours à la ligne, comprendre flex-grow/shrink/basis, construire une mise en page mobile-first et tester l'accessibilité.

## Sommaire

1. Comprendre Flexbox
2. Créer un conteneur
3. Orienter et aligner
4. Espaces et retours à la ligne
5. Dimensions flex
6. Barre de navigation
7. Responsive design
8. Accessibilité
9. Débogage
10. Mini-projet
11. Exercices et corrections
12. Révision

## 1. Comprendre Flexbox

Flexbox signifie Flexible Box Layout. C'est un système CSS qui dispose les éléments sur un axe principal et un axe secondaire.

Analogie : imagine des boîtes sur une table. Tu peux choisir si elles sont alignées horizontalement ou verticalement, comment l'espace est distribué et si elles passent à la ligne lorsque la table devient trop étroite.

Le conteneur flex est le parent. Les éléments flex sont ses enfants directs. Les propriétés de disposition s'appliquent généralement au parent ; d'autres propriétés contrôlent chaque enfant.

Flexbox est adapté à une dimension à la fois : une ligne ou une colonne. Pour une grille complexe de lignes et de colonnes, CSS Grid sera souvent plus approprié.

## 2. Créer un conteneur flex

display: flex transforme un élément en conteneur flex.

~~~html
<div class="ligne">
  <div class="carte">Un</div>
  <div class="carte">Deux</div>
  <div class="carte">Trois</div>
</div>
~~~

~~~css
.ligne {
    display: flex;
    border: 2px solid #8055a5;
}

.carte {
    padding: 16px;
    background: #eee4f7;
    border: 1px solid #8055a5;
}
~~~

Par défaut, les enfants sont placés sur une ligne. Seuls les enfants directs deviennent des éléments flex. Un élément plus profond dans le HTML reste contrôlé par son propre parent.

## 3. Orienter et aligner les éléments

flex-direction définit l'axe principal :

- row : ligne, valeur par défaut ;
- column : colonne ;
- row-reverse : ordre visuel inversé sur l'axe horizontal ;
- column-reverse : ordre visuel inversé sur l'axe vertical.

~~~css
.menu {
    display: flex;
    flex-direction: row;
}

.menu-vertical {
    display: flex;
    flex-direction: column;
}
~~~

justify-content distribue l'espace sur l'axe principal : flex-start, center, flex-end, space-between, space-around ou space-evenly.

align-items contrôle l'alignement sur l'axe secondaire : stretch, center, flex-start ou flex-end.

~~~css
.entete {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 64px;
}
~~~

Si la direction devient column, les axes changent. Vérifie toujours flex-direction avant de choisir un alignement.

## 4. Gérer les espaces et les retours à la ligne

gap ajoute un espace régulier entre les éléments. Cela évite de devoir ajouter une marge à chaque carte.

~~~css
.cartes {
    display: flex;
    gap: 16px;
}
~~~

Par défaut, flex-wrap vaut nowrap : les éléments tentent de rester sur une seule ligne. Avec wrap, ils peuvent passer à la ligne suivante.

~~~css
.cartes {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.carte {
    flex: 1 1 220px;
}
~~~

La carte peut grandir, rétrécir et vise une base de 220 pixels. Si la largeur manque, plusieurs cartes peuvent se répartir sur plusieurs lignes.

Ne confonds pas gap et padding. gap sépare les enfants entre eux ; padding crée un espace à l'intérieur d'un élément.

## 5. Comprendre les dimensions flex

La propriété flex regroupe généralement trois valeurs :

- flex-grow : capacité à prendre l'espace libre ;
- flex-shrink : capacité à rétrécir si l'espace manque ;
- flex-basis : taille de base avant la distribution de l'espace.

~~~css
.principale {
    flex: 2 1 300px;
}

.secondaire {
    flex: 1 1 180px;
}
~~~

La première colonne peut recevoir environ deux parts de l'espace libre pour une part de la seconde, selon les contraintes. Ce n'est pas une largeur fixe.

Pour empêcher un élément de grandir, utilise flex-grow: 0. Pour empêcher qu'il rétrécisse, flex-shrink: 0, mais cela peut provoquer un débordement sur petit écran.

Teste avec du texte plus long que prévu et sur un écran étroit.

## 6. Construire une barre de navigation

Une barre peut placer le nom du site à gauche et les liens à droite.

~~~html
<header class="barre">
  <a class="marque" href="#">Académique</a>
  <nav aria-label="Navigation principale">
    <a href="#cours">Cours</a>
    <a href="#projets">Projets</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
~~~

~~~css
.barre {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
}

.barre nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
~~~

Les liens restent de vrais liens. N'utilise pas un div cliquable pour remplacer un élément interactif natif. Les éléments natifs offrent déjà des comportements utiles au clavier.

## 7. Adapter la page aux écrans

Le responsive design adapte le contenu à la largeur et aux capacités de l'écran. Mobile-first commence par une mise en page simple pour les petits écrans, puis ajoute des améliorations lorsque l'espace augmente.

~~~css
.conteneur {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

@media (min-width: 700px) {
    .conteneur {
        flex-direction: row;
        align-items: flex-start;
    }
}
~~~

Sur téléphone, les blocs sont empilés. À partir de 700 pixels, ils sont disposés en ligne. Le point de rupture doit être choisi selon le contenu, pas seulement selon un modèle de téléphone.

Ajoute dans head :

~~~html
<meta name="viewport" content="width=device-width, initial-scale=1">
~~~

Sans cette balise, certains navigateurs mobiles peuvent utiliser une largeur virtuelle qui rend le responsive moins prévisible.

## 8. Accessibilité et lisibilité

Une mise en page responsive doit rester utilisable. Vérifie que les textes ne deviennent pas trop petits, que les boutons sont faciles à toucher et que le contenu ne dépend pas uniquement d'une couleur.

Respecte l'ordre logique du document. Inverser visuellement les éléments avec row-reverse ne change pas forcément leur ordre de lecture ou de navigation au clavier.

Utilise des libellés explicites : « Voir les cours » est plus clair que « Cliquer ici ». Prévois un contraste suffisant entre le texte et le fond. Évite les débordements horizontaux et les zones interactives trop proches.

Teste la page au clavier et avec une taille de texte augmentée. Le responsive n'est pas seulement une question de largeur : il concerne aussi la lisibilité et l'utilisation.

## 9. Déboguer une mise en page

Si les éléments ne s'alignent pas comme prévu, vérifie :

1. Le parent possède-t-il display: flex ?
2. Les éléments sont-ils ses enfants directs ?
3. Quelle est la valeur de flex-direction ?
4. justify-content agit-il sur le bon axe ?
5. align-items agit-il sur l'axe secondaire ?
6. flex-wrap est-il nécessaire ?
7. Une largeur fixe ou un min-width provoque-t-il un débordement ?

Les outils de développement du navigateur peuvent afficher les conteneurs flex et leurs axes. Sur téléphone, teste aussi portrait et paysage.

Une erreur fréquente consiste à ajouter des marges partout. Avant cela, vérifie le parent et utilise gap ou les propriétés d'alignement adaptées.

## 10. Mini-projet : cartes responsive

Crée index.html et style.css. La page présente trois cartes. Sur téléphone, elles sont empilées ; sur écran large, elles se répartissent sur une ligne si l'espace le permet.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mes parcours</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="barre">
    <strong>Académique</strong>
    <nav aria-label="Navigation principale">
      <a href="#cours">Cours</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="cours" class="grille">
    <article class="carte">
      <h2>Python</h2>
      <p>Apprendre à programmer pas à pas.</p>
      <a href="#python">Voir le parcours</a>
    </article>
    <article class="carte">
      <h2>Intelligence artificielle</h2>
      <p>Comprendre les données et les modèles.</p>
      <a href="#ia">Voir le parcours</a>
    </article>
    <article class="carte">
      <h2>Sites Web</h2>
      <p>Construire des pages accessibles.</p>
      <a href="#web">Voir le parcours</a>
    </article>
  </main>
</body>
</html>
~~~

~~~css
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    line-height: 1.5;
    color: #252033;
    background: #f6f2fa;
}

.barre {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
}

.barre nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.grille {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.carte {
    flex: 1 1 220px;
    padding: 18px;
    border: 1px solid #d8cde5;
    border-radius: 12px;
    background: white;
}

@media (min-width: 720px) {
    .grille {
        flex-direction: row;
        align-items: stretch;
    }
}
~~~

Teste la page avec une largeur étroite et large. Ajoute une quatrième carte et vérifie qu'elle passe à la ligne lorsque nécessaire.

## 11. Exercices progressifs

1. Crée trois blocs et aligne-les avec display: flex.
2. Transforme la ligne en colonne avec flex-direction.
3. Centre les éléments sur l'axe principal.
4. Ajoute gap et flex-wrap.
5. Fais grandir deux cartes avec des valeurs flex différentes.
6. Crée une navigation qui passe sur plusieurs lignes.
7. Défi : transforme le mini-projet en page de quatre cartes qui reste lisible sur téléphone et écran large.

Teste le contenu long, la taille du texte augmentée et l'orientation paysage.

## 12. Corrigés expliqués

~~~css
.ligne {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.carte {
    flex: 1 1 200px;
}
~~~

Pour passer en colonne, remplace row par column. Pour distribuer les éléments, essaie space-between. Pour autoriser le retour à la ligne, conserve flex-wrap: wrap.

Dans le mini-projet, .grille utilise column sur petit écran et row à partir de 720 pixels. Les cartes ont une base de 220 pixels et peuvent grandir ou rétrécir. Cette combinaison adapte la présentation sans largeur rigide.

## 13. Fiche de révision et validation

- display: flex crée un conteneur flex.
- flex-direction définit l'axe principal.
- justify-content distribue l'espace sur l'axe principal.
- align-items règle l'alignement sur l'axe secondaire.
- gap sépare les éléments.
- flex-wrap autorise le passage à la ligne.
- flex-grow, flex-shrink et flex-basis contrôlent la flexibilité.
- Une media query adapte les règles selon l'écran.
- Mobile-first commence par les petits écrans.
- L'accessibilité demande un ordre logique, des liens explicites et un contraste suffisant.
- Les outils du navigateur aident à visualiser les axes et les débordements.

Avant la leçon 05, tu dois pouvoir créer une barre de navigation et une rangée de cartes qui s'adaptent à un petit téléphone sans débordement.

**©pythonschool — Création de sites Web, leçon 04.**
