# Discord — Leçon 02 : Créer une application et configurer son bot en sécurité

**Parcours :** Discord et automatisation  
**Numéro :** 02  
**Niveau :** Débutant  
**Durée indicative :** 60 à 75 minutes  
**Matériel :** Téléphone ou ordinateur, navigateur et compte Discord.  
**Prérequis :** Leçon 01 : serveurs, salons, rôles, permissions, bots, événements, commandes et tokens.

## 1. Objectifs et prérequis

La première leçon a présenté le fonctionnement général de Discord et le rôle d’un bot. Cette leçon prépare une application réelle dans le portail développeur, sans encore construire un bot complet.

À la fin, tu sauras :
- distinguer une application Discord d’un utilisateur bot ;
- repérer les informations principales du Developer Portal ;
- comprendre le rôle du token ;
- choisir les intents nécessaires ;
- distinguer les scopes OAuth2 des permissions du serveur ;
- préparer une invitation limitée ;
- organiser un serveur de test ;
- reconnaître les erreurs courantes de configuration.

Tu n’as pas besoin de créer un bot public. Utilise un petit serveur de test où tu contrôles les salons et les rôles.

## 2. Application, bot et serveur : trois éléments différents

Une application Discord représente le projet déclaré dans le portail développeur. Elle contient des paramètres, des informations d’identification et les réglages de ses fonctionnalités.

Un utilisateur bot est l’identité automatisée qui peut rejoindre un serveur et réagir aux événements autorisés. Il est associé à une application, mais ce n’est pas un compte humain ordinaire.

Un serveur Discord est l’espace dans lequel le bot peut agir, selon les permissions accordées.

Analogie : l’application est le dossier du projet, le bot est l’agent qui exécute certaines tâches, et le serveur est le lieu où il intervient.

Ces éléments ne doivent pas être confondus. Créer une application ne signifie pas automatiquement qu’elle est installée sur un serveur. Et installer un bot ne lui donne pas le droit de tout faire.

## 3. Préparer le projet avant d’ouvrir le portail

Avant de créer l’application, écris une fiche de projet courte :

- Nom provisoire : Assistant de test.
- Objectif : répondre à une demande d’aide.
- Public : membres d’un serveur de test.
- Commande prévue : /aide.
- Données nécessaires : la commande reçue et le salon où elle est utilisée.
- Actions inutiles : supprimer des salons, bannir des membres ou lire tous les messages.

Cette liste permet de choisir les permissions avec précision. Si le bot doit seulement répondre à une commande, il n’a pas besoin d’un accès général à tous les messages du serveur.

Définir le besoin avant les permissions évite de donner des droits « au cas où ». Tu pourras ajouter une permission plus tard si une fonctionnalité réelle la nécessite.

## 4. Découvrir le Developer Portal

Le Developer Portal est l’espace officiel de configuration des applications Discord. Les noms et l’emplacement des menus peuvent évoluer, mais le principe reste le même.

Procédure générale :

1. Ouvre le portail développeur Discord dans ton navigateur.
2. Connecte-toi avec le compte autorisé à créer l’application.
3. Choisis la fonction de création d’une nouvelle application.
4. Donne-lui un nom compréhensible.
5. Lis les conditions et les informations affichées.
6. Ouvre la page de configuration de l’application.

N’utilise pas le compte d’une autre personne et ne demande pas son mot de passe. Si tu n’as pas les droits nécessaires pour installer une application dans un serveur, demande au propriétaire ou à un responsable autorisé de réaliser cette étape.

Le nom peut être modifié selon les possibilités du portail. Choisis surtout un nom qui explique le rôle du bot.

## 5. Informations générales de l’application

La page générale présente des informations utiles, comme le nom, la description et l’identifiant de l’application.

L’identifiant de l’application, parfois appelé Application ID, permet de désigner le projet. Il n’est pas équivalent au token secret.

Une information publique n’a pas le même niveau de sensibilité qu’un secret d’authentification. Néanmoins, évite de publier inutilement des informations internes du projet.

Rédige une description courte :
- ce que fait le bot ;
- où il est prévu de fonctionner ;
- quelles commandes il propose ;
- quelles informations il utilise.

Exemple : « Assistant de test qui répond à la commande /aide dans un serveur de programmation. »

Une description précise aide les personnes qui installent le bot à comprendre son objectif. Elle ne doit pas promettre des fonctions qui n’existent pas.

