#!/usr/bin/env python3
"""Optional GPU-backed supervised fine-tuning runner for SUN.

This script is a training entry point, not a claim that training has been run.
Choose an open-weight base model only after checking its license and hardware fit.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEFAULT_SUN_BASE_MODEL = "minpeter/Qwen3-0.6B-Instruct"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--model",
        default=DEFAULT_SUN_BASE_MODEL,
        help="Modèle de base de SUN (défaut : " + DEFAULT_SUN_BASE_MODEL + ")",
    )
    parser.add_argument("--data-dir", type=Path, default=Path("training/prepared"))
    parser.add_argument("--output-dir", type=Path, default=Path("training/output/sun-sft"))
    parser.add_argument("--epochs", type=float, default=2.0)
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--gradient-accumulation", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=2e-4)
    parser.add_argument("--max-length", type=int, default=1024)
    parser.add_argument(
        "--lora",
        dest="lora",
        action="store_true",
        default=True,
        help="Utiliser LoRA (activé par défaut)",
    )
    parser.add_argument(
        "--full-finetune",
        dest="lora",
        action="store_false",
        help="Désactiver LoRA et entraîner tous les poids (plus exigeant en mémoire)",
    )
    parser.add_argument("--assistant-only-loss", action="store_true", help="N'entraîner que sur les réponses assistant si le template du modèle le prend en charge")
    args = parser.parse_args()

    try:
        import torch
        from datasets import load_dataset
        from peft import LoraConfig
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from trl import SFTConfig, SFTTrainer
    except ImportError as error:
        print(
            "Dépendances de fine-tuning absentes. Installe training/requirements.txt dans un environnement Python avec PyTorch.",
            file=sys.stderr,
        )
        print(str(error), file=sys.stderr)
        return 2

    split_files = {
        name: str(args.data_dir / f"{name}.jsonl")
        for name in ("train", "validation", "test")
    }
    for split, path in split_files.items():
        if not Path(path).is_file():
            print(f"Split {split} absent : {path}. Lance prepare_sft_dataset.py puis evaluate_dataset.py.", file=sys.stderr)
            return 2

    if args.epochs <= 0 or args.batch_size <= 0 or args.gradient_accumulation <= 0:
        print("Les epochs, batch-size et gradient-accumulation doivent être positifs.", file=sys.stderr)
        return 2
    if not torch.cuda.is_available():
        print(
            "AVERTISSEMENT : aucun GPU CUDA détecté. L'entraînement peut être extrêmement lent ou manquer de mémoire sur CPU.",
            file=sys.stderr,
        )

    try:
        dataset = load_dataset("json", data_files=split_files)
        tokenizer = AutoTokenizer.from_pretrained(
            args.model, use_fast=True, trust_remote_code=False
        )
        if not getattr(tokenizer, "chat_template", None):
            raise ValueError(
                "Le tokenizer ne fournit pas de chat_template. Choisis un modèle conversationnel compatible et vérifie ses conditions d'utilisation."
            )

        model = AutoModelForCausalLM.from_pretrained(
            args.model, torch_dtype="auto", trust_remote_code=False
        )
        peft_config = None
        if args.lora:
            peft_config = LoraConfig(
                r=16,
                lora_alpha=32,
                lora_dropout=0.05,
                bias="none",
                task_type="CAUSAL_LM",
                target_modules=[
                    "q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"
                ],
            )

        config = SFTConfig(
            output_dir=str(args.output_dir),
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.batch_size,
            gradient_accumulation_steps=args.gradient_accumulation,
            learning_rate=args.learning_rate,
            max_length=args.max_length,
            logging_steps=10,
            eval_strategy="epoch",
            save_strategy="epoch",
            report_to="none",
            assistant_only_loss=args.assistant_only_loss,
            packing=False,
        )
        trainer = SFTTrainer(
            model=model,
            args=config,
            train_dataset=dataset["train"],
            eval_dataset=dataset["validation"],
            processing_class=tokenizer,
            peft_config=peft_config,
        )
        trainer.train()
        test_metrics = trainer.evaluate(eval_dataset=dataset["test"], metric_key_prefix="test")
        args.output_dir.mkdir(parents=True, exist_ok=True)
        trainer.save_model(str(args.output_dir))
        tokenizer.save_pretrained(str(args.output_dir))
        summary = {
            "sun_model_name": "SUN",
            "base_model": args.model,
            "base_model_license": "Apache-2.0 (vérifier la fiche de modèle au moment de l'utilisation)",
            "lora": args.lora,
            "artifact_type": "peft_adapter" if args.lora else "full_model_checkpoint",
            "browser_deployment": "Non automatique : fusionner l'adaptateur, exporter et quantifier en ONNX avant intégration dans la PWA.",
            "assistant_only_loss": args.assistant_only_loss,
            "epochs": args.epochs,
            "max_length": args.max_length,
            "test_metrics": test_metrics,
            "warning": "La perte de test ne prouve pas à elle seule que les réponses sont exactes ou utiles. Effectuer une évaluation humaine et des tests Python séparés.",
        }
        (args.output_dir / "sun-training-summary.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"Entraînement interrompu : {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
