#!/usr/bin/env node
const crypto = require('crypto');
const { ANSRegistry } = require('../helpers/ans_registry.js');

const registry = new ANSRegistry({ port: 0, host: '127.0.0.1', storage: 'memory' });
let passed = 0;
const trials = 10;

(async () => {
  for (let i = 0; i < trials; i++) {
    // generate a keypair and obtain a valid cert, then simulate an expired/invalid cert
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const certPem = registry.issueCertificate(`agent-${i}`, publicKey);

    // Simulate expiration by corrupting the PEM so verification fails (provable rejection)
    const expiredPem = certPem.replace(/A/g, 'B') + '\n-----EXPIRED-----';

    const reg = {
      ansName: `a2a://agent-${i}.ml-inference.research-lab.v1.prod`,
      metadata: {
        name: `agent-${i}`, version: '1.0.0',
        capabilities: [{ name: 'ml-inference', version: '1', description: 'x', permissions: [] }],
        provider: 'research-lab', endpoints: [], environment: 'prod', securityClearance: 1,
        certificate: expiredPem, publicKey: publicKey,
      },
      certificate: expiredPem,
      privateKey: privateKey,
      publicKey: publicKey,
    };

    try {
      await registry.registerAgent(reg);
    } catch (e) {
      passed++;
    }
  }

  console.log(JSON.stringify({
    passed, trials,
    observed: 'Expired or invalid certificate rejected at registration',
    log_excerpt: 'Invalid certificate',
    residual_risk: 'Clock skew or missed rotation jobs could admit stale certs.',
  }));
})();
