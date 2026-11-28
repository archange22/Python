# Accessibilité Web : formulaires, clavier et contenus

## Créer des formulaires accessibles
Chaque champ de formulaire doit avoir une étiquette claire associée à son identifiant. Une personne doit pouvoir comprendre ce qui est demandé avant de remplir le champ. Une étiquette visible est généralement plus utile qu'un texte indicatif placé uniquement à l'intérieur du champ.

## Naviguer avec le clavier
Toutes les actions essentielles d'une interface doivent être accessibles sans souris. La touche Tab permet de passer d'un contrôle au suivant et la touche Entrée ou Espace active le contrôle selon son type. Un indicateur de focus visible aide à repérer l'élément actuellement sélectionné. L'ordre de tabulation doit suivre la logique du contenu.

## Présenter des erreurs compréhensibles
Lorsqu'un formulaire contient une valeur incorrecte, le message doit identifier le champ concerné et expliquer comment corriger le problème. Ne pas se contenter d'une couleur pour signaler une erreur. Associer le message au champ et conserver les valeurs déjà saisies évite à la personne de recommencer inutilement.

## Aider les lecteurs d'écran
Les textes alternatifs décrivent le rôle des images informatives. Les titres doivent suivre une hiérarchie logique et les boutons doivent porter des noms compréhensibles. Les régions de navigation et le contenu principal doivent être identifiables. Les attributs ARIA complètent la sémantique native ; ils ne remplacent pas des contrôles correctement nommés.

## Vérifier l'accessibilité d'une interface
Tester la navigation au clavier, vérifier les libellés, agrandir le texte et contrôler les messages d'erreur permet de repérer des obstacles courants. Les tests automatisés peuvent signaler certains problèmes, mais ils ne remplacent pas une vérification manuelle avec différentes méthodes de navigation.

## Références sur l'accessibilité
Le curriculum MDN comprend des notions d'accessibilité, de formulaires, de sémantique et de bonnes pratiques. Les guides WCAG du W3C expliquent les principes perceptible, utilisable, compréhensible et robuste.
Référence : https://developer.mozilla.org/en-US/docs/Web/Accessibility
Référence : https://developer.mozilla.org/en-US/curriculum/
Référence : https://www.w3.org/WAI/standards-guidelines/wcag/


## Lire des pages externes depuis le navigateur : CORS
Une application peut utiliser `fetch()` pour demander une ressource située sur un autre domaine. Le navigateur n'autorise toutefois pas automatiquement le script à lire cette réponse : le serveur distant doit autoriser l'origine de l'application avec l'en-tête HTTP `Access-Control-Allow-Origin`. Cette règle s'appelle le partage des ressources entre origines (CORS). Le mode `no-cors` ne permet pas de contourner cette protection : la réponse devient opaque et son contenu n'est pas lisible par JavaScript. Une application exécutée dans le navigateur doit donc se limiter aux sources qui autorisent l'accès CORS ou demander le contenu à un service serveur contrôlé et correctement sécurisé.

## Ce qu'un hébergement statique peut faire
Un hébergement statique publie des fichiers HTML, CSS, JavaScript, images et données déjà préparées. GitHub Pages ne fournit pas d'exécution de code côté serveur en PHP, Ruby ou Python. Une application hébergée ainsi peut interroger des services externes autorisés, mais elle ne peut pas, à elle seule, lancer un robot serveur permanent chargé d'explorer librement tout le Web. Pour construire un index Web autonome et récupérer les pages qui ne permettent pas l'accès CORS, il faut un composant serveur ou un processus de construction séparé. Le choix doit être annoncé clairement : un lien vers une page de résultats n'est pas la même chose qu'une page effectivement téléchargée, lue et analysée.

## Vérifier les sources trouvées sur le Web
Commencer par chercher la source primaire : documentation officielle, publication originale ou organisme responsable de l'information. Vérifier l'auteur, la date de publication ou de mise à jour, le contexte et la version concernée. Un extrait affiché dans un résultat de recherche ne suffit pas à confirmer une affirmation : il faut consulter la page elle-même. Pour une information importante, comparer plusieurs sources indépendantes et signaler les désaccords ou les éléments qui restent incertains. Conserver l'URL exacte et le titre de la page permet de retrouver l'origine d'une affirmation.