## 6. Ajouter et comprendre l’utilisateur bot

Dans les réglages de l’application, une section permet de configurer l’utilisateur bot lorsqu’il est nécessaire.

Cet utilisateur automatisé possède un nom et des paramètres propres. Il peut ensuite être invité dans un serveur via le processus d’autorisation.

Avant de continuer, vérifie :
- que tu travailles sur la bonne application ;
- que le bot est bien associé à cette application ;
- que tu comprends quels événements il doit recevoir ;
- que tu n’actives pas des options sans savoir pourquoi.

Un bot n’a pas besoin d’être administrateur pour répondre à une commande simple. Ses permissions doivent correspondre à ses tâches, pas au niveau de confiance que tu lui accordes.

Pour une première version, garde les fonctionnalités limitées. Il sera plus facile de tester et de comprendre un bot qui ne fait qu’une ou deux actions.

## 7. Token : protéger le secret d’authentification

Le token est une donnée secrète qui permet au programme de s’authentifier comme le bot. Toute personne qui le possède peut potentiellement utiliser le bot dans la limite de ses accès.

Règles impératives :
- ne publie jamais le token sur GitHub ;
- ne le place pas dans un fichier Python partagé ;
- ne l’envoie pas dans un salon Discord ;
- ne l’affiche pas dans les journaux ;
- ne le mets pas dans une capture d’écran ;
- ne le transmets pas à une personne qui n’a pas besoin d’y accéder.

Si tu penses qu’un token a été exposé, réinitialise-le depuis le portail développeur et remplace l’ancienne valeur dans l’environnement qui exécute le bot. Supprimer le texte du dernier fichier ne suffit pas toujours : une copie peut rester dans l’historique Git ou dans les journaux.

Le code doit lire le secret depuis une variable d’environnement ou un gestionnaire de secrets.

~~~python
import os

token = os.getenv("DISCORD_TOKEN")

if not token:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")

print("Un token est configuré :", bool(token))
# Ne jamais afficher token lui-même.
~~~

Sur Termux, une variable peut être saisie de façon masquée dans la session courante, puis exportée avant de lancer Python :

~~~bash
read -s -p "Token Discord : " DISCORD_TOKEN
export DISCORD_TOKEN
echo
~~~

La valeur n’est pas écrite dans le fichier du projet. Ferme la session lorsque tu as terminé. Dans Pydroid 3, les possibilités de configuration des variables d’environnement peuvent dépendre de la version et du mode de lancement ; si tu ne peux pas les configurer proprement, ne remplace pas cette méthode par un token écrit dans le code.

## 8. Comprendre les intents

Un intent indique les catégories d’événements que ton application souhaite recevoir via la Gateway Discord. Il aide à limiter les informations transmises au bot.

Exemples :
- événements concernant les serveurs ;
- événements concernant les messages ;
- événements concernant les membres.

Certains intents donnent accès à des informations plus sensibles et sont dits privilégiés. Les intents liés à la présence, aux membres et au contenu des messages sont soumis à des règles spécifiques.

N’active pas tous les intents par défaut. Pour chaque intent, pose-toi deux questions :
1. Quelle fonction du bot en a réellement besoin ?
2. Existe-t-il une manière de faire la même chose sans recevoir ces informations ?

Les commandes d’application, comme les commandes slash, peuvent souvent éviter de lire le contenu général des messages. Les commandes préfixées, par exemple !aide, ont généralement besoin de lire le contenu des messages pour détecter le préfixe ; elles peuvent donc nécessiter l’intent Message Content. Vérifie les exigences actuelles dans la documentation officielle.

## 9. Scopes OAuth2 et permissions du serveur

Un scope OAuth2 indique le type d’autorisation demandé pendant le processus d’installation. Une permission du serveur décrit une action que le bot peut effectuer une fois installé.

Ce sont deux notions différentes.

Exemples de scopes :
- bot : ajouter l’utilisateur bot au serveur ;
- applications.commands : autoriser les commandes d’application.

Exemples de permissions :
- voir un salon ;
- envoyer un message ;
- lire l’historique des messages ;
- intégrer des liens.

Une permission ne doit être cochée que si une fonctionnalité en dépend. Pour une commande /aide, le bot peut avoir besoin de répondre dans le salon où la commande est utilisée, mais il n’a pas besoin de gérer les rôles ou de supprimer les salons.

