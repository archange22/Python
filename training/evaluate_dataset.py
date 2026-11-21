#!/usr/bin/env python3
"""Audit prepared SUN train/validation/test JSONL splits for leakage and quality."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


def read_split(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Fichier absent : {path}")
    records = []
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"{path}:{line_number}: JSON invalide ({error})") from error
            if not isinstance(record, dict) or not isinstance(record.get("messages"), list):
                raise ValueError(f"{path}:{line_number}: format conversation invalide")
            if any(not isinstance(message, dict) for message in record["messages"]):
                raise ValueError(f"{path}:{line_number}: message mal formé")
            roles = [message.get("role") for message in record["messages"]]
            if any(role not in {"system", "user", "assistant"} for role in roles):
                raise ValueError(f"{path}:{line_number}: rôle inconnu")
            conversational_roles = [role for role in roles if role != "system"]
            if not conversational_roles or conversational_roles[0] != "user" or conversational_roles[-1] != "assistant":
                raise ValueError(f"{path}:{line_number}: la conversation doit commencer par user et finir par assistant")
            if any(not isinstance(message.get("content"), str) or not message["content"].strip()
                   for message in record["messages"]):
                raise ValueError(f"{path}:{line_number}: message vide ou mal formé")
            metadata = record.get("metadata")
            if not isinstance(metadata, dict) or not metadata.get("group_id"):
                raise ValueError(f"{path}:{line_number}: groupe de conversation absent")
            records.append(record)
    return records


def fingerprint(record: dict[str, Any]) -> str:
    payload = json.dumps(record["messages"], ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def evaluate_dataset(directory: Path) -> dict[str, Any]:
    splits = {
        name: read_split(directory / f"{name}.jsonl")
        for name in ("train", "validation", "test")
    }
    group_sets = {
        name: {record["metadata"]["group_id"] for record in records}
        for name, records in splits.items()
    }
    for left, right in (("train", "validation"), ("train", "test"), ("validation", "test")):
        overlap = group_sets[left] & group_sets[right]
        if overlap:
            raise ValueError(f"Fuite de groupes entre {left} et {right}: {sorted(overlap)[:5]}")

    fingerprints: dict[str, str] = {}
    for split_name, records in splits.items():
        for record in records:
            digest = fingerprint(record)
            previous = fingerprints.get(digest)
            if previous:
                raise ValueError(f"Conversation dupliquée entre {previous} et {split_name}")
            fingerprints[digest] = split_name

    language_counts = Counter()
    source_counts = Counter()
    characters = 0
    for records in splits.values():
        for record in records:
            metadata = record["metadata"]
            language_counts[metadata.get("language", "inconnue")] += 1
            source_counts[metadata.get("source", "inconnue")] += 1
            characters += sum(len(message["content"]) for message in record["messages"])

    report = {
        "splits": {name: len(records) for name, records in splits.items()},
        "groups": {name: len(group_sets[name]) for name in splits},
        "languages": dict(language_counts),
        "sources": dict(source_counts),
        "total_messages": sum(
            len(record["messages"])
            for records in splits.values()
            for record in records
        ),
        "total_characters": characters,
        "cross_split_group_leakage": False,
        "duplicate_conversations_across_splits": False,
        "note": "Un audit structurel ne remplace pas une revue humaine des faits, du code, des droits et de la confidentialité.",
    }
    (directory / "evaluation-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path("training/prepared"))
    args = parser.parse_args()
    try:
        report = evaluate_dataset(args.data_dir)
    except (OSError, ValueError) as error:
        print(f"Évaluation impossible : {error}", file=sys.stderr)
        return 2
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
