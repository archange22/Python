# Discord — Leçon 04 : Commandes, paramètres et événements

**Parcours :** Discord  
**Numéro :** 04  
**Niveau :** Débutant avec notions intermédiaires  
**Durée indicative :** 75 à 100 minutes  
**Environnement :** Pydroid 3 sur Android ou ordinateur, Python et un serveur Discord de test.  
**Prérequis :** Leçons 01 à 03 : application développeur, bot, token, intents, installation de discord.py et premier bot.

## Objectifs et prérequis

Un bot utile comprend des demandes, réagit aux événements et vérifie les permissions avant d'agir. À la fin, tu sauras créer des commandes préfixées et slash, utiliser des paramètres, écouter des événements, appliquer des contrôles de permission, limiter la fréquence d'utilisation et gérer les erreurs.

Utilise seulement un serveur de test où tu es autorisé à installer un bot. Ne demande pas Administrateur si une permission plus précise suffit. Le token reste secret.

## Sommaire

1. Cycle d'une interaction
2. Préparer le projet en sécurité
3. Commandes préfixées
4. Paramètres et conversions
5. Événements et listeners
6. Commandes slash
7. Permissions et contrôles
8. Cooldowns et erreurs
9. Organisation et tests
10. Mini-projet
11. Exercices et corrections
12. Révision

## 1. Le cycle d'une interaction

Une commande est une demande explicite, comme !ping ou /aide. Un événement est une action signalée par Discord, comme l'arrivée d'un membre ou la réception d'un message.

Analogie : une commande ressemble à une question posée au guichet. Un événement ressemble à une sonnette : le programme réagit lorsqu'elle retentit.

Le bot reçoit des données, vérifie ce qu'il doit faire puis exécute une fonction. Une commande ne doit pas être considérée comme autorisée simplement parce qu'un utilisateur peut l'écrire. Le code doit vérifier le contexte, les permissions et les limites nécessaires.

Les fonctions de discord.py sont souvent asynchrones. await attend une opération réseau sans bloquer toutes les autres interactions. Un traitement très long doit être organisé pour ne pas immobiliser le bot.

## 2. Préparer le projet en sécurité

Le code ne doit jamais contenir le token réel. Lis-le depuis une variable d'environnement appelée DISCORD_TOKEN.

~~~python
import os

TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")
~~~

Ne fais jamais print(TOKEN). Ne colle pas le secret dans une capture, un message ou un dépôt. Si le token est exposé, révoque-le depuis le portail développeur puis remplace la variable.

Dans Pydroid 3, vérifie que discord.py est installé et que le programme a accès à Internet. Android peut suspendre les applications en arrière-plan : le téléphone convient aux essais, mais pas forcément à un bot disponible en continu.

Les permissions d'un bot, les intents et les scopes OAuth2 sont différents. Accorde uniquement ce qui est nécessaire à la fonction du bot.

## 3. Commandes préfixées

Une commande préfixée commence par un symbole, comme !. L'extension commands transforme le message en appel de fonction.

~~~python
import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command()
async def ping(ctx):
    await ctx.send("Pong !")
~~~

ctx est le contexte de la commande : auteur, salon et message. await indique que l'envoi est asynchrone.

Pour lire les messages ordinaires avec des commandes préfixées, l'intent Message Content doit être activé lorsque Discord l'exige. N'active pas tous les intents par habitude.

## 4. Paramètres et conversions

Une commande peut recevoir des paramètres. discord.py convertit certains types courants.

~~~python
@bot.command()
async def addition(ctx, a: int, b: int):
    await ctx.send(f"Résultat : {a + b}")
~~~

L'utilisateur écrit !addition 4 7. Les valeurs deviennent des entiers. Si la conversion échoue, discord.py déclenche une erreur.

Pour recevoir le reste du texte comme un seul paramètre, utilise keyword-only :

