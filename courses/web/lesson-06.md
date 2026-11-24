# Création de sites Web — Leçon 06 : JavaScript asynchrone et API avec fetch

**Parcours :** Création de sites Web  
**Numéro :** 06  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 100 à 130 minutes  
**Environnement :** Téléphone ou ordinateur avec un navigateur et un éditeur de texte.  
**Prérequis :** HTML, CSS, JavaScript, variables, fonctions, DOM et événements.

## Objectifs et prérequis

Un site Web demande souvent des informations à un service distant : une liste d'articles, un catalogue ou des données publiques. La réponse ne revient pas toujours immédiatement. JavaScript doit donc pouvoir attendre sans bloquer toute la page.

Dans cette leçon, tu vas comprendre les opérations asynchrones, les Promises, async et await, puis utiliser fetch() pour demander des données à une API. Tu apprendras aussi à gérer les erreurs, afficher un état de chargement et protéger les données reçues.

À la fin, tu sauras :
- expliquer la différence entre code synchrone et asynchrone ;
- reconnaître les états d'une Promise ;
- utiliser async et await ;
- envoyer une requête HTTP avec fetch() ;
- vérifier le statut de la réponse et lire du JSON ;
- afficher les données avec textContent ;
- gérer les erreurs réseau, les réponses invalides et l'absence de connexion ;
- expliquer pourquoi une clé secrète ne doit pas être placée dans le JavaScript public.

Les exemples peuvent être testés sur téléphone et ordinateur. Une connexion Internet est nécessaire uniquement pour les appels à l'API de démonstration.

## Sommaire

1. Pourquoi le JavaScript asynchrone existe
2. Comprendre les Promises
3. Utiliser async et await
4. Comprendre HTTP et les API
5. Envoyer une requête avec fetch
6. Vérifier la réponse et lire JSON
7. Afficher les données dans le DOM
8. Gérer le chargement et les erreurs
9. Envoyer des données avec POST
10. Comprendre CORS et protéger les secrets
11. Mini-projet : lecteur d'un article distant
12. Exercices progressifs
13. Corrigés expliqués
14. Fiche de révision

## 1. Pourquoi le JavaScript asynchrone existe

Certaines opérations prennent du temps : télécharger une image, contacter une API ou lire un fichier. Si le navigateur attendait chaque opération en bloquant toute la page, les boutons et le défilement pourraient devenir inutilisables.

Le code synchrone exécute une instruction puis passe à la suivante. Le code asynchrone permet de lancer une opération qui se terminera plus tard, pendant que le navigateur continue à gérer l'interface.

Analogie : tu commandes un repas. Tu n'es pas obligé de rester immobile devant le comptoir pendant la préparation. Tu reçois un signal lorsque la commande est prête. Une requête réseau fonctionne de manière comparable.

L'asynchronisme ne signifie pas que le code s'exécute toujours en parallèle sur un autre processeur. Cela signifie que le programme peut organiser la suite du travail sans attendre de manière bloquante la fin d'une opération.

## 2. Comprendre les Promises

Une Promise représente le résultat futur d'une opération asynchrone. Elle possède trois états :
- pending : opération en attente ;
- fulfilled : opération réussie ;
- rejected : opération échouée.

Une Promise peut être traitée avec then() et catch() :

~~~javascript
const resultat = Promise.resolve("Données prêtes");

resultat
  .then(function (valeur) {
    console.log(valeur);
  })
  .catch(function (erreur) {
    console.log("Erreur :", erreur);
  });
~~~

then() reçoit la valeur lorsque la Promise réussit. catch() traite un rejet.

Une Promise ne contient pas nécessairement les données immédiatement. Elle représente une opération dont le résultat arrivera plus tard.

Ne confonds pas une Promise avec la valeur finale. Si tu affiches directement une Promise, tu verras un objet de promesse et non les données attendues.

## 3. Utiliser async et await

Le mot-clé async indique qu'une fonction renvoie une Promise. await attend le résultat d'une Promise à l'intérieur d'une fonction async.

~~~javascript
function attendreValeur() {
  return Promise.resolve(42);
}

async function afficherValeur() {
  const valeur = await attendreValeur();
  console.log(valeur);
}

afficherValeur();
~~~

await rend le code plus facile à lire, car les étapes apparaissent dans l'ordre logique. Il ne bloque pas tout le navigateur pendant l'attente réseau.

