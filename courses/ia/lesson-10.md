# Intelligence artificielle — Leçon 10 : Améliorer la recherche documentaire par le découpage et le classement

**Parcours :** Intelligence artificielle  
**Numéro :** 10  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 115 à 125 minutes  
**Environnement :** Python standard, textes fictifs et fonctionnement hors ligne.  
**Prérequis :** Données, modèles, apprentissage, inférence, recherche documentaire, RAG et évaluation d'un assistant.

## 1. Fiche de départ : objectifs et prérequis

Un assistant documentaire RAG ne peut pas répondre correctement si la recherche lui fournit de mauvais passages. Même un modèle de langage puissant ne peut pas retrouver une information qui n'a pas été sélectionnée dans son contexte. Cette leçon se concentre donc sur la partie recherche : préparer les documents, les découper, retrouver des passages utiles et les classer.

À la fin, tu sauras expliquer pourquoi la taille des passages compte, choisir une stratégie de découpage, ajouter des métadonnées, comprendre la recherche lexicale et les embeddings, comparer les résultats et construire un petit moteur lexical hors ligne en Python standard.

Nous distinguerons toujours les systèmes à règles, le Machine Learning et l'IA générative. Le programme de cette leçon est un moteur de recherche pédagogique fondé sur les mots. Il n'apprend pas comme un modèle de Machine Learning et ne génère pas de réponse. Il montre une partie du pipeline RAG sans service payant ni connexion Internet.

## 2. Sommaire et méthode de travail

1. Revoir le rôle de la recherche dans un RAG
2. Préparer les documents avant l'indexation
3. Comprendre le découpage en passages
4. Choisir une taille et un chevauchement
5. Ajouter des métadonnées utiles
6. Comprendre la recherche lexicale
7. Construire un classement lexical simple
8. Découvrir les embeddings et la similarité
9. Comprendre la recherche hybride et le reclassement
10. Mesurer la qualité des résultats
11. Sécurité, confidentialité et limites
12. Mini-projet : moteur documentaire hors ligne
13. Exercices et corrigés
14. Fiche de révision

Pour chaque étape, garde le même jeu de documents fictifs. Une comparaison est utile seulement si les questions et les documents restent identiques entre deux essais.

## 3. Revoir le rôle de la recherche dans un RAG

RAG signifie Retrieval-Augmented Generation, ou génération augmentée par récupération. Le système reçoit une question, recherche des passages dans un corpus, sélectionne un contexte puis demande à un modèle génératif de formuler une réponse à partir de ce contexte.

Le pipeline peut être représenté ainsi : les documents sont collectés et vérifiés ; le texte est nettoyé et découpé ; chaque passage est indexé avec son origine ; une question déclenche une recherche ; les meilleurs passages sont sélectionnés ; le modèle rédige une réponse et, si possible, cite les sources.

La recherche et la génération sont deux composants différents. Un moteur lexical peut fonctionner sans IA générative. Un système à règles peut filtrer les résultats selon des critères fixes. Un modèle de Machine Learning peut apprendre à classer des passages à partir d'exemples. Un modèle génératif peut ensuite rédiger une réponse. Il ne faut pas appeler « modèle entraîné » un simple tri par nombre de mots correspondants.

Si le bon passage n'arrive pas dans le contexte, le modèle peut répondre de façon incomplète ou s'appuyer sur ses connaissances générales. La qualité de la recherche doit donc être mesurée séparément de la qualité rédactionnelle.

## 4. Préparer les documents avant l'indexation

Un corpus est l'ensemble des documents utilisés par l'assistant. Avant de les indexer, il faut vérifier leur qualité. Un document peut être incomplet, mal encodé, dupliqué ou périmé. Une page contenant seulement une image peut aussi ne fournir aucun texte exploitable au moteur.

Pour chaque document, conserve au minimum un identifiant stable, un titre, une origine ou un chemin, une date ou une version si elle existe, une catégorie, le texte extrait et le statut de validation.

Ne remplace pas silencieusement un document récent par une copie plus ancienne. Si deux versions se contredisent, il faut une règle explicite de priorité, par exemple la version validée la plus récente.

Le nettoyage doit rester prudent. Retirer les espaces inutiles peut être utile ; supprimer des nombres, des unités, des négations ou des titres peut changer le sens. Une phrase comme « le service n'est pas disponible » ne doit pas devenir « le service est disponible ».

