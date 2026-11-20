# Création de sites web — Leçon 01 : Comprendre le Web et créer sa première page

**Parcours :** Création de sites Web  
**Niveau :** Débutant absolu  
**Durée indicative :** 50 à 70 minutes  
**Matériel :** Un téléphone ou un ordinateur et un éditeur de texte. Aucun compte payant n’est nécessaire.

## Objectifs de la leçon

À la fin de cette leçon, tu sauras :
- expliquer la différence entre Internet et le Web ;
- reconnaître les rôles de HTML, CSS et JavaScript ;
- créer un premier fichier HTML ;
- organiser le contenu avec des éléments adaptés ;
- ajouter des styles avec CSS ;
- rendre une page plus confortable sur téléphone ;
- comprendre comment JavaScript peut réagir à une action ;
- tester ta page dans un navigateur.

Nous allons fabriquer une petite page personnelle. Tu peux suivre le cours depuis un téléphone Android ou depuis un ordinateur.

## 1. Internet et le Web : deux notions différentes

Internet est un réseau mondial qui permet à des appareils de communiquer. Le Web est un ensemble de ressources accessibles avec des technologies comme HTTP et HTTPS, généralement consultées dans un navigateur.

Internet ne sert pas uniquement à visiter des sites. Il permet aussi d’utiliser des applications de messagerie, des jeux en réseau, des appels et d’autres services.

Un site Web est composé de pages et de ressources : textes, images, styles, scripts et parfois données.

### Exemple

Lorsque tu ouvres une adresse dans Chrome :
1. le navigateur demande une ressource à un serveur ;
2. le serveur répond avec des fichiers ou des données ;
3. le navigateur interprète les documents ;
4. la page s’affiche à l’écran.

Ce processus peut être plus complexe, mais cette version suffit pour comprendre le principe.

## 2. Le navigateur, le serveur et l’adresse Web

Le navigateur est le logiciel qui affiche les pages. Chrome, Firefox, Edge et Safari sont des navigateurs.

Un serveur est un ordinateur ou un service qui fournit des ressources à d’autres appareils.

Une adresse Web indique où trouver une ressource. Par exemple, elle peut contenir :
- le protocole, comme HTTPS ;
- un nom de domaine ;
- un chemin vers une page ;
- parfois des paramètres.

Un site simple peut être constitué de fichiers HTML, CSS et JavaScript hébergés sur un service statique. Un site plus complexe peut également utiliser un serveur applicatif et une base de données.

## 3. Les trois technologies fondamentales

Pour débuter, retiens ces trois rôles.

### HTML : le contenu et la structure

HTML signifie HyperText Markup Language. Il sert à organiser le contenu d’une page : titres, paragraphes, liens, images, tableaux et formulaires.

HTML décrit la structure ; il ne sert pas principalement à définir les couleurs ou les animations.

### CSS : la présentation

CSS signifie Cascading Style Sheets. Il permet de définir les couleurs, les tailles, les espaces, les alignements, les dispositions et l’apparence selon la taille de l’écran.

### JavaScript : les interactions

JavaScript permet d’ajouter des comportements : réagir à un clic, vérifier un formulaire, afficher un message ou mettre à jour une partie de la page.

Une page peut fonctionner sans JavaScript, mais les interactions avancées utilisent souvent ce langage.

## 4. Préparer son espace de travail

Sur un ordinateur, tu peux utiliser un éditeur de code. Sur Android, utilise un éditeur de texte qui permet de créer des fichiers avec les extensions HTML, CSS et JS.

Organise ton projet dans un dossier nommé **mon-premier-site**.

Crée trois fichiers :
- **index.html** ;
- **style.css** ;
- **script.js**.

Vérifie les extensions. Un fichier nommé index.html.txt n’est pas un fichier HTML correctement nommé.

Garde les trois fichiers dans le même dossier pour commencer. Cette organisation rend les chemins faciles à comprendre.

## 5. Construire le squelette HTML

Ouvre le fichier **index.html** et écris le code suivant :

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon premier site</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <header>
    <h1>Bienvenue sur mon site</h1>
  </header>

  <main>
    <p>Je viens de créer ma première page Web.</p>
  </main>
</body>
</html>
~~~

Enregistre le fichier puis ouvre-le dans ton navigateur. Tu devrais voir un titre et un paragraphe.

### À quoi servent les éléments ?

- **doctype** indique au navigateur qu’il s’agit d’un document HTML moderne.
- **html** contient toute la page.
- **head** contient des informations sur le document.
- **title** définit le titre affiché dans l’onglet.
- **body** contient la partie visible de la page.
- **h1** représente le titre principal.
- **p** représente un paragraphe.
- **link** relie la page au fichier CSS.
- **script** relie la page au code JavaScript.

## 6. Organiser la page avec des éléments sémantiques

Un élément sémantique décrit le rôle de son contenu.

Les éléments utiles au début :
- **header** : en-tête de la page ou d’une section ;
- **nav** : zone de navigation ;
- **main** : contenu principal ;
- **section** : partie thématique ;
- **article** : contenu autonome ;
- **footer** : pied de page.

