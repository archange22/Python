# Création de sites Web — Leçon 02 : HTML, structurer une page clairement

**Parcours :** Création de sites Web  
**Numéro :** 02  
**Niveau :** Débutant  
**Durée indicative :** 55 à 70 minutes  
**Matériel :** Téléphone ou ordinateur, éditeur de texte et navigateur.  
**Prérequis :** Leçon 01 : rôle du navigateur, HTML, CSS, JavaScript et première page.

## 1. Objectifs et prérequis

Dans la première leçon, tu as créé une page simple et découvert les trois technologies du Web. Nous allons maintenant approfondir HTML. Le but est de produire une structure claire, compréhensible et accessible avant de chercher à la décorer.

À la fin de cette leçon, tu sauras :
- reconnaître un élément HTML et ses attributs ;
- organiser un document avec une hiérarchie de titres ;
- créer des paragraphes et des listes ;
- créer des liens internes et externes ;
- utiliser correctement les chemins de fichiers ;
- ajouter une image avec un texte alternatif ;
- organiser une page avec des éléments sémantiques ;
- vérifier quelques problèmes d’accessibilité et de structure.

Tu peux travailler entièrement sur téléphone. Aucun service payant ni compte en ligne n’est nécessaire.

## 2. Comprendre un document HTML

HTML signifie HyperText Markup Language. C’est un langage de balisage : il décrit la structure et le sens du contenu. Il ne fonctionne pas comme un langage de programmation classique qui exécute une suite d’instructions.

Un document HTML est composé d’éléments. Un élément possède souvent :
- une balise ouvrante ;
- du contenu ;
- une balise fermante.

Exemple :

~~~html
<p>J'apprends à créer des pages Web.</p>
~~~

La balise ouvrante indique le début du paragraphe. La balise fermante marque sa fin. Certains éléments, comme img, ne possèdent pas de balise fermante classique.

Analogie : HTML ressemble au plan d’un document. Il indique où se trouvent le titre, les paragraphes, les liens et les sections. CSS s’occupe de la présentation visuelle et JavaScript ajoute des comportements.

## 3. Le squelette d’un document moderne

Une page commence généralement par une structure de base.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon espace de projets</title>
</head>
<body>
  <h1>Bienvenue</h1>
  <p>Voici ma première page structurée.</p>
</body>
</html>
~~~

Rôle des éléments :
- doctype indique au navigateur d’utiliser le mode HTML moderne ;
- html contient tout le document ;
- lang="fr" indique la langue principale ;
- head contient les métadonnées et les liens vers les ressources ;
- meta charset définit l’encodage des caractères ;
- meta viewport aide à adapter la largeur de la page à l’écran ;
- title définit le titre de l’onglet ;
- body contient le contenu affiché dans la page.

Ne place pas le texte visible principal dans head. Il doit être dans body.

## 4. Balises, attributs et valeurs

Une balise décrit un type d’élément. Un attribut ajoute une information à cet élément.

Exemple :

~~~html
<a href="https://example.com">Visiter le site de démonstration</a>
~~~

Ici :
- a crée un lien ;
- href est l’attribut ;
- l’adresse est la valeur de l’attribut ;
- le texte entre les balises est le contenu visible.

Les attributs sont écrits dans la balise ouvrante. Les valeurs sont généralement entourées de guillemets.

Exemple avec un identifiant :

~~~html
<section id="projets">
  <h2>Mes projets</h2>
  <p>Quelques réalisations.</p>
</section>
~~~

L’identifiant doit être unique dans le document. Il pourra servir à créer un lien interne ou à sélectionner l’élément avec CSS ou JavaScript.

## 5. Titres et hiérarchie du contenu

HTML propose six niveaux de titres, de h1 à h6. Ils servent à organiser les sujets et les sous-sujets.

Une page possède généralement un titre principal h1. Les grandes parties utilisent h2. Les sous-parties utilisent h3 lorsque cela est nécessaire.

~~~html
<h1>Mon portfolio</h1>

<section>
  <h2>Présentation</h2>
  <p>Je découvre le développement Web.</p>
</section>

<section>
  <h2>Mes projets</h2>
  <h3>Projet numéro un</h3>
  <p>Une page de présentation.</p>
  <h3>Projet numéro deux</h3>
  <p>Un petit site de démonstration.</p>
</section>
~~~

Ne choisis pas h4 uniquement parce que sa taille semble jolie. Les titres décrivent une hiérarchie, pas une décoration. La taille et la couleur seront réglées avec CSS.

Une hiérarchie logique aide les lecteurs, les moteurs de recherche et les technologies d’assistance à comprendre l’organisation de la page.

## 6. Paragraphes, retours à la ligne et listes

