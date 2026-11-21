# Intelligence artificielle — Leçon 02 : Données et préparation d’un jeu de données

**Parcours :** Intelligence artificielle  
**Numéro :** 02  
**Niveau :** Débutant  
**Durée indicative :** 60 à 75 minutes  
**Matériel :** Téléphone ou ordinateur ; Python facultatif pour les exemples.  
**Prérequis :** Leçon 01 : familles de l’IA, données, modèles, entraînement, inférence et limites.

## 1. Objectifs et prérequis

Dans la première leçon, tu as découvert que de nombreux systèmes d’intelligence artificielle utilisent des données. Cette leçon va approfondir cette idée : avant d’entraîner un modèle, il faut comprendre les informations disponibles et les préparer correctement.

À la fin de cette leçon, tu sauras :
- expliquer ce qu’est un jeu de données ;
- distinguer une observation, une caractéristique et une étiquette ;
- reconnaître des données numériques, textuelles et catégorielles ;
- repérer les valeurs manquantes, les doublons et les incohérences ;
- expliquer pourquoi les données doivent être séparées avant l’évaluation ;
- reconnaître une fuite de données et un biais ;
- distinguer une règle écrite à la main d’un modèle entraîné ;
- décrire un petit processus de préparation de données.

Aucun modèle payant ni service en ligne n’est requis. Les exemples utilisent des données fictives.

## 2. Pourquoi les données sont-elles importantes ?

Une donnée est une information représentée sous une forme que le programme peut stocker et traiter. Cela peut être un nombre, un mot, une date, une image ou une mesure.

Analogie : imagine un cuisinier qui prépare une recette. Les données sont les ingrédients. Même avec une bonne recette, des ingrédients abîmés ou mal identifiés peuvent donner un mauvais résultat. De la même façon, un modèle ne peut pas compenser automatiquement toutes les erreurs présentes dans ses données.

Les données ne rendent pas un système intelligent par elles-mêmes. Il faut aussi :
- définir le problème ;
- choisir une méthode adaptée ;
- préparer les informations ;
- entraîner ou configurer le système ;
- mesurer ses résultats ;
- surveiller ses limites.

Un grand nombre de données n’est pas toujours meilleur. Des données pertinentes, compréhensibles et représentatives valent souvent mieux qu’un énorme ensemble mal préparé.

## 3. Qu’est-ce qu’un jeu de données ?

Un jeu de données, ou dataset, est un ensemble organisé d’informations qui sert à étudier un problème ou à construire un système.

On le représente souvent sous forme de tableau :
- chaque ligne correspond à une observation ;
- chaque colonne décrit une caractéristique ;
- une colonne peut contenir la réponse attendue, appelée étiquette, lorsque le problème est supervisé.

Exemple fictif :

| Objet | Couleur | Masse en grammes | Catégorie |
|---|---|---:|---|
| A | jaune | 120 | banane |
| B | rouge | 150 | pomme |
| C | jaune | 135 | banane |
| D | vert | 145 | pomme |

Chaque ligne décrit un objet. Les colonnes Couleur et Masse sont des informations descriptives. La colonne Catégorie contient la réponse que l’on souhaite parfois apprendre à prédire.

Ce petit tableau est seulement un exemple pédagogique. Il est trop petit pour construire un modèle fiable dans le monde réel.

## 4. Observation, caractéristique et étiquette

Une observation est un élément décrit dans le jeu de données. Dans le tableau précédent, l’objet A est une observation.

Une caractéristique, aussi appelée feature, est une information utilisée pour décrire une observation. La couleur et la masse sont des caractéristiques.

Une étiquette, ou label, est la réponse attendue dans un problème d’apprentissage supervisé. Ici, la catégorie du fruit joue ce rôle.

Il faut bien distinguer ces éléments :
- observation : l’objet étudié ;
- caractéristiques : ce que l’on connaît sur cet objet ;
- étiquette : la réponse que l’on veut prédire.

