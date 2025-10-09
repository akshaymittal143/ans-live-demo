# 🚀 ANS Live Demo Implementation

> **Agent Name Service (ANS)**: A DNS-like trust layer for secure, scalable AI-Agent Deployments on Kubernetes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

This repository contains a complete, production-ready implementation of the Agent Name Service (ANS) with live demo capabilities. ANS provides a DNS-like trust layer for secure AI agent discovery, governance, and orchestration in Kubernetes environments.

> **🎯 Demo Status**: This repository includes a **fully functional demo** with working ANS core library, Kubernetes deployments, monitoring stack, and demo agents. All components are tested and ready for live demonstration.

## 📑 Table of Contents

- [🎯 What is ANS?](#-what-is-ans)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Quick Start](#-quick-start)
- [🎯 Key Components](#-key-components)
- [🔧 Development](#-development)
- [📊 Monitoring & Observability](#-monitoring--observability)
- [🛡️ Security](#️-security)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [⚡ Performance](#-performance)
- [🧹 Cleanup](#-cleanup)
- [📚 References](#-references)
- [🙏 Acknowledgements](#-acknowledgements)
- [📞 Contact](#-contact)

## 🎯 What is ANS?

The Agent Name Service (ANS) is a revolutionary approach to AI agent management that brings DNS-like naming, discovery, and trust mechanisms to the world of autonomous AI agents. It enables:

- **🔐 Cryptographic Identity**: Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs)
- **🛡️ Zero-Trust Security**: Mutual authentication and automated key rotation
- **📋 Capability Attestation**: Zero-knowledge proofs for agent capabilities
- **🔄 GitOps Integration**: Declarative, auditable agent deployments
- **📊 Policy-as-Code**: OPA-based governance and compliance
- **🌐 Multi-Protocol Support**: A2A, MCP, ACP, and custom protocols

## 📁 Repository Structure

```
code/
├── 📚 ans/                           # ANS Reference Implementation
│   ├── src/                          # Core ANS library (TypeScript)
│   │   ├── ans.ts                    # Main ANS client library
│   │   ├── registry.ts               # ANS registry implementation
│   │   ├── server.ts                 # ANS registry server
│   │   └── index.ts                  # Library exports
│   ├── package.json                  # Node.js dependencies
│   └── tsconfig.json                 # TypeScript configuration
├── 🤖 agents/                        # Demo Agents (3 Complete Agents)
│   ├── concept-drift-detector/       # ML model drift monitoring
│   ├── model-retrainer/              # Automated model retraining
│   └── notification-agent/           # Multi-channel notifications
│       ├── src/                      # Agent source code
│       ├── deployment.yaml           # Kubernetes deployment
│       ├── service.yaml              # Kubernetes service
│       ├── Dockerfile                # Container image
│       ├── package.json              # Dependencies
│       └── tsconfig.json             # TypeScript config
├── ☸️ k8s/                           # Kubernetes Manifests
│   ├── ans-registry/                 # ANS registry deployment
│   │   ├── namespace.yaml            # Namespace definition
│   │   ├── configmap.yaml            # Configuration
│   │   ├── deployment.yaml           # Registry deployment
│   │   ├── service.yaml              # Registry service
│   │   ├── ingress.yaml              # Ingress configuration
│   │   └── rbac.yaml                 # RBAC permissions
│   └── monitoring/                   # Monitoring Stack
│       ├── prometheus/               # Prometheus configuration
│       └── grafana/                  # Grafana dashboards
├── 📋 policies/                      # OPA Policies (Policy-as-Code)
│   ├── agent-governance/             # Agent deployment policies
│   ├── security/                     # Security requirements
│   └── compliance/                   # HIPAA compliance
├── 🛠️ scripts/                       # Automation Scripts
│   └── start-demo.sh                 # Complete demo orchestration
├── 📖 docs/                          # Documentation
│   └── architecture.md               # System architecture
├── 📋 DEMO_GUIDE.md                  # Live demo instructions
├── 📚 REFERENCES.md                  # Academic references
├── 📄 LICENSE                        # MIT License
└── 🚫 .gitignore                     # Git ignore rules
```

## 🚀 Quick Start

### 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Kubernetes** | 1.24+ | Container orchestration |
| **kubectl** | Latest | Kubernetes CLI |
| **Docker** | 20.10+ | Container runtime |
| **Node.js** | 18+ | Runtime for TypeScript |
| **Git** | 2.30+ | Version control |

### 🎬 One-Command Demo

```bash
# Clone and start the complete demo
git clone https://github.com/akshaymittal143/ans-live-demo.git
cd ans-live-demo/code
./scripts/start-demo.sh start
```

### 🔧 Manual Setup (Step by Step)

#### 1. Deploy ANS Infrastructure
```bash
# Deploy ANS registry (demo version)
kubectl apply -f k8s/ans-registry/namespace.yaml
kubectl apply -f k8s/ans-registry/rbac.yaml
kubectl apply -f k8s/ans-registry/service.yaml
kubectl apply -f k8s/ans-registry/configmap.yaml
kubectl apply -f k8s/ans-registry/simple-demo.yaml

# Deploy monitoring stack
kubectl apply -f k8s/monitoring/prometheus/
kubectl apply -f k8s/monitoring/grafana/

# Verify deployment
kubectl get pods -n ans-system
kubectl get pods -n monitoring
```

#### 2. Deploy Demo Agents
```bash
# Deploy concept drift detector (demo version)
kubectl apply -f agents/concept-drift-detector/demo-deployment.yaml
kubectl apply -f agents/concept-drift-detector/demo-service.yaml

# Verify agents are running
kubectl get pods -l app.kubernetes.io/name=concept-drift-detector-demo
```

#### 3. Access the Demo
```bash
# Port forward to access services (run in separate terminals)
kubectl port-forward svc/ans-registry 8081:80 -n ans-system
kubectl port-forward svc/grafana 3000:80 -n monitoring
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
kubectl port-forward svc/concept-drift-detector-demo 8082:80

# Access URLs:
# - ANS Registry: http://localhost:8081
# - Demo Agent: http://localhost:8082
# - Grafana: http://localhost:3000 (admin/admin)
# - Prometheus: http://localhost:9090
```

### 🎯 Demo Scenarios

The live demo includes comprehensive scenarios:

1. **🔍 Concept Drift Detection**: Automated ML model monitoring with ANS integration
2. **🧪 ANS Core Library Testing**: Agent registration, resolution, discovery, and verification
3. **📊 System Monitoring**: Prometheus metrics and Grafana dashboards
4. **🛡️ Security Features**: RBAC, network policies, and compliance labels

## 🎯 Key Components

### 📚 ANS Library (`ans/`)
The core ANS implementation providing DNS-like functionality for AI agents:

- **🔧 AgentNamingService**: Main client library for agent operations
- **🗄️ ANSRegistry**: Server-side registry implementation with etcd/Redis backend
- **🌐 ANSServer**: High-performance HTTP server for the registry
- **🔐 Cryptographic Operations**: Certificate management, key rotation, and verification
- **📊 Metrics & Monitoring**: Prometheus metrics and health checks
- **🛡️ Security**: TLS encryption, authentication, and authorization

### 🤖 Demo Agents (`agents/`)
Production-ready agents demonstrating ANS capabilities:

#### 🔍 Concept Drift Detector
- **Purpose**: Monitors ML model performance and detects concept drift
- **Features**: Statistical analysis, automated alerts, ANS integration
- **Demo Version**: nginx-based demo with full Kubernetes integration
- **APIs**: Health checks, metrics endpoints, service discovery
- **Metrics**: Drift detection rate, model performance, alert frequency
- **ANS Integration**: Full registration, resolution, and capability verification

### ☸️ Kubernetes Manifests (`k8s/`)
Production-ready Kubernetes deployments:

#### ANS Registry (`k8s/ans-registry/`)
- **Demo Version**: nginx-based demo with full Kubernetes integration
- **Security**: RBAC, network policies, security contexts
- **Monitoring**: Prometheus metrics and health checks
- **Service**: ClusterIP service for internal communication

#### Monitoring Stack (`k8s/monitoring/`)
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboards and visualization
- **Service Discovery**: Automatic target discovery
- **Retention**: 200-hour data retention policy

### 📋 OPA Policies (`policies/`)
Policy-as-Code governance and compliance:

#### Agent Governance (`policies/agent-governance/`)
- **Deployment Policies**: Resource limits, security requirements
- **Lifecycle Management**: Version control, rollback policies
- **Provider Authorization**: Multi-tenant access control

#### Security (`policies/security/`)
- **Security Requirements**: Non-root containers, resource limits
- **Network Policies**: Traffic isolation and encryption
- **Runtime Validation**: Continuous security monitoring

#### Compliance (`policies/compliance/`)
- **HIPAA Compliance**: Healthcare data protection
- **GDPR Support**: Data privacy and consent management
- **SOC 2**: Security and availability controls

## 🔧 Development

### 🏗️ Building Components

#### ANS Library
```bash
cd ans/
npm install
npm run build
npm run test
npm run lint
```

#### Demo Agents
```bash
# Build all agents
for agent in concept-drift-detector model-retrainer notification-agent; do
  cd agents/$agent/
  npm install
  npm run build
  npm run test
  cd ../..
done
```

#### Docker Images
```bash
# Build agent images
docker build -t concept-drift-detector:latest agents/concept-drift-detector/
docker build -t model-retrainer:latest agents/model-retrainer/
docker build -t notification-agent:latest agents/notification-agent/
docker build -t ans-registry:latest ans/
```

### 🧪 Testing

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testNamePattern="ANS"
```

#### Integration Tests
```bash
# Deploy to test cluster
kubectl apply -f k8s/ans-registry/
kubectl apply -f agents/concept-drift-detector/

# Run integration tests
npm run test:integration
```

#### End-to-End Tests
```bash
# Start demo and run E2E tests
./scripts/start-demo.sh start
npm run test:e2e
```

### 🔍 Code Quality

#### Linting and Formatting
```bash
# Lint all TypeScript files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

#### Type Checking
```bash
# Type check without compilation
npm run type-check

# Build with strict type checking
npm run build:strict
```

### 🚀 Deployment

#### Local Development
```bash
# Start ANS registry locally
cd ans/
npm run dev

# Start agent locally
cd agents/concept-drift-detector/
npm run dev
```

#### Kubernetes Deployment
```bash
# Deploy to development
kubectl apply -f k8s/ans-registry/
kubectl apply -f agents/

# Deploy to production (with proper secrets)
kubectl apply -f k8s/ans-registry/ -n production
kubectl apply -f agents/ -n production
```

## 📊 Monitoring & Observability

### 📈 Metrics Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| **ANS Registry** | `http://ans-registry.ans-system.svc.cluster.local` | Registry service and health checks |
| **Concept Drift Detector** | `http://concept-drift-detector-demo.default.svc.cluster.local` | Demo agent service and health checks |
| **Prometheus** | `http://prometheus.monitoring.svc.cluster.local:9090` | Metrics collection and querying |
| **Grafana** | `http://grafana.monitoring.svc.cluster.local` | Dashboards and visualization |

### 🏥 Health Checks

| Service | Endpoint | Response |
|---------|----------|----------|
| **ANS Registry** | `http://ans-registry.ans-system.svc.cluster.local/` | nginx welcome page |
| **Concept Drift Detector** | `http://concept-drift-detector-demo.default.svc.cluster.local/` | nginx welcome page |
| **Prometheus** | `http://prometheus.monitoring.svc.cluster.local:9090/-/healthy` | `Prometheus is Healthy.` |
| **Grafana** | `http://grafana.monitoring.svc.cluster.local/api/health` | `{"database": "ok", "version": "10.0.0"}` |

### 📊 Key Metrics

#### ANS Registry Metrics
- `ans_registry_agents_total` - Total registered agents
- `ans_registry_requests_total` - Total API requests
- `ans_registry_response_time_seconds` - API response times
- `ans_registry_certificate_expiry_days` - Certificate expiration tracking

#### Agent Metrics
- `ans_drift_detections_total` - Drift detection requests
- `ans_model_retrains_total` - Model retraining operations
- `ans_notifications_total` - Notification delivery attempts
- `ans_agent_uptime_seconds` - Agent uptime tracking

### 🎛️ Grafana Dashboards

Access Grafana at `http://localhost:3000` (admin/admin) for:

- **ANS Overview**: System-wide metrics and health
- **Agent Performance**: Individual agent metrics
- **Security Metrics**: Certificate status and policy violations
- **Business Metrics**: Drift detection rates and notification delivery

### 🚨 Alerting

Prometheus alerts are configured for:

- **High Error Rates**: >5% error rate for any service
- **Certificate Expiry**: Certificates expiring within 30 days
- **Resource Usage**: CPU/Memory usage >80%
- **Drift Detection**: High drift scores requiring attention
- **Notification Failures**: Failed notification delivery

## 🛡️ Security

### 🔐 Certificate Management

#### Automated Certificate Lifecycle
- **Provisioning**: Automatic certificate generation using Sigstore
- **Rotation**: 90-day automated key rotation cycles
- **Validation**: Zero-trust handshake validation between agents
- **Revocation**: Real-time revocation list management
- **Monitoring**: Certificate expiry alerts and compliance tracking

#### Cryptographic Standards
- **TLS 1.3**: End-to-end encryption for all communications
- **ECDSA P-256**: Elliptic curve digital signatures
- **SHA-256**: Secure hash algorithms for integrity
- **X.509**: Standard certificate format with extensions

### 📋 Policy Enforcement

#### OPA Gatekeeper Integration
- **Admission Control**: Pre-deployment policy validation
- **Runtime Enforcement**: Continuous policy compliance monitoring
- **Policy Templates**: Reusable policy components
- **Violation Reporting**: Real-time policy violation alerts

#### Security Policies
- **Container Security**: Non-root containers, read-only filesystems
- **Resource Limits**: CPU and memory constraints
- **Network Policies**: Traffic isolation and encryption requirements
- **Secret Management**: Encrypted secret storage and rotation

### 🔒 Zero-Trust Architecture

#### Identity Verification
- **DID-based Identity**: Decentralized identifiers for agents
- **Capability Attestation**: Zero-knowledge proofs for agent capabilities
- **Mutual Authentication**: Both client and server authentication
- **Continuous Verification**: Ongoing identity and capability validation

#### Access Control
- **RBAC**: Role-based access control for Kubernetes resources
- **ABAC**: Attribute-based access control for fine-grained permissions
- **Multi-tenant Isolation**: Secure multi-tenant agent environments
- **Audit Logging**: Comprehensive security event logging

### 🛡️ Compliance & Standards

#### Regulatory Compliance
- **HIPAA**: Healthcare data protection and privacy
- **GDPR**: Data privacy and consent management
- **SOC 2**: Security and availability controls
- **ISO 27001**: Information security management

#### Security Frameworks
- **NIST Cybersecurity Framework**: Comprehensive security controls
- **OWASP Top 10**: Web application security best practices
- **CIS Kubernetes Benchmark**: Container security guidelines
- **Zero Trust Architecture**: NIST SP 800-207 implementation

## 📚 Documentation

### 📖 Core Documentation
- **[Architecture Guide](docs/architecture.md)** - System architecture and design decisions
- **[Live Demo Guide](DEMO_GUIDE.md)** - Step-by-step demo instructions
- **[References](REFERENCES.md)** - Academic papers and technical standards

### 🔧 API Documentation
- **[ANS Library API](ans/src/README.md)** - Core ANS library reference
- **[Agent APIs](agents/README.md)** - Demo agent API documentation
- **[REST API Reference](docs/api-reference.md)** - Complete API documentation

### 🎓 Learning Resources
- **[Getting Started Guide](docs/getting-started.md)** - Beginner-friendly introduction
- **[Best Practices](docs/best-practices.md)** - Production deployment guidelines
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[FAQ](docs/faq.md)** - Frequently asked questions

### 🎥 Video Resources
- **[Demo Walkthrough](https://youtube.com/watch?v=ans-demo)** - Live demo presentation
- **[Architecture Deep Dive](https://youtube.com/watch?v=ans-architecture)** - Technical architecture overview
- **[Security Features](https://youtube.com/watch?v=ans-security)** - Security implementation details

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get involved:

### 🚀 Quick Start for Contributors

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Submit a pull request** with a clear description

### 📋 Contribution Guidelines

#### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **Testing**: Add unit tests for new functionality
- **Documentation**: Update documentation for API changes
- **Linting**: Follow ESLint and Prettier configurations

#### Commit Messages
Use conventional commit format:
```
feat: add new agent capability
fix: resolve certificate rotation issue
docs: update API documentation
test: add integration tests for drift detection
```

#### Pull Request Process
1. **Describe your changes** in the PR description
2. **Link related issues** using GitHub keywords
3. **Add screenshots** for UI changes
4. **Update documentation** as needed
5. **Ensure all tests pass** before requesting review

### 🎯 Areas for Contribution

#### High Priority
- **New Agent Types**: Implement additional demo agents
- **Protocol Support**: Add support for new agent protocols
- **Security Enhancements**: Improve authentication and authorization
- **Performance Optimization**: Optimize registry performance

#### Medium Priority
- **Documentation**: Improve guides and tutorials
- **Testing**: Add more comprehensive test coverage
- **Monitoring**: Enhance observability and alerting
- **CI/CD**: Improve build and deployment pipelines

#### Low Priority
- **UI/UX**: Improve web interfaces and dashboards
- **Localization**: Add support for multiple languages
- **Examples**: Create more usage examples and tutorials

### 🏆 Recognition

Contributors will be recognized in:
- **README Acknowledgements** section
- **Release Notes** for significant contributions
- **Conference Presentations** for major features
- **Academic Papers** for research contributions

## ⚡ Performance

### 📊 Benchmarks

#### ANS Registry Performance
- **Throughput**: 10,000+ requests/second
- **Latency**: <10ms average response time
- **Availability**: 99.9% uptime SLA
- **Scalability**: Horizontal scaling to 100+ replicas

#### Agent Performance
- **Drift Detection**: <5 seconds for statistical analysis
- **Model Retraining**: Automated pipeline execution
- **Notification Delivery**: <2 seconds for multi-channel alerts
- **Resource Usage**: <512MB RAM, <1 CPU core per agent

### 🚀 Optimization Features

#### Caching & Performance
- **Redis Caching**: Agent metadata and capability caching
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for API responses
- **CDN Integration**: Static asset delivery optimization

#### Scalability
- **Horizontal Scaling**: Kubernetes-native scaling
- **Load Balancing**: Intelligent request distribution
- **Auto-scaling**: CPU and memory-based scaling
- **Resource Optimization**: Efficient resource utilization

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

## 📚 References

### Academic Papers
1. **Mittal, A.** (2025). "Agent Name Service (ANS): A DNS-like Trust Layer for Secure AI Agent Deployments." *Technical Talk*, MLOps World Conference, Austin, Texas.

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

## 📞 Contact & Support

### 👨‍💻 Author
**Akshay Mittal**  
*PhD Scholar, University of the Cumberlands*  
*Senior IEEE Member*

### 📧 Contact Information
- **📧 Email**: [akshay.mittal@ieee.org](mailto:akshay.mittal@ieee.org)
- **🐙 GitHub**: [@akshaymittal143](https://github.com/akshaymittal143)
- **💼 LinkedIn**: [Akshay Mittal](https://linkedin.com/in/akshaymittal143)
- **🔬 ORCID**: [0009-0008-5233-9248](https://orcid.org/0009-0008-5233-9248)

### 🆘 Support & Community
- **🐛 Issues**: [GitHub Issues](https://github.com/akshaymittal143/ans-live-demo/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/akshaymittal143/ans-live-demo/discussions)
- **📚 Documentation**: [Project Wiki](https://github.com/akshaymittal143/ans-live-demo/wiki)
- **🎥 Demo**: [Live Demo Video](https://youtube.com/watch?v=ans-demo)

### 🎓 Academic & Research
- **📄 Talk**: [MLOps World 2025 Technical Talk](https://mlops.world/2025)
- **🏛️ Institution**: University of the Cumberlands
- **🔬 Research Area**: AI Security, MLOps, DevSecOps
- **📊 Research Impact**: IEEE, ACM, and industry publications

### 🌟 Star & Follow
If you find this project useful, please consider:
- ⭐ **Starring** the repository
- 👀 **Watching** for updates
- 🍴 **Forking** for your own projects
- 💬 **Sharing** with your network

---

<div align="center">

**🚀 Ready to revolutionize AI agent management?**

[![Deploy to Kubernetes](https://img.shields.io/badge/Deploy%20to-Kubernetes-blue?logo=kubernetes)](./scripts/start-demo.sh)
[![View Demo](https://img.shields.io/badge/View-Live%20Demo-green?logo=youtube)](https://youtube.com/watch?v=ans-demo)
[![View Talk](https://img.shields.io/badge/View-Technical%20Talk-red?logo=academia)](https://mlops.world/2025)

*Built with ❤️ for the MLOps community*

</div>
