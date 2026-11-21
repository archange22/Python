#!/usr/bin/env python3
"""Generate SUN answers for the held-out benchmark using a merged checkpoint."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


SYSTEM_PROMPT = (
    "Tu es SUN, assistant pédagogique. Réponds dans la langue de la question. "
    "Explique avec précision et étapes utiles. Ne prétends pas avoir exécuté du code. "
    "Si tu es incertain, dis-le clairement."
)


def read_jsonl(path: Path):
    rows = []
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"Ligne {line_number} invalide dans {path}: {error}") from error
            if not isinstance(item, dict):
                raise ValueError(f"La ligne {line_number} doit contenir un objet JSON.")
            rows.append(item)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--benchmark", type=Path, default=Path("training/evaluation/benchmark.jsonl"))
    parser.add_argument("--output", type=Path, default=Path("training/evaluation/sun-responses.jsonl"))
    parser.add_argument("--max-new-tokens", type=int, default=256)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    if not args.model_dir.is_dir():
        print(f"Checkpoint introuvable : {args.model_dir}", file=sys.stderr)
        return 2
    if args.max_new_tokens < 16:
        print("--max-new-tokens doit être supérieur ou égal à 16.", file=sys.stderr)
        return 2

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        cases = read_jsonl(args.benchmark)
        if args.limit > 0:
            cases = cases[:args.limit]
        if not cases:
            raise ValueError("Le benchmark est vide.")

        tokenizer = AutoTokenizer.from_pretrained(
            args.model_dir,
            use_fast=True,
            trust_remote_code=False,
        )
        if not getattr(tokenizer, "chat_template", None):
            raise ValueError("Le checkpoint ne contient pas de modèle de conversation (chat_template).")
        model = AutoModelForCausalLM.from_pretrained(
            args.model_dir,
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=False,
        )
        model.eval()

        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open("w", encoding="utf-8") as destination:
            for index, item in enumerate(cases, start=1):
                question = str(item.get("question") or "").strip()
                if not question:
                    continue
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": question},
                ]
                inputs = tokenizer.apply_chat_template(
                    messages,
                    tokenize=True,
                    add_generation_prompt=True,
                    return_tensors="pt",
                    enable_thinking=False,
                )
                if isinstance(inputs, dict):
                    input_ids = inputs["input_ids"]
                    attention_mask = inputs.get("attention_mask")
                else:
                    input_ids = inputs
                    attention_mask = None

                embedding_device = model.get_input_embeddings().weight.device
                input_ids = input_ids.to(embedding_device)
                if attention_mask is not None:
                    attention_mask = attention_mask.to(embedding_device)

                generation = {
                    "input_ids": input_ids,
                    "max_new_tokens": args.max_new_tokens,
                    "do_sample": False,
                    "repetition_penalty": 1.08,
                    "use_cache": True,
                    "pad_token_id": tokenizer.pad_token_id or tokenizer.eos_token_id,
                    "eos_token_id": tokenizer.eos_token_id,
                }
                if attention_mask is not None:
                    generation["attention_mask"] = attention_mask

                with torch.inference_mode():
                    output_ids = model.generate(**generation)
                new_tokens = output_ids[0, input_ids.shape[-1]:]
                answer = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
                result = {
                    "id": str(item.get("id") or "case-" + str(index)),
                    "response": answer,
                }
                destination.write(json.dumps(result, ensure_ascii=False) + "\n")
                print(f"[{index}/{len(cases)}] {result['id']}")

        print(f"Réponses écrites dans {args.output}")
        print("Évalue ensuite ces réponses avec training/evaluate_responses.py.")
        return 0
    except Exception as error:
        print(f"Évaluation de SUN impossible : {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
