# IA — Leçon 01 : Comprendre l’intelligence artificielle

**Parcours :** Intelligence artificielle  
**Niveau :** Débutant  
**Durée indicative :** 45 à 60 minutes  
**Matériel :** Un téléphone ou un ordinateur ; aucune installation nécessaire pour cette leçon.

## Objectifs de la leçon

À la fin de cette leçon, tu sauras :
- expliquer avec tes propres mots ce qu’est l’intelligence artificielle ;
- distinguer une automatisation classique d’un système d’IA ;
- reconnaître les grandes familles de l’IA ;
- comprendre simplement les notions de données, modèle, entraînement et prédiction ;
- expliquer ce qu’est une IA générative ;
- repérer quelques limites importantes d’un système d’IA ;
- vérifier une réponse au lieu de lui faire confiance automatiquement.

Tu n’as pas besoin de connaître les mathématiques avancées pour commencer. Nous allons construire les idées progressivement, avec des exemples de la vie quotidienne.

## 1. Qu’est-ce que l’intelligence artificielle ?

L’intelligence artificielle, souvent appelée **IA**, désigne un ensemble de techniques informatiques qui permettent à un programme d’effectuer certaines tâches qui demandent habituellement des capacités humaines : reconnaître une image, comprendre une phrase, repérer une tendance, proposer une traduction ou générer un texte.

Un programme d’IA ne pense pas exactement comme une personne. Il traite des informations avec des méthodes informatiques et produit un résultat en fonction de son modèle, de ses données et de la demande reçue.

### Exemple simple

Imagine une application qui reçoit la photo d’un animal et répond « chat ». Elle utilise un système entraîné à reconnaître des caractéristiques présentes dans des images. Elle ne connaît pas le chat comme un humain qui en possède un à la maison : elle calcule plutôt quel résultat correspond le mieux à ce qu’elle a appris.

### L’IA autour de nous

On peut rencontrer des fonctions utilisant l’IA dans :
- les claviers qui proposent le mot suivant ;
- les applications de traduction ;
- les systèmes de reconnaissance vocale ;
- les recommandations de vidéos ou de musiques ;
- les outils qui repèrent des courriers indésirables ;
- les assistants capables de rédiger ou résumer un texte.

**À retenir :** l’IA est un domaine de l’informatique qui construit des systèmes capables de réaliser certaines tâches complexes à partir d’informations et de méthodes adaptées.

## 2. IA, automatisation et programme classique : quelle différence ?

Tous les programmes ne sont pas des intelligences artificielles.

Une automatisation classique suit des règles écrites directement par un développeur. Par exemple : « Si le niveau de batterie est inférieur à 20 %, afficher une alerte. » Le programme applique exactement la règle.

Un système d’apprentissage automatique reçoit des exemples et apprend des relations statistiques dans ces données. Il peut ensuite utiliser ce qu’il a appris pour traiter un nouvel exemple.

### Exemple : reconnaître un message contenant le mot « gagnant »

**Programme à règles :**
- chercher le mot « gagnant » ;
- si le mot est présent, classer le message dans une catégorie ;
- sinon, ne pas le classer dans cette catégorie.

Cette méthode peut être utile, mais elle est limitée. Un message frauduleux peut éviter ce mot. Un message honnête peut l’utiliser.

**Système appris à partir d’exemples :**
- recevoir de nombreux messages déjà classés ;
- apprendre les caractéristiques souvent présentes dans chaque catégorie ;
- examiner un nouveau message ;
- proposer une catégorie probable.

Le système appris peut détecter des combinaisons plus complexes, mais il peut aussi se tromper.

Une application réelle peut mélanger les deux méthodes : des règles simples, une IA et une vérification humaine.

## 3. Les grandes familles de l’intelligence artificielle

Le domaine de l’IA est vaste. Pour débuter, retiens quatre notions.

### A. Les systèmes à règles

Ils appliquent des instructions précises écrites par les développeurs. Ils sont souvent faciles à expliquer et à tester. Ils ne sont pas nécessairement des modèles d’apprentissage automatique.

### B. L’apprentissage automatique — Machine Learning

Le Machine Learning est une branche de l’IA dans laquelle un modèle apprend des régularités à partir de données. Au lieu d’écrire une règle pour chaque cas, on fournit des exemples au système.

Exemple : un modèle peut apprendre à estimer le prix d’un logement à partir d’informations comme la surface, l’emplacement et le nombre de pièces.

### C. L’apprentissage profond — Deep Learning

Le Deep Learning utilise des réseaux de neurones artificiels comportant plusieurs couches de calcul. Il est particulièrement utilisé pour des tâches complexes comme la reconnaissance d’images, la parole et le traitement du langage.

