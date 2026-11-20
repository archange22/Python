# IA — Méthodes pour faire évoluer SUN et améliorer ses réponses

Objectif : fournir une base de décision technique. Toutes les méthodes ne s'appliquent pas à tous les défauts. Une méthode doit être choisie après une évaluation, pas parce que son nom est populaire.

## 1. Distinguer connaissance, comportement et modèle

- Une base documentaire apporte des faits et des cours consultables. La recherche RAG retrouve des passages ; elle ne modifie pas les poids du modèle.
- Un prompt définit le rôle, les limites, le style et les règles de réponse au moment de l'inférence.
- Des exemples few-shot montrent le format et le comportement attendus dans le contexte courant ; ils ne réentraînent pas le modèle.
- Le fine-tuning modifie les paramètres ou des adaptateurs afin d'adapter les réponses à des exemples.
- L'optimisation d'inférence accélère l'exécution ou réduit la mémoire ; elle ne donne pas automatiquement de nouvelles connaissances.

Pour SUN, commencer par une recherche documentaire fiable et une bonne orchestration. L'entraînement des poids vient ensuite, lorsque les données et les moyens de calcul sont disponibles.

## 2. Préparer des données d'apprentissage propres

Étapes essentielles :
1. Définir les tâches visées : dialogue général, tutorat, génération de code, correction, compréhension de documents ou recherche.
2. Vérifier la provenance et la licence de chaque document et jeu de données.
3. Écarter les données privées, les identifiants, les secrets, les contenus non autorisés et les doublons.
4. Détecter les langues et conserver la langue originale.
5. Normaliser les formats sans effacer les informations utiles.
6. Séparer les conversations en tours cohérents.
7. Vérifier la qualité des réponses et signaler les exemples incertains.
8. Séparer les ensembles d'entraînement, de validation et de test avant tout entraînement.
9. Conserver les versions, les sources et les empreintes des fichiers.
10. Documenter les transformations et les règles d'exclusion.

Ne jamais placer les exemples de test dans l'entraînement. Sinon, l'évaluation ne mesure plus la capacité à généraliser.

## 3. Recherche augmentée par récupération (RAG)

Le RAG fournit au modèle les passages pertinents avant la génération. Il convient lorsque les connaissances changent souvent, doivent être sourcées ou proviennent de cours et de documents.

Pipeline recommandé :
1. Extraire le texte du document et conserver ses métadonnées.
2. Découper selon les titres, paragraphes, pages et blocs cohérents.
3. Indexer les passages avec une recherche lexicale BM25.
4. Calculer des embeddings une fois à l'import pour permettre une recherche sémantique.
5. Fusionner les candidats lexicaux et vectoriels.
6. Utiliser éventuellement un reranker pour reclasser les meilleurs candidats.
7. Éliminer les doublons et limiter la quantité de contexte.
8. Envoyer les passages au modèle avec leur titre, leur page et leur source.
9. Exiger que la réponse distingue les informations présentes dans les sources des déductions.
10. Afficher les références et reconnaître qu'aucun document pertinent n'a été trouvé si nécessaire.

Une recherche hybride BM25 + embeddings est plus robuste qu'un simple mot-clé pour les synonymes, mais elle doit être évaluée sur des questions réelles et des reformulations.

## 4. Prompt engineering et exemples

Un bon prompt système définit le rôle, la langue, les priorités, la politique de refus, les limites de mémoire et le format de réponse. Les exemples few-shot montrent des cas représentatifs, y compris les cas limites et les demandes ambiguës.

Ne pas surcharger le prompt avec des milliers d'exemples. Les règles doivent rester courtes, cohérentes et testables. Les exemples doivent être différents du jeu de validation pour éviter une simple mémorisation.

## 5. Supervised Fine-Tuning (SFT)

Le SFT adapte un modèle avec des exemples de demandes et de réponses souhaitées. Les données peuvent être des couples prompt/réponse ou des conversations avec rôles explicites. Le modèle apprend à prédire la réponse cible conditionnée par le contexte.

Un format conversationnel garde les rôles user et assistant. La configuration de la perte doit correspondre au format réel du tokenizer et du template de chat. Les masques de perte doivent éviter d'entraîner le modèle à recopier les messages utilisateur lorsque seule la réponse assistant doit être apprise.

Le SFT convient à la manière de répondre, au format du tutorat, à la correction de code et aux comportements récurrents. Il n'est pas le meilleur moyen de maintenir une encyclopédie actualisée.

## 6. PEFT, LoRA et QLoRA

PEFT signifie Parameter-Efficient Fine-Tuning : seules certaines parties ou couches ajoutées du modèle sont entraînées. LoRA ajoute des matrices entraînables de faible rang tout en gardant les poids principaux gelés. QLoRA combine la quantification du modèle de base et l'entraînement d'adaptateurs pour réduire les besoins mémoire.

Ces techniques peuvent rendre un ajustement spécialisé plus accessible qu'un fine-tuning complet, mais elles nécessitent encore un modèle compatible, un environnement de calcul approprié, une préparation de données et une évaluation. Un téléphone Android ou un Cloudflare Worker n'est pas une infrastructure réaliste pour entraîner un grand modèle.

## 7. Préférences et alignement

