# Discord — Leçon 10 : Préparer le déploiement et la surveillance d'un bot

**Parcours :** Discord  
**Numéro :** 10  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 115 à 125 minutes  
**Environnement :** Python, discord.py, terminal ou tableau de bord d'hébergement.  
**Prérequis :** Application Discord, bot fonctionnel, commandes, événements, permissions, journaux et stockage de base.

## 1. Fiche de départ : objectifs et prérequis

Un bot qui fonctionne sur un téléphone ou un ordinateur pendant un test n'est pas forcément prêt à rester disponible. Le déploiement consiste à exécuter le programme dans un environnement adapté, avec sa configuration, ses dépendances et ses secrets. La surveillance permet ensuite de détecter les erreurs et de comprendre pourquoi le bot s'arrête.

À la fin de cette leçon, tu sauras préparer une version de test, séparer le code de la configuration, stocker le token dans une variable d'environnement, choisir un hébergement adapté, comprendre les redémarrages, conserver les données, lire les journaux et préparer une liste de contrôle avant publication.

Aucun hébergement payant n'est obligatoire pour apprendre. Toutefois, un service gratuit peut limiter les heures d'exécution, mettre le programme en veille ou supprimer les fichiers locaux. Un bot disponible en permanence exige une machine ou un service qui reste réellement actif. Un téléphone Android n'est pas une solution fiable pour garantir une disponibilité continue.

## 2. Sommaire et méthode de déploiement

1. Comprendre ce que signifie déployer
2. Séparer code, configuration et secrets
3. Préparer les dépendances
4. Démarrer un bot avec discord.py
5. Choisir un environnement d'hébergement
6. Comprendre le processus et les redémarrages
7. Surveiller les journaux sans exposer de secrets
8. Gérer les permissions et les intents
9. Préserver les données et les sauvegardes
10. Tester une version avant sa mise en ligne
11. Mini-projet : préparer un bot de test
12. Erreurs fréquentes et diagnostic
13. Exercices et corrigés
14. Fiche de révision

La méthode est progressive : faire fonctionner le bot localement, préparer sa configuration, tester le démarrage dans un environnement propre, puis seulement envisager une exécution continue.

## 3. Comprendre ce que signifie déployer

Déployer un bot signifie rendre son programme exécutable dans un environnement prévu pour cela. Il faut plus que le fichier Python : le programme a besoin d'une version compatible de Python, de ses bibliothèques, de variables de configuration, d'un accès réseau et d'autorisations adaptées.

Un bot Discord utilise une connexion réseau avec les services Discord. Si le processus Python s'arrête, le bot ne peut plus répondre. Si le serveur redémarre, le processus doit être relancé. Si la connexion est interrompue, la bibliothèque doit pouvoir gérer la reconnexion selon son fonctionnement normal.

Distingue trois environnements : développement, où tu modifies le code ; test ou préproduction, où tu vérifies la version avec un serveur isolé ; production, où les utilisateurs utilisent le bot réel.

Ne teste pas une nouvelle commande sensible directement sur un serveur public. Une version de test permet de vérifier les permissions, les messages et les limites avant de toucher au bot principal.

Le déploiement ne garantit pas la qualité du code. Il rend seulement le programme accessible dans un environnement choisi.

## 4. Séparer le code, la configuration et les secrets

Le code contient les instructions. La configuration contient les valeurs qui peuvent varier entre deux environnements : préfixe, identifiant de serveur de test ou niveau de journalisation. Un secret est une donnée qui donne un accès privilégié, comme le token du bot.

Ne place jamais un vrai token dans un fichier Python, un dépôt GitHub, une capture d'écran ou un message de journal. Si un token a été publié, révoque-le ou régénère-le depuis le portail développeur Discord. Supprimer le texte du dernier commit ne suffit pas toujours : l'historique peut conserver l'ancienne valeur.

Le programme peut lire une variable d'environnement :

~~~python
import os

TOKEN = os.getenv("DISCORD_TOKEN")

if not TOKEN:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")
~~~

La variable doit être configurée dans l'environnement d'exécution ou dans le gestionnaire de secrets de l'hébergeur. Le nom de la variable peut être partagé ; sa valeur doit rester privée.

Un fichier .env peut être pratique en développement avec une bibliothèque dédiée, mais il doit être ignoré par Git et ne doit jamais contenir de vraie valeur dans un dépôt public. Pour un premier déploiement, utilise de préférence les variables d'environnement fournies par la plateforme.

## 5. Préparer les dépendances et le point d'entrée

Un projet doit déclarer les bibliothèques dont il dépend. Un fichier requirements.txt permet de noter les paquets Python nécessaires.

Exemple :

~~~text
discord.py
~~~

Dans un projet réel, il est préférable de figer des versions testées afin qu'une installation future ne change pas silencieusement le comportement. N'ajoute pas de dépendance dont le programme n'a pas besoin.

Le point d'entrée est le fichier que l'environnement lance. Il doit être facile à identifier, par exemple bot.py. Le démarrage ne doit pas dépendre d'un terminal ouvert manuellement ou d'un chemin présent uniquement sur ton téléphone.

