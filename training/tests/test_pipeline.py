from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from training.prepare_sft_dataset import prepare_dataset, validate_record
from training.evaluate_dataset import evaluate_dataset


def record(identifier: str, answer: str = "Réponse utile", group_id: str | None = None):
    return {
        "id": identifier,
        "group_id": group_id or identifier,
        "source": "tests du projet",
        "license": "contenu original",
        "license_verified": True,
        "rights_status": "project_original",
        "privacy_reviewed": True,
        "quality_status": "approved",
        "language": "fr",
        "messages": [
            {"role": "user", "content": "Question " + identifier},
            {"role": "assistant", "content": answer},
        ],
    }


class DatasetPipelineTests(unittest.TestCase):
    def test_rejects_unverified_rights(self):
        item = record("bad")
        item["license_verified"] = False
        cleaned, reason = validate_record(item)
        self.assertIsNone(cleaned)
        self.assertEqual(reason, "license_not_verified")

    def test_rejects_email_pattern(self):
        item = record("private", "Contacte exemple@example.com")
        cleaned, reason = validate_record(item)
        self.assertIsNone(cleaned)
        self.assertEqual(reason, "possible_personal_data_or_secret")

    def test_preparation_is_group_safe_and_deduplicates(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            input_path = root / "input.jsonl"
            output_dir = root / "prepared"
            rows = [record(f"sample-{index}") for index in range(20)]
            rows.append(record("duplicate", "Réponse utile", group_id="sample-0"))
            input_path.write_text(
                "".join(json.dumps(item, ensure_ascii=False) + "\n" for item in rows),
                encoding="utf-8",
            )

            report = prepare_dataset(input_path, output_dir)
            self.assertEqual(report["accepted"], 20)
            self.assertEqual(report["rejected"], 1)
            self.assertGreater(report["splits"]["train"], 0)
            self.assertGreater(report["splits"]["validation"], 0)
            self.assertGreater(report["splits"]["test"], 0)

            audit = evaluate_dataset(output_dir)
            self.assertFalse(audit["cross_split_group_leakage"])
            self.assertFalse(audit["duplicate_conversations_across_splits"])

    def test_repeated_group_stays_in_one_split(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "input.jsonl"
            output = root / "out"
            rows = [record(f"group-{i}") for i in range(10)]
            rows += [
                {
                    **record("variant-0", "Autre exemple", group_id="group-0"),
                    "id": "variant-0",
                }
            ]
            source.write_text(
                "".join(json.dumps(item, ensure_ascii=False) + "\n" for item in rows),
                encoding="utf-8",
            )
            prepare_dataset(source, output)
            audit = evaluate_dataset(output)
            self.assertEqual(audit["groups"]["train"] + audit["groups"]["validation"] + audit["groups"]["test"], 10)


if __name__ == "__main__":
    unittest.main()
