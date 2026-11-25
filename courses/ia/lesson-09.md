# Intelligence artificielle — Leçon 09 : Évaluer un assistant documentaire RAG

**Parcours :** Intelligence artificielle  
**Numéro :** 09  
**Niveau :** Débutant à intermédiaire  
**Durée indicative :** 110 à 120 minutes  
**Environnement :** Python standard pour les exercices, documents de test locaux et navigateur facultatif.  
**Prérequis :** Comprendre données, modèles, apprentissage, inférence, prompts, évaluation et principe du RAG.

## 1. Fiche de départ : objectifs et prérequis

Un assistant documentaire peut sembler convaincant tout en donnant une réponse incorrecte. Il peut retrouver un mauvais passage, oublier une information importante, inventer une citation ou répondre avec trop de certitude. Cette leçon apprend à mesurer ces problèmes au lieu de se fier à une impression.

À la fin, tu sauras préparer un jeu de questions de référence, mesurer la qualité de la recherche documentaire, vérifier les réponses et les citations, analyser les erreurs et construire une petite grille d'évaluation. Tu comprendras aussi les risques de confidentialité et d'injection de prompt.

Les exemples sont pédagogiques. Ils utilisent des textes fictifs et du Python standard. Ils ne nécessitent pas de modèle payant ni de connexion à une API. Un test hors ligne peut mesurer une partie du système, mais il ne prouve pas à lui seul qu'un modèle génératif est fiable.

## 2. Sommaire et méthode d'évaluation

1. Pourquoi évaluer un assistant ?
2. Distinguer règles, Machine Learning et IA générative
3. Rappeler le fonctionnement du RAG
4. Construire un jeu de questions de référence
5. Évaluer la récupération des passages
6. Évaluer la qualité des réponses
7. Vérifier les citations et les sources
8. Tester les questions sans réponse
9. Analyser les erreurs et leurs causes
10. Sécurité : injection de prompt et documents hostiles
11. Confidentialité, droits et traçabilité
12. Mini-projet : banc d'essai hors ligne
13. Exercices progressifs
14. Corrigés expliqués
15. Fiche de révision

Une évaluation utile suit toujours une méthode : définir le besoin, préparer des exemples représentatifs, exécuter le système, comparer les résultats à une référence, analyser les écarts puis recommencer après une modification.

## 3. Pourquoi évaluer un assistant documentaire ?

Le RAG combine une recherche dans des documents et une génération de réponse. La recherche fournit des passages au modèle ; le modèle rédige ensuite une réponse à partir de ce contexte. Deux étapes peuvent échouer séparément.

Exemple : une question demande la durée d'une garantie. Le moteur retrouve un document qui parle bien de garantie, mais il s'agit d'une ancienne version. Le modèle peut résumer correctement ce mauvais passage. La phrase est bien formulée, mais la réponse reste fausse.

Il faut donc mesurer au moins trois choses :
- la recherche retrouve-t-elle les bons passages ?
- la réponse respecte-t-elle les passages récupérés ?
- l'utilisateur peut-il vérifier les affirmations avec des sources identifiables ?

La fluidité du texte n'est pas une mesure de vérité. Un assistant fiable doit parfois répondre « je ne trouve pas cette information » plutôt que compléter les blancs avec une supposition.

## 4. Distinguer règles, Machine Learning et IA générative

Un système à règles applique des conditions écrites par une personne. Il peut être très prévisible, mais ne comprend pas automatiquement toutes les formulations.

Un modèle de Machine Learning apprend des régularités à partir d'exemples. Il peut classer une demande ou produire un score, mais ses résultats dépendent des données et de son entraînement.

Une IA générative produit un contenu à partir d'un contexte et d'une consigne. Elle peut reformuler un passage, mais aussi produire une affirmation non justifiée. Le RAG ne transforme pas automatiquement cette génération en vérité : il lui fournit des documents à consulter.

| Élément | Rôle dans un assistant |
|---|---|
| Règles | Contrôles déterministes, formats et permissions |
| Machine Learning | Classement ou recherche sémantique possible |
| Génération | Formulation d'une réponse |
| RAG | Relier la réponse à des passages documentaires |
| Évaluation | Mesurer les résultats et les limites |

Une bonne architecture utilise les règles pour les contrôles stricts, la recherche pour retrouver des documents et la génération pour expliquer les informations récupérées.