Exemple :

~~~html
<body>
  <header>
    <h1>Mon espace</h1>
    <nav>
      <a href="#presentation">Présentation</a>
      <a href="#projets">Projets</a>
    </nav>
  </header>

  <main>
    <section id="presentation">
      <h2>Présentation</h2>
      <p>J’apprends à créer des sites Web.</p>
    </section>

    <section id="projets">
      <h2>Mes projets</h2>
      <p>Voici mes premières réalisations.</p>
    </section>
  </main>

  <footer>
    <p>Mon premier site</p>
  </footer>
</body>
~~~

Cette organisation aide les navigateurs, les lecteurs d’écran et les développeurs à comprendre la page.

## 7. Ajouter des couleurs et des espacements avec CSS

Ouvre **style.css** et écris :

~~~css
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #fff8f1;
  color: #38231b;
}

header {
  padding: 24px;
  background: #ed722f;
  color: white;
}

main {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

h1 {
  font-size: 32px;
}

p {
  line-height: 1.7;
}
~~~

Recharge la page. Le fond, les couleurs et les espacements doivent changer.

### Comprendre une règle CSS

Une règle CSS contient :
1. un sélecteur qui désigne les éléments ;
2. une accolade ouvrante ;
3. des propriétés ;
4. des valeurs ;
5. une accolade fermante.

Dans **background: #fff8f1**, la propriété est background et la valeur est une couleur.

## 8. Comprendre les classes et les identifiants

Une classe permet d’appliquer le même style à plusieurs éléments.

Dans HTML :

~~~html
<p class="texte-important">Un message à retenir.</p>
<p class="texte-important">Un autre message important.</p>
~~~

Dans CSS :

~~~css
.texte-important {
  color: #b84b18;
  font-weight: bold;
}
~~~

Le point devant le nom indique une classe.

Un identifiant sert à identifier un élément précis dans la page.

~~~html
<h2 id="projets">Mes projets</h2>
~~~

On peut sélectionner cet identifiant avec **#projets** en CSS ou en JavaScript.

## 9. Adapter le site aux téléphones

Une page conçue uniquement pour un grand écran peut être difficile à lire sur un téléphone.

La balise viewport présente dans notre document HTML aide le navigateur à adapter la largeur de la page à l’écran.

CSS possède aussi les media queries. Elles permettent de modifier les styles selon la taille de l’écran.

~~~css
main {
  width: min(90%, 800px);
  margin: 25px auto;
}

@media (max-width: 600px) {
  main {
    width: auto;
    margin: 12px;
    padding: 14px;
  }

  h1 {
    font-size: 25px;
  }
}
~~~

Teste la page avec un téléphone ou en réduisant la largeur de la fenêtre du navigateur.

Un site responsive doit rester lisible sans obliger l’utilisateur à zoomer ou à faire défiler horizontalement toute la page.

## 10. Ajouter une petite interaction avec JavaScript

Ouvre **script.js** et écris :

~~~javascript
const bouton = document.querySelector("#messageButton");
const resultat = document.querySelector("#resultat");

if (bouton && resultat) {
  bouton.addEventListener("click", () => {
    resultat.textContent = "Bravo, ton bouton fonctionne !";
  });
}
~~~

Ajoute ensuite ces éléments dans la zone **main** de ton fichier HTML :

~~~html
<button id="messageButton" type="button">
  Afficher un message
</button>
<p id="resultat">Le message apparaîtra ici.</p>
~~~

Enregistre les fichiers puis recharge la page. Quand tu appuies sur le bouton, le texte doit changer.

### Comprendre le code

- **querySelector** cherche un élément dans la page.
- **addEventListener** attend un événement.
- **click** représente un clic.
- **textContent** modifie le texte d’un élément.
- **if** vérifie que les éléments existent avant de les utiliser.

Le navigateur exécute le code JavaScript après avoir chargé la page grâce à l’attribut defer.

## 11. Vérifier et corriger les erreurs

Une page peut afficher un résultat inattendu même si le navigateur ne montre pas de grande erreur.

Vérifie systématiquement :
- le nom des fichiers ;
- les chemins indiqués dans link et script ;
- les guillemets ;
- les balises ouvertes et fermées ;
- les identifiants utilisés dans JavaScript ;
- la sauvegarde de chaque fichier avant de recharger la page.

### Erreurs fréquentes

| Problème | Cause possible | Vérification |
|---|---|---|
| Aucun style ne s’affiche | CSS mal relié | Vérifier le nom de style.css |
| Le bouton ne fait rien | JavaScript mal relié | Vérifier script.js et son chemin |
| La page est trop large sur mobile | Viewport absent | Ajouter la balise viewport |
| Un lien ne fonctionne pas | Mauvais identifiant | Comparer href et id |
| Une image est absente | Chemin incorrect | Vérifier le dossier et le nom de l’image |

## 12. Accessibilité et qualité

Un site doit être compréhensible par le plus grand nombre de personnes.

Quelques habitudes utiles :
- utiliser un titre principal clair ;
- organiser les sous-titres dans un ordre logique ;
- ajouter un texte alternatif aux images informatives ;
- choisir un contraste suffisant entre texte et fond ;
- rendre les boutons et liens faciles à identifier ;
- utiliser des libellés clairs dans les formulaires ;
- ne pas transmettre une information uniquement par une couleur.

Exemple d’image :

~~~html
<img src="ordinateur.jpg" alt="Ordinateur posé sur un bureau">
~~~

Le texte alternatif décrit l’information utile de l’image. Pour une image purement décorative, un texte alternatif vide peut être adapté.

## 13. Exercices progressifs

Réalise les exercices dans ton projet.

### Exercice 1 — Modifier la page

Remplace le titre principal par le nom de ton projet. Ajoute un paragraphe qui explique le but du site.

### Exercice 2 — Ajouter une navigation

Ajoute deux liens dans une zone nav. Le premier doit conduire à une section Présentation et le deuxième à une section Contact.

### Exercice 3 — Modifier le style

Crée une classe appelée **carte**. Donne-lui une couleur de fond, un espace intérieur et des coins arrondis. Applique cette classe à deux sections.

### Exercice 4 — Adapter au téléphone

Ajoute une media query qui réduit la taille du titre lorsque l’écran est étroit. Vérifie le résultat sur téléphone.

### Exercice 5 — Ajouter un bouton

Ajoute un bouton qui modifie un paragraphe lorsque l’utilisateur clique dessus.

## 14. Mini-défi — Réaliser une page de présentation

Construis une petite page comportant :
- un en-tête avec le nom du site ;
- une navigation ;
- une présentation du projet ;
- une section avec trois cartes ;
- un bouton interactif ;
- un pied de page.

Contraintes :
1. sépare HTML, CSS et JavaScript dans trois fichiers ;
2. le site doit être lisible sur téléphone ;
3. chaque section doit avoir un titre ;
4. le bouton doit afficher un message ;
5. les styles doivent utiliser au moins une classe ;
6. ajoute un texte alternatif aux images informatives.

## 15. Corrections et exemples

### Correction de l’exercice 1

~~~html
<h1>Académique</h1>
<p>Un espace pour apprendre la programmation et créer des projets.</p>
~~~

Tu peux choisir un autre nom et un autre texte.

### Exemple de correction de l’exercice 2

~~~html
<nav>
  <a href="#presentation">Présentation</a>
  <a href="#contact">Contact</a>
</nav>

<section id="presentation">
  <h2>Présentation</h2>
  <p>Voici mon projet.</p>
</section>

<section id="contact">
  <h2>Contact</h2>
  <p>Une section de contact.</p>
</section>
~~~

Le texte après le symbole # doit correspondre exactement à l’identifiant de la section.

### Exemple de correction de l’exercice 3

~~~css
.carte {
  padding: 18px;
  margin: 12px 0;
  border-radius: 12px;
  background: #fff0e4;
}
~~~

Tu peux appliquer la classe avec **class="carte"** dans HTML.

### Exemple de correction de l’exercice 4

~~~css
h1 {
  font-size: 32px;
}

@media (max-width: 600px) {
  h1 {
    font-size: 24px;
  }
}
~~~

### Exemple de correction de l’exercice 5

~~~html
<button id="action" type="button">Clique ici</button>
<p id="sortie">En attente.</p>
~~~

~~~javascript
const action = document.querySelector("#action");
const sortie = document.querySelector("#sortie");

action.addEventListener("click", () => {
  sortie.textContent = "Le bouton a été utilisé.";
});
~~~

Dans un projet plus complet, vérifie que les éléments existent avant de leur ajouter des événements.

## 16. Fiche de révision et validation

| Technologie ou notion | Rôle |
|---|---|
| Internet | Réseau permettant aux appareils de communiquer |
| Web | Ensemble de ressources consultées avec des technologies Web |
| Navigateur | Logiciel qui affiche les pages |
| Serveur | Service qui fournit des ressources |
| HTML | Structure du contenu |
| CSS | Présentation visuelle |
| JavaScript | Interactions et comportements |
| Classe | Sélecteur réutilisable |
| Identifiant | Identifie un élément |
| Media query | Adapte le style selon les caractéristiques de l’écran |
| Responsive | Interface qui s’adapte aux différentes tailles d’écran |

Avant de passer à la leçon suivante, vérifie que tu peux :
- créer trois fichiers HTML, CSS et JS ;
- relier correctement les fichiers ;
- organiser le contenu avec des éléments sémantiques ;
- ajouter une classe CSS ;
- rendre une page plus adaptée au mobile ;
- faire réagir un bouton avec JavaScript ;
- identifier quelques erreurs fréquentes.

**À retenir :** HTML organise le contenu, CSS le présente et JavaScript ajoute des interactions. Commence avec une structure simple, teste souvent et améliore progressivement ta page.

---

*Académique — Création de sites Web, leçon 01. Contenu pédagogique original en français.*  
*©pythonschool*
