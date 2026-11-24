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


if __name__ == "__main__":
    unittest.main()


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

    def call_ingest(self, *, digest="a" * 64, approve=True, publish=False):
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
                source="Documentation de test créée localement",
                license_name="CC BY 4.0",
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
                    source="Source vérifiée", license_name="CC BY 4.0",
                    approve=True, publish_public=True,
                )

    def test_same_document_digest_is_deduplicated(self):
        self.call_ingest(approve=True, publish=True, digest="c" * 64)
        duplicate = self.call_ingest(approve=True, publish=True, digest="c" * 64)
        self.assertTrue(duplicate["already_indexed"])

