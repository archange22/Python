from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_ROOT = ROOT / "knowledge"
CATALOG_PATH = KNOWLEDGE_ROOT / "catalog.json"
MAX_PDF_BYTES = 30 * 1024 * 1024
MAX_PDF_PAGES = 500
MAX_EXTRACTED_CHARS = 5_000_000
MIN_EXTRACTED_CHARS = 500

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
SECRET_RE = re.compile(
    r"\b(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b"
)
PHONE_RE = re.compile(r"(?<!\w)(?:\+?\d[\d .()/\-]{7,}\d)(?!\w)")
CHAPTER_RE = re.compile(
    r"^(?:CHAPITRE|CHAPTER|PARTIE|PART|SECTION)\s+([0-9IVX.-]+)\s*[-:.)]?\s*(.*)$",
    re.I,
)


class PDFIngestionError(ValueError):
    """Raised when a PDF is not safe or readable enough to be indexed."""


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    if not value or not re.match(r"^[a-z0-9][a-z0-9-]*$", value):
        raise PDFIngestionError("Le titre ne permet pas de créer un nom de fichier sûr.")
    return value[:70].rstrip("-")


def normalize_text(value: str) -> str:
    value = str(value or "").replace("\x00", "").replace("\u00ad", "")
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = re.sub(r"(?<=\w)-\n(?=[a-zà-ÿ])", "", value, flags=re.I)
    lines = [re.sub(r"[\t ]+", " ", line).strip() for line in value.split("\n")]
    cleaned: list[str] = []
    for line in lines:
        if not line:
            if cleaned and cleaned[-1] != "":
                cleaned.append("")
            continue
        cleaned.append(line)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(cleaned)).strip()


def detect_sensitive_markers(text: str) -> list[str]:
    markers: list[str] = []
    if EMAIL_RE.search(text):
        markers.append("adresse e-mail")
    if SECRET_RE.search(text):
        markers.append("clé ou jeton ressemblant à un secret")
    for match in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", match.group(0))
        if 9 <= len(digits) <= 15:
            markers.append("numéro de téléphone possible")
            break
    return markers


def extract_pdf_pages(pdf_path: Path) -> tuple[list[str], str, str]:
    pdf_path = Path(pdf_path)
    if not pdf_path.is_file():
        raise PDFIngestionError(f"PDF introuvable : {pdf_path}")
    size = pdf_path.stat().st_size
    if size <= 0 or size > MAX_PDF_BYTES:
        raise PDFIngestionError("Taille PDF invalide (limite : 30 Mo).")

    try:
        reader = PdfReader(str(pdf_path), strict=False)
        if reader.is_encrypted:
            try:
                result = reader.decrypt("")
            except Exception:
                result = 0
            if not result:
                raise PDFIngestionError("PDF chiffré : il faut une copie déverrouillée autorisée.")
        if not reader.pages or len(reader.pages) > MAX_PDF_PAGES:
            raise PDFIngestionError("Le nombre de pages est vide ou dépasse la limite de 500 pages.")
        pages = [normalize_text(page.extract_text() or "") for page in reader.pages]
    except PDFIngestionError:
        raise
    except Exception as exc:
        raise PDFIngestionError(f"Impossible de lire le PDF : {exc}") from exc

    total = sum(len(page) for page in pages)
    populated = sum(bool(page) for page in pages)
    if total < MIN_EXTRACTED_CHARS or populated < max(1, int(len(pages) * 0.5)):
        raise PDFIngestionError(
            "Extraction textuelle insuffisante. Le PDF peut être scanné ou contenir surtout des images ; "
            "un OCR séparé est nécessaire avant indexation."
        )
    combined = "\n\n".join(pages)
    if len(combined) > MAX_EXTRACTED_CHARS:
        raise PDFIngestionError("Le texte extrait dépasse la limite de sécurité de 5 millions de caractères.")
    sensitive = detect_sensitive_markers(combined)
    if sensitive:
        raise PDFIngestionError(
            "Indexation refusée : marqueur(s) de données sensibles détecté(s) : " + ", ".join(sorted(set(sensitive)))
        )
    digest = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    return pages, combined, digest


def organize_pages(title: str, topic: str, pages: list[str]) -> str:
    sections: list[tuple[str, list[str]]] = []
    current_title = "Introduction"
    current_body: list[str] = []

    def flush() -> None:
        body = "\n\n".join(part for part in current_body if part.strip()).strip()
        if body:
            sections.append((current_title, [body]))

    for page_number, page in enumerate(pages, start=1):
        lines = [line.strip() for line in page.splitlines() if line.strip()]
        page_body: list[str] = []
        for line in lines:
            match = CHAPTER_RE.match(line)
            if match:
                flush()
                current_title = (match.group(0).strip() or f"Chapitre {match.group(1)}")[:150]
                current_body = []
                continue
            if re.match(r"^(?:page\s+\d+|sun ia\s*[-·])", line, re.I):
                continue
            page_body.append(line)
        if page_body:
            current_body.append(f"[Page {page_number}] " + " ".join(page_body))
    flush()

    if not sections:
        return f"# {title}\n\nSujet : {topic}\n\n" + "\n\n".join(
            f"### Page {number}\n\n{page}" for number, page in enumerate(pages, start=1) if page
        )

    output = [f"# {title}", "", f"Sujet : {topic}", "", "Document extrait et contrôlé localement. Les pages sources sont indiquées dans chaque passage.", ""]
    for heading, paragraphs in sections:
        output.extend([f"## {heading}", "", *paragraphs, ""])
    return "\n".join(output).strip() + "\n"


