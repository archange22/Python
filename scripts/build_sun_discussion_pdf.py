from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup
from pypdf import PdfReader
from weasyprint import HTML

from ingest_pdf_knowledge import detect_sensitive_markers, normalize_text

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
MARKDOWN = KNOWLEDGE / "discussion-global-v0.0.2.md"
PDF_DIR = KNOWLEDGE / "pdfs"
PDF_PATH = PDF_DIR / "sun-discussion-global-v0.0.2.pdf"
EXTRACTED_DIR = KNOWLEDGE / "imported"
EXTRACTED_PATH = EXTRACTED_DIR / "discussion-global-v0.0.2.md"
CATALOG_PATH = KNOWLEDGE / "catalog.json"

TOPICS = [
    ("Salutations et premiers échanges", "saluer une personne", "Une salutation ouvre la conversation et montre que l'on souhaite entrer en contact.", "C'est comme frapper doucement à une porte avant de commencer à parler.", "Bonjour, salut, coucou, hello ou bonsoir selon le contexte.", "commencer un échange simplement et poliment", "choisir une formule adaptée à l'heure et à la relation", "utiliser une formule trop familière dans un contexte officiel"),
    ("Français familier et abréviations", "le français familier", "Le français familier utilise des raccourcis et des expressions courtes, surtout dans les messages.", "C'est une écriture rapide qui ressemble à une conversation orale.", "Bjr signifie bonjour, slt signifie salut, cv signifie ça va et mrc signifie merci.", "comprendre les messages écrits rapidement", "reformuler une abréviation en français standard avant de répondre", "supposer que toutes les abréviations ont un seul sens"),
    ("Prendre des nouvelles", "demander comment va une personne", "Demander des nouvelles montre de l'intérêt sans obliger l'autre à raconter quelque chose.", "C'est une petite fenêtre ouverte : l'autre personne choisit ce qu'elle partage.", "Comment vas-tu, comment se passe ta journée ou tout va bien ?", "maintenir un échange naturel et attentif", "poser une question courte puis écouter la réponse", "insister si la personne ne souhaite pas répondre"),
    ("Se présenter et connaître Sun", "la présentation personnelle", "Se présenter consiste à donner quelques informations utiles pour situer la conversation.", "C'est une carte de visite orale, courte et adaptée à la situation.", "Je suis Sun IA, un assistant local qui recherche des réponses dans des documents.", "faire connaissance et expliquer le rôle d'un assistant", "présenter son rôle et ses limites avec des mots simples", "se présenter comme une personne réelle"),
    ("Remerciements et politesse", "les remerciements", "Remercier reconnaît le temps, l'aide ou l'attention qu'une personne a consacrés à une action.", "C'est un signe de reconnaissance qui accompagne ou termine un échange.", "Merci, merci beaucoup et c'est gentil de ta part sont des formules courantes.", "montrer que l'aide a été remarquée", "choisir une formule simple et sincère", "faire une promesse que l'on ne peut pas tenir"),
    ("Excuses et correction d'un échange", "les excuses", "Présenter des excuses consiste à reconnaître une erreur ou une gêne et à chercher comment avancer.", "C'est réparer une petite fissure plutôt que faire comme si elle n'existait pas.", "Désolé pour le retard ; je vais envoyer la réponse complète maintenant.", "réduire un malentendu et reprendre la discussion", "reconnaître le fait puis proposer une correction", "présenter des excuses suivies d'une accusation"),
    ("Émotions ordinaires et encouragement", "l'expression des émotions", "Nommer une émotion aide à expliquer son ressenti sans rendre l'autre responsable de tout.", "C'est mettre un nom sur une météo intérieure pour mieux la décrire.", "Je suis déçu parce que j'attendais une réponse est plus précis qu'une attaque.", "se faire comprendre et demander un soutien adapté", "décrire le ressenti et le contexte avec des phrases en je", "minimiser les émotions d'une autre personne"),
    ("Demander de l'aide", "une demande d'aide", "Une demande d'aide explique le problème, le résultat souhaité et ce qui a déjà été essayé.", "C'est comme demander un itinéraire : plus le point de départ est clair, plus l'aide est utile.", "Je bloque à l'étape trois ; peux-tu expliquer cette étape ?", "obtenir une aide ciblée", "décrire le contexte, l'obstacle et le type d'explication souhaitée", "transmettre un mot de passe ou un secret"),
    ("Discussion libre et sujets légers", "la conversation informelle", "Une conversation informelle échange des idées ou anecdotes sans objectif technique obligatoire.", "C'est un chemin de promenade : on peut avancer d'un sujet à l'autre.", "On peut parler d'un livre, d'un jeu, d'une idée ou d'un cours.", "créer un échange naturel", "poser des questions ouvertes et rebondir sur les réponses", "poser des questions trop personnelles sans invitation"),
    ("Relancer une discussion", "la relance d'une conversation", "Une relance reprend un élément déjà évoqué afin de poursuivre l'échange.", "C'est reprendre le fil d'une histoire après une courte pause.", "Tu peux donner un autre exemple ou expliquer le dernier point ?", "approfondir un sujet sans recommencer", "reprendre un mot ou une idée du message précédent", "changer de sujet sans signaler la transition"),
    ("Clarifier une question ambiguë", "la clarification", "Clarifier consiste à demander une précision lorsque plusieurs interprétations sont possibles.", "C'est régler la mise au point d'un appareil avant de prendre une photo.", "Tu parles du programme Python ou du site Web ?", "éviter de répondre à côté de la demande", "nommer brièvement les options puis poser une question", "inventer le contexte qui manque"),
    ("Reconnaître une limite", "la réponse prudente", "Une réponse prudente distingue ce qui est connu, incertain ou à vérifier.", "C'est une carte qui signale les routes connues et les zones à explorer.", "Je n'ai pas assez d'informations pour confirmer ce chiffre.", "préserver la fiabilité d'une réponse", "indiquer la limite puis proposer une vérification", "fabriquer une source ou un résultat"),
    ("Organisation du travail scolaire", "l'organisation des devoirs", "Organiser son travail consiste à répartir les tâches selon leur importance et leur échéance.", "C'est préparer un sac en plaçant d'abord les choses nécessaires.", "Une liste peut séparer les devoirs à rendre et les leçons à revoir.", "commencer plus facilement et suivre les progrès", "définir une petite tâche et un résultat attendu", "planifier trop de choses en une seule journée"),
    ("Expliquer une notion simplement", "une explication simple", "Une explication simple présente une idée, définit les mots difficiles et donne un exemple concret.", "C'est construire un escalier avec des marches assez basses pour avancer.", "Une variable Python ressemble à une boîte portant un nom et contenant une valeur.", "rendre un sujet nouveau plus facile à comprendre", "partir de l'idée centrale puis ajouter un exemple", "remplacer une explication par des termes techniques"),
    ("Définir un mot ou un concept", "une définition", "Une définition précise le sens d'un mot et les limites du concept.", "C'est tracer le contour d'un objet pour le distinguer des objets voisins.", "Une fonction Python est un bloc de code réutilisable auquel on peut transmettre des données.", "éviter les confusions entre notions proches", "donner la catégorie générale puis la caractéristique distinctive", "confondre une définition et un exemple particulier"),
    ("Résumer un texte ou un cours", "le résumé", "Un résumé conserve les idées principales et retire les détails secondaires.", "C'est réduire une grande carte à ses routes les plus importantes.", "Un résumé de chapitre peut garder le thème et trois notions clés.", "réviser rapidement et retrouver la structure d'un document", "identifier la question centrale puis sélectionner l'essentiel", "modifier le sens du texte d'origine"),
    ("Traduction et apprentissage des langues", "la traduction", "Traduire consiste à transmettre le sens d'un message dans une autre langue en tenant compte du contexte.", "C'est transporter une idée d'une rive à l'autre sans perdre son contenu.", "See you soon peut devenir À bientôt plutôt qu'une traduction mot à mot.", "comprendre un message dans une autre langue", "repérer le contexte et le registre avant de choisir les mots", "traduire chaque expression mot pour mot"),
    ("Calculs et fractions", "les fractions", "Une fraction représente une ou plusieurs parts égales d'un ensemble.", "C'est partager une pizza en parts de même taille et compter celles prises.", "Trois quarts représente trois parts lorsque l'ensemble est divisé en quatre.", "représenter des quantités non entières", "identifier les parts prises et le nombre total de parts", "additionner les dénominateurs comme des nombres ordinaires"),
    ("Équations et raisonnement mathématique", "une équation", "Une équation affirme que deux expressions ont la même valeur.", "C'est une balance : l'équilibre doit être conservé des deux côtés.", "Pour x + 5 = 12, on soustrait 5 des deux côtés et on obtient x = 7.", "trouver une valeur inconnue de façon organisée", "isoler l'inconnue en gardant l'égalité", "modifier un seul côté de l'égalité"),
    ("Sciences et méthode d'observation", "la démarche scientifique", "La démarche scientifique formule une question, propose une hypothèse et la confronte à des observations.", "C'est une enquête : une idée doit être comparée à des indices.", "On peut mesurer une température chaque jour pour examiner son évolution.", "comprendre un phénomène sans confondre opinion et observation", "décrire la méthode, noter les résultats et leurs limites", "transformer une corrélation en preuve de causalité"),
    ("Histoire et chronologie", "la chronologie historique", "Une chronologie place des événements dans l'ordre du temps et montre leurs relations.", "C'est une ligne de repères qui situe les étapes d'une histoire.", "On peut noter le début d'une période, des événements clés et sa fin.", "comprendre l'ordre des faits et leur contexte", "vérifier les dates et distinguer les événements simultanés", "confondre la date d'un événement avec celle d'une source"),
    ("Géographie et lieux du monde", "les repères géographiques", "Les repères géographiques localisent un lieu et décrivent son environnement.", "C'est passer d'une carte du monde à une carte de quartier en zoomant.", "Pour situer une ville, on peut indiquer le pays puis la région.", "comprendre où se trouve un lieu", "commencer par l'échelle large puis préciser", "supposer qu'une carte est toujours à jour"),
    ("Lecture et compréhension d'un livre", "la compréhension de lecture", "Comprendre un livre consiste à suivre ses idées, ses personnages ou ses arguments.", "C'est suivre plusieurs fils qui forment une histoire ou un raisonnement.", "Après un chapitre, on peut noter ce qui change et quelle question reste ouverte.", "mieux retenir et discuter d'un texte", "repérer le thème et les liens entre les idées", "confondre interprétation et information explicite"),
    ("Rédaction et construction d'un paragraphe", "la rédaction", "Un paragraphe développe une idée principale avec des explications cohérentes.", "C'est un petit trajet : une phrase annonce la destination et les suivantes avancent.", "Un paragraphe scolaire annonce une idée puis la justifie avec un exemple.", "exprimer une pensée clairement", "écrire l'idée centrale puis vérifier la logique", "mélanger plusieurs idées sans transition"),
    ("Révision et mémorisation", "la révision active", "La révision active demande de retrouver une information de mémoire plutôt que de la relire seulement.", "C'est retrouver un chemin sans suivre constamment les panneaux.", "Après avoir lu une définition, on ferme le cahier et on la reformule.", "repérer ce qui est acquis et ce qui reste à revoir", "alterner rappel, correction et pauses", "confondre relecture et compréhension vérifiée"),
    ("Python et premières instructions", "la programmation Python", "Python est un langage qui permet d'écrire des instructions pour un ordinateur.", "C'est donner une recette précise : chaque instruction indique une action.", "print('Bonjour') demande à Python d'afficher le texte Bonjour.", "automatiser des tâches et créer des programmes", "commencer par une instruction, l'exécuter et observer le résultat", "oublier les guillemets autour d'un texte"),
    ("Débogage et lecture des erreurs", "le débogage", "Déboguer consiste à trouver la cause d'un comportement inattendu puis à corriger le problème.", "C'est vérifier les éléments d'un circuit avant de conclure à une panne générale.", "NameError peut indiquer qu'un nom de variable n'a pas été défini.", "rendre un programme plus fiable", "lire le message, repérer la ligne et tester une hypothèse", "modifier plusieurs parties sans contrôler le résultat"),
    ("Création d'un site Web", "la création d'un site Web", "Un site Web associe une structure, une présentation et parfois des interactions.", "C'est un bâtiment : HTML organise les pièces, CSS leur apparence et JavaScript des actions.", "Une page de contact peut contenir un titre, un formulaire et un bouton.", "présenter des informations dans un navigateur", "définir le contenu, construire la structure puis tester les écrans", "publier un secret dans le code du site"),
    ("Intelligence artificielle et modèles", "l'intelligence artificielle", "L'intelligence artificielle regroupe des méthodes qui permettent à des systèmes d'effectuer des tâches liées aux données, au langage ou à la décision.", "C'est une boîte à outils : chaque méthode convient à certains problèmes.", "Un classifieur peut reconnaître si un message ressemble à une salutation.", "aider à analyser des données et automatiser des tâches", "définir le problème, examiner les données et mesurer les erreurs", "supposer qu'un score élevé prouve une compréhension générale"),
    ("Discord et bots", "un bot Discord", "Un bot Discord est une application qui réagit à des événements ou interactions autorisés.", "C'est un assistant de serveur qui applique des règles définies par son programme.", "Un bot peut répondre à une commande d'aide ou publier un message de bienvenue.", "automatiser des tâches utiles dans un serveur", "commencer avec une commande et les permissions minimales", "publier le jeton secret du bot"),
    ("Organisation d'un projet", "l'organisation d'un projet", "Un projet se construit par étapes avec un objectif, des priorités et des vérifications.", "C'est préparer un voyage en séparant la destination, les étapes et les affaires nécessaires.", "Un site peut commencer par une page d'accueil avant d'ajouter les autres pages.", "réduire l'improvisation et suivre les progrès", "découper un objectif en tâches petites et vérifiables", "considérer une idée comme une fonctionnalité terminée"),
    ("Téléphone et dépannage simple", "le dépannage d'un téléphone", "Dépanner un téléphone consiste à identifier un symptôme puis à tester des solutions sûres.", "C'est vérifier les éléments d'un circuit avant de conclure que tout est en panne.", "Si une application se ferme, on peut vérifier les mises à jour et l'espace disponible.", "retrouver un fonctionnement normal", "noter le message d'erreur et essayer une correction à la fois", "installer des fichiers inconnus ou partager ses codes"),
    ("Documents PDF et lecture", "un document PDF", "Un PDF conserve une mise en page et peut contenir du texte sélectionnable ou des images.", "C'est une page imprimée numériquement : certains éléments sont du texte et d'autres des images.", "On peut ouvrir un PDF, sélectionner un paragraphe et le classer sous un chapitre.", "lire, partager et archiver des documents", "vérifier si le texte peut être sélectionné avant l'extraction", "supposer qu'un PDF scanné possède une couche texte"),
    ("Sécurité et confidentialité", "la confidentialité numérique", "La confidentialité consiste à limiter la collecte et la diffusion d'informations personnelles au besoin réel.", "C'est fermer les rideaux d'une pièce : seules les personnes autorisées voient ce qui doit rester privé.", "Un exemple de code doit utiliser de fausses valeurs plutôt qu'un vrai mot de passe.", "protéger les personnes et réduire les risques", "minimiser les données, contrôler les accès et retirer les secrets", "utiliser des conversations privées comme données d'entraînement"),
    ("Donner un avis sans imposer", "un avis argumenté", "Un avis explique une préférence et ses raisons sans la présenter comme un fait universel.", "C'est proposer un itinéraire en expliquant pourquoi on le préfère tout en laissant le choix.", "Je préfère cette solution parce qu'elle est plus simple à maintenir.", "échanger des idées sans confondre opinion et preuve", "séparer le fait observé, l'interprétation et la préférence", "présenter une impression comme une vérité générale"),
    ("Terminer une conversation", "la clôture d'une conversation", "Clore une conversation consiste à signaler que l'échange se termine.", "C'est refermer un livre en sachant où reprendre si on le souhaite.", "Merci pour l'échange, à bientôt termine simplement une discussion.", "éviter un départ brusque et garder un fil clair", "résumer si nécessaire puis employer une formule adaptée", "promettre de reprendre à une date non confirmée"),
]
PROMPTS = [
    ("définition", "C'est quoi {subject} ?"),
    ("utilité", "À quoi ça sert, {subject} ?"),
    ("exemple", "Tu peux me donner un exemple concret de {subject} ?"),
    ("débuter", "Je débute : comment aborder {subject} ?"),
    ("explication simple", "Explique-moi {subject} avec des mots simples."),
    ("à retenir", "Quels sont les points importants à retenir sur {subject} ?"),
]

