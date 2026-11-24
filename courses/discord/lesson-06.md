# Discord — Leçon 06 : Fiabiliser un bot avec les erreurs, les journaux et les tests

**Parcours :** Discord  
**Numéro :** 06  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 100 à 130 minutes  
**Environnement :** Python 3, discord.py et un serveur de test privé.  
**Prérequis :** Application Discord, token protégé, bot fonctionnel, commandes, événements et permissions minimales.

## Objectifs et prérequis

Un bot peut fonctionner correctement pendant un test puis rencontrer une erreur lorsqu'un membre oublie un argument, lorsqu'un salon interdit l'envoi de messages ou lorsque le réseau se coupe. Un bot fiable doit prévoir ces situations.

Cette leçon apprend à reconnaître les erreurs courantes, répondre sans révéler d'informations internes, conserver des journaux utiles, limiter les commandes répétitives et tester la logique sans devoir connecter Discord à chaque essai.

À la fin, tu sauras :
- distinguer une erreur de saisie, de permission, de réseau et de programmation ;
- gérer les erreurs de commandes avec discord.py ;
- utiliser un cooldown pour limiter les répétitions ;
- écrire des journaux sans exposer de token ;
- tester une fonction Python avec unittest ;
- préparer un bot à un redémarrage ou à un hébergement contrôlé.

Le token doit rester dans une variable d'environnement ou un gestionnaire de secrets. Ne le copie jamais dans un fichier Python, un message, une capture ou un dépôt Git.

## Sommaire

1. Pourquoi fiabiliser un bot ?
2. Identifier les familles d'erreurs
3. Utiliser try et except avec précision
4. Gérer les erreurs des commandes
5. Limiter les répétitions avec un cooldown
6. Enregistrer des journaux utiles
7. Séparer la logique Discord du calcul
8. Tester une fonction avec unittest
9. Tester le bot dans un serveur privé
10. Préparer le démarrage et l'arrêt
11. Héberger sans exposer les secrets
12. Mini-projet : bot avec commande d'état
13. Exercices et corrigés
14. Fiche de révision

## 1. Pourquoi fiabiliser un bot ?

Un bot fiable ne signifie pas qu'il ne rencontre jamais de problème. Cela signifie qu'il détecte les problèmes, les traite de manière prévisible et donne un message compréhensible aux utilisateurs.

Imagine un guichet : si un formulaire est incomplet, l'agent explique ce qui manque au lieu de fermer tout le bâtiment. Un bot doit adopter le même principe. Une commande incorrecte ne devrait pas arrêter toutes les autres commandes.

La fiabilité repose sur plusieurs éléments :
- validation des paramètres ;
- vérification des permissions du membre et du bot ;
- gestion des erreurs attendues ;
- journaux techniques réservés au propriétaire du projet ;
- tests avant publication ;
- procédure de redémarrage ;
- protection des secrets.

Ne confonds pas un message d'erreur utilisateur avec un journal technique. Le membre a besoin de savoir comment corriger sa commande. Le développeur a besoin du contexte technique, sans divulguer de données privées.

## 2. Identifier les familles d'erreurs

Une erreur de saisie apparaît lorsqu'une commande reçoit une valeur absente ou incorrecte. Exemple : une commande attend un nombre mais reçoit un mot.

Une erreur de permission apparaît lorsqu'un membre ou le bot ne possède pas l'autorisation nécessaire. Les permissions du membre et celles du bot doivent être vérifiées séparément.

Une erreur de réseau peut apparaître lorsque Discord ou la connexion ne répond pas temporairement. Il faut éviter de relancer une action sans réfléchir, car cela peut créer des doublons.

Une erreur de programmation vient du code : variable inexistante, type inattendu ou fonction appelée de manière incorrecte.

Enfin, une erreur de configuration apparaît lorsqu'une variable d'environnement, un intent ou un identifiant nécessaire manque.

Avant de corriger, identifie la catégorie. Le message de la dernière ligne du traceback aide à comprendre le type d'erreur. Ne publie pas un traceback complet dans un salon public : il peut contenir des chemins ou des informations internes.

## 3. Utiliser try et except avec précision

try exécute un bloc qui peut échouer. except intercepte une exception précise. Il ne faut pas masquer toutes les erreurs sans savoir ce qui s'est passé.

~~~python
texte = input("Entre un nombre entier : ")

try:
    nombre = int(texte)
except ValueError:
    print("La saisie doit contenir un entier.")
else:
    print("Le double vaut :", nombre * 2)
