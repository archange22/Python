# Création de sites Web — Leçon 08 : Publier un site statique avec GitHub Pages

**Parcours :** Création de sites Web  
**Numéro :** 08  
**Niveau :** Débutant à intermédiaire  
**Durée :** 100 à 120 minutes  
**Environnement :** Navigateur récent, éditeur de texte et compte GitHub ; les essais locaux peuvent être réalisés sur téléphone ou ordinateur.  
**Prérequis :** HTML, CSS, JavaScript, formulaires et notions de fichiers et dossiers.

## Objectifs et prérequis
Un site Web ne devient pas public simplement parce que ses fichiers existent sur ton téléphone. Il faut les placer sur un hébergement Web. Cette leçon présente les sites statiques, la structure des fichiers, les chemins relatifs, la publication avec GitHub Pages, les tests après déploiement et les limites d'un hébergement statique.

À la fin, tu sauras préparer un dossier de site, vérifier les liens, publier une version, comprendre l'adresse créée, diagnostiquer une erreur 404 et distinguer ce qu'un site statique peut faire de ce qui nécessite un serveur. Les étapes sont réalisables depuis un navigateur mobile, même si un ordinateur facilite parfois la gestion de nombreux fichiers.

## Sommaire
1. Comprendre l'hébergement
2. Site statique et site dynamique
3. Préparer les fichiers
4. Comprendre les chemins
5. Vérifier le site localement
6. Créer un dépôt GitHub
7. Activer GitHub Pages
8. Comprendre le workflow de déploiement
9. Vérifier le site publié
10. Gérer les images, CSS et JavaScript
11. Domaine, HTTPS et cache
12. Sécurité d'un site statique
13. Mini-projet : publier un portfolio
14. Erreurs fréquentes et débogage
15. Exercices progressifs
16. Corrigés expliqués
17. Fiche de révision

## 1. Comprendre l'hébergement
Un navigateur affiche un site en récupérant des fichiers depuis un serveur. L'hébergement consiste à rendre ces fichiers accessibles sur Internet.

Analogie : le dossier du projet est une boîte contenant les pages, les images et les styles. L'hébergeur place cette boîte à une adresse consultable par les visiteurs. Sans hébergement, le site peut fonctionner uniquement sur ton appareil.

Pour un site simple, l'hébergement statique suffit souvent. Il sert des fichiers HTML, CSS, JavaScript, images et autres ressources. Il n'exécute pas automatiquement du code Python ou PHP côté serveur.

## 2. Site statique et site dynamique
Un site statique peut contenir du JavaScript et interagir avec l'utilisateur, mais ses fichiers sont servis tels quels. Un site dynamique s'appuie souvent sur un backend qui traite des données, applique des règles et communique avec une base de données.

| Besoin | Site statique seul | Backend nécessaire |
|---|---|---|
| Afficher une présentation | Oui | Non |
| Menu interactif | Oui, JavaScript | Non |
| Formulaire sans sauvegarde | Oui, démonstration locale | Non |
| Enregistrer un compte | Non | Oui |
| Protéger une clé secrète | Non côté navigateur | Oui |
| Lire une API publique | Souvent oui | Selon l'API |

Ne place jamais un mot de passe, une clé privée ou un token d'administration dans un fichier JavaScript public. Tout code envoyé au navigateur peut être consulté.

### 3. Préparer les fichiers
Une structure claire facilite la publication :

~~~text
mon-site/
    index.html
    styles/
        style.css
    scripts/
        app.js
    images/
        logo.png
    pages/
        contact.html
~~~

`index.html` est le point d'entrée le plus courant. Les noms de fichiers doivent être cohérents. Sur les hébergements Linux, les majuscules et minuscules sont généralement différentes : `Logo.png` et `logo.png` peuvent être deux noms distincts.

Garde les fichiers nécessaires dans le dossier publié. Ne publie pas des sauvegardes, des fichiers temporaires ou des données privées.

### 4. Comprendre les chemins
Un chemin indique où trouver une ressource. Un chemin relatif est calculé à partir de l'emplacement du fichier courant.

