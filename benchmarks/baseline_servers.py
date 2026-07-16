#!/usr/bin/env python3
"""Minimal baseline discovery services for comparative latency benchmarks."""

from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs


AGENTS: dict[str, list] = {}


def seed_agents(count: int) -> None:
    AGENTS.clear()
    for i in range(count):
        cap = "ml-inference"
        AGENTS.setdefault(cap, []).append(
            {"name": f"agent-{i}", "capability": cap, "provider": "research-lab"}
        )


class Handler(BaseHTTPRequestHandler):
    backend = "k8s_dns"
    overhead_ms = 0.0

    def log_message(self, format: str, *args) -> None:
        return

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json(200, {"status": "ok", "backend": self.backend})
            return
        if parsed.path == "/discover":
            qs = parse_qs(parsed.query)
            cap = qs.get("capability", ["ml-inference"])[0]
            agents = int(qs.get("agents", ["50"])[0])
            if len(AGENTS.get(cap, [])) < agents:
                seed_agents(agents)
            if self.overhead_ms:
                time.sleep(self.overhead_ms / 1000.0)
            # Simulate lookup cost scaling with registry size
            results = AGENTS.get(cap, [])[: max(1, agents // 10)]
            self._json(200, {"agents": results, "count": len(results)})
            return
        self._json(404, {"error": "not found"})

    def _json(self, code: int, body: dict) -> None:
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def serve(port: int, backend: str, overhead_ms: float) -> None:
    class H(Handler):
        pass

    H.backend = backend
    H.overhead_ms = overhead_ms
    HTTPServer(("127.0.0.1", port), H).serve_forever()


def main() -> None:
    seed_agents(50)
    configs = [
        (19081, "k8s_dns", 0.3),
        (19082, "istio_mtls", 2.5),
        (19083, "consul", 1.2),
    ]
    threads = []
    for port, backend, overhead in configs:
        t = threading.Thread(target=serve, args=(port, backend, overhead), daemon=True)
        t.start()
        threads.append(t)
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
