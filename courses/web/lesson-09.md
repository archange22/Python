# Création de sites Web — Leçon 09 : Accessibilité Web, rendre une interface utilisable par tous

**Parcours :** Création de sites Web  
**Numéro :** 09  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 100 à 115 minutes  
**Environnement :** Navigateur moderne et éditeur HTML/CSS/JavaScript, sur téléphone ou ordinateur.  
**Prérequis :** HTML sémantique, CSS, JavaScript, formulaires et notions de publication.

## 1. Fiche de départ : objectifs et prérequis

L'accessibilité Web consiste à concevoir des pages que le plus grand nombre de personnes peut utiliser, y compris avec un clavier, un lecteur d'écran, un zoom important ou un appareil mobile. Elle améliore aussi l'expérience de personnes qui naviguent dans un environnement bruyant, avec une connexion lente ou une difficulté temporaire.

À la fin, tu sauras structurer une page avec des éléments sémantiques, rendre les contrôles utilisables au clavier, afficher un focus visible, écrire des textes alternatifs utiles, associer les labels aux champs, vérifier les contrastes et tester les interactions.

L'accessibilité ne se résume pas à ajouter des attributs ARIA. La meilleure base est un HTML correct, des comportements prévisibles et des tests avec plusieurs méthodes de navigation.

## 2. Sommaire et méthode de travail

1. Comprendre l'accessibilité
2. Utiliser une structure HTML sémantique
3. Construire une navigation au clavier
4. Rendre le focus visible
5. Distinguer lien et bouton
6. Décrire les images correctement
7. Construire des formulaires accessibles
8. Vérifier le contraste et le redimensionnement
9. Utiliser ARIA avec prudence
10. Gérer les messages dynamiques
11. Respecter les préférences de mouvement
12. Mini-projet : formulaire de contact accessible
13. Tester et déboguer
14. Exercices progressifs et corrigés
15. Fiche de révision

Pour chaque section, teste réellement le comportement dans un navigateur. Une page qui semble correcte à l'écran peut rester inutilisable au clavier ou avec un lecteur d'écran.

## 3. Comprendre l'accessibilité

L'accessibilité repose sur plusieurs principes : le contenu doit être perceptible, les commandes utilisables, les informations compréhensibles et le code suffisamment robuste pour fonctionner avec différents outils.

Exemples :
- une personne qui ne peut pas utiliser une souris doit pouvoir naviguer avec Tab et Entrée ;
- une personne qui utilise un lecteur d'écran doit comprendre le rôle d'un bouton ;
- une image informative doit avoir une description textuelle ;
- un champ de formulaire doit annoncer ce qu'il attend ;
- une page doit rester lisible lorsqu'elle est agrandie.

L'accessibilité ne concerne pas seulement les personnes en situation de handicap permanent. Une personne avec un bras immobilisé, un écran très lumineux ou un réseau lent peut aussi rencontrer des obstacles. Concevoir de façon accessible rend le site plus robuste pour tout le monde.

## 4. Utiliser une structure HTML sémantique

Les éléments sémantiques indiquent le rôle des zones de la page. Utilise **header** pour l'en-tête, **nav** pour la navigation, **main** pour le contenu principal, **section** pour un regroupement thématique et **footer** pour le pied de page.

~~~html
<header>
  <h1>Mon espace de cours</h1>
</header>

<nav aria-label="Navigation principale">
  <a href="#cours">Cours</a>
  <a href="#contact">Contact</a>
</nav>

<main>
  <section id="cours">
    <h2>Mes cours</h2>
    <p>Découvre les leçons disponibles.</p>
  </section>
</main>

<footer>
  <p>©pythonschool</p>
</footer>
~~~

Une hiérarchie de titres doit décrire l'organisation du contenu. En général, une page possède un titre principal h1, puis des h2 pour les grandes parties et des h3 pour les sous-parties. Ne choisis pas un niveau de titre uniquement pour obtenir une taille visuelle : le CSS contrôle l'apparence.