Dans `index.html` :

~~~html
<link rel="stylesheet" href="styles/style.css">
<script src="scripts/app.js" defer></script>
<img src="images/logo.png" alt="Logo du site">
~~~

Le chemin commence dans le dossier du site. Pour un fichier situé dans un sous-dossier, utilise le bon nombre de retours avec `../`.

Évite les chemins absolus qui commencent par `/` lorsque tu publies un projet dans un dépôt GitHub Pages de type projet. Ils peuvent pointer vers la racine du domaine au lieu du sous-dossier du dépôt.

## 5. Vérifier le site localement
Avant de publier, ouvre `index.html` dans un navigateur et vérifie :
- les titres et textes ;
- les liens ;
- les images ;
- les feuilles CSS ;
- les interactions JavaScript ;
- l'affichage sur une petite largeur ;
- la navigation au clavier.

Sur téléphone, tu peux créer les fichiers avec un éditeur adapté et ouvrir le HTML dans un navigateur. Certaines fonctions Web nécessitent toutefois un serveur local ou HTTPS. Une page ouverte directement en `file://` ne reproduit pas toujours le comportement d'un site hébergé.

Utilise la console du navigateur lorsque c'est possible. Une erreur 404 indique qu'une ressource n'a pas été trouvée. Une erreur JavaScript peut empêcher une interaction de fonctionner.

## 6. Créer un dépôt GitHub
Un dépôt GitHub conserve les fichiers et leur historique. Pour un petit site, crée un dépôt, ajoute `index.html` et les dossiers nécessaires, puis enregistre les changements.

Étapes générales :
1. connecte-toi à GitHub ;
2. crée un dépôt pour le site ;
3. choisis public si tu veux utiliser le plan gratuit de GitHub Pages selon les règles actuelles du service ;
4. ajoute les fichiers du site ;
5. vérifie que `index.html` se trouve dans le dossier qui sera publié ;
6. vérifie la branche et le chemin de publication.

Le nom du dépôt influence souvent l'adresse du site. Ne confonds pas le nom du dépôt et le nom de domaine.

## 7. Activer GitHub Pages
Dans les paramètres du dépôt, ouvre la section Pages. Choisis une source de publication prise en charge par le dépôt : branche et dossier, ou GitHub Actions si un workflow construit le site.

Avec une publication depuis la branche, sélectionne `main` et le dossier racine ou `/docs` selon l'organisation. Enregistre la configuration.

GitHub Pages peut prendre un peu de temps avant de rendre la première version accessible. L'état du déploiement doit être vérifié dans l'onglet Actions ou dans les paramètres Pages. Ne considère pas un clic sur « Save » comme une preuve que le site est déjà en ligne.

## 8. Comprendre un workflow de déploiement
Un workflow automatise la publication. Exemple minimal pour un dossier `site/` :

~~~yaml
name: Publier le site statique

on:
  push:
    branches: [main]
    paths:
      - "site/**"
      - ".github/workflows/pages.yml"

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    steps:
      - name: Récupérer les fichiers
        uses: actions/checkout@v4

      - name: Configurer Pages
        uses: actions/configure-pages@v5

      - name: Préparer le site
        uses: actions/upload-pages-artifact@v3
        with:
          path: site

      - name: Déployer
        id: deployment
        uses: actions/deploy-pages@v4
~~~

Ce fichier est un exemple pédagogique. Le dossier `site/` doit exister et contenir `index.html`. Les permissions sont limitées à la lecture du dépôt et à la publication Pages. N'ajoute pas la permission Administrateur.

Un workflow réussi signifie que l'automatisation a terminé ses étapes. Il faut encore ouvrir le site et tester les pages.

## 9. Vérifier le site publié
L'adresse d'un site de projet suit souvent cette forme :

~~~text
https://utilisateur.github.io/nom-du-depot/
~~~

