# Discord — Leçon 03 : Préparer Python et lancer un premier bot

**Parcours :** Discord  
**Numéro :** 03  
**Niveau :** Débutant  
**Durée indicative :** 70 à 90 minutes  
**Environnement :** Pydroid 3 sur Android ou ordinateur ; serveur Discord de test.  
**Prérequis :** Leçons 01 et 02 : serveurs, salons, rôles, application développeur, bot, token, intents et permissions minimales.

## 1. Objectifs et prérequis

Tu sais qu'un bot Discord est un programme lié à une application. Nous allons préparer Python et créer un bot de test qui se connecte et répond à une commande simple.

À la fin, tu sauras :
- comprendre le rôle de Python et de discord.py ;
- installer une bibliothèque dans Pydroid 3 ;
- organiser un petit projet ;
- lire un token depuis une variable d'environnement ;
- créer un bot avec des intents adaptés ;
- écouter l'événement de connexion ;
- créer une commande préfixée ;
- tester avec des permissions limitées ;
- diagnostiquer les erreurs sans exposer le secret.

Un token est un secret : ne le partage jamais dans un message, une capture ou un dépôt.

## 2. Comment fonctionne un bot ?

Un bot communique avec les services Discord. Il reçoit des événements, par exemple une connexion ou un message, puis exécute le code prévu.

Analogie : un bot ressemble à un agent d'accueil. Il attend un événement, vérifie la demande et répond selon les règles du programme.

Le programme doit être lancé dans un environnement connecté à Internet. Si Android ferme l'application ou interrompt le processus en arrière-plan, le bot peut se déconnecter. Le téléphone suffit pour apprendre et tester, mais n'est pas forcément adapté à un service disponible 24 h/24.

## 3. Python et discord.py

Python est le langage du programme. discord.py est une bibliothèque qui fournit des outils pour communiquer avec Discord. Une bibliothèque est un ensemble de code réutilisable qui évite de réécrire toute la communication réseau.

La leçon utilise une version récente de discord.py. Les écrans et les versions peuvent évoluer : consulte la documentation officielle si un nom change.

Utilise une application bot officielle. N'automatise pas un compte utilisateur personnel à la place d'un bot.

## 4. Préparer Pydroid 3 sur Android

Étapes :
1. ouvre Pydroid 3 ;
2. vérifie que Python démarre ;
3. ouvre le gestionnaire de paquets ou Pip ;
4. recherche discord.py ;
5. installe le paquet ;
6. crée bot.py ;
7. teste l'import.

~~~python
import discord

print("Bibliothèque importée.")
print(discord.__version__)
~~~

Si l'import fonctionne, le paquet est disponible dans cet environnement. Si l'installation échoue, vérifie la connexion, l'espace de stockage et le message complet. N'installe pas un fichier inconnu provenant d'un site non officiel.

Sur Android, les restrictions de batterie et d'arrière-plan peuvent interrompre les tâches réseau. Le téléphone convient à l'apprentissage, mais un hébergement sera nécessaire pour une disponibilité continue.

## 5. Organiser le projet

Crée un dossier contenant le programme et une documentation :

~~~text
mon-bot/
    bot.py
    README.md
~~~

bot.py contient le code. README.md explique l'installation et le lancement sans inclure de secret.

Ne place jamais le token réel dans le code source. Ne le publie pas sur GitHub, même dans un dépôt privé. Un secret peut être copié ou partagé accidentellement.

Les fichiers de configuration contenant des secrets doivent rester hors du dépôt et être exclus par .gitignore. Dans cette leçon, le programme lira une variable d'environnement.

## 6. Lire le token depuis l'environnement

Le token est un secret d'authentification. Python peut lire une variable d'environnement avec le module standard os.

~~~python
import os

token = os.getenv("DISCORD_TOKEN")

if not token:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")
~~~

os.getenv cherche la variable. Si elle n'existe pas, le résultat est None et le programme affiche une erreur explicite.

Configure la variable dans l'environnement de lancement ou dans le gestionnaire de secrets de l'hébergement. La méthode exacte dépend de l'outil utilisé. Ne fais jamais print(token), même temporairement.

