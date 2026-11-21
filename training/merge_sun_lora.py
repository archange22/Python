#!/usr/bin/env python3
"""Merge a trained SUN LoRA adapter into its base Qwen checkpoint."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--adapter-dir", type=Path, default=Path("training/output/sun-sft"))
    parser.add_argument("--base-model", default="minpeter/Qwen3-0.6B-Instruct")
    parser.add_argument("--output-dir", type=Path, default=Path("training/output/sun-merged"))
    args = parser.parse_args()

    if not args.adapter_dir.is_dir() or not (args.adapter_dir / "adapter_config.json").is_file():
        print(
            "Adaptateur LoRA introuvable. Exécute d'abord training/train_sft.py et vérifie adapter_config.json.",
            file=sys.stderr,
        )
        return 2
    if args.output_dir.exists() and any(args.output_dir.iterdir()):
        print("Le dossier de sortie existe déjà et n'est pas vide. Choisis un autre --output-dir.", file=sys.stderr)
        return 2

    try:
        from peft import AutoPeftModelForCausalLM
        from transformers import AutoTokenizer

        model = AutoPeftModelForCausalLM.from_pretrained(
            args.adapter_dir,
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=False,
        )
        merged = model.merge_and_unload()
        args.output_dir.mkdir(parents=True, exist_ok=True)
        merged.config.use_cache = True
        merged.save_pretrained(
            args.output_dir,
            safe_serialization=True,
            max_shard_size="2GB",
        )
        tokenizer = AutoTokenizer.from_pretrained(
            args.adapter_dir,
            use_fast=True,
            trust_remote_code=False,
        )
        tokenizer.save_pretrained(args.output_dir)

        manifest = {
            "model_name": "SUN",
            "base_model": args.base_model,
            "adapter_dir": str(args.adapter_dir),
            "merged_checkpoint": str(args.output_dir),
            "format": "Transformers checkpoint",
            "next_step": "Export the merged checkpoint to ONNX, quantize it and run the browser runtime tests before replacing SUN's ONNX model.",
            "warning": "This script does not convert ONNX, upload the model or deploy a new app version.",
        }
        (args.output_dir / "sun-merged-manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(manifest, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"Fusion LoRA impossible : {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
