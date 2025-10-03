# ANS Live Demo Guide

## 🎯 Demo Overview

This repository contains a complete live demonstration of the Agent Name Service (ANS) - a DNS-like trust layer for secure, scalable AI agent deployments on Kubernetes. The demo showcases real-world agent orchestration with cryptographic security, policy enforcement, and automated workflows.

## 🚀 Quick Start

### Prerequisites
- Kubernetes cluster (1.24+)
- kubectl configured
- Docker
- Node.js 18+ (for local development)

### 1. Clone Repository
```bash
git clone https://github.com/akshaymittal143/ans-live-demo.git
cd ans-live-demo
```

### 2. Start Live Demo
```bash
# Make script executable
chmod +x scripts/start-demo.sh

# Start the complete demo
./scripts/start-demo.sh start
```

### 3. Access Demo Components
```bash
# ANS Registry
kubectl port-forward svc/ans-registry 8080:80 -n ans-system

# Grafana Dashboard
kubectl port-forward svc/grafana 3000:80 -n monitoring

# Prometheus Metrics
kubectl port-forward svc/prometheus 9090:80 -n monitoring
```

## 🎬 Demo Scenarios

### Scenario 1: Concept Drift Detection
**Duration**: 30 seconds
**Flow**: Monitor → Validate → Retrain → Notify

```bash
# Trigger drift detection
kubectl exec -n ans-demo deployment/concept-drift-detector -- \
  curl -X POST http://localhost:8080/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{"modelId": "demo-model-1", "dataSource": "demo-data-source-1"}'
```

**What You'll See**:
- Agent detects 15% performance degradation
- Statistical tests confirm concept drift
- Automatic notification sent to ML team
- Complete audit trail in logs

### Scenario 2: Agent Discovery and Authentication
**Duration**: 10 seconds
**Flow**: Discover → Verify → Authenticate

```bash
# Discover agents by capability
kubectl exec -n ans-demo deployment/concept-drift-detector -- \
  curl http://localhost:8080/api/v1/agents?capability=notification

# Verify agent capability
kubectl exec -n ans-demo deployment/concept-drift-detector -- \
  curl -X POST http://localhost:8080/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"ansName": "a2a://notification-agent.notification.mlops-team.v1.0.prod", "capability": "notification"}'
```

**What You'll See**:
- Real-time agent discovery
- Cryptographic capability verification
- Zero-knowledge proof validation
- Sub-50ms authentication latency

### Scenario 3: Policy Enforcement
**Duration**: 15 seconds
**Flow**: Deploy → Validate → Enforce

```bash
# Deploy agent with policy validation
kubectl apply -f agents/concept-drift-detector/

# Check policy enforcement
kubectl get events --field-selector reason=PolicyViolation
```

**What You'll See**:
- OPA Gatekeeper policy validation
- Automatic certificate provisioning
- Security policy enforcement
- Compliance verification

## 📊 Key Metrics to Highlight

### Performance Metrics
- **Agent Registration**: < 100ms
- **Agent Discovery**: < 50ms
- **Capability Verification**: < 200ms
- **Policy Evaluation**: < 10ms

### Security Metrics
- **Authentication Success Rate**: 99.9%
- **Policy Compliance**: 100%
- **Certificate Validation**: 100%
- **Zero-Trust Handshakes**: 100%

### Operational Metrics
- **Agent Uptime**: 99.9%
- **Orchestration Success**: 98.5%
- **Deployment Time**: < 30 seconds
- **Recovery Time**: < 30 seconds

## 🛠️ Demo Customization

### Adding New Agents
1. Create agent directory in `agents/`
2. Implement agent logic with ANS client
3. Add Kubernetes manifests
4. Update demo script

### Modifying Policies
1. Edit OPA policies in `policies/`
2. Apply updated policies
3. Test with new deployments

### Changing Scenarios
1. Modify `scripts/start-demo.sh`
2. Add new demo scenarios
3. Update documentation

## 🎤 Presentation Tips

### Opening (2 minutes)
- Start with the problem: "Who are these agents? Can we trust them?"
- Show the scale: 1000+ daily agent interactions
- Highlight the security gap in current systems

### Technical Deep Dive (5 minutes)
- Walk through ANS naming convention
- Demonstrate cryptographic trust chain
- Show zero-knowledge capability proofs
- Explain Kubernetes integration

### Live Demo (8 minutes)
- Run Scenario 1: Concept drift detection
- Show real-time orchestration
- Highlight sub-second response times
- Demonstrate policy enforcement

### Results and Impact (3 minutes)
- Show performance metrics
- Highlight security improvements
- Discuss production readiness
- Present implementation roadmap

### Q&A (2 minutes)
- Be prepared for technical questions
- Have backup slides for deep dives
- Know the GitHub repository details
- Understand the open-source roadmap

## 🔧 Troubleshooting

### Common Issues

**Demo won't start**:
```bash
# Check cluster connectivity
kubectl cluster-info

# Verify prerequisites
kubectl get nodes
```

**Agents not registering**:
```bash
# Check ANS registry logs
kubectl logs -n ans-system deployment/ans-registry

# Verify certificates
kubectl get secrets -n ans-system
```

**Policy violations**:
```bash
# Check OPA Gatekeeper
kubectl get pods -n gatekeeper-system

# View policy violations
kubectl get events --field-selector reason=PolicyViolation
```

### Recovery Commands
```bash
# Restart demo
./scripts/start-demo.sh cleanup
./scripts/start-demo.sh start

# Check status
./scripts/start-demo.sh status

# View logs
kubectl logs -n ans-demo deployment/concept-drift-detector
```

## 📚 Additional Resources

### Documentation
- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Security Guide](docs/security-guide.md)
- [Deployment Guide](docs/deployment-guide.md)

### Code Examples
- [ANS Client Library](ans/src/ans.ts)
- [Agent Implementation](agents/concept-drift-detector/src/index.ts)
- [Policy Examples](policies/agent-governance/agent-deployment-policy.rego)

### Community
- [GitHub Repository](https://github.com/akshaymittal143/ans-live-demo)
- [Issue Tracker](https://github.com/akshaymittal143/ans-live-demo/issues)
- [Discussions](https://github.com/akshaymittal143/ans-live-demo/discussions)

## 🎯 Success Criteria

### Demo Success Indicators
- ✅ All agents register successfully
- ✅ Concept drift detection works in < 30 seconds
- ✅ Agent discovery returns results in < 50ms
- ✅ Policy enforcement blocks invalid deployments
- ✅ Monitoring shows all metrics
- ✅ Audience can access GitHub repository

### Audience Engagement
- Questions about implementation details
- Interest in trying the demo locally
- Requests for collaboration
- Follow-up meetings scheduled

## 🚀 Next Steps

### For Audience
1. **Try the demo**: Clone and run locally
2. **Join community**: GitHub discussions and Slack
3. **Contribute**: Submit issues and pull requests
4. **Collaborate**: Reach out for research partnerships

### For Presenter
1. **Follow up**: Send repository link to attendees
2. **Collect feedback**: Gather demo experience feedback
3. **Plan improvements**: Based on audience questions
4. **Schedule meetings**: With interested parties

---

**Ready to demonstrate the future of secure AI agent orchestration? Let's show them ANS in action! 🚀**
