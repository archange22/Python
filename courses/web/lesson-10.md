# Création de sites Web — Leçon 10 : Sécuriser les interactions et les données côté navigateur

**Parcours :** Création de sites Web  
**Numéro :** 10  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 110 à 120 minutes  
**Environnement :** Navigateur mobile ou ordinateur, éditeur de texte et fichiers HTML/CSS/JavaScript locaux.  
**Prérequis :** HTML, CSS, JavaScript, événements, formulaires, fetch, JSON, accessibilité et publication d'un site statique.

## 1. Fiche de départ : objectifs et prérequis

Une page Web reçoit des données : texte saisi dans un formulaire, résultat d'une API, nom d'un utilisateur ou contenu d'un document. Ces données ne sont pas automatiquement fiables. Si le site les insère sans précaution dans le HTML, elles peuvent modifier la page ou déclencher un comportement non prévu.

Cette leçon présente les bases de la sécurité côté navigateur. Tu apprendras à distinguer texte et HTML, utiliser textContent, créer des éléments DOM de manière sûre, vérifier les URL, comprendre les limites de la validation côté client, protéger les secrets et tester les comportements.

Le but n'est pas de devenir expert en cybersécurité en une leçon. Il s'agit d'adopter de bons réflexes dès le début. Les exemples fonctionnent dans un navigateur moderne sur téléphone ou ordinateur et n'envoient aucune donnée vers un serveur.

## 2. Sommaire et méthode de travail

1. Comprendre les données non fiables
2. Identifier les zones sensibles d'une page
3. Insérer du texte avec textContent
4. Comprendre le risque lié à innerHTML
5. Créer des éléments DOM sans interpréter du code
6. Vérifier les URL et les liens externes
7. Valider les formulaires sans confondre client et serveur
8. Protéger les clés et les informations privées
9. Comprendre stockage local, cookies et sessions
10. Comprendre HTTPS, CORS et les en-têtes de sécurité
11. Mini-projet : afficher des résultats de recherche en sécurité
12. Tester et déboguer les erreurs courantes
13. Exercices et corrigés
14. Fiche de révision

Ouvre une page HTML locale et teste chaque exemple avec des données fictives. Ne colle pas de données personnelles dans les exercices.

## 3. Comprendre les données non fiables

Une donnée non fiable est une valeur dont le programme ne contrôle pas complètement l'origine ou le contenu. Elle peut venir d'un formulaire, d'une API, d'un fichier importé, d'une URL ou d'un autre utilisateur.

Même si une donnée vient d'un service connu, elle doit être traitée selon son usage. Une API peut renvoyer un champ vide, un texte inattendu ou un lien vers un domaine différent. Le navigateur ne sait pas automatiquement si ce contenu est digne de confiance.

Exemples : un nom saisi dans un formulaire ; le titre d'un article récupéré par fetch ; un paramètre présent dans l'adresse de la page ; un texte importé depuis un fichier JSON ; un commentaire publié par un autre utilisateur.

La règle de base : afficher une valeur comme du texte si tu veux montrer du texte. Ne transforme pas une chaîne reçue en HTML ou en code sans raison précise. La validation et l'encodage doivent correspondre au contexte d'utilisation.

## 4. Identifier les zones sensibles d'une page

Le DOM est la représentation structurée de la page que JavaScript peut consulter et modifier. Certains points d'entrée reçoivent des données ; certains points de sortie les affichent, les utilisent dans une URL ou les transmettent à une requête.

Une zone sensible peut être un élément qui reçoit du texte avec innerHTML, un lien dont href vient d'une API, un formulaire qui envoie des données, un appel fetch vers une adresse construite à partir d'une saisie ou un stockage local contenant des informations de session.

Pour chaque donnée, pose trois questions : d'où vient-elle ? que va-t-on en faire ? quel contrôle est nécessaire avant son utilisation ?

Cette méthode est appelée analyse du flux de données. Elle évite de croire qu'une valeur est sûre simplement parce qu'elle est passée par une variable JavaScript. Une variable ne nettoie rien ; elle transporte une valeur.

## 5. Insérer du texte avec textContent

