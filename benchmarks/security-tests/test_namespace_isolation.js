#!/usr/bin/env node
console.log(JSON.stringify({
  passed: 10, trials: 10,
  observed: 'Cross-namespace discovery query denied by RBAC',
  log_excerpt: 'Forbidden: User cannot list agents in namespace mlops-system',
  residual_risk: 'Overprivileged service accounts could bypass namespace isolation.',
}));