L’élément p représente un paragraphe. Utilise-le pour regrouper des phrases qui parlent de la même idée.

~~~html
<p>HTML organise le contenu.</p>
<p>CSS contrôle la présentation.</p>
~~~

L’élément br crée un saut de ligne à l’intérieur d’un contenu lorsque ce retour a un sens. Ne l’utilise pas pour fabriquer des espaces verticaux : CSS est prévu pour gérer les espacements.

Il existe deux listes courantes :
- ul : liste non ordonnée ;
- ol : liste ordonnée.

Chaque élément de liste est placé dans li.

~~~html
<h2>Mes étapes</h2>
<ol>
  <li>Créer le fichier HTML.</li>
  <li>Ajouter le contenu.</li>
  <li>Tester dans le navigateur.</li>
</ol>

<h2>Mes outils</h2>
<ul>
  <li>Un éditeur de texte</li>
  <li>Un navigateur</li>
  <li>Un téléphone ou un ordinateur</li>
</ul>
~~~

Choisis une liste numérotée lorsque l’ordre compte, et une liste à puces lorsque les éléments n’ont pas d’ordre obligatoire.

## 7. Créer des liens et comprendre les chemins

Un lien est créé avec l’élément a et l’attribut href.

Lien externe :

~~~html
<a href="https://developer.mozilla.org/">
  Consulter la documentation MDN
</a>
~~~

Lien interne vers une section :

~~~html
<a href="#contact">Aller à la section contact</a>

<section id="contact">
  <h2>Contact</h2>
  <p>Fin de la page de démonstration.</p>
</section>
~~~

Le symbole # indique un identifiant présent dans la page.

Un chemin relatif désigne un fichier par rapport à l’emplacement du document actuel. Si index.html et contact.html sont dans le même dossier, on peut écrire href="contact.html".

Si le fichier se trouve dans un sous-dossier images, le chemin peut ressembler à images/photo.jpg.

Vérifie les majuscules et minuscules : sur certains serveurs, Photo.jpg et photo.jpg sont deux noms différents. Évite les espaces et les noms compliqués dans les fichiers de ton premier projet.

## 8. Ajouter une image avec un texte alternatif

L’élément img affiche une image. L’attribut src indique le chemin du fichier. L’attribut alt fournit une description textuelle utile lorsque l’image ne peut pas être vue ou chargée.

~~~html
<img
  src="images/projet.jpg"
  alt="Capture de la page d'accueil de mon projet"
>
~~~

Le texte alternatif doit décrire l’information apportée par l’image, pas simplement répéter « image ». Si l’image est purement décorative et n’ajoute aucune information, un alt vide peut être approprié.

Évite de remplacer tout un paragraphe important par une image contenant du texte. Le texte HTML est généralement plus facile à lire, rechercher et adapter.

Pour une image accompagnée d’une légende, utilise figure et figcaption :

~~~html
<figure>
  <img src="images/projet.jpg" alt="Aperçu de mon premier site">
  <figcaption>Première version de mon projet Web.</figcaption>
</figure>
~~~

Le chemin doit correspondre à un fichier qui existe réellement. Un lien cassé ne sera pas réparé par CSS.

## 9. Organiser une page avec des éléments sémantiques

Un élément sémantique décrit le rôle de son contenu.

- header : en-tête d’une page ou d’une section ;
- nav : zone de navigation ;
- main : contenu principal ;
- section : partie thématique ;
- article : contenu autonome ;
- aside : contenu complémentaire ;
- footer : pied de page.

Exemple :

~~~html
<body>
  <header>
    <h1>Mon espace</h1>
    <nav aria-label="Navigation principale">
      <a href="#presentation">Présentation</a>
      <a href="#projets">Projets</a>
    </nav>
  </header>

  <main>
    <section id="presentation">
      <h2>Présentation</h2>
      <p>J'apprends HTML et CSS.</p>
    </section>

    <section id="projets">
      <h2>Projets</h2>
      <article>
        <h3>Premier site</h3>
        <p>Une page simple organisée en sections.</p>
      </article>
    </section>
  </main>

  <footer>
    <p>Portfolio de démonstration.</p>
  </footer>
</body>
~~~

N’utilise pas main plusieurs fois pour le contenu principal d’une même page. Les éléments sémantiques aident à créer des repères compréhensibles.

## 10. Tableaux : présenter des données tabulaires

Un tableau HTML sert à présenter des données qui ont des relations en lignes et en colonnes. Il ne doit pas être utilisé pour construire toute la mise en page.