Exemple de question : « À quelle catégorie appartient cet objet ? »

Entrée du modèle : couleur = jaune, masse = 120 grammes.  
Sortie attendue : banane.

Si l’étiquette est absente, le système ne peut pas apprendre cette réponse par apprentissage supervisé de la même manière. D’autres méthodes existent, comme l’apprentissage non supervisé, qui cherche des groupes ou des structures sans étiquette fournie.

## 5. Les différents types de données

Les données peuvent prendre plusieurs formes.

### Données numériques

Ce sont des nombres que l’on peut mesurer ou compter : masse, durée, distance ou quantité. Il faut vérifier l’unité. Une masse de 120 grammes n’est pas la même chose que 120 kilogrammes.

### Données catégorielles

Elles représentent des catégories : couleur, type d’objet ou état d’un appareil. Les catégories ne sont pas nécessairement des nombres.

### Données textuelles

Elles contiennent des mots, des phrases ou des documents. Un système peut devoir les découper ou les transformer avant de les analyser.

### Images, sons et vidéos

Ces données contiennent beaucoup d’informations. Elles peuvent nécessiter des formats, des tailles et des traitements adaptés.

Un point important : transformer une catégorie en nombre ne signifie pas automatiquement que ce nombre possède un sens mathématique. Si rouge = 1, vert = 2 et bleu = 3, cela ne veut pas dire que bleu est trois fois plus grand que rouge.

## 6. Collecter les données de façon responsable

Avant de collecter une information, demande-toi pourquoi elle est nécessaire. Il faut limiter la collecte à ce qui sert réellement au projet.

Bonnes pratiques :
- expliquer clairement l’objectif de la collecte ;
- demander l’autorisation lorsque c’est nécessaire ;
- respecter les règles applicables et les paramètres de confidentialité ;
- éviter les informations personnelles inutiles ;
- protéger les fichiers et limiter les personnes qui peuvent les consulter ;
- supprimer les données lorsqu’elles ne sont plus nécessaires, selon les règles du projet.

Pour apprendre, utilise des données fictives ou des jeux de données publics dont les conditions d’utilisation sont claires. Ne publie pas des conversations privées, des photos de personnes ou des informations sensibles pour entraîner un modèle de démonstration.

Un jeu de données peut être techniquement exploitable tout en étant inapproprié à utiliser. La qualité technique ne remplace pas le respect des personnes.

## 7. Vérifier la qualité des données

Un jeu de données peut contenir plusieurs problèmes.

### Valeurs manquantes

Une case vide peut signifier que l’information n’a pas été mesurée, qu’elle a été oubliée ou qu’elle n’existe pas.

### Doublons

Une même observation peut être enregistrée plusieurs fois. Cela peut donner trop d’importance à un exemple.

### Incohérences

Une masse peut être exprimée tantôt en grammes, tantôt en kilogrammes. Une date peut être écrite dans plusieurs formats. Il faut harmoniser les représentations.

### Erreurs de saisie

Une valeur de couleur « jaun » au lieu de « jaune » peut créer une catégorie inattendue. Une valeur négative peut être impossible selon la mesure.

### Valeurs extrêmes

Une valeur très différente des autres n’est pas toujours fausse. Elle peut représenter un cas rare ou une erreur. Il faut l’examiner avant de la supprimer.

Ne supprime pas automatiquement toutes les lignes qui semblent différentes. Chaque correction doit avoir une justification.

## 8. Nettoyer et transformer les données

Le nettoyage consiste à repérer et traiter les problèmes connus. La transformation adapte les données au format attendu par la méthode choisie.

Exemples :
- retirer un doublon confirmé ;
- uniformiser les unités ;
- corriger une faute lorsque la source permet de connaître la bonne valeur ;
- signaler une valeur manquante ;
- convertir un nombre stocké sous forme de texte ;
- vérifier que chaque ligne possède les champs obligatoires.

