#!/usr/bin/env python3
"""Simulate an asynchronous multi-agent workflow with jitter and intermittent connection failures."""

from __future__ import annotations

import argparse
import asyncio
import json
import random
import statistics
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a realistic ANS workload simulator.")
    parser.add_argument("--duration", type=int, default=300, help="Run duration in seconds.")
    parser.add_argument("--concurrency", type=int, default=20, help="Number of concurrent workflows.")
    parser.add_argument("--registry-url", default="http://ans-registry.ans-system.svc.cluster.local:8080", help="ANS registry base URL.")
    parser.add_argument("--reasoner-url", default="http://reasoning-agent.default.svc.cluster.local:8080/process", help="Reasoning agent endpoint URL.")
    parser.add_argument("--executor-url", default="http://execution-agent.default.svc.cluster.local:8080/execute", help="Execution agent endpoint URL.")
    parser.add_argument("--drop-rate", type=float, default=0.08, help="Probability of intermittent connection drop per request.")
    parser.add_argument("--min-payload", type=int, default=256, help="Minimum payload size in bytes.")
    parser.add_argument("--max-payload", type=int, default=4096, help="Maximum payload size in bytes.")
    parser.add_argument("--output", type=Path, default=Path("results/realistic_workload.json"), help="JSON output file for results.")
    return parser.parse_args()


def sample_payload(size: int) -> str:
    return "{" + "\"data\": \"" + "x" * max(0, size - 16) + "\"}"  # approximate JSON payload size


async def fetch_url(url: str, payload: str | None = None) -> tuple[bool, float, str]:
    start = time.perf_counter()
    jitter = random.uniform(0.01, 0.35)
    await asyncio.sleep(jitter)
    if random.random() < fetch_url.drop_rate:
        return False, (time.perf_counter() - start) * 1000.0, "connection dropped"

    try:
        if payload is not None:
            data = payload.encode("utf-8")
            request = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json"})
        else:
            request = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(request, timeout=15) as response:
            response.read()
        return True, (time.perf_counter() - start) * 1000.0, "ok"
    except (urllib.error.URLError, urllib.error.HTTPError) as err:
        return False, (time.perf_counter() - start) * 1000.0, str(err)


async def workflow(task_id: int, args: argparse.Namespace, metrics: dict[str, list[float]], failures: dict[str, int], stop_time: float) -> None:
    while time.time() < stop_time:
        payload_size = random.randint(args.min_payload, args.max_payload)
        discovery_url = f"{args.registry_url}/discover?capability=ml-inference&agent=agent-{task_id}"
        success, latency, reason = await fetch_url(discovery_url)
        metrics["discovery"].append(latency)
        if not success:
            failures["discovery"] += 1
            await asyncio.sleep(random.uniform(0.5, 1.5))
            continue

        # Simulate reasoning agent receiving context and producing an outcome.
        reason_payload = sample_payload(payload_size)
        success, latency, reason = await fetch_url(args.reasoner_url, reason_payload)
        metrics["reasoning"].append(latency)
        if not success:
            failures["reasoning"] += 1
            await asyncio.sleep(random.uniform(0.5, 1.5))
            continue

        # Execution agent receives the reasoning result and attempts a command.
        execution_payload = sample_payload(max(args.min_payload // 2, payload_size // 2))
        success, latency, reason = await fetch_url(args.executor_url, execution_payload)
        metrics["execution"].append(latency)
        if not success:
            failures["execution"] += 1
            await asyncio.sleep(random.uniform(0.5, 1.5))
            continue

        await asyncio.sleep(random.uniform(0.1, 0.5))


def summarize(metrics: dict[str, list[float]], failures: dict[str, int], total_requests: int) -> dict[str, object]:
    summary: dict[str, object] = {
        "total_requests": total_requests,
        "failure_counts": failures,
        "summary": {},
    }
    for key, values in metrics.items():
        summary["summary"][key] = {
            "count": len(values),
            "mean_ms": statistics.mean(values) if values else 0.0,
            "p50_ms": statistics.median(values) if values else 0.0,
            "p90_ms": statistics.quantiles(values, n=10)[8] if len(values) >= 10 else (max(values) if values else 0.0),
            "p99_ms": statistics.quantiles(values, n=100)[98] if len(values) >= 100 else (max(values) if values else 0.0),
        }
    return summary


def main() -> None:
    args = parse_args()
    stop_time = time.time() + args.duration
    metrics = {"discovery": [], "reasoning": [], "execution": []}
    failures = {"discovery": 0, "reasoning": 0, "execution": 0}
    fetch_url.drop_rate = args.drop_rate

    tasks = [workflow(i + 1, args, metrics, failures, stop_time) for i in range(args.concurrency)]
    asyncio.run(asyncio.wait(tasks, timeout=args.duration + 30))

    total_requests = sum(len(values) for values in metrics.values())
    result = {
        "duration_seconds": args.duration,
        "concurrency": args.concurrency,
        "registry_url": args.registry_url,
        "reasoner_url": args.reasoner_url,
        "executor_url": args.executor_url,
        "drop_rate": args.drop_rate,
        "payload_range": [args.min_payload, args.max_payload],
        "metrics": summarize(metrics, failures, total_requests),
        "timestamp": int(time.time()),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2))
    print(f"Wrote realistic workload results to {args.output}")


if __name__ == "__main__":
    main()
