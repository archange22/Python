# Discord — Leçon 01 : Comprendre Discord et préparer son premier bot

**Parcours :** Discord et automatisation  
**Niveau :** Débutant  
**Durée indicative :** 45 à 60 minutes  
**Matériel :** Un compte Discord et un téléphone ou un ordinateur. La création de bot se prépare dans le navigateur.

## Objectifs de la leçon

À la fin de cette leçon, tu sauras :
- expliquer ce qu’est Discord et comment un serveur est organisé ;
- distinguer un serveur, une catégorie, un salon, un rôle et une permission ;
- comprendre la différence entre un compte humain et un bot ;
- identifier les éléments nécessaires à la création d’une application Discord ;
- expliquer ce qu’est un événement et une commande ;
- protéger le jeton secret d’un bot ;
- préparer un petit projet de bot sans donner de permissions excessives.

Cette première leçon explique les bases avant de passer à la programmation. Tu n’as pas besoin d’être administrateur d’un grand serveur pour comprendre les exemples.

## 1. Qu’est-ce que Discord ?

Discord est une plateforme de communication. Elle permet de discuter par texte, voix et vidéo, de partager des fichiers et d’organiser des communautés.

Un groupe organisé sur Discord utilise généralement un **serveur**. Un serveur peut être consacré à une école, un jeu, un projet de programmation ou une communauté.

Discord est accessible depuis :
- une application mobile ;
- une application pour ordinateur ;
- un navigateur Web.

Les menus peuvent légèrement changer selon la version de l’application. Les principes d’organisation restent semblables.

## 2. Comprendre la structure d’un serveur

Un serveur regroupe des catégories, des salons, des membres et des rôles.

### Serveur

C’est l’espace principal d’une communauté. Il possède un nom, une icône, des membres et des paramètres.

### Catégorie

Une catégorie permet de regrouper plusieurs salons qui ont un sujet proche. Par exemple, une catégorie « Informations » peut contenir un salon d’annonces et un salon de règles.

### Salon

Un salon est un espace où les membres échangent ou consultent des informations. Il existe différents types :
- salon textuel ;
- salon vocal ;
- salon d’annonces ;
- salon réservé à certains rôles.

### Exemple d’organisation

- Accueil
  - bienvenue
  - règlement
  - annonces
- Communauté
  - discussion
  - questions
- Jeux
  - recherche-de-partie
  - résultats
- Équipe
  - modération
  - rapports

Une organisation claire aide les membres à trouver les bonnes informations.

## 3. Les rôles : organiser les responsabilités

Un rôle est un ensemble de permissions attribué à un membre ou à un bot.

Exemples :
- Membre ;
- Modérateur ;
- Responsable événement ;
- Administrateur ;
- Bot d’annonces.

Un rôle ne doit pas être attribué uniquement pour faire joli. Il doit correspondre à une responsabilité réelle.

### Exemple

Un rôle « Animateur » peut avoir le droit de publier des annonces dans un salon événementiel, sans avoir le droit de modifier les rôles du serveur.

Un rôle « Modérateur » peut avoir des outils de modération adaptés à sa mission.

## 4. Les permissions : donner uniquement les droits nécessaires

Les permissions déterminent ce qu’un membre ou un bot peut faire.

Quelques exemples :
- voir un salon ;
- envoyer des messages ;
- joindre des fichiers ;
- gérer des messages ;
- expulser un membre ;
- gérer des rôles.

La règle importante est le **principe du moindre privilège** : donner uniquement les permissions nécessaires à la tâche.

Un bot qui publie une annonce n’a pas besoin d’être administrateur du serveur. Lui accorder tous les droits augmente les risques en cas d’erreur ou de compromission.

Avant d’ajouter un bot, vérifie :
1. qui l’a développé ;
2. ce qu’il est censé faire ;
3. les permissions demandées ;
4. les salons auxquels il doit accéder ;
5. comment le retirer si nécessaire.

## 5. Qu’est-ce qu’un bot Discord ?

Un bot est un programme qui se connecte à Discord avec une application dédiée. Il peut répondre à des événements et effectuer des tâches autorisées.

Exemples :
- accueillir un nouveau membre ;
- répondre à une commande ;
- afficher une aide ;
- publier un rappel ;
- organiser un petit classement ;
- aider à la modération avec des règles claires.

Un bot n’est pas un compte humain ordinaire. Il utilise une identité de bot liée à une application créée dans l’espace développeur de Discord.

## 6. Application, bot, API et bibliothèque

Ces quatre mots sont importants.

**Application :** le projet enregistré dans l’espace développeur. Il contient les paramètres associés au bot.

**Bot :** l’utilisateur automatisé qui représente ton programme sur Discord.