Petit exemple en Python :

~~~python
objets = [
    {"couleur": "jaune", "masse": 120},
    {"couleur": "rouge", "masse": 150},
    {"couleur": "jaune", "masse": 135},
]

for objet in objets:
    if "couleur" in objet and "masse" in objet:
        print(objet["couleur"], objet["masse"])
~~~

Ce code vérifie la présence de deux clés avant d’afficher les valeurs. Il ne réalise pas un entraînement de modèle : il montre simplement comment parcourir des données structurées.

Un nettoyage doit être reproductible. Note les règles appliquées afin de pouvoir expliquer comment tu es passé des données originales aux données préparées.

## 9. Séparer entraînement, validation et test

Pour évaluer un modèle, il ne faut pas seulement mesurer sa performance sur les exemples qu’il a déjà utilisés pour apprendre.

On sépare souvent les données en plusieurs parties :

- entraînement : sert à ajuster les paramètres du modèle ;
- validation : aide à choisir les réglages et comparer des variantes ;
- test : sert à estimer la performance finale sur des exemples gardés à part.

Analogie : apprendre avec des exercices, s’entraîner avec un devoir de préparation, puis passer une évaluation différente. Si tu relis exactement les réponses du test avant l’évaluation, le résultat ne mesure plus correctement ce que tu sais faire.

Exemple de séparation très simple, uniquement pour comprendre le principe :

~~~python
donnees = ["A", "B", "C", "D", "E", "F"]

entrainement = donnees[:4]
test = donnees[4:]

print("Entraînement :", entrainement)
print("Test :", test)
~~~

Cette découpe par position est pédagogique, pas une méthode universelle. Dans un vrai projet, la séparation doit être adaptée à la taille du jeu de données, à l’ordre temporel et aux catégories. Si les exemples sont déséquilibrés, il faut éviter de placer presque toutes les observations d’une catégorie dans une seule partie.

## 10. Comprendre la fuite de données

Une fuite de données, ou data leakage, se produit lorsqu’une information qui ne devrait pas être disponible pendant l’apprentissage ou la prédiction influence le modèle.

Exemple : tu veux prévoir si un colis sera livré en retard. Tu utilises par erreur une colonne « date réelle de livraison » pour entraîner le modèle, alors que cette information ne sera connue qu’après la livraison. Le modèle obtient un résultat artificiellement excellent, mais il ne pourra pas l’utiliser au moment de la prédiction.

Autre exemple : tu sépares les données après avoir calculé une transformation qui utilise les statistiques de tout le jeu, y compris le test. Selon la transformation, cela peut transmettre des informations du test vers l’entraînement.

Pour éviter la fuite :
1. identifie les informations disponibles au moment réel de la prédiction ;
2. sépare les données au bon moment ;
3. ajuste les transformations uniquement sur l’ensemble d’entraînement lorsque c’est nécessaire ;
4. applique ensuite les mêmes transformations aux autres ensembles ;
5. conserve le test à part jusqu’à l’évaluation finale.

Un score très élevé doit être examiné. Il peut être réel, mais il peut aussi révéler une fuite ou une erreur de mesure.

## 11. Représentativité, biais et équilibre

Un jeu de données est représentatif lorsqu’il reflète suffisamment les situations sur lesquelles le système sera utilisé.

Si un modèle de reconnaissance d’objets n’a été entraîné qu’avec des photos prises en plein soleil, il peut être moins fiable avec des images sombres. Le problème ne vient pas nécessairement du code : les exemples ne couvrent pas assez de situations.

Un biais peut apparaître lorsque certaines catégories sont absentes, trop nombreuses ou mesurées différemment. Les résultats peuvent alors favoriser certains cas et mal traiter d’autres.

