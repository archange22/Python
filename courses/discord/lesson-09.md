# Discord — Leçon 09 : Créer des interfaces interactives avec boutons, menus et formulaires

**Parcours :** Discord  
**Numéro :** 09  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 110 à 120 minutes  
**Environnement :** Python 3, discord.py 2.x et un serveur de test privé.  
**Prérequis :** Bot fonctionnel, commandes, événements, permissions et gestion des erreurs.

## 1. Fiche de départ : objectifs et sécurité

Les commandes textuelles sont utiles, mais un membre peut parfois choisir plus facilement une action en appuyant sur un bouton, en sélectionnant une option ou en remplissant un formulaire. Discord propose des composants d'interface qui rendent les bots plus simples à utiliser.

À la fin de cette leçon, tu sauras créer une **View**, ajouter un bouton, construire un menu de sélection, afficher un modal, répondre à une interaction, gérer un délai d'expiration et vérifier les permissions avant une action.

Travaille dans un serveur privé de test. Utilise un bot dont tu contrôles la configuration. Le token doit rester dans une variable d'environnement ou un gestionnaire de secrets. Ne le colle jamais dans le code, une capture d'écran, un message ou le dépôt. Le bot n'a pas besoin de la permission Administrateur pour les exemples de cette leçon.

## 2. Sommaire et environnement

1. Comprendre les interactions Discord
2. Préparer discord.py 2.x
3. Comprendre View et les composants
4. Créer un bouton simple
5. Répondre une seule fois à une interaction
6. Utiliser les réponses éphémères
7. Créer un menu de sélection
8. Construire un modal avec des champs
9. Vérifier l'utilisateur et les permissions
10. Gérer les délais et les vues persistantes
11. Organiser le code et les identifiants
12. Mini-projet : panneau d'aide interactif
13. Tester et déboguer
14. Exercices et corrigés
15. Fiche de révision

Les exemples ciblent discord.py 2.x. Les noms d'API peuvent évoluer : vérifie la version installée et la documentation officielle correspondant à cette version avant de mettre un bot en production.

## 3. Comprendre les interactions Discord

Une interaction est un événement déclenché lorsqu'un membre utilise un composant, une commande slash ou une autre fonction interactive. Discord transmet une interaction au bot. Le bot doit répondre dans le délai prévu par la plateforme.

Un bouton n'est pas une commande textuelle. Il possède un identifiant de composant et une fonction qui traite le clic. Un menu transmet la valeur choisie. Un modal affiche un formulaire et renvoie les champs remplis.

Analogie : une commande est une demande écrite à un guichet. Un bouton est un choix affiché sur un panneau. Le modal est un formulaire qui recueille plusieurs informations. Dans les trois cas, le serveur doit vérifier si l'utilisateur a le droit d'effectuer l'action.

Ne considère jamais le clic comme une preuve d'autorisation. Un membre peut interagir avec un composant, mais le bot doit encore contrôler le contexte et les permissions.

## 4. Préparer discord.py 2.x

Dans ton environnement Python, installe ou mets à jour la bibliothèque avec le gestionnaire de paquets adapté :

~~~bash
python -m pip install -U discord.py
~~~

Sur Android, Pydroid 3 peut nécessiter une configuration compatible pour certaines dépendances. Le développement et les tests de logique peuvent se faire localement, mais la connexion permanente à Discord dépend du réseau et de l'environnement.

Exemple de démarrage sécurisé :

~~~python
import os
import discord
from discord.ext import commands

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)
~~~

La variable d'environnement est configurée hors du fichier source. N'écris pas sa valeur dans le code. Le bot doit recevoir uniquement les intents nécessaires à ses fonctions.

## 5. Comprendre View et les composants

Dans discord.py, **discord.ui.View** regroupe des composants interactifs. Une vue peut contenir des boutons et des menus. Elle possède une durée de vie appelée timeout.

Un composant peut avoir :
- un libellé compréhensible ;
- un style visuel ;
- un identifiant personnalisé lorsque nécessaire ;
- une fonction callback ;
- un état désactivé ou actif.