~~~

ValueError correspond ici à une conversion impossible. else s'exécute seulement si le bloc try n'a pas déclenché l'exception. finally peut servir à libérer une ressource, qu'une erreur soit apparue ou non.

Évite un except Exception qui se contente de faire pass. Cela cache les défauts et donne l'impression que le programme fonctionne alors qu'il a peut-être échoué.

Pour une fonction simple, préfère vérifier les valeurs avant de calculer :

~~~python
def diviser(a, b):
    if b == 0:
        return None
    return a / b
~~~

La fonction indique clairement qu'elle ne peut pas produire un résultat lorsque le diviseur vaut zéro. Le programme appelant décide ensuite du message à afficher.

## 4. Gérer les erreurs des commandes

discord.py possède des exceptions pour les commandes. Un gestionnaire central évite de répéter le même traitement dans chaque fonction.

~~~python
import logging
from discord.ext import commands

logger = logging.getLogger("bot")

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        return

    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.reply("Il manque un argument. Consulte !aide.")
        return

    if isinstance(error, commands.MissingPermissions):
        await ctx.reply("Tu n'as pas la permission nécessaire.")
        return

    if isinstance(error, commands.BotMissingPermissions):
        await ctx.reply("Le bot n'a pas la permission nécessaire ici.")
        return

    if isinstance(error, commands.CommandOnCooldown):
        attente = round(error.retry_after, 1)
        await ctx.reply(f"Réessaie dans {attente} seconde(s).")
        return

    logger.error(
        "Erreur de commande %s",
        ctx.command.qualified_name if ctx.command else "inconnue",
        exc_info=(type(error), error, error.__traceback__)
    )
    await ctx.reply("Une erreur interne est survenue. Le responsable a été informé.")
~~~

Ce gestionnaire traite plusieurs erreurs prévisibles. Pour une erreur inattendue, il conserve les détails dans les journaux et envoie un message neutre.

Ne renvoie pas le traceback aux membres. Ne place pas non plus le token ou les variables d'environnement dans les journaux.

Selon la structure de ton bot, certaines erreurs peuvent être enveloppées dans une autre exception. Lis la documentation de la version de discord.py utilisée et teste chaque cas dans un serveur privé.

## 5. Limiter les répétitions avec un cooldown

Une commande appelée trop souvent peut produire du bruit, consommer des ressources ou déclencher des limites de débit. Un cooldown impose un délai entre les utilisations.

~~~python
from discord.ext import commands

@bot.command()
@commands.cooldown(1, 5, commands.BucketType.user)
async def ping(ctx):
    await ctx.reply("Pong !")
~~~

Ici, chaque membre peut utiliser la commande une fois pendant une période de cinq secondes. Le cooldown est géré par discord.py.

BucketType.user applique la limite par utilisateur. D'autres catégories peuvent appliquer une limite par serveur ou par canal. Choisis la portée qui correspond au besoin.

Un cooldown ne remplace pas les limites de débit de Discord. Il ne garantit pas non plus la sécurité d'une commande. Il faut toujours vérifier les permissions, la validité des paramètres et les effets de l'action.

Ne crée pas de système qui spamme un membre pour le punir. Le but est de protéger le bot et de garder les interactions lisibles.

## 6. Enregistrer des journaux utiles

Un journal, ou log, garde une trace des événements techniques. Le module logging de Python permet d'enregistrer des messages avec différents niveaux.

~~~python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

logger = logging.getLogger("academique-bot")

logger.info("Le bot démarre.")
logger.warning("Une configuration facultative est absente.")
logger.error("Une opération n'a pas pu être terminée.")
~~~

Les niveaux courants sont DEBUG, INFO, WARNING, ERROR et CRITICAL. En production, INFO ou WARNING peuvent être un bon point de départ. DEBUG est utile pendant un test, mais peut produire beaucoup de données.

Un bon journal indique ce qui s'est passé, à quel moment et dans quelle partie du programme. Évite d'enregistrer :
- le token du bot ;
- les mots de passe ;
- les contenus privés sans nécessité ;
- les données personnelles qui ne servent pas au diagnostic.

Ne transforme pas les journaux en surveillance générale des membres. Collecte le minimum nécessaire, limite l'accès et définis une durée de conservation adaptée.

## 7. Séparer la logique Discord du calcul

Une fonction qui calcule un résultat ne devrait pas dépendre de Discord si ce n'est pas nécessaire. Cette séparation permet de tester le calcul sans ouvrir de connexion.

