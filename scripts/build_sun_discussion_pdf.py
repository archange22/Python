from __future__ import annotations

import base64
import bz2
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from bs4 import BeautifulSoup
from pypdf import PdfReader
from weasyprint import HTML

from ingest_pdf_knowledge import detect_sensitive_markers, normalize_text

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
SOURCE = KNOWLEDGE / "sources" / "discussion-global-v0.0.2.md.bz2.b64"
MARKDOWN = KNOWLEDGE / "discussion-global-v0.0.2.md"
PDF_DIR = KNOWLEDGE / "pdfs"
PDF_PATH = PDF_DIR / "sun-discussion-global-v0.0.2.pdf"
EXTRACTED_DIR = KNOWLEDGE / "imported"
EXTRACTED_PATH = EXTRACTED_DIR / "discussion-global-v0.0.2.md"
CATALOG_PATH = KNOWLEDGE / "catalog.json"

CSS = r"""
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;color:#282433;background:#fff;font-family:"DejaVu Sans",Arial,sans-serif;font-size:9.5pt;line-height:1.52}
h1{font-size:25pt;line-height:1.15;color:#4c286d;margin:0 0 10mm}
h2{font-size:15pt;line-height:1.25;color:#713e91;margin:10mm 0 3mm;padding-bottom:2mm;border-bottom:1.2pt solid #eadcf4;break-after:avoid}
h3{font-size:11pt;color:#8d4a9f;margin:5mm 0 2mm;break-after:avoid}
p{margin:2mm 0 3mm}
ul,ol{padding-left:7mm}
li{margin:1mm 0}
blockquote{border-left:3pt solid #8b5cb0;background:#f7f1fb;padding:3mm 4mm;margin:3mm 0}
code{font-family:"DejaVu Sans Mono",monospace;color:#70408f}
pre{background:#282433;color:#fff;padding:4mm;white-space:pre-wrap;break-inside:avoid}
a{color:#70408f;text-decoration:none;overflow-wrap:anywhere}
hr{border:0;border-top:.7pt solid #e8dcef;margin:5mm 0}
#TOC{background:#faf7fc;border:1pt solid #e8dcef;border-radius:3mm;padding:5mm 7mm;margin:0 0 8mm;break-after:page}
#TOC::before{content:"SOMMAIRE";display:block;font-size:9pt;font-weight:bold;letter-spacing:1px;color:#8d4a9f;margin-bottom:3mm}
#TOC ul{padding-left:6mm}
#TOC li{margin:1.2mm 0;font-size:8.5pt}
#TOC a{color:#4c286d}
.cover{padding:28mm 8mm 15mm;text-align:center;break-after:page}
.cover .eyebrow{font-size:9pt;letter-spacing:2px;color:#9361a9;font-weight:bold}
.cover h1{font-size:31pt;margin:10mm 0 5mm}
.cover .sub{font-size:14pt;color:#644b77}
.cover .stats{display:inline-block;margin-top:14mm;padding:5mm 8mm;border:1pt solid #e8dcef;border-radius:4mm;background:#faf7fc}
.chapter-start{break-before:page}
@page{size:A4;margin:16mm 17mm 18mm 17mm;@top-left{content:"SUN IA · SYSTEME NEURONAL 0.0.2";color:#9163a4;font-size:7.3pt}@top-right{content:"CORPUS DE DISCUSSION";color:#9163a4;font-size:7.3pt}@bottom-left{content:"Corpus original pour Sun IA";color:#93889b;font-size:7pt}@bottom-right{content:"Page " counter(page) " / " counter(pages);color:#93889b;font-size:7pt}}
@media print{h2,h3{break-after:avoid}blockquote,pre{break-inside:avoid}}
"""