Le composant doit expliquer clairement ce qui va se passer. Évite les boutons dont le texte est seulement « OK » si plusieurs actions différentes sont possibles.

Une vue temporaire convient à un message de courte durée. Une vue persistante demande une configuration particulière et une réinscription au démarrage du bot. Elle doit aussi utiliser des identifiants stables. Ne commence pas par une vue persistante : maîtrise d'abord les interactions temporaires.

## 6. Créer un bouton simple

Voici une vue qui contient un bouton. Le callback répond à la personne qui a cliqué.

~~~python
import discord

class AideView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=60)

    @discord.ui.button(
        label="Afficher l'aide",
        style=discord.ButtonStyle.primary
    )
    async def aide(
        self,
        interaction: discord.Interaction,
        button: discord.ui.Button
    ):
        await interaction.response.send_message(
            "Voici les commandes disponibles.",
            ephemeral=True
        )
~~~

Pour afficher la vue depuis une commande, tu peux utiliser :

~~~python
@bot.command()
async def panneau(ctx):
    await ctx.send(
        "Choisis une action :",
        view=AideView()
    )
~~~

La vue reste active pendant la durée configurée. Lorsque le délai expire, les interactions ne doivent plus être considérées comme disponibles. Une interface doit toujours expliquer ce qu'elle fait et éviter de promettre une action qui n'est pas réalisée.

## 7. Répondre une seule fois à une interaction

Une interaction reçoit une réponse initiale. Dans discord.py, **interaction.response** sert à répondre à cette première interaction. Si le bot doit envoyer un autre message après cette réponse, il utilise généralement **interaction.followup**.

~~~python
await interaction.response.send_message(
    "Action reçue.",
    ephemeral=True
)

await interaction.followup.send(
    "Voici le détail supplémentaire.",
    ephemeral=True
)
~~~

Ne réponds pas deux fois avec response à la même interaction. Cela peut produire une erreur indiquant que l'interaction a déjà été reconnue.

Si une opération prend du temps, le bot peut différer la réponse avec **defer()**, puis envoyer le résultat avec followup. Le délai de réponse doit respecter les règles de Discord. Ne laisse pas une interaction sans réponse.

## 8. Utiliser les réponses éphémères

Une réponse éphémère est visible uniquement par la personne qui a déclenché l'interaction. Elle est utile pour afficher une confirmation privée, une erreur de permission ou un résultat personnel.

~~~python
await interaction.response.send_message(
    "Tu n'as pas la permission de faire cela.",
    ephemeral=True
)
~~~

Une réponse éphémère n'est pas un mécanisme d'autorisation. Elle ne remplace pas le contrôle des droits côté bot. Elle sert seulement à limiter la visibilité du message.

Choisis le bon emplacement :
- message public pour une annonce destinée au salon ;
- réponse éphémère pour une confirmation personnelle ;
- message privé uniquement lorsque cela correspond au besoin et aux règles de la plateforme.

Ne renvoie pas d'informations sensibles dans un message public.

## 9. Créer un menu de sélection

Un menu de sélection permet de choisir une option parmi plusieurs. L'exemple ci-dessous présente trois catégories d'aide.

~~~python
class SujetSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(
                label="Commandes",
                value="commandes",
                description="Découvrir les commandes"
            ),
            discord.SelectOption(
                label="Compte",
                value="compte",
                description="Comprendre les paramètres"
            ),
            discord.SelectOption(
                label="Support",
                value="support",
                description="Trouver les informations utiles"
            )
        ]
        super().__init__(
            placeholder="Choisis un sujet",
            min_values=1,
            max_values=1,
            options=options
        )

    async def callback(self, interaction):
        choix = self.values[0]
        await interaction.response.send_message(
            f"Tu as choisi : {choix}",
            ephemeral=True
        )


class SujetView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=90)
        self.add_item(SujetSelect())
~~~

