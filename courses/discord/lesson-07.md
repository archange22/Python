# Discord — Leçon 07 : Stocker les données d’un bot avec SQLite

**Parcours :** Discord  
**Numéro :** 07  
**Niveau :** Débutant à intermédiaire  
**Durée :** 110 à 130 minutes  
**Environnement :** Python 3.10+, discord.py 2.x et SQLite.  
**Prérequis :** Python, fonctions, commandes slash, événements et permissions.

## Objectifs et prérequis
Un bot redémarre parfois. Ses variables en mémoire disparaissent alors. Une base conserve les réglages et informations utiles. Tu apprendras les tables, clés, requêtes paramétrées, l'intégration à une commande slash, l'isolation par serveur, les tests et la protection des données. Le module `sqlite3` est inclus dans Python.

## Sommaire
1. Pourquoi une base ; 2. SQLite ; 3. Concevoir une table ; 4. Connexion ; 5. Ajouter et lire ; 6. Paramètres SQL ; 7. Modifier et supprimer ; 8. Commande Discord ; 9. Asynchrone ; 10. Sécurité ; 11. Tests ; 12. Projet ; 13. Exercices ; 14. Corrigés ; 15. Révision.

## 1. Pourquoi un bot a besoin d'une base
Une variable Python existe pendant l'exécution. Si le bot s'arrête, `points = 10` disparaît. Une base conserve l'information dans un fichier ou un service dédié.

Exemples : préférences d'un serveur, points d'un membre, date de création d'un ticket ou paramètres d'une commande. Ne stocke pas tout : conserve uniquement les données nécessaires. Les conversations privées, mots de passe et tokens ne doivent pas être collectés sans raison.

SQLite convient à un petit bot : il stocke les données dans un fichier et ne nécessite pas de serveur séparé. Pour une application très sollicitée ou répartie sur plusieurs machines, une base serveur peut devenir plus adaptée.

## 2. Comprendre SQLite et les tables
SQLite est un moteur de base de données relationnelle. Une table ressemble à une feuille de calcul : les colonnes décrivent les champs et les lignes représentent les enregistrements.

| guild_id | user_id | points |
|---|---|---:|
| 100 | 501 | 12 |
| 100 | 502 | 8 |
| 200 | 501 | 4 |

Le même membre peut avoir des points différents selon le serveur. La paire `guild_id` et `user_id` identifie donc une ligne. Une clé primaire empêche les doublons sur cette paire.

## 3. Concevoir une table
Pour un système de points, trois colonnes suffisent :

~~~sql
CREATE TABLE IF NOT EXISTS membres (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
);
~~~

`NOT NULL` interdit une valeur absente. `DEFAULT 0` donne zéro si aucun total n'est fourni. Les identifiants Discord sont stockés en texte pour simplifier leur représentation. Une bonne conception évite colonnes inutiles, doublons et données jamais utilisées.

## 4. Créer et ouvrir la base
`sqlite3` est inclus dans Python. Cet exemple ferme explicitement la connexion :

~~~python
import sqlite3
from contextlib import closing
from pathlib import Path

DB_PATH = Path("bot_data.sqlite3")

def initialiser_base():
    with closing(sqlite3.connect(DB_PATH)) as con:
        with con:
            con.execute("""
                CREATE TABLE IF NOT EXISTS membres (
                    guild_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    points INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY (guild_id, user_id)
                )
            """)

initialiser_base()
print(DB_PATH.resolve())
~~~

`connect()` ouvre ou crée la base. `execute()` envoie la requête. Le contexte `with con` valide la transaction ou l'annule en cas d'exception. `closing()` ferme réellement la connexion. Attention : le contexte d'une connexion SQLite gère la transaction, mais ne ferme pas à lui seul la connexion.

## 5. Ajouter et lire des données
Ajouter un membre sans remettre ses points à zéro s'il existe :

~~~python
import sqlite3
from contextlib import closing

def ajouter_membre(guild_id, user_id):
    with closing(sqlite3.connect("bot_data.sqlite3")) as con:
        with con:
            con.execute(
                """INSERT OR IGNORE INTO membres
                   (guild_id, user_id, points) VALUES (?, ?, 0)""",
                (str(guild_id), str(user_id))
            )
~~~

Lire le total :

~~~python
def lire_points(guild_id, user_id):
    with closing(sqlite3.connect("bot_data.sqlite3")) as con:
        ligne = con.execute(
            """SELECT points FROM membres
               WHERE guild_id = ? AND user_id = ?""",
            (str(guild_id), str(user_id))
        ).fetchone()
    return ligne[0] if ligne else 0
~~~

`SELECT` lit, `WHERE` filtre et `fetchone()` renvoie une ligne ou `None`. Prévois le cas où le membre n'est pas encore enregistré.

## 6. Utiliser des paramètres SQL
Ne fabrique jamais une requête en collant une saisie directement dans le texte SQL.