Le terme « neurone artificiel » désigne une opération mathématique dans un modèle. Il ne s’agit pas d’un cerveau humain miniature.

### D. L’IA générative

Une IA générative produit un nouveau contenu à partir d’une demande : texte, image, son, code ou autre type de résultat.

Un assistant conversationnel est un exemple d’IA générative lorsqu’il crée une réponse en fonction de la conversation.

Ces familles ne sont pas totalement séparées : les systèmes génératifs modernes utilisent souvent des méthodes d’apprentissage profond.

## 4. Les données : la matière première de nombreux systèmes d’IA

Une donnée est une information que l’on peut enregistrer et traiter.

Exemples :
- un nombre ;
- une phrase ;
- la date d’une commande ;
- une photographie ;
- un enregistrement sonore ;
- la catégorie associée à un exemple.

Un jeu de données est un ensemble organisé de données. Pour apprendre correctement, un modèle a besoin d’exemples suffisamment utiles, représentatifs et préparés.

### Exemple de tableau

| Exemple | Surface | Pièces | Prix connu |
|---|---:|---:|---:|
| Logement A | 40 m² | 2 | 45 millions |
| Logement B | 60 m² | 3 | 65 millions |
| Logement C | 80 m² | 4 | 82 millions |

Ce petit tableau pourrait servir à illustrer un problème d’estimation. Il est beaucoup trop petit pour construire seul un système fiable dans le monde réel, mais il permet de comprendre l’idée.

### Pourquoi la qualité des données compte-t-elle ?

Des données incorrectes peuvent conduire à des résultats incorrects. Des données trop limitées peuvent empêcher un modèle de reconnaître des situations différentes. Des données qui représentent mal certaines catégories peuvent produire des résultats injustes.

Avant d’utiliser un jeu de données, il faut donc se demander :
1. D’où viennent les informations ?
2. Sont-elles exactes ?
3. Sont-elles suffisamment variées ?
4. A-t-on le droit de les utiliser ?
5. Contiennent-elles des informations personnelles ?

## 5. Modèle, entraînement et prédiction

Un **modèle** est un système informatique qui contient des paramètres appris ou définis et qui transforme une entrée en résultat.

Dans l’apprentissage automatique, l’entraînement est le processus pendant lequel le modèle ajuste ses paramètres à partir d’exemples.

### Les trois grandes étapes

**1. Préparer les données**

On rassemble des exemples adaptés à la tâche. On vérifie leur qualité et on les organise.

**2. Entraîner le modèle**

Un algorithme utilise les exemples pour ajuster les paramètres du modèle. Le but est de réduire les erreurs sur la tâche étudiée.

**3. Utiliser le modèle**

On lui donne une nouvelle entrée. Il produit une sortie : une catégorie, une estimation, un texte ou un autre résultat.

Le moment où le modèle traite une nouvelle entrée est souvent appelé **inférence**.

### Entraînement et utilisation ne sont pas la même chose

Entraîner un modèle peut demander beaucoup de données, de temps et de puissance de calcul. Utiliser un modèle déjà entraîné peut être beaucoup moins coûteux, même si cela dépend de sa taille et de l’appareil.

Un utilisateur qui pose une question à un assistant ne réentraîne généralement pas le modèle complet à chaque message. Il lui fournit une entrée pour qu’il génère une réponse.

## 6. Comment une IA générative répond-elle à une demande ?

Une IA générative reçoit une entrée, appelée souvent **prompt** ou consigne. Elle traite cette demande avec son modèle et produit une sortie.

Pour un modèle de langage, le texte est traité sous forme de petits éléments appelés **tokens**. Un token peut correspondre à un mot, une partie de mot ou un signe. La découpe dépend du modèle.

Le modèle calcule ensuite des possibilités et génère progressivement la suite du texte. La réponse peut paraître naturelle, mais elle reste une production du modèle.

### Exemple de demande imprécise

« Explique Python. »

Cette demande est très large. Le résultat peut être trop long, trop technique ou trop général.

### Exemple de demande plus utile

« Explique ce qu’est une variable en Python à un débutant. Utilise une comparaison simple, trois exemples courts et un exercice avec sa correction. »

La seconde demande précise :
- le sujet ;
- le niveau ;
- le style d’explication ;
- le nombre d’exemples ;
- le travail attendu.

## 7. Bien formuler une consigne — le prompt

Un prompt est une instruction donnée à un modèle. Une bonne consigne réduit les ambiguïtés.

Tu peux utiliser cette méthode en cinq parties :

1. **Rôle :** quel type d’aide souhaites-tu ?
2. **Objectif :** que doit produire le modèle ?
3. **Contexte :** quelles informations doit-il connaître ?
4. **Contraintes :** quelle longueur, quel niveau et quel format ?
5. **Vérification :** que doit-il signaler en cas d’incertitude ?

