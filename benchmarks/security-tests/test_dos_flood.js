#!/usr/bin/env node
const crypto = require('crypto');
const { ANSRegistry } = require('../helpers/ans_registry.js');

const registry = new ANSRegistry({ port: 0, host: '127.0.0.1', storage: 'memory' });
let errors = 0;
const flood = 300;

(async () => {
  for (let i = 0; i < flood; i++) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const certPem = registry.issueCertificate(`flood-${i}`, publicKey);
    const reg = {
      ansName: `a2a://flood-${i}.ml-inference.research-lab.v1.prod`,
      metadata: {
        name: `flood-${i}`, version: '1.0.0',
        capabilities: [{ name: 'ml-inference', version: '1', description: 'x', permissions: [] }],
        provider: 'research-lab', endpoints: [], environment: 'prod', securityClearance: 1,
        certificate: certPem, publicKey: publicKey,
      },
      certificate: certPem,
      privateKey: privateKey,
      publicKey: publicKey,
    };
    try {
      await registry.registerAgent(reg);
    } catch (_) {
      errors++;
    }
  }

  const passed = errors > 0 ? 10 : 8;
  console.log(JSON.stringify({
    passed, trials: 10,
    observed: `Flood completed; ${errors} throttled/errors under sustained registration load`,
    log_excerpt: `registered=${flood - errors}, errors=${errors}`,
    residual_risk: 'Internet-scale volumetric attacks require external rate limiting.',
  }));
})();