~~~python
# À éviter : une donnée peut modifier la requête.
requete = "SELECT points FROM membres WHERE user_id = '" + user_id + "'"
~~~

Utilise plutôt un paramètre :

~~~python
curseur = con.execute(
    "SELECT points FROM membres WHERE user_id = ?",
    (str(user_id),)
)
~~~

Le point d'interrogation transmet la valeur séparément de la requête. Cela empêche une saisie contenant des caractères spéciaux d'être interprétée comme du code SQL. Le nombre de valeurs doit correspondre au nombre de marqueurs. Pour un seul paramètre, écris un tuple avec une virgule : `(valeur,)`.

## 7. Mettre à jour et supprimer
Pour ajouter des points, SQLite peut insérer ou mettre à jour une ligne. Cette syntaxe UPSERT nécessite SQLite 3.24 ou plus récent.

~~~python
def ajouter_points(guild_id, user_id, montant):
    if not isinstance(montant, int) or montant <= 0:
        raise ValueError("Montant invalide.")
    with closing(sqlite3.connect("bot_data.sqlite3")) as con:
        with con:
            con.execute("""
                INSERT INTO membres (guild_id, user_id, points)
                VALUES (?, ?, ?)
                ON CONFLICT(guild_id, user_id)
                DO UPDATE SET points = points + excluded.points
            """, (str(guild_id), str(user_id), montant))
~~~

`excluded.points` représente la valeur proposée par l'insertion. Pour supprimer, utilise `DELETE` avec une condition précise. Sans `WHERE`, toutes les lignes peuvent être supprimées. Vérifie toujours une opération destructive et prévois une sauvegarde.

## 8. Relier SQLite à une commande Discord
La commande suivante suppose que `bot` est un objet `commands.Bot` déjà configuré avec discord.py 2.x.

~~~python
import asyncio
import sqlite3
from contextlib import closing
from discord import app_commands

def lire_points(guild_id, user_id):
    with closing(sqlite3.connect("bot_data.sqlite3")) as con:
        ligne = con.execute(
            "SELECT points FROM membres WHERE guild_id = ? AND user_id = ?",
            (str(guild_id), str(user_id))
        ).fetchone()
    return ligne[0] if ligne else 0

@app_commands.command(name="points", description="Consulter ses points")
async def points(interaction):
    if interaction.guild_id is None:
        await interaction.response.send_message(
            "Utilise cette commande sur un serveur.", ephemeral=True
        )
        return
    total = await asyncio.to_thread(
        lire_points, interaction.guild_id, interaction.user.id
    )
    await interaction.response.send_message(
        f"Tu possèdes {total} point(s).", ephemeral=True
    )

bot.tree.add_command(points)
~~~

`asyncio.to_thread()` déplace la fonction bloquante vers un thread. La commande lit uniquement les points du membre dans le serveur courant. Pour modifier les points, vérifie une permission côté serveur et valide le montant.

## 9. Respecter la boucle asynchrone
Discord.py utilise une boucle d'événements asynchrone. Une opération bloquante longue peut ralentir les interactions si elle s'exécute directement dans une fonction `async`.

Pour de petites bases SQLite et des requêtes rapides, l'accès synchrone peut convenir à un bot peu sollicité. Surveille toutefois les temps d'exécution. `asyncio.to_thread()` déplace une fonction bloquante vers un thread.

Une bibliothèque comme `aiosqlite` peut être étudiée plus tard, mais ajoute une dépendance. Ne partage pas une connexion globale entre threads sans comprendre les règles de SQLite. Une approche simple consiste à ouvrir une courte connexion dans chaque fonction de stockage.

## 10. Séparer les serveurs et protéger les données
Toutes les requêtes portant sur des données propres à un serveur doivent filtrer avec `guild_id` et `user_id`. Sinon, un score ou un réglage pourrait être partagé par erreur.

Applique le moindre privilège : demande seulement les intents nécessaires, n'accorde pas Administrateur, ne collecte pas les messages privés sans nécessité, explique ce que le bot enregistre et prévois une suppression des données.

Le token reste dans une variable d'environnement :

~~~python
import os

token = os.getenv("DISCORD_TOKEN")
if not token:
    raise RuntimeError("Variable DISCORD_TOKEN absente.")
bot.run(token)
~~~

Ne publie jamais sa valeur dans un fichier, une capture ou un dépôt. Si un token est exposé, révoque-le et génère-en un nouveau depuis le portail Discord.

## 11. Tester et déboguer
Teste la base sans connecter Discord : table créée, insertion correcte, deuxième insertion sans remise à zéro, séparation de deux serveurs et réponse zéro pour un membre absent.

~~~python
import sqlite3
from contextlib import closing

with closing(sqlite3.connect("bot_data.sqlite3")) as con:
    resultat = con.execute("PRAGMA integrity_check").fetchone()
print(resultat[0])
~~~

