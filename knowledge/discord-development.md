# Développement Discord : bots, événements et interactions

## Comprendre une application Discord
Un bot est un compte d'application contrôlé par du code. Il peut réagir à des événements, répondre à des commandes et fournir des outils dans un serveur. Un bot doit être ajouté à un serveur au moyen d'une autorisation explicite et uniquement avec les permissions nécessaires à sa fonction.

## Choisir le mode de communication
Le Gateway est une connexion WebSocket persistante qui transmet des événements en temps réel. Les interactions HTTP permettent de recevoir des commandes et actions sur un point de terminaison Web. Le choix dépend des fonctions nécessaires : un bot qui écoute des événements de serveur utilise souvent le Gateway, tandis qu'une application centrée sur les commandes peut utiliser les interactions HTTP.

## Comprendre les intents du Gateway
Les intents indiquent les catégories d'événements qu'une application souhaite recevoir. Demander uniquement les intents nécessaires limite les données reçues et simplifie le bot. Certains intents sont privilégiés et doivent être activés dans le portail développeur ; leur accès peut être soumis à des conditions supplémentaires. Ne pas demander l'accès à des informations personnelles sans besoin fonctionnel.

## Créer des commandes et interactions
Les commandes slash sont des commandes d'application proposées dans l'interface Discord. Les interactions peuvent aussi provenir d'un clic sur un bouton, d'un menu de sélection ou de l'envoi d'un formulaire modal. Le bot doit répondre dans les délais prévus et gérer les erreurs de manière compréhensible pour l'utilisateur.

## Protéger le jeton du bot
Le jeton d'un bot est un secret d'authentification. Ne jamais le publier dans un dépôt, un message, une capture d'écran ou un journal. Le conserver dans une variable d'environnement ou dans un gestionnaire de secrets adapté. Si le jeton est exposé, le réinitialiser depuis le portail développeur et mettre à jour l'application.

## Respecter les permissions et les limites
Attribuer le minimum de permissions nécessaire au bot et vérifier les permissions du salon avant d'effectuer une action. Discord applique des limites de requêtes ; elles varient selon les routes et peuvent évoluer. Lire les en-têtes de limitation et respecter le délai de reprise au lieu de coder en dur une valeur supposée constante.

## Références officielles Discord
La documentation officielle décrit la création d'applications, les bots, les intents, les commandes, les interactions et les limites de requêtes. Cette fiche résume les principes essentiels sans recopier la documentation technique complète.
Référence : https://discord.com/developers/docs/intro
Référence : https://discord.com/developers/platform/bots
Référence : https://discord.com/developers/events/gateway
Référence : https://discord.com/developers/platform/interactions
Référence : https://discord.com/developers/topics/rate-limits
