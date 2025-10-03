package kubernetes.admission

import rego.v1

# Default deny
default allow = false

# Allow if all security conditions are met
allow {
    input.request.kind.kind == "Deployment"
    input.request.operation == "CREATE"
    
    # Check if it's an agent deployment
    is_agent_deployment
    
    # Validate network policies
    network_policies_valid
    
    # Check for required security annotations
    security_annotations_present
    
    # Validate capability restrictions
    capability_restrictions_valid
    
    # Check for required monitoring
    monitoring_configured
}

# Check if this is an agent deployment
is_agent_deployment {
    input.request.object.metadata.labels["app.kubernetes.io/part-of"] == "ans"
    input.request.object.metadata.labels["app.kubernetes.io/component"] == "agent"
}

# Validate network policies
network_policies_valid {
    # Check for network policy annotation
    input.request.object.metadata.annotations["networking.ans.io/policy"]
    
    # Validate network policy name
    policy_name := input.request.object.metadata.annotations["networking.ans.io/policy"]
    policy_name != ""
}

# Check for required security annotations
security_annotations_present {
    # Required security annotations
    input.request.object.metadata.annotations["security.ans.io/scan-enabled"] == "true"
    input.request.object.metadata.annotations["security.ans.io/vulnerability-scan"] == "true"
    input.request.object.metadata.annotations["security.ans.io/runtime-protection"] == "true"
}

# Validate capability restrictions
capability_restrictions_valid {
    capability := input.request.object.metadata.labels["ans.agent/capability"]
    
    # Define capability-specific restrictions
    capability_restrictions[capability]
}

# Capability-specific restrictions
capability_restrictions["data-access"] {
    # Data access agents require special permissions
    input.request.object.metadata.labels["security.ans.io/clearance-level"] in ["3", "4", "5"]
    input.request.object.metadata.annotations["security.ans.io/data-encryption"] == "true"
}

capability_restrictions["model-training"] {
    # Model training agents require GPU access
    input.request.object.spec.template.spec.containers[_].resources.limits["nvidia.com/gpu"]
    input.request.object.metadata.annotations["security.ans.io/gpu-isolation"] == "true"
}

capability_restrictions["deployment"] {
    # Deployment agents require cluster admin permissions
    input.request.object.metadata.labels["security.ans.io/clearance-level"] in ["4", "5"]
    input.request.object.metadata.annotations["security.ans.io/deployment-approval"] == "true"
}

capability_restrictions["monitoring"] {
    # Monitoring agents require read-only access
    input.request.object.metadata.labels["security.ans.io/clearance-level"] in ["1", "2", "3"]
    input.request.object.metadata.annotations["security.ans.io/read-only"] == "true"
}

# Check for required monitoring
monitoring_configured {
    # Check for monitoring annotations
    input.request.object.metadata.annotations["monitoring.ans.io/enabled"] == "true"
    input.request.object.metadata.annotations["monitoring.ans.io/metrics-path"]
    input.request.object.metadata.annotations["monitoring.ans.io/health-check"]
    
    # Validate metrics path
    metrics_path := input.request.object.metadata.annotations["monitoring.ans.io/metrics-path"]
    metrics_path != ""
}

# Generate violation message
violation[{"msg": msg}] {
    not allow
    msg := "Security policy violation: " + get_security_violation_reason()
}

get_security_violation_reason = reason {
    not is_agent_deployment
    reason := "Not an agent deployment"
} else = reason {
    not network_policies_valid
    reason := "Network policies not configured"
} else = reason {
    not security_annotations_present
    reason := "Required security annotations missing"
} else = reason {
    not capability_restrictions_valid
    reason := "Capability restrictions not met"
} else = reason {
    not monitoring_configured
    reason := "Monitoring not configured"
} else = reason {
    reason := "Unknown security violation"
}