Le principe du moindre privilège consiste à accorder le minimum de droits nécessaires, puis à réévaluer le besoin à chaque nouvelle fonctionnalité.

## 10. Construire une invitation limitée

Le portail fournit un outil de génération d’URL d’installation ou d’autorisation. Sélectionne uniquement les scopes et permissions nécessaires au projet.

Pour une première commande d’aide :
- sélectionne les scopes adaptés à l’installation et aux commandes ;
- choisis seulement les permissions nécessaires pour voir le contexte utile et répondre ;
- n’active pas Administrator ;
- relis la liste avant de générer l’URL.

L’option Administrator donne un ensemble très large de droits. Elle ne doit pas servir de raccourci pour résoudre un problème de configuration.

Avant d’installer le bot :
1. vérifie le nom de l’application ;
2. vérifie le serveur sélectionné ;
3. relis les permissions demandées ;
4. demande l’accord du propriétaire du serveur si nécessaire ;
5. refuse l’installation si l’URL demande des droits sans rapport avec le projet.

Une invitation n’est pas une preuve que le bot fonctionne. Elle permet seulement de l’autoriser dans un espace donné.

## 11. Préparer un serveur de test et un plan de vérification

Un serveur de test est un espace limité qui sert à vérifier le comportement du bot sans perturber une grande communauté.

Prépare :
- un salon de test ;
- un salon où les commandes ne sont pas autorisées ;
- un rôle de test avec des droits ordinaires ;
- une personne qui peut vérifier les réponses ;
- une liste de résultats attendus.

Exemple de plan :

| Test | Résultat attendu |
|---|---|
| Utiliser /aide dans le salon autorisé | Le bot répond |
| Utiliser la commande dans un salon non prévu | Le bot refuse ou ne répond pas |
| Le bot ne possède pas Administrator | Les fonctions simples continuent de marcher |
| Le token est absent | Le programme s’arrête avec un message clair |
| Le bot est hors ligne | Discord indique qu’il n’est pas disponible |

Teste d’abord une fonctionnalité simple. N’ajoute pas de modération automatique, de messages privés ou d’actions sur les membres avant d’avoir défini des règles claires et un contrôle approprié.

## 12. Préparer le code sans exposer le secret

La prochaine leçon mettra en place un bot avec une bibliothèque Python. Pour l’instant, retiens l’organisation :

~~~text
mon-bot/
    main.py
    README.md
    .gitignore
~~~

Le fichier main.py contiendra le code. README.md expliquera comment installer et lancer le projet sans secret. Le fichier .gitignore évitera d’ajouter par erreur certains fichiers locaux ou temporaires.

Exemple de lecture d’une variable d’environnement :

~~~python
import os

def lire_token():
    valeur = os.getenv("DISCORD_TOKEN")

    if valeur is None or valeur == "":
        raise RuntimeError(
            "Configure DISCORD_TOKEN avant de lancer le bot."
        )

    return valeur

token = lire_token()
print("Configuration prête.")
~~~

Le programme ne révèle pas le contenu du token. Ne remplace jamais la lecture de variable par une chaîne secrète directement dans le code.

## 13. Erreurs fréquentes et débogage

| Message ou symptôme | Cause possible | Vérification |
|---|---|---|
| Bot absent du serveur | Invitation incomplète | Vérifier l’installation et le serveur choisi |
| Missing Access | Permission insuffisante | Vérifier le salon et les permissions |
| Missing Permissions | Droit manquant pour l’action | Ajouter uniquement le droit nécessaire |
| Privileged intent required | Intent demandé sans activation ou autorisation | Relire les réglages et la politique actuelle |
| Token invalide | Secret incorrect ou réinitialisé | Mettre à jour la variable d’environnement |
| Bot hors ligne | Programme arrêté ou connexion perdue | Vérifier le processus et les journaux |
| Commande invisible | Scope ou enregistrement incorrect | Vérifier applications.commands et la portée |

Méthode de diagnostic :
1. note le message exact sans publier de secret ;
2. identifie si le problème concerne l’autorisation, les permissions, le token ou le programme ;
3. vérifie une seule configuration à la fois ;
4. reproduis le problème sur le serveur de test ;
5. note la correction et le résultat.