## 5. Rappeler le fonctionnement du RAG

Un pipeline RAG classique contient plusieurs étapes : ingestion des documents, extraction du texte, découpage en passages, indexation, recherche, assemblage du contexte, génération et affichage des références.

Chaque étape doit conserver des informations utiles : identifiant du document, titre, date, numéro de page ou section, version et autorisation d'accès. Sans métadonnées, une réponse peut être difficile à vérifier.

La recherche peut être lexicale, sémantique ou hybride. Une recherche lexicale repère les mots présents. Une recherche sémantique cherche des passages proches par leur sens à l'aide de représentations vectorielles. Une recherche hybride combine les deux approches.

Le nombre de passages récupérés, appelé souvent k, influence le contexte. Un k trop faible peut manquer une information. Un k trop élevé peut ajouter du bruit ou dépasser la taille de contexte disponible. Il faut tester ce paramètre sur des questions représentatives, pas le choisir au hasard.

## 6. Construire un jeu de questions de référence

Un jeu de référence contient des questions, les réponses attendues et les passages qui devraient être retrouvés. Il sert de base stable pour comparer plusieurs versions du système.

Exemple de structure :

~~~python
tests = [
    {
        "question": "Quelle est la durée du prêt ?",
        "expected_answer": "La durée est de 12 mois.",
        "relevant_ids": ["doc-contrat-02"],
        "answerable": True
    },
    {
        "question": "Quel est le nom du directeur ?",
        "expected_answer": None,
        "relevant_ids": [],
        "answerable": False
    }
]
~~~

Inclue plusieurs catégories :
- questions simples dont la réponse est explicite ;
- questions qui nécessitent de réunir deux passages ;
- formulations avec synonymes ;
- questions ambiguës ;
- questions sans réponse dans le corpus ;
- documents récents et documents archivés.

Ne construis pas les tests uniquement à partir des questions qui fonctionnent déjà. Cela favoriserait artificiellement le système. Fais relire les réponses attendues par une personne qui connaît les documents.

## 7. Évaluer la récupération des passages

La récupération est la capacité du moteur à retrouver les passages pertinents. Une mesure simple est le **Recall@k** : parmi les passages pertinents connus, quelle proportion apparaît dans les k premiers résultats ?

Si une question possède quatre passages pertinents et que deux sont présents dans les cinq premiers résultats, le Recall@5 vaut 2/4, soit 0,5.

~~~python
def recall_at_k(relevant_ids, retrieved_ids, k):
    relevant = set(relevant_ids)
    if not relevant:
        return None
    top = set(retrieved_ids[:k])
    return len(relevant & top) / len(relevant)

attendus = ["a", "b", "c", "d"]
retrouves = ["b", "x", "a", "y", "c"]

print(recall_at_k(attendus, retrouves, 5))  # 0.75
~~~

Cette mesure ne dit pas si le passage est bien résumé. Elle évalue seulement la présence des éléments pertinents dans les premiers résultats. Tu peux également regarder le rang du premier passage utile ou la précision des premiers résultats.

Les scores doivent être calculés sur plusieurs questions. Une seule question ne représente pas le comportement général du système.

## 8. Évaluer la qualité des réponses

Une réponse peut être évaluée selon plusieurs dimensions distinctes :

- **Exactitude :** les faits correspondent-ils aux documents ?
- **Complétude :** les éléments importants de la question sont-ils traités ?
- **Fidélité :** chaque affirmation est-elle soutenue par le contexte ?
- **Clarté :** la réponse est-elle compréhensible ?
- **Calibrage :** le système reconnaît-il l'incertitude ou l'absence de preuve ?

Une grille humaine peut attribuer une note de 0 à 2 pour chaque dimension : 0 signifie insuffisant, 1 partiel et 2 satisfaisant. Il faut décrire les critères avant de noter les réponses pour limiter les différences entre évaluateurs.

Ne transforme pas une note globale en vérité absolue. Une réponse très claire mais factuellement fausse ne doit pas obtenir une bonne note simplement parce qu'elle est agréable à lire. Pour une information importante, l'exactitude et la fidélité doivent avoir un poids prioritaire.

## 9. Vérifier les citations et les sources

Une citation doit pointer vers le document et le passage qui soutiennent réellement l'affirmation. Une référence présente en bas de réponse ne prouve pas que toutes les phrases sont justifiées.

