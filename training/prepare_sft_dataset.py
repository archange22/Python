#!/usr/bin/env python3
"""Prepare a traceable, deduplicated conversational SFT dataset for SUN.

Only records with verified reuse rights, completed privacy review and approved
quality status are admitted. No private chat is collected by this script.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ALLOWED_ROLES = {"system", "user", "assistant"}
ALLOWED_RIGHTS = {"project_original", "explicit_permission", "open_license_verified"}
EMAIL_RE = re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")
SECRET_RE = re.compile(
    r"(?i)\b(api[_-]?key|access[_-]?token|password|mot_de_passe|secret)\s*[:=]\s*\S+"
)


def canonical_messages(messages: list[dict[str, str]]) -> str:
    normalized = []
    for message in messages:
        content = unicodedata.normalize("NFKC", message["content"])
        content = re.sub(r"\s+", " ", content).strip()
        normalized.append([message["role"], content])
    return json.dumps(normalized, ensure_ascii=False, separators=(",", ":"))


def validate_record(record: Any) -> tuple[dict[str, Any] | None, str | None]:
    if not isinstance(record, dict):
        return None, "record_not_object"
    required_text = ("id", "group_id", "source", "license", "language")
    for field in required_text:
        if not isinstance(record.get(field), str) or not record[field].strip():
            return None, f"missing_{field}"
    if record.get("license_verified") is not True:
        return None, "license_not_verified"
    if record.get("rights_status") not in ALLOWED_RIGHTS:
        return None, "reuse_rights_not_confirmed"
    if record.get("privacy_reviewed") is not True:
        return None, "privacy_review_missing"
    if record.get("quality_status") != "approved":
        return None, "quality_not_approved"

    messages = record.get("messages")
    if not isinstance(messages, list) or not 2 <= len(messages) <= 40:
        return None, "invalid_message_count"

    cleaned: list[dict[str, str]] = []
    for message in messages:
        if not isinstance(message, dict):
            return None, "message_not_object"
        role = message.get("role")
        content = message.get("content")
        if role not in ALLOWED_ROLES:
            return None, "unsupported_role"
        if not isinstance(content, str) or not content.strip():
            return None, "empty_message"
        content = content.strip()
        if len(content) > 12000:
            return None, "message_too_long"
        if EMAIL_RE.search(content) or SECRET_RE.search(content):
            return None, "possible_personal_data_or_secret"
        cleaned.append({"role": role, "content": content})

    conversational = [item["role"] for item in cleaned if item["role"] != "system"]
    if not conversational or conversational[0] != "user" or conversational[-1] != "assistant":
        return None, "conversation_must_start_user_and_end_assistant"
    if "user" not in conversational or "assistant" not in conversational:
        return None, "missing_user_or_assistant"

    for previous, current in zip(conversational, conversational[1:]):
        if previous == current:
            return None, "conversation_roles_do_not_alternate"

    output = {
        "messages": cleaned,
        "metadata": {
            "id": record["id"].strip(),
            "group_id": record["group_id"].strip(),
            "source": record["source"].strip(),
            "license": record["license"].strip(),
            "rights_status": record["rights_status"],
            "language": record["language"].strip().lower(),
            "topic": str(record.get("topic") or "general").strip().lower(),
            "difficulty": str(record.get("difficulty") or "unspecified").strip().lower(),
        },
    }
    return output, None


def read_jsonl(path: Path) -> tuple[list[Any], list[dict[str, str]]]:
    records: list[Any] = []
    rejected: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                rejected.append({"line": str(line_number), "reason": "invalid_json"})
    return records, rejected


def split_groups(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Split whole conversation groups, stratified by topic.

    Small topics are kept intact in train or split train/test; larger topics
    receive train/validation/test examples. No conversation group can leak.
    """
    groups: dict[str, list[dict[str, Any]]] = {}
    topic_by_group: dict[str, str] = {}
    for record in records:
        group_id = record["metadata"]["group_id"]
        topic = record["metadata"].get("topic", "general")
        previous_topic = topic_by_group.setdefault(group_id, topic)
        if previous_topic != topic:
            raise ValueError(
                f"Le groupe {group_id!r} contient plusieurs domaines. "
                "Utilise un group_id distinct par conversation."
            )
        groups.setdefault(group_id, []).append(record)

    strata: dict[str, list[str]] = {}
    for group_id, items in groups.items():
        topic = items[0]["metadata"].get("topic", "general")
        strata.setdefault(topic, []).append(group_id)

    assignments: dict[str, str] = {}
    for topic, topic_groups in sorted(strata.items()):
        ordered = sorted(
            topic_groups,
            key=lambda group_id: hashlib.sha256(
                (topic + ":" + group_id).encode("utf-8")
            ).hexdigest(),
        )
        count = len(ordered)
        if count == 1:
            assignments[ordered[0]] = "train"
            continue
        if count == 2:
            assignments[ordered[0]] = "train"
            assignments[ordered[1]] = "test"
            continue

        test_count = max(1, int(round(count * 0.10)))
        validation_count = max(1, int(round(count * 0.10)))
        train_count = count - validation_count - test_count
        if train_count < 1:
            train_count, validation_count, test_count = count - 2, 1, 1

        for index, group_id in enumerate(ordered):
            if index < train_count:
                split_name = "train"
            elif index < train_count + validation_count:
                split_name = "validation"
            else:
                split_name = "test"
            assignments[group_id] = split_name

    result = {"train": [], "validation": [], "test": []}
    for record in records:
        result[assignments[record["metadata"]["group_id"]]].append(record)
    if any(not result[name] for name in result):
        raise ValueError(
            "Le corpus doit contenir assez de groupes pour train, validation et test."
        )
    return result


