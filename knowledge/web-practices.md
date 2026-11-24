# Pratiques Web : HTML sémantique, accessibilité et JavaScript

## Structurer une page avec HTML sémantique
HTML décrit la structure et le sens du contenu. Utiliser les éléments adaptés, par exemple header, nav, main, section, article et footer, aide les navigateurs, les lecteurs d'écran et les moteurs de recherche à comprendre la page. Un titre doit refléter la hiérarchie du contenu plutôt que servir uniquement à agrandir le texte.

## Créer des formulaires accessibles
Chaque champ de formulaire doit avoir une étiquette claire associée avec l'attribut for et un id correspondant. Un utilisateur doit pouvoir atteindre les champs et les boutons avec le clavier, comprendre les erreurs et savoir comment les corriger. Une étiquette visible est généralement plus utile qu'un placeholder utilisé seul.

## Concevoir une interface adaptée au mobile
Une mise en page responsive s'adapte aux différentes largeurs d'écran. Commencer par un contenu lisible sur petit écran, utiliser des unités flexibles et ajouter des media queries lorsque la disposition doit évoluer. La balise meta viewport permet au navigateur mobile d'utiliser la largeur réelle de l'écran pour calculer la mise en page.

## Rendre les interactions compréhensibles
Les boutons doivent annoncer clairement leur action. Les liens servent à naviguer ; les boutons servent à déclencher une action. Prévoir un indicateur de focus visible, un ordre de tabulation logique et des messages d'état compréhensibles. Les attributs ARIA complètent la sémantique HTML ; ils ne remplacent pas un élément HTML adapté.

## Organiser le JavaScript du navigateur
JavaScript peut réagir à un événement avec `addEventListener`, mettre à jour le DOM et valider une entrée avant de l'utiliser. Séparer les fonctions de lecture, de validation et d'affichage facilite les tests. Pour afficher un texte fourni par un utilisateur, préférer textContent à innerHTML afin d'éviter d'interpréter ce texte comme du HTML.

## Gérer les opérations asynchrones
Une requête réseau avec fetch renvoie une promesse. Vérifier response.ok avant de lire le contenu et prévoir un traitement d'erreur si la connexion échoue. Une interface locale doit pouvoir signaler clairement qu'une ressource n'est pas disponible hors connexion ; elle ne doit pas inventer un résultat.

## Références Web
MDN propose un parcours gratuit consacré aux bases du Web, à HTML, CSS, JavaScript, à l'accessibilité, aux tests, à la sécurité et aux bonnes pratiques. Son guide JavaScript couvre notamment les types, les conditions, les boucles, les fonctions, les objets et les promesses.
Référence : https://developer.mozilla.org/en-US/docs/Learn_web_development
Référence : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
Référence : https://developer.mozilla.org/en-US/curriculum/
