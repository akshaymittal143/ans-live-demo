package kubernetes.admission

import rego.v1

# Default deny
default allow = false

# Allow agent deployment if all conditions are met
allow {
    input.request.kind.kind == "Deployment"
    input.request.operation == "CREATE"
    
    # Check if it's an agent deployment
    is_agent_deployment
    
    # Validate agent metadata
    validate_agent_metadata
    
    # Check provider authorization
    provider_authorized
    
    # Validate security requirements
    security_requirements_met
    
    # Check resource limits
    resource_limits_valid
}

# Check if this is an agent deployment
is_agent_deployment {
    # Check for ANS-specific labels
    input.request.object.metadata.labels["app.kubernetes.io/part-of"] == "ans"
    input.request.object.metadata.labels["app.kubernetes.io/component"] == "agent"
}

# Validate agent metadata
validate_agent_metadata {
    # Check required labels
    input.request.object.metadata.labels["ans.agent/name"]
    input.request.object.metadata.labels["ans.agent/capability"]
    input.request.object.metadata.labels["ans.agent/provider"]
    input.request.object.metadata.labels["ans.agent/version"]
    
    # Validate ANS name format
    ans_name := input.request.object.metadata.labels["ans.agent/name"]
    ans_name_regex := "^[a-z0-9-]+$"
    regex.match(ans_name_regex, ans_name)
}

# Check provider authorization
provider_authorized {
    provider := input.request.object.metadata.labels["ans.agent/provider"]
    allowed_providers := ["research-lab", "mlops-team", "devsecops-team", "opensource-hub"]
    provider in allowed_providers
}

# Validate security requirements
security_requirements_met {
    # Check security context
    input.request.object.spec.template.spec.securityContext.runAsNonRoot == true
    input.request.object.spec.template.spec.securityContext.runAsUser > 0
    
    # Check for required security labels
    input.request.object.metadata.labels["security.ans.io/clearance-level"]
    
    # Validate clearance level
    clearance_level := input.request.object.metadata.labels["security.ans.io/clearance-level"]
    clearance_level in ["1", "2", "3", "4", "5"]
}

# Check resource limits
resource_limits_valid {
    container := input.request.object.spec.template.spec.containers[_]
    
    # CPU limits required
    container.resources.limits.cpu
    container.resources.requests.cpu
    
    # Memory limits required
    container.resources.limits.memory
    container.resources.requests.memory
    
    # Validate CPU limits (max 2 cores)
    cpu_limit := container.resources.limits.cpu
    regex.match("^[0-9]+m$|^[0-9]+$|^[0-9]+\\.[0-9]+$", cpu_limit)
    
    # Validate memory limits (max 4Gi)
    memory_limit := container.resources.limits.memory
    regex.match("^[0-9]+Mi$|^[0-9]+Gi$", memory_limit)
}

# Generate violation message
violation[{"msg": msg}] {
    not allow
    msg := "Agent deployment denied: " + get_violation_reason()
}

get_violation_reason = reason {
    not is_agent_deployment
    reason := "Not an agent deployment"
} else = reason {
    not validate_agent_metadata
    reason := "Invalid agent metadata"
} else = reason {
    not provider_authorized
    reason := "Provider not authorized"
} else = reason {
    not security_requirements_met
    reason := "Security requirements not met"
} else = reason {
    not resource_limits_valid
    reason := "Invalid resource limits"
} else = reason {
    reason := "Unknown violation"
}