def load_source() -> str:
    if not SOURCE.is_file():
        raise RuntimeError(f"Source compacte absente : {SOURCE}")
    encoded = SOURCE.read_text(encoding="ascii").strip()
    try:
        raw = bz2.decompress(base64.b64decode(encoded, validate=True))
        source = raw.decode("utf-8")
    except Exception as exc:
        raise RuntimeError(f"La source compacte du corpus est invalide : {exc}") from exc
    source_sha256 = hashlib.sha256(source.encode("utf-8")).hexdigest()
    if source_sha256 != "4a9077ce9f7f7329fdf316f96810b6890c22ff634a5b1272f17795cc75a58d1d":
        raise RuntimeError("La somme de contrôle du corpus source ne correspond pas au document validé.")
    if len(source) < 85000:
        raise RuntimeError(f"Corpus source trop court : {len(source)} caractères")
    chapters = re.findall(r"^### CHAPITRE\s+\d+\s+-\s+.+$", source, re.M)
    examples = re.findall(r"^\*\*Exemple\s+\d+\.\d+", source, re.M)
    variants_a = len(re.findall(r"\*\*Réponse possible A :\*\*", source))
    variants_b = len(re.findall(r"\*\*Réponse possible B :\*\*", source))
    if len(chapters) != 36 or len(examples) < 200 or variants_a < 200 or variants_b < 200:
        raise RuntimeError(
            f"Corpus incomplet : {len(chapters)} chapitres, {len(examples)} situations, "
            f"{variants_a}+{variants_b} variantes."
        )
    sensitive = detect_sensitive_markers(source)
    if sensitive:
        raise RuntimeError("Le corpus contient un marqueur de donnée privée : " + ", ".join(sensitive))
    return source


def render_pdf(markdown: str) -> None:
    result = subprocess.run(
        [
            "pandoc", "--from=markdown+pipe_tables", "--to=html5", "--standalone",
            "--toc", "--toc-depth=2", "--metadata", "title=Sun IA - Corpus de discussion globale 0.0.2",
            "--highlight-style=pygments",
        ],
        input=markdown,
        check=True,
        capture_output=True,
        text=True,
    )
    soup = BeautifulSoup(result.stdout, "html.parser")
    if soup.title:
        soup.title.string = "Sun IA - Corpus de discussion globale 0.0.2"
    for heading in soup.find_all("h2"):
        if re.match(r"CHAPITRE\s+\d+", heading.get_text(" ", strip=True), re.I):
            heading["class"] = list(heading.get("class", [])) + ["chapter-start"]
    style = soup.new_tag("style")
    style.string = CSS
    soup.head.append(style)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    HTML(string="<!doctype html>\n" + str(soup), base_url=str(ROOT)).write_pdf(str(PDF_PATH))


def extract_by_chapter(source: str, reader: PdfReader) -> tuple[str, int, int]:
    chapter_titles = {
        int(number): title.strip()
        for number, title in re.findall(r"^### CHAPITRE\s+(\d+)\s+-\s*(.+)$", source, re.M)
    }
    sections: dict[str, list[str]] = {"Mode d'emploi et règles de réponse": []}
    current = "Mode d'emploi et règles de réponse"
    chapter_count = 0
    all_page_text: list[str] = []

    for page_number, page in enumerate(reader.pages, start=1):
        raw = normalize_text(page.extract_text() or "")
        if len(raw) < 40:
            raise RuntimeError(f"Extraction PDF trop courte à la page {page_number}.")
        all_page_text.append(raw)
        if page_number in (1, 2):
            sections[current].append(raw)
            continue

        page_lines = [line.strip() for line in raw.splitlines() if line.strip()]
        page_body: list[str] = []
        chapter_match = None
        for line in page_lines:
            if re.match(r"^SUN IA\s*[-·]", line, re.I) or re.match(r"^Page\s+\d+\s*$", line, re.I):
                continue
            match = re.match(r"^CHAPITRE\s+(\d+)\s*[-:]?\s*(.*)$", line, re.I)
            if match:
                chapter_match = int(match.group(1))
                continue
            page_body.append(line)

        if chapter_match is not None and chapter_match in chapter_titles:
            current = f"CHAPITRE {chapter_match:02d} - {chapter_titles[chapter_match]}"
            if current not in sections:
                sections[current] = []
                chapter_count += 1
        elif any(line.lower().startswith("gabarits de réponses") for line in page_lines):
            current = "Annexes - gabarits de réponses et sources"
            sections.setdefault(current, [])

        if page_body:
            sections.setdefault(current, []).append(" ".join(page_body))

    extracted = [
        "# Sun IA - Corpus de discussion globale extrait du PDF - version 0.0.2",
        "",
        "Sujet : conversation française, classification des intentions, reconnaissance de sujets et réponses variées.",
        "Source : knowledge/pdfs/sun-discussion-global-v0.0.2.pdf",
        "Vérification : texte extrait page par page avec pypdf ; les chapitres et le numéro de page sont conservés.",
        "",
    ]
    for heading, chunks in sections.items():
        body = "\n\n".join(chunk for chunk in chunks if chunk.strip()).strip()
        if body:
            extracted.extend([f"## {heading}", "", body, ""])

    text = "\n".join(extracted).strip() + "\n"
    total_chars = sum(len(page) for page in all_page_text)
    if chapter_count < 36 or total_chars < 30000 or len(text) < 25000:
        raise RuntimeError(
            f"Vérification extraction échouée : {chapter_count} chapitres, "
            f"{total_chars} caractères extraits, {len(text)} caractères indexables."
        )
    sensitive = detect_sensitive_markers(text)
    if sensitive:
        raise RuntimeError("Texte PDF refusé à l'indexation : " + ", ".join(sensitive))
    return text, chapter_count, total_chars