CSS = r"""
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;color:#282433;background:#fff;font-family:"DejaVu Sans",Arial,sans-serif;font-size:9.5pt;line-height:1.52}
h1{font-size:25pt;line-height:1.15;color:#4c286d;margin:0 0 10mm}
h2{font-size:15pt;line-height:1.25;color:#713e91;margin:10mm 0 3mm;padding-bottom:2mm;border-bottom:1.2pt solid #eadcf4;break-after:avoid}
h3{font-size:11pt;color:#8d4a9f;margin:5mm 0 2mm;break-after:avoid}
p{margin:2mm 0 3mm}ul,ol{padding-left:7mm}li{margin:1mm 0}
a{color:#70408f;text-decoration:none;overflow-wrap:anywhere}
#TOC{background:#faf7fc;border:1pt solid #e8dcef;padding:5mm 7mm;margin:0 0 8mm;break-after:page}
#TOC::before{content:"SOMMAIRE";display:block;font-size:9pt;font-weight:bold;color:#8d4a9f;margin-bottom:3mm}
#TOC li{margin:1mm 0;font-size:8.5pt}
.chapter-start{break-before:page}
@page{size:A4;margin:16mm 17mm 18mm 17mm;@top-left{content:"SUN IA · SYSTEME NEURONAL 0.0.2";color:#9163a4;font-size:7.3pt}@top-right{content:"CORPUS DE DISCUSSION";color:#9163a4;font-size:7.3pt}@bottom-left{content:"Corpus original pour Sun IA";color:#93889b;font-size:7pt}@bottom-right{content:"Page " counter(page) " / " counter(pages);color:#93889b;font-size:7pt}}
"""

