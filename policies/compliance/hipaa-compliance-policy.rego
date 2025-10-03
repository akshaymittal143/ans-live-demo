package kubernetes.admission

import rego.v1

# Default deny
default allow = false

# Allow if HIPAA compliance requirements are met
allow {
    input.request.kind.kind == "Deployment"
    input.request.operation == "CREATE"
    
    # Check if it's an agent deployment
    is_agent_deployment
    
    # Check if HIPAA compliance is required
    hipaa_compliance_required
    
    # Validate HIPAA requirements
    hipaa_requirements_met
}

# Check if this is an agent deployment
is_agent_deployment {
    input.request.object.metadata.labels["app.kubernetes.io/part-of"] == "ans"
    input.request.object.metadata.labels["app.kubernetes.io/component"] == "agent"
}

# Check if HIPAA compliance is required
hipaa_compliance_required {
    # Check for HIPAA annotation or label
    input.request.object.metadata.annotations["compliance.ans.io/hipaa"] == "true"
    or
    input.request.object.metadata.labels["compliance.ans.io/hipaa"] == "true"
    or
    input.request.object.metadata.labels["ans.agent/extension"] == "hipaa"
}

# Validate HIPAA requirements
hipaa_requirements_met {
    # Data encryption at rest
    encryption_at_rest_configured
    
    # Data encryption in transit
    encryption_in_transit_configured
    
    # Access controls
    access_controls_configured
    
    # Audit logging
    audit_logging_configured
    
    # Data retention policies
    data_retention_configured
}

# Data encryption at rest
encryption_at_rest_configured {
    # Check for encryption annotations
    input.request.object.metadata.annotations["security.ans.io/encryption-at-rest"] == "true"
    input.request.object.metadata.annotations["security.ans.io/encryption-algorithm"] == "AES-256"
    
    # Check for encrypted volumes
    input.request.object.spec.template.spec.volumes[_].secret
    or
    input.request.object.spec.template.spec.volumes[_].persistentVolumeClaim
}

# Data encryption in transit
encryption_in_transit_configured {
    # Check for TLS configuration
    input.request.object.metadata.annotations["security.ans.io/tls-enabled"] == "true"
    input.request.object.metadata.annotations["security.ans.io/tls-version"] == "1.3"
    
    # Check for mTLS
    input.request.object.metadata.annotations["security.ans.io/mtls-enabled"] == "true"
}

# Access controls
access_controls_configured {
    # Check for RBAC
    input.request.object.metadata.annotations["security.ans.io/rbac-enabled"] == "true"
    
    # Check for least privilege
    input.request.object.metadata.annotations["security.ans.io/least-privilege"] == "true"
    
    # Check for multi-factor authentication
    input.request.object.metadata.annotations["security.ans.io/mfa-enabled"] == "true"
}

# Audit logging
audit_logging_configured {
    # Check for audit logging
    input.request.object.metadata.annotations["compliance.ans.io/audit-logging"] == "true"
    
    # Check for log retention
    input.request.object.metadata.annotations["compliance.ans.io/log-retention-days"]
    
    # Validate log retention period (minimum 6 years for HIPAA)
    retention_days := input.request.object.metadata.annotations["compliance.ans.io/log-retention-days"]
    to_number(retention_days) >= 2190  # 6 years in days
}

# Data retention policies
data_retention_configured {
    # Check for data retention policy
    input.request.object.metadata.annotations["compliance.ans.io/data-retention-policy"]
    
    # Check for data classification
    input.request.object.metadata.labels["data.ans.io/classification"] == "PHI"
    
    # Check for data handling procedures
    input.request.object.metadata.annotations["compliance.ans.io/data-handling-procedures"] == "hipaa-compliant"
}

# Generate violation message
violation[{"msg": msg}] {
    not allow
    msg := "HIPAA compliance violation: " + get_hipaa_violation_reason()
}

get_hipaa_violation_reason = reason {
    not is_agent_deployment
    reason := "Not an agent deployment"
} else = reason {
    not hipaa_compliance_required
    reason := "HIPAA compliance not required"
} else = reason {
    not encryption_at_rest_configured
    reason := "Data encryption at rest not configured"
} else = reason {
    not encryption_in_transit_configured
    reason := "Data encryption in transit not configured"
} else = reason {
    not access_controls_configured
    reason := "Access controls not configured"
} else = reason {
    not audit_logging_configured
    reason := "Audit logging not configured"
} else = reason {
    not data_retention_configured
    reason := "Data retention policies not configured"
} else = reason {
    reason := "Unknown HIPAA compliance violation"
}