**API :** une interface qui permet à ton programme de communiquer avec Discord selon des règles définies.

**Bibliothèque :** du code réutilisable qui facilite l’utilisation de l’API. En Python, une bibliothèque connue est discord.py.

La bibliothèque ne remplace pas Discord. Elle facilite les échanges entre ton programme et le service.

## 7. Le jeton secret du bot

Lorsqu’un bot doit s’authentifier, il utilise un jeton secret appelé **token**.

Ce jeton est comparable à une clé d’accès. Une personne qui le possède peut potentiellement contrôler le bot selon ses permissions.

Règles essentielles :
- ne publie jamais le token sur GitHub ;
- ne l’envoie jamais dans un salon Discord ;
- ne le place pas dans une capture d’écran publique ;
- ne l’écris pas directement dans un fichier partagé ;
- si tu penses qu’il a été exposé, remplace-le depuis l’espace développeur ;
- utilise une variable d’environnement ou un stockage de secrets adapté.

Un token visible dans un exemple de code doit toujours être un texte fictif, jamais une vraie clé.

## 8. Les événements et les commandes

Un événement est une situation à laquelle le bot peut réagir.

Exemples :
- le bot vient de se connecter ;
- un nouveau membre rejoint le serveur ;
- un message est reçu ;
- une interaction avec une commande est déclenchée.

Une commande est une demande précise faite au bot.

Exemples :
- /aide ;
- /ping ;
- /profil.

La différence est simple : un événement arrive, tandis qu’une commande représente une action demandée.

Pour concevoir un bot fiable, il faut décider :
1. quels événements l’intéressent ;
2. quelles commandes il propose ;
3. qui a le droit de les utiliser ;
4. quelle réponse il doit envoyer ;
5. comment il réagit en cas d’erreur.

## 9. Préparer son premier projet

Avant d’écrire du code, définis un objectif très limité.

Exemple de projet : **Bot d’accueil**

Objectif : accueillir un membre lorsqu’il rejoint le serveur.

Fonctionnement prévu :
1. le bot se connecte ;
2. il attend un événement d’arrivée ;
3. il reçoit les informations nécessaires sur le membre ;
4. il publie un message dans le salon choisi ;
5. il écrit une erreur dans les journaux si le salon est indisponible.

Le bot ne doit pas collecter d’informations personnelles inutiles. Il ne doit pas envoyer de messages privés répétitifs ou dérangeants.

## 10. Découvrir Python et discord.py

La bibliothèque discord.py permet de créer des bots en Python.

Voici un exemple d’organisation de code. Il montre une structure, mais ne se connecte pas encore à Discord car il ne contient aucun token.

~~~python
import os
import discord
from discord.ext import commands

intents = discord.Intents.default()

bot = commands.Bot(
    command_prefix="!",
    intents=intents
)

@bot.event
async def on_ready():
    print(f"Bot connecté : {bot.user}")

token = os.getenv("DISCORD_BOT_TOKEN")

if not token:
    raise RuntimeError("Le token du bot est absent.")

bot.run(token)
~~~

### Comprendre les lignes principales

- **import os** : donne accès aux fonctions de gestion de l’environnement.
- **import discord** : importe la bibliothèque Discord.
- **commands.Bot** : crée l’objet principal du bot.
- **intents** : indiquent les événements et informations auxquels le bot demande accès.
- **on_ready** : fonction appelée lorsque le bot a terminé sa connexion.
- **os.getenv** : lit une variable d’environnement.
- **bot.run** : démarre la connexion avec le token fourni.

Les intents et autorisations doivent correspondre aux fonctionnalités réellement utilisées. N’active pas toutes les options sans raison.

## 11. Tester sans mettre le serveur en danger

Pour les premiers tests :
- utilise un serveur de test ;
- ajoute uniquement les permissions nécessaires ;
- teste une fonctionnalité à la fois ;
- évite de donner la permission Administrateur ;
- surveille les messages et les journaux du bot ;
- retire le bot si son comportement devient inattendu.

Un serveur de test permet de corriger les erreurs sans perturber une communauté réelle.

### Quelques erreurs classiques

**Le bot ne se connecte pas :** le token peut être absent, incorrect ou révoqué.

**Le bot ne reçoit pas un événement :** l’intent nécessaire peut manquer, ou l’événement peut ne pas être activé pour l’application.

**Le bot ne peut pas écrire dans un salon :** ses permissions ou les permissions du salon peuvent l’en empêcher.

**Le bot s’arrête :** le programme peut avoir rencontré une erreur ou l’environnement d’exécution peut s’être fermé.

## 12. Exercices progressifs

