# SUN — moteur neuronal génératif, mémoire documentaire et apprentissage

## Architecture du modèle

L'application Académique expose un seul modèle IA : **SUN**.

- Architecture neuronale : modèle Transformer autoregressif préentraîné d'environ 0,6 milliard de paramètres.
- Checkpoint de base : `minpeter/Qwen3-0.6B-Instruct`, publié sous licence Apache 2.0.
- Inférence navigateur : variante ONNX `onnx-community/Qwen3-0.6B-Instruct-ONNX`.
- Exécution : Transformers.js 4.3.2 dans un Web Worker, avec ONNX Runtime Web.
- WebGPU : quantification q4f16, poids principaux d'environ 648 Mio.
- Repli CPU/WASM : quantification int8, poids principaux d'environ 754 Mio.
- Dialogue : contexte des derniers messages, consignes de SUN, génération token par token.
- Connaissances : recherche documentaire BM25 séparée, qui injecte les extraits les plus pertinents.
- Adaptation des poids : SFT avec adaptateurs LoRA ; entraînement configuré mais non exécuté dans ce dépôt.

Le nom visible dans l'application est SUN. Le modèle de base est indiqué dans `training/sun-model.json` pour conserver la traçabilité. SUN est une identité de modèle personnalisée construite à partir d'un Transformer préentraîné : ce n'est pas un LLM entièrement créé de zéro.

## Deux façons différentes pour SUN d'apprendre

**1. Mémoire documentaire (RAG).** Lorsqu'un document est importé, SUN extrait son texte, le découpe en passages, les indexe localement, puis retrouve les extraits pertinents à chaque question. Le modèle reçoit ces passages dans son contexte et les utilise pour rédiger une réponse. Les poids neuronaux ne changent pas. C'est immédiat et réversible : supprimer le document le retire de la bibliothèque.

**2. Entraînement des poids (SFT/LoRA).** Cette opération utilise des exemples de questions et de bonnes réponses vérifiés pour les droits, la confidentialité et la qualité. On prépare les données, on entraîne un adaptateur LoRA, puis on évalue le résultat. L'adaptateur n'est pas automatiquement chargé dans la PWA : il faut encore le fusionner, l'exporter en ONNX, le quantifier et tester la nouvelle version.

Importer un PDF ne doit donc pas déclencher un entraînement automatique. Un document peut contenir des erreurs, des instructions trompeuses ou des données privées. SUN le traite comme une source à consulter, pas comme une consigne.

## Corpus actuel

Le corpus `training/data/seed.jsonl` contient **126 exemples originaux** créés pour le projet. Ils couvrent le français et l'anglais, les conversations et les domaines suivants : mathématiques, physique, chimie, Python, JavaScript, Java, C, HTML/CSS, SQL et méthodes d'apprentissage.

Ce corpus sert à établir un premier réglage supervisé et à tester la chaîne technique. **126 exemples restent très peu pour spécialiser correctement un LLM** : ils ne suffisent pas à faire de SUN un expert. Il faudra l'enrichir par étapes avec des dialogues originaux, relus et testés.

Chaque entrée contient la provenance, la licence, le statut des droits, la revue de confidentialité, le statut qualité, la langue, le domaine, le niveau et les messages. Les données ne sont pas tirées de conversations privées.

## Préparer et auditer les données

À exécuter depuis la racine du dépôt :

```bash
python training/prepare_sft_dataset.py
python training/evaluate_dataset.py
python -m unittest discover -s training/tests -v
```

Le pipeline :
1. refuse les sources sans droits de réutilisation confirmés ;
2. exige une revue de confidentialité et une approbation qualité ;
3. vérifie les rôles et la structure des dialogues ;
4. filtre quelques motifs courants de secrets et d'adresses e-mail ;
5. déduplique les exemples ;
6. sépare les conversations entières en train/validation/test, avec une répartition stratifiée par domaine ;
7. produit un rapport avec le nombre d'exemples par domaine et par sous-ensemble, sans recopier les textes rejetés.

Le filtrage automatique ne détecte pas toutes les données personnelles et ne constitue pas une validation juridique.

## Entraîner SUN avec LoRA

