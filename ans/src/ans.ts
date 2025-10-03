import { v4 as uuidv4 } from 'uuid';
import * as forge from 'node-forge';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { EventEmitter } from 'events';

export interface AgentCapability {
  name: string;
  version: string;
  description: string;
  permissions: string[];
}

export interface AgentEndpoint {
  protocol: string;
  address: string;
  port?: number;
  path?: string;
}

export interface AgentMetadata {
  name: string;
  version: string;
  capabilities: AgentCapability[];
  provider: string;
  endpoints: AgentEndpoint[];
  environment: string;
  securityClearance: number;
  certificate?: string;
  publicKey?: string;
}

export interface ANSName {
  protocol: string;
  agentId: string;
  capability: string;
  provider: string;
  version: string;
  extension?: string;
}

export interface AgentRegistration {
  ansName: string;
  metadata: AgentMetadata;
  certificate: string;
  privateKey: string;
  publicKey: string;
}

export interface ANSConfig {
  registryUrl: string;
  caCert?: string;
  agentCert?: string;
  agentKey?: string;
  timeout?: number;
}

export class AgentNamingService extends EventEmitter {
  private config: ANSConfig;
  private privateKey: forge.pki.PrivateKey;
  private publicKey: forge.pki.PublicKey;
  private certificate: forge.pki.Certificate;

  constructor(config: ANSConfig) {
    super();
    this.config = {
      timeout: 5000,
      ...config
    };
    this.initializeKeys();
  }

  private initializeKeys(): void {
    if (this.config.agentKey && this.config.agentCert) {
      // Load existing keys
      this.privateKey = forge.pki.privateKeyFromPem(this.config.agentKey);
      this.certificate = forge.pki.certificateFromPem(this.config.agentCert);
      this.publicKey = this.certificate.publicKey;
    } else {
      // Generate new keys
      const keypair = forge.pki.rsa.generateKeyPair(2048);
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
      this.certificate = this.generateSelfSignedCertificate();
    }
  }

  private generateSelfSignedCertificate(): forge.pki.Certificate {
    const cert = forge.pki.createCertificate();
    cert.publicKey = this.publicKey;
    cert.serialNumber = uuidv4();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

    const attrs = [{
      name: 'commonName',
      value: 'ans-agent'
    }];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(this.privateKey);

    return cert;
  }

  /**
   * Parse ANS name into components
   */
  public parseANSName(ansName: string): ANSName {
    const regex = /^([^:]+):\/\/([^.]+)\.([^.]+)\.([^.]+)\.v([^.]+)(?:\.(.+))?$/;
    const match = ansName.match(regex);

    if (!match) {
      throw new Error(`Invalid ANS name format: ${ansName}`);
    }

    return {
      protocol: match[1],
      agentId: match[2],
      capability: match[3],
      provider: match[4],
      version: match[5],
      extension: match[6]
    };
  }

  /**
   * Generate ANS name from components
   */
  public generateANSName(components: ANSName): string {
    const { protocol, agentId, capability, provider, version, extension } = components;
    let ansName = `${protocol}://${agentId}.${capability}.${provider}.v${version}`;
    
    if (extension) {
      ansName += `.${extension}`;
    }

    return ansName;
  }

  /**
   * Register an agent with the ANS registry
   */
  public async registerAgent(agentId: string, metadata: AgentMetadata): Promise<AgentRegistration> {
    const ansName = this.generateANSName({
      protocol: 'a2a',
      agentId,
      capability: metadata.capabilities[0]?.name || 'general',
      provider: metadata.provider,
      version: metadata.version,
      extension: metadata.environment
    });

    const registration: AgentRegistration = {
      ansName,
      metadata,
      certificate: forge.pki.certificateToPem(this.certificate),
      privateKey: forge.pki.privateKeyToPem(this.privateKey),
      publicKey: forge.pki.publicKeyToPem(this.publicKey)
    };

    try {
      const response = await axios.post(
        `${this.config.registryUrl}/api/v1/agents`,
        registration,
        {
          timeout: this.config.timeout,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.generateJWT()}`
          }
        }
      );

      this.emit('agentRegistered', { ansName, metadata });
      return registration;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to register agent: ${error.message}`);
    }
  }

  /**
   * Resolve an agent by ANS name
   */
  public async resolveAgent(ansName: string): Promise<AgentMetadata> {
    try {
      const response = await axios.get(
        `${this.config.registryUrl}/api/v1/agents/${encodeURIComponent(ansName)}`,
        {
          timeout: this.config.timeout,
          headers: {
            'Authorization': `Bearer ${this.generateJWT()}`
          }
        }
      );

      return response.data.metadata;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to resolve agent: ${error.message}`);
    }
  }

  /**
   * Discover agents by capability
   */
  public async discoverAgents(capability: string, provider?: string): Promise<AgentMetadata[]> {
    try {
      const params = new URLSearchParams({ capability });
      if (provider) {
        params.append('provider', provider);
      }

      const response = await axios.get(
        `${this.config.registryUrl}/api/v1/agents?${params}`,
        {
          timeout: this.config.timeout,
          headers: {
            'Authorization': `Bearer ${this.generateJWT()}`
          }
        }
      );

      return response.data.agents;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to discover agents: ${error.message}`);
    }
  }

  /**
   * Verify agent capability using zero-knowledge proof
   */
  public async verifyCapability(ansName: string, capability: string): Promise<boolean> {
    try {
      const agent = await this.resolveAgent(ansName);
      const hasCapability = agent.capabilities.some(cap => cap.name === capability);
      
      if (!hasCapability) {
        return false;
      }

      // Generate zero-knowledge proof
      const proof = this.generateCapabilityProof(capability);
      
      const response = await axios.post(
        `${this.config.registryUrl}/api/v1/verify`,
        {
          ansName,
          capability,
          proof
        },
        {
          timeout: this.config.timeout,
          headers: {
            'Authorization': `Bearer ${this.generateJWT()}`
          }
        }
      );

      return response.data.verified;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Generate JWT token for authentication
   */
  private generateJWT(): string {
    const payload = {
      iss: 'ans-client',
      sub: forge.pki.certificateToPem(this.certificate),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
  }

  /**
   * Generate zero-knowledge proof for capability
   */
  private generateCapabilityProof(capability: string): string {
    // Simplified zero-knowledge proof implementation
    // In production, use proper ZK proof libraries like circom or snarkjs
    const proofData = {
      capability,
      timestamp: Date.now(),
      nonce: uuidv4(),
      signature: this.signData(capability)
    };

    return Buffer.from(JSON.stringify(proofData)).toString('base64');
  }

  /**
   * Sign data with private key
   */
  private signData(data: string): string {
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signature = this.privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  /**
   * Verify signature with public key
   */
  public verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');
      const pubKey = forge.pki.publicKeyFromPem(publicKey);
      return pubKey.verify(md.digest().bytes(), forge.util.decode64(signature));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get agent certificate
   */
  public getCertificate(): string {
    return forge.pki.certificateToPem(this.certificate);
  }

  /**
   * Get agent public key
   */
  public getPublicKey(): string {
    return forge.pki.publicKeyToPem(this.publicKey);
  }
}

export default AgentNamingService;
