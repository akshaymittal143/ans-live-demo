#!/usr/bin/env node
const crypto = require('crypto');
const { ANSRegistry } = require('../helpers/ans_registry.js');

const registry = new ANSRegistry({ port: 0, host: '127.0.0.1', storage: 'memory' });
let passed = 0;
const trials = 10;

(async () => {
  for (let i = 0; i < trials; i++) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const certPem = registry.issueCertificate(`agent-${i}`, publicKey);
    const reg = {
      ansName: `not-a-valid-ans-name-${i}`,
      metadata: {
        name: `agent-${i}`, version: '1.0.0',
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
    } catch (e) {
      if (String(e.message).includes('Invalid ANS name')) passed++;
    }
  }

  console.log(JSON.stringify({
    passed, trials,
    observed: 'Malformed ANS name rejected at validation',
    log_excerpt: 'Invalid ANS name format',
    residual_risk: 'Insider with valid naming could still poison metadata.',
  }));
})();