Vérifie :
1. que l'identifiant du document existe ;
2. que la version est celle attendue ;
3. que la page ou la section est correcte ;
4. que le passage soutient l'affirmation ;
5. que la citation n'est pas tronquée au point de changer le sens.

Exemple de métadonnées :

~~~python
source = {
    "document_id": "guide-04",
    "title": "Guide utilisateur",
    "version": "2026-09",
    "page": 12,
    "section": "Sauvegarde"
}
~~~

Si une réponse contient trois affirmations, il peut être nécessaire de fournir plusieurs références. Une citation ne doit pas être ajoutée uniquement parce qu'un document contient un mot similaire. Le lien logique entre l'affirmation et le passage doit être vérifié.

## 10. Tester les questions sans réponse

Un assistant documentaire ne doit pas inventer une réponse lorsque le corpus ne contient pas l'information. Prépare donc des questions volontairement impossibles à résoudre avec les documents disponibles.

Exemple : si les documents expliquent les horaires d'ouverture mais ne donnent aucun numéro de téléphone, demande le numéro. Le comportement attendu est une réponse prudente indiquant que l'information n'est pas disponible.

Observe :
- si le système signale l'absence de preuve ;
- s'il invente une valeur ;
- s'il cite un passage sans rapport ;
- s'il demande une précision lorsque la question est ambiguë ;
- s'il distingue une information absente d'une information contradictoire.

Le seuil de confiance d'un moteur de recherche doit être calibré sur des tests. Un score de similarité élevé n'est pas automatiquement une preuve que la réponse est correcte.

## 11. Analyser les erreurs et leurs causes

Lorsqu'une réponse échoue, classe le problème avant de modifier le système.

| Symptôme | Cause possible | Vérification |
|---|---|---|
| Aucun passage utile | Index incomplet | Vérifier l'ingestion |
| Mauvaise version | Métadonnées absentes | Contrôler les dates |
| Passage trop long | Découpage inadapté | Examiner les frontières |
| Réponse inventée | Contexte insuffisant | Tester l'abstention |
| Citation fausse | Référence mal reliée | Vérifier l'identifiant |
| Réponse contradictoire | Sources en conflit | Comparer les versions |

Change un seul paramètre à la fois lorsque c'est possible : taille des passages, chevauchement, k ou seuil de recherche. Si tu modifies tout simultanément, tu ne sauras pas quelle modification a amélioré ou dégradé le résultat.

Conserve les résultats avant et après chaque changement. Une amélioration sur un groupe de questions peut dégrader un autre groupe : surveille les catégories séparément.

## 12. Sécurité : injection de prompt et documents hostiles

Un document récupéré est une donnée, pas une instruction de confiance. Un passage peut contenir une phrase qui demande au modèle d'ignorer les règles, de révéler des secrets ou de suivre un lien. Cette phrase doit être traitée comme du contenu documentaire non fiable.

Principes de protection :
- séparer les instructions système des passages récupérés ;
- interdire au contenu documentaire de modifier les permissions ;
- ne jamais placer de secrets dans le contexte ;
- vérifier les actions sensibles dans un composant déterministe ;
- limiter les outils accessibles au modèle ;
- enregistrer les incidents sans conserver de données privées inutiles.

Un assistant qui peut seulement résumer des documents présente moins de risques qu'un assistant qui peut envoyer des messages ou modifier des comptes. Les outils doivent être limités au besoin réel. Une génération de texte ne doit pas déclencher automatiquement une action privilégiée.

## 13. Confidentialité, droits et traçabilité

Évalue aussi les données utilisées. Un corpus peut contenir des noms, coordonnées, informations scolaires ou documents protégés. Il faut vérifier que leur collecte et leur utilisation sont autorisées.

Conserve uniquement les données nécessaires. Définis qui peut consulter chaque document. Évite d'envoyer des documents privés à un service externe sans autorisation et sans comprendre les conditions de traitement.

Pour rendre un test reproductible, note :
- la version du corpus ;
- la version du code ;
- les paramètres de recherche ;
- le modèle utilisé, s'il y en a un ;
- la date du test ;
- les résultats et les erreurs observées.

Ne stocke pas de conversations privées dans un corpus d'entraînement sans consentement et base légitime. Évaluer un système documentaire ne signifie pas réutiliser automatiquement les questions des utilisateurs pour entraîner un modèle.