## 5. Construire une navigation au clavier

La touche **Tab** permet généralement de passer au contrôle suivant. **Shift + Tab** revient au précédent. **Entrée** active un lien ou un bouton ; la barre d'espace active généralement un bouton.

Teste le site sans toucher l'écran :
1. recharge la page ;
2. appuie sur Tab plusieurs fois ;
3. observe quel élément reçoit le focus ;
4. vérifie que l'ordre suit le sens de lecture ;
5. active les liens et boutons ;
6. vérifie que tu peux sortir de chaque composant.

Évite de créer des contrôles cliquables avec une simple div. Un élément div n'a pas automatiquement le comportement clavier d'un bouton. Un véritable élément button fournit déjà un rôle, un focus et des interactions standard.

Ne supprime pas l'accès clavier avec **tabindex="-1"** appliqué partout. Utilise tabindex seulement lorsque tu comprends précisément son effet.

## 6. Rendre le focus visible

Le focus indique quel élément recevra la prochaine action clavier. Il doit être clairement visible. Ne supprime pas l'outline sans fournir une alternative suffisamment perceptible.

~~~css
:focus-visible {
  outline: 3px solid #1b63d8;
  outline-offset: 3px;
}

a, button, input, select, textarea {
  font: inherit;
}

button {
  min-height: 44px;
  padding: 0.65rem 1rem;
}
~~~

**:focus-visible** permet de styliser le focus lorsque le navigateur estime qu'il doit être affiché, notamment lors d'une navigation clavier. Vérifie le contraste de l'indicateur avec le fond et l'élément.

Évite les animations qui déplacent fortement la page lorsque le focus change. Le focus ne doit pas être caché sous un en-tête fixe. Si une navigation ouvre un panneau, place le focus de façon logique et permets de le fermer.

## 7. Distinguer lien et bouton

Un lien mène vers une ressource ou une autre partie de la page. Un bouton déclenche une action. Cette distinction aide les navigateurs, les lecteurs d'écran et les personnes qui naviguent au clavier.

~~~html
<a href="/cours/python.html">Ouvrir le cours Python</a>

<button type="button" id="afficher-aide">
  Afficher l'aide
</button>
~~~

N'utilise pas un lien avec href="#" comme bouton d'action. Il peut modifier la position de la page et ne décrit pas correctement l'action. N'utilise pas non plus un bouton pour naviguer vers une autre page lorsque un lien est plus adapté.

Pour un bouton dans un formulaire, précise son type. **type="submit"** envoie le formulaire ; **type="button"** déclenche une action sans soumettre. Cette précision évite des envois accidentels.

## 8. Décrire les images correctement

Une image informative doit posséder un texte alternatif qui transmet son information utile. Une image décorative qui n'ajoute rien au contenu peut utiliser un attribut alt vide.

~~~html
<img src="graphique.png"
     alt="Les inscriptions passent de 20 en janvier à 35 en février.">

<img src="ornement.png" alt="">
~~~

Ne répète pas « image de » si cela n'apporte rien. Décris ce que l'image permet de comprendre. Si un graphique contient beaucoup de données, ajoute aussi un tableau ou une explication à proximité.

Le texte alternatif ne doit pas être un nom de fichier ou une liste de mots-clés. Pour une image servant de lien, le texte doit expliquer la destination ou l'action. Si l'image contient du texte essentiel, assure-toi que cette information existe également sous forme textuelle.

## 9. Construire des formulaires accessibles

Chaque champ doit avoir une étiquette visible. L'élément **label** doit être associé au champ avec for et id.

~~~html
<form>
  <label for="email">Adresse e-mail</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    required
  >

  <button type="submit">Envoyer</button>
</form>
~~~

Le placeholder est un exemple ou une indication temporaire. Il ne remplace pas le label, car il disparaît souvent lorsque la personne commence à écrire.

Les erreurs doivent expliquer comment corriger le champ. Ne signale pas un problème uniquement avec une couleur rouge. Ajoute un texte clair et relie l'explication au champ avec **aria-describedby** lorsque cela est nécessaire.