~~~python
import os
import discord

intents = discord.Intents.default()
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print("Bot connecté :", client.user)

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("DISCORD_TOKEN est manquant.")

client.run(token)
~~~

Cet exemple minimal montre où le token est lu. Il ne demande pas l'intent message_content, car il n'en a pas besoin pour cet événement. Ajoute seulement les intents requis par les fonctionnalités réelles.

## 6. Choisir un environnement d'hébergement

Plusieurs possibilités existent : un ordinateur personnel, un serveur virtuel, un service d'application, un conteneur ou une plateforme spécialisée. Chaque solution a des coûts, des limites et des conditions différentes.

Un ordinateur personnel peut suffire pour un test, mais le bot s'arrête lorsque la machine s'éteint ou perd sa connexion. Un service d'hébergement peut rester actif, mais il faut vérifier ses règles : sommeil automatique, durée maximale, quotas, stockage temporaire et restrictions réseau.

Un niveau gratuit ne signifie pas toujours disponibilité permanente. Certaines plateformes mettent les applications en veille après une période d'inactivité ou limitent les heures d'exécution. Ne promets pas une disponibilité 24 h/24 sans vérifier les conditions du service.

Sur Android, Pydroid 3 est utile pour apprendre et tester. Le système peut arrêter une application en arrière-plan pour économiser la batterie. Il ne faut donc pas considérer le téléphone comme un serveur permanent. Tu peux toutefois préparer les fichiers, consulter un tableau de bord et configurer un service depuis le navigateur du téléphone.

Avant de choisir, note les besoins : durée d'exécution, stockage persistant, variables secrètes, logs, redémarrage automatique et coût réel après expiration d'une offre gratuite.

## 7. Comprendre le processus et les redémarrages

Un processus est une instance d'un programme en cours d'exécution. Lorsque Python lance bot.py, le système crée un processus. Si ce processus s'arrête, le bot est hors ligne jusqu'à son prochain démarrage.

Un gestionnaire de processus peut redémarrer automatiquement une application après une panne. C'est utile, mais cela ne corrige pas la cause de l'erreur. Si le programme échoue toutes les secondes à cause d'une configuration manquante, les redémarrages répétés ne résolvent rien.

Prévois une commande de démarrage unique et documentée, un code de sortie observable, des journaux de démarrage et d'arrêt, un redémarrage contrôlé et une procédure pour arrêter le bot avant une mise à jour.

discord.py gère la connexion et certaines reconnexions. N'ajoute pas une seconde boucle personnalisée qui lance plusieurs clients en parallèle. Un seul processus doit généralement utiliser le token pour cette instance de bot.

Lors d'une mise à jour, vérifie que l'ancien processus est arrêté avant d'en démarrer un nouveau. Deux instances peuvent répondre en double ou modifier les mêmes données.

## 8. Surveiller les journaux sans exposer de secrets

Les journaux expliquent ce que le programme faisait au moment d'un problème. Utilise le module standard logging plutôt que de multiplier les print dans un grand projet.

~~~python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

logging.info("Démarrage du bot")
logging.warning("Configuration de test active")
~~~

Les niveaux courants sont DEBUG, INFO, WARNING, ERROR et CRITICAL. En production, INFO peut suffire pour les événements importants ; DEBUG sert surtout au diagnostic temporaire.

Ne journalise jamais le token, les mots de passe, les codes privés ou le contenu sensible des messages. Un journal doit aider à comprendre un événement sans devenir une copie de données privées.

Un bon journal répond à des questions : quand le bot a-t-il démarré ? quelle commande a échoué ? quel type d'erreur est apparu ? quelle opération a été terminée ? Évite les messages vagues comme « problème ».

Si un message d'erreur contient une donnée privée, masque-la avant de partager le journal pour demander de l'aide.

## 9. Gérer les permissions, les intents et les données

Le principe du moindre privilège signifie qu'un bot reçoit uniquement les permissions nécessaires. Un bot qui répond à une commande simple n'a pas besoin de la permission Administrateur. Une permission trop large augmente les conséquences d'une erreur ou d'une compromission.

Vérifie trois éléments séparément : les permissions accordées au bot sur le serveur ; les permissions particulières des salons ; les intents activés dans le portail et dans le code.

Les intents privilégiés doivent être activés seulement si une fonctionnalité en dépend. Par exemple, un bot qui lit le contenu des messages peut nécessiter un intent particulier. Un bot qui ne fait que réagir à des événements disponibles par défaut ne doit pas demander tous les intents.

Les données du bot doivent être stockées dans un emplacement persistant si elles doivent survivre à un redémarrage ou à un remplacement d'instance. Un fichier placé dans un stockage temporaire peut disparaître lors d'un redéploiement. Vérifie la documentation de l'hébergeur.

## 10. Préserver les données et préparer les sauvegardes

Si ton bot utilise SQLite, la base de données est un fichier. Il faut savoir où ce fichier est stocké et si cet emplacement survit aux redémarrages et aux déploiements.

Une sauvegarde doit être créée à une fréquence adaptée, conservée dans un emplacement distinct, protégée contre les accès non autorisés et testée par une restauration.