Le nom exact dépend du compte et du dépôt. Vérifie :
1. que la page d'accueil s'ouvre ;
2. que l'adresse utilise HTTPS ;
3. que les images se chargent ;
4. que les liens internes restent dans le bon dossier ;
5. que les scripts fonctionnent ;
6. que les pages secondaires sont accessibles ;
7. que la version affichée correspond au dernier commit.

Teste aussi sur téléphone. Une page qui fonctionne sur ordinateur peut avoir des boutons trop petits, des textes qui débordent ou un menu inutilisable sur écran étroit.

## 10. Gérer les images, CSS et JavaScript
Les ressources doivent être publiées avec le site. Un fichier CSS absent donne une page sans mise en forme. Un script mal lié peut empêcher les interactions.

Exemple de lien CSS :

~~~html
<link rel="stylesheet" href="styles/style.css">
~~~

Exemple de script différé :

~~~html
<script src="scripts/app.js" defer></script>
~~~

L'attribut `defer` permet au navigateur de télécharger le script sans bloquer l'analyse HTML et de l'exécuter après la lecture du document.

Pour les images, précise un texte alternatif utile. Compresse les images trop lourdes et utilise des noms de fichiers simples. Les ressources volumineuses ralentissent le chargement sur un réseau mobile.

### 11. Domaine, HTTPS et cache
GitHub Pages peut fournir un sous-domaine gratuit. Un domaine personnalisé peut être ajouté si tu en possèdes un et si tu configures les enregistrements DNS correctement.

HTTPS chiffre la connexion entre le navigateur et le site. Ne transmets pas d'informations sensibles sur une page qui n'utilise pas HTTPS.

Le cache permet au navigateur de conserver certaines ressources. Après une mise à jour, un ancien fichier peut rester affiché temporairement. Vérifie le commit déployé et recharge la page. Évite de multiplier les changements de nom de fichier sans raison ; une version ou un nom de ressource mis à jour peut aider à gérer le cache.

### 12. Sécurité d'un site statique
Tout ce qui est livré au navigateur est visible. Cela inclut HTML, CSS, JavaScript, les commentaires du code et les fichiers JSON publics.

Règles essentielles :
- ne publie pas de token, mot de passe ou clé privée ;
- ne place pas les données personnelles des utilisateurs dans un fichier public ;
- ne considère pas un bouton masqué comme une protection ;
- ne fais pas confiance à une validation JavaScript pour une action sensible ;
- utilise un backend pour les opérations qui nécessitent une autorisation ;
- vérifie les liens externes et les bibliothèques chargées.

Un dépôt public peut être lu et copié. Vérifie les fichiers avant chaque publication.

## 13. Mini-projet : publier un portfolio
Crée un dossier `site` avec `index.html`, `style.css` et `app.js`. Le site présente un profil fictif, trois projets et un lien de contact.

Objectifs :
1. utiliser des titres HTML dans le bon ordre ;
2. afficher les projets dans une grille responsive ;
3. ajouter un menu accessible ;
4. utiliser JavaScript pour afficher un message de bienvenue ;
5. vérifier que les images et styles utilisent des chemins relatifs ;
6. publier le dossier avec GitHub Pages ;
7. tester l'adresse depuis un téléphone.

Exemple minimal de `site/index.html` :

~~~html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon portfolio</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
</head>
<body>
  <header>
    <h1>Mon portfolio</h1>
    <nav aria-label="Navigation principale">
      <a href="#projets">Projets</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>Présentation</h2>
      <p>Je découvre la création de sites Web.</p>
      <button id="bonjour" type="button">Afficher un message</button>
      <p id="retour" role="status" aria-live="polite"></p>
    </section>
    <section id="projets">
      <h2>Mes projets</h2>
      <ul>
        <li>Une page de présentation</li>
        <li>Une carte responsive</li>
        <li>Un formulaire de démonstration</li>
      </ul>
    </section>
    <section id="contact">
      <h2>Contact</h2>
      <p>Ajoute ici une adresse publique adaptée.</p>
    </section>
  </main>
</body>
</html>
~~~

`site/style.css` :