## 10. Vérifier le contraste et le redimensionnement

Le contraste est la différence de luminosité entre le texte et son arrière-plan. Un contraste insuffisant rend la lecture difficile, notamment pour les petits textes ou les écrans utilisés en extérieur.

Pour le texte courant, les recommandations WCAG couramment utilisées visent un ratio d'au moins 4,5:1. Pour le grand texte, le seuil courant est 3:1. Les composants et indicateurs visuels importants ont aussi des exigences de contraste.

Ne code pas une information uniquement par la couleur. Ajoute un libellé, une icône accompagnée d'un texte ou un motif. Vérifie également que le site reste utilisable avec un zoom élevé et une fenêtre étroite.

~~~css
.container {
  width: min(100% - 2rem, 900px);
  margin-inline: auto;
}

img {
  max-width: 100%;
  height: auto;
}
~~~

Évite les largeurs fixes qui obligent à faire défiler horizontalement toute la page. Le contenu doit se réorganiser sans perdre d'information.

## 11. Utiliser ARIA avec prudence

ARIA permet de compléter les informations accessibles lorsqu'un élément HTML natif ne suffit pas. Mais un attribut ARIA incorrect peut rendre une interface plus confuse.

Exemple d'état :

~~~html
<button type="button"
        aria-expanded="false"
        aria-controls="details">
  Afficher les détails
</button>

<div id="details" hidden>
  Informations complémentaires.
</div>
~~~

Lorsque le bouton ouvre le panneau, JavaScript doit mettre à jour **aria-expanded** et retirer l'attribut hidden. L'état annoncé doit correspondre à l'état réel.

Privilégie toujours un élément HTML natif. N'ajoute pas role="button" à une div si un vrai button peut être utilisé. ARIA décrit le rôle et l'état ; il ne crée pas automatiquement le comportement clavier.

## 12. Gérer les messages dynamiques et le mouvement

Lorsqu'une action affiche un résultat sans recharger la page, certaines personnes peuvent ne pas remarquer le changement. Un statut accessible permet d'annoncer le résultat.

~~~html
<p id="resultat" role="status" aria-live="polite"></p>
~~~

~~~javascript
const resultat = document.querySelector("#resultat");
resultat.textContent = "Le formulaire a été envoyé.";
~~~

Utilise une annonce adaptée. Ne répète pas en permanence un texte qui change très souvent. Pour une erreur urgente, un mécanisme d'alerte peut être approprié, mais il ne faut pas interrompre l'utilisateur inutilement.

Respecte aussi la préférence de réduction des animations :

~~~css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
~~~

Une animation décorative ne doit pas empêcher de lire ou de contrôler la page.

## 13. Mini-projet : formulaire de contact accessible

Crée une page contenant un titre, une courte explication, un formulaire et une zone de statut. Le formulaire ne doit pas envoyer de données sur Internet : il sert à apprendre la structure et la validation locale.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contact accessible</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
</head>
<body>
  <main>
    <h1>Contacter l'équipe</h1>
    <p>Remplis les champs pour tester le formulaire.</p>

    <form id="contact">
      <label for="nom">Nom</label>
      <input id="nom" name="nom" required>

      <label for="email">Adresse e-mail</label>
      <input id="email" name="email"
             type="email" required>

      <label for="message">Message</label>
      <textarea id="message" name="message"
                rows="5" required></textarea>

      <button type="submit">Vérifier le formulaire</button>
    </form>

    <p id="statut" role="status" aria-live="polite"></p>
  </main>
</body>
</html>
~~~

~~~css
* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 1rem;
  color: #20242a;
  background: #f4f6f8;
  font: 1rem/1.5 system-ui, sans-serif;
}

main {
  width: min(100%, 650px);
  margin: 2rem auto;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
}

label {
  display: block;
  margin-top: 1rem;
  font-weight: 700;
}

input, textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #555;
  border-radius: 6px;
  font: inherit;
}