Une erreur rejetée peut être traitée avec try et catch :

~~~javascript
async function charger() {
  try {
    const valeur = await Promise.reject("Exemple d'erreur");
    console.log(valeur);
  } catch (erreur) {
    console.log("Opération impossible :", erreur);
  }
}

charger();
~~~

Place uniquement les opérations qui peuvent échouer dans une zone try adaptée. Le bloc catch doit permettre de présenter un message utile et de conserver les détails nécessaires au diagnostic sans afficher de données sensibles.

## 4. Comprendre HTTP et les API

Une API est une interface qui permet à des programmes d'échanger des informations. Une API Web utilise souvent HTTP ou HTTPS.

Une requête HTTP contient notamment :
- une méthode, comme GET pour demander des données ou POST pour envoyer des données ;
- une adresse, appelée URL ;
- éventuellement des en-têtes ;
- parfois un corps contenant des données.

Le serveur renvoie une réponse avec un statut et éventuellement un contenu. Un statut de la famille 2xx indique généralement une réussite. 4xx indique souvent un problème dans la requête ou l'autorisation. 5xx indique une erreur du serveur.

Exemples :
- 200 : requête réussie ;
- 201 : ressource créée ;
- 400 : requête incorrecte ;
- 401 : authentification nécessaire ou invalide ;
- 403 : accès refusé ;
- 404 : ressource introuvable ;
- 500 : erreur interne du serveur.

Une API peut renvoyer du JSON, un format texte structuré couramment utilisé pour échanger des données. JSON ressemble aux objets JavaScript, mais il s'agit d'un format de données.

## 5. Envoyer une requête avec fetch

fetch() envoie une requête et renvoie une Promise. Exemple avec une API de démonstration publique :

~~~javascript
async function chargerArticle() {
  const reponse = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1"
  );

  console.log(reponse);
}

chargerArticle();
~~~

L'appel démarre une requête GET. Le navigateur attend la réponse sans bloquer l'interface.

Important : fetch() ne rejette pas automatiquement sa Promise pour chaque statut HTTP d'erreur. Une réponse 404 peut tout de même être reçue normalement. Il faut donc vérifier reponse.ok.

~~~javascript
async function chargerArticle() {
  const reponse = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1"
  );

  if (!reponse.ok) {
    throw new Error("Réponse HTTP : " + reponse.status);
  }

  const article = await reponse.json();
  console.log(article);
}

chargerArticle();
~~~

La méthode json() lit le corps de la réponse et le transforme en données JavaScript. Elle renvoie elle-même une Promise.

## 6. Vérifier la réponse et lire JSON

Une réponse valide n'est pas nécessairement celle que ton application attend. Le serveur peut renvoyer un objet sans le champ attendu, ou un format différent.

~~~javascript
async function lireTitre() {
  const reponse = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1"
  );

  if (!reponse.ok) {
    throw new Error("Le serveur a répondu " + reponse.status);
  }

  const donnees = await reponse.json();

  if (typeof donnees.title !== "string") {
    throw new Error("Le titre est absent ou invalide.");
  }

  return donnees.title;
}
~~~

Vérifie les champs avant de les utiliser. Ne suppose pas que le serveur renvoie toujours exactement la même structure.

JSON peut contenir des chaînes, des nombres, des booléens, null, des tableaux et des objets. Il ne contient pas de fonctions JavaScript.

Pour envoyer un objet JSON avec POST, on utilise généralement JSON.stringify() pour le transformer en texte et un en-tête Content-Type adapté.

## 7. Afficher les données dans le DOM

Après avoir reçu les données, il faut les présenter dans la page. Sélectionne les éléments HTML puis utilise textContent pour afficher du texte.

~~~html
<main>
  <h1>Article distant</h1>
  <p id="etat" aria-live="polite">En attente.</p>
  <h2 id="titre"></h2>
  <p id="texte"></p>
  <button id="charger" type="button">Charger l'article</button>
</main>
~~~

~~~javascript
const etat = document.querySelector("#etat");
const titre = document.querySelector("#titre");
const texte = document.querySelector("#texte");

async function chargerArticle() {
  etat.textContent = "Chargement...";
  titre.textContent = "";
  texte.textContent = "";

  try {
    const reponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    if (!reponse.ok) {
      throw new Error("HTTP " + reponse.status);
    }

    const article = await reponse.json();

    titre.textContent = article.title;
    texte.textContent = article.body;
    etat.textContent = "Article chargé.";
  } catch (erreur) {
    etat.textContent = "Impossible de charger l'article.";
    console.error("Échec du chargement :", erreur);
  }
}