Si un token est exposé, considère-le compromis : révoque-le ou régénère-le depuis le portail développeur, puis remplace la variable. Effacer le texte du fichier ne retire pas nécessairement le secret de l'historique Git.

## 7. Créer le bot et choisir les intents

discord.py utilise un objet Bot pour gérer les commandes et événements.

~~~python
import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(
    command_prefix="!",
    intents=intents
)
~~~

command_prefix définit le caractère qui précède une commande. intents décrit les événements ou données demandés.

Message Content est un intent privilégié pour les bots qui doivent lire le contenu des messages ordinaires. Il doit être activé dans le portail développeur lorsque la plateforme l'exige.

Ne demande que les intents nécessaires. Un bot qui utilise uniquement les commandes d'application peut avoir des besoins différents. Le choix dépend des fonctions réellement utilisées.

## 8. Comprendre les événements

Un événement signale qu'une situation s'est produite. on_ready est appelé lorsque le client est prêt après sa connexion.

~~~python
@bot.event
async def on_ready():
    print("Le bot est connecté.")
    print("Nom :", bot.user)
~~~

async def déclare une fonction asynchrone. Elle peut attendre des opérations réseau sans bloquer le programme de la même manière qu'une fonction classique.

N'affiche jamais le token dans le message de connexion. Les journaux doivent aider au diagnostic sans révéler de secret.

## 9. Créer une commande

Une commande préfixée est déclenchée par un message qui commence par le préfixe choisi.

~~~python
@bot.command()
async def ping(ctx):
    await ctx.reply("Pong !")
~~~

Le décorateur bot.command enregistre la fonction. ctx contient le contexte du message, comme l'auteur et le salon. await attend l'envoi de la réponse.

Dans le serveur de test, écris !ping dans un salon où le bot peut lire et répondre. Il n'a pas besoin d'Administrator pour envoyer une réponse.

## 10. Programme complet de démonstration

~~~python
import os
import discord
from discord.ext import commands

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("Configure DISCORD_TOKEN avant le lancement.")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print("Bot connecté :", bot.user)

@bot.command()
async def ping(ctx):
    await ctx.reply("Pong !")

bot.run(token)
~~~

Le programme importe les modules, lit le secret, vérifie sa présence, configure les intents, crée le bot, définit un événement et une commande, puis lance la connexion.

Avant le lancement, vérifie que le bot est installé sur un serveur de test et possède uniquement les permissions nécessaires.

## 11. Inviter le bot avec le moindre privilège

Dans le portail développeur, vérifie l'application et le bot. Utilise les scopes nécessaires à l'installation. Pour ajouter un bot à un serveur, le scope bot est généralement nécessaire.

Permissions possibles pour ce test :
- voir le salon de test ;
- lire les messages si la commande préfixée le nécessite ;
- envoyer des messages ;
- lire l'historique si le fonctionnement l'exige.

N'active pas Administrator par facilité. Cette permission donne des pouvoirs étendus et augmente les conséquences d'une erreur ou d'une fuite de token.

Utilise un serveur de test que tu contrôles. N'invite pas un bot non testé dans un serveur public.

## 12. Tester de manière méthodique

1. Vérifie que le bot apparaît en ligne.
2. Envoie !ping dans un salon autorisé.
3. Vérifie la réponse Pong.
4. Teste dans un salon où il ne doit pas répondre.
5. Lis les journaux locaux.
6. Arrête le programme lorsque le test est terminé.

Un test doit avoir un résultat attendu. Si le bot ne répond pas, ne change pas plusieurs réglages à la fois. Vérifie une hypothèse après l'autre.

Note les versions de Python et de discord.py, les intents activés et les permissions de test. Ces informations facilitent le diagnostic.

## 13. Erreurs fréquentes et débogage

| Problème | Cause possible | Vérification |
|---|---|---|
| ModuleNotFoundError | Paquet absent de cet environnement | Installer dans le même Python |
| DISCORD_TOKEN absent | Variable non configurée | Vérifier l'environnement |
| LoginFailure | Token invalide ou révoqué | Régénérer le secret |
| Bot en ligne mais commande muette | Intent ou permissions manquants | Vérifier Message Content et le salon |
| Missing Permissions | Droit de salon insuffisant | Accorder uniquement le droit nécessaire |
| Déconnexion Android | Restriction arrière-plan ou réseau | Relancer en premier plan |