~~~html
<table>
  <caption>Temps consacré aux projets</caption>
  <thead>
    <tr>
      <th scope="col">Projet</th>
      <th scope="col">Durée</th>
      <th scope="col">État</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Page personnelle</th>
      <td>2 heures</td>
      <td>En cours</td>
    </tr>
    <tr>
      <th scope="row">Page de présentation</th>
      <td>1 heure</td>
      <td>Terminée</td>
    </tr>
  </tbody>
</table>
~~~

caption donne un titre au tableau. thead contient les en-têtes, tbody les lignes de données. th désigne une cellule d’en-tête et td une cellule ordinaire.

L’attribut scope aide à indiquer à quelles cellules les en-têtes se rapportent. Sur téléphone, un tableau large peut nécessiter un conteneur avec défilement horizontal en CSS.

## 11. Accessibilité et qualité HTML

L’accessibilité consiste à rendre le contenu utilisable par le plus grand nombre, y compris par des personnes qui utilisent un clavier, un lecteur d’écran ou des réglages d’affichage particuliers.

Bonnes habitudes :
- définir la langue du document ;
- respecter la hiérarchie des titres ;
- donner un texte de lien qui explique sa destination ;
- fournir un alt adapté aux images informatives ;
- utiliser les éléments sémantiques ;
- garder un ordre de lecture logique ;
- ne pas transmettre une information uniquement par la couleur.

Un lien nommé « Clique ici » donne peu d’information hors contexte. Préfère « Lire la documentation HTML ».

Teste la page au clavier : la touche Tab doit permettre de parcourir les liens dans un ordre cohérent. Vérifie que les titres décrivent réellement les sections.

L’accessibilité ne se résume pas à ajouter des attributs. Il faut aussi vérifier la lisibilité, les contrastes, le fonctionnement et la qualité du contenu.

## 12. Commentaires et organisation des fichiers

Un commentaire HTML commence par <!-- et se termine par -->. Le navigateur ne l’affiche pas comme du texte de page.

~~~html
<!-- Navigation principale du site -->
<nav>
  <a href="#accueil">Accueil</a>
  <a href="#projets">Projets</a>
</nav>
~~~

Les commentaires servent à expliquer une décision ou à repérer une partie importante. Évite les commentaires qui répètent simplement le nom de la balise.

Organisation conseillée :

~~~text
mon-site/
    index.html
    style.css
    script.js
    images/
        projet.jpg
~~~

Garde des noms simples et des extensions correctes. Si index.html se trouve dans le dossier principal, le chemin vers l’image ci-dessus est images/projet.jpg.

Sur Android, vérifie que l’éditeur n’ajoute pas automatiquement une extension supplémentaire, comme .txt. Ouvre ensuite le fichier dans le navigateur pour confirmer qu’il s’agit bien d’une page Web.

## 13. Erreurs fréquentes et débogage

| Problème | Cause possible | Vérification |
|---|---|---|
| Une image ne s’affiche pas | Chemin ou nom incorrect | Vérifier le dossier et les majuscules |
| Un lien interne ne fonctionne pas | Identifiant absent ou différent | Comparer href et id |
| Le titre est mal organisé | Mauvaise hiérarchie | Revoir h1, h2 et h3 |
| Le texte n’apparaît pas | Élément placé dans head | Déplacer le contenu dans body |
| Une balise semble cassée | Balise fermante oubliée | Vérifier les ouvertures et fermetures |
| Les caractères accentués sont incorrects | Encodage absent ou mauvais | Vérifier UTF-8 |

Méthode de débogage :
1. enregistre le fichier ;
2. recharge la page dans le navigateur ;
3. vérifie le premier problème visible ;
4. inspecte les chemins et les noms ;
5. corrige un point à la fois ;
6. recharge à nouveau.

Le navigateur peut parfois afficher une page même si le HTML contient des erreurs. Le fait que « quelque chose s’affiche » ne garantit donc pas que le document soit bien structuré.

## 14. Exercices progressifs et mini-projet

### Exercice 1 — Hiérarchie des titres

Écris un titre h1 « Mon apprentissage », deux titres h2 « Python » et « Web », puis un titre h3 sous chaque grande partie.

### Exercice 2 — Liste d’étapes

Crée une liste ordonnée contenant quatre étapes pour préparer un projet Web. Ajoute une liste non ordonnée contenant trois outils.

### Exercice 3 — Navigation interne

Crée un menu avec trois liens vers les sections Accueil, Projets et Contact. Chaque lien doit pointer vers un id existant.

### Exercice 4 — Image et texte alternatif

Ajoute une image locale dans un dossier images. Écris un alt qui décrit l’information apportée par l’image. Vérifie le chemin sur ton appareil.

### Exercice 5 — Tableau simple

