# Création de sites Web — Leçon 05 : JavaScript, variables, fonctions et événements

**Parcours :** Création de sites Web  
**Numéro :** 05  
**Niveau :** Débutant  
**Durée indicative :** 80 à 110 minutes  
**Environnement :** Téléphone ou ordinateur avec un navigateur et un éditeur de texte.  
**Prérequis :** HTML, CSS, sélecteurs, modèle de boîte et Flexbox.

## Objectifs et prérequis

HTML décrit le contenu, CSS organise son apparence et JavaScript ajoute du comportement. Dans cette leçon, tu vas apprendre à réagir à un clic, modifier un texte et lire une saisie sans recharger la page.

À la fin, tu sauras déclarer des variables, utiliser des conditions et fonctions simples, sélectionner un élément HTML, écouter un événement et mettre à jour la page avec le DOM.

Tu peux créer les fichiers sur téléphone avec un éditeur de texte et ouvrir index.html dans un navigateur. Aucun service payant ni serveur obligatoire n'est nécessaire pour ces exemples.

## Sommaire

1. Le rôle de JavaScript
2. Relier JavaScript à une page HTML
3. Variables avec const et let
4. Types et opérations
5. Conditions et boucles
6. Écrire des fonctions
7. Comprendre le DOM
8. Réagir aux événements
9. Lire un formulaire en sécurité
10. Déboguer dans le navigateur
11. Mini-projet : compteur interactif
12. Exercices et corrigés
13. Fiche de révision

## 1. Le rôle de JavaScript

Une page Web peut être comprise en trois couches.

- HTML décrit les éléments : titres, paragraphes, boutons et formulaires.
- CSS définit la présentation : couleurs, tailles, espacements et disposition.
- JavaScript décrit les actions : répondre à un clic, calculer une valeur ou afficher un message.

Analogie : HTML est le plan d'une pièce, CSS est la décoration et JavaScript est le mécanisme qui permet d'actionner une porte ou d'allumer une lampe.

JavaScript s'exécute dans le navigateur. Il ne remplace pas HTML ou CSS. Un bouton doit d'abord exister dans le HTML ; JavaScript peut ensuite écouter son activation et modifier le contenu.

Un site simple peut fonctionner entièrement sur le téléphone. Pour appeler une API distante ou partager des données entre utilisateurs, il faudra ensuite tenir compte du réseau, des règles de sécurité et parfois d'un serveur.

## 2. Relier JavaScript à une page HTML

Crée deux fichiers dans le même dossier : index.html et app.js.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Découvrir JavaScript</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h1>Ma première page interactive</h1>
  <p id="message">Le JavaScript va agir ici.</p>
</body>
</html>
~~~

~~~javascript
const message = document.querySelector("#message");
message.textContent = "JavaScript fonctionne !";
~~~

L'attribut defer demande au navigateur de télécharger le fichier puis de l'exécuter après l'analyse du HTML. Le paragraphe existe donc lorsque le script le sélectionne.

Tu peux aussi écrire un petit script dans une balise script, mais un fichier séparé devient plus facile à organiser lorsque le projet grandit.

Vérifie que le nom app.js est exact et que les deux fichiers se trouvent dans le même dossier. Une faute de chemin peut empêcher le navigateur de charger le script.

## 3. Variables avec const et let

Une variable donne un nom à une valeur. En JavaScript moderne, utilise const lorsqu'une variable ne sera pas réaffectée et let lorsqu'elle doit recevoir une nouvelle valeur.

~~~javascript
const nom = "Awa";
let points = 10;

points = points + 5;

console.log(nom);
console.log(points);
~~~

const empêche de réaffecter la variable, mais ne rend pas automatiquement tous les objets qu'elle contient immuables. let autorise une nouvelle affectation.

Évite var dans les nouveaux exercices de débutant : son comportement de portée est plus ancien et peut surprendre. Choisis des noms descriptifs comme total, prenom ou nombreDeTentatives.

Une variable doit être déclarée avant son utilisation. La console du navigateur affiche une erreur si tu essaies d'utiliser une variable inexistante.

## 4. Types et opérations

JavaScript possède plusieurs types courants.

- string : texte, par exemple "Bonjour".
- number : nombre entier ou décimal.
- boolean : true ou false.
- undefined : variable déclarée sans valeur attribuée.
- null : absence de valeur choisie explicitement.

~~~javascript
const prenom = "Moussa";
const age = 16;
const actif = true;

console.log(typeof prenom);
console.log(typeof age);
console.log(typeof actif);
~~~

L'opérateur + additionne deux nombres, mais assemble aussi deux textes. Si une valeur vient d'un champ de formulaire, elle est généralement lue comme du texte. Il faut convertir et vérifier la saisie avant un calcul.

~~~javascript
const texte = "12";
const nombre = Number(texte);

console.log(nombre + 3); // 15
~~~