button {
  margin-top: 1rem;
  min-height: 44px;
  padding: 0.7rem 1rem;
}

:focus-visible {
  outline: 3px solid #155fc4;
  outline-offset: 3px;
}
~~~

~~~javascript
const formulaire = document.querySelector("#contact");
const statut = document.querySelector("#statut");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!formulaire.reportValidity()) {
    statut.textContent = "Vérifie les champs signalés.";
    return;
  }

  statut.textContent = "Les champs sont valides. Aucun message n'a été envoyé.";
});
~~~

Teste le formulaire avec Tab, avec un zoom important et sur un écran étroit. Le message indique clairement qu'aucune donnée n'a été envoyée.

## 14. Tester et déboguer l'accessibilité

| Problème | Cause possible | Test |
|---|---|---|
| Contrôle inaccessible au clavier | Div cliquable | Remplacer par button ou a |
| Focus invisible | Outline supprimé | Tester Tab |
| Image incompréhensible | Alt absent ou vague | Lire le texte alternatif |
| Champ non annoncé | Label non associé | Vérifier for et id |
| Erreur annoncée seulement en rouge | Information par couleur | Ajouter un texte |
| Page déborde | Largeur fixe | Tester écran étroit et zoom |
| Panneau mal annoncé | aria-expanded incorrect | Vérifier l'état réel |
| Animation gênante | Préférence ignorée | Tester reduced-motion |

Une vérification automatique peut détecter certains problèmes, mais elle ne remplace pas les essais humains. Teste au clavier, avec un lecteur d'écran si disponible, avec zoom et sur plusieurs tailles d'écran. Demande aussi à une autre personne de suivre un parcours simple sans explication préalable.

## 15. Exercices progressifs, corrigés et fiche de révision

**Exercice 1 :** remplace une div cliquable par un élément HTML natif adapté.

**Exercice 2 :** écris un label et un champ e-mail correctement associés.

**Exercice 3 :** donne un texte alternatif utile pour un graphique qui montre une hausse de fréquentation.

**Exercice 4 :** explique pourquoi le placeholder ne remplace pas le label.

**Exercice 5 :** propose trois tests clavier pour une page de contact.

### Corrigé 1

Utilise un élément button pour une action ou un élément a avec href pour une navigation. Les éléments natifs possèdent déjà un comportement clavier connu.

### Corrigé 2

~~~html
<label for="email">Adresse e-mail</label>
<input id="email" name="email" type="email">
~~~

La valeur de for doit correspondre exactement à l'id du champ.

### Corrigé 3

Exemple : « Le nombre de visites augmente de 120 en mars à 180 en avril. » Le texte doit décrire l'information utile, pas seulement le type d'image.

### Corrigé 4

Le placeholder disparaît souvent lors de la saisie et n'est pas toujours annoncé comme une étiquette. Le label reste visible et identifie le champ.

### Corrigé 5

Parcours la page avec Tab et Shift+Tab, active chaque contrôle avec Entrée ou Espace, puis vérifie que le focus ne reste pas bloqué dans un composant.

### Fiche de révision

| Notion | Rôle |
|---|---|
| Sémantique HTML | Décrire la structure |
| Clavier | Permettre la navigation sans souris |
| Focus-visible | Montrer le contrôle actif |
| Label | Identifier un champ |
| Alt | Décrire une image informative |
| Contraste | Faciliter la lecture |
| ARIA | Compléter le sens et l'état |
| Live region | Annoncer un changement |
| Reduced motion | Respecter les préférences |
| Test manuel | Vérifier le vrai parcours utilisateur |

Avant la leçon 10, vérifie que tu sais utiliser les éléments sémantiques, parcourir un site au clavier, écrire des labels et des textes alternatifs, tester le contraste et expliquer les limites d'une vérification automatique.

**À retenir :** l'accessibilité se construit dès le HTML. Un site accessible est compréhensible, navigable, prévisible et testable avec plusieurs modes d'utilisation.

---

*©pythonschool — Création de sites Web, Leçon 09.*