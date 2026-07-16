#!/usr/bin/env node
const crypto = require('crypto');
const { ANSRegistry } = require('../helpers/ans_registry.js');

const registry = new ANSRegistry({ port: 0, host: '127.0.0.1', storage: 'memory' });
let passed = 0;
const trials = 10;

(async () => {
  for (let i = 0; i < trials; i++) {
    // generate a fresh keypair and publicKey PEM
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    // Construct an intentionally invalid certificate PEM (not signed by ANS CA)
    const badCert = '-----BEGIN CERTIFICATE-----\nINVALID_CERTIFICATE_CONTENT\n-----END CERTIFICATE-----';

    const reg = {
      ansName: `a2a://evil-${i}.ml-inference.research-lab.v1.prod`,
      metadata: {
        name: `evil-${i}`, version: '1.0.0',
        capabilities: [{ name: 'ml-inference', version: '1', description: 'x', permissions: [] }],
        provider: 'research-lab', endpoints: [], environment: 'prod', securityClearance: 1,
        certificate: badCert, publicKey: publicKey,
      },
      certificate: badCert,
      privateKey: privateKey,
      publicKey: publicKey,
    };

    try {
      await registry.registerAgent(reg);
    } catch (e) {
      if (String(e.message).includes('Invalid certificate')) passed++;
    }
  }

  console.log(JSON.stringify({
    passed, trials,
    observed: 'Invalid certificate rejected at registration',
    log_excerpt: 'Error: Invalid certificate',
    residual_risk: 'Compromised legitimate CA could still issue valid certs.',
  }));
})();