Pour examiner un jeu de données :
- compte les observations par catégorie ;
- compare les conditions de collecte ;
- cherche les groupes absents ;
- vérifie les unités et les méthodes de mesure ;
- teste le système sur des cas différents de ceux qui ont servi à l’entraînement.

L’équilibre parfait n’est pas toujours nécessaire ni possible. Ce qui compte est de comprendre les limites et de vérifier les conséquences sur les personnes ou les usages concernés.

## 12. Règles, Machine Learning et IA générative : ne pas confondre

Les trois approches ne fonctionnent pas de la même façon.

### Système à règles

Une personne écrit explicitement les conditions. Exemple : « si la masse dépasse 100 et la couleur est jaune, proposer banane ». Le programme suit les règles écrites. Il n’apprend pas automatiquement à partir des exemples.

### Machine Learning

Un algorithme ajuste un modèle à partir de données. Le modèle apprend des régularités statistiques et peut ensuite produire une prédiction sur une nouvelle entrée. Il peut se tromper si les données sont insuffisantes ou différentes de celles rencontrées pendant l’entraînement.

### IA générative

Un modèle génératif produit du contenu, par exemple du texte, une image ou du son. Il apprend des régularités dans de grands ensembles de données et génère une sortie en fonction d’une entrée et de son contexte.

Une règle écrite à la main n’est pas un modèle entraîné. Un modèle qui classe une catégorie n’est pas automatiquement un modèle génératif. Il faut nommer correctement la méthode pour comprendre ce qu’elle peut faire.

## 13. Mesurer les résultats d’une classification

Une classification attribue une catégorie à une observation. Pour évaluer le résultat, on compare les prédictions aux réponses connues.

Exemple fictif sur dix observations :

| Résultat | Nombre |
|---|---:|
| Vrais positifs (TP) | 4 |
| Faux positifs (FP) | 1 |
| Faux négatifs (FN) | 2 |
| Vrais négatifs (TN) | 3 |

- Vrai positif : le modèle prédit la catégorie recherchée et il a raison.
- Faux positif : il annonce cette catégorie alors que ce n’est pas le cas.
- Faux négatif : il manque un cas qui appartenait à la catégorie.
- Vrai négatif : il reconnaît correctement un cas qui n’appartient pas à la catégorie.

Trois mesures simples :

- Exactitude (accuracy) : part de toutes les prédictions correctes. Ici, (4 + 3) / 10 = 0,70, soit 70 %.
- Précision (precision) : parmi les prédictions positives, quelle part est correcte ? Ici, 4 / (4 + 1) = 0,80, soit 80 %.
- Rappel (recall) : parmi les vrais cas positifs, quelle part a été trouvée ? Ici, 4 / (4 + 2), soit environ 66,7 %.

Aucune mesure ne suffit dans tous les contextes. Une bonne évaluation dépend du coût des erreurs et de l’objectif du système.

## 14. Mini-projet — Préparer un jeu de données de fruits

Tu vas concevoir un petit jeu de données fictif pour classer des fruits. L’objectif n’est pas de construire un modèle fiable, mais d’apprendre à organiser et vérifier les exemples.

Ton tableau doit contenir :
- un identifiant unique ;
- une couleur ;
- une masse en grammes ;
- une catégorie attendue.

Étapes :
1. crée au moins huit observations fictives ;
2. vérifie que chaque observation possède les quatre champs ;
3. repère les lignes répétées ;
4. vérifie que la masse est un nombre positif ;
5. compte les exemples de chaque catégorie ;
6. réserve quelques observations pour un test ;
7. écris les limites de ton petit jeu de données.

Exemple de règle écrite à la main : « si couleur vaut jaune, proposer banane ». Cette règle est un système à règles, pas un modèle entraîné. Elle peut échouer pour un fruit jaune qui n’est pas une banane. Cette erreur montre pourquoi plusieurs caractéristiques peuvent être nécessaires.

## 15. Exercices, corrigés expliqués et fiche de révision

### Exercice 1 — Identifier les éléments

