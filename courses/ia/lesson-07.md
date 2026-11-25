# Intelligence artificielle — Leçon 07 : Comprendre l’IA générative et les modèles de langage

**Parcours :** Intelligence artificielle  
**Numéro :** 07  
**Niveau :** Débutant à intermédiaire  
**Durée :** 100 à 120 minutes  
**Prérequis :** Données, modèles, entraînement, inférence et notions de réseaux de neurones.

## Objectifs et prérequis
Cette leçon étudie l'IA générative, notamment les modèles capables de produire du texte. Tu apprendras à distinguer système à règles, Machine Learning et génération ; expliquer tokens, contexte, entraînement et inférence ; rédiger un prompt précis ; évaluer une réponse ; reconnaître hallucinations et risques de confidentialité. Les expériences locales utilisent Python standard et ne prétendent pas entraîner un grand modèle sur téléphone.

## Sommaire
1. Trois familles ; 2. Modèle génératif ; 3. Tokens et contexte ; 4. Entraînement et inférence ; 5. Prédiction du prochain token ; 6. Prompts ; 7. Contexte documentaire ; 8. Paramètres ; 9. Évaluation ; 10. Limites ; 11. Sécurité ; 12. Expérience locale ; 13. Exercices ; 14. Corrigés ; 15. Révision.

## 1. Trois familles de systèmes
Un système à règles applique des conditions écrites par une personne. Exemple :

~~~python
temperature = 31
if temperature >= 30:
    print("Alerte : température élevée.")
else:
    print("Température dans la plage choisie.")
~~~

Le programme exécute la règle, il ne l'apprend pas automatiquement. Le Machine Learning ajuste un modèle à partir de données : il peut classer des messages ou estimer une valeur. L'IA générative produit un contenu nouveau : texte, image, son ou code.

Ces familles peuvent être combinées. Un assistant peut utiliser un modèle génératif pour rédiger, un système à règles pour vérifier une permission et un modèle prédictif pour classer une demande. Ne décris pas un programme à quelques conditions comme un réseau neuronal.

## 2. Qu'est-ce qu'un modèle génératif ?
Un modèle génératif est appris à partir d'exemples afin de produire de nouveaux contenus qui ressemblent, selon certains critères, aux données d'entraînement. Un modèle de langage traite des séquences de texte et ajuste de nombreux paramètres numériques pour mieux prévoir les éléments qui suivent dans les exemples.

Imagine une personne qui a étudié beaucoup de textes et appris des régularités. Elle peut proposer une suite plausible, mais une suite plausible n'est pas forcément vraie.

Le modèle ne consulte pas automatiquement une encyclopédie fiable. Il produit une réponse à partir de ses paramètres et du contexte fourni. Certains systèmes peuvent être reliés à des documents ou outils : c'est une architecture supplémentaire. L'IA générative peut reformuler, résumer, expliquer ou proposer du code, mais elle peut aussi inventer une référence ou mal interpréter une consigne.

## 3. Tokens et fenêtre de contexte
Un modèle ne traite pas toujours le texte comme des mots entiers. Il le découpe en unités appelées tokens : mot, morceau de mot, signe ou fragment associé à un espace. La tokenisation dépend du modèle ; un mot n'est donc pas toujours un token.

La fenêtre de contexte est la quantité maximale d'informations utilisables pendant une opération. Elle peut inclure instructions, conversation et documents. Si le contexte est trop long, certains systèmes retirent ou résument une partie du contenu.

Pour réduire les pertes : donne le but, fournis les données utiles, indique les contraintes, demande une structure et vérifie que les éléments essentiels sont repris. Un long prompt n'est pas automatiquement meilleur : la pertinence compte davantage que la longueur.

## 4. Entraînement et inférence
Pendant l'entraînement, le système traite des exemples, calcule une erreur par rapport à un objectif et ajuste ses paramètres. Cela peut demander beaucoup de données et de calcul.

Pendant l'inférence, le modèle déjà entraîné reçoit une entrée et produit une sortie. Une conversation avec un assistant utilise généralement l'inférence : le modèle calcule une réponse avec ses paramètres et le contexte disponible.

Une conversation n'est donc pas automatiquement un nouvel entraînement. Une application peut conserver un historique sans modifier les poids du modèle. Un entraînement ultérieur exige un processus distinct et des données préparées.