~~~python
document = {
    "id": "guide-001",
    "titre": "Guide de sauvegarde",
    "version": "2.1",
    "categorie": "informatique",
    "texte": "Une sauvegarde doit être vérifiée régulièrement."
}
~~~

Les métadonnées aident à filtrer et à citer les passages. Elles ne remplacent pas la vérification du contenu.

## 5. Comprendre le découpage en passages

Un document complet peut être trop long pour être transmis dans le contexte d'un modèle. Le découpage, ou chunking, consiste à créer des passages plus courts. Chaque passage devient une unité que le moteur peut retrouver.

Imagine un manuel de 100 pages. Si une question concerne une règle de sauvegarde, transmettre tout le manuel est coûteux et peut noyer l'information utile. Un passage bien découpé contient une idée suffisamment complète pour être comprise sans tout le chapitre.

Plusieurs stratégies existent :
- par paragraphes : respecte souvent les unités de sens ;
- par titres : garde le lien avec les sections ;
- par nombre de caractères ou de tokens : garantit une taille maximale ;
- par phrases : évite de couper une phrase au milieu ;
- par structure : conserve les tableaux, listes ou blocs de code ensemble.

Il n'existe pas de taille parfaite. Un passage trop court perd son contexte. Un passage trop long mélange plusieurs sujets et peut être moins précis. La bonne taille dépend du type de document, des questions attendues et de la limite de contexte du modèle utilisé.

Conserve toujours un lien entre le passage et le document original. Un passage sans source est difficile à vérifier et à citer.

## 6. Choisir une taille et un chevauchement

Le chevauchement, ou overlap, répète une petite partie du passage précédent dans le suivant. Il évite qu'une information importante soit perdue lorsqu'elle se trouve à la frontière de deux morceaux.

Sans chevauchement, une phrase peut être coupée entre deux passages et perdre son contexte. Avec un chevauchement modéré, le second passage répète quelques mots ou phrases du premier. Un chevauchement trop important crée beaucoup de doublons et augmente le stockage ; un chevauchement trop faible peut couper le contexte.

Voici une fonction simple qui découpe un texte par caractères. Elle sert à comprendre le mécanisme, pas à remplacer un découpage sémantique complet :

~~~python
def decouper(texte, taille=300, chevauchement=40):
    if taille <= 0:
        raise ValueError("La taille doit être positive.")
    if chevauchement < 0 or chevauchement >= taille:
        raise ValueError("Chevauchement invalide.")

    passages = []
    debut = 0

    while debut < len(texte):
        fin = debut + taille
        passages.append(texte[debut:fin])
        if fin >= len(texte):
            break
        debut = fin - chevauchement

    return passages
~~~

Cette fonction peut couper un mot ou une phrase. Dans un vrai système, repère d'abord les titres, paragraphes et phrases, puis applique une limite de taille. Compare plusieurs paramètres sur un jeu de questions de référence.

## 7. Ajouter des métadonnées utiles

Chaque passage doit garder sa provenance. Un identifiant de document, un numéro de section, un titre et une version facilitent la recherche et la citation.

~~~python
passage = {
    "id": "guide-001-p03",
    "document_id": "guide-001",
    "titre": "Guide de sauvegarde",
    "section": "Vérifier une restauration",
    "page": 3,
    "version": "2.1",
    "texte": "Une sauvegarde doit être testée par une restauration."
}
~~~

Les métadonnées permettent de filtrer avant ou après la recherche. Par exemple, une question sur un cours Python peut limiter la recherche aux documents du parcours Python. Un assistant documentaire peut aussi exclure une version archivée.

Attention : un filtre trop strict peut cacher le bon passage. Si l'utilisateur ne précise pas de catégorie, ne suppose pas arbitrairement une catégorie. Conserve une stratégie de recherche générale en secours.

Les métadonnées doivent être fiables. Ne laisse pas le texte du document décider lui-même qu'il est « officiel » ou « prioritaire ». Le statut doit venir du processus de validation, pas d'une phrase trouvée dans le contenu.

## 8. Comprendre la recherche lexicale et le classement

La recherche lexicale compare les mots de la question aux mots présents dans les passages. Une méthode très simple compte les mots communs. Elle est facile à expliquer, mais elle ne comprend pas le sens.

