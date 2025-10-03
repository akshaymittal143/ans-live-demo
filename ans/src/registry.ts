import { EventEmitter } from 'events';
import * as forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import { AgentMetadata, AgentRegistration, ANSName } from './ans';

export interface RegistryConfig {
  port: number;
  host: string;
  storage: 'memory' | 'etcd' | 'redis';
  storageConfig?: any;
  caCert?: string;
  caKey?: string;
}

export class ANSRegistry extends EventEmitter {
  private agents: Map<string, AgentRegistration> = new Map();
  private config: RegistryConfig;
  private caCertificate!: forge.pki.Certificate;
  private caPrivateKey!: forge.pki.PrivateKey;

  constructor(config: RegistryConfig) {
    super();
    this.config = config;
    this.initializeCA();
  }

  private initializeCA(): void {
    if (this.config.caCert && this.config.caKey) {
      this.caCertificate = forge.pki.certificateFromPem(this.config.caCert);
      this.caPrivateKey = forge.pki.privateKeyFromPem(this.config.caKey);
    } else {
      const keypair = forge.pki.rsa.generateKeyPair(2048);
      this.caPrivateKey = keypair.privateKey;
      this.caCertificate = this.generateCACertificate(keypair.publicKey);
    }
  }

  private generateCACertificate(publicKey: forge.pki.PublicKey): forge.pki.Certificate {
    const cert = forge.pki.createCertificate();
    cert.publicKey = publicKey;
    cert.serialNumber = uuidv4();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 10);

    const attrs = [{
      name: 'commonName',
      value: 'ANS Root CA'
    }];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(this.caPrivateKey as forge.pki.rsa.PrivateKey);

    return cert;
  }

  /**
   * Register an agent
   */
  public async registerAgent(registration: AgentRegistration): Promise<void> {
    // Validate ANS name format
    this.validateANSName(registration.ansName);

    // Verify certificate chain
    if (!this.verifyCertificate(registration.certificate)) {
      throw new Error('Invalid certificate');
    }

    // Store agent registration
    this.agents.set(registration.ansName, registration);
    
    this.emit('agentRegistered', {
      ansName: registration.ansName,
      metadata: registration.metadata
    });
  }

  /**
   * Resolve an agent by ANS name
   */
  public async resolveAgent(ansName: string): Promise<AgentMetadata | null> {
    const registration = this.agents.get(ansName);
    return registration ? registration.metadata : null;
  }

  /**
   * Discover agents by capability
   */
  public async discoverAgents(capability: string, provider?: string): Promise<AgentMetadata[]> {
    const results: AgentMetadata[] = [];

    for (const [ansName, registration] of this.agents) {
      const metadata = registration.metadata;
      
      // Check capability match
      const hasCapability = metadata.capabilities.some(cap => cap.name === capability);
      if (!hasCapability) continue;

      // Check provider match if specified
      if (provider && metadata.provider !== provider) continue;

      results.push(metadata);
    }

    return results;
  }

  /**
   * Verify agent capability
   */
  public async verifyCapability(ansName: string, capability: string, proof: string): Promise<boolean> {
    const registration = this.agents.get(ansName);
    if (!registration) return false;

    const metadata = registration.metadata;
    const hasCapability = metadata.capabilities.some(cap => cap.name === capability);
    if (!hasCapability) return false;

    // Verify zero-knowledge proof
    return this.verifyCapabilityProof(capability, proof, registration.publicKey);
  }

  /**
   * List all registered agents
   */
  public async listAgents(): Promise<AgentMetadata[]> {
    return Array.from(this.agents.values()).map(reg => reg.metadata);
  }

  /**
   * Remove an agent
   */
  public async removeAgent(ansName: string): Promise<boolean> {
    const existed = this.agents.has(ansName);
    this.agents.delete(ansName);
    
    if (existed) {
      this.emit('agentRemoved', { ansName });
    }
    
    return existed;
  }

  /**
   * Validate ANS name format
   */
  private validateANSName(ansName: string): void {
    const regex = /^([^:]+):\/\/([^.]+)\.([^.]+)\.([^.]+)\.v([^.]+)(?:\.(.+))?$/;
    if (!regex.test(ansName)) {
      throw new Error(`Invalid ANS name format: ${ansName}`);
    }
  }

  /**
   * Verify certificate chain
   */
  private verifyCertificate(certPem: string): boolean {
    try {
      const cert = forge.pki.certificateFromPem(certPem);
      return this.caCertificate.verify(cert);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify capability proof
   */
  private verifyCapabilityProof(capability: string, proof: string, publicKey: string): boolean {
    try {
      const proofData = JSON.parse(Buffer.from(proof, 'base64').toString());
      const pubKey = forge.pki.publicKeyFromPem(publicKey);
      
      const md = forge.md.sha256.create();
      md.update(capability, 'utf8');
      
      return pubKey.verify(md.digest().bytes(), forge.util.decode64(proofData.signature));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get CA certificate
   */
  public getCACertificate(): string {
    return forge.pki.certificateToPem(this.caCertificate);
  }

  /**
   * Issue certificate for agent
   */
  public issueCertificate(agentName: string, publicKey: string): string {
    const cert = forge.pki.createCertificate();
    cert.publicKey = forge.pki.publicKeyFromPem(publicKey);
    cert.serialNumber = uuidv4();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

    const attrs = [{
      name: 'commonName',
      value: agentName
    }];

    cert.setSubject(attrs);
    cert.setIssuer([{
      name: 'commonName',
      value: 'ANS Root CA'
    }]);
    cert.sign(this.caPrivateKey as forge.pki.rsa.PrivateKey);

    return forge.pki.certificateToPem(cert);
  }
}

export default ANSRegistry;