## 14. Mini-projet : banc d'essai hors ligne

Ce programme calcule Recall@k pour plusieurs questions fictives. Il ne nécessite aucune bibliothèque externe.

~~~python
def recall_at_k(relevant, retrieved, k):
    relevant = set(relevant)
    if not relevant:
        return None
    top = set(retrieved[:k])
    return len(relevant.intersection(top)) / len(relevant)


tests = [
    {
        "name": "Question sur le contrat",
        "relevant": ["doc-a", "doc-b"],
        "retrieved": ["doc-a", "doc-x", "doc-b"]
    },
    {
        "name": "Question sur le guide",
        "relevant": ["doc-c"],
        "retrieved": ["doc-y", "doc-c", "doc-z"]
    }
]

scores = []

for test in tests:
    score = recall_at_k(
        test["relevant"],
        test["retrieved"],
        3
    )
    scores.append(score)
    print(test["name"], "Recall@3 =", score)

moyenne = sum(scores) / len(scores)
print("Moyenne :", round(moyenne, 3))
~~~

Ajoute une troisième question sans passage pertinent. La fonction renvoie **None**, car un rappel n'est pas calculable lorsque la liste de référence est vide. Cette distinction évite de confondre « aucune réponse attendue » avec « score nul ».

Pour compléter le projet, crée une fiche manuelle qui note exactitude, complétude, fidélité, clarté et citations pour chaque réponse générée.

## 15. Exercices progressifs

1. Explique pourquoi une réponse bien écrite peut être fausse.
2. Construis trois questions avec leurs identifiants de passages pertinents.
3. Calcule Recall@3 pour quatre passages pertinents dont trois sont retrouvés.
4. Donne deux exemples de questions sans réponse dans le corpus.
5. Décris une vérification permettant de confirmer qu'une citation soutient une affirmation.
6. Explique pourquoi un document qui contient une instruction hostile ne doit pas modifier les règles du système.
7. Propose quatre informations à conserver pour reproduire un test.

## 16. Corrigés expliqués

**Exercice 1 :** la génération peut produire un texte fluide sans preuve suffisante. La qualité du style ne mesure pas l'exactitude. Il faut comparer les affirmations aux sources.

**Exercice 2 :** exemple : question « Quelle est la date de mise à jour ? », passages pertinents **doc-version-1** et **doc-version-2**. Les identifiants doivent correspondre aux documents réellement connus.

**Exercice 3 :** Recall@3 = 3 / 4 = 0,75. Trois des quatre passages attendus figurent dans les trois premiers résultats.

**Exercice 4 :** demande un numéro de téléphone si le corpus ne contient aucun numéro, ou une date précise absente des documents. Le système doit signaler l'absence de preuve.

**Exercice 5 :** ouvrir le document cité, vérifier sa version, retrouver le passage et comparer son sens à l'affirmation. Un simple mot commun ne suffit pas.

**Exercice 6 :** le document est une donnée non fiable. Les instructions de sécurité doivent rester séparées du contenu récupéré.

**Exercice 7 :** version du corpus, version du code, paramètres de recherche et date du test. Le modèle et ses paramètres doivent aussi être notés lorsqu'ils sont utilisés.

## 17. Fiche de révision et validation

| Notion | Question à retenir |
|---|---|
| Jeu de référence | Quelles réponses et sources sont attendues ? |
| Recall@k | Les passages utiles sont-ils dans les k premiers ? |
| Fidélité | Les affirmations sont-elles soutenues ? |
| Citation | Peut-on retrouver la preuve exacte ? |
| Abstention | Le système sait-il dire qu'il ne sait pas ? |
| Dérive | Les performances changent-elles avec le temps ? |
| Injection de prompt | Un document tente-t-il de modifier les règles ? |
| Traçabilité | Peut-on reproduire le test ? |

Avant la leçon 10, vérifie que tu peux préparer un jeu de tests, mesurer la récupération, contrôler une citation, analyser un échec et protéger les documents. Un assistant RAG doit être évalué à chaque changement important du corpus, du moteur de recherche, du prompt ou du modèle.

**À retenir :** une réponse utile doit être pertinente, vérifiable, prudente et respectueuse des données. Le RAG améliore l'accès aux sources, mais l'évaluation reste indispensable.

---

*©pythonschool — Intelligence artificielle, Leçon 09.*