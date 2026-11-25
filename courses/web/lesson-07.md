# Création de sites Web — Leçon 07 : Créer des formulaires accessibles et valider les saisies

**Parcours :** Création de sites Web  
**Numéro :** 07  
**Niveau :** Débutant à intermédiaire  
**Durée :** 100 à 120 minutes  
**Environnement :** Navigateur récent et éditeur de texte sur téléphone ou ordinateur.  
**Prérequis :** HTML, CSS, JavaScript, DOM, événements et notions de requêtes Web.

## Objectifs et prérequis
Les formulaires permettent de transmettre des informations : inscription, recherche ou contact. À la fin, tu sauras structurer un formulaire HTML, choisir les types de champs, utiliser les contraintes natives, écouter `submit`, lire les valeurs avec `FormData`, afficher un retour accessible et distinguer validation côté navigateur et côté serveur. Les exemples peuvent être testés sur téléphone et ordinateur, sans service payant.

## Sommaire
1. Rôle du formulaire ; 2. Structure HTML ; 3. Labels et champs ; 4. Validation native ; 5. Événement submit ; 6. FormData ; 7. Validation JavaScript ; 8. Messages accessibles ; 9. Sécurité ; 10. Envoi serveur ; 11. Tests ; 12. Projet ; 13. Exercices ; 14. Corrigés ; 15. Révision.

## 1. Le rôle d'un formulaire
Un formulaire regroupe des champs et permet de transmettre des données. Imagine une fiche papier : chaque champ possède une étiquette et un emplacement pour écrire. En HTML, `label` est l'étiquette et `input` est le champ.

Un formulaire efficace explique ce qui est attendu, demande uniquement les informations nécessaires, utilise des libellés visibles, signale les erreurs clairement et fonctionne au clavier comme sur écran tactile.

Évite les formulaires trop longs. Chaque champ supplémentaire augmente l'effort demandé et le risque de saisie incorrecte. Un formulaire local peut démontrer le fonctionnement sans serveur. Pour enregistrer réellement les données, il faut un backend ou un service prévu pour recevoir les requêtes.

## 2. Structure HTML et élément form
L'élément `form` délimite les champs d'une même soumission :

~~~html
<form id="recherche">
  <label for="mot">Mot à rechercher</label>
  <input id="mot" name="mot" type="search">
  <button type="submit">Rechercher</button>
</form>
~~~

`id` identifie un élément dans la page. `name` donne le nom de la donnée lors de la soumission. Les deux ont des rôles différents.

Un formulaire peut avoir `action` et `method` pour indiquer où et comment envoyer les données. Dans un exercice JavaScript local, on peut intercepter `submit` pour afficher un résultat sans envoyer de requête.

Ne remplace pas `form` par des champs indépendants : l'élément apporte une structure sémantique et un comportement clavier standard.

## 3. Labels, noms et types de champs
Associe chaque champ à un libellé avec `for` et `id` :

~~~html
<label for="email">Adresse e-mail</label>
<input id="email" name="email" type="email">
~~~

Types courants : `text` pour un texte court, `email` pour une adresse, `number` pour un nombre, `date` pour une date, `search` pour une recherche, `password` pour une saisie masquée, `checkbox` pour une option et `radio` pour un choix exclusif.

Le type adapté améliore parfois le clavier affiché sur mobile et apporte une validation native. Utilise aussi `name`, car `FormData` récupère les champs nommés. Un champ désactivé ou sans nom peut ne pas être inclus.

## 4. Attributs de validation HTML
HTML possède des attributs de contrôle :

| Attribut | Effet |
|---|---|
| `required` | Champ obligatoire |
| `minlength` | Longueur minimale |
| `maxlength` | Longueur maximale |
| `min` et `max` | Plage numérique ou date |
| `step` | Incrément autorisé |
| `type="email"` | Forme générale d'adresse |
| `pattern` | Motif |

Exemple :

~~~html
<label for="pseudo">Pseudo</label>
<input id="pseudo" name="pseudo" required minlength="3" maxlength="20">
~~~

Le navigateur empêche normalement la soumission si les contraintes ne sont pas respectées. Cela améliore l'expérience, mais ne prouve pas que la donnée est correcte ou autorisée. Un motif trop strict peut bloquer des saisies valides. Ne l'utilise pas comme unique protection.

## 5. Comprendre l'événement submit
Le navigateur déclenche `submit` lorsque le formulaire est envoyé. JavaScript peut écouter cet événement :

~~~javascript
const formulaire = document.querySelector("#recherche");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Formulaire soumis.");
});
~~~

`querySelector()` recherche un élément. `addEventListener()` associe une fonction à un événement. `preventDefault()` empêche le comportement normal, ici le rechargement de page.