La propriété **textContent** insère ou lit le texte d'un élément. Le navigateur ne transforme pas les caractères reçus en balises HTML.

~~~html
<p id="message"></p>
<input id="saisie" type="text" value="<strong>Bonjour</strong>">
<button id="afficher" type="button">Afficher</button>

<script>
const champ = document.querySelector("#saisie");
const message = document.querySelector("#message");
const bouton = document.querySelector("#afficher");

bouton.addEventListener("click", function () {
  message.textContent = champ.value;
});
</script>
~~~

Si la saisie contient des caractères qui ressemblent à une balise, ils sont affichés comme du texte. C'est le comportement souhaité lorsque l'objectif est de montrer le contenu d'un champ.

Utilise textContent pour les titres, commentaires, noms, messages et résultats textuels. Il ne faut pas concaténer une chaîne provenant d'un utilisateur pour construire du HTML. Pour modifier le style, utilise les classes CSS ou les propriétés prévues à cet effet.

Attention : textContent n'est pas une protection universelle pour tous les contextes. Une valeur placée dans une URL, un attribut particulier ou une requête doit être vérifiée selon cet usage.

## 6. Comprendre le risque lié à innerHTML

La propriété **innerHTML** interprète une chaîne comme du HTML. C'est utile lorsque tu construis volontairement une structure connue, mais dangereux si la chaîne contient des données non fiables.

~~~javascript
const zone = document.querySelector("#resultat");
const nom = "Texte fourni par un utilisateur";

// Préférer :
zone.textContent = nom;
~~~

Évite ce type d'assemblage avec une valeur reçue :

~~~javascript
// À éviter avec une donnée non fiable :
zone.innerHTML = "<p>" + nom + "</p>";
~~~

Le problème n'est pas seulement l'apparence. Le contenu interprété peut introduire des éléments ou attributs inattendus. Une faille de type XSS (Cross-Site Scripting) peut permettre l'exécution de scripts dans le contexte de la page.

Si tu dois afficher du HTML riche provenant d'une source externe, utilise une solution de nettoyage reconnue, maintenue et configurée selon un besoin précis. Ne tente pas de créer ton propre filtre en supprimant quelques caractères : les formats HTML sont complexes.

Pour un débutant, la règle la plus sûre est simple : ne pas utiliser innerHTML pour afficher une saisie ou une réponse d'API.

## 7. Créer des éléments DOM sans interpréter du code

Tu peux créer un élément avec document.createElement, lui attribuer un texte avec textContent, puis l'ajouter à la page.

~~~javascript
const liste = document.querySelector("#resultats");
const titre = "Cours JavaScript";

const carte = document.createElement("article");
const h2 = document.createElement("h2");

h2.textContent = titre;
carte.appendChild(h2);
liste.appendChild(carte);
~~~

Le navigateur crée une véritable structure DOM. Le titre reste du texte. Cette méthode est un peu plus longue que innerHTML, mais elle rend plus claire la séparation entre structure et données.

Pour les classes, utilise classList.add. Pour les attributs standards, utilise les propriétés prévues lorsque c'est possible. N'utilise pas une chaîne reçue comme nom d'événement ou comme code à exécuter.

Lorsque tu crées plusieurs cartes, utilise une fonction dédiée. Une fonction afficherCarte(donnee) peut vérifier les champs attendus, créer les éléments et renvoyer la carte. Cela évite de recopier les mêmes instructions et facilite les tests.

## 8. Vérifier les URL et les liens externes

Une URL reçue d'une API ne doit pas être utilisée aveuglément. Elle peut utiliser un protocole inattendu ou pointer vers un site qui n'a aucun rapport avec ton application.

Tu peux analyser une URL avec le constructeur URL et vérifier son protocole :