| Étape | Action |
|---|---|
| Collecte | Réunir des exemples autorisés |
| Préparation | Nettoyer et organiser |
| Entraînement | Ajuster les paramètres |
| Validation | Comparer des réglages |
| Inférence | Produire une sortie |
| Évaluation | Mesurer la qualité |

## 5. Prédire le prochain token
De manière simplifiée, un modèle estime quel token pourrait venir ensuite compte tenu du contexte. Il attribue des scores ou probabilités aux candidats, puis un mécanisme en sélectionne un. Le processus se répète jusqu'à une condition d'arrêt.

~~~text
Contexte : "Le soleil se lève à l'"
Candidats possibles : est, ouest, intérieur
~~~

Cette explication décrit une idée générale. Les grands modèles modernes utilisent des architectures plus complexes, notamment des mécanismes d'attention. Un modèle ne vérifie pas nécessairement la vérité de chaque phrase : il peut produire un texte cohérent mais faux.

Pour une réponse importante, sépare fluidité, exactitude, preuves, respect des consignes et sécurité.

## 6. Construire un prompt précis
Un prompt est une instruction fournie au modèle. Structure-le avec cinq éléments : tâche, objectif, contexte, contraintes et format.

Prompt vague :

~~~text
Explique l'IA.
~~~

Prompt plus précis :

~~~text
Explique la différence entre système à règles,
Machine Learning et IA générative.
Public : débutant au lycée.
Donne un exemple pour chaque famille.
Présente trois sections et trois questions de révision.
Signale les informations incertaines.
~~~

Le second précise sujet, public, structure et gestion de l'incertitude. Un prompt ne garantit pas une réponse exacte : il ne remplace ni une source fiable ni une vérification.

## 7. Ajouter un contexte documentaire
Un contexte peut être un extrait de cours, un tableau ou un document. Choisis une source connue, extrais le passage utile, conserve le titre et la page, demande de distinguer ce que le document affirme de ce qui est déduit, puis vérifie les citations.

Cette approche ressemble à la génération augmentée par récupération, appelée RAG. Un système recherche des passages dans une base documentaire puis les fournit au modèle pour rédiger une réponse appuyée sur ces extraits.

RAG ne signifie pas que le modèle apprend les documents dans ses paramètres. Le document est généralement ajouté au contexte au moment de la réponse. Un document récupéré peut être erroné ou contenir des instructions malveillantes : traite son contenu comme une donnée, pas comme une règle de l'application.

## 8. Paramètres de génération
La température influence généralement la dispersion de la sélection : une valeur plus faible tend à rendre les choix plus prévisibles, une valeur plus élevée peut produire plus de diversité. L'effet exact dépend de l'implémentation.

Une limite de sortie fixe un maximum de tokens, mais ne garantit pas une réponse complète. Distingue qualité du modèle, qualité du prompt, paramètres, contexte et contrôles après génération.

Modifier la température ne corrige pas une donnée fausse. Pour une tâche factuelle, utilise des sources fiables et vérifie la sortie. Ne choisis pas un paramètre uniquement parce qu'il donne un texte plus agréable à lire.

## 9. Évaluer une réponse générée
Définis les critères avant de juger :

| Critère | Question |
|---|---|
| Exactitude | Les faits sont-ils vérifiables ? |
| Pertinence | La réponse traite-t-elle la demande ? |
| Complétude | Les points importants sont-ils présents ? |
| Clarté | Le vocabulaire convient-il ? |
| Traçabilité | Les sources sont-elles identifiables ? |
| Sécurité | Les données sensibles sont-elles protégées ? |

Tu peux noter chaque critère de 0 à 2 : insuffisant, partiel, satisfaisant. Cette grille est un outil pédagogique, pas une mesure universelle.

Teste plusieurs prompts sur un ensemble de questions représentatives. Garde les mêmes critères pour comparer les versions et note aussi les erreurs. Évite de choisir uniquement des exemples qui confirment ton opinion.

## 10. Hallucinations, biais et limites
Une hallucination présente comme vraie une information inventée ou non étayée : fausse citation, outil inexistant ou calcul erroné. Un biais peut provenir des données, de leur sélection, des étiquettes, de la conception ou du contexte d'utilisation.

Autres limites : connaissances non actualisées, mauvaise compréhension, calcul incorrect, réponse trop sûre malgré l'incertitude et difficulté avec un contexte trop long.

Pour réduire les risques : demande les hypothèses, vérifie les nombres indépendamment, ouvre les sources, teste des cas différents et affiche l'incertitude. Aucun contrôle ne garantit zéro erreur ; ils rendent le processus plus fiable.