Une sauvegarde qui n'a jamais été restaurée n'est pas une preuve de récupération possible. Teste la restauration sur une copie, pas sur la base de production.

Ne copie pas des fichiers de base de données pendant qu'une écriture est en cours sans utiliser une méthode compatible avec SQLite. Pour un petit projet, arrête proprement le programme avant une copie manuelle. Pour un projet plus avancé, utilise les mécanismes de sauvegarde prévus par la base.

Conserve uniquement les données nécessaires. Définis une durée de conservation et une méthode de suppression lorsque des données ne sont plus utiles.

## 11. Mini-projet : préparer un bot de test

Le but est de préparer un projet qui peut être exécuté localement puis dans un environnement d'hébergement. Le code ci-dessous ne contient aucun secret et ne demande qu'un token configuré dans l'environnement.

~~~python
import os
import logging
import discord

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("Configure DISCORD_TOKEN dans l'environnement.")

intents = discord.Intents.default()
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    logging.info("Bot connecté sous %s", client.user)

@client.event
async def on_disconnect():
    logging.warning("Connexion interrompue.")

client.run(token)
~~~

Pour tester : installe une version compatible de discord.py ; configure le token dans l'environnement local sans l'écrire dans le fichier ; lance le programme depuis le terminal ; vérifie le message de connexion ; arrête le programme avec une interruption normale ; vérifie que les journaux ne contiennent aucun secret.

Pour un hébergement, configure le même nom de variable dans le gestionnaire de secrets de la plateforme et définis la commande de démarrage. Le code reste identique entre test et production ; seules les variables et les ressources changent.

## 12. Erreurs fréquentes et diagnostic

| Symptôme | Cause possible | Vérification |
|---|---|---|
| Le bot ne démarre pas | Token absent | Vérifier la variable d'environnement |
| Invalid token | Token révoqué ou mal copié | Régénérer le secret et le reconfigurer |
| Le bot est hors ligne | Processus arrêté | Lire les journaux et l'état du service |
| Commande sans réponse | Intents ou permissions | Vérifier le besoin exact |
| Réponses en double | Plusieurs instances | Vérifier le nombre de processus |
| Données perdues | Stockage temporaire | Vérifier le volume persistant |
| Redémarrages continus | Erreur au démarrage | Lire la première exception |
| Bot trop privilégié | Permissions excessives | Réduire les autorisations |

Lis les journaux depuis le premier message du démarrage. La dernière erreur n'est pas toujours la cause initiale. Vérifie aussi la version de Python et les dépendances installées dans l'environnement réel, pas seulement celles de ton téléphone.

## 13. Exercices progressifs et corrigés expliqués

**Exercice A :** explique la différence entre code, configuration et secret.

**Exercice B :** modifie le code minimal pour afficher une erreur claire lorsque DISCORD_TOKEN est absent.

**Exercice C :** donne deux raisons pour lesquelles un service gratuit peut ne pas garantir un bot toujours en ligne.

**Exercice D :** explique pourquoi deux instances du même bot peuvent produire des réponses en double.

**Exercice E :** écris une liste de cinq éléments à vérifier avant de passer du serveur de test au serveur réel.

### Correction A

Le code contient les instructions. La configuration contient les valeurs variables. Le secret permet un accès protégé et doit rester dans un environnement ou un gestionnaire de secrets.

### Correction B

~~~python
import os

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("La variable DISCORD_TOKEN est absente.")
~~~

Le programme s'arrête immédiatement avec un message compréhensible au lieu d'essayer de se connecter avec une valeur vide.

### Correction C

Une plateforme gratuite peut mettre l'application en veille, limiter les heures d'exécution, arrêter les processus inactifs ou supprimer le stockage local.

### Correction D

Chaque processus peut recevoir les mêmes événements et exécuter les mêmes commandes. Il faut contrôler le nombre d'instances et éviter les démarrages concurrents.

### Correction E

Vérifier token, permissions minimales, intents nécessaires, stockage persistant et journaux. Il est aussi utile de tester les commandes sur un serveur isolé.

## 14. Fiche de révision et validation

| Élément | Rôle |
|---|---|
| Déploiement | Exécuter le bot dans un environnement choisi |
| Configuration | Valeurs qui changent selon l'environnement |
| Variable d'environnement | Fournir une configuration au processus |
| Secret | Donnée privée donnant un accès |
| Processus | Programme en cours d'exécution |
| Redémarrage | Relancer après un arrêt |
| Journal | Tracer les événements et erreurs |
| Intent | Autoriser l'accès à certains événements |
| Stockage persistant | Conserver les données entre redémarrages |
| Sauvegarde testée | Vérifier qu'une restauration fonctionne |

Avant la leçon 11, vérifie que tu sais séparer code et secrets, expliquer les limites d'un hébergement gratuit, lire un journal, limiter les permissions et préparer une sauvegarde restaurable.

**À retenir :** un bot fiable ne dépend pas d'un terminal ouvert sur un téléphone. Il a un environnement adapté, une configuration protégée, des permissions minimales, des journaux utiles et une procédure de récupération.

---

*©pythonschool — Discord, Leçon 10.*