Ne copie pas une trace complète sur Internet sans vérifier qu'elle ne contient pas de secret. Masque les informations privées qui ne sont pas nécessaires au diagnostic.

Si le token a été exposé, révoque-le et remplace-le. Le supprimer du fichier courant ne suffit pas si le secret est déjà dans l'historique du dépôt.

## 14. Exercices progressifs

**Exercice 1 :** écris un script qui importe discord et affiche la version, sans afficher de token.

**Exercice 2 :** lis DISCORD_TOKEN avec os.getenv et affiche seulement « Secret présent » ou « Secret absent ».

**Exercice 3 :** explique pourquoi la commande préfixée !ping utilise Message Content. Cite un cas où des commandes d'application peuvent avoir des besoins différents.

**Exercice 4 :** explique le rôle de bot.command, async def, ctx et await.

**Exercice 5 :** liste les permissions nécessaires à une réponse dans un salon de test. Explique pourquoi Administrator est excessif.

## 15. Mini-projet : bot de test avec deux commandes

Ajoute une commande aide qui répond « Commandes disponibles : !ping et !aide ».

Contraintes :
- garder le token dans DISCORD_TOKEN ;
- ne jamais l'afficher ;
- conserver uniquement les intents nécessaires ;
- utiliser un serveur de test ;
- ne pas demander Administrator ;
- tester les deux commandes ;
- documenter le lancement sans secret dans README.md.

Tu peux aussi ajouter bonjour, qui répond avec le nom d'affichage de l'auteur. Vérifie que les informations publiées sont adaptées au salon.

## 16. Corrigés expliqués

**Exercice 1**

~~~python
import discord
print("Version :", discord.__version__)
~~~

L'import vérifie la présence de la bibliothèque. Aucun token n'est requis.

**Exercice 2**

~~~python
import os
token = os.getenv("DISCORD_TOKEN")

if token:
    print("Secret présent.")
else:
    print("Secret absent.")
~~~

Le programme vérifie la présence du secret sans en révéler la valeur.

**Exercice 3 :** une commande préfixée doit lire le texte du message pour reconnaître !ping. Un bot qui utilise uniquement les commandes d'application reçoit des interactions sans analyser tous les messages ordinaires.

**Exercice 4 :** bot.command enregistre la commande ; async def déclare une fonction asynchrone ; ctx contient le contexte ; await attend l'envoi de la réponse.

**Exercice 5 :** le bot doit voir le salon et envoyer une réponse. Lire l'historique peut être nécessaire selon le fonctionnement. Administrator est excessif pour ces actions.

## 17. Mini-projet corrigé et fiche de révision

~~~python
import os
import discord
from discord.ext import commands

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("DISCORD_TOKEN est absent.")

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print("Connecté :", bot.user)

@bot.command()
async def ping(ctx):
    await ctx.reply("Pong !")

@bot.command()
async def aide(ctx):
    await ctx.reply("Commandes disponibles : !ping et !aide")

bot.run(token)
~~~

Le programme possède deux commandes et lit le secret dans l'environnement. Il ne donne aucun pouvoir administratif au bot.

| Élément | Rôle |
|---|---|
| Python | Langage du programme |
| discord.py | Bibliothèque Discord |
| Token | Secret d'authentification |
| Variable d'environnement | Fournit le secret |
| Intent | Catégorie d'événements demandée |
| Événement | Situation à laquelle réagir |
| Commande | Action déclenchée par invocation |
| ctx | Contexte de la commande |
| await | Attend une opération asynchrone |
| Moindre privilège | Accorder le minimum de droits |

Avant la leçon 04, vérifie que tu peux importer discord.py, lire un token sans l'afficher, expliquer les intents, tester !ping et diagnostiquer une permission manquante.

**Prochaine étape :** approfondir les commandes, leurs paramètres, les événements et les contrôles d'accès.

---

*Académique — Discord, leçon 03.*  
*©pythonschool*