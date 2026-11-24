# Discord — Leçon 05 : Rôles, permissions et contrôles d'accès

**Parcours :** Discord  
**Numéro :** 05  
**Niveau :** Débutant avec notions intermédiaires  
**Durée indicative :** 80 à 110 minutes  
**Environnement :** Pydroid 3 ou ordinateur, Python, discord.py et serveur de test.  
**Prérequis :** Leçons 01 à 04 : applications, bots, intents, commandes, événements et gestion des erreurs.

## Objectifs et prérequis

Un bot ne doit pas pouvoir faire tout ce que son créateur imagine. Il doit recevoir uniquement les permissions nécessaires à ses fonctions. Cette leçon explique comment vérifier les droits d'un membre, les droits du bot et les restrictions propres à un salon.

À la fin, tu sauras distinguer rôles, permissions, intents et scopes, protéger une commande avec discord.py, comprendre la hiérarchie des rôles et tester les accès sans donner Administrateur.

Utilise un serveur privé de test où tu as l'autorisation de configurer le bot. Les exemples ne contiennent aucun vrai token.

## Sommaire

1. Comprendre rôles et permissions
2. Distinguer permissions, intents et scopes
3. Appliquer le moindre privilège
4. Lire la hiérarchie des rôles
5. Vérifier les permissions d'un membre
6. Vérifier les permissions du bot
7. Comprendre les restrictions de salon
8. Créer des contrôles réutilisables
9. Gérer les refus et les erreurs
10. Mini-projet : panneau d'aide protégé
11. Exercices et corrigés
12. Plan de tests et révision

## 1. Comprendre rôles et permissions

Un rôle regroupe des permissions et peut être attribué à plusieurs membres. Un membre peut posséder plusieurs rôles. Discord combine les permissions de ces rôles selon les règles du serveur et les éventuelles restrictions du salon.

Exemple : un rôle Membre peut lire et écrire dans les salons ordinaires. Un rôle Modérateur peut disposer de fonctions de modération supplémentaires. Le bot reçoit uniquement les permissions dont ses commandes ont besoin.

Un rôle n'est pas une preuve automatique qu'une action est autorisée. Le code doit vérifier le droit adapté. Un nom de rôle peut changer ; pour une configuration stable, un identifiant de rôle est souvent préférable.

La hiérarchie des rôles compte aussi. Un bot ne peut pas gérer librement tous les rôles : son rôle doit être suffisamment haut dans la hiérarchie pour certaines opérations. N'essaie pas de contourner cette protection.

## 2. Distinguer permissions, intents et scopes

Ces notions sont différentes.

- Permission : autorise une action dans un serveur ou un salon, par exemple envoyer un message.
- Intent : indique les catégories d'événements ou de données auxquelles le bot demande accès via l'API.
- Scope OAuth2 : définit les capacités accordées pendant l'installation de l'application, par exemple ajouter un bot à un serveur.

Activer un intent ne donne pas automatiquement le droit de supprimer un message. Ajouter une permission au bot ne remplace pas les intents nécessaires à la réception de certains événements.

Dans le portail développeur, active uniquement les intents nécessaires. Dans le lien d'installation, choisis les scopes et permissions utiles. Vérifie la documentation officielle de Discord et de discord.py, car les interfaces et règles peuvent évoluer.

## 3. Appliquer le moindre privilège

Le moindre privilège consiste à donner le minimum de droits nécessaire, pendant la durée nécessaire.

Un bot qui répond à !ping a généralement besoin de voir le salon et d'y envoyer un message. Il n'a pas besoin de gérer les rôles, bannir des membres ou posséder Administrateur.

Avant d'ajouter une permission, réponds à trois questions :
1. Quelle fonction précise en a besoin ?
2. Existe-t-il une permission plus limitée ?
3. Comment vérifier que cette permission fonctionne sans ouvrir d'autres accès ?

Évite de cocher toutes les permissions pour résoudre une erreur. Lis le message d'échec, identifie l'action refusée et ajoute seulement le droit manquant si cette action est réellement nécessaire.

Un compte de test avec des droits limités aide à vérifier que les commandes refusent correctement les accès non autorisés.

## 4. Lire la hiérarchie des rôles

Dans Discord, l'ordre des rôles détermine certaines actions de gestion. Le bot ne peut pas modifier un rôle situé au-dessus de son rôle le plus élevé. Certaines actions sont aussi limitées par les droits du membre qui les demande.

Un contrôle de permission dans le code ne suffit donc pas toujours. Il faut aussi vérifier la hiérarchie, les droits du bot et les restrictions du salon.