~~~python
@bot.command()
async def dire(ctx, *, message: str):
    if not message.strip():
        await ctx.send("Écris un message après la commande.")
        return
    await ctx.send(message)
~~~

Une commande qui répète du texte doit respecter les règles du serveur et éviter le spam. Ajoute des limites lorsque c'est nécessaire.

## 5. Événements et listeners

on_ready est appelé lorsque le bot est prêt. on_message est appelé lorsqu'un message est reçu.

~~~python
@bot.event
async def on_ready():
    print("Le bot est prêt.")
~~~

Si tu redéfinis on_message, les commandes préfixées peuvent ne plus être traitées automatiquement. Il faut appeler bot.process_commands(message).

~~~python
@bot.event
async def on_message(message):
    if message.author.bot:
        return

    if message.content.lower() == "bonjour":
        await message.channel.send("Bonjour !")

    await bot.process_commands(message)
~~~

message.author.bot évite de répondre aux messages des bots. Sans cette protection, deux bots peuvent se répondre indéfiniment.

Un listener séparé avec bot.listen("on_message") permet souvent d'ajouter une réaction sans remplacer le traitement normal des commandes. Choisis la méthode la plus simple.

## 6. Commandes slash

Les commandes slash apparaissent dans l'interface Discord et proposent des paramètres structurés. Avec discord.py 2.x, elles utilisent app_commands.

~~~python
from discord import app_commands

class MonBot(commands.Bot):
    async def setup_hook(self):
        await self.tree.sync()

intents = discord.Intents.default()
bot = MonBot(command_prefix="!", intents=intents)

@bot.tree.command(name="bonjour", description="Répond avec un message de bienvenue.")
async def bonjour(interaction: discord.Interaction):
    await interaction.response.send_message("Bonjour !")
~~~

La synchronisation publie les commandes enregistrées. Pour un projet de test, une synchronisation limitée au serveur peut accélérer les essais. Vérifie la documentation actuelle de discord.py avant de modifier la stratégie.

Une interaction doit recevoir une réponse dans le délai prévu. Pour une opération longue, utilise defer puis followup. Ne réponds pas deux fois à la même interaction avec response.

## 7. Permissions et contrôles

Le moindre privilège signifie que le bot reçoit uniquement les droits nécessaires.

~~~python
@bot.command()
@commands.has_guild_permissions(manage_guild=True)
async def regles(ctx):
    await ctx.send("Consulte les règles du serveur.")
~~~

Ce contrôle vérifie les permissions du membre. Le bot doit aussi posséder les permissions nécessaires à l'action. Pour limiter une commande à un serveur, utilise commands.guild_only().

Pour vérifier un rôle, compare les identifiants de rôles configurés plutôt que de te fier uniquement au nom visible. Ne donne pas Administrateur par facilité.

Pour envoyer un message, Send Messages peut suffire. Pour gérer des rôles, Manage Roles est nécessaire seulement si le bot réalise réellement cette opération. Le rôle du bot doit également se trouver au bon niveau dans la hiérarchie.

## 8. Cooldowns et gestion des erreurs

Un cooldown limite la fréquence d'une commande.

~~~python
@bot.command()
@commands.cooldown(1, 5, commands.BucketType.user)
async def aide(ctx):
    await ctx.send("Commandes : !ping, !aide")
~~~

Ici, un utilisateur peut appeler la commande une fois toutes les cinq secondes. Le type user applique la limite séparément à chaque utilisateur.

Gère les erreurs de conversion et de permission avec des messages simples.

~~~python
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandOnCooldown):
        await ctx.send("Attends quelques secondes.")
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("Permission insuffisante.")
    elif isinstance(error, commands.BadArgument):
        await ctx.send("Vérifie les paramètres.")
    elif isinstance(error, commands.CommandNotFound):
        return
    else:
        print(type(error).__name__)
        await ctx.send("Une erreur est survenue.")
~~~

Dans un vrai projet, conserve les détails techniques dans des journaux privés, sans token ni données sensibles. Ne publie pas une trace complète dans un salon.

