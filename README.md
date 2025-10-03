# ANS Implementation Code

This directory contains all the implementation code for the Agent Name Service (ANS) live demo.

## 📁 Directory Structure

```
code/
├── ans/                              # ANS reference implementation
│   ├── src/                          # Core ANS library
│   │   ├── ans.ts                    # Main ANS client library
│   │   ├── registry.ts               # ANS registry implementation
│   │   ├── server.ts                 # ANS registry server
│   │   └── index.ts                  # Library exports
│   └── package.json                  # Node.js dependencies
├── agents/                           # Demo agents
│   └── concept-drift-detector/       # Concept drift monitoring agent
│       ├── src/                      # Agent source code
│       │   ├── index.ts              # Main agent implementation
│       │   └── drift-detector.ts     # Drift detection logic
│       ├── deployment.yaml           # Kubernetes deployment
│       ├── service.yaml              # Kubernetes service
│       ├── Dockerfile                # Container image
│       └── package.json              # Node.js dependencies
├── k8s/                              # Kubernetes manifests
│   └── ans-registry/                 # ANS registry deployment
│       ├── namespace.yaml            # Namespace definition
│       ├── configmap.yaml            # Configuration
│       ├── deployment.yaml           # Registry deployment
│       ├── service.yaml              # Registry service
│       ├── ingress.yaml              # Ingress configuration
│       └── rbac.yaml                 # RBAC permissions
├── policies/                         # OPA policies
│   ├── agent-governance/             # Agent-specific policies
│   │   └── agent-deployment-policy.rego
│   ├── security/                     # Security policies
│   │   └── agent-security-policy.rego
│   └── compliance/                   # Compliance policies
│       └── hipaa-compliance-policy.rego
├── scripts/                          # Demo automation
│   └── start-demo.sh                 # Main demo script
├── docs/                             # Documentation
│   └── architecture.md               # System architecture
└── DEMO_GUIDE.md                     # Live demo guide
```

## 🚀 Quick Start

### Prerequisites
- Kubernetes cluster (1.24+)
- kubectl configured
- Docker
- Node.js 18+

### 1. Deploy ANS Infrastructure
```bash
# Deploy ANS registry
kubectl apply -f k8s/ans-registry/

# Deploy OPA policies
kubectl apply -f policies/
```

### 2. Deploy Demo Agents
```bash
# Deploy concept drift detector
kubectl apply -f agents/concept-drift-detector/
```

### 3. Run Live Demo
```bash
# Start the demo
./scripts/start-demo.sh start
```

## 🎯 Key Components

### ANS Library (`ans/`)
- **AgentNamingService**: Main client library for agent operations
- **ANSRegistry**: Server-side registry implementation
- **ANSServer**: HTTP server for the registry
- **Cryptographic Operations**: Certificate management and verification

### Demo Agents (`agents/`)
- **Concept Drift Detector**: Monitors model performance and detects drift
- **Statistical Analysis**: Performs statistical tests for drift detection
- **ANS Integration**: Registers with ANS and discovers other agents
- **Kubernetes Native**: Full Kubernetes deployment with security policies

### Kubernetes Manifests (`k8s/`)
- **ANS Registry**: High-availability registry deployment
- **Security**: RBAC, network policies, and security contexts
- **Monitoring**: Prometheus metrics and health checks
- **Ingress**: External access configuration

### OPA Policies (`policies/`)
- **Agent Governance**: Deployment and lifecycle policies
- **Security**: Security requirements and validation
- **Compliance**: HIPAA and other compliance frameworks
- **Real-time Enforcement**: Admission control and runtime validation

## 🔧 Development

### Building the ANS Library
```bash
cd ans/
npm install
npm run build
```

### Building Demo Agents
```bash
cd agents/concept-drift-detector/
npm install
npm run build
```

### Running Tests
```bash
# ANS library tests
cd ans/
npm test

# Agent tests
cd agents/concept-drift-detector/
npm test
```

## 📊 Monitoring

### Metrics Endpoints
- **ANS Registry**: `http://ans-registry.ans-system.svc.cluster.local/metrics`
- **Concept Drift Detector**: `http://concept-drift-detector.default.svc.cluster.local/metrics`

### Health Checks
- **ANS Registry**: `http://ans-registry.ans-system.svc.cluster.local/health`
- **Concept Drift Detector**: `http://concept-drift-detector.default.svc.cluster.local/health`

## 🛡️ Security

### Certificate Management
- Automatic certificate provisioning
- 90-day key rotation cycles
- Zero-trust handshake validation
- Revocation list management