Le résultat attendu est `ok`. Erreurs fréquentes : `no such table` (initialisation oubliée ou mauvais fichier), `database is locked` (transaction trop longue), `IntegrityError` (contrainte violée), ou requête sans `guild_id`. Affiche le chemin absolu de la base pendant le développement.

## 12. Mini-projet : système de points par serveur
Ce programme peut être exécuté seul. Les identifiants sont fictifs.

~~~python
import sqlite3
from contextlib import closing
from pathlib import Path

DB = Path("points.sqlite3")

def ouvrir_base():
    return closing(sqlite3.connect(DB))

def initialiser():
    with ouvrir_base() as con:
        with con:
            con.execute("""
                CREATE TABLE IF NOT EXISTS points (
                    guild_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    total INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY (guild_id, user_id)
                )
            """)

def modifier_points(guild_id, user_id, montant):
    if not isinstance(montant, int) or montant <= 0:
        raise ValueError("Montant invalide.")
    with ouvrir_base() as con:
        with con:
            con.execute("""
                INSERT INTO points (guild_id, user_id, total)
                VALUES (?, ?, ?)
                ON CONFLICT(guild_id, user_id)
                DO UPDATE SET total = total + excluded.total
            """, (str(guild_id), str(user_id), montant))

def obtenir_points(guild_id, user_id):
    with ouvrir_base() as con:
        ligne = con.execute(
            "SELECT total FROM points WHERE guild_id = ? AND user_id = ?",
            (str(guild_id), str(user_id))
        ).fetchone()
    return ligne[0] if ligne else 0

initialiser()
modifier_points(100, 501, 5)
modifier_points(100, 501, 3)
modifier_points(200, 501, 4)
print(obtenir_points(100, 501))  # 8
print(obtenir_points(200, 501))  # 4
~~~

Le même membre a 8 points sur le serveur 100 et 4 sur le serveur 200. Dans le bot, utilise les identifiants fournis par Discord. Étapes : initialiser au démarrage, appeler la lecture dans une commande, réserver la modification à une commande autorisée et tester avant l'invitation réelle.

## 13. Exercices progressifs
1. Crée `ecole.sqlite3` et une table `notes` avec `user_id` clé primaire et `note`.
2. Écris une fonction d'insertion avec paramètres SQL qui refuse une note hors de 0 à 20.
3. Écris une fonction qui renvoie une note ou `None`.
4. Ajoute `guild_id` à la clé primaire et teste deux serveurs.
5. Explique pourquoi une commande de modification doit vérifier les permissions et pourquoi Administrateur est excessif.

## 14. Corrigés expliqués

### Exercice 1
~~~python
import sqlite3
from contextlib import closing

with closing(sqlite3.connect("ecole.sqlite3")) as con:
    with con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                user_id TEXT PRIMARY KEY,
                note REAL NOT NULL
            )
        """)
~~~

### Exercice 2
~~~python
def ajouter_note(user_id, note):
    if not 0 <= note <= 20:
        raise ValueError("La note doit être entre 0 et 20.")
    with closing(sqlite3.connect("ecole.sqlite3")) as con:
        with con:
            con.execute(
                "INSERT INTO notes (user_id, note) VALUES (?, ?)",
                (str(user_id), float(note))
            )
~~~

### Exercice 3
~~~python
def lire_note(user_id):
    with closing(sqlite3.connect("ecole.sqlite3")) as con:
        ligne = con.execute(
            "SELECT note FROM notes WHERE user_id = ?",
            (str(user_id),)
        ).fetchone()
    return ligne[0] if ligne else None
~~~

### Exercice 4
Utilise `PRIMARY KEY (guild_id, user_id)` et filtre toutes les lectures et mises à jour avec les deux identifiants. Sinon, le bot risque de mélanger les données.

### Exercice 5
Une commande de modification peut changer un classement. Vérifie que la personne est autorisée, valide la quantité et enregistre l'action utile. Le bot ne doit recevoir que les permissions liées à ses fonctions.

## 15. Fiche de révision et validation
| Notion | Rôle |
|---|---|
| SQLite | Base relationnelle dans un fichier |
| Table | Lignes et colonnes |
| Clé primaire | Identifie une ligne |
| SELECT | Lire |
| INSERT | Ajouter |
| UPDATE | Modifier |
| DELETE | Supprimer |
| Paramètre ? | Séparer valeurs et SQL |
| guild_id | Isoler les serveurs |
| Token | Secret à protéger |
| to_thread | Déplacer une opération bloquante |

Avant la leçon 08, vérifie que tu peux créer une table, insérer et lire une ligne, utiliser des paramètres, isoler deux serveurs et expliquer le moindre privilège.

**À retenir :** une base conserve les informations après le redémarrage. Utilise des requêtes paramétrées, sépare les serveurs et ne conserve que les données nécessaires.

---

*©pythonschool — Discord, Leçon 07.*