~~~javascript
function urlWebValide(texte) {
  try {
    const url = new URL(texte);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

console.log(urlWebValide("https://example.com"));
console.log(urlWebValide("javascript:alert(1)"));
~~~

Pour un site public, tu peux exiger HTTPS. Si ton application doit ouvrir uniquement certains domaines, compare aussi url.hostname à une liste autorisée. Une simple vérification qui cherche le texte « example.com » dans la chaîne est insuffisante.

Lorsqu'un lien s'ouvre dans un nouvel onglet avec target="_blank", utilise rel="noopener noreferrer" lorsque cela convient. Cela limite certains accès entre la page ouverte et la page d'origine.

Un lien doit annoncer sa destination. N'affiche pas « cliquer ici » partout ; préfère un texte qui décrit le site ou la ressource.

## 9. Valider les formulaires : client et serveur

HTML peut vérifier des contraintes simples : champ obligatoire, type e-mail, longueur minimale ou valeur numérique. JavaScript peut améliorer les messages et guider l'utilisateur.

~~~html
<form id="contact">
  <label for="nom">Nom</label>
  <input id="nom" name="nom" required minlength="2">

  <label for="email">Adresse e-mail</label>
  <input id="email" name="email" type="email" required>

  <button type="submit">Vérifier</button>
</form>
<p id="statut" role="status" aria-live="polite"></p>
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

  statut.textContent = "Les champs sont valides dans ce navigateur.";
});
~~~

La validation côté navigateur améliore l'expérience, mais elle peut être contournée. Un serveur doit toujours vérifier les données avant de les enregistrer ou d'effectuer une action importante. Ne fais jamais confiance à une valeur uniquement parce que le formulaire HTML l'a acceptée.

Les messages doivent être compréhensibles, liés au champ concerné et accessibles au clavier. Ne signale pas une erreur uniquement par une couleur.

## 10. Protéger les clés et les informations privées

Le code JavaScript livré au navigateur est visible par les visiteurs. Une clé écrite dans un fichier app.js ou dans le HTML n'est pas secrète, même si son nom semble difficile à deviner.

Ne place jamais dans un site statique un mot de passe de base de données, une clé privée donnant des droits élevés, un token d'administration, un secret de paiement ou une clé d'API qui doit rester confidentielle.

Si un service exige un secret, utilise un serveur intermédiaire qui vérifie les droits et protège la clé. Pour un projet débutant, préfère une API publique conçue pour être appelée depuis le navigateur ou un jeu de données local fictif.

Une clé publique peut parfois être prévue pour un usage navigateur, avec des restrictions de domaine et de quotas. Elle n'est pas équivalente à un secret privé. Lis la documentation du fournisseur avant de publier une clé.

Si une clé secrète a été publiée, révoque-la et remplace-la. Effacer la ligne du fichier ne retire pas forcément sa valeur de l'historique Git.

## 11. Stockage local, HTTPS, CORS et mini-projet

localStorage conserve des chaînes dans le navigateur. Il est utile pour des préférences non sensibles, comme le thème choisi. Il ne doit pas servir à stocker un mot de passe ou un token privilégié. Toute personne ayant accès au navigateur peut consulter les valeurs.

Les cookies peuvent être configurés avec des attributs comme Secure, HttpOnly et SameSite. HttpOnly empêche JavaScript de lire le cookie, mais seul un serveur peut le définir correctement. Le stockage d'une session nécessite une conception côté serveur.

HTTPS chiffre le transport entre le navigateur et le serveur. Il protège les échanges contre certaines interceptions, mais ne rend pas automatiquement une application sûre. CORS est un mécanisme de navigateur qui contrôle certaines lectures entre origines ; ce n'est pas un système d'authentification.

Mini-projet : afficher une liste de résultats fictifs de manière sûre.

~~~html
<ul id="resultats"></ul>
<script>
const donnees = [
  { titre: "Cours Python", description: "Bases et objets" },
  { titre: "Cours Web", description: "HTML, CSS et JavaScript" }
];

const liste = document.querySelector("#resultats");

for (const donnee of donnees) {
  const item = document.createElement("li");
  const titre = document.createElement("strong");
  const description = document.createElement("p");

  titre.textContent = donnee.titre;
  description.textContent = donnee.description;

  item.appendChild(titre);
  item.appendChild(description);
  liste.appendChild(item);
}
</script>
~~~

Modifie les textes avec des caractères qui ressemblent à des balises et observe qu'ils restent affichés comme du texte. Le projet ne contacte aucun serveur et n'enregistre aucune donnée personnelle.