Ne bloque pas la soumission sans traitement de remplacement. L'événement `submit` est préférable à un clic sur le bouton : il couvre aussi la soumission au clavier.

## 6. Lire les valeurs avec FormData
`FormData` récupère les champs nommés :

~~~javascript
const formulaire = document.querySelector("#recherche");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();
  const donnees = new FormData(formulaire);
  const mot = donnees.get("mot");
  console.log(mot);
});
~~~

`get()` récupère une valeur. Si plusieurs champs partagent un nom, `getAll()` récupère toutes les valeurs. Les données sont généralement des chaînes, ou des objets fichiers pour les champs file.

Nettoyer un texte :

~~~javascript
const nom = String(donnees.get("nom") ?? "").trim();
~~~

Cette expression remplace une valeur absente par une chaîne vide et retire les espaces aux extrémités. Ne considère pas une valeur valide uniquement parce qu'elle existe.

## 7. Ajouter une validation JavaScript
HTML vérifie des règles simples. JavaScript peut ajouter des contrôles liés à l'application :

~~~javascript
const formulaire = document.querySelector("#inscription");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!formulaire.checkValidity()) {
    formulaire.reportValidity();
    return;
  }

  const donnees = new FormData(formulaire);
  const nom = String(donnees.get("nom") ?? "").trim();

  if (nom.length < 2) {
    alert("Le nom doit contenir au moins deux caractères.");
    return;
  }
  console.log("Nom accepté :", nom);
});
~~~

`checkValidity()` vérifie les contraintes natives. `reportValidity()` demande au navigateur de présenter les erreurs. Le contrôle JavaScript ajoute une règle métier.

La validation doit rester cohérente avec le serveur. Si le navigateur accepte une valeur que le serveur refuse, le message serveur doit expliquer le problème.

## 8. Afficher un message accessible
Les retours doivent être perceptibles avec un lecteur d'écran. Un élément `aria-live="polite"` annonce les changements :

~~~html
<p id="retour" role="status" aria-live="polite"></p>
~~~

~~~javascript
const retour = document.querySelector("#retour");
retour.textContent = "Le formulaire est valide.";
~~~

Utilise `textContent` pour afficher une donnée saisie. Évite d'insérer le contenu utilisateur avec `innerHTML`, car un texte malveillant pourrait être interprété comme du HTML.

Les messages doivent indiquer quel champ pose problème, pourquoi et comment le corriger. Ne repose pas uniquement sur une couleur : ajoute un texte explicatif et conserve un contraste suffisant.

## 9. Sécurité : ne pas faire confiance au navigateur
La validation côté client améliore l'interface, mais elle peut être contournée. Une personne peut désactiver JavaScript, modifier la requête ou envoyer directement des données au serveur.

Le serveur doit vérifier types, formats, longueurs, valeurs autorisées, permissions et règles métier. N'affiche pas une saisie comme du HTML sans échappement. N'enregistre pas de secrets dans `localStorage` ou dans le code JavaScript public.

Pour les actions sensibles, le serveur doit vérifier l'identité et les droits. Un champ caché ou un bouton désactivé n'est pas une autorisation. La sécurité repose sur plusieurs contrôles cohérents côté navigateur et côté serveur.

## 10. Envoyer des données à un serveur
GET sert généralement à demander une ressource et peut placer les paramètres dans l'URL. POST envoie les données dans le corps de la requête.

~~~html
<form action="/inscription" method="post">
  <label for="nom">Nom</label>
  <input id="nom" name="nom" required>
  <button type="submit">Envoyer</button>
</form>
~~~

Cette adresse suppose qu'un serveur traite `/inscription`. Sans backend, le formulaire ne peut pas enregistrer durablement les informations.

JavaScript peut aussi envoyer avec `fetch()`, mais il faut vérifier le statut de réponse et gérer les erreurs réseau. Les données doivent être validées côté serveur. Utilise HTTPS pour protéger le transport.

## 11. Tester sur téléphone et déboguer
Teste au toucher sur téléphone et avec Tab/Entrée sur ordinateur. Laisse un champ obligatoire vide, saisis un email mal formé, teste une valeur trop courte et vérifie les messages.

Sur Android, vérifie que le clavier ne masque pas les champs et que les boutons sont faciles à toucher. Utilise une largeur fluide.

Erreurs fréquentes :
- `querySelector()` renvoie `null` : identifiant incorrect ou script trop tôt ;
- `FormData` ne contient pas le champ : vérifie `name` ;
- la page recharge : vérifie `preventDefault()` ;
- accents incorrects : vérifie UTF-8 ;
- saisie interprétée comme HTML : utilise `textContent` ;
- contrôle insuffisant : répète les validations côté serveur.

