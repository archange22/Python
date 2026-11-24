# Sécurité et confidentialité des applications locales

## Collecter uniquement les données nécessaires
Une application doit demander et conserver uniquement les informations utiles à sa fonction. Expliquer pourquoi une donnée est nécessaire, éviter de la conserver plus longtemps que nécessaire et donner à l'utilisateur un moyen clair de la supprimer. Les données personnelles ne sont pas des exemples d'entraînement par défaut.

## Ne pas apprendre à partir de conversations privées
Les conversations privées ne doivent pas être ajoutées au corpus d'entraînement sans un consentement explicite, une finalité claire et des protections adaptées. Pour Sun, les connaissances de base viennent de documents pédagogiques publics et de notes rédigées pour l'application. Les exemples de tests doivent être fictifs et ne contenir ni nom réel, ni adresse, ni identifiant, ni secret.

## Protéger les secrets et les comptes
Un jeton, une clé privée ou un mot de passe ne doit pas apparaître dans le code source, un dépôt public, une capture d'écran ou un journal. Utiliser des variables d'environnement et des droits limités. Si un secret est accidentellement publié, le révoquer et le remplacer ; supprimer seulement la ligne du dépôt ne suffit pas.

## Valider les entrées et encoder les sorties
Une validation d'entrée vérifie le format, la taille et les valeurs autorisées avant un traitement. Elle doit être adaptée à chaque champ. Pour éviter une injection XSS, afficher les textes non fiables comme du texte et non comme du HTML exécutable. Les accès à une base de données doivent utiliser des paramètres plutôt que construire une requête en concaténant directement l'entrée utilisateur.

## Gérer les erreurs sans divulguer d'informations
Un message d'erreur destiné à l'utilisateur doit expliquer le problème sans révéler de jeton, de chemin privé, de donnée personnelle ou de détail interne inutile. Les journaux techniques doivent rester limités, protégés et dépourvus de secrets. Tester aussi les entrées vides, trop longues et mal formées.

## Maintenir les dépendances et vérifier les changements
Avant d'ajouter une bibliothèque, vérifier sa source, sa licence, sa maintenance et les versions compatibles. Limiter les dépendances réduit la surface de risque. Après une modification, lancer les tests existants, ajouter des tests ciblés et contrôler que l'interface et les fonctions sans rapport avec le changement continuent de marcher.

## Référence sécurité
Les fiches OWASP présentent des pratiques de défense pour le développement d'applications. Cette note en donne une synthèse pédagogique, avec attribution à l'OWASP Cheat Sheet Series ; consulter les fiches officielles pour les précisions et mises à jour.
Référence : https://cheatsheetseries.owasp.org/
Référence : https://owasp.org/