### Exemple complet

« Agis comme un professeur d’informatique pour débutant. Explique la différence entre un programme classique et un système d’apprentissage automatique. Utilise des mots simples, deux exemples de la vie quotidienne et un tableau comparatif. Si une notion est simplifiée, précise-le. Termine par trois questions de révision. »

Il ne suffit pas de rendre une demande longue. Il faut surtout qu’elle soit claire et pertinente.

## 8. Les limites : une IA peut se tromper

Une réponse bien écrite n’est pas forcément exacte.

Un modèle peut :
- inventer une information ;
- mélanger deux notions ;
- produire un calcul incorrect ;
- donner une réponse dépassée ;
- mal interpréter une consigne ;
- reproduire des biais présents dans ses données ;
- manquer de contexte.

Une réponse inventée présentée comme un fait est souvent appelée **hallucination** dans le domaine des modèles génératifs.

### Comment vérifier une réponse ?

- Vérifie les nombres et les calculs.
- Compare les affirmations importantes avec des documents fiables.
- Demande la méthode ou les étapes, pas seulement le résultat.
- Vérifie la date des informations lorsqu’elles peuvent changer.
- N’envoie pas de mot de passe, de clé privée ou de document personnel sensible dans un service que tu ne connais pas.
- Demande une explication si une réponse est contradictoire.

L’IA peut aider à apprendre, mais elle ne remplace pas automatiquement la réflexion, les sources fiables et la vérification.

## 9. Biais, vie privée et utilisation responsable

Un biais est une tendance systématique qui peut fausser les résultats d’un système. Il peut venir des données, de la manière de les collecter, du choix des catégories ou de la conception du modèle.

Exemple : si un système est entraîné avec des exemples qui représentent surtout une seule situation, il peut être moins performant dans d’autres situations.

La protection des données est aussi essentielle. Une photographie, une adresse, un numéro de téléphone ou un document scolaire peuvent être des informations personnelles.

Avant d’utiliser un service d’IA :
- lis ses règles de confidentialité lorsqu’elles sont disponibles ;
- évite de transmettre des données personnelles inutiles ;
- demande l’autorisation avant d’utiliser les données d’une autre personne ;
- respecte les droits d’auteur et les licences ;
- garde une personne responsable dans les décisions importantes.

## 10. Évaluer un système d’IA

Pour savoir si un modèle est utile, on ne se contente pas de regarder une seule bonne réponse.

On prépare des exemples de test que le modèle n’a pas utilisés pendant l’entraînement. On compare ses résultats aux réponses attendues.

Quelques questions :
- Le modèle est-il souvent correct ?
- Quelles erreurs fait-il ?
- Fonctionne-t-il sur des exemples variés ?
- Est-il rapide ?
- Quelle quantité de mémoire utilise-t-il ?
- Est-il adapté à la tâche ?

### Exemple de classification

Supposons qu’un système classe des messages dans deux catégories : « important » et « non important ». On teste le modèle sur 100 messages déjà vérifiés.

Le nombre de bonnes réponses donne une première indication, mais il faut également regarder le type d’erreurs. Confondre une annonce ordinaire et un message urgent peut avoir des conséquences différentes selon l’usage.

## 11. Mini-atelier : créer une classification simple sans modèle d’IA

Cet atelier montre une différence importante : un programme à règles peut classer du texte, mais cela ne signifie pas qu’il a appris comme un modèle de Machine Learning.

Dans Pydroid 3 ou un autre environnement Python, essaie ce programme :

~~~python
message = "Une réunion importante est prévue demain"

mots_importants = ["important", "urgent", "réunion"]

message_minuscule = message.lower()
est_important = False

for mot in mots_importants:
    if mot in message_minuscule:
        est_important = True

if est_important:
    print("Ce message semble important.")
else:
    print("Ce message semble ordinaire.")
~~~

Le programme cherche des mots précis. Il ne comprend pas réellement le sens complet de la phrase et peut se tromper.

### Expériences à réaliser

1. Remplace le message par « Bonjour, comment vas-tu ? ».
2. Essaie « Ce message n'est pas important ».
3. Ajoute un mot dans la liste.
4. Explique pourquoi ce programme peut se tromper.

Cette expérience est utile parce qu'elle te permet de voir ce qu'est une règle écrite par le développeur.

## 12. Exercices progressifs

Fais les exercices avant de consulter les corrections.

### Exercice 1 — Définir l’IA

Explique en deux ou trois phrases ce qu’est l’intelligence artificielle. Donne un exemple d’utilisation dans une application.

### Exercice 2 — IA ou automatisation ?