## 12. Mini-projet : formulaire d'inscription de démonstration
Crée `index.html` et colle ce code. Il fonctionne localement. Il ne transmet aucune donnée à Internet : il montre seulement validation et retour utilisateur.

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inscription de démonstration</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 620px;
      margin: 30px auto; padding: 16px; line-height: 1.5; }
    form { display: grid; gap: 12px; }
    input, select, button { box-sizing: border-box; width: 100%;
      min-height: 44px; padding: 10px; font: inherit; }
    #retour { padding: 10px; background: #eef6ee; }
  </style>
</head>
<body>
  <main>
    <h1>Créer un profil de démonstration</h1>
    <p>Les données restent dans cette page.</p>
    <form id="inscription">
      <div>
        <label for="nom">Nom ou pseudo</label>
        <input id="nom" name="nom" required minlength="2" maxlength="30">
      </div>
      <div>
        <label for="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" required>
      </div>
      <div>
        <label for="parcours">Parcours préféré</label>
        <select id="parcours" name="parcours" required>
          <option value="">Choisir un parcours</option>
          <option value="python">Python</option>
          <option value="ia">Intelligence artificielle</option>
          <option value="discord">Discord</option>
          <option value="web">Sites Web</option>
        </select>
      </div>
      <button type="submit">Valider</button>
    </form>
    <p id="retour" role="status" aria-live="polite"></p>
  </main>
  <script>
    const formulaire = document.querySelector("#inscription");
    const retour = document.querySelector("#retour");

    formulaire.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!formulaire.checkValidity()) {
        formulaire.reportValidity();
        retour.textContent = "Vérifie les champs indiqués.";
        return;
      }
      const donnees = new FormData(formulaire);
      const nom = String(donnees.get("nom") ?? "").trim();
      const parcours = String(donnees.get("parcours") ?? "");
      if (nom.length < 2) {
        retour.textContent = "Le nom est trop court.";
        return;
      }
      retour.textContent = "Merci " + nom + " ! Parcours : " + parcours + ".";
      formulaire.reset();
    });
  </script>
</body>
</html>
~~~

Observe : HTML décrit les champs, CSS améliore la présentation et JavaScript écoute la soumission. Le texte est affiché avec `textContent`, pas interprété comme du HTML. Teste un champ vide, un email incorrect puis une saisie valide.

## 13. Exercices progressifs
1. Ajoute un champ âge de type number, obligatoire, entre 10 et 99.
2. Écoute la soumission et affiche la valeur de `nom` avec `FormData`.
3. Retire les espaces autour du nom avec `trim()` et refuse un nom vide.
4. Ajoute `role="status"` et `aria-live="polite"` ; explique leur intérêt.
5. Donne une règle côté navigateur et une règle à répéter côté serveur.

## 14. Corrigés expliqués

### Exercice 1
~~~html
<label for="age">Âge</label>
<input id="age" name="age" type="number" min="10" max="99" required>
~~~
Le navigateur contrôle la plage, mais le serveur doit aussi la vérifier.

### Exercice 2
~~~javascript
formulaire.addEventListener("submit", function (event) {
  event.preventDefault();
  const donnees = new FormData(formulaire);
  console.log(donnees.get("nom"));
});
~~~
Le champ doit avoir `name="nom"`.

### Exercice 3
~~~javascript
const donnees = new FormData(formulaire);
const nom = String(donnees.get("nom") ?? "").trim();
if (nom.length === 0) {
  retour.textContent = "Le nom est obligatoire.";
  return;
}
~~~

### Exercice 4
~~~html
<p id="retour" role="status" aria-live="polite"></p>
~~~
~~~javascript
retour.textContent = "Le formulaire a été vérifié.";
~~~
Les technologies d'assistance peuvent annoncer le changement.

### Exercice 5
Une longueur minimale peut être contrôlée dans HTML pour guider l'utilisateur. Le serveur doit refaire ce contrôle, vérifier l'autorisation et appliquer les règles métier, car une requête peut être envoyée sans utiliser le formulaire.

## 15. Fiche de révision et validation
| Élément | Utilité |
|---|---|
| form | Regroupe les champs |
| label | Nomme un champ |
| name | Identifie une donnée soumise |
| required | Rend obligatoire |
| checkValidity() | Vérifie les contraintes |
| reportValidity() | Affiche les erreurs |
| submit | Événement de soumission |
| preventDefault() | Empêche le comportement normal |
| FormData | Récupère les valeurs nommées |
| textContent | Affiche du texte sans l'interpréter en HTML |

Avant la leçon 08, vérifie que tu peux créer un formulaire avec labels, utiliser les contraintes, lire FormData, afficher un retour accessible et expliquer pourquoi le serveur doit refaire les contrôles.

**À retenir :** un formulaire accessible guide la personne, mais le navigateur n'est pas une frontière de sécurité. Toute donnée importante doit être validée côté serveur.

---

*©pythonschool — Création de sites Web, Leçon 07.*
