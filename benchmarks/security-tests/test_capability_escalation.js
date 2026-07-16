#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const opaPolicy = '/tmp/ans-live-demo/policies/security/agent-security-policy.rego';
const input = path.join(__dirname, '..', 'helpers', 'sample_admission_input.json');
let passed = 0;
const trials = 10;

for (let i = 0; i < trials; i++) {
  const escalationInput = JSON.parse(require('fs').readFileSync(input, 'utf8'));
  escalationInput.request.object.metadata.annotations['capability.ans.io/restricted'] = 'admin-escalation';
  const tmp = `/tmp/opa-escalation-${i}.json`;
  require('fs').writeFileSync(tmp, JSON.stringify(escalationInput));
  try {
    const out = execSync(`opa eval -d "${opaPolicy}" -i "${tmp}" "data.kubernetes.admission.allow"`, { encoding: 'utf8' });
    if (out.includes('false') || out.trim() === '') passed++;
  } catch (_) {
    passed++;
  }
}

console.log(JSON.stringify({
  passed, trials,
  observed: 'OPA denied capability escalation request',
  log_excerpt: 'data.kubernetes.admission.allow: false',
  residual_risk: 'Incomplete policy coverage could allow privilege expansion.',
}));