Exemple : une question demande « comment restaurer une sauvegarde ? ». Un passage contenant les mots « sauvegarde » et « restaurer » peut recevoir un score élevé. Mais un passage parlant de « récupération des fichiers » peut être pertinent sans partager les mêmes mots.

TF-IDF réduit l'importance des mots très fréquents dans tous les documents et augmente celle des mots plus spécifiques. BM25 est une méthode de classement lexical courante qui tient également compte de la longueur des documents et de la fréquence des termes.

Les méthodes lexicales sont utiles pour les noms propres, les références exactes, les numéros de version et les termes techniques. Elles sont moins efficaces pour les synonymes ou les formulations très différentes.

Un score n'est pas une probabilité. Un passage avec un score de 8 n'a pas automatiquement 80 % de chances d'être correct. Le score sert à ordonner les résultats dans un même système, pas à garantir la vérité.

## 9. Construire un classement lexical simple

Le code suivant normalise les mots en minuscules et compte les termes de la question présents dans chaque passage. Il ne réalise pas de compréhension sémantique et ne doit pas être présenté comme un modèle de langage.

~~~python
import re

def mots(texte):
    return re.findall(r"[a-zàâçéèêëîïôûùüÿñæœ0-9]+", texte.lower())

def classer(question, passages):
    termes = set(mots(question))
    resultats = []

    for passage in passages:
        contenu = set(mots(passage["texte"]))
        score = len(termes & contenu)
        resultats.append((score, passage))

    return sorted(resultats, key=lambda element: element[0], reverse=True)


passages = [
    {"id": "p1", "texte": "Une sauvegarde doit être restaurée pour être vérifiée."},
    {"id": "p2", "texte": "Le navigateur affiche les pages du site."},
    {"id": "p3", "texte": "Les fichiers peuvent être copiés dans un dossier."}
]

for score, passage in classer("restaurer une sauvegarde", passages):
    print(score, passage["id"], passage["texte"])
~~~

Le résultat dépend des mots communs. Le code ignore les accents dans certaines variantes, les synonymes, l'ordre des mots et la négation. Il peut aussi favoriser un passage qui répète beaucoup un terme. C'est une baseline : un point de départ simple auquel comparer une méthode plus avancée.

## 10. Découvrir les embeddings et la recherche hybride

Un embedding est une représentation numérique d'un texte sous forme de vecteur. Un modèle d'embeddings transforme une phrase ou un passage en une liste de nombres. Des textes proches par leur sens peuvent avoir des vecteurs proches, même si leurs mots sont différents.

La similarité cosinus compare l'orientation de deux vecteurs. Une valeur proche de 1 indique des directions similaires ; une valeur proche de 0 indique peu de similarité selon cette mesure. La signification dépend du modèle qui a produit les vecteurs.

Une recherche vectorielle nécessite un modèle d'embeddings et un index adapté. Un simple tableau de nombres inventé à la main ne devient pas un vrai embedding. Pour cette raison, le code de cette leçon n'utilise pas de vecteurs artificiels pour prétendre comprendre le langage.

La recherche hybride combine recherche lexicale et recherche vectorielle. Elle peut être utile lorsque les questions mélangent références exactes et reformulations. Les résultats peuvent ensuite être réordonnés par un reranker, un modèle entraîné pour estimer la pertinence d'une paire question-passage.

Chaque composant doit être évalué séparément. Si la recherche hybride améliore quelques questions mais dégrade les références exactes, analyse les cas avant de la déployer.

## 11. Mesurer la qualité des résultats

Un moteur de recherche doit être testé avec des questions dont on connaît les passages pertinents. Pour chaque question, note les identifiants des passages attendus. Ce jeu de référence permet de comparer deux stratégies de découpage ou de classement.

Quelques mesures utiles :
- **Recall@k** : proportion des passages pertinents retrouvés parmi les k premiers résultats ;
- **Precision@k** : proportion des k premiers résultats qui sont pertinents ;
- **MRR** : mesure la position du premier résultat pertinent ;
- **nDCG** : tient compte de l'ordre et de plusieurs niveaux de pertinence.

Exemple : si trois passages sont pertinents et que les cinq premiers résultats en contiennent deux, le rappel à cinq est de deux sur trois. La précision à cinq est de deux sur cinq.

Ne confonds pas ces mesures. Un système peut avoir un bon rappel mais une faible précision : il retrouve les passages utiles, mais les mélange avec beaucoup de bruit. Un système peut avoir une bonne précision mais oublier une partie des informations.

