#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

K6_CMD="${K6_CMD:-k6}"
BASE_URL="${ANS_BASE_URL:-http://ans-registry.ans-system.svc.cluster.local:8080}"
VUS="${VUS:-50}"
DURATION="${DURATION:-2m}"
OUTPUT="${OUTPUT:-$(pwd)/k6_ans_load_test_results.json}"
SUMMARY_OUTPUT="${SUMMARY_OUTPUT:-$(pwd)/k6_ans_load_test_summary.json}"

if ! command -v "$K6_CMD" >/dev/null 2>&1; then
  echo "k6 is required but not installed. Install from https://k6.io/" >&2
  exit 1
fi

echo "Running k6 ANS load test with $VUS VUs for $DURATION against $BASE_URL"
ANS_BASE_URL="$BASE_URL" VUS="$VUS" DURATION="$DURATION" SUMMARY_OUTPUT="$SUMMARY_OUTPUT" \
  "$K6_CMD" run --out json="$OUTPUT" k6_ans_load_test.js

echo "Results written to:"
echo "  $OUTPUT"
echo "  $SUMMARY_OUTPUT"