Number() tente une conversion. Une saisie invalide peut produire NaN, qui signifie « Not a Number ». Vérifie avec Number.isFinite() avant d'utiliser le résultat dans un calcul.

## 5. Conditions et boucles

Une condition exécute un bloc seulement si une expression est vraie.

~~~javascript
const age = 16;

if (age >= 18) {
  console.log("Majeur");
} else {
  console.log("Mineur");
}
~~~

Les opérateurs de comparaison incluent ===, !==, <, >, <= et >=. Préfère l'égalité stricte ===, qui ne convertit pas automatiquement les types.

Les opérateurs logiques sont && pour « et », || pour « ou » et ! pour « non ».

Une boucle répète des instructions. for convient lorsque tu parcours une série de valeurs ou connais le nombre de répétitions.

~~~javascript
for (let numero = 1; numero <= 3; numero++) {
  console.log("Essai", numero);
}
~~~

while répète tant que sa condition est vraie. Il faut faire évoluer la condition pour éviter une boucle infinie. Dans une page Web, une boucle très longue peut bloquer le navigateur.

## 6. Écrire des fonctions

Une fonction rassemble des instructions sous un nom. Elle peut recevoir des paramètres et renvoyer une valeur avec return.

~~~javascript
function additionner(a, b) {
  return a + b;
}

const resultat = additionner(4, 6);
console.log(resultat);
~~~

Les paramètres sont indiqués dans la définition. Les arguments sont les valeurs fournies lors de l'appel. Une fonction peut être appelée plusieurs fois.

Une fonction fléchée est une autre syntaxe :

~~~javascript
const doubler = (nombre) => {
  return nombre * 2;
};

console.log(doubler(5));
~~~

Commence avec la forme function lorsque tu apprends. Choisis un nom qui décrit une seule responsabilité. Une fonction courte est plus simple à tester et à corriger.

## 7. Comprendre le DOM

Le DOM est la représentation de la page HTML sous forme d'objets que JavaScript peut lire et modifier. document représente le document chargé.

querySelector() recherche le premier élément qui correspond à un sélecteur CSS. getElementById() recherche un élément par son identifiant.

~~~html
<h2 id="titre">Ancien titre</h2>
<p class="description">Un texte.</p>
~~~

~~~javascript
const titre = document.querySelector("#titre");
const description = document.querySelector(".description");

titre.textContent = "Nouveau titre";
description.textContent = "Le texte a été modifié.";
~~~

textContent remplace le texte d'un élément. Pour débuter, préfère-le à innerHTML lorsque tu affiches une saisie utilisateur. Insérer directement du HTML provenant d'une saisie non fiable peut créer une faille d'injection.

Si querySelector() ne trouve rien, il renvoie null. Vérifie le sélecteur et le moment où le script s'exécute.

## 8. Réagir aux événements

Un événement est une action détectée par le navigateur : clic, saisie, validation d'un formulaire ou pression d'une touche.

addEventListener() associe une fonction à un événement.

~~~html
<button id="bouton">Clique ici</button>
<p id="retour">En attente.</p>
~~~

~~~javascript
const bouton = document.querySelector("#bouton");
const retour = document.querySelector("#retour");

bouton.addEventListener("click", function () {
  retour.textContent = "Bouton activé !";
});
~~~

La fonction ne s'exécute pas lors de sa définition. Le navigateur l'appelle lorsque l'événement click se produit.

Évite d'écrire du JavaScript directement dans un attribut HTML comme onclick. addEventListener() sépare mieux la structure et le comportement et permet d'ajouter plusieurs réactions au même événement.

Un événement fournit parfois un objet event qui décrit l'action. Tu peux l'utiliser pour connaître la cible, la touche pressée ou les informations du formulaire.

## 9. Lire un formulaire en sécurité

Un champ input contient généralement une valeur sous forme de texte. Vérifie qu'elle n'est pas vide et convertis-la avant un calcul.

~~~html
<form id="formulaire">
  <label for="prenom">Ton prénom</label>
  <input id="prenom" name="prenom" type="text" required>
  <button type="submit">Valider</button>
</form>
<p id="resultat" aria-live="polite"></p>
~~~

~~~javascript
const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#prenom");
const resultat = document.querySelector("#resultat");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();

  const prenom = champ.value.trim();

  if (prenom === "") {
    resultat.textContent = "Écris un prénom.";
    return;
  }

  resultat.textContent = "Bonjour " + prenom + " !";
});
~~~

preventDefault() empêche le comportement normal du formulaire, ici le rechargement de la page. trim() retire les espaces au début et à la fin.

Le navigateur peut aider avec required, mais la validation côté client ne suffit pas pour protéger des données enregistrées sur un serveur. Un serveur doit refaire ses propres contrôles.

N'affiche pas une saisie non fiable avec innerHTML. textContent affiche la valeur comme du texte et réduit le risque d'injection HTML.

## 10. Déboguer dans le navigateur

