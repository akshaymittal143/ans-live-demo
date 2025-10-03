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
    
    # Deploy ANS registry
    kubectl apply -f k8s/ans-registry/
    
    # Wait for ANS registry to be ready
    print_status "Waiting for ANS registry to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/ans-registry -n $ANS_NAMESPACE
    
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
    
    # Deploy ANS policies
    kubectl apply -f policies/
    
    print_success "OPA Gatekeeper deployed with ANS policies"
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
    
    # Deploy concept drift detector
    kubectl apply -f agents/concept-drift-detector/
    
    # Deploy model retrainer
    kubectl apply -f agents/model-retrainer/
    
    # Deploy notification agent
    kubectl apply -f agents/notification-agent/
    
    # Wait for agents to be ready
    print_status "Waiting for demo agents to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/concept-drift-detector -n $DEMO_NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/model-retrainer -n $DEMO_NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/notification-agent -n $DEMO_NAMESPACE
    
    print_success "Demo agents deployed"
}

# Function to run demo scenarios
run_demo_scenarios() {
    print_status "Running demo scenarios..."
    
    # Scenario 1: Concept Drift Detection
    print_status "Scenario 1: Concept Drift Detection"
    kubectl exec -n $DEMO_NAMESPACE deployment/concept-drift-detector -- curl -X POST http://localhost:8080/api/v1/detect \
        -H "Content-Type: application/json" \
        -d '{"modelId": "demo-model-1", "dataSource": "demo-data-source-1"}'
    
    sleep 5
    
    # Scenario 2: Agent Discovery
    print_status "Scenario 2: Agent Discovery"
    kubectl exec -n $DEMO_NAMESPACE deployment/concept-drift-detector -- curl http://localhost:8080/api/v1/agents
    
    sleep 5
    
    # Scenario 3: Capability Verification
    print_status "Scenario 3: Capability Verification"
    kubectl exec -n $DEMO_NAMESPACE deployment/concept-drift-detector -- curl -X POST http://localhost:8080/api/v1/verify \
        -H "Content-Type: application/json" \
        -d '{"ansName": "a2a://concept-drift-detector.concept-drift-detection.research-lab.v2.1.prod", "capability": "concept-drift-detection"}'
    
    print_success "Demo scenarios completed"
}

# Function to show demo status
show_demo_status() {
    print_status "Demo Status:"
    echo ""
    
    # Show ANS registry status
    echo "ANS Registry:"
    kubectl get pods -n $ANS_NAMESPACE -l app.kubernetes.io/name=ans-registry
    
    echo ""
    
    # Show demo agents status
    echo "Demo Agents:"
    kubectl get pods -n $DEMO_NAMESPACE -l app.kubernetes.io/part-of=ans
    
    echo ""
    
    # Show monitoring status
    echo "Monitoring:"
    kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus
    kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
    
    echo ""
    
    # Show access information
    print_status "Access Information:"
    echo "ANS Registry: http://ans-registry.ans-system.svc.cluster.local"
    echo "Grafana: kubectl port-forward svc/grafana 3000:80 -n monitoring"
    echo "Prometheus: kubectl port-forward svc/prometheus 9090:80 -n monitoring"
}

# Function to cleanup demo
cleanup_demo() {
    print_status "Cleaning up demo..."
    
    # Delete demo agents
    kubectl delete -f agents/ --ignore-not-found=true
    
    # Delete monitoring
    kubectl delete -f k8s/monitoring/ --ignore-not-found=true
    
    # Delete OPA policies
    kubectl delete -f policies/ --ignore-not-found=true
    
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