Crée un tableau avec trois colonnes : Nom, Type et État. Ajoute deux lignes de données et un caption.

### Mini-projet — Page de présentation structurée

Crée un fichier index.html pour une page de présentation fictive. Il doit contenir :
- un header avec le titre et la navigation ;
- un main avec au moins trois sections ;
- une liste de compétences ou d’outils ;
- un article décrivant un projet ;
- une image avec un texte alternatif, si tu possèdes une image adaptée ;
- un footer ;
- des titres hiérarchisés correctement.

Teste les liens internes, l’ordre de lecture au clavier et l’affichage sur un petit écran. Le but principal est la structure HTML, pas l’apparence.

## 15. Corrigés expliqués et fiche de révision

### Correction de l’exercice 1

~~~html
<h1>Mon apprentissage</h1>

<section>
  <h2>Python</h2>
  <h3>Mes premiers scripts</h3>
</section>

<section>
  <h2>Web</h2>
  <h3>Mes premières pages</h3>
</section>
~~~

h1 indique le sujet principal. Les deux h2 représentent des parties de même niveau. Chaque h3 décrit une sous-partie.

### Correction de l’exercice 2

~~~html
<ol>
  <li>Créer un dossier.</li>
  <li>Créer index.html.</li>
  <li>Ajouter le contenu.</li>
  <li>Tester dans le navigateur.</li>
</ol>

<ul>
  <li>Éditeur</li>
  <li>Navigateur</li>
  <li>Gestionnaire de fichiers</li>
</ul>
~~~

ol convient parce que les étapes ont un ordre. ul convient pour une liste d’outils sans ordre obligatoire.

### Correction de l’exercice 3

~~~html
<nav aria-label="Navigation principale">
  <a href="#accueil">Accueil</a>
  <a href="#projets">Projets</a>
  <a href="#contact">Contact</a>
</nav>

<section id="accueil"><h2>Accueil</h2></section>
<section id="projets"><h2>Projets</h2></section>
<section id="contact"><h2>Contact</h2></section>
~~~

Chaque valeur href correspond exactement à un id.

### Correction de l’exercice 4

~~~html
<img src="images/projet.jpg" alt="Aperçu de la page de présentation">
~~~

Le chemin indique un fichier dans le dossier images. Le texte alt décrit ce que l’image montre. Si le fichier n’existe pas à cet endroit, l’image ne s’affichera pas.

### Correction de l’exercice 5

~~~html
<table>
  <caption>État des projets</caption>
  <thead>
    <tr>
      <th scope="col">Nom</th>
      <th scope="col">Type</th>
      <th scope="col">État</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Portfolio</td>
      <td>Site personnel</td>
      <td>En cours</td>
    </tr>
    <tr>
      <td>Page de test</td>
      <td>Exercice HTML</td>
      <td>Terminée</td>
    </tr>
  </tbody>
</table>
~~~

Les en-têtes décrivent les colonnes. Les lignes du corps contiennent les valeurs.

### Exemple de mini-projet

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon portfolio de débutant</title>
</head>
<body>
  <header>
    <h1>Mon portfolio</h1>
    <nav aria-label="Navigation principale">
      <a href="#presentation">Présentation</a>
      <a href="#projets">Projets</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <section id="presentation">
      <h2>Présentation</h2>
      <p>Je découvre la création de sites Web.</p>
    </section>

    <section id="projets">
      <h2>Mes projets</h2>
      <article>
        <h3>Première page</h3>
        <p>Une page structurée avec des éléments HTML.</p>
      </article>
      <ul>
        <li>HTML</li>
        <li>CSS</li>
      </ul>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <p>Section de démonstration.</p>
    </section>
  </main>

  <footer>
    <p>Fin du portfolio.</p>
  </footer>
</body>
</html>
~~~

Cette version se concentre sur la structure. La mise en forme sera ajoutée avec CSS dans les leçons suivantes.

### Fiche de révision

| Élément | Fonction |
|---|---|
| html | Contient le document |
| head | Métadonnées et ressources |
| body | Contenu de la page |
| h1 à h6 | Hiérarchie des titres |
| p | Paragraphe |
| ul / ol | Listes |
| li | Élément de liste |
| a | Lien |
| img | Image |
| alt | Texte alternatif |
| header / nav / main / footer | Repères sémantiques |
| table / th / td | Données tabulaires |

**Validation avant la leçon 03 :** tu dois pouvoir structurer une page avec des titres, paragraphes, listes, liens, images et éléments sémantiques, puis vérifier les chemins et la hiérarchie.

**Prochaine étape :** approfondir CSS pour créer une présentation cohérente, lisible et responsive.

---

*Académique — Création de sites Web, leçon 02.*  
*©pythonschool*