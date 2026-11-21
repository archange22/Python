#!/usr/bin/env python3
"""Train SUN Neural: a compact French intent-classification MLP.

This is not a generative language model. It predicts one of a limited set of
intents and exports quantized weights for the browser inference runtime.
"""
from __future__ import annotations

import argparse
import base64
import gzip
import json
import random
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch
from torch import nn

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "training" / "neural" / "intents.jsonl.gz.b64"
DEFAULT_OUTPUT = ROOT / "apps" / "chat-ia" / "models" / "sun-neural-v1.json"
LABELS = [
    "greeting", "python_variable_equal", "python_control_flow", "python_function",
    "python_collections", "python_input_files", "python_error", "python_beginner", "unknown",
]
INPUT_DIM = 512
HIDDEN_DIM = 32
SEED = 20261121


def normalize_text(value: str) -> str:
    folded = unicodedata.normalize("NFD", value.lower()).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9_]+", " ", folded).strip()


def hash_feature(value: str) -> int:
    result = 2166136261
    for byte in value.encode("utf-8"):
        result ^= byte
        result = (result * 16777619) & 0xFFFFFFFF
    return result % INPUT_DIM


def vectorize(text: str) -> np.ndarray:
    tokens = normalize_text(text).split()
    features: dict[str, float] = defaultdict(float)
    for token in tokens:
        features["w:" + token] += 1.0
    for first, second in zip(tokens, tokens[1:]):
        features["b:" + first + "_" + second] += 0.7
    padded = " " + " ".join(tokens) + " "
    for index in range(max(0, len(padded) - 2)):
        features["c:" + padded[index:index + 3]] += 0.15
    values = np.zeros(INPUT_DIM, dtype=np.float32)
    for feature, weight in features.items():
        values[hash_feature(feature)] += weight
    norm = float(np.linalg.norm(values))
    if norm:
        values /= norm
    return values


def read_records(path: Path) -> list[tuple[str, str]]:
    encoded = path.read_text(encoding="ascii").strip()
    raw = gzip.decompress(base64.b64decode(encoded)).decode("utf-8")
    records = [json.loads(line) for line in raw.splitlines() if line.strip()]
    cleaned: list[tuple[str, str]] = []
    for item in records:
        if not isinstance(item, list) or len(item) != 2:
            raise ValueError("Each corpus row must be [label, text].")
        label, text = item
        if label not in LABELS or not isinstance(text, str) or not text.strip():
            raise ValueError("Invalid example in the neural corpus.")
        cleaned.append((label, text))
    if len(cleaned) < 60:
        raise ValueError("At least 60 examples are required for train/validation/test.")
    return cleaned


def split_data(records: list[tuple[str, str]]):
    rng = random.Random(42021)
    grouped: dict[str, list[str]] = defaultdict(list)
    for label, text in records:
        grouped[label].append(text)
    train, validation, test = [], [], []
    for label in LABELS:
        items = grouped[label][:]
        rng.shuffle(items)
        count = len(items)
        test_count = max(1, round(count * 0.15))
        validation_count = max(1, round(count * 0.15))
        if test_count + validation_count >= count:
            test_count, validation_count = 1, 1
        train_count = count - test_count - validation_count
        train += [(text, LABELS.index(label)) for text in items[:train_count]]
        validation += [(text, LABELS.index(label)) for text in items[train_count:train_count + validation_count]]
        test += [(text, LABELS.index(label)) for text in items[train_count + validation_count:]]
    rng.shuffle(train)
    rng.shuffle(validation)
    rng.shuffle(test)
    return train, validation, test


def tensor_data(items):
    features = np.stack([vectorize(text) for text, _ in items])
    targets = np.asarray([label for _, label in items], dtype=np.int64)
    return torch.from_numpy(features), torch.from_numpy(targets)


def fit(items, epochs: int):
    torch.manual_seed(SEED)
    x, y = tensor_data(items)
    model = nn.Sequential(
        nn.Linear(INPUT_DIM, HIDDEN_DIM), nn.ReLU(), nn.Dropout(0.08),
        nn.Linear(HIDDEN_DIM, len(LABELS)),
    )
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.006, weight_decay=0.0003)
    for _ in range(epochs):
        model.train()
        optimizer.zero_grad()
        loss = nn.functional.cross_entropy(model(x), y)
        loss.backward()
        optimizer.step()
    model.eval()
    return model