La valeur technique est séparée du texte affiché. Le bot doit vérifier que la valeur reçue appartient aux choix autorisés avant d'effectuer une action importante.

## 10. Construire un modal avec des champs

Un modal est un formulaire présenté à l'utilisateur. Il peut demander un sujet et une description.

~~~python
class DemandeModal(discord.ui.Modal, title="Nouvelle demande"):
    sujet = discord.ui.TextInput(
        label="Sujet",
        max_length=80
    )
    description = discord.ui.TextInput(
        label="Description",
        style=discord.TextStyle.paragraph,
        max_length=500
    )

    async def on_submit(self, interaction):
        sujet = self.sujet.value.strip()
        description = self.description.value.strip()

        if not sujet or not description:
            await interaction.response.send_message(
                "Complète les deux champs.",
                ephemeral=True
            )
            return

        await interaction.response.send_message(
            "Ta demande a été reçue.",
            ephemeral=True
        )
~~~

Le modal collecte du texte, mais ce texte reste non fiable. Il faut limiter sa longueur, retirer les espaces inutiles et vérifier les règles métier. N'exécute jamais une commande Python construite à partir du contenu d'un formulaire.

Un modal doit être ouvert depuis une interaction valide, souvent depuis le callback d'un bouton. Ne tente pas de l'envoyer comme un message ordinaire.

## 11. Vérifier l'utilisateur et les permissions

Avant une action sensible, vérifie qui agit, où l'action se déroule et quelles permissions sont requises.

~~~python
if interaction.guild is None:
    await interaction.response.send_message(
        "Cette action est disponible uniquement sur un serveur.",
        ephemeral=True
    )
    return

if not interaction.user.guild_permissions.manage_messages:
    await interaction.response.send_message(
        "Permission insuffisante.",
        ephemeral=True
    )
    return
~~~

Cet exemple vérifie une permission de membre. Si le bot doit lui-même modifier un message, il faut aussi vérifier les permissions du bot dans le salon concerné.

Le principe du moindre privilège consiste à n'accorder que les droits nécessaires. Pour afficher un panneau et répondre à un clic, le bot n'a généralement pas besoin d'Administrateur. Ne demande pas des permissions supplémentaires « au cas où ».

## 12. Gérer les délais et les vues persistantes

Une vue temporaire utilise un timeout. Après son expiration, les composants doivent être considérés comme inactifs. Tu peux désactiver les boutons dans **on_timeout()** puis modifier le message si le bot en a conservé la référence.

Une vue persistante est différente : elle doit avoir **timeout=None**, des composants avec **custom_id** explicites et être enregistrée au démarrage avec **bot.add_view(...)**. Elle doit être reconstruite après un redémarrage. La logique du callback doit retrouver les données nécessaires depuis un stockage fiable.

N'utilise pas un identifiant aléatoire qui change à chaque redémarrage si tu veux restaurer la même interface. N'utilise pas non plus l'identifiant d'un composant comme une autorisation : il identifie une action, il ne prouve pas que l'utilisateur y a droit.

## 13. Mini-projet : panneau d'aide interactif

Objectif : publier un panneau qui propose trois sujets. Le membre choisit une catégorie puis reçoit une réponse privée. Aucun rôle n'est modifié, aucun salon n'est supprimé et aucune permission Administrateur n'est nécessaire.

~~~python
import os
import discord
from discord.ext import commands

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("Configure DISCORD_TOKEN.")

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)


class AideSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(label="Commandes", value="commandes"),
            discord.SelectOption(label="Compte", value="compte"),
            discord.SelectOption(label="Règles", value="regles")
        ]
        super().__init__(
            placeholder="Choisis une catégorie",
            options=options,
            min_values=1,
            max_values=1
        )

    async def callback(self, interaction):
        textes = {
            "commandes": "Consulte la liste des commandes.",
            "compte": "Vérifie les paramètres de ton compte.",
            "regles": "Lis les règles du serveur."
        }
        choix = self.values[0]
        message = textes.get(choix, "Catégorie inconnue.")
        await interaction.response.send_message(
            message,
            ephemeral=True
        )