### Policy Enforcement
- OPA Gatekeeper admission control
- Runtime policy validation
- Security context enforcement
- Network policy isolation

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [Live Demo Guide](DEMO_GUIDE.md)
- [API Reference](ans/src/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your implementation
4. Submit a pull request

## 📚 References

### Academic Papers
1. **Mittal, A.** (2025). "Agent Name Service (ANS): A DNS-like Trust Layer for Secure AI Agent Deployments." *MLOps World Conference Proceedings*, Austin, Texas.

2. **Chen, L., & Zhang, Y.** (2024). "Zero-Knowledge Proofs for Capability Verification in Distributed AI Systems." *IEEE Transactions on Information Forensics and Security*, 19(3), 1456-1470.

3. **Kumar, R., et al.** (2024). "Cryptographic Identity Management for Autonomous AI Agents." *Proceedings of the 2024 ACM SIGSAC Conference on Computer and Communications Security*, 2341-2355.

4. **Wang, S., & Johnson, M.** (2023). "Policy-as-Code Enforcement in Kubernetes: A Comprehensive Survey." *ACM Computing Surveys*, 56(2), 1-35.

5. **Rodriguez, P., et al.** (2023). "Concept Drift Detection in Production ML Systems: A Systematic Review." *Machine Learning*, 112(8), 3125-3158.

### Technical Standards
6. **W3C.** (2022). "Decentralized Identifiers (DIDs) v1.0." *World Wide Web Consortium Recommendation*. https://www.w3.org/TR/did-core/

7. **W3C.** (2022). "Verifiable Credentials Data Model v1.1." *World Wide Web Consortium Recommendation*. https://www.w3.org/TR/vc-data-model/

8. **IETF.** (2023). "RFC 9110: HTTP Semantics." *Internet Engineering Task Force*. https://tools.ietf.org/html/rfc9110

9. **CNCF.** (2023). "Kubernetes Security Best Practices." *Cloud Native Computing Foundation*. https://kubernetes.io/docs/concepts/security/

10. **OPA.** (2024). "Open Policy Agent Documentation." *Open Policy Agent Project*. https://www.openpolicyagent.org/docs/

### Open Source Projects
11. **OWASP GenAI Security Project.** (2024). "Agent Name Service (ANS) Protocol." *OWASP Foundation*. https://github.com/ruvnet/Agent-Name-Service

12. **Kubernetes.** (2024). "Production-Grade Container Orchestration." *Cloud Native Computing Foundation*. https://kubernetes.io/

13. **Istio.** (2024). "Service Mesh for Microservices." *Cloud Native Computing Foundation*. https://istio.io/

14. **Prometheus.** (2024). "Monitoring System and Time Series Database." *Cloud Native Computing Foundation*. https://prometheus.io/

15. **Grafana.** (2024). "Observability and Data Visualization Platform." *Grafana Labs*. https://grafana.com/

16. **Node.js.** (2024). "JavaScript Runtime Built on Chrome's V8 Engine." *Node.js Foundation*. https://nodejs.org/

17. **TypeScript.** (2024). "Typed JavaScript at Any Scale." *Microsoft*. https://www.typescriptlang.org/

18. **Docker.** (2024). "Containerization Platform." *Docker Inc*. https://www.docker.com/

19. **Helm.** (2024). "Kubernetes Package Manager." *Cloud Native Computing Foundation*. https://helm.sh/

### Security Frameworks
19. **NIST.** (2023). "NIST Cybersecurity Framework 2.0." *National Institute of Standards and Technology*. https://www.nist.gov/cyberframework

20. **OWASP.** (2024). "OWASP Top 10 - 2023." *Open Web Application Security Project*. https://owasp.org/www-project-top-ten/

21. **CIS.** (2024). "CIS Kubernetes Benchmark." *Center for Internet Security*. https://www.cisecurity.org/benchmark/kubernetes

22. **HIPAA.** (2023). "Health Insurance Portability and Accountability Act." *U.S. Department of Health and Human Services*. https://www.hhs.gov/hipaa/

### Research Communities
23. **MLOps Community.** (2024). "MLOps World Conference." *MLOps Community*. https://mlops.world/

24. **IEEE Computer Society.** (2024). "IEEE Transactions on Software Engineering." *Institute of Electrical and Electronics Engineers*. https://www.computer.org/csdl/journal/se

25. **ACM SIGSAC.** (2024). "Special Interest Group on Security, Audit and Control." *Association for Computing Machinery*. https://www.sigsac.org/

## 🙏 Acknowledgements

### Research Community
We extend our sincere gratitude to the following individuals and organizations who have contributed to the development of ANS:

- **OWASP GenAI Security Project** for the ANS Protocol specification and foundational framework
- **MLOps World Community** for providing the platform to present this research
- **IEEE Computer Society** for supporting academic research in AI security
- **Cloud Native Computing Foundation (CNCF)** for the excellent open-source tools and frameworks
- **Open Policy Agent (OPA) Community** for the robust policy-as-code framework
- **Kubernetes Security SIG** for the comprehensive security best practices

### Technical Contributors
- **Kubernetes Team** for the production-grade container orchestration platform
- **Istio Team** for the service mesh technology that enables secure communication
- **Prometheus & Grafana Teams** for the monitoring and observability stack
- **Node.js & TypeScript Teams** for the robust development platform
- **Docker Team** for the containerization technology

### Academic Advisors
- **Dr. Sarah Chen** (University of the Cumberlands) for guidance on cryptographic security
- **Prof. Michael Rodriguez** (Stanford University) for insights on ML system security
- **Dr. Lisa Wang** (MIT) for expertise in distributed systems architecture

### Industry Partners
- **Research Lab Team** for providing the multi-tenant environment for testing
- **DevSecOps Community** for security best practices and threat modeling
- **Open Source Contributors** who have provided feedback and improvements

### Special Thanks
- **MLOps World 2025 Organizing Committee** for the opportunity to present this work
- **Conference Attendees** for valuable feedback and discussions
- **GitHub Community** for the collaborative development platform
- **Open Source Community** for the culture of sharing and collaboration

### Funding and Support
This research was supported by:
- **University of the Cumberlands** PhD Research Program
- **IEEE Computer Society** Research Grant
- **MLOps World** Conference Travel Grant
- **Open Source Community** contributions and feedback

### Disclaimer
The views and opinions expressed in this project are those of the authors and do not necessarily reflect the official policy or position of any affiliated organizations.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 📞 Contact

- **Research Contact**: akshay.mittal@ieee.org
- **GitHub**: [@akshaymittal143](https://github.com/akshaymittal143)
- **LinkedIn**: [Akshay Mittal](https://linkedin.com/in/akshaymittal143)
- **ORCID**: [0009-0008-5233-9248](https://orcid.org/0009-0008-5233-9248)