document.querySelector("#charger").addEventListener(
  "click",
  chargerArticle
);
~~~

textContent affiche la donnée comme du texte. Évite d'insérer directement un contenu distant avec innerHTML. Une API peut renvoyer du texte inattendu ou malveillant ; l'interpréter comme du HTML peut créer une faille d'injection.

## 8. Gérer le chargement et les erreurs

Une interface doit informer la personne pendant l'attente. Trois états simples sont utiles :
1. chargement ;
2. réussite ;
3. erreur.

Le message doit être mis à jour à chaque tentative. Sinon, l'utilisateur peut croire que les anciennes données sont le résultat de la dernière requête.

~~~javascript
async function demanderDonnees() {
  etat.textContent = "Chargement...";

  try {
    const reponse = await fetch(URL_API);

    if (!reponse.ok) {
      throw new Error("Statut HTTP " + reponse.status);
    }

    const donnees = await reponse.json();
    afficherDonnees(donnees);
    etat.textContent = "Données actualisées.";
  } catch (erreur) {
    etat.textContent = "Service indisponible. Réessaie plus tard.";
    console.error(erreur);
  }
}
~~~

Les causes possibles sont nombreuses : absence d'Internet, serveur indisponible, URL incorrecte, refus CORS, délai dépassé ou JSON invalide.

Ne présente pas une erreur réseau comme une erreur de mot de passe. Le message destiné à l'utilisateur doit rester compréhensible et ne pas exposer de détails techniques.

Tu peux ajouter un bouton Réessayer. Évite cependant de relancer automatiquement une requête sans limite, car cela peut surcharger le service.

## 9. Envoyer des données avec POST

GET demande généralement une ressource. POST envoie des données au serveur pour créer ou traiter une ressource selon l'API.

~~~javascript
async function envoyerArticle() {
  const nouvelArticle = {
    title: "Mon premier article",
    body: "Un texte de démonstration.",
    userId: 1
  };

  const reponse = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nouvelArticle)
    }
  );

  if (!reponse.ok) {
    throw new Error("Envoi impossible : " + reponse.status);
  }

  const resultat = await reponse.json();
  console.log(resultat);
}
~~~

JSONPlaceholder est un service de démonstration. Il simule la création et peut renvoyer un identifiant, mais ne constitue pas une vraie base de données durable pour ton application.

Avant d'envoyer des données, vérifie les champs, limite les tailles et demande uniquement les informations nécessaires. Une validation côté navigateur améliore l'expérience, mais un serveur doit refaire ses propres contrôles.

## 10. Comprendre CORS et protéger les secrets

CORS est un mécanisme de sécurité du navigateur. Il contrôle si une page chargée depuis une origine peut lire certaines réponses d'une autre origine.

Une origine correspond notamment au protocole, au nom d'hôte et au port. Une API peut refuser une requête provenant d'un autre site. Ce refus ne signifie pas nécessairement que l'API est hors ligne.

Ne tente pas de contourner CORS avec des méthodes non sûres. Le serveur de l'API doit autoriser les origines appropriées. Si tu contrôles l'API, configure ses en-têtes selon le besoin réel.

Une clé API secrète ne doit jamais être placée dans un fichier JavaScript public. Toute personne peut consulter le code envoyé au navigateur. Pour une clé privée, utilise un serveur qui protège le secret et vérifie les autorisations.

Ne place pas de mot de passe, token ou donnée privée dans localStorage sans comprendre les risques. Limite les données conservées et prévois une procédure de suppression.

## 11. Mini-projet : lecteur d'un article distant

Crée deux fichiers, index.html et app.js, dans le même dossier. Tu peux ouvrir la page sur téléphone ou ordinateur. Le bouton lance une requête vers une API de démonstration.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lecteur d'article</title>
  <script src="app.js" defer></script>
  <style>
    body {
      max-width: 700px;
      margin: 24px auto;
      padding: 16px;
      font-family: system-ui, sans-serif;
      line-height: 1.6;
    }

    button {
      padding: 12px 16px;
      border: 0;
      border-radius: 8px;
      background: #8b3fd1;
      color: white;
      font-weight: bold;
    }

    #etat {
      min-height: 1.5em;
    }
  </style>