Ne partage jamais une capture d’écran qui contient le token, une URL d’autorisation privée ou des données de membres.

## 14. Exercices progressifs et mini-projet

### Exercice 1 — Distinguer les éléments

Explique la différence entre application, utilisateur bot et serveur.

### Exercice 2 — Choisir les scopes

Un bot doit être installé dans un serveur et proposer une commande slash /aide. Quels scopes sont pertinents ? Explique leur rôle.

### Exercice 3 — Appliquer le moindre privilège

Un bot répond seulement dans un salon de support. Il n’a pas besoin de bannir des membres ni de gérer les rôles. Cite des permissions qui peuvent être utiles et deux permissions qu’il ne faut pas lui donner sans besoin.

### Exercice 4 — Protéger le token

Un développeur a copié son token dans un dépôt public. Décris les étapes immédiates de protection, sans recopier le secret.

### Exercice 5 — Choisir les intents

Un bot utilise seulement une commande slash /aide et ne lit pas les messages ordinaires. Explique pourquoi il faut examiner si Message Content est réellement nécessaire.

### Mini-projet — Fiche de configuration d’un bot d’aide

Prépare une fiche qui contient :
1. nom et objectif du bot ;
2. serveur de test prévu ;
3. commande principale ;
4. scopes nécessaires ;
5. permissions minimales ;
6. intents réellement nécessaires ;
7. méthode de stockage du token ;
8. cinq tests à réaliser ;
9. une procédure à suivre si le token est exposé.

Ne crée pas de permission Administrator « pour être tranquille ». Le but est de justifier chaque accès.

## 15. Corrigés expliqués, fiche de révision et ressources

### Correction de l’exercice 1

L’application est le projet enregistré dans le portail développeur. L’utilisateur bot est l’identité automatisée associée à ce projet. Le serveur est l’espace Discord dans lequel le bot peut être installé et agir selon ses droits.

### Correction de l’exercice 2

Le scope bot sert à ajouter l’utilisateur bot au serveur. Le scope applications.commands sert aux commandes d’application. Les besoins exacts dépendent de l’architecture ; il faut vérifier la documentation Discord actuelle avant de générer l’invitation.

### Correction de l’exercice 3

Voir le salon où la commande est utilisée et envoyer une réponse peuvent être nécessaires. Gérer les rôles et bannir des membres ne sont pas nécessaires pour une simple commande d’aide. Administrator est excessif.

### Correction de l’exercice 4

Il faut réinitialiser le token dans le portail, mettre à jour la variable d’environnement de l’application, vérifier les journaux et l’historique du dépôt, puis éviter de republier le secret. Il faut aussi examiner si le bot a été utilisé pendant la période d’exposition.

### Correction de l’exercice 5

Une commande slash est transmise comme une interaction d’application. Si le bot n’a pas besoin de lire le texte des messages ordinaires, Message Content peut être inutile. Il faut activer seulement les intents nécessaires au fonctionnement réel.

### Fiche de révision

| Notion | À retenir |
|---|---|
| Application | Projet déclaré dans le portail développeur |
| Bot user | Identité automatisée de l’application |
| Application ID | Identifiant du projet, pas un token |
| Token | Secret d’authentification |
| Intent | Type d’événement ou de donnée demandé |
| Scope | Autorisation demandée pendant OAuth2 |
| Permission | Action autorisée dans le serveur |
| Moindre privilège | Donner le minimum de droits nécessaires |
| Serveur de test | Espace limité pour vérifier le bot |

### Ressources officielles

- Portail développeur : https://discord.com/developers/applications
- Documentation des commandes d’application : https://discord.com/developers/docs/interactions/slash-commands
- Guide sur les intents privilégiés : https://support-dev.discord.com/hc/en-us/articles/6207308062871-What-are-Privileged-Intents
- Documentation développeur : https://discord.com/developers/docs/intro

Les écrans et règles peuvent évoluer. Consulte les pages officielles avant une configuration réelle, surtout pour les intents et les permissions.

**Validation avant la leçon 03 :** tu dois pouvoir expliquer application, bot, token, intents, scopes et permissions, puis justifier pourquoi Administrator n’est pas nécessaire à un bot d’aide simple.

**Prochaine étape :** préparer l’environnement Python et lancer un premier bot de test sans exposer son token.

---

*Académique — Discord, leçon 02.*  
*©pythonschool*