class AideView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=120)
        self.add_item(AideSelect())


@bot.command()
@commands.guild_only()
async def aidepanel(ctx):
    await ctx.send(
        "Choisis une catégorie d'aide :",
        view=AideView()
    )


bot.run(token)
~~~

Teste d'abord dans un serveur privé. Vérifie que le menu apparaît, que chaque choix donne le bon texte et que la réponse reste privée. Le panneau ne doit pas exposer le token ni demander des permissions inutiles.

## 14. Tester et déboguer

| Symptôme | Cause possible | Vérification |
|---|---|---|
| Interaction expirée | Réponse trop tardive | Utiliser defer pour une tâche longue |
| Interaction déjà répondue | Deux réponses initiales | Utiliser followup après response |
| Vue inactive | Timeout dépassé | Vérifier timeout et état |
| Modal impossible à ouvrir | Mauvais contexte d'interaction | Ouvrir depuis un callback valide |
| Menu sans résultat | Valeur non traitée | Vérifier self.values |
| Forbidden | Permission du bot absente | Contrôler le salon |
| Vue perdue après redémarrage | Vue temporaire | Enregistrer une vue persistante si nécessaire |

Teste chaque composant avec un membre autorisé puis un membre non autorisé. Teste aussi un salon où le bot ne peut pas envoyer de message. Les erreurs doivent être compréhensibles et les journaux ne doivent pas contenir de secrets.

## 15. Exercices progressifs, corrigés et révision

**Exercice 1 :** crée un bouton « Voir les règles » qui répond en privé.

**Exercice 2 :** crée un menu avec trois valeurs et affiche la valeur choisie.

**Exercice 3 :** ajoute un modal avec un champ sujet et un champ description.

**Exercice 4 :** explique pourquoi un custom_id n'est pas une permission.

**Exercice 5 :** indique les conditions nécessaires à une vue persistante.

### Correction 1

~~~python
class ReglesView(discord.ui.View):
    @discord.ui.button(
        label="Voir les règles",
        style=discord.ButtonStyle.secondary
    )
    async def regles(self, interaction, button):
        await interaction.response.send_message(
            "Lis les règles avant de participer.",
            ephemeral=True
        )
~~~

Le callback répond une seule fois et la réponse est privée.

### Correction 2

Dans le callback du Select, lis **self.values[0]** puis compare la valeur à une liste autorisée. N'utilise pas directement une valeur reçue pour construire une commande ou une requête.

### Correction 3

Utilise **discord.ui.Modal** et deux objets **TextInput**. Dans on_submit, retire les espaces inutiles, contrôle les champs et confirme la réception avec une réponse éphémère.

### Correction 4

Un custom_id identifie un composant pour que le bot sache quel callback traiter. Il peut être deviné ou réutilisé. Les droits doivent être contrôlés séparément à chaque interaction.

### Correction 5

Une vue persistante utilise timeout=None, des custom_id explicites et est enregistrée au démarrage avec add_view. Le bot doit aussi reconstruire toute donnée nécessaire au callback.

### Fiche de révision

| Notion | Rôle |
|---|---|
| Interaction | Action déclenchée sur Discord |
| View | Conteneur de composants |
| Button | Action cliquable |
| Select | Choix dans une liste |
| Modal | Formulaire |
| response | Réponse initiale |
| followup | Message après réponse |
| ephemeral | Visible par l'auteur seulement |
| timeout | Durée d'activité |
| custom_id | Identifiant du composant |
| moindre privilège | Limiter les permissions |

Avant la leçon 10, vérifie que tu sais créer une View, traiter un bouton, un menu et un modal, répondre correctement à une interaction et contrôler les permissions.

**À retenir :** une interface interactive simplifie l'utilisation du bot, mais chaque action doit être validée côté serveur. Les composants ne remplacent ni les permissions ni la protection du token.

---

*©pythonschool — Discord, Leçon 09.*