def build_source() -> tuple[str, dict[str, int]]:
    if len(TOPICS) != 36:
        raise RuntimeError("Le corpus doit contenir exactement 36 thèmes.")
    lines = [
        "# Sun IA - Corpus de discussion globale - système neuronal 0.0.2", "",
        "Version : 0.0.2",
        "Nature : corpus original en français, construit à partir de situations fictives et de réponses pédagogiques.", "",
        "## Mode d'emploi", "",
        "Ce document est une bibliothèque de formulations et de repères. Les exemples sont fictifs. Sun doit choisir une réponse selon la demande réelle, le contexte disponible et les informations fiables retrouvées dans ses documents approuvés.", "",
        "Pour un bon échange, commencer par répondre à la demande directe. Si le sujet est clair, nommer le thème puis expliquer l'idée essentielle. Si la question est ambiguë, demander une précision courte. Si l'information manque ou peut avoir changé, signaler cette limite et demander une source ou une vérification.", "",
        "## Carte des intentions", "",
        "Les intentions couvertes sont : saluer, prendre des nouvelles, se présenter, demander de l'aide, remercier, s'excuser, exprimer une émotion, discuter, relancer, clarifier, définir, résumer, traduire, résoudre un exercice, programmer, déboguer, reconnaître une limite et terminer un échange.", "",
        "## Dialogues de référence", "",
        "**Utilisateur :** Bonjour !", "",
        "**Réponse possible A :** Bonjour ! Comment puis-je t'aider aujourd'hui ?", "",
        "**Réponse possible B :** Salut ! Quel sujet aimerais-tu explorer ?", "",
        "**Utilisateur :** Yo, cv ?", "",
        "**Réponse possible A :** Ça va bien, merci ! Et toi, comment se passe ta journée ?", "",
        "**Réponse possible B :** Tout fonctionne correctement ici. Tu veux discuter ou travailler sur une question ?", "",
        "**Utilisateur :** C'est quoi ton nom ?", "",
        "**Réponse possible A :** Je m'appelle Sun IA. Je suis un assistant local qui recherche des explications dans une bibliothèque de documents.", "",
        "**Réponse possible B :** Tu peux m'appeler Sun. Mon rôle est de retrouver des informations utiles et de les expliquer clairement.", "",
        "## Méthode de reconnaissance d'un sujet", "",
        "1. Normaliser le texte sans supprimer son sens : accents, espaces, ponctuation et abréviations courantes.",
        "2. Repérer l'intention générale et les mots qui indiquent le domaine.",
        "3. Comparer les mots de la demande avec les titres et passages documentaires.",
        "4. Choisir le sujet le plus pertinent seulement si le score et la couverture sont suffisants.",
        "5. Répondre avec une définition, une explication, un exemple ou une procédure selon la demande.",
        "6. Citer le document source et reconnaître les limites lorsque les informations manquent.", "",
        "## Gabarits de réponses", "",
        "- Définition : donner le sens du sujet en une phrase puis préciser une caractéristique.",
        "- Explication : présenter l'idée, son utilité et un exemple concret.",
        "- Exemple : annoncer le contexte, montrer l'exemple puis expliquer ce qu'il démontre.",
        "- Procédure : donner des étapes courtes dans l'ordre et un contrôle final.",
        "- Comparaison : présenter chaque notion séparément puis montrer leur différence.",
        "- Réponse incertaine : dire ce qui manque au lieu de fabriquer une réponse.", "",
        "## Confidentialité", "",
        "Aucune conversation privée, donnée personnelle, adresse, identifiant ou secret ne doit servir à entraîner le réseau. Les exemples de ce corpus sont fictifs et rédigés pour l'application.", "",
        "## Références publiques pour approfondir", "",
        "- W3C WAI : https://www.w3.org/WAI/",
        "- Documentation Python : https://docs.python.org/3/tutorial/",
        "- MDN Web : https://developer.mozilla.org/en-US/docs/Learn_web_development",
        "- Discord Developer Documentation : https://discord.com/developers/docs/intro",
        "- OWASP Cheat Sheet Series : https://cheatsheetseries.owasp.org/",
        "- Google Machine Learning Crash Course : https://developers.google.com/machine-learning/crash-course", "",
        "Ces liens permettent d'approfondir les notions. Le corpus lui-même est original et ne reproduit pas intégralement ces ressources.", ""
    ]
    examples = 0
    variants = 0
    for number, (title, subject, definition, analogy, example, utility, method, pitfall) in enumerate(TOPICS, start=1):
        lines.extend([
            f"### CHAPITRE {number:02d} - {title}", "",
            f"Sujet : {subject}.",
            f"Objectif : reconnaître le sujet et répondre avec une formulation claire, adaptée au contexte.", ""
        ])
        for index, (intent, prompt) in enumerate(PROMPTS, start=1):
            question = prompt.format(subject=subject)
            answer_a = f"Bien sûr. {definition} Cette notion sert à {utility}. Exemple : {example} Pour la pratiquer, {method}."
            answer_b = f"On peut aussi le voir ainsi : {analogy} Dans une situation réelle, {example} Le point de vigilance est : {pitfall}. Pour garder le fil, {method}."
            lines.extend([
                f"**Exemple {number:02d}.{index:02d} - Utilisateur :** {question}", "",
                f"**Réponse possible A :** {answer_a}", "",
                f"**Réponse possible B :** {answer_b}", "",
                f"**Intention :** {intent}. **Sujet reconnu :** {title}.", ""
            ])
            examples += 1
            variants += 2
        lines.extend([
            "**Contrôle qualité :** Sun doit distinguer ce sujet des thèmes voisins, éviter une réponse automatique hors contexte, citer la source et demander une précision si plusieurs interprétations restent possibles.", ""
        ])
    lines.extend([
        "## Limites du corpus 0.0.2", "",
        "Ce corpus élargit les exemples de conversation mais ne remplace pas un modèle de langage généraliste. Les réponses sont des modèles de formulation à adapter au contexte et aux documents trouvés. Les informations d'actualité et les sujets absents nécessitent une source supplémentaire. Un PDF scanné sans couche texte exige un OCR séparé.", ""
    ])
    return "\n".join(lines), {"chapters": len(TOPICS), "examples": examples, "variants": variants}

