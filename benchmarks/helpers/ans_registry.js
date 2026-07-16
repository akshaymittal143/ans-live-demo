const { EventEmitter } = require('events');
const crypto = require('crypto');

function pemToDer(pem) {
  return Buffer.from(pem.replace(/-----(BEGIN|END) [A-Z ]+-----/g, '').replace(/\s+/g, ''), 'base64');
}

class ANSRegistry extends EventEmitter {
  constructor(config) {
    super();
    this.agents = new Map();
    this.config = config;
    this.initializeCA();
  }

  initializeCA() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    this.caPrivateKey = privateKey;
    this.caPublicKey = publicKey;
    this.caCertificate = this.generateCACertificate();
  }

  generateCACertificate() {
    const payload = {
      commonName: 'ANS Root CA',
      publicKey: this.caPublicKey,
      notBefore: new Date().toISOString(),
      notAfter: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
      serialNumber: crypto.randomUUID(),
    };
    const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(payload), 'utf8'), this.caPrivateKey).toString('base64');
    return { ...payload, signature };
  }

  async registerAgent(registration) {
    this.validateANSName(registration.ansName);
    if (!this.verifyCertificate(registration.certificate)) {
      throw new Error('Invalid certificate');
    }
    this.agents.set(registration.ansName, registration);
    this.emit('agentRegistered', {
      ansName: registration.ansName,
      metadata: registration.metadata,
    });
  }

  async resolveAgent(ansName) {
    const registration = this.agents.get(ansName);
    return registration ? registration.metadata : null;
  }

  async discoverAgents(capability, provider) {
    const results = [];
    for (const registration of this.agents.values()) {
      const metadata = registration.metadata;
      const hasCapability = metadata.capabilities.some((cap) => cap.name === capability);
      if (!hasCapability) continue;
      if (provider && metadata.provider !== provider) continue;
      results.push(metadata);
    }
    return results;
  }

  async verifyCapability(ansName, capability, proof) {
    const registration = this.agents.get(ansName);
    if (!registration) return false;
    const metadata = registration.metadata;
    const hasCapability = metadata.capabilities.some((cap) => cap.name === capability);
    if (!hasCapability) return false;
    return this.verifyCapabilityProof(capability, proof, registration.publicKey);
  }

  async listAgents() {
    return Array.from(this.agents.values()).map((reg) => reg.metadata);
  }

  async removeAgent(ansName) {
    const existed = this.agents.has(ansName);
    this.agents.delete(ansName);
    if (existed) {
      this.emit('agentRemoved', { ansName });
    }
    return existed;
  }

  validateANSName(ansName) {
    const regex = /^([^:]+):\/\/([^.]+)\.([^.]+)\.([^.]+)\.v([^.]+)(?:\.(.+))?$/;
    if (!regex.test(ansName)) {
      throw new Error(`Invalid ANS name format: ${ansName}`);
    }
  }

  verifyCertificate(certPem) {
    try {
      const cert = JSON.parse(certPem);
      let payload;
      if (cert.subject && cert.issuer) {
        payload = {
          subject: cert.subject,
          issuer: cert.issuer,
          publicKey: cert.publicKey,
          notBefore: cert.notBefore,
          notAfter: cert.notAfter,
          serialNumber: cert.serialNumber,
        };
      } else if (cert.commonName) {
        payload = {
          commonName: cert.commonName,
          publicKey: cert.publicKey,
          notBefore: cert.notBefore,
          notAfter: cert.notAfter,
          serialNumber: cert.serialNumber,
        };
      } else {
        return false;
      }
      if (!cert.publicKey || !cert.signature) return false;
      const verify = crypto.createVerify('sha256');
      verify.update(JSON.stringify(payload));
      verify.end();
      const valid = verify.verify(this.caPublicKey, Buffer.from(cert.signature, 'base64'));
      if (!valid) return false;
      const now = new Date();
      return now >= new Date(cert.notBefore) && now <= new Date(cert.notAfter);
    } catch (error) {
      return false;
    }
  }

  verifyCapabilityProof(capability, proof, publicKey) {
    try {
      const proofData = JSON.parse(Buffer.from(proof, 'base64').toString('utf8'));
      if (!proofData.signature) return false;
      const verify = crypto.createVerify('sha256');
      verify.update(capability);
      verify.end();
      return verify.verify(publicKey, Buffer.from(proofData.signature, 'base64'));
    } catch (error) {
      return false;
    }
  }

  getCACertificate() {
    return JSON.stringify(this.caCertificate);
  }

  issueCertificate(agentName, publicKey) {
    const payload = {
      subject: { commonName: agentName },
      issuer: { commonName: 'ANS Root CA' },
      publicKey,
      notBefore: new Date().toISOString(),
      notAfter: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      serialNumber: crypto.randomUUID(),
    };
    const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(payload), 'utf8'), this.caPrivateKey).toString('base64');
    return JSON.stringify({ ...payload, signature });
  }
}

module.exports = { ANSRegistry };