~~~python
def calculer_total(prix, quantite):
    if prix < 0 or quantite < 0:
        raise ValueError("Les valeurs doivent etre positives.")
    return prix * quantite

def formater_total(total):
    return f"Total : {total:.2f} FCFA"
~~~

La fonction calculer_total reçoit des nombres et renvoie un nombre. Elle ne lit pas de message Discord et n'envoie pas de réponse.

Une commande peut ensuite appeler cette fonction :

~~~python
@bot.command()
async def total(ctx, prix: float, quantite: int):
    resultat = calculer_total(prix, quantite)
    await ctx.reply(formater_total(resultat))
~~~

Dans une version plus complète, ajoute une gestion spécifique de ValueError et vérifie les limites de prix et de quantité. Les annotations float et int aident discord.py à convertir les arguments, mais elles ne remplacent pas toutes les validations métier.

## 8. Tester une fonction avec unittest

unittest est inclus dans Python. Il permet de vérifier automatiquement qu'une fonction renvoie le résultat attendu.

~~~python
import unittest

def calculer_total(prix, quantite):
    if prix < 0 or quantite < 0:
        raise ValueError("Valeur negative")
    return prix * quantite

class TestCalculerTotal(unittest.TestCase):
    def test_total_normal(self):
        self.assertEqual(calculer_total(750, 4), 3000)

    def test_quantite_zero(self):
        self.assertEqual(calculer_total(750, 0), 0)

    def test_prix_negatif(self):
        with self.assertRaises(ValueError):
            calculer_total(-5, 2)

if __name__ == "__main__":
    unittest.main()
~~~

Enregistre ce code dans test_calcul.py et lance-le avec Python. Les tests doivent être séparés du fichier qui démarre réellement le bot.

Un test unitaire vérifie une petite partie isolée. Un test d'intégration vérifie plusieurs parties ensemble. Un test réel dans Discord vérifie le comportement avec les permissions, les intents et les salons.

Un test réussi ne prouve pas l'absence de tout défaut. Il prouve seulement que les cas testés se comportent comme prévu.

## 9. Tester le bot dans un serveur privé

Crée un serveur de test ou utilise un environnement où les membres savent qu'un bot est en cours de développement. N'expérimente pas une nouvelle commande de modération sur une communauté réelle.

Prépare une liste de scénarios :
- le bot démarre avec le token présent ;
- le bot refuse de démarrer si le token manque ;
- une commande correcte reçoit une réponse ;
- un argument absent reçoit une explication ;
- un membre sans permission reçoit un refus ;
- le bot sans permission d'écrire ne prétend pas avoir répondu ;
- le cooldown fonctionne ;
- une erreur inattendue est enregistrée sans détail public.

Vérifie les permissions dans le salon où la commande est exécutée. Les droits d'un rôle et les restrictions du salon peuvent produire des résultats différents.

Accorde uniquement les permissions nécessaires. Une commande ping n'a pas besoin de gérer les rôles, supprimer des messages ou administrer le serveur. N'accorde pas Administrateur pour résoudre un problème de configuration.

## 10. Préparer le démarrage et l'arrêt

Un bot doit vérifier sa configuration avant de se connecter. Le token est lu depuis l'environnement.

~~~python
import os
import logging
import discord
from discord.ext import commands

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("academique-bot")

TOKEN = os.getenv("DISCORD_TOKEN")

if not TOKEN:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    logger.info("Bot connecté sous %s", bot.user)

bot.run(TOKEN)
~~~

Pour les commandes préfixées qui lisent le contenu des messages, l'intent message_content doit être activé dans le portail développeur Discord et dans le code. N'active pas d'intents privilégiés qui ne sont pas nécessaires.

Le démarrage peut échouer si le token est incorrect, si la connexion est indisponible ou si la configuration est incomplète. Affiche une erreur claire dans le journal, mais jamais le token.

Sur Android, le système peut suspendre une application en arrière-plan. Un téléphone est adapté aux essais et à l'apprentissage, mais ne garantit pas un bot disponible en permanence. Un hébergement continu demande un service adapté et peut avoir des limites ou des coûts.

### Héberger sans exposer les secrets

Un hébergement exécute le programme sur une machine disponible sur Internet. Le bot doit rester en fonctionnement pour recevoir les événements. Vérifie les conditions du fournisseur : durée d'exécution, veille automatique, stockage, limites et éventuels coûts.