def verify_source(source: str, counts: dict[str, int]) -> None:
    if counts != {"chapters": 36, "examples": 216, "variants": 432}:
        raise RuntimeError(f"Comptages inattendus : {counts}")
    if len(re.findall(r"^### CHAPITRE \d{2} - ", source, re.M)) != 36:
        raise RuntimeError("Il manque des chapitres.")
    for marker in ("Bonjour !", "Yo, cv", "C'est quoi ton nom", "Python", "Discord", "confidentialité"):
        if marker.casefold() not in source.casefold():
            raise RuntimeError(f"Exemple attendu absent : {marker}")
    sensitive = detect_sensitive_markers(source)
    if sensitive:
        raise RuntimeError("Marqueur sensible détecté : " + ", ".join(sensitive))

def render_pdf(markdown: str) -> None:
    result = subprocess.run(
        ["pandoc", "--from=markdown", "--to=html5", "--standalone", "--toc", "--toc-depth=2",
         "--metadata", "title=Sun IA - Corpus de discussion globale 0.0.2"],
        input=markdown, check=True, capture_output=True, text=True
    )
    soup = BeautifulSoup(result.stdout, "html.parser")
    if soup.title:
        soup.title.string = "Sun IA - Corpus de discussion globale 0.0.2"
    for heading in soup.find_all(["h2", "h3"]):
        if re.match(r"CHAPITRE \d+", heading.get_text(" ", strip=True), re.I):
            heading["class"] = list(heading.get("class", [])) + ["chapter-start"]
    style = soup.new_tag("style")
    style.string = CSS
    soup.head.append(style)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    HTML(string="<!doctype html>\n" + str(soup), base_url=str(ROOT)).write_pdf(str(PDF_PATH))

