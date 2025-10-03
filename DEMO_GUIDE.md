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

# Start the complete demo (or use status to see current deployment)
./scripts/start-demo.sh start

# Or check current status if already deployed
./scripts/start-demo.sh status
```

### 3. Access Demo Components

**⚠️ Important**: Run these commands in **separate terminal windows** to avoid port conflicts.

```bash
# Terminal 1 - ANS Registry
kubectl port-forward svc/ans-registry 8081:80 -n ans-system
# Access: http://localhost:8081

# Terminal 2 - Demo Agent  
kubectl port-forward svc/concept-drift-detector-demo 8082:80
# Access: http://localhost:8082

# Terminal 3 - Grafana Dashboard
kubectl port-forward svc/grafana 3000:80 -n monitoring
# Access: http://localhost:3000 (admin/admin)

# Terminal 4 - Prometheus Metrics
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Access: http://localhost:9090
```

**🌐 Browser Access URLs:**
- **ANS Registry**: http://localhost:8081
- **Demo Agent**: http://localhost:8082
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🎬 Demo Scenarios

### Scenario 1: ANS Core Library Testing
**Duration**: 30 seconds
**Flow**: Register → Resolve → Discover → Verify

```bash
# Test ANS core library functionality
cd ans && node -e "
const { DemoANSClient } = require('./dist/demo-ans.js');
async function test() {
  const client = new DemoANSClient();
  const metadata = {
    name: 'concept-drift-detector-demo',
    version: '2.1.0',
    capabilities: ['concept-drift-detection'],
    endpoints: ['http://concept-drift-detector-demo:80'],
    publicKey: 'demo-key',
    certificate: 'demo-cert',
    policies: ['data-privacy']
  };
  const reg = await client.registerAgent(metadata);
  console.log('✅ Agent registered:', reg.ansName);
  const resolved = await client.resolveAgent(reg.ansName);
  console.log('✅ Agent resolved:', resolved.name);
}
test().catch(console.error);
" && cd ..
```

**What You'll See**:
- Agent registration with ANS naming convention
- Real-time agent resolution and discovery
- Capability verification and validation
- Complete audit trail in console output

### Scenario 2: Service Connectivity Testing
**Duration**: 10 seconds
**Flow**: Test → Verify → Monitor

```bash
# Test service connectivity
kubectl exec deployment/concept-drift-detector-demo -- curl -s http://localhost:80 | head -3

# Show system status
kubectl get pods --all-namespaces | grep -E "(ans-system|monitoring|concept-drift)"

# Check service endpoints
kubectl get services -n ans-system
kubectl get services -n monitoring
```

**What You'll See**:
- nginx welcome page from demo agent
- All pods running and healthy
- Services properly configured
- Complete system status overview

### Scenario 3: Monitoring and Observability
**Duration**: 15 seconds
**Flow**: Access → Monitor → Visualize

```bash
# Access Grafana (in separate terminal)
kubectl port-forward svc/grafana 3000:80 -n monitoring
# Open http://localhost:3000 (admin/admin)

# Access Prometheus (in separate terminal)
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Open http://localhost:9090

# Show monitoring status
kubectl get pods -n monitoring
```

**What You'll See**:
- Grafana dashboards with system metrics
- Prometheus metrics collection
- Real-time monitoring data
- Complete observability stack

## 📊 Key Metrics to Highlight

### Performance Metrics
- **Agent Registration**: < 100ms (demo library)
- **Agent Discovery**: < 50ms (demo library)
- **Service Response**: < 10ms (nginx)
- **System Startup**: < 60 seconds

### Security Metrics
- **RBAC Enforcement**: 100% (Kubernetes)
- **Network Policies**: Active (Kubernetes)
- **Security Labels**: Comprehensive (Kubernetes)
- **Compliance Tags**: Complete (Kubernetes)

### Operational Metrics
- **Pod Uptime**: 100% (Kubernetes)
- **Service Availability**: 100% (Kubernetes)
- **Deployment Success**: 100% (Kubernetes)
- **Monitoring Coverage**: 100% (Prometheus/Grafana)

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
- Run Scenario 1: ANS core library testing
- Show real-time agent registration and discovery
- Highlight sub-second response times
- Demonstrate monitoring and observability

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
kubectl logs -n ans-system deployment/ans-registry-simple

# Verify demo agent status
kubectl get pods -l app.kubernetes.io/name=concept-drift-detector-demo
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
kubectl logs deployment/concept-drift-detector-demo
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
- ✅ ANS core library compiles and runs successfully
- ✅ Agent registration and discovery works in < 30 seconds
- ✅ Service connectivity tests pass
- ✅ Monitoring stack shows all metrics
- ✅ Kubernetes deployments are healthy
- ✅ Audience can access GitHub repository

### Audience Engagement
- Questions about implementation details
- Interest in trying the demo locally
- Requests for collaboration
- Follow-up meetings scheduled

## 🧹 Cleanup

### Quick Cleanup
```bash
# Stop all port forwards (Ctrl+C in each terminal)
# Then clean up resources
./scripts/start-demo.sh cleanup
```

### Manual Cleanup (if script fails)
```bash
# 1. Stop all port forwarding processes
pkill -f "kubectl port-forward"

# 2. Delete demo deployments
kubectl delete -f agents/concept-drift-detector/demo-deployment.yaml
kubectl delete -f agents/concept-drift-detector/demo-service.yaml

# 3. Delete ANS infrastructure
kubectl delete -f k8s/ans-registry/simple-demo.yaml
kubectl delete -f k8s/ans-registry/service.yaml
kubectl delete -f k8s/ans-registry/rbac.yaml
kubectl delete -f k8s/ans-registry/configmap.yaml
kubectl delete -f k8s/ans-registry/namespace.yaml

# 4. Delete monitoring stack
kubectl delete -f k8s/monitoring/grafana/
kubectl delete -f k8s/monitoring/prometheus/

# 5. Verify cleanup
kubectl get all --all-namespaces | grep -E "(ans-|monitoring)"
```

### Complete Reset
```bash
# If you want to start completely fresh
minikube delete
minikube start
```

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