## 9. Organisation et tests

Quand le bot grandit, les Cogs de discord.py permettent de regrouper commandes et listeners par thème. Commence avec un fichier simple ; sépare les modules lorsque chaque fichier a une responsabilité claire.

Plan de test :

1. Le bot démarre sans afficher de secret.
2. !ping répond dans le serveur de test.
3. Une commande avec un nombre invalide affiche une aide.
4. Une commande protégée refuse un membre non autorisé.
5. Un utilisateur qui répète une commande rencontre le cooldown.
6. Le bot ne répond pas à ses propres messages.
7. Les erreurs inattendues sont journalisées sans secret.

Teste aussi un salon où le bot ne peut pas envoyer de message. Une commande correcte en code peut échouer si le bot n'a pas accès au salon.

## 10. Mini-projet : bot d'aide

Ce bot propose !ping et !addition. Il lit le token depuis l'environnement, utilise un intent limité et répond proprement à une erreur de conversion.

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
    print("Le bot est prêt.")

@bot.command()
async def ping(ctx):
    await ctx.send("Pong !")

@bot.command()
async def addition(ctx, a: int, b: int):
    await ctx.send(f"Résultat : {a + b}")

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.BadArgument):
        await ctx.send("Utilise deux entiers, par exemple !addition 3 5.")
    elif isinstance(error, commands.CommandNotFound):
        return
    else:
        print(type(error).__name__)
        await ctx.send("La commande n'a pas pu être exécutée.")

bot.run(token)
~~~

Lance ce code seulement après avoir configuré la variable. Le code ne contient aucun token réel. Dans le portail développeur, active l'intent nécessaire aux commandes préfixées.

## 11. Exercices progressifs

1. Ajoute une commande !version.
2. Crée !multiplier avec deux entiers.
3. Ajoute une commande slash /salut.
4. Écris un listener qui ignore les messages des bots.
5. Protège une commande avec has_guild_permissions.
6. Ajoute un cooldown par utilisateur.
7. Défi : construis un bot d'aide avec deux commandes préfixées, une commande slash et des erreurs compréhensibles. Documente les permissions nécessaires.

Ne teste pas des commandes de modération sur un serveur public sans l'accord de ses responsables.

## 12. Corrigés expliqués

~~~python
@bot.command()
async def version(ctx):
    await ctx.send("Version de test 1.0")

@bot.command()
async def multiplier(ctx, a: int, b: int):
    await ctx.send(f"Produit : {a * b}")

@bot.tree.command(name="salut", description="Dit bonjour.")
async def salut(interaction: discord.Interaction):
    await interaction.response.send_message("Bonjour !")

@bot.command()
@commands.has_guild_permissions(manage_guild=True)
async def aide_admin(ctx):
    await ctx.send("Commande réservée aux responsables.")
~~~

Pour ignorer les bots, teste message.author.bot avant le traitement. Pour un cooldown, ajoute le décorateur commands.cooldown. Pour une commande slash, synchronise l'arbre de commandes selon la stratégie de test choisie.

## 13. Fiche de révision et validation

- Une commande répond à une demande ; un événement signale une action.
- ctx fournit le contexte d'une commande préfixée.
- await attend une opération asynchrone.
- Les paramètres typés peuvent être convertis par discord.py.
- on_message doit préserver le traitement des commandes si nécessaire.
- Les commandes slash utilisent app_commands et une interaction.
- Les contrôles de permission doivent être précis.
- Le cooldown limite la fréquence.
- Les erreurs doivent être compréhensibles et les journaux privés.
- Le token reste dans une variable d'environnement ou un gestionnaire de secrets.
- Administrateur n'est pas une permission par défaut.

Avant la leçon 05, tu dois pouvoir créer une commande paramétrée, expliquer un événement, protéger une commande et diagnostiquer une erreur simple.

**©pythonschool — Discord, leçon 04.**