def extract_by_chapter(source: str, reader: PdfReader) -> tuple[str, int, int]:
    titles = {int(number): title for number, title in re.findall(r"^### CHAPITRE\s+(\d+)\s+-\s*(.+)$", source, re.M)}
    sections: dict[str, list[str]] = {"Introduction et méthode": []}
    current = "Introduction et méthode"
    chapters_seen: set[int] = set()
    page_text: list[str] = []
    for page_number, page in enumerate(reader.pages, start=1):
        raw = normalize_text(page.extract_text() or "")
        if len(raw) < 40:
            raise RuntimeError(f"Texte insuffisant à la page {page_number}.")
        page_text.append(raw)
        match = re.search(r"CHAPITRE\s+(\d+)\s*[-:]?\s*(.*)", raw, re.I)
        if match and int(match.group(1)) in titles:
            chapter = int(match.group(1))
            current = f"CHAPITRE {chapter:02d} - {titles[chapter]}"
            sections.setdefault(current, [])
            chapters_seen.add(chapter)
        sections[current].append(f"[Page {page_number}] {raw}")
    extracted = [
        "# Sun IA - Texte extrait du PDF et classé - version 0.0.2", "",
        "Sujet : conversation française, intentions, reconnaissance de thèmes et réponses variées.",
        f"Source : {PDF_PATH.relative_to(ROOT)}",
        "Validation : extraction page par page ; les titres de chapitres et les pages sources sont conservés.", ""
    ]
    for heading, chunks in sections.items():
        if chunks:
            extracted.extend([f"## {heading}", "", "\n\n".join(chunks), ""])
    text = "\n".join(extracted).strip() + "\n"
    chars = sum(map(len, page_text))
    if len(chapters_seen) != 36 or chars < 30000 or len(text) < 25000:
        raise RuntimeError(f"Extraction insuffisante : {len(chapters_seen)} chapitres, {chars} caractères.")
    if detect_sensitive_markers(text):
        raise RuntimeError("Donnée sensible détectée dans le texte extrait.")
    return text, len(chapters_seen), chars

