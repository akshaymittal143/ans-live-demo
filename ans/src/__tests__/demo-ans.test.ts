/**
 * Test suite for DemoANSClient
 * Tests the simplified demo-friendly ANS client functionality
 */

import { DemoANSClient } from '../demo-ans';

describe('DemoANSClient', () => {
  let client: DemoANSClient;

  beforeEach(() => {
    client = new DemoANSClient();
  });

  describe('Agent Registration', () => {
    it('should register a new agent successfully', async () => {
      const metadata = {
        name: 'test-agent',
        version: '1.0.0',
        capabilities: ['ml-inference'],
        endpoints: ['http://test:8080'],
        publicKey: 'test-key',
        certificate: 'test-cert',
        policies: ['test-policy']
      };

      const result = await client.registerAgent(metadata);

      expect(result.ansName).toBe('test-agent.ans.local');
      expect(result.metadata.name).toBe('test-agent');
      expect(result.metadata.version).toBe('1.0.0');
    });

    it('should emit agentRegistered event on registration', (done) => {
      const metadata = {
        name: 'event-test-agent',
        version: '1.0.0',
        capabilities: ['test'],
        endpoints: ['http://test:8080'],
        publicKey: 'key',
        certificate: 'cert',
        policies: ['policy']
      };

      client.on('agentRegistered', (event) => {
        expect(event.ansName).toBe('event-test-agent.ans.local');
        expect(event.metadata.name).toBe('event-test-agent');
        done();
      });

      client.registerAgent(metadata);
    });

    it('should handle multiple agent registrations', async () => {
      const agents = [
        { name: 'agent1', version: '1.0.0', capabilities: ['cap1'], endpoints: ['http://a1:8080'], publicKey: 'k1', certificate: 'c1', policies: ['p1'] },
        { name: 'agent2', version: '1.0.0', capabilities: ['cap2'], endpoints: ['http://a2:8080'], publicKey: 'k2', certificate: 'c2', policies: ['p2'] },
        { name: 'agent3', version: '1.0.0', capabilities: ['cap3'], endpoints: ['http://a3:8080'], publicKey: 'k3', certificate: 'c3', policies: ['p3'] },
      ];

      for (const agent of agents) {
        const result = await client.registerAgent(agent);
        expect(result.ansName).toBe(`${agent.name}.ans.local`);
      }
    });
  });

  describe('Agent Resolution', () => {
    beforeEach(async () => {
      // Pre-register some test agents
      await client.registerAgent({
        name: 'resolver-test',
        version: '1.0.0',
        capabilities: ['test'],
        endpoints: ['http://test:8080'],
        publicKey: 'key',
        certificate: 'cert',
        policies: ['policy']
      });
    });

    it('should resolve a registered agent', async () => {
      const agent = await client.resolveAgent('resolver-test.ans.local');

      expect(agent.name).toBe('resolver-test');
      expect(agent.version).toBe('1.0.0');
      expect(agent.capabilities).toContain('test');
    });

    it('should throw error for non-existent agent', async () => {
      await expect(client.resolveAgent('non-existent.ans.local'))
        .rejects
        .toThrow('Agent non-existent.ans.local not found');
    });

    it('should emit agentResolved event on resolution', (done) => {
      client.on('agentResolved', (event) => {
        expect(event.ansName).toBe('resolver-test.ans.local');
        expect(event.metadata.name).toBe('resolver-test');
        done();
      });

      client.resolveAgent('resolver-test.ans.local');
    });

    it('should resolve pre-registered demo agents', async () => {
      // DemoANSClient pre-registers test-agent and another-agent
      const testAgent = await client.resolveAgent('test-agent.ans.local');
      expect(testAgent.name).toBe('test-agent');

      const anotherAgent = await client.resolveAgent('another-agent.ans.local');
      expect(anotherAgent.name).toBe('another-agent');
    });
  });

  describe('Agent Discovery', () => {
    beforeEach(async () => {
      // Register agents with different capabilities
      await client.registerAgent({
        name: 'ml-agent-1',
        version: '1.0.0',
        capabilities: ['ml-inference', 'data-processing'],
        endpoints: ['http://ml1:8080'],
        publicKey: 'key1',
        certificate: 'cert1',
        policies: ['policy1']
      });

      await client.registerAgent({
        name: 'ml-agent-2',
        version: '1.0.0',
        capabilities: ['ml-inference', 'reporting'],
        endpoints: ['http://ml2:8080'],
        publicKey: 'key2',
        certificate: 'cert2',
        policies: ['policy2']
      });

      await client.registerAgent({
        name: 'data-agent',
        version: '1.0.0',
        capabilities: ['data-processing'],
        endpoints: ['http://data:8080'],
        publicKey: 'key3',
        certificate: 'cert3',
        policies: ['policy3']
      });
    });

    it('should discover agents by capability', async () => {
      const mlAgents = await client.discoverAgents('ml-inference');

      expect(mlAgents.length).toBeGreaterThanOrEqual(2);
      expect(mlAgents.every(agent => agent.capabilities.includes('ml-inference'))).toBe(true);
    });

    it('should discover multiple agents with shared capability', async () => {
      const dataAgents = await client.discoverAgents('data-processing');

      expect(dataAgents.length).toBeGreaterThanOrEqual(2);
      expect(dataAgents.every(agent => agent.capabilities.includes('data-processing'))).toBe(true);
    });

    it('should return empty array for non-existent capability', async () => {
      const agents = await client.discoverAgents('non-existent-capability');

      expect(agents).toEqual([]);
    });

    it('should emit agentsDiscovered event on discovery', (done) => {
      client.on('agentsDiscovered', (event) => {
        expect(event.capability).toBe('ml-inference');
        expect(event.agents.length).toBeGreaterThanOrEqual(2);
        done();
      });

      client.discoverAgents('ml-inference');
    });
  });

  describe('Capability Verification', () => {
    beforeEach(async () => {
      await client.registerAgent({
        name: 'verify-agent',
        version: '1.0.0',
        capabilities: ['ml-inference', 'data-processing', 'reporting'],
        endpoints: ['http://verify:8080'],
        publicKey: 'key',
        certificate: 'cert',
        policies: ['policy']
      });
    });

    it('should verify existing capability', async () => {
      const hasCapability = await client.verifyCapability('verify-agent.ans.local', 'ml-inference');

      expect(hasCapability).toBe(true);
    });

    it('should return false for non-existent capability', async () => {
      const hasCapability = await client.verifyCapability('verify-agent.ans.local', 'non-existent');

      expect(hasCapability).toBe(false);
    });

    it('should verify multiple capabilities', async () => {
      const capabilities = ['ml-inference', 'data-processing', 'reporting'];
      
      for (const capability of capabilities) {
        const hasCapability = await client.verifyCapability('verify-agent.ans.local', capability);
        expect(hasCapability).toBe(true);
      }
    });

    it('should throw error when verifying capability for non-existent agent', async () => {
      await expect(client.verifyCapability('non-existent.ans.local', 'test'))
        .rejects
        .toThrow('Agent non-existent.ans.local not found');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete agent lifecycle', async () => {
      // Register
      const registration = await client.registerAgent({
        name: 'lifecycle-agent',
        version: '1.0.0',
        capabilities: ['test'],
        endpoints: ['http://lifecycle:8080'],
        publicKey: 'key',
        certificate: 'cert',
        policies: ['policy']
      });
      expect(registration.ansName).toBe('lifecycle-agent.ans.local');

      // Resolve
      const agent = await client.resolveAgent('lifecycle-agent.ans.local');
      expect(agent.name).toBe('lifecycle-agent');

      // Discover
      const agents = await client.discoverAgents('test');
      expect(agents.some(a => a.name === 'lifecycle-agent')).toBe(true);

      // Verify
      const hasCapability = await client.verifyCapability('lifecycle-agent.ans.local', 'test');
      expect(hasCapability).toBe(true);
    });

    it('should handle concurrent operations', async () => {
      const operations = [
        client.registerAgent({ name: 'concurrent-1', version: '1.0.0', capabilities: ['test'], endpoints: ['http://c1:8080'], publicKey: 'k1', certificate: 'c1', policies: ['p1'] }),
        client.registerAgent({ name: 'concurrent-2', version: '1.0.0', capabilities: ['test'], endpoints: ['http://c2:8080'], publicKey: 'k2', certificate: 'c2', policies: ['p2'] }),
        client.registerAgent({ name: 'concurrent-3', version: '1.0.0', capabilities: ['test'], endpoints: ['http://c3:8080'], publicKey: 'k3', certificate: 'c3', policies: ['p3'] }),
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.ansName.endsWith('.ans.local'))).toBe(true);
    });
  });
});