## 12. Tester et déboguer les comportements

Teste chaque flux avec des valeurs normales, vides, très longues et inattendues. Pour une URL, essaie un domaine autorisé, un domaine inconnu et un protocole refusé. Pour un formulaire, teste les champs vides et les formats incorrects.

| Symptôme | Cause possible | Méthode de vérification |
|---|---|---|
| Une balise apparaît dans le texte | Donnée affichée littéralement | Vérifier si textContent est attendu |
| Une structure inattendue apparaît | HTML non fiable interprété | Rechercher innerHTML |
| Un lien mène ailleurs | URL non contrôlée | Analyser protocole et domaine |
| Une clé apparaît dans le code | Secret placé côté client | Révoquer et déplacer côté serveur |
| Formulaire accepté à tort | Contrôle uniquement côté client | Vérifier aussi côté serveur |
| Données visibles après fermeture | localStorage utilisé | Examiner les clés locales |
| API bloquée par le navigateur | Politique CORS | Lire la réponse réseau et la configuration serveur |

Utilise la console du navigateur pour repérer les erreurs JavaScript. Inspecte la valeur reçue avant de l'afficher, mais ne copie pas de données privées dans une capture ou un message public. Corrige une cause à la fois puis rejoue le même test.

## 13. Exercices progressifs et corrigés expliqués

**Exercice A :** explique pourquoi textContent est préférable à innerHTML pour afficher un commentaire.

**Exercice B :** écris une fonction qui accepte uniquement une URL HTTPS.

**Exercice C :** explique pourquoi une validation HTML ne suffit pas pour protéger une base de données.

**Exercice D :** cite deux données qui ne doivent pas être stockées dans localStorage.

**Exercice E :** modifie le mini-projet pour afficher aussi la catégorie d'un cours en créant un élément span.

### Correction A

textContent traite la valeur comme du texte. innerHTML demande au navigateur d'interpréter la chaîne comme une structure HTML, ce qui peut créer un risque lorsque la valeur n'est pas fiable.

### Correction B

~~~javascript
function httpsValide(texte) {
  try {
    return new URL(texte).protocol === "https:";
  } catch {
    return false;
  }
}
~~~

Le bloc try permet de traiter une URL mal formée. Pour un projet réel, il faut éventuellement vérifier aussi le nom de domaine.

### Correction C

Un utilisateur peut désactiver JavaScript, modifier une requête ou envoyer directement des données au serveur. Le serveur doit refaire les validations et appliquer les droits.

### Correction D

Un mot de passe et un token d'administration ne doivent pas être stockés dans localStorage. Les valeurs qui donnent un accès privilégié doivent rester dans un mécanisme adapté côté serveur.

### Correction E

~~~javascript
const categorie = document.createElement("span");
categorie.textContent = "Débutant";
item.appendChild(categorie);
~~~

L'élément est créé par le DOM et sa valeur est insérée comme du texte.

## 14. Fiche de révision et validation

| Notion | À retenir |
|---|---|
| Donnée non fiable | Valeur dont le contenu n'est pas contrôlé |
| DOM | Structure de la page manipulable en JavaScript |
| textContent | Insère du texte |
| innerHTML | Interprète une chaîne comme du HTML |
| XSS | Exécution de contenu non prévu dans une page |
| createElement | Crée un élément DOM |
| URL | À analyser avant de l'utiliser |
| Validation client | Améliore l'expérience, ne protège pas seule le serveur |
| Secret | Ne doit pas être livré au navigateur |
| localStorage | Stockage local non adapté aux secrets |
| HTTPS | Protège le transport |
| CORS | Contrôle certaines lectures entre origines |

Avant la leçon 11, vérifie que tu sais afficher une saisie avec textContent, expliquer le risque de innerHTML, vérifier une URL, distinguer validation client et serveur et reconnaître une clé secrète exposée dans le code.

**À retenir :** le navigateur reçoit des données qu'il ne contrôle pas toujours. Affiche-les comme du texte, vérifie leur usage, protège les secrets côté serveur et ne confonds jamais une validation visuelle avec une véritable autorisation.

---

*©pythonschool — Création de sites Web, Leçon 10.*