</head>
<body>
  <main>
    <h1>Lecteur d'article</h1>
    <p id="etat" aria-live="polite">Prêt.</p>
    <h2 id="titre">Aucun article</h2>
    <p id="texte">Appuie sur le bouton pour charger.</p>
    <button id="charger" type="button">Charger</button>
  </main>
</body>
</html>
~~~

~~~javascript
const bouton = document.querySelector("#charger");
const etat = document.querySelector("#etat");
const titre = document.querySelector("#titre");
const texte = document.querySelector("#texte");

async function charger() {
  bouton.disabled = true;
  etat.textContent = "Chargement...";
  titre.textContent = "";
  texte.textContent = "";

  try {
    const reponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    if (!reponse.ok) {
      throw new Error("HTTP " + reponse.status);
    }

    const article = await reponse.json();

    if (
      typeof article.title !== "string" ||
      typeof article.body !== "string"
    ) {
      throw new Error("Format de réponse inattendu.");
    }

    titre.textContent = article.title;
    texte.textContent = article.body;
    etat.textContent = "Chargement terminé.";
  } catch (erreur) {
    etat.textContent = "Connexion impossible. Vérifie Internet.";
    console.error(erreur);
  } finally {
    bouton.disabled = false;
  }
}

bouton.addEventListener("click", charger);
~~~

finally s'exécute après la réussite ou l'échec. Ici, il réactive le bouton. Teste avec Internet activé, puis coupe temporairement la connexion pour observer le message d'erreur.

## 12. Exercices progressifs

1. Explique les trois états d'une Promise.
2. Écris une fonction async qui attend Promise.resolve("OK") et affiche le résultat.
3. Utilise fetch() pour demander un article de démonstration.
4. Vérifie reponse.ok avant de lire le JSON.
5. Affiche le titre avec textContent.
6. Ajoute un état de chargement et un message d'erreur.
7. Explique pourquoi une clé API secrète ne doit pas être publiée dans app.js.
8. Défi : ajoute un champ numérique pour choisir l'identifiant de l'article, vérifie qu'il s'agit d'un entier positif, puis charge l'URL correspondante.

## 13. Corrigés expliqués

~~~javascript
// Exercice 2
async function exemple() {
  const valeur = await Promise.resolve("OK");
  console.log(valeur);
}
exemple();

// Exercice 3 à 5
async function chargerTitre() {
  const reponse = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1"
  );

  if (!reponse.ok) {
    throw new Error("HTTP " + reponse.status);
  }

  const donnees = await reponse.json();
  document.querySelector("#titre").textContent = donnees.title;
}
~~~

Correction du défi :

~~~javascript
async function chargerParIdentifiant(identifiant) {
  if (!Number.isInteger(identifiant) || identifiant < 1) {
    throw new Error("Identifiant incorrect.");
  }

  const url =
    "https://jsonplaceholder.typicode.com/posts/" + identifiant;

  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error("Article introuvable ou service indisponible.");
  }

  return await reponse.json();
}
~~~

La validation vérifie que l'identifiant est un entier positif. La fonction renvoie les données au lieu de les afficher directement. Une autre fonction peut ensuite décider comment présenter le résultat.

Pour une application complète, ajoute un try/catch autour de l'appel, vérifie les champs renvoyés et prévois un état vide lorsque l'article n'existe pas.

## 14. Fiche de révision et validation

- Le code asynchrone permet d'attendre une opération sans bloquer toute l'interface.
- Une Promise peut être pending, fulfilled ou rejected.
- async indique une fonction asynchrone ; await attend une Promise.
- fetch() envoie une requête HTTP.
- reponse.ok doit être vérifié avant de traiter les données.
- json() transforme le corps JSON en données JavaScript.
- try/catch permet de gérer les échecs.
- finally peut rétablir l'interface après une requête.
- textContent affiche du texte sans l'interpréter comme du HTML.
- CORS dépend des autorisations envoyées par le serveur.
- Les secrets ne doivent pas être placés dans le code public du navigateur.
- Une API de démonstration n'est pas une base de données durable.

Avant la leçon 07, vérifie que tu peux charger une donnée, afficher un état de chargement, gérer un échec et expliquer les limites d'une API publique.

**Prochaine étape :** apprendre à organiser les données d'une application, puis construire une interface qui combine plusieurs appels API.

---

*Académique — Création de sites Web, Leçon 06.*

©pythonschool