Pour une commande qui ne fait qu'afficher une information, ne demande pas Manage Roles. Pour une commande qui modifie des rôles, documente précisément son effet, teste la hiérarchie et prévois une réponse claire si l'action est impossible.

La hiérarchie est une protection, pas un obstacle à supprimer. Ne déplace pas le rôle du bot au sommet sans raison.

## 5. Vérifier les permissions d'un membre

discord.py fournit des décorateurs pour vérifier les droits d'un membre dans un serveur.

~~~python
from discord.ext import commands

@bot.command()
@commands.guild_only()
@commands.has_guild_permissions(manage_guild=True)
async def configuration(ctx):
    await ctx.send("Tu peux consulter la configuration du serveur.")
~~~

guild_only() empêche l'utilisation dans les messages privés. has_guild_permissions vérifie les permissions du membre dans le serveur.

Tu peux vérifier plusieurs droits :

~~~python
@bot.command()
@commands.guild_only()
@commands.has_guild_permissions(manage_guild=True, view_audit_log=True)
async def rapport(ctx):
    await ctx.send("Accès au rapport autorisé.")
~~~

N'ajoute pas des permissions par habitude. Si la commande ne consulte pas les journaux d'audit, elle ne doit pas demander view_audit_log.

Pour un rôle précis, tu peux utiliser has_role avec son identifiant. Les identifiants doivent être configurés correctement et ne doivent pas être confondus avec un nom affiché.

## 6. Vérifier les permissions du bot

Une commande peut être autorisée pour le membre mais impossible pour le bot. Le bot doit lui aussi disposer des droits nécessaires dans le serveur et le salon.

~~~python
@bot.command()
@commands.guild_only()
@commands.has_guild_permissions(manage_guild=True)
@commands.bot_has_permissions(send_messages=True, embed_links=True)
async def panneau(ctx):
    await ctx.send("Panneau réservé aux responsables.")
~~~

has_guild_permissions vérifie le membre. bot_has_permissions vérifie le bot dans le contexte de la commande.

Une permission peut être accordée au serveur puis retirée dans un salon avec une restriction locale. Il faut donc tester la commande dans le salon où elle sera utilisée.

Ne traite pas toutes les erreurs comme un succès. Si le bot ne peut pas envoyer le message, explique que l'accès au salon ou la permission d'envoi doit être vérifié.

## 7. Comprendre les restrictions de salon

Les permissions de salon peuvent autoriser, refuser ou laisser hériter certaines capacités selon les rôles et les membres. Un membre peut donc avoir une permission au niveau du serveur et être bloqué dans un salon particulier.

Exemple : le rôle Membre peut envoyer des messages dans les salons généraux, mais le salon annonces peut être en lecture seule.

Pour diagnostiquer un problème :
1. vérifie que le bot voit le salon ;
2. vérifie qu'il peut lire l'historique si la commande en a besoin ;
3. vérifie Send Messages ;
4. vérifie Embed Links seulement si tu envoies un embed ;
5. examine les restrictions de salon et les éventuels refus explicites.

Une commande qui envoie un message texte n'a pas besoin d'Embed Links. Une commande qui ne lit pas l'historique ne doit pas demander Read Message History sans raison.

## 8. Créer des contrôles réutilisables

Si plusieurs commandes partagent une règle, tu peux créer un contrôle personnalisé. Il faut toutefois rester simple : un contrôle commun doit être documenté et testé.

~~~python
import os
from discord.ext import commands

MOD_ROLE_ID = int(os.getenv("MOD_ROLE_ID", "0"))

def est_moderateur():
    async def verifier(ctx):
        if MOD_ROLE_ID == 0:
            return False
        roles = getattr(ctx.author, "roles", [])
        return any(role.id == MOD_ROLE_ID for role in roles)
    return commands.check(verifier)

@bot.command()
@commands.guild_only()
@est_moderateur()
async def outils_mod(ctx):
    await ctx.send("Accès modérateur confirmé.")
~~~

La variable MOD_ROLE_ID contient l'identifiant du rôle de test. Si elle est absente, le contrôle refuse l'accès. Cette règle échoue de manière fermée : une configuration manquante n'accorde pas les droits.

Ne mets pas un identifiant de serveur ou un secret sensible dans le code si tu peux le configurer dans l'environnement. Un identifiant Discord n'est pas un token secret, mais il peut quand même être traité comme une configuration.

## 9. Gérer les refus et les erreurs

Un refus de permission doit être compréhensible. Il ne faut pas afficher une trace technique complète dans un salon public.

~~~python
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("Tu n'as pas la permission nécessaire.")
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("Le bot n'a pas les droits nécessaires dans ce salon.")
    elif isinstance(error, commands.NoPrivateMessage):
        await ctx.send("Cette commande doit être utilisée sur un serveur.")
    elif isinstance(error, commands.CommandNotFound):
        return
    else:
        print(type(error).__name__)
        await ctx.send("Une erreur est survenue. Réessaie plus tard.")
