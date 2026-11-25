# Discord — Leçon 08 : Automatiser des tâches planifiées avec discord.py

**Parcours :** Discord  
**Numéro :** 08  
**Niveau :** Débutant à intermédiaire  
**Durée :** 110 à 130 minutes  
**Environnement :** Python 3 et discord.py sur un environnement où le bot peut rester connecté.  
**Prérequis :** Bot fonctionnel, commandes, événements, permissions, gestion des erreurs et notions de SQLite.

## Objectifs et prérequis
Un bot peut devoir envoyer un rappel à une heure précise, actualiser une information ou effectuer une vérification périodique. Une tâche planifiée automatise ces actions sans attendre une commande humaine. Cette leçon présente les boucles asynchrones, les tâches de discord.py, les horaires, les limites de l'API et les méthodes pour éviter les doublons.

À la fin, tu sauras créer une tâche périodique, attendre que le bot soit prêt, gérer les erreurs, arrêter proprement une tâche et tester la logique sans envoyer de messages à un vrai serveur. Le token reste dans une variable d'environnement et le bot reçoit uniquement les permissions nécessaires.

## Sommaire
1. Pourquoi planifier une tâche ?
2. Comprendre asynchrone et boucle d'événements
3. Différencier commande et tâche de fond
4. Installer et importer tasks
5. Créer une boucle périodique
6. Attendre que le bot soit prêt
7. Planifier une heure précise
8. Gérer les erreurs et les limites
9. Éviter les doublons et les effets répétés
10. Arrêter et redémarrer les tâches
11. Sécurité et permissions minimales
12. Mini-projet : rappel quotidien
13. Tester et déboguer
14. Exercices progressifs
15. Corrigés expliqués
16. Fiche de révision

## 1. Pourquoi planifier une tâche ?
Une commande répond à une action : un membre écrit une commande, le bot effectue le travail. Une tâche planifiée fonctionne selon un calendrier : toutes les heures, chaque jour ou à un moment défini.

Exemples : rappeler une règle, publier un résumé, vérifier un état ou nettoyer des données temporaires. Une tâche automatique doit avoir un objectif clair et ne pas gêner les membres.

Une tâche qui tourne toutes les secondes peut envoyer trop de messages ou dépasser les limites de l'API. Commence avec une fréquence faible, mesure le comportement et prévois un moyen d'arrêter le processus.

## 2. Comprendre asynchrone et boucle d'événements
discord.py utilise asyncio. La boucle d'événements coordonne les opérations asynchrones : réception d'événements, commandes et appels réseau.

Une fonction définie avec `async def` peut contenir `await`. Lorsqu'elle attend une opération réseau, elle rend la main à la boucle au lieu de bloquer tout le bot.

~~~python
import asyncio

async def exemple():
    print("Début")
    await asyncio.sleep(2)
    print("Après deux secondes")
~~~

`asyncio.sleep` est asynchrone. À l'inverse, `time.sleep(2)` bloque le thread et peut empêcher le bot de traiter d'autres événements. N'utilise pas de longue attente bloquante dans une commande ou une tâche.

## 3. Différencier commande et tâche de fond
Une commande est déclenchée par un utilisateur. Une tâche de fond est déclenchée par le programme selon un intervalle ou une heure.

| Élément | Déclencheur | Exemple |
|---|---|---|
| Commande | Message ou interaction | `!ping` |
| Événement | Événement Discord | `on_member_join` |
| Tâche planifiée | Temps ou calendrier | Rappel quotidien |

Les trois mécanismes peuvent appeler une fonction commune. Sépare la logique métier de l'envoi Discord : une fonction qui prépare un message peut être testée sans connexion.

Ne transforme pas chaque action en tâche de fond. Si une action doit répondre immédiatement à un membre, une commande ou un événement est plus adapté.

## 4. Installer et importer tasks
Le module `discord.ext.tasks` fournit un décorateur `@tasks.loop`. Il simplifie la création et le contrôle d'une boucle de fond.