Fais les exercices avant de consulter les réponses.

### Exercice 1 — Vocabulaire

Explique avec tes propres mots la différence entre :
- un serveur ;
- une catégorie ;
- un salon ;
- un rôle ;
- une permission.

### Exercice 2 — Concevoir une structure

Imagine un serveur pour un club de programmation. Propose :
- trois catégories ;
- au moins deux salons par catégorie ;
- trois rôles ;
- une phrase qui explique le rôle de chaque catégorie.

### Exercice 3 — Choisir les permissions

Un bot doit uniquement publier les résultats d’un concours dans un salon. Parmi les permissions suivantes, lesquelles sont utiles ?
- voir le salon ;
- envoyer des messages ;
- gérer tous les rôles ;
- administrateur ;
- joindre des fichiers si le résultat contient une image.

Justifie ta réponse.

### Exercice 4 — Sécurité

Un développeur colle le token de son bot dans un dépôt public. Explique le problème et indique les actions nécessaires pour corriger la situation.

### Exercice 5 — Événement ou commande ?

Classe ces actions :
- un membre rejoint le serveur ;
- un utilisateur demande /aide ;
- le bot se connecte ;
- un utilisateur utilise /ping.

Explique pourquoi.

## 13. Mini-défi — Dessiner ton premier bot

Choisis un bot simple : accueil, aide, annonces ou rappel.

Écris une fiche avec :
1. son nom ;
2. son objectif ;
3. trois commandes ou événements ;
4. les permissions nécessaires ;
5. les permissions qui ne sont pas nécessaires ;
6. une règle pour protéger son token ;
7. une manière de tester le bot sans perturber ton serveur principal.

Tu peux dessiner le fonctionnement sous forme de flèches :

**Événement ou commande → Vérification → Action → Réponse**

## 14. Corrections des exercices

### Correction de l’exercice 1

- **Serveur :** espace principal d’une communauté.
- **Catégorie :** groupe de salons organisés par thème.
- **Salon :** lieu de discussion ou de consultation.
- **Rôle :** ensemble de responsabilités et de permissions.
- **Permission :** droit d’effectuer une action précise.

### Exemple de correction de l’exercice 2

- Catégorie « Informations » : règlement, annonces.
- Catégorie « Programmation » : questions, projets.
- Catégorie « Communauté » : discussion, événements.

Rôles possibles :
- Membre : participe aux échanges.
- Animateur : organise les événements.
- Modérateur : veille au respect des règles.

Les noms peuvent être différents tant que l’organisation reste claire.

### Correction de l’exercice 3

Le bot doit pouvoir voir le salon et envoyer des messages. La permission de joindre des fichiers est utile seulement si les résultats doivent contenir des images ou des documents.

Gérer tous les rôles et Administrateur ne sont pas nécessaires pour publier un résultat.

### Correction de l’exercice 4

Le token est un secret d’authentification. Il faut le révoquer ou le régénérer immédiatement, supprimer sa présence dans le code public si possible, puis le remplacer par une variable d’environnement ou un stockage de secrets. Il faut également vérifier les actions effectuées par le bot pendant l’exposition.

Supprimer le texte du dépôt ne suffit pas toujours : le secret peut rester dans l’historique Git.

### Correction de l’exercice 5

- Un membre rejoint le serveur : événement.
- Un utilisateur demande /aide : commande.
- Le bot se connecte : événement.
- Un utilisateur utilise /ping : commande.

Un événement décrit quelque chose qui arrive. Une commande est une action demandée par un utilisateur.

## 15. Fiche de révision et validation

| Notion | À retenir |
|---|---|
| Serveur | Espace principal de la communauté |
| Catégorie | Regroupe plusieurs salons |
| Salon | Espace de discussion ou d’information |
| Rôle | Regroupe des permissions |
| Permission | Autorise une action |
| Bot | Programme connecté à Discord |
| API | Interface de communication |
| Bibliothèque | Code réutilisable |
| Événement | Situation à laquelle le bot réagit |
| Commande | Action demandée au bot |
| Token | Secret d’authentification |

Avant de passer à la prochaine leçon, vérifie que tu peux :
- expliquer l’organisation d’un serveur ;
- distinguer rôle et permission ;
- expliquer ce qu’est un bot ;
- distinguer événement et commande ;
- décrire le rôle d’une bibliothèque ;
- expliquer pourquoi un token doit rester secret ;
- proposer un bot qui n’utilise que les droits nécessaires.

**À retenir :** un bon bot commence par un objectif clair, des permissions limitées, un token protégé et des tests sur un serveur adapté.

---

*Académique — Discord, leçon 01. Contenu pédagogique original en français.*  
*©pythonschool*
