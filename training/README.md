# SUN — Préparation et entraînement de données

Ce dossier sépare volontairement la bibliothèque RAG de l'entraînement neuronal.

- Le contenu de courses/ et les PDF importés sont des connaissances consultées par recherche.
- Les fichiers JSONL préparés ici servent à l'entraînement SFT d'un modèle ouvert.
- L'entraînement n'est pas lancé dans l'application Android et n'est pas exécuté sur Cloudflare Workers.

## 1. Préparer un jeu d'exemples

Le schéma d'entrée est montré dans data/seed.jsonl. Chaque ligne JSON contient :
- id : identifiant unique ;
- group_id : identifiant commun à toutes les variantes d'une même conversation ; il permet de ne pas répartir un même fil entre plusieurs splits ;
- source et license ;
- license_verified : doit être true ;
- rights_status : project_original, explicit_permission ou open_license_verified ;
- privacy_reviewed : doit être true ;
- quality_status : doit être approved ;
- language : code de langue ;
- messages : liste de messages system/user/assistant.

Les données synthétiques originales fournies comme seed sont des exemples pédagogiques créés pour le projet. Elles ne proviennent pas de conversations privées d'élèves.

Exécuter :

    python training/prepare_sft_dataset.py

Le script :
1. vérifie la structure des conversations et les métadonnées de droits ;
2. rejette les exemples non approuvés, les rôles inconnus et les messages invalides ;
3. filtre quelques motifs évidents d'adresses e-mail et de secrets, sans prétendre détecter toutes les données personnelles ;
4. déduplique les conversations ;
5. crée train.jsonl, validation.jsonl et test.jsonl à partir de groupes complets ;
6. conserve un rapport de rejets sans recopier le texte potentiellement sensible.

Une validation automatique n'est pas une validation juridique. Une personne doit toujours examiner les sources, les licences, les données personnelles et la qualité des réponses avant toute utilisation.

## 2. Auditer les jeux de données

Exécuter :

    python training/evaluate_dataset.py

L'audit vérifie que :
- les trois splits existent ;
- chaque conversation est cohérente ;
- aucun groupe de conversation ne se retrouve dans plusieurs splits ;
- aucun doublon exact n'est partagé entre train, validation et test.

Le rapport est écrit dans training/prepared/evaluation-report.json. Cette vérification structurelle ne juge pas la vérité des explications ou la qualité du code.

## 3. Installer l'environnement de fine-tuning

Utiliser de préférence un environnement séparé sur une machine ou un service GPU, pas sur un téléphone Android à stockage limité.

    python -m venv .venv
    source .venv/bin/activate
    pip install -r training/requirements.txt

Sous Windows, activer l'environnement avec .venv\Scripts\activate.

Vérifier les licences du modèle de base et sa capacité mémoire avant de le télécharger. Ne pas supposer que tout modèle hébergé est librement réutilisable.

## 4. Lancer un SFT optionnel

    python training/train_sft.py --model IDENTIFIANT_DU_MODELE --lora

Le modèle doit être un modèle causal conversationnel dont le tokenizer possède un chat_template compatible. Le paramètre --assistant-only-loss ne doit être utilisé que si le chat template gère correctement le masquage des générations assistant. Les formats conversationnels et les exigences de SFT sont documentés par Hugging Face TRL.

Le script :
- charge train et validation ;
- entraîne le modèle ou des adaptateurs LoRA ;
- évalue le split test à la fin ;
- sauvegarde le résultat et les métriques.

L'entraînement peut nécessiter un GPU avec suffisamment de mémoire. Il n'a pas été exécuté automatiquement par cette modification. N'utilise pas les trois petits modèles ONNX du navigateur comme base de ce pipeline PyTorch sans vérifier qu'ils sont compatibles : ce sont des artefacts d'inférence, pas nécessairement des checkpoints entraînables.

## 5. Mesurer la qualité réelle

La loss de validation/test mesure une capacité de prédiction des tokens, pas toute la qualité d'un assistant. Avant de remplacer le modèle utilisé par SUN, ajouter un benchmark indépendant :
- conversations quotidiennes et abréviations ;
- questions de suivi qui utilisent l'historique ;
- Python débutant, intermédiaire et avancé ;
- exécution réelle de tests de code dans un environnement isolé ;
- compréhension de documents avec références exactes ;
- questions non présentes dans la base et capacité à reconnaître l'incertitude ;
- français, anglais et autres langues réellement visées.

Comparer les mêmes cas sur le modèle d'origine et sur le modèle adapté. Garder la version d'origine en repli si le nouveau modèle régresse.

## 6. Sécurité et confidentialité

- Ne jamais verser automatiquement les conversations privées des élèves dans ce jeu.
- Utiliser uniquement des données dont la provenance, la licence et les droits sont documentés.
- Retirer les données personnelles et secrets avant entraînement.
- Ne pas entraîner sur les données de test.
- Garder des traces des versions de corpus, scripts, modèle et paramètres.
- Ne jamais considérer les réponses synthétiques comme exactes sans contrôle.