~~~python
from discord.ext import commands, tasks
~~~

Vérifie que tu importes `tasks` depuis `discord.ext`. La bibliothèque doit être installée dans le même environnement Python que celui qui exécute le bot.

Pour afficher les versions :

~~~python
import discord
print(discord.__version__)
~~~

Ne copie pas des exemples d'une version très ancienne sans vérifier leur compatibilité. Consulte la documentation correspondant à la version installée.

## 5. Créer une boucle périodique
Voici une tâche simple qui s'exécute toutes les heures :

~~~python
from discord.ext import commands, tasks

class MonBot(commands.Bot):
    async def setup_hook(self):
        self.verifier_etat.start()

    @tasks.loop(hours=1)
    async def verifier_etat(self):
        print("Vérification périodique.")

    @verifier_etat.before_loop
    async def attendre_demarrage(self):
        await self.wait_until_ready()
~~~

`@tasks.loop(hours=1)` définit l'intervalle. `start()` démarre la boucle. `before_loop` permet d'attendre une condition avant le premier passage.

Dans une application réelle, remplace le `print` par une opération utile et limitée. N'envoie pas de message Discord à chaque passage sans vérifier si un changement doit réellement être annoncé.

## 6. Attendre que le bot soit prêt
Le bot peut être connecté avant que tous les caches et objets nécessaires soient disponibles. Une tâche qui cherche un salon trop tôt peut ne rien trouver.

`await self.wait_until_ready()` attend que le bot ait terminé sa préparation. Le décorateur `before_loop` est un endroit adapté pour cette attente.

Évite de démarrer la même boucle dans chaque événement `on_ready` sans vérifier son état. Cet événement peut être appelé à nouveau après une reconnexion. Une tâche lancée deux fois risque de produire des actions répétées.

Le démarrage centralisé dans `setup_hook` est une méthode claire pour une boucle qui doit être initialisée une seule fois.

## 7. Planifier une heure précise
Pour une heure quotidienne, `tasks.loop` accepte un paramètre `time` avec un objet `datetime.time`.

~~~python
import datetime
from discord.ext import tasks

HEURE_UTC = datetime.time(
    hour=9,
    minute=0,
    tzinfo=datetime.timezone.utc
)

@tasks.loop(time=HEURE_UTC)
async def rappel_quotidien():
    print("Il est l'heure du rappel.")
~~~

Précise le fuseau horaire. Une heure sans fuseau peut être ambiguë, notamment lors des changements d'heure dans certains pays. UTC est un choix stable pour les tâches serveur.

Si tu dois utiliser une heure locale, étudie le module standard `zoneinfo` et vérifie la disponibilité des données de fuseau dans ton environnement. Ne suppose pas que tous les hébergeurs utilisent le même fuseau.

## 8. Gérer les erreurs et les limites
Une tâche qui rencontre une erreur non traitée peut s'arrêter. Utilise une gestion ciblée et des journaux.

~~~python
import logging
import discord
from discord.ext import tasks

logger = logging.getLogger("bot.taches")

@tasks.loop(minutes=30)
async def verifier_salon(bot, channel_id):
    try:
        salon = bot.get_channel(channel_id)
        if salon is None:
            salon = await bot.fetch_channel(channel_id)
        print("Salon disponible :", salon.id)
    except discord.Forbidden:
        logger.warning("Accès au salon refusé.")
    except discord.NotFound:
        logger.warning("Salon introuvable.")
    except discord.HTTPException:
        logger.exception("Erreur HTTP pendant la vérification.")
~~~

Les erreurs doivent être traitées selon leur sens. Un accès interdit ne se corrige pas en répétant la requête en boucle. Vérifie les permissions du bot et l'identifiant du salon.

Discord applique des limites de débit. Ne contourne jamais ces limites en multipliant les requêtes. Utilise les méthodes de la bibliothèque, respecte les réponses de l'API et espace les actions.

