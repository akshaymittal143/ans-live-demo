/**
 * Test suite for CertificateManager
 * Tests certificate management functionality
 */

import { CertificateManager } from '../certificates';

describe('CertificateManager', () => {
  let certManager: CertificateManager;

  beforeEach(() => {
    certManager = new CertificateManager();
  });

  describe('Key Pair Generation', () => {
    it('should generate RSA key pair', () => {
      const keyPair = certManager.generateKeyPair();

      expect(keyPair).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = certManager.generateKeyPair();
      const keyPair2 = certManager.generateKeyPair();

      // Private keys should be different
      expect(keyPair1.privateKey).not.toEqual(keyPair2.privateKey);
    });
  });

  describe('Certificate Creation', () => {
    it('should create certificate with correct subject', () => {
      const keyPair = certManager.generateKeyPair();
      const cert = certManager.createCertificate(keyPair, 'test-agent');

      expect(cert).toBeDefined();
      expect(cert.subject.getField('CN')).toBeDefined();
      expect(cert.subject.getField('CN').value).toBe('test-agent');
    });

    it('should create certificate with correct issuer', () => {
      const keyPair = certManager.generateKeyPair();
      const cert = certManager.createCertificate(keyPair, 'test-agent');

      expect(cert.issuer.getField('CN')).toBeDefined();
      expect(cert.issuer.getField('CN').value).toBe('test-agent');
    });

    it('should create certificate with valid date range', () => {
      const keyPair = certManager.generateKeyPair();
      const cert = certManager.createCertificate(keyPair, 'test-agent');

      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(now.getFullYear() + 1);

      expect(cert.validity.notBefore.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(cert.validity.notAfter.getTime()).toBeGreaterThan(now.getTime());
      expect(cert.validity.notAfter.getTime()).toBeLessThanOrEqual(oneYearLater.getTime() + 1000);
    });

    it('should create certificates for different agents', () => {
      const keyPair1 = certManager.generateKeyPair();
      const keyPair2 = certManager.generateKeyPair();

      const cert1 = certManager.createCertificate(keyPair1, 'agent-1');
      const cert2 = certManager.createCertificate(keyPair2, 'agent-2');

      expect(cert1.subject.getField('CN').value).toBe('agent-1');
      expect(cert2.subject.getField('CN').value).toBe('agent-2');
    });
  });

  describe('CA Certificate', () => {
    it('should return CA certificate', () => {
      const caCert = certManager.getCACertificate();

      expect(caCert).toBeDefined();
      expect(typeof caCert).toBe('string');
    });

    it('should return demo CA certificate for demo mode', () => {
      const caCert = certManager.getCACertificate();

      expect(caCert).toBe('DEMO_CA_CERTIFICATE');
    });
  });
});