DPO apprend à partir de paires de réponses classées comme préférée et rejetée. KTO, ORPO et d'autres objectifs de préférence utilisent des formes différentes de signaux d'évaluation. Ils exigent des données de préférence propres et cohérentes.

RLHF/RLAIF utilisent des retours humains ou assistés, souvent avec un modèle de récompense. PPO, GRPO et RLOO sont des familles de méthodes d'optimisation par récompense. Elles sont plus complexes, coûteuses et sensibles à la définition de la récompense. Ne pas les lancer sans critère mesurable et contrôle des comportements indésirables.

## 8. Continued pretraining et adaptation de domaine

Le continued pretraining poursuit l'apprentissage du modèle sur un corpus général ou spécialisé. Il peut renforcer le vocabulaire et les structures d'un domaine, mais un corpus étroit, répétitif ou de faible qualité peut provoquer une dérive et un oubli catastrophique des capacités précédentes.

Il demande généralement bien plus de données et de calcul qu'une simple mise à jour de base documentaire. Il faut mesurer les performances avant et après, sur les domaines ciblés et sur les capacités générales.

## 9. Distillation

La distillation utilise un modèle enseignant pour produire des réponses ou des distributions qu'un modèle étudiant plus petit apprend à reproduire. Elle peut réduire le coût d'inférence, mais l'étudiant peut hériter des erreurs, biais ou limites de l'enseignant.

Les données synthétiques doivent être marquées comme synthétiques, filtrées, contrôlées et comparées à des exemples humains fiables. Ne jamais considérer toute réponse produite automatiquement comme une vérité.

## 10. Embeddings et entraînement contrastif

Les embeddings représentent un texte par un vecteur utile à la recherche sémantique. L'entraînement contrastif peut rapprocher les questions et passages pertinents, et éloigner les passages non pertinents. Il faut des paires positives et négatives contrôlées.

Un modèle d'embeddings multilingue peut aider à retrouver un passage français à partir d'une formulation différente. Vérifier cependant la prise en charge réelle des langues, les performances sur les accents, les abréviations et les termes techniques.

## 11. Évaluation avant et après chaque changement

Créer un jeu fixe de tests qui contient :
- conversations ordinaires et salutations ;
- abréviations et fautes réalistes ;
- messages de suivi dépendant de l'historique ;
- questions de cours avec et sans source ;
- problèmes Python et tests automatiques ;
- demandes multilingues ;
- documents PDF, DOCX, tableurs et images ;
- questions impossibles à résoudre avec les sources disponibles ;
- cas où SUN doit signaler une incertitude.

Mesures utiles : exactitude, taux de bonnes interprétations, Recall@k, MRR ou nDCG pour la recherche, fidélité aux sources, taux d'hallucination, réussite des tests de code, latence, débit de génération et mémoire consommée.

Comparer chaque nouvelle version à une version de référence. Garder un jeu de test non utilisé pendant la préparation et rechercher les régressions sur les capacités déjà acquises.

## 12. Optimiser l'exécution sans confondre optimisation et apprentissage

- Quantification : réduire la taille numérique des poids, avec un compromis possible sur la qualité.
- KV cache : réutiliser des calculs d'attention lors de la génération.
- Batching : traiter plusieurs demandes ensemble lorsque l'infrastructure s'y prête.
- Streaming : envoyer progressivement les tokens à l'interface.
- Speculative decoding : utiliser un modèle plus léger pour proposer des tokens qu'un modèle principal vérifie.
- ONNX, WebGPU ou WebAssembly : adapter l'exécution aux environnements locaux compatibles.
- Cache de recherche : réutiliser l'index et les embeddings au lieu de les recalculer pour chaque question.

Ces techniques améliorent les coûts et la vitesse, mais ne remplacent ni les données fiables ni l'évaluation.

## 13. Plan recommandé pour SUN

Phase 1 : stabiliser le chat, l'historique, la recherche dans les cours et les références.
Phase 2 : construire un corpus versionné, multilingue et légalement réutilisable.
Phase 3 : ajouter la recherche hybride et un jeu d'évaluation plus large.
Phase 4 : comparer des modèles ouverts réellement adaptés au français et au code.
Phase 5 : entraîner un adaptateur LoRA/QLoRA avec un petit jeu SFT de haute qualité, sur un environnement GPU adapté.
Phase 6 : mesurer le modèle adapté face au modèle initial, puis seulement tester les méthodes de préférence si un corpus de préférences fiable existe.

La prochaine étape dépend des résultats des évaluations. Ne pas appliquer toutes les techniques en bloc.

## Sources techniques

- Hugging Face TRL — SFT : https://huggingface.co/docs/trl/sft_trainer
- Hugging Face TRL — DPO : https://huggingface.co/docs/trl/dpo_trainer
- Hugging Face PEFT : https://huggingface.co/docs/peft/
- Hugging Face Datasets : https://huggingface.co/docs/datasets/
- Sentence Transformers — recherche sémantique : https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html
- Sentence Transformers — retrieval et reranking : https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html
- scikit-learn — extraction de caractéristiques : https://scikit-learn.org/stable/modules/feature_extraction.html
- scikit-learn — évaluation : https://scikit-learn.org/stable/modules/model_evaluation.html
- Survey sur l'apprentissage continu et l'oubli catastrophique : https://doi.org/10.1145/3735633
