# SUN — moteur conversationnel, mémoire documentaire et entraînement

## Architecture

L'application Académique expose un seul modèle : **SUN**.

- Moteur génératif : Qwen3-0.6B-Instruct, modèle de base publié sous licence Apache 2.0.
- Variante navigateur : ONNX, chargée avec Transformers.js dans un Web Worker.
- Utilisation graphique : quantification q4f16 sur WebGPU.
- Repli processeur : quantification int8 sur WASM lorsque WebGPU n'est pas disponible.
- Mémoire documentaire : index BM25 local des cours et des documents importés.
- Personnalisation future : SFT avec adaptateurs LoRA sur des exemples vérifiés.

La PWA montre uniquement le nom SUN. La fiche `training/sun-model.json` garde la provenance du modèle de base et les paramètres techniques.

## Deux sens différents du mot « apprendre »

**1. Apprendre un document (mémoire RAG).** Lorsqu'un document est importé, SUN en extrait le texte, le découpe en passages, les indexe localement, puis retrouve les extraits pertinents à chaque question. Le modèle reçoit ces passages dans son contexte et les utilise pour rédiger une réponse. Les poids du réseau ne changent pas. C'est immédiat et réversible : supprimer un document le retire de la bibliothèque.

**2. Modifier les poids du modèle (entraînement SFT/LoRA).** Cette opération nécessite un corpus d'exemples de questions et de bonnes réponses, vérifié pour ses droits, sa confidentialité et sa qualité. On prépare les données, on entraîne un adaptateur LoRA, puis on évalue le résultat. L'adaptateur entraîné n'est pas automatiquement chargé dans la PWA : il faut encore le fusionner avec le modèle de base, l'exporter en ONNX, le quantifier et tester la nouvelle version.

L'import d'un PDF ne doit donc pas déclencher un entraînement automatique. Un document peut contenir des erreurs, des instructions malveillantes ou des données personnelles. SUN le traite comme une source à consulter, pas comme une consigne.

## Préparer le corpus SFT

Le schéma d'entrée est montré dans `training/data/seed.jsonl`. Chaque ligne JSON contient un identifiant, un groupe de conversation, la provenance, la licence, l'état des droits, une revue de confidentialité, un statut qualité, une langue et une liste de messages.

Exécuter depuis la racine du dépôt :

```bash
python training/prepare_sft_dataset.py
python training/evaluate_dataset.py
python -m unittest discover -s training/tests -v
```

Le pipeline :
1. rejette les sources sans droits de réutilisation confirmés ;
2. exige une revue de confidentialité et une approbation qualité ;
3. vérifie les rôles et la structure des dialogues ;
4. filtre quelques motifs courants de secrets et d'adresses e-mail ;
5. déduplique les exemples et sépare les groupes complets en train/validation/test ;
6. produit un rapport de rejet sans recopier le texte potentiellement privé.

Le filtre automatique ne détecte pas toutes les données personnelles et ne constitue pas une validation juridique. Le corpus seed actuel est très petit ; il sert à vérifier le pipeline, pas à rendre SUN expert.

## Entraîner SUN

L'entraînement se fait sur une machine ou un service disposant de ressources suffisantes. Ce n'est pas un traitement à lancer sur un téléphone Android avec peu de mémoire.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r training/requirements.txt
python training/train_sft.py
```

Le script utilise par défaut `minpeter/Qwen3-0.6B-Instruct` et LoRA. Pour entraîner tous les poids au lieu de LoRA, utiliser explicitement `--full-finetune`. Les hyperparamètres peuvent être changés avec `--epochs`, `--batch-size`, `--gradient-accumulation`, `--learning-rate` et `--max-length`.

Le résultat est enregistré dans `training/output/sun-sft/`. **Ce script n'a pas été exécuté dans cette modification.** Le dépôt ne contient donc pas encore un adaptateur SUN entraîné sur le corpus Académique.

## Évaluation

La loss sur le jeu de test ne suffit pas. Avant d'adopter un adaptateur :
- contrôler des réponses en français ;
- vérifier Python avec des tests exécutés réellement dans un environnement isolé ;
- vérifier les calculs et unités en mathématiques et sciences ;
- évaluer les questions qui nécessitent plusieurs tours de conversation ;
- vérifier que SUN cite les bons documents et reconnaît les questions sans réponse dans la bibliothèque ;
- comparer l'ancien checkpoint et le nouveau sur exactement les mêmes cas.

Le benchmark de référence se trouve dans `training/evaluation/benchmark.jsonl`. `training/evaluate_responses.py` donne une indication de couverture de concepts et peut intégrer des notes humaines ; il ne prouve pas la vérité d'une réponse.

## Limites actuelles

- SUN est basé sur un modèle compact de 0,6 milliard de paramètres. Il peut mal comprendre une question complexe, inventer un détail ou produire du code incorrect.
- Le premier poids ONNX représente environ 648 Mo sur le chemin WebGPU q4f16 ; le repli WASM int8 représente environ 754 Mo. Les fichiers auxiliaires du tokenizer s'ajoutent à cela. Le modèle peut être trop lourd pour certains téléphones.
- Le mode WebGPU est préféré quand le navigateur le propose. Le mode WASM est un repli, pas une garantie de vitesse.
- Le modèle téléchargé est conservé dans le cache du navigateur ; la première récupération nécessite Internet.
- Le fine-tuning, la fusion d'adaptateur et la conversion ONNX personnalisée ne sont pas encore intégrés à un déploiement automatique.

## Sécurité et confidentialité

- Ne pas entraîner SUN sur des conversations privées sans consentement et revue adaptés.
- Vérifier les droits des PDF, articles, dialogues et fichiers ajoutés au corpus.
- Ne pas envoyer les documents importés vers un service externe par défaut.
- Les extraits documentaires sont des données non fiables : ils ne doivent jamais remplacer les consignes de sécurité de SUN.
- Conserver un jeu de test séparé et ne pas l'utiliser comme données d'entraînement.

## Références techniques

- Modèle navigateur : https://huggingface.co/onnx-community/Qwen3-0.6B-Instruct-ONNX
- Modèle de base pour entraînement : https://huggingface.co/minpeter/Qwen3-0.6B-Instruct
- Transformers.js : https://huggingface.co/docs/transformers.js
- Formats SFT : https://huggingface.co/docs/trl/en/sft_trainer