def update_catalog(pages: int, chapters: int, situations: int, variants: int, chars: int) -> None:
    if CATALOG_PATH.exists():
        data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    else:
        data = {"version": 1, "documents": []}
    if not isinstance(data, dict) or not isinstance(data.get("documents"), list):
        raise RuntimeError("Catalogue documentaire invalide.")
    entry = {
        "id": "discussion-global-v0.0.2",
        "title": "Sun IA - Corpus de discussion globale - système neuronal 0.0.2",
        "topic": "salutations, français familier, conversation, école, langues, mathématiques, Python, Web, IA, Discord, sciences et sécurité",
        "path": "knowledge/imported/discussion-global-v0.0.2.md",
        "pdf": "knowledge/pdfs/sun-discussion-global-v0.0.2.pdf",
        "source": "Corpus original créé pour Sun IA à partir de situations fictives.",
        "license": "Contenu original du projet Sun IA.",
        "approved": True,
        "version": "0.0.2",
        "pages": pages,
        "chapters": chapters,
        "situations": situations,
        "response_variants": variants,
        "extracted_chars": chars,
        "sha256_pdf": hashlib.sha256(PDF_PATH.read_bytes()).hexdigest()
    }
    data["version"] = 1
    data["documents"] = [item for item in data["documents"] if item.get("id") != entry["id"]] + [entry]
    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CATALOG_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main() -> None:
    source, counts = build_source()
    verify_source(source, counts)
    MARKDOWN.parent.mkdir(parents=True, exist_ok=True)
    MARKDOWN.write_text(source, encoding="utf-8")
    render_pdf(source)
    reader = PdfReader(str(PDF_PATH))
    extracted, chapter_count, extracted_chars = extract_by_chapter(source, reader)
    if not 25 <= len(reader.pages) <= 75:
        raise RuntimeError(f"Nombre de pages inattendu : {len(reader.pages)}")
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    EXTRACTED_PATH.write_text(extracted, encoding="utf-8")
    update_catalog(len(reader.pages), chapter_count, counts["examples"], counts["variants"], extracted_chars)
    print(json.dumps({
        "version": "0.0.2",
        **counts,
        "pages": len(reader.pages),
        "extracted_chars": extracted_chars,
        "markdown_chars": len(extracted),
        "pdf_bytes": PDF_PATH.stat().st_size,
        "pdf_sha256": hashlib.sha256(PDF_PATH.read_bytes()).hexdigest(),
        "pdf": str(PDF_PATH.relative_to(ROOT)),
        "index": str(EXTRACTED_PATH.relative_to(ROOT)),
        "catalog": str(CATALOG_PATH.relative_to(ROOT))
    }, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