def train_model(records, max_epochs: int):
    train, validation, test = split_data(records)
    train_x, train_y = tensor_data(train)
    val_x, val_y = tensor_data(validation)
    torch.manual_seed(SEED)
    model = nn.Sequential(
        nn.Linear(INPUT_DIM, HIDDEN_DIM), nn.ReLU(), nn.Dropout(0.08),
        nn.Linear(HIDDEN_DIM, len(LABELS)),
    )
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.006, weight_decay=0.0003)
    best_loss, best_epoch, best_state, patience = float("inf"), 0, None, 0
    for epoch in range(1, max_epochs + 1):
        model.train()
        optimizer.zero_grad()
        loss = nn.functional.cross_entropy(model(train_x), train_y)
        loss.backward()
        optimizer.step()
        model.eval()
        with torch.no_grad():
            val_loss = float(nn.functional.cross_entropy(model(val_x), val_y))
        if val_loss < best_loss - 1e-5:
            best_loss, best_epoch = val_loss, epoch
            best_state = {key: value.detach().clone() for key, value in model.state_dict().items()}
            patience = 0
        else:
            patience += 1
        if patience >= 45:
            break
    model.load_state_dict(best_state)
    model.eval()
    test_x, test_y = tensor_data(test)
    with torch.no_grad():
        probabilities = model(test_x).softmax(dim=-1)
        confidences, predictions = probabilities.max(dim=-1)
    threshold = 0.45
    accepted = confidences >= threshold
    correct = predictions.eq(test_y)
    accuracy = float(correct.float().mean())
    coverage = float(accepted.float().mean())
    selective_precision = float((correct & accepted).sum() / accepted.sum()) if int(accepted.sum()) else 0.0
    final_model = fit(train + validation, best_epoch)
    return final_model, {
        "examples": len(records), "seed": SEED, "epochs": best_epoch, "optimizer": "AdamW",
        "test_accuracy": accuracy, "confidence_threshold": threshold,
        "test_coverage_at_threshold": coverage, "selective_precision_at_threshold": selective_precision,
        "correct": int(correct.sum()), "test_examples": len(test),
        "note": "Small synthetic held-out test set; real-world performance can be lower.",
    }


def quantize_int4(values: np.ndarray):
    maximum = float(np.max(np.abs(values)))
    scale = maximum / 7.0 if maximum else 1.0
    quantized = np.clip(np.rint(values / scale), -7, 7).astype(np.int8).ravel()
    nibbles = (quantized.astype(np.int16) & 0x0F).astype(np.uint8)
    if len(nibbles) % 2:
        nibbles = np.append(nibbles, 0)
    packed = nibbles[0::2] | (nibbles[1::2] << 4)
    return base64.b64encode(packed.tobytes(order="C")).decode("ascii"), scale


def float32_b64(values: np.ndarray):
    little = np.asarray(values, dtype="<f4")
    return base64.b64encode(little.tobytes(order="C")).decode("ascii")


def export_model(model, metrics, destination: Path):
    first, last = model[0], model[3]
    hidden_weights, hidden_scale = quantize_int4(first.weight.detach().cpu().numpy())
    output_weights, output_scale = quantize_int4(last.weight.detach().cpu().numpy())
    artifact = {
        "schema_version": 1,
        "model_name": "SUN Neural 0.1",
        "model_type": "hashed_ngram_mlp_intent_classifier",
        "language": "fr",
        "limitations": [
            "intent classifier, not a generative language model",
            "selects prepared educational responses",
            "limited to intents present in the corpus",
        ],
        "architecture": {
            "input_dim": INPUT_DIM, "hidden_dim": HIDDEN_DIM, "labels": LABELS,
            "feature_weights": {"word": 1.0, "bigram": 0.7, "char_trigram": 0.15},
            "hash": "fnv1a32",
        },
        "layers": {
            "hidden_weight_int4_b64": hidden_weights, "hidden_weight_scale": hidden_scale,
            "hidden_bias_f32le_b64": float32_b64(first.bias.detach().cpu().numpy()),
            "output_weight_int4_b64": output_weights, "output_weight_scale": output_scale,
            "output_bias_f32le_b64": float32_b64(last.bias.detach().cpu().numpy()),
        },
        "training": metrics,
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(artifact, ensure_ascii=False, separators=(",", ":"))
    destination.write_text(serialized + "\n", encoding="utf-8")
    for old_part in destination.parent.glob("sun-neural-v1.part-*.txt"):
        old_part.unlink()
    chunks = [serialized[index:index + 4096] for index in range(0, len(serialized), 4096)]
    if len(chunks) > 4:
        raise ValueError("SUN Neural artifact now exceeds the four-part browser loader limit.")
    for index, chunk in enumerate(chunks, start=1):
        (destination.parent / f"sun-neural-v1.part-{index:02}.txt").write_text(chunk, encoding="utf-8")
    return artifact


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--max-epochs", type=int, default=300)
    args = parser.parse_args()
    if args.max_epochs < 1:
        parser.error("--max-epochs must be positive")
    torch.set_num_threads(max(1, min(4, torch.get_num_threads())))
    records = read_records(args.input)
    model, metrics = train_model(records, args.max_epochs)
    artifact = export_model(model, metrics, args.output)
    print(json.dumps({"output": str(args.output), "model": artifact["model_name"], "training": metrics}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