def update_catalog(pdf_pages: int, chapter_count: int, extracted_chars: int) -> None:
    if CATALOG_PATH.exists():
        data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    else:
        data = {"version": 1, "documents": []}
    if not isinstance(data, dict) or not isinstance(data.get("documents"), list):
        raise RuntimeError("Le catalogue des connaissances existant est invalide.")
    document = {
        "id": "discussion-global-v0.0.2",
        "title": "Sun IA - Corpus de discussion globale - Système neuronal 0.0.2",
        "topic": "conversation française, salutations, discussion générale, intentions, reconnaissance de sujets, réponses variées",
        "path": "knowledge/imported/discussion-global-v0.0.2.md",
        "pdf": "knowledge/pdfs/sun-discussion-global-v0.0.2.pdf",
        "source": "Corpus original créé pour le projet Sun IA à partir d'exemples fictifs.",
        "license": "Contenu original du projet ; réutilisation autorisée dans Sun IA par le propriétaire du dépôt.",
        "approved": True,
        "version": "0.0.2",
        "pages": pdf_pages,
        "chapters": chapter_count,
        "extracted_chars": extracted_chars,
        "sha256_pdf": hashlib.sha256(PDF_PATH.read_bytes()).hexdigest(),
    }
    documents = [item for item in data.get("documents", []) if item.get("id") != document["id"]]
    documents.append(document)
    data["version"] = 1
    data["documents"] = documents
    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CATALOG_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    source = load_source()
    MARKDOWN.parent.mkdir(parents=True, exist_ok=True)
    MARKDOWN.write_text(source, encoding="utf-8")
    render_pdf(source)

    reader = PdfReader(str(PDF_PATH))
    extracted, chapters, extracted_chars = extract_by_chapter(source, reader)
    if not 25 <= len(reader.pages) <= 60:
        raise RuntimeError(f"Nombre de pages inattendu : {len(reader.pages)}")
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    EXTRACTED_PATH.write_text(extracted, encoding="utf-8")
    update_catalog(len(reader.pages), chapters, extracted_chars)

    print(json.dumps({
        "version": "0.0.2",
        "chapters": chapters,
        "situations": len(re.findall(r"^\*\*Exemple\s+\d+\.\d+", source, re.M)),
        "response_variants": len(re.findall(r"\*\*Réponse possible [AB] :\*\*", source)),
        "pages": len(reader.pages),
        "extracted_chars": extracted_chars,
        "markdown_chars": len(extracted),
        "pdf_bytes": PDF_PATH.stat().st_size,
        "pdf_sha256": hashlib.sha256(PDF_PATH.read_bytes()).hexdigest(),
        "pdf": str(PDF_PATH.relative_to(ROOT)),
        "index": str(EXTRACTED_PATH.relative_to(ROOT)),
        "catalog": str(CATALOG_PATH.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