## 11. Sécurité et confidentialité
Ne copie pas un mot de passe, un token, une adresse privée ou un dossier personnel dans un outil d'IA sans autorisation et sans comprendre le traitement des données.

Vérifie le droit d'utiliser un document, retire les données personnelles inutiles, limite le contexte et vérifie les règles de conservation du service. Les documents peuvent contenir des instructions malveillantes. Une application doit séparer ses instructions de confiance des données fournies par les utilisateurs.

L'IA ne doit pas décider seule d'une action exigeant une responsabilité humaine, notamment lorsqu'elle touche la sécurité ou les droits d'une personne.

## 12. Mini-expérience locale : prédire le mot suivant
Ce programme compte les mots qui suivent un mot donné. Il choisit le successeur le plus fréquent. C'est un modèle statistique jouet, pas un grand modèle de langage ni un réseau neuronal.

~~~python
from collections import defaultdict, Counter

texte = """
python est utile
python est lisible
le code est utile
le code est lisible
"""
transitions = defaultdict(Counter)
mots = texte.lower().split()

for actuel, suivant in zip(mots, mots[1:]):
    transitions[actuel][suivant] += 1

def proposer_suivant(mot):
    candidats = transitions.get(mot.lower())
    if not candidats:
        return "Aucune suite observée."
    suivant, nombre = candidats.most_common(1)[0]
    return f"Proposition : {suivant} ({nombre} observation(s))"

print(proposer_suivant("python"))
print(proposer_suivant("code"))
~~~

Le programme mémorise des transitions observées, sans comprendre pourquoi les mots sont associés. Cette expérience illustre une prédiction séquentielle très simplifiée.

## 13. Exercices progressifs
1. Classe une condition `if`, un filtre appris avec des exemples et un générateur de texte.
2. Améliore le prompt « Fais un cours sur Python » en précisant public, objectifs, exemples et format.
3. Un assistant donne trois chiffres sans origine : écris quatre questions de contrôle.
4. Explique pourquoi fournir 300 pages n'est pas toujours utile et comment sélectionner des extraits.
5. Saisis un mot absent dans le programme et vérifie qu'il ne plante pas.

## 14. Corrigés expliqués

### Exercice 1
La condition explicite est un système à règles. Le filtre appris avec des exemples est du Machine Learning. Le générateur de texte relève de l'IA générative.

### Exercice 2
~~~text
Crée une leçon de Python pour un débutant sur Android.
Explique les variables et les types avec trois exemples.
Ajoute quatre exercices et les corrigés à la fin.
Utilise un vocabulaire simple et signale les incertitudes.
~~~
Le prompt précise public, sujet, exemples et format. Le code produit doit tout de même être testé.

### Exercice 3
Demande la source, la date, l'unité et la méthode de calcul. Vérifie aussi que les chiffres sont comparables et que le contexte est complet.

### Exercice 4
Un document long contient souvent des passages inutiles et peut dépasser la fenêtre de contexte. Recherche les mots-clés, sélectionne les paragraphes pertinents, conserve titre et page, puis limite la réponse à ces extraits.

### Exercice 5
~~~python
def proposer_suivant(mot):
    candidats = transitions.get(mot.lower())
    if candidats is None:
        return "Mot absent du corpus."
    suivant, nombre = candidats.most_common(1)[0]
    return f"Proposition : {suivant} ({nombre} observation(s))"
~~~
`get()` renvoie `None` si la clé est absente. Le test traite ce cas avant `most_common()`.

## 15. Fiche de révision et validation
| Notion | Idée essentielle |
|---|---|
| Système à règles | Exécute des conditions définies |
| Machine Learning | Ajuste un modèle avec des données |
| IA générative | Produit un nouveau contenu |
| Token | Unité de texte |
| Contexte | Informations disponibles pendant la génération |
| Entraînement | Ajustement des paramètres |
| Inférence | Utilisation du modèle entraîné |
| Prompt | Instruction et contexte |
| RAG | Recherche documentaire puis génération |
| Hallucination | Information inventée ou non étayée |

Avant la leçon 08, vérifie que tu peux distinguer les trois familles, expliquer entraînement et inférence, écrire un prompt précis, contrôler une réponse et identifier les risques de confidentialité.

**À retenir :** un modèle génératif produit une réponse plausible à partir de son apprentissage et du contexte. La plausibilité n'est pas une preuve.

---

*©pythonschool — Intelligence artificielle, Leçon 07.*