~~~

Le journal technique doit rester privé et ne jamais afficher le token. Pour une application plus grande, tu peux utiliser le module logging de Python et enregistrer le nom de l'erreur, la commande et un identifiant de suivi sans stocker de données inutiles.

Une erreur inattendue doit être examinée pendant le développement. Ne la masque pas silencieusement et ne renvoie pas un message qui prétend que l'action a réussi.

## 10. Mini-projet : panneau d'aide protégé

Ce mini-projet crée une commande !panneau réservée aux membres ayant Manage Server. Le bot doit seulement pouvoir envoyer un message.

~~~python
import os
import discord
from discord.ext import commands

TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise RuntimeError("Configure DISCORD_TOKEN dans l'environnement.")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print("Bot prêt.")

@bot.command()
async def ping(ctx):
    await ctx.send("Pong !")

@bot.command()
@commands.guild_only()
@commands.has_guild_permissions(manage_guild=True)
@commands.bot_has_permissions(send_messages=True)
async def panneau(ctx):
    await ctx.send(
        "Panneau de test : consulte les règles et les annonces du serveur."
    )

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("Cette commande est réservée aux responsables.")
    elif isinstance(error, commands.BotMissingPermissions):
        print("Permission d'envoi manquante.")
    elif isinstance(error, commands.NoPrivateMessage):
        await ctx.send("Utilise cette commande dans un serveur.")
    elif isinstance(error, commands.CommandNotFound):
        return
    else:
        print(type(error).__name__)
        await ctx.send("Erreur pendant le traitement.")

bot.run(TOKEN)
~~~

Le code ne contient pas de token réel. Configure DISCORD_TOKEN dans l'environnement avant le lancement. Dans le portail développeur, active seulement l'intent requis par les commandes préfixées et vérifie les permissions d'installation.

Teste avec un membre autorisé, un membre non autorisé et un salon où le bot ne peut pas envoyer de message. La commande doit refuser proprement les deux derniers cas.

## 11. Exercices et corrigés

1. Explique la différence entre rôle et permission.
2. Pourquoi un bot qui répond uniquement à !ping n'a-t-il pas besoin d'Administrateur ?
3. Ajoute une commande !infos réservée aux membres ayant Manage Server.
4. Ajoute bot_has_permissions(send_messages=True) à cette commande.
5. Explique pourquoi une commande peut fonctionner dans un salon et échouer dans un autre.
6. Défi : crée un contrôle de rôle basé sur un identifiant configuré par variable d'environnement. Si la configuration est absente, l'accès doit être refusé.

**Corrigé 1 :** le rôle regroupe des permissions et peut être attribué à des membres ; une permission autorise une action précise.

**Corrigé 2 :** répondre demande généralement de voir le salon et d'envoyer un message. Les droits de gestion ne sont pas nécessaires.

**Corrigé 3 :** utilise guild_only() et has_guild_permissions(manage_guild=True).

**Corrigé 4 :** le décorateur vérifie que le bot peut envoyer le message dans le contexte de la commande.

**Corrigé 5 :** les restrictions locales du salon peuvent modifier les droits effectifs.

**Corrigé 6 :** lis MOD_ROLE_ID depuis l'environnement, refuse si la valeur vaut zéro ou est absente, puis compare les identifiants des rôles du membre.

## 12. Plan de tests et fiche de révision

| Test | Résultat attendu |
|---|---|
| Membre autorisé, salon accessible | Commande exécutée |
| Membre sans permission | Refus compréhensible |
| Bot sans Send Messages | Échec traité sans fausse confirmation |
| Commande en message privé | Refus si guild_only |
| Variable de rôle absente | Accès refusé |
| Token absent | Démarrage interrompu avec message clair |

À retenir :
- Les rôles regroupent des permissions.
- Les permissions du membre et du bot sont deux vérifications distinctes.
- Les intents contrôlent les événements et données accessibles.
- Les scopes OAuth2 concernent l'installation et les capacités demandées.
- Les restrictions de salon peuvent modifier les droits effectifs.
- La hiérarchie des rôles protège certaines actions.
- Le moindre privilège évite les accès inutiles.
- Un token reste dans une variable d'environnement ou un gestionnaire de secrets.
- Administrateur ne doit jamais être le choix par défaut.

Avant la leçon 06, tu dois pouvoir protéger une commande, expliquer pourquoi le bot a besoin d'un droit précis et tester les refus d'accès.

**©pythonschool — Discord, leçon 05.**