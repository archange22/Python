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

Cette procédure SFT est un outil de recherche indépendant ; elle n'est pas reliée au sélecteur de modèles de l'application. L'application Académique utilise uniquement SUN Neural 0.1. Le script demande explicitement l'identifiant du modèle de base et peut nécessiter un GPU avec suffisamment de mémoire.

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


## 7. Évaluer les réponses d'une version de SUN

Le benchmark séparé contient 12 questions Python et conversationnelles dans \`training/evaluation/benchmark.jsonl\`. Pour ajouter les sorties d'un modèle, préparer un fichier JSONL dans lequel chaque ligne contient :
- \`id\` : l'identifiant exact d'un cas du benchmark ;
- \`response\` : le texte produit par SUN ;
- \`human_score\` : note facultative de 1 à 5 après lecture humaine.

Puis exécuter :

    python training/evaluate_responses.py --responses training/evaluation/my-responses.jsonl

L'évaluateur calcule une couverture de concepts indicative et, si des notes humaines sont présentes, leur moyenne. Les mots-clés peuvent apparaître dans une réponse fausse : relire les réponses, vérifier les références et exécuter les tests Python avant de conclure qu'un modèle est meilleur.

Documentation officielle de TRL sur les formats conversationnels du SFT : https://huggingface.co/docs/trl/en/sft_trainer


## 8. Premier modèle neuronal propre à SUN

SUN Neural 0.1 est un petit réseau neuronal multicouche (MLP) destiné à l'inférence locale dans le navigateur Android. Il utilise des caractéristiques de mots, de paires de mots et de trigrammes de caractères, puis classe le message parmi neuf intentions en français. Ses poids quantifiés int4 sont intégrés sous forme de fragments texte `apps/chat-ia/models/sun-neural-v1.part-01.txt` à `part-04.txt`, chargés localement par le worker.

**Limite essentielle : ce n'est pas un grand modèle de langage (LLM).** Il ne rédige pas librement une réponse à partir de zéro. Il reconnaît des catégories ciblées et sélectionne une explication pédagogique préparée. La première version est principalement centrée sur les bases de Python. C'est le seul modèle IA intégré à l'application ; la recherche documentaire de SUN reste un système complémentaire distinct.

Le corpus de départ contient 260 demandes synthétiques originales en français, réparties sur neuf catégories. Le fichier `training/neural/intents.jsonl.gz.b64` contient ces exemples compressés. Ils ne sont pas des conversations privées d'utilisateurs.

Pour entraîner un nouveau jeu de poids (sur un environnement Python avec PyTorch et NumPy) :

    pip install -r training/requirements.txt
    python training/train_sun_neural.py

Le script entraîne sur CPU avec PyTorch, conserve un jeu de test à part et exporte un fichier maître JSON `sun-neural-v1.json` et quatre fragments texte utilisés par le chargement local du navigateur. Les poids des couches sont quantifiés en int4. Aucun GPU n'est nécessaire pour ce petit réseau. Ce processus est distinct du fine-tuning LoRA du modèle génératif défini plus haut.

Le fichier embarqué actuel a été évalué sur un petit ensemble synthétique tenu à part : 23 réponses correctes sur 39 (59,0 % d'exactitude). Avec un seuil de confiance de 0,45, il répond sur 28 des 39 cas (71,8 % de couverture) et 22 de ces 28 classifications sont correctes (78,6 % de précision sélective). Ces chiffres ne mesurent pas les performances sur de vrais messages d'élèves et ne garantissent pas la fiabilité. Il faut élargir le corpus, faire relire les exemples et construire un benchmark humain plus représentatif avant d'étendre ses domaines.

Les tests JavaScript vérifient le chargement des poids, plusieurs intentions fréquentes et le refus de forcer une réponse Python à une question hors sujet.