~~~css
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}
header, main { max-width: 900px; margin: auto; }
nav { display: flex; flex-wrap: wrap; gap: 1rem; }
section { padding: 1rem 0; }
button, a { min-height: 44px; }
@media (min-width: 700px) {
  main { padding: 2rem; }
}
~~~

`site/app.js` :

~~~javascript
const bouton = document.querySelector("#bonjour");
const retour = document.querySelector("#retour");

bouton.addEventListener("click", function () {
  retour.textContent = "Bienvenue sur mon portfolio !";
});
~~~

Teste d'abord localement. Ensuite ajoute le dossier `site` au dépôt, configure Pages et vérifie le déploiement. Le message est local : il n'est envoyé à aucun serveur.

## 14. Erreurs fréquentes et débogage
- **Erreur 404 sur index :** vérifie le dossier publié et le nom exact `index.html`.
- **CSS absent :** vérifie le chemin relatif et la casse du nom.
- **Image manquante :** vérifie que le fichier est dans le dépôt et dans le dossier publié.
- **Lien cassé :** teste l'URL depuis la page réellement publiée.
- **Site non actualisé :** vérifie le commit déployé et le cache du navigateur.
- **Workflow en échec :** lis l'étape rouge et son journal, puis corrige la cause.
- **JavaScript non exécuté :** vérifie la console, le chemin et l'identifiant ciblé.
- **Site cassé sur mobile :** teste une largeur réduite et évite les largeurs fixes excessives.

Méthode : reproduis le problème, vérifie l'URL de la ressource, ouvre le journal du déploiement, corrige un seul élément et relance les tests.

## 15. Exercices progressifs
1. Dessine une arborescence contenant une page, une feuille CSS, un script et deux images.
2. Explique la différence entre un chemin relatif et un chemin qui commence par `/`.
3. Donne trois tests à effectuer après un déploiement.
4. Explique pourquoi un token ne doit jamais être placé dans `app.js`.
5. Crée une page avec deux sections et vérifie ses liens sur téléphone.

## 16. Corrigés expliqués

### Exercice 1
~~~text
site/
    index.html
    style.css
    app.js
    images/
        logo.png
        projet.png
~~~

Chaque ressource est rangée dans un emplacement prévisible.

### Exercice 2
Un chemin relatif est calculé depuis le fichier courant. Un chemin commençant par `/` vise la racine du domaine. Dans un dépôt GitHub Pages de projet, cette racine peut être différente du dossier du dépôt.

### Exercice 3
Ouvre la page d'accueil, vérifie les images et teste les liens internes. Ajoute un test mobile et une vérification du commit déployé.

### Exercice 4
Le JavaScript est téléchargé par les visiteurs. Un secret intégré au code peut être lu et réutilisé. Les opérations privées doivent être exécutées par un backend qui conserve les secrets côté serveur.

### Exercice 5
Utilise des identifiants uniques et des liens comme `href="#projets"` vers `id="projets"`. Teste au clavier et au toucher.

## 17. Fiche de révision et validation
| Notion | Rôle |
|---|---|
| Hébergement | Rend les fichiers accessibles |
| Site statique | Sert des fichiers sans backend obligatoire |
| index.html | Page d'entrée courante |
| Chemin relatif | Chemin calculé depuis un fichier |
| Dépôt | Stocke le projet et son historique |
| GitHub Pages | Héberge un site statique |
| Workflow | Automatise les étapes |
| HTTPS | Protège le transport des données |
| Cache | Conserve temporairement des ressources |
| Backend | Traite les opérations côté serveur |

Avant la leçon 09, vérifie que tu peux préparer un dossier, expliquer les chemins, publier un site statique, lire un journal de déploiement et expliquer les limites de GitHub Pages.

**À retenir :** publier un site demande une structure propre, des chemins corrects, un déploiement vérifié et des tests après publication. Un site statique ne doit pas contenir de secrets ni prétendre remplacer un backend.

---

*©pythonschool — Création de sites Web, Leçon 08.*