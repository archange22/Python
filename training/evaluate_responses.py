#!/usr/bin/env python3
"""Score generated SUN answers against a small independent concept checklist.

This is a lightweight diagnostic, not a semantic judge. Human review remains
mandatory for correctness, explanation quality, safety and runnable code.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Any


def normalize(text: str) -> str:
    value = unicodedata.normalize("NFKD", text.lower())
    value = "".join(character for character in value if not unicodedata.combining(character))
    return re.sub(r"\s+", " ", value).strip()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier absent : {path}")
    result = []
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"{path}:{line_number}: JSON invalide") from error
            if not isinstance(item, dict):
                raise ValueError(f"{path}:{line_number}: chaque ligne doit être un objet JSON")
            result.append(item)
    return result


def score_responses(benchmark: list[dict[str, Any]], responses: list[dict[str, Any]]) -> dict[str, Any]:
    expected_ids = {item.get("id") for item in benchmark}
    response_by_id: dict[str, dict[str, Any]] = {}
    for response in responses:
        identifier = response.get("id")
        if identifier not in expected_ids:
            raise ValueError(f"Réponse avec un identifiant absent du benchmark : {identifier}")
        if identifier in response_by_id:
            raise ValueError(f"Réponse en double : {identifier}")
        if not isinstance(response.get("response"), str):
            raise ValueError(f"Réponse textuelle absente pour {identifier}")
        response_by_id[identifier] = response

    results = []
    category_scores: dict[str, list[float]] = defaultdict(list)
    human_scores = []
    all_concepts = 0
    matched_concepts = 0

    for item in benchmark:
        identifier = item.get("id")
        response = response_by_id.get(identifier, {}).get("response", "")
        normalized = normalize(response)
        concepts = item.get("expected_concepts", [])
        matched = 0
        details = []
        for alternatives in concepts:
            variants = [normalize(str(value)) for value in alternatives]
            found = any(value and value in normalized for value in variants)
            matched += int(found)
            details.append({"alternatives": alternatives, "matched": found})
        total = len(concepts)
        coverage = matched / total if total else 0.0
        category = str(item.get("category", "other"))
        category_scores[category].append(coverage)
        all_concepts += total
        matched_concepts += matched

        human_score = response_by_id.get(identifier, {}).get("human_score")
        if human_score is not None:
            try:
                numeric_score = float(human_score)
            except (TypeError, ValueError):
                raise ValueError(f"human_score invalide pour {identifier}")
            if not 1 <= numeric_score <= 5:
                raise ValueError(f"human_score doit être entre 1 et 5 pour {identifier}")
            human_scores.append(numeric_score)

        results.append({
            "id": identifier,
            "category": category,
            "answered": bool(response.strip()),
            "concept_coverage": round(coverage, 3),
            "matched_concepts": matched,
            "total_concepts": total,
            "concept_checks": details,
            "human_score": human_score,
        })

    report = {
        "cases": len(benchmark),
        "answered_cases": sum(1 for item in results if item["answered"]),
        "overall_concept_coverage": round(matched_concepts / all_concepts, 3) if all_concepts else 0.0,
        "category_coverage": {
            category: round(sum(values) / len(values), 3)
            for category, values in category_scores.items() if values
        },
        "human_score_average": round(sum(human_scores) / len(human_scores), 2) if human_scores else None,
        "human_scored_cases": len(human_scores),
        "results": results,
        "warning": "Les mots-clés peuvent être présents dans une réponse fausse. Cette mesure ne remplace pas la vérification humaine ni l'exécution de tests Python.",
    }
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--benchmark", type=Path, default=Path("training/evaluation/benchmark.jsonl"))
    parser.add_argument("--responses", type=Path, required=True, help="JSONL avec id, response et human_score facultatif")
    parser.add_argument("--output", type=Path, default=Path("training/evaluation/response-report.json"))
    args = parser.parse_args()
    try:
        report = score_responses(load_jsonl(args.benchmark), load_jsonl(args.responses))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (OSError, ValueError) as error:
        print(f"Évaluation impossible : {error}", file=sys.stderr)
        return 2
    print(json.dumps({key: value for key, value in report.items() if key != "results"}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