La console du navigateur affiche les messages et les erreurs JavaScript. Sur ordinateur, elle se trouve généralement dans les outils de développement. Sur téléphone, les possibilités dépendent du navigateur et de l'éditeur ; tu peux aussi afficher temporairement un résultat dans la page.

Quelques problèmes fréquents :
- SyntaxError : parenthèse, accolade ou guillemet manquant.
- ReferenceError : nom de variable inconnu.
- TypeError : opération impossible sur une valeur.
- null : le sélecteur n'a pas trouvé l'élément.
- Fichier non chargé : chemin ou nom incorrect.

Ajoute console.log() pour inspecter une valeur, mais retire les informations privées avant de partager des journaux. Vérifie une erreur à la fois et relance après chaque correction.

~~~javascript
const bouton = document.querySelector("#bouton");
console.log("Bouton trouvé :", bouton);

if (bouton) {
  bouton.addEventListener("click", () => {
    console.log("Clic détecté");
  });
}
~~~

Cette vérification évite d'essayer d'ajouter un événement à null.

## 11. Mini-projet : compteur interactif

Crée une page avec deux boutons : augmenter et remettre à zéro. Le nombre affiché doit évoluer sans recharger la page.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Compteur</title>
  <script src="app.js" defer></script>
</head>
<body>
  <main>
    <h1>Mon compteur</h1>
    <p>Valeur : <strong id="valeur">0</strong></p>
    <button id="augmenter" type="button">Ajouter 1</button>
    <button id="reset" type="button">Remettre à zéro</button>
  </main>
</body>
</html>
~~~

~~~javascript
let compteur = 0;

const valeur = document.querySelector("#valeur");
const boutonAjouter = document.querySelector("#augmenter");
const boutonReset = document.querySelector("#reset");

function afficherCompteur() {
  valeur.textContent = compteur;
}

boutonAjouter.addEventListener("click", function () {
  compteur = compteur + 1;
  afficherCompteur();
});

boutonReset.addEventListener("click", function () {
  compteur = 0;
  afficherCompteur();
});
~~~

La variable compteur conserve l'état pendant que la page reste ouverte. afficherCompteur() met à jour l'interface. Les événements appellent cette fonction après chaque changement.

Teste plusieurs clics, puis le bouton de remise à zéro. Ajoute ensuite un bouton qui diminue le compteur, en empêchant éventuellement le résultat de devenir négatif.

## 12. Exercices et corrigés

1. Déclare une constante prenom et affiche-la dans la console.
2. Déclare un compteur avec let et augmente-le de deux.
3. Écris une fonction qui calcule le carré d'un nombre.
4. Sélectionne un paragraphe par son identifiant et modifie son textContent.
5. Ajoute un événement click qui change le texte d'un bouton.
6. Lis un nombre dans un champ, convertis-le avec Number() et vérifie Number.isFinite().
7. Défi : ajoute au compteur un bouton diminuer et un bouton reset. Affiche le nombre après chaque action.

**Corrigé 1 :**
~~~javascript
const prenom = "Awa";
console.log(prenom);
~~~

**Corrigé 2 :**
~~~javascript
let compteur = 0;
compteur = compteur + 2;
console.log(compteur);
~~~

**Corrigé 3 :**
~~~javascript
function carre(nombre) {
  return nombre * nombre;
}
console.log(carre(4));
~~~

**Corrigé 4 :**
~~~javascript
const paragraphe = document.querySelector("#message");
if (paragraphe) {
  paragraphe.textContent = "Texte modifié.";
}
~~~

**Corrigé 5 :**
~~~javascript
const bouton = document.querySelector("#action");
bouton.addEventListener("click", () => {
  bouton.textContent = "Activé";
});
~~~

**Corrigé 6 :**
~~~javascript
const nombre = Number(champ.value);
if (Number.isFinite(nombre)) {
  resultat.textContent = "Nombre : " + nombre;
} else {
  resultat.textContent = "Saisie invalide.";
}
~~~

Pour le défi, garde une seule variable compteur et une fonction afficherCompteur(). Chaque bouton modifie la variable puis appelle la fonction. Cela évite de répéter la mise à jour de l'écran.

## 13. Fiche de révision et validation

- HTML décrit le contenu ; CSS la présentation ; JavaScript le comportement.
- defer charge le script après l'analyse du HTML.
- const évite la réaffectation ; let l'autorise.
- === compare sans conversion implicite.
- Une fonction peut recevoir des paramètres et renvoyer une valeur.
- Le DOM représente la page sous forme d'objets.
- querySelector() sélectionne un élément.
- textContent modifie du texte.
- addEventListener() écoute un événement.
- preventDefault() empêche le comportement normal d'un formulaire.
- Vérifie les saisies et évite innerHTML avec du contenu non fiable.
- console.log() et les outils du navigateur aident au débogage.

Avant la leçon 06, tu dois pouvoir relier un fichier JavaScript à une page, écouter un clic, modifier un élément et expliquer la différence entre const et let.

**©pythonschool — Création de sites Web, leçon 05.**