Règles essentielles :
- stocker DISCORD_TOKEN dans les secrets de la plateforme ;
- ne jamais écrire le token dans le dépôt ;
- ne jamais publier un fichier .env réel ;
- ajouter les fichiers de secrets au .gitignore ;
- limiter les permissions du bot ;
- prévoir un redémarrage contrôlé ;
- surveiller les journaux sans enregistrer de données privées inutiles.

GitHub Actions sert à exécuter des tâches automatisées, pas à maintenir un bot connecté en permanence. Ne détourne pas un workflow de construction pour simuler un hébergement continu.

Un service gratuit peut changer ses conditions ou arrêter les processus inactifs. Ne promets jamais une disponibilité 24 h/24 sans avoir vérifié le contrat du service.

## 12. Mini-projet : bot avec commande d'état

La commande !etat indique si le bot répond et affiche une mesure de latence. Elle n'exige pas de permission administrative.

~~~python
import os
import logging
import discord
from discord.ext import commands

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("etat-bot")

TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN est manquant.")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    logger.info("Connexion prête : %s", bot.user)

@bot.command()
@commands.cooldown(1, 5, commands.BucketType.user)
async def etat(ctx):
    latence = round(bot.latency * 1000)
    await ctx.reply(f"Bot actif. Latence approximative : {latence} ms.")

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        return

    if isinstance(error, commands.CommandOnCooldown):
        await ctx.reply("Patiente un peu avant de recommencer.")
        return

    logger.error(
        "Erreur sur %s",
        ctx.command.qualified_name if ctx.command else "commande inconnue",
        exc_info=(type(error), error, error.__traceback__)
    )
    await ctx.reply("La commande n'a pas pu être exécutée.")

bot.run(TOKEN)
~~~

Avant de lancer le projet, installe discord.py dans ton environnement, configure le token dans les variables d'environnement et active message_content si tu utilises les commandes préfixées.

Teste !etat plusieurs fois. La première utilisation doit répondre. Une utilisation trop rapide doit être limitée. Vérifie que le bot possède uniquement les permissions nécessaires pour lire le salon et envoyer une réponse.

## 13. Exercices et corrigés

1. Explique la différence entre une erreur de saisie et une erreur de programmation.
2. Ajoute un except ValueError autour d'une conversion en entier.
3. Ajoute un cooldown de dix secondes à une commande de test.
4. Écris un journal INFO au démarrage et un journal ERROR lors d'un échec.
5. Crée un test unittest qui vérifie qu'une quantité négative est refusée.
6. Explique pourquoi le token ne doit pas apparaître dans les journaux.
7. Défi : ajoute une fonction qui valide un nom de commande sans utiliser Discord, puis teste-la avec unittest.

Correction de validation :

~~~python
def nom_valide(nom):
    nom = nom.strip()

    if not nom:
        return False

    if len(nom) > 30:
        return False

    return True

print(nom_valide("ping"))   # True
print(nom_valide("   "))    # False
~~~

Correction du test :

~~~python
import unittest

class TestNomValide(unittest.TestCase):
    def test_nom_correct(self):
        self.assertTrue(nom_valide("ping"))

    def test_nom_vide(self):
        self.assertFalse(nom_valide(" "))

    def test_nom_trop_long(self):
        self.assertFalse(nom_valide("x" * 31))

if __name__ == "__main__":
    unittest.main()
~~~

Le test vérifie trois cas différents. Une bonne suite de tests couvre le cas normal, les limites et les entrées incorrectes.

## 14. Fiche de révision et validation

- try et except gèrent des exceptions identifiées.
- Les erreurs attendues doivent recevoir une réponse claire.
- Les erreurs inattendues doivent être journalisées sans exposer de détails aux membres.
- Un cooldown limite la fréquence d'une commande.
- logging fournit des niveaux de diagnostic.
- Une fonction indépendante de Discord est plus facile à tester.
- unittest permet d'automatiser des vérifications.
- Les tests unitaires, d'intégration et réels sont complémentaires.
- Le token reste dans une variable d'environnement ou un gestionnaire de secrets.
- Le bot reçoit uniquement les permissions et intents nécessaires.
- Un téléphone peut servir aux essais, mais n'assure pas un hébergement permanent.

Avant la leçon 07, vérifie que tu peux diagnostiquer une erreur, créer un test, configurer un cooldown et expliquer comment protéger le token lors d'un déploiement.

**Prochaine étape :** préparer une stratégie de stockage des données et de configuration pour un bot qui grandit.

---

*Académique — Discord, Leçon 06. Exemples pédagogiques à tester dans un serveur privé.*

©pythonschool