Classe ces situations :
- une alarme se déclenche tous les jours à 7 h ;
- une application reconnaît la parole ;
- un programme affiche « batterie faible » quand le niveau passe sous 20 % ;
- un modèle estime le prix d’un logement à partir de nombreux exemples.

Explique tes choix.

### Exercice 3 — Les notions

Associe chaque terme à sa définition :
- Donnée
- Modèle
- Entraînement
- Inférence
- Prompt

Définitions : nouvelle entrée traitée par le modèle ; information enregistrée ; instruction fournie au modèle ; système qui transforme une entrée en résultat ; processus qui ajuste le modèle à partir d’exemples.

### Exercice 4 — Vérifier une réponse

Un assistant affirme : « Toutes les IA apprennent seules en observant Internet en temps réel. »

Explique pourquoi cette affirmation est fausse ou trop générale. Donne une formulation plus correcte.

### Exercice 5 — Construire une bonne consigne

Écris un prompt qui demande une explication sur les réseaux de neurones pour un débutant de collège. Il doit demander une comparaison simple, deux exemples et un petit exercice.

## 13. Mini-défi — Imaginer un assistant pédagogique

Imagine un assistant destiné à aider un élève à réviser ses cours.

Écris une petite fiche contenant :
1. son objectif principal ;
2. les informations qu’il reçoit ;
3. les types de réponses qu’il peut produire ;
4. deux limites possibles ;
5. trois règles de protection des données ;
6. une méthode pour vérifier la qualité de ses réponses.

Ne cherche pas à créer immédiatement un grand modèle. Commence par définir clairement le problème et les résultats attendus.

## 14. Corrections et explications

### Correction de l’exercice 1

L’intelligence artificielle regroupe des techniques informatiques permettant à un système d’effectuer certaines tâches complexes à partir d’informations et de modèles. Un exemple est la reconnaissance vocale qui transforme une parole en texte.

D’autres exemples sont possibles : traduction, reconnaissance d’image, recommandation ou génération de texte.

### Correction de l’exercice 2

- L’alarme à heure fixe est une automatisation classique.
- La reconnaissance de parole peut utiliser un modèle d’IA.
- L’alerte de batterie est généralement une règle classique.
- L’estimation du prix à partir d’exemples peut utiliser le Machine Learning.

Une application peut toutefois mélanger plusieurs méthodes.

### Correction de l’exercice 3

- **Donnée :** information enregistrée.
- **Modèle :** système qui transforme une entrée en résultat.
- **Entraînement :** processus qui ajuste un modèle à partir d’exemples.
- **Inférence :** traitement d’une nouvelle entrée par un modèle déjà préparé.
- **Prompt :** instruction fournie au modèle.

### Correction de l’exercice 4

L’affirmation est trop générale. Certains systèmes sont entraînés sur des données préparées à l’avance. D’autres peuvent utiliser des sources externes au moment de répondre. Un modèle ne consulte pas automatiquement Internet en temps réel.

Une phrase plus correcte serait : « Les systèmes d’IA utilisent différentes méthodes et différentes sources de données. Certains modèles peuvent être connectés à des outils externes, mais ce n’est pas une capacité universelle. »

### Exemple de correction de l’exercice 5

« Explique les réseaux de neurones artificiels à un élève débutant. Utilise une comparaison simple, deux exemples concrets et un petit exercice avec la correction. Définis les mots techniques avant de les utiliser. »

## 15. Fiche de révision et validation

| Notion | À retenir |
|---|---|
| Intelligence artificielle | Techniques permettant à un programme de réaliser certaines tâches complexes |
| Machine Learning | Apprentissage de régularités à partir d’exemples |
| Deep Learning | Apprentissage avec des réseaux de neurones à plusieurs couches |
| Donnée | Information utilisée par un système |
| Modèle | Système qui transforme une entrée en résultat |
| Entraînement | Ajustement du modèle à partir d’exemples |
| Inférence | Utilisation du modèle sur une nouvelle entrée |
| Prompt | Instruction fournie à un modèle |
| Hallucination | Information fausse ou inventée présentée comme une réponse |
| Biais | Tendance qui peut fausser les résultats |

Avant de passer à la leçon suivante, vérifie que tu peux :
- distinguer IA et automatisation ;
- expliquer les notions de données et modèle ;
- décrire simplement l’entraînement et l’inférence ;
- écrire une consigne claire ;
- citer au moins trois limites d’une IA ;
- expliquer pourquoi une réponse importante doit être vérifiée.

**À retenir :** une IA est un outil construit par des personnes. Pour bien l’utiliser, il faut comprendre son objectif, ses données, ses limites et les moyens de contrôler ses résultats.

---

*Académique — Intelligence artificielle, leçon 01. Contenu pédagogique original en français.*  
*©pythonschool*
