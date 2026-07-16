# Hybrid infrastructure for ANS revision benchmarks

## Primary scale cluster (GKE)

- Platform: Google Kubernetes Engine (GKE) Standard, `us-central1`
- Topology: 1 control-plane (managed) + 14 worker nodes (`e2-standard-4`: 4 vCPU, 16 GB RAM each)
- Kubernetes: v1.29.x
- Istio: 1.22.x (mTLS STRICT)
- OPA: 0.68.x (Gatekeeper admission)
- Consul: 1.18.x (Helm, 3-server raft)
- Provisioning: `benchmarks/infra/gke-cluster.tf` (Terraform)

## Local security test cluster

- Platform: kind v0.24, 1 control-plane + 2 workers (mirrors original 3-node study)
- Used for adversarial test scripting and GitOps workflow validation

## Workload execution

```bash
cd benchmarks
./run_trials.sh          # 100 trials x agent scales 50/200/500/1000
./collect_resources.sh   # resource overhead snapshot
```

## Scope statement

Evaluation demonstrates controlled scalability up to 1000 concurrent agents on a 15-node cluster.
Multi-cloud and internet-scale behavior remain out of scope and are listed as limitations.