def load_catalog() -> dict:
    if not CATALOG_PATH.exists():
        return {"version": 1, "documents": []}
    try:
        data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PDFIngestionError(f"Catalogue existant illisible : {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("documents"), list):
        raise PDFIngestionError("Format du catalogue de connaissances invalide.")
    return data


def write_catalog_entry(entry: dict) -> None:
    catalog = load_catalog()
    documents = [
        doc for doc in catalog["documents"]
        if not isinstance(doc, dict) or doc.get("id") != entry["id"]
    ]
    documents.append(entry)
    catalog["version"] = 1
    catalog["documents"] = documents
    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ingest_pdf(
    pdf_path: Path,
    *,
    title: str,
    topic: str,
    source: str,
    license_name: str,
    approve: bool = False,
    publish_public: bool = False,
) -> dict:
    pages, raw_text, digest = extract_pdf_pages(pdf_path)
    markdown = organize_pages(title, topic, pages)
    slug = slugify(title)
    entry_id = slug

    staging_dir = KNOWLEDGE_ROOT / "staging"
    imported_dir = KNOWLEDGE_ROOT / "imported"
    pdf_dir = KNOWLEDGE_ROOT / "pdfs" / "imported"
    staging_dir.mkdir(parents=True, exist_ok=True)
    preview_path = staging_dir / f"{slug}.md"
    preview_path.write_text(markdown, encoding="utf-8")

    report = {
        "id": entry_id,
        "title": title,
        "topic": topic,
        "source": source,
        "license": license_name,
        "pages": len(pages),
        "extracted_chars": len(raw_text),
        "sha256": digest,
        "preview": str(preview_path.relative_to(ROOT)),
        "approved": False,
        "reviewed": False,
    }
    if not approve:
        return report

    if not source.strip() or not license_name.strip():
        raise PDFIngestionError("Pour valider un document, renseigne sa provenance et sa licence exactes.")
    placeholders = {"inconnue", "unknown", "n/a", "à vérifier", "a verifier",
                    "licence ou autorisation de redistribution", "non précisée", "non precisee"}
    if license_name.strip().casefold() in placeholders:
        raise PDFIngestionError("La licence doit être identifiée précisément ; une mention générique ne suffit pas.")
    report["reviewed"] = True
    if not publish_public:
        report["message"] = (
            "Aperçu vérifié localement, mais non publié. Pour ajouter ce document au dépôt et au site publics, "
            "relance explicitement avec --approve --publish-public après confirmation des droits."
        )
        return report

    catalog = load_catalog()
    existing = next(
        (doc for doc in catalog["documents"] if isinstance(doc, dict) and doc.get("sha256") == digest),
        None,
    )
    if existing:
        return {**existing, "already_indexed": True}
    if any(isinstance(doc, dict) and doc.get("id") == entry_id for doc in catalog["documents"]):
        raise PDFIngestionError(
            "Un document différent utilise déjà ce titre/identifiant. Change le titre au lieu de l'écraser."
        )

    imported_dir.mkdir(parents=True, exist_ok=True)
    pdf_dir.mkdir(parents=True, exist_ok=True)
    markdown_path = imported_dir / f"{slug}.md"
    pdf_target = pdf_dir / f"{slug}.pdf"
    if markdown_path.exists() or pdf_target.exists():
        raise PDFIngestionError("Un fichier porte déjà ce nom dans la bibliothèque ; aucun écrasement automatique.")
    markdown_path.write_text(markdown, encoding="utf-8")
    shutil.copy2(pdf_path, pdf_target)
    entry = {
        **report,
        "path": str(markdown_path.relative_to(ROOT)).replace("\\", "/"),
        "pdf": str(pdf_target.relative_to(ROOT)).replace("\\", "/"),
        "approved": True,
        "reviewed": True,
    }
    write_catalog_entry(entry)
    return entry


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrait, vérifie et indexe un PDF dans la bibliothèque locale de Sun.")
    parser.add_argument("pdf", type=Path, help="PDF textuel à analyser")
    parser.add_argument("--title", required=True, help="Titre documentaire")
    parser.add_argument("--topic", required=True, help="Sujet principal")
    parser.add_argument("--source", required=True, help="Provenance ou auteur du document")
    parser.add_argument("--license", required=True, dest="license_name", help="Licence ou autorisation d'utilisation")
    parser.add_argument("--approve", action="store_true", help="Confirme la vérification manuelle du contenu et des droits")
    parser.add_argument(
        "--publish-public",
        action="store_true",
        help="Confirme que le document sera copié dans le dépôt public et publié avec l'application",
    )
    args = parser.parse_args()
    if args.publish_public and not args.approve:
        parser.error("--publish-public nécessite aussi --approve.")
    try:
        result = ingest_pdf(
            args.pdf,
            title=args.title,
            topic=args.topic,
            source=args.source,
            license_name=args.license_name,
            approve=args.approve,
            publish_public=args.publish_public,
        )
    except PDFIngestionError as exc:
        parser.error(str(exc))
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not args.approve:
        print("Aperçu créé uniquement. Vérifie le contenu et les droits avant toute validation.")
    elif not args.publish_public:
        print("Aperçu vérifié, mais conservé en staging local. Aucune publication ni indexation partagée.")
    else:
        print("Document explicitement autorisé pour publication dans le dépôt et l'application publics.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