## 9. Éviter les doublons et les effets répétés
Une tâche peut être exécutée plusieurs fois à cause d'une reconnexion, d'un redémarrage ou d'une logique mal conçue. Avant d'envoyer une annonce, vérifie si elle a déjà été envoyée pour la période concernée.

Pour un bot simple, tu peux conserver la date du dernier envoi dans SQLite. La clé peut associer l'identifiant du serveur, celui du salon et la date. Une opération d'enregistrement doit être atomique pour éviter deux envois simultanés.

Ce principe s'appelle l'idempotence : répéter une opération ne doit pas créer un effet supplémentaire inattendu. Il est particulièrement important pour les paiements, notifications et modifications de données.

## 10. Arrêter et redémarrer les tâches
Une boucle créée avec `tasks.loop` fournit des méthodes comme `start()`, `stop()`, `cancel()` et `is_running()`.

~~~python
if not bot.verifier_etat.is_running():
    bot.verifier_etat.start()

# Pour demander un arrêt propre :
bot.verifier_etat.stop()
~~~

Ne démarre pas une boucle déjà active. Vérifie son état avant de l'initialiser. Si une tâche doit être interrompue immédiatement, `cancel()` peut être utilisé, mais prévois la gestion de l'annulation.

Au redémarrage du bot, la tâche repart depuis sa configuration. Si l'heure ou l'état du dernier envoi doit survivre au redémarrage, stocke les informations nécessaires dans une base de données.

## 11. Sécurité et permissions minimales
Une tâche planifiée ne doit pas disposer de plus de permissions qu'une commande normale. Pour envoyer un message, le bot a généralement besoin de voir le salon et d'y envoyer des messages. Il n'a pas besoin de la permission Administrateur.

Le token doit rester hors du code :

~~~python
import os

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")
~~~

Ne publie jamais le token dans un dépôt, une capture d'écran ou un journal. Si le secret est exposé, révoque-le immédiatement depuis le portail développeur Discord.

Valide les identifiants de salons, limite les messages automatiques et prévois une commande de désactivation réservée à une personne autorisée. Ne collecte pas de données personnelles sans nécessité.

## 12. Mini-projet : rappel quotidien
Le projet suivant montre une structure complète. Il utilise une variable d'environnement pour le token et l'identifiant du salon. Le message est un exemple neutre. Il ne faut pas publier ce bot dans un serveur sans avoir vérifié les permissions et l'accord des responsables.

~~~python
import os
import logging
import datetime
import discord
from discord.ext import commands, tasks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rappel")

TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID_TEXT = os.getenv("DISCORD_CHANNEL_ID")

if not TOKEN or not CHANNEL_ID_TEXT:
    raise RuntimeError("Configure DISCORD_TOKEN et DISCORD_CHANNEL_ID.")

CHANNEL_ID = int(CHANNEL_ID_TEXT)

HEURE = datetime.time(
    hour=9,
    minute=0,
    tzinfo=datetime.timezone.utc
)

intents = discord.Intents.default()

class RappelBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        self.rappel.start()

    @tasks.loop(time=HEURE)
    async def rappel(self):
        try:
            salon = self.get_channel(CHANNEL_ID)
            if salon is None:
                salon = await self.fetch_channel(CHANNEL_ID)
            await salon.send("Rappel : consulte les informations du serveur.")
            logger.info("Rappel envoyé.")
        except discord.Forbidden:
            logger.warning("Le bot ne peut pas écrire dans ce salon.")
        except discord.NotFound:
            logger.warning("Le salon configuré n'existe plus.")
        except discord.HTTPException:
            logger.exception("Échec de l'envoi du rappel.")

    @rappel.before_loop
    async def attendre(self):
        await self.wait_until_ready()

bot = RappelBot()
bot.run(TOKEN)
~~~

