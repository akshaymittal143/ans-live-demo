#!/usr/bin/env python3
"""Compute statistics from raw benchmark trial JSON files."""

from __future__ import annotations

import argparse
import json
import math
import statistics
from pathlib import Path
from typing import Any


def percentile(sorted_vals: list[float], p: float) -> float:
    if not sorted_vals:
        return 0.0
    k = (len(sorted_vals) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_vals[int(k)]
    return sorted_vals[f] * (c - k) + sorted_vals[c] * (k - f)


def bootstrap_ci(values: list[float], confidence: float = 0.95, samples: int = 2000) -> tuple[float, float]:
    if len(values) < 2:
        m = values[0] if values else 0.0
        return m, m
    import random

    rng = random.Random(42)
    means = []
    for _ in range(samples):
        sample = [values[rng.randrange(len(values))] for _ in range(len(values))]
        means.append(statistics.mean(sample))
    means.sort()
    alpha = (1 - confidence) / 2
    lo = percentile(means, alpha * 100)
    hi = percentile(means, (1 - alpha) * 100)
    return lo, hi


def summarize(values: list[float]) -> dict[str, Any]:
    if not values:
        return {
            "n": 0,
            "mean_ms": 0.0,
            "median_ms": 0.0,
            "stdev_ms": 0.0,
            "p95_ms": 0.0,
            "p99_ms": 0.0,
            "ci95_low_ms": 0.0,
            "ci95_high_ms": 0.0,
        }
    s = sorted(values)
    lo, hi = bootstrap_ci(values)
    return {
        "n": len(values),
        "mean_ms": round(statistics.mean(values), 2),
        "median_ms": round(statistics.median(values), 2),
        "stdev_ms": round(statistics.stdev(values), 2) if len(values) > 1 else 0.0,
        "p95_ms": round(percentile(s, 95), 2),
        "p99_ms": round(percentile(s, 99), 2),
        "ci95_low_ms": round(lo, 2),
        "ci95_high_ms": round(hi, 2),
    }


def load_trials(raw_dir: Path) -> dict[str, list[float]]:
    grouped: dict[str, list[float]] = {}
    for path in sorted(raw_dir.glob("*.json")):
        data = json.loads(path.read_text())
        key = data.get("key", path.stem)
        for sample in data.get("samples_ms", []):
            # skip null/None samples (failed trials) and non-numeric entries
            if sample is None:
                continue
            try:
                grouped.setdefault(key, []).append(float(sample))
            except Exception:
                continue
    return grouped


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", default="results/raw")
    parser.add_argument("--out", default="results/summary.json")
    args = parser.parse_args()

    raw_dir = Path(args.raw_dir)
    grouped = load_trials(raw_dir)
    summary = {k: summarize(v) for k, v in sorted(grouped.items())}

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, indent=2))
    print(f"Wrote {out} ({len(summary)} series)")


if __name__ == "__main__":
    main()
