#!/usr/bin/env python3
"""Generate scalable mock Kubernetes agent manifests for ANS benchmarking."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

DEFAULT_IMAGE = "nginx:stable-alpine"
DEFAULT_BASE_DOMAIN = "research-lab.v1.prod"
DEFAULT_CAPABILITIES = ["ml-inference"]
DEFAULT_PROVIDER = "research-lab"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate mock ANS agent manifests.")
    parser.add_argument("--agents", type=int, default=100, help="Total number of mock agents to generate.")
    parser.add_argument("--namespaces", type=int, default=5, help="Number of namespaces to spread agents across.")
    parser.add_argument("--output-dir", type=Path, default=Path("generated"), help="Directory to write generated YAML manifests.")
    parser.add_argument("--image", default=DEFAULT_IMAGE, help="Container image to use for each mock agent.")
    parser.add_argument("--base-domain", default=DEFAULT_BASE_DOMAIN, help="Base domain suffix for ANS names.")
    parser.add_argument("--capabilities", default=','.join(DEFAULT_CAPABILITIES), help="Comma-separated capabilities for agents.")
    parser.add_argument("--provider", default=DEFAULT_PROVIDER, help="Provider label value for all mock agents.")
    return parser.parse_args()


def make_namespace_manifest(namespace: str) -> str:
    return f"""apiVersion: v1
kind: Namespace
metadata:
  name: {namespace}
  labels:
    app.kubernetes.io/name: ans-benchmark
    app.kubernetes.io/instance: ans-benchmark
    app.kubernetes.io/part-of: ans
    benchmark: "true"
---
"""


def make_agent_manifest(namespace: str, index: int, image: str, capabilities: list[str], base_domain: str, provider: str) -> str:
    name = f"agent-{index}"
    ans_name = f"a2a://{name}.{capabilities[0]}.{base_domain}"
    capabilities_yaml = "\n      - name: {}\n        version: 1.0.0\n        description: mock agent\n        permissions:\n          - read".format(capabilities[0])
    env_yaml = "\n".join(
        [
            f"        - name: ANS_REGISTRY_URL\n          value: \"http://ans-registry.ans-system.svc.cluster.local:8080\"",
            f"        - name: ANS_AGENT_NAME\n          value: \"{ans_name}\"",
            f"        - name: ANS_AGENT_PROVIDER\n          value: \"{provider}\"",
            f"        - name: ANS_CAPABILITIES\n          value: \"{','.join(capabilities)}\"",
        ]
    )

    return f"""apiVersion: v1
kind: Service
metadata:
  name: {name}-svc
  namespace: {namespace}
  labels:
    app.kubernetes.io/name: ans-mock-agent
    app.kubernetes.io/instance: {name}
    app.kubernetes.io/part-of: ans
spec:
  selector:
    app.kubernetes.io/instance: {name}
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {name}
  namespace: {namespace}
  labels:
    app.kubernetes.io/name: ans-mock-agent
    app.kubernetes.io/instance: {name}
    app.kubernetes.io/part-of: ans
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/instance: {name}
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ans-mock-agent
        app.kubernetes.io/instance: {name}
        app.kubernetes.io/part-of: ans
    spec:
      containers:
        - name: {name}
          image: {image}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
{env_yaml}
          command: ["/bin/sh", "-c"]
          args: ["while true; do sleep 3600; done"]
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "150m"
              memory: "128Mi"
"""


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    capabilities = [cap.strip() for cap in args.capabilities.split(",") if cap.strip()]
    namespaces = [f"ans-bench-{i+1}" for i in range(max(1, args.namespaces))]

    for namespace in namespaces:
        manifest = make_namespace_manifest(namespace)
        (args.output_dir / f"{namespace}.yaml").write_text(manifest)

    per_namespace = math.ceil(args.agents / len(namespaces))
    manifest_file = args.output_dir / "agents.yaml"
    with manifest_file.open("w", encoding="utf-8") as fh:
        for idx in range(args.agents):
            namespace = namespaces[idx // per_namespace]
            fh.write(make_agent_manifest(namespace, idx + 1, args.image, capabilities, args.base_domain, args.provider))
            if idx < args.agents - 1:
                fh.write("---\n")

    print(f"Wrote {args.agents} mock agents across {len(namespaces)} namespaces to {args.output_dir}")


if __name__ == "__main__":
    main()