Ce prototype envoie un message à 09:00 UTC chaque jour. Pour un usage réel, ajoute un réglage par serveur, une date de dernier envoi en base et une méthode pour désactiver le rappel. N'envoie pas le même rappel dans plusieurs salons sans configuration explicite.

## 13. Tester et déboguer
Avant de connecter le bot, teste la logique indépendante : calcul de la prochaine heure, validation de l'identifiant, création du message et lecture de la configuration.

Erreurs fréquentes :
- **Loop already running :** la tâche a été démarrée plusieurs fois ;
- **Salon introuvable :** mauvais identifiant ou cache non prêt ;
- **Forbidden :** permission manquante ;
- **Tâche arrêtée :** exception non gérée ;
- **Deux rappels :** plusieurs instances ou absence de contrôle du dernier envoi ;
- **Heure incorrecte :** fuseau oublié ou confondu ;
- **Bot bloqué :** appel synchrone long dans la boucle d'événements.

Affiche les journaux utiles, mais masque les tokens et les informations privées. Commence avec un intervalle de test court dans un serveur privé, puis reviens à la fréquence prévue.

## 14. Exercices progressifs
1. Écris une boucle qui affiche un message toutes les dix minutes, sans Discord.
2. Explique pourquoi `asyncio.sleep` est préférable à `time.sleep` dans une fonction asynchrone.
3. Modifie l'exemple pour attendre le démarrage du bot avant de chercher le salon.
4. Ajoute un journal pour les erreurs Forbidden et NotFound.
5. Propose une clé SQLite qui empêche l'envoi de deux rappels identiques le même jour et sur le même serveur.

## 15. Corrigés expliqués

### Exercice 1
~~~python
import asyncio

async def verifier():
    while True:
        print("Vérification")
        await asyncio.sleep(600)

asyncio.run(verifier())
~~~

La boucle attend 600 secondes sans bloquer le thread comme le ferait `time.sleep`. Pour arrêter le test, interrompt le programme.

### Exercice 2
`asyncio.sleep` suspend la coroutine et permet à la boucle d'événements d'exécuter d'autres tâches. `time.sleep` bloque le thread courant et retarde les commandes et événements.

### Exercice 3
~~~python
@rappel.before_loop
async def attendre(self):
    await self.wait_until_ready()
~~~

Cette étape évite d'utiliser le cache avant que le bot soit prêt.

### Exercice 4
~~~python
try:
    await salon.send("Rappel de test.")
except discord.Forbidden:
    logger.warning("Permission d'envoi manquante.")
except discord.NotFound:
    logger.warning("Salon supprimé ou identifiant incorrect.")
~~~

Les erreurs sont distinguées afin de savoir quelle correction appliquer.

### Exercice 5
Une clé primaire composée de `guild_id`, `channel_id` et `date` empêche d'enregistrer deux fois le même rappel pour le même salon et la même journée. L'enregistrement doit être effectué avant ou avec un mécanisme qui évite les doubles envois concurrents.

## 16. Fiche de révision et validation
| Notion | Rôle |
|---|---|
| asyncio | Exécuter des opérations asynchrones |
| await | Attendre sans bloquer la boucle |
| tasks.loop | Définir une tâche répétée |
| before_loop | Préparer la tâche avant le premier passage |
| wait_until_ready | Attendre que le bot soit prêt |
| start / stop | Démarrer ou arrêter une boucle |
| UTC | Référence horaire stable |
| Idempotence | Éviter les effets répétés |
| Forbidden | Permission insuffisante |
| Token | Secret à protéger |

Avant la leçon 09, vérifie que tu peux créer une tâche planifiée, expliquer le rôle de `await`, attendre le démarrage, gérer les erreurs et empêcher les doublons.

**À retenir :** une tâche de fond doit être utile, limitée, observable et contrôlable. Le moindre privilège, la gestion des erreurs et l'idempotence sont indispensables.

---

*©pythonschool — Discord, Leçon 08.*