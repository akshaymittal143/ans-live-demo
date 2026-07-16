#!/usr/bin/env bash
# Run full benchmark suite for ANS revision study
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

TRIALS="${TRIALS:-100}"
ANS_REPO="${ANS_REPO:-/tmp/ans-live-demo/ans}"

echo "==> Building ANS registry"
(cd "$ANS_REPO" && npm install --silent && npm run build --silent)

echo "==> Running ANS + baseline trials"
python3 "$ROOT/run_trials.py" --trials "$TRIALS" --all-scales

echo "==> Analyzing results"
python3 "$ROOT/analyze.py" --raw-dir "$ROOT/results/raw" --out "$ROOT/results/summary.json"

echo "==> Generating figures and LaTeX tables"
python3 "$ROOT/generate_outputs.py"

echo "==> Running adversarial security tests"
python3 "$ROOT/security-tests/run_adversarial.py"

echo "Done. Results in $ROOT/results/"