L'entraînement doit être fait sur une machine ou un service avec GPU adapté. Il ne faut pas lancer ce processus sur un téléphone Android avec peu de mémoire.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r training/requirements.txt
python training/prepare_sft_dataset.py
python training/evaluate_dataset.py
python training/train_sft.py
```

Le script utilise par défaut `minpeter/Qwen3-0.6B-Instruct` et LoRA. La loss est calculée par défaut uniquement sur les réponses assistant, et le template Qwen3 est pris en charge par TRL. Les paramètres modifiables comprennent `--epochs`, `--batch-size`, `--gradient-accumulation`, `--learning-rate`, `--max-length`, `--lora-rank` et `--lora-alpha`.

Pour désactiver LoRA et entraîner tous les poids (beaucoup plus exigeant), utiliser `--full-finetune`. Pour calculer la loss sur tous les tokens, utiliser `--full-sequence-loss`.

Le résultat est enregistré dans `training/output/sun-sft/`. Avec LoRA, ce dossier contient un adaptateur, pas un nouveau modèle ONNX prêt pour Android.

## Fusionner et évaluer l'adaptateur

Après un entraînement réussi :

```bash
python training/merge_sun_lora.py
python training/evaluate_sun_model.py --model-dir training/output/sun-merged
python training/evaluate_responses.py --responses training/evaluation/sun-responses.jsonl
```

- `merge_sun_lora.py` fusionne l'adaptateur LoRA avec son checkpoint de base et écrit un checkpoint Transformers fusionné.
- `evaluate_sun_model.py` pose au checkpoint les 37 questions du benchmark et enregistre ses réponses.
- `evaluate_responses.py` calcule une couverture indicative des concepts attendus et peut intégrer des notes humaines.

La fusion ne convertit pas le checkpoint en ONNX et ne le déploie pas dans l'application. L'export et la quantification doivent être réalisés séparément, puis testés sur un appareil avant de remplacer le modèle actuel.

## Évaluer la qualité réelle

La perte sur le jeu de test ne suffit pas. Avant d'adopter un adaptateur :
- contrôler des réponses en français et en anglais ;
- vérifier les mathématiques avec les étapes et les unités ;
- contrôler les explications de physique et de chimie avec des références fiables ;
- vérifier Python, JavaScript, Java, C, HTML/CSS et SQL avec des tests exécutés réellement ;
- évaluer les questions de suivi qui dépendent de plusieurs tours ;
- vérifier que SUN cite les bons documents et reconnaît les questions sans réponse dans la bibliothèque ;
- comparer la version de base et la version adaptée sur exactement les mêmes cas.

Le benchmark se trouve dans `training/evaluation/benchmark.jsonl`. Les mots-clés attendus donnent un indice, pas une preuve de vérité : une réponse peut contenir le bon mot et être incorrecte.

## Limites actuelles

- SUN est basé sur un modèle compact de 0,6 milliard de paramètres. Il peut mal comprendre une demande complexe, faire une erreur factuelle ou produire du code incorrect.
- Les poids principaux représentent environ 648 Mio en q4f16 WebGPU ou 754 Mio en int8 WASM. Le tokenizer et la mémoire de calcul s'ajoutent à ces valeurs ; certains téléphones ne pourront pas charger le modèle.
- WebGPU est préféré lorsqu'il est disponible. WASM est un repli et n'est pas garanti rapide.
- Le premier téléchargement exige Internet ; les fichiers sont ensuite conservés dans le cache du navigateur.
- Le fine-tuning n'a pas encore été exécuté, aucun adaptateur n'est inclus et la PWA utilise encore le checkpoint ONNX public non adapté.
- Aucun test de génération de bout en bout sur un appareil Android n'est déclaré réussi à ce stade.

## Confidentialité et sécurité

- Ne pas entraîner SUN sur des conversations privées sans consentement et revue adaptés.
- Vérifier les droits de chaque PDF, article, dialogue et fichier ajouté au corpus.
- Les documents importés restent dans le stockage local du navigateur selon le module d'importation.
- Les extraits documentaires sont des données non fiables et ne doivent jamais remplacer les consignes de SUN.
- Garder le jeu de test séparé et ne jamais l'utiliser comme données d'entraînement.

## Références techniques

- Checkpoint de base : https://huggingface.co/minpeter/Qwen3-0.6B-Instruct
- Variante ONNX : https://huggingface.co/onnx-community/Qwen3-0.6B-Instruct-ONNX
- Transformers.js : https://huggingface.co/docs/transformers.js
- Formats conversationnels SFT : https://huggingface.co/docs/trl/en/sft_trainer
