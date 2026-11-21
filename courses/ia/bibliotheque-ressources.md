# Bibliothèque de ressources externes pour SUN

Date de veille : 20 novembre 2026. Les liens suivants sont des références à consulter. La présence d'une URL ne signifie pas que le fichier a été téléchargé dans l'application. Revérifier licence, version, provenance et règles de redistribution avant toute copie ou tout entraînement.

## 1. Conversations et dialogues

### OpenAssistant Conversations (OASST1)
- Jeu de données : https://huggingface.co/datasets/OpenAssistant/oasst1
- Article : https://arxiv.org/abs/2304.07327
- PDF de l'article : https://arxiv.org/pdf/2304.07327
- Licence indiquée : Apache-2.0 ; format Parquet/JSONL compressé ; taille de la collection affichée : environ 232 MB.
- La fiche décrit 161 443 messages dans 35 langues, plus de 10 000 arbres de conversations et 461 292 évaluations de qualité.
- La répartition publiée par langue indique 4 251 messages en français.
- L'export ready-for-export contient 88 838 messages filtrés des messages supprimés et du spam ; la fiche le présente comme un point de départ adapté au SFT et au modèle de récompense.
Utilisation recommandée : préparer le corpus hors de l'application, sélectionner le français, garder les arbres de dialogue, inspecter les évaluations, retirer spam/données privées et mesurer la qualité. Les 4 251 messages français constituent un point de départ expérimental, pas une base suffisante pour rendre SUN excellent en français. Ne pas embarquer les 232 MB dans le téléchargement initial mobile.

### Claire — inventaire de corpus francophones
- Catalogue : https://github.com/OpenLLM-France/Claire-datasets
- Le catalogue distingue débats, dialogues libres, interviews, réunions, interactions d'assistance et présentations.
- Les licences varient selon chaque sous-corpus. Les comptes rendus de l'Assemblée nationale sont indiqués sous Licence Ouverte 2.0 ; Paris Stories et plusieurs corpus LinTO sont indiqués sous CC BY-SA ; plusieurs interviews et dialogues sont sous CC BY-NC-SA.
Utilisation recommandée : ne pas traiter l'ensemble comme une seule licence. Vérifier chaque source, l'attribution, les obligations de partage à l'identique et les données personnelles. Écarter les licences non commerciales si le projet devient commercial. Les débats parlementaires apprennent surtout le français formel, pas le dialogue quotidien.

### Tatoeba
- Exports : https://tatoeba.org/en/downloads
- Corpus multilingue de phrases et de traductions ; exports standard indiqués sous CC BY 2.0 France et une partie des phrases sous CC0 1.0.
- Les fichiers audio peuvent avoir des licences individuelles différentes.
Utilisation : vocabulaire, phrases, reformulations et alignement multilingue. Ce corpus n'est pas un jeu de dialogues multi-tours. Vérifier l'attribution et les licences audio.

## 2. Références Python

### Documentation officielle Python
- Documentation française : https://docs.python.org/fr/3/
- Tutoriel : https://docs.python.org/fr/3/tutorial/
- Documentation 3.15 : https://docs.python.org/3.15/
- Licence officielle : PSF License Version 2 pour le logiciel et la documentation ; les exemples, recettes et autres codes de la documentation sont également sous Zero-Clause BSD selon la page officielle : https://docs.python.org/fr/3/license.html
Contenu : types, contrôle de flux, fonctions, modules, structures de données, exceptions, fichiers, classes et bibliothèque standard. C'est la référence technique prioritaire.

### Introduction à la programmation Python — OpenStax/UOTI
- Livre en ligne en français : https://read.uotinitiative.org/read/fr-introduction-a-la-programmation-python-u8efp/
- La préface attribue l'ouvrage original à OpenStax et indique CC BY 4.0 International.
- Contenu : variables, entrées/sorties, chaînes, nombres, expressions, objets, listes, décisions et boucles.
La page vérifiée expose une version de lecture web ; ne pas prétendre qu'un PDF téléchargeable existe tant que le site n'a pas été vérifié.