Après chaque changement, garde le même jeu de test et compare les résultats. Ajoute aussi des questions difficiles : synonymes, fautes de frappe, termes techniques, documents contradictoires et questions sans réponse.

## 12. Sécurité, confidentialité et mini-projet

Un corpus peut contenir des informations personnelles, des documents internes ou des données dont la réutilisation n'est pas autorisée. Vérifie les droits d'accès avant l'indexation. Un utilisateur ne doit jamais recevoir un passage qu'il n'a pas le droit de consulter.

Un document peut aussi contenir des instructions hostiles, par exemple demander au modèle d'ignorer les règles du système. Le contenu récupéré doit être traité comme une donnée non fiable, pas comme une instruction prioritaire. Les contrôles d'accès doivent être appliqués avant de construire le contexte.

Mini-projet : créer un moteur lexical hors ligne avec trois documents fictifs. Ajoute un identifiant à chaque passage, teste cinq questions et note si le premier résultat est pertinent. Puis modifie la taille des passages et compare les résultats. Le but est d'observer les compromis, pas de prétendre créer un moteur sémantique complet.

Pour rendre le test reproductible, conserve les questions, les passages attendus, la méthode de découpage et la date de l'essai. N'enregistre pas de données personnelles dans les exemples ou les journaux.

## 13. Exercices progressifs et corrigés expliqués

**Exercice A :** explique pourquoi un passage de 2 mots peut manquer de contexte et pourquoi un passage de 20 pages peut être trop large.

**Exercice B :** écris une fonction qui reçoit un texte et renvoie le nombre de mots.

**Exercice C :** ajoute une métadonnée version à trois passages et filtre les passages de version 2.

**Exercice D :** calcule Precision@3 si deux des trois premiers résultats sont pertinents.

**Exercice E :** donne un exemple où une recherche lexicale échoue alors qu'une recherche sémantique pourrait réussir.

### Correction A

Un passage trop court peut contenir un terme sans expliquer à quoi il se rapporte. Un passage trop long peut réunir plusieurs sujets et transmettre beaucoup de contenu inutile. La taille doit être choisie par expérimentation.

### Correction B

~~~python
def compter_mots(texte):
    return len(texte.split())

print(compter_mots("Le moteur retrouve un passage utile."))
~~~

La méthode split sépare le texte selon les espaces. C'est suffisant pour l'exercice, mais ce n'est pas une analyse linguistique complète.

### Correction C

~~~python
passages = [
    {"id": "a", "version": 1, "texte": "Ancienne règle"},
    {"id": "b", "version": 2, "texte": "Règle actuelle"},
    {"id": "c", "version": 2, "texte": "Nouvelle procédure"}
]

actuels = [p for p in passages if p["version"] == 2]
print(actuels)
~~~

Le filtre repose sur une métadonnée validée, pas sur une phrase du document.

### Correction D

Precision@3 = 2 / 3, soit environ 0,67. Deux résultats sur les trois premiers sont pertinents.

### Correction E

La question « comment récupérer mes fichiers ? » peut ne partager aucun mot avec un passage intitulé « restaurer une sauvegarde ». Une recherche lexicale simple peut manquer le lien entre récupérer et restaurer.

## 14. Fiche de révision et validation

| Notion | Rôle |
|---|---|
| Corpus | Ensemble des documents |
| Chunking | Découpage en passages |
| Overlap | Partie répétée entre passages |
| Métadonnée | Information sur l'origine ou le contexte |
| Recherche lexicale | Comparaison des mots |
| TF-IDF / BM25 | Classement lexical plus élaboré |
| Embedding | Représentation vectorielle d'un texte |
| Similarité cosinus | Comparaison de directions vectorielles |
| Recherche hybride | Combinaison de méthodes |
| Recall@k | Part des passages pertinents retrouvés |
| Precision@k | Part des résultats pertinents |
| Reranker | Classement secondaire des candidats |

Avant de passer à la leçon 11, vérifie que tu sais expliquer le rôle du chunking, conserver la provenance d'un passage, distinguer recherche lexicale et vectorielle, calculer une précision simple et reconnaître qu'un score ne garantit pas la vérité.

**À retenir :** un RAG fiable commence par des documents vérifiés et une recherche mesurée. La génération ne corrige pas automatiquement un mauvais passage récupéré.

---

*©pythonschool — Intelligence artificielle, Leçon 10.*