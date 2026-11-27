import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from pypdf import PdfWriter

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ingest_pdf_knowledge import (  # noqa: E402
    PDFIngestionError,
    detect_sensitive_markers,
    extract_pdf_pages,
    normalize_text,
    organize_pages,
    slugify,
    ingest_pdf,
)


class PDFIngestionTests(unittest.TestCase):
    def test_normalize_text_joins_a_word_split_at_line_end(self):
        self.assertEqual(normalize_text("docu-\nment utile"), "document utile")

    def test_slugify_creates_a_safe_relative_filename(self):
        self.assertEqual(slugify("Sun IA - Discussion 0.0.2"), "sun-ia-discussion-0-0-2")
        with self.assertRaises(PDFIngestionError):
            slugify("../../")

    def test_sensitive_markers_are_detected_before_indexing(self):
        self.assertIn("adresse e-mail", detect_sensitive_markers("contact@example.test"))
        self.assertTrue(detect_sensitive_markers("jeton: sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ123456"))
        self.assertEqual(detect_sensitive_markers("Ce chapitre parle de Python 3.12."), [])

    def test_pages_are_grouped_by_chapter_and_page(self):
        result = organize_pages(
            "Guide Python",
            "Python",
            [
                "SUN IA - Guide\nPage 1\nIntroduction au document.",
                "CHAPITRE 01 - Variables\nUne variable conserve une valeur.",
                "Suite du chapitre avec un autre exemple.",
                "CHAPITRE 02 - Conditions\nUne condition choisit un chemin."
            ],
        )
        self.assertIn("## CHAPITRE 01 - Variables", result)
        self.assertIn("## CHAPITRE 02 - Conditions", result)
        self.assertIn("[Page 2]", result)

    def test_image_only_or_empty_pdf_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "empty.pdf"
            writer = PdfWriter()
            writer.add_blank_page(width=200, height=200)
            with path.open("wb") as stream:
                writer.write(stream)
            with self.assertRaisesRegex(PDFIngestionError, "OCR séparé"):
                extract_pdf_pages(path)


    def test_missing_pdf_is_rejected_before_extraction(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "missing.pdf"
            with self.assertRaisesRegex(PDFIngestionError, "PDF introuvable"):
                extract_pdf_pages(path)

    def test_zero_byte_pdf_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "zero.pdf"
            path.write_bytes(b"")
            with self.assertRaisesRegex(PDFIngestionError, "Taille PDF invalide"):
                extract_pdf_pages(path)

    def test_corrupted_pdf_is_rejected_without_claiming_extraction(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "corrupt.pdf"
            path.write_bytes(b"not a PDF document")
            with self.assertRaisesRegex(PDFIngestionError, "Impossible de lire le PDF"):
                extract_pdf_pages(path)

    def test_oversized_pdf_is_rejected_before_parser_runs(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "large.pdf"
            path.write_bytes(b"x" * 32)
            with patch("ingest_pdf_knowledge.MAX_PDF_BYTES", 16):
                with self.assertRaisesRegex(PDFIngestionError, "Taille PDF invalide"):
                    extract_pdf_pages(path)

    def test_page_limit_is_enforced_before_text_extraction(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "pages.pdf"
            writer = PdfWriter()
            writer.add_blank_page(width=200, height=200)
            with path.open("wb") as stream:
                writer.write(stream)
            with patch("ingest_pdf_knowledge.MAX_PDF_PAGES", 0):
                with self.assertRaisesRegex(PDFIngestionError, "nombre de pages"):
                    extract_pdf_pages(path)


class PDFPublicationSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.knowledge = self.root / "knowledge"
        self.catalog = self.knowledge / "catalog.json"
        self.pdf = self.root / "source.pdf"
        self.pdf.write_bytes(b"mock-pdf-bytes")

    def tearDown(self):
        self.temp.cleanup()

    def call_ingest(
        self,
        *,
        digest="a" * 64,
        approve=True,
        publish=False,
        author_organization="Python Software Foundation",
        canonical_source_url="https://docs.python.org/3/",
        language="en",
        publication_date=None,
        license_url="https://docs.python.org/3/license.html",
    ):
        with patch("ingest_pdf_knowledge.ROOT", self.root), \
             patch("ingest_pdf_knowledge.KNOWLEDGE_ROOT", self.knowledge), \
             patch("ingest_pdf_knowledge.CATALOG_PATH", self.catalog), \
             patch("ingest_pdf_knowledge.extract_pdf_pages",
                   return_value=(["Un passage documentaire suffisamment long."],
                                 "Un passage documentaire suffisamment long." * 20,
                                 digest)):
            return ingest_pdf(
                self.pdf,
                title="Guide de test",
                topic="Test de sécurité",
                source="Documentation officielle Python (métadonnées synthétiques de test)",
                license_name="Python Software Foundation License Version 2",
                author_organization=author_organization,
                canonical_source_url=canonical_source_url,
                language=language,
                publication_date=publication_date,
                license_url=license_url,
                approve=approve,
                publish_public=publish,
            )

    def test_approval_without_publication_does_not_copy_or_index(self):
        result = self.call_ingest(approve=True, publish=False)
        self.assertTrue(result["reviewed"])
        self.assertFalse(result["approved"])
        self.assertTrue((self.knowledge / "staging" / "guide-de-test.md").is_file())
        self.assertFalse((self.knowledge / "imported" / "guide-de-test.md").exists())
        self.assertFalse(self.catalog.exists())

    def test_publication_requires_explicit_approval_and_copies_verified_files(self):
        result = self.call_ingest(approve=True, publish=True)
        self.assertTrue(result["approved"])
        self.assertTrue(result["reviewed"])
        self.assertTrue((self.knowledge / "imported" / "guide-de-test.md").is_file())
        self.assertTrue((self.knowledge / "pdfs" / "imported" / "guide-de-test.pdf").is_file())
        self.assertTrue(self.catalog.is_file())

    def test_existing_title_is_never_silently_overwritten(self):
        self.call_ingest(approve=True, publish=True, digest="a" * 64)
        with patch("ingest_pdf_knowledge.ROOT", self.root), \
             patch("ingest_pdf_knowledge.KNOWLEDGE_ROOT", self.knowledge), \
             patch("ingest_pdf_knowledge.CATALOG_PATH", self.catalog), \
             patch("ingest_pdf_knowledge.extract_pdf_pages",
                   return_value=(["Autre contenu."], "Autre contenu." * 40, "b" * 64)):
            with self.assertRaisesRegex(PDFIngestionError, "utilise déjà ce titre"):
                ingest_pdf(
                    self.pdf, title="Guide de test", topic="Test",
                    source="Documentation officielle Python (métadonnées synthétiques de test)",
                    license_name="Python Software Foundation License Version 2",
                    author_organization="Python Software Foundation",
                    canonical_source_url="https://docs.python.org/3/",
                    language="en",
                    license_url="https://docs.python.org/3/license.html",
                    approve=True, publish_public=True,
                )

    def test_same_document_digest_is_deduplicated(self):
        self.call_ingest(approve=True, publish=True, digest="c" * 64)
        duplicate = self.call_ingest(approve=True, publish=True, digest="c" * 64)
        self.assertTrue(duplicate["already_indexed"])


    def test_publication_rejects_missing_canonical_source_url(self):
        with self.assertRaisesRegex(PDFIngestionError, "source canonique"):
            self.call_ingest(approve=True, publish=True, canonical_source_url="https://example.org/guide")

    def test_publication_rejects_non_https_license_url(self):
        with self.assertRaisesRegex(PDFIngestionError, "URL de licence"):
            self.call_ingest(approve=True, publish=True, license_url="http://docs.python.org/3/license.html")

    def test_publication_rejects_invalid_publication_date(self):
        with self.assertRaisesRegex(PDFIngestionError, "YYYY-MM-DD"):
            self.call_ingest(approve=True, publish=True, publication_date="2026-13-40")

    def test_publication_rejects_missing_author_organization(self):
        with self.assertRaisesRegex(PDFIngestionError, "auteur ou l'organisme"):
            self.call_ingest(approve=True, publish=True, author_organization="")

    def test_published_catalog_entry_contains_provenance_and_extraction_metadata(self):
        self.call_ingest(approve=True, publish=True, publication_date="2026-11-20")
        entry = json.loads(self.catalog.read_text(encoding="utf-8"))["documents"][0]
        self.assertEqual(entry["author_organization"], "Python Software Foundation")
        self.assertEqual(entry["canonical_source_url"], "https://docs.python.org/3/")
        self.assertEqual(entry["language"], "en")
        self.assertEqual(entry["discipline"], "Test de sécurité")
        self.assertEqual(entry["publication_date"], "2026-11-20")
        self.assertEqual(entry["license_url"], "https://docs.python.org/3/license.html")
        self.assertEqual(entry["license"], "Python Software Foundation License Version 2")
        self.assertEqual(entry["format"], "pdf")
        self.assertEqual(entry["extraction_status"], "text_layer_extracted")
        self.assertEqual(entry["extraction_method"], "pypdf")
        self.assertEqual(entry["verification_status"], "manual_review_complete_approved_for_publication")
        self.assertRegex(entry["sha256"], r"^[0-9a-f]{64}$")
        self.assertRegex(entry["collection_date"], r"^\d{4}-\d{2}-\d{2}$")


if __name__ == "__main__":
    unittest.main()