Dans une ligne qui contient couleur = rouge, masse = 150 et catégorie = pomme, indique l’observation, les caractéristiques et l’étiquette.

### Exercice 2 — Repérer un problème

Un tableau contient deux lignes identiques et une masse notée « cent ». Quels problèmes vois-tu ? Propose une vérification pour chacun.

### Exercice 3 — Séparer les données

Tu as 100 observations. Explique pourquoi il ne faut pas mesurer la performance uniquement sur les observations utilisées pour l’entraînement.

### Exercice 4 — Détecter une fuite

Un modèle prévoit si un colis sera en retard. Il reçoit comme caractéristique la date réelle de livraison. Explique pourquoi cela pose problème.

### Exercice 5 — Distinguer les méthodes

Classe ces systèmes : un programme avec une liste de règles écrites à la main ; un modèle entraîné sur des exemples étiquetés ; un modèle qui rédige un résumé. Explique brièvement.

### Corrections expliquées

**Exercice 1 :** l’observation est la ligne décrivant un objet. Les caractéristiques sont couleur et masse. L’étiquette est catégorie = pomme.

**Exercice 2 :** les deux lignes identiques peuvent être des doublons ; il faut vérifier si elles représentent réellement deux objets distincts. « cent » est du texte alors que la colonne attend une masse numérique. Il faut retrouver la mesure originale avant de corriger.

**Exercice 3 :** le modèle peut mémoriser les exemples d’entraînement. Un ensemble de test séparé donne une estimation plus honnête de sa capacité à traiter de nouvelles observations.

**Exercice 4 :** la date réelle n’est pas connue au moment où l’on doit prévoir le retard. Le modèle reçoit une information future : c’est une fuite de données.

**Exercice 5 :** la liste de conditions est un système à règles ; le modèle ajusté sur des exemples est du Machine Learning ; le modèle qui rédige un résumé relève de l’IA générative.

### Exemple de contrôle de données en Python

~~~python
donnees = [
    {"couleur": "jaune", "masse": 120, "categorie": "banane"},
    {"couleur": "rouge", "masse": 150, "categorie": "pomme"},
    {"couleur": "jaune", "masse": 135, "categorie": "banane"},
]

for index, ligne in enumerate(donnees, start=1):
    champs_presents = (
        "couleur" in ligne
        and "masse" in ligne
        and "categorie" in ligne
    )

    if not champs_presents:
        print("Ligne incomplète :", index)
    elif not isinstance(ligne["masse"], (int, float)):
        print("Masse non numérique :", index)
    elif ligne["masse"] <= 0:
        print("Masse non positive :", index)
    else:
        print("Ligne valide :", index)
~~~

Ce programme contrôle quelques règles simples. Il ne détecte pas tous les problèmes et ne remplace pas une vérification humaine.

### Fiche de révision

| Terme | Définition courte |
|---|---|
| Donnée | Information stockée et traitée |
| Dataset | Ensemble organisé de données |
| Observation | Une ligne ou un exemple |
| Feature | Caractéristique descriptive |
| Label | Réponse attendue |
| Nettoyage | Traitement des erreurs et incohérences |
| Entraînement | Ajustement d’un modèle |
| Validation | Aide au choix des réglages |
| Test | Évaluation sur des exemples gardés à part |
| Fuite | Information indue qui influence l’apprentissage |
| Biais | Distorsion pouvant fausser les résultats |
| Inférence | Utilisation d’un modèle sur une nouvelle entrée |

**Validation avant la leçon 03 :** tu dois pouvoir décrire un dataset, identifier ses caractéristiques et ses étiquettes, proposer un contrôle de qualité et expliquer pourquoi le test doit rester séparé.

**Prochaine étape :** découvrir comment un algorithme de Machine Learning apprend une relation à partir d’exemples.

---

*Académique — Intelligence artificielle, leçon 02.*  
*©pythonschool*