def prepare_dataset(input_path: Path, output_dir: Path) -> dict[str, Any]:
    raw_records, rejected = read_jsonl(input_path)
    accepted: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    seen_conversations: set[str] = set()

    for record in raw_records:
        cleaned, reason = validate_record(record)
        if reason:
            rejected.append({"id": str(record.get("id", "")) if isinstance(record, dict) else "", "reason": reason})
            continue
        metadata = cleaned["metadata"]
        if metadata["id"] in seen_ids:
            rejected.append({"id": metadata["id"], "reason": "duplicate_id"})
            continue
        fingerprint = hashlib.sha256(canonical_messages(cleaned["messages"]).encode("utf-8")).hexdigest()
        if fingerprint in seen_conversations:
            rejected.append({"id": metadata["id"], "reason": "duplicate_conversation"})
            continue
        seen_ids.add(metadata["id"])
        seen_conversations.add(fingerprint)
        accepted.append(cleaned)

    if not accepted:
        raise ValueError("Aucun exemple admissible. Vérifie les licences, les droits, la revue de confidentialité et la qualité.")
    splits = split_groups(accepted)

    output_dir.mkdir(parents=True, exist_ok=True)
    for split_name, split_records in splits.items():
        target = output_dir / f"{split_name}.jsonl"
        with target.open("w", encoding="utf-8") as destination:
            for record in split_records:
                destination.write(json.dumps(record, ensure_ascii=False) + "\n")

    # Rejection reports never copy conversation text or other potentially private content.
    with (output_dir / "rejected.jsonl").open("w", encoding="utf-8") as destination:
        for item in rejected:
            destination.write(json.dumps(item, ensure_ascii=False) + "\n")

    languages = Counter(item["metadata"]["language"] for item in accepted)
    sources = Counter(item["metadata"]["source"] for item in accepted)
    topics = Counter(item["metadata"]["topic"] for item in accepted)
    split_topics = {
        split_name: dict(Counter(
            item["metadata"]["topic"] for item in split_records
        ))
        for split_name, split_records in splits.items()
    }
    report = {
        "schema_version": 2,
        "input": str(input_path),
        "accepted": len(accepted),
        "rejected": len(rejected),
        "splits": {name: len(items) for name, items in splits.items()},
        "groups": len({item["metadata"]["group_id"] for item in accepted}),
        "languages": dict(languages),
        "topics": dict(topics),
        "split_topics": split_topics,
        "sources": dict(sources),
        "policy": "Only rights-verified, privacy-reviewed, quality-approved records were admitted.",
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=Path("training/data/seed.jsonl"))
    parser.add_argument("--output-dir", type=Path, default=Path("training/prepared"))
    args = parser.parse_args()
    try:
        report = prepare_dataset(args.input, args.output_dir)
    except (OSError, ValueError) as error:
        print(f"Préparation impossible : {error}", file=sys.stderr)
        return 2
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