### Cours de Python — Université Paris Cité
- Site : https://python.sdv.u-paris.fr/
- Auteurs : Patrick Fuchs et Pierre Poulain ; version indiquée : 8 octobre 2026.
- Licence annoncée : Creative Commons Attribution — Partage à l'identique (CC BY-SA).
- La page propose un lien « PDF du cours ».
Vérifier la licence du fichier PDF précis et respecter l'attribution et le partage à l'identique.

### Exercism
- Conditions et licences : https://exercism.org/fr/docs/using/legal/terms-of-service
- Les exercices communautaires sont annoncés comme principalement sous licence MIT, mais contrôler le fichier de licence du dépôt précis. Ne pas aspirer automatiquement les solutions publiées par les utilisateurs, dont les droits peuvent être différents.

### MBPP — Mostly Basic Python Problems
- Fiche : https://huggingface.co/datasets/google-research-datasets/mbpp
- Environ un millier de petits problèmes Python, avec énoncés, solutions et tests ; énoncés en anglais.
- Usage potentiel : benchmark de génération de fonctions simples.
- Licence à confirmer auprès de la source amont exacte avant redistribution ou entraînement. Une licence affichée par un miroir tiers ne suffit pas.

## 3. Articles et PDF de recherche IA

### RAG
- Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- Article : https://arxiv.org/abs/2005.11401
- PDF : https://arxiv.org/pdf/2005.11401
- Sujet : associer un modèle génératif à une mémoire documentaire externe pour retrouver des connaissances et conserver leur provenance.
- Utilité pour SUN : rechercher dans les cours, fournir les passages et citer les sources sans modifier les poids du modèle.

### LoRA
- LoRA: Low-Rank Adaptation of Large Language Models
- Article : https://arxiv.org/abs/2106.09685
- PDF : https://arxiv.org/pdf/2106.09685
- Sujet : adapter un modèle en entraînant de petites matrices supplémentaires plutôt que tous ses paramètres.
- Utilité pour SUN : piste de spécialisation lorsque le jeu de données et l'environnement GPU seront prêts.

### OpenAssistant
- Article : https://arxiv.org/abs/2304.07327
- PDF : https://arxiv.org/pdf/2304.07327
- Sujet : structure de conversations annotées, retours de qualité et alignement d'assistants.

### Apprentissage continu
- Survey : https://doi.org/10.1145/3735633
- Sujet : ajout de nouvelles connaissances et prévention de l'oubli catastrophique.
- Utilité pour SUN : conserver un benchmark de référence et empêcher qu'une évolution dégrade les compétences existantes.

## 4. Documentation technique pour les méthodes

- Hugging Face Datasets : https://huggingface.co/docs/datasets/
- Hugging Face TRL / SFT : https://huggingface.co/docs/trl/sft_trainer
- Hugging Face TRL / DPO : https://huggingface.co/docs/trl/dpo_trainer
- Hugging Face PEFT : https://huggingface.co/docs/peft/
- Sentence Transformers : https://www.sbert.net/
- Recherche sémantique : https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html
- Retrieval et reranking : https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html
- scikit-learn, extraction de caractéristiques : https://scikit-learn.org/stable/modules/feature_extraction.html
- scikit-learn, évaluation : https://scikit-learn.org/stable/modules/model_evaluation.html

## 5. Règles de collecte et de stockage

- Les fiches Markdown et les textes extraits sont adaptés à l'index RAG actuel d'Académique.
- Garder les PDF et corpus volumineux à leur source jusqu'à la disponibilité d'un importeur, d'un contrôle de licence et d'un stockage adapté.
- Pour chaque ressource : titre, auteur, URL, date de vérification, licence, langue, matière, format, niveau et état d'extraction.
- Distinguer « lien référencé », « texte extrait », « fichier stocké » et « données validées pour entraînement ».
- Lire un PDF ne donne pas automatiquement le droit de le redistribuer ni d'entraîner un modèle dessus.
- Vérifier la présence de données personnelles, de doublons, de contenus hors sujet et de biais dans les dialogues.
- Les conversations privées des élèves ne doivent jamais rejoindre automatiquement le corpus commun.
