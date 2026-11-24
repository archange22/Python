import sys
import tempfile
import unittest
from pathlib import Path

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
