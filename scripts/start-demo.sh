#!/bin/bash

# ANS Live Demo Startup Script
# This script sets up and runs the complete ANS demonstration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEMO_NAMESPACE="ans-demo"
ANS_NAMESPACE="ans-system"
REGISTRY_URL="http://ans-registry.ans-system.svc.cluster.local"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Function to check if cluster is accessible
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
}

# Function to create demo namespace
create_demo_namespace() {
    print_status "Creating demo namespace..."
    kubectl create namespace $DEMO_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    print_success "Demo namespace created"
}

# Function to deploy ANS infrastructure
deploy_ans_infrastructure() {
    print_status "Deploying ANS infrastructure..."
    
    # Deploy ANS registry (demo version)
    kubectl apply -f k8s/ans-registry/namespace.yaml
    kubectl apply -f k8s/ans-registry/rbac.yaml
    kubectl apply -f k8s/ans-registry/service.yaml
    kubectl apply -f k8s/ans-registry/configmap.yaml
    kubectl apply -f k8s/ans-registry/simple-demo.yaml
    
    # Wait for ANS registry to be ready
    print_status "Waiting for ANS registry to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/ans-registry-simple -n $ANS_NAMESPACE
    
    print_success "ANS infrastructure deployed"
}

# Function to deploy OPA Gatekeeper
deploy_opa_gatekeeper() {
    print_status "Deploying OPA Gatekeeper..."
    
    # Install OPA Gatekeeper
    kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml
    
    # Wait for Gatekeeper to be ready
    print_status "Waiting for OPA Gatekeeper to be ready..."
    kubectl wait --for=condition=ready --timeout=300s pod -l control-plane=controller-manager -n gatekeeper-system
    
    # Deploy ANS policies (skip for demo - policies are .rego files, not YAML)
    # kubectl apply -f policies/  # This would fail because policies are .rego files
    echo "ℹ️  OPA policies (.rego files) are available but not deployed in this demo"
    echo "ℹ️  In production, these would be deployed as ConfigMaps or OPA CRDs"
    
    print_success "OPA Gatekeeper deployed (policies available but not deployed)"
}

# Function to deploy monitoring
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f k8s/monitoring/prometheus/
    
    # Deploy Grafana
    kubectl apply -f k8s/monitoring/grafana/
    
    # Wait for monitoring to be ready
    print_status "Waiting for monitoring stack to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring
    
    print_success "Monitoring stack deployed"
}

# Function to deploy demo agents
deploy_demo_agents() {
    print_status "Deploying demo agents..."
    
    # Deploy concept drift detector (demo version)
    kubectl apply -f agents/concept-drift-detector/demo-deployment.yaml
    kubectl apply -f agents/concept-drift-detector/demo-service.yaml
    
    # Wait for agents to be ready
    print_status "Waiting for demo agents to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/concept-drift-detector-demo
    
    print_success "Demo agents deployed"
}

# Function to run demo scenarios
run_demo_scenarios() {
    print_status "Running demo scenarios..."
    
    # Scenario 1: Test ANS Core Library
    print_status "Scenario 1: Testing ANS Core Library"
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
    
    sleep 2
    
    # Scenario 2: Test Service Connectivity
    print_status "Scenario 2: Testing Service Connectivity"
    kubectl exec deployment/concept-drift-detector-demo -- curl -s http://localhost:80 | head -3
    
    sleep 2
    
    # Scenario 3: Show System Status
    print_status "Scenario 3: System Status"
    kubectl get pods --all-namespaces | grep -E "(ans-system|monitoring|concept-drift)"
    
    print_success "Demo scenarios completed"
}

# Function to show demo status
show_demo_status() {
    print_status "Demo Status:"
    echo ""
    
    # Show ANS registry status
    echo "ANS Registry:"
    kubectl get pods -n $ANS_NAMESPACE -l app.kubernetes.io/name=ans-registry-simple
    
    echo ""
    
    # Show demo agents status
    echo "Demo Agents:"
    kubectl get pods -l app.kubernetes.io/name=concept-drift-detector-demo
    
    echo ""
    
    # Show monitoring status
    echo "Monitoring:"
    kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus
    kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
    
    echo ""
    
    # Show access information
    print_status "Access Information:"
    echo "ANS Registry: http://ans-registry.ans-system.svc.cluster.local"
    echo "Demo Agent: http://concept-drift-detector-demo.default.svc.cluster.local"
    echo "Grafana: kubectl port-forward svc/grafana 3000:80 -n monitoring"
    echo "Prometheus: kubectl port-forward svc/prometheus 9090:80 -n monitoring"
}

# Function to cleanup demo
cleanup_demo() {
    print_status "Cleaning up demo..."
    
    # Delete demo agents
    kubectl delete -f agents/concept-drift-detector/demo-deployment.yaml --ignore-not-found=true
    kubectl delete -f agents/concept-drift-detector/demo-service.yaml --ignore-not-found=true
    
    # Delete monitoring
    kubectl delete -f k8s/monitoring/ --ignore-not-found=true
    
    # Delete ANS infrastructure
    kubectl delete -f k8s/ans-registry/ --ignore-not-found=true
    
    # Delete demo namespace
    kubectl delete namespace $DEMO_NAMESPACE --ignore-not-found=true
    
    print_success "Demo cleanup completed"
}

# Main function
main() {
    print_status "Starting ANS Live Demo..."
    echo ""
    
    # Check prerequisites
    check_kubectl
    check_cluster
    
    # Parse command line arguments
    case "${1:-start}" in
        "start")
            create_demo_namespace
            deploy_ans_infrastructure
            deploy_opa_gatekeeper
            deploy_monitoring
            deploy_demo_agents
            run_demo_scenarios
            show_demo_status
            print_success "ANS Live Demo is ready!"
            ;;
        "status")
            show_demo_status
            ;;
        "cleanup")
            cleanup_demo
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [start|status|cleanup|help]"
            echo ""
            echo "Commands:"
            echo "  start   - Start the complete ANS demo (default)"
            echo "  status  - Show demo status"
            echo "  cleanup - Clean up demo resources"
            echo "  help    - Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
