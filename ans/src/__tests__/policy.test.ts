/**
 * Test suite for PolicyEngine
 * Tests policy enforcement functionality
 */

import { PolicyEngine } from '../policy';

describe('PolicyEngine', () => {
  let policyEngine: PolicyEngine;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
  });

  describe('Policy Evaluation', () => {
    it('should evaluate policy for agent', () => {
      const agentMetadata = {
        name: 'test-agent',
        version: '1.0.0',
        capabilities: ['ml-inference']
      };

      const result = policyEngine.evaluatePolicy(agentMetadata, 'test-policy');

      expect(result).toBe(true);
    });

    it('should handle different agent metadata', () => {
      const agents = [
        { name: 'agent-1', version: '1.0.0', capabilities: ['cap1'] },
        { name: 'agent-2', version: '2.0.0', capabilities: ['cap2'] },
        { name: 'agent-3', version: '3.0.0', capabilities: ['cap3'] },
      ];

      agents.forEach(agent => {
        const result = policyEngine.evaluatePolicy(agent, 'test-policy');
        expect(result).toBe(true);
      });
    });

    it('should handle different policy names', () => {
      const agentMetadata = {
        name: 'test-agent',
        version: '1.0.0',
        capabilities: ['ml-inference']
      };

      const policies = ['policy-1', 'policy-2', 'policy-3'];

      policies.forEach(policy => {
        const result = policyEngine.evaluatePolicy(agentMetadata, policy);
        expect(result).toBe(true);
      });
    });

    it('should always allow in demo mode', () => {
      const agentMetadata = {
        name: 'any-agent',
        version: 'any-version',
        capabilities: []
      };

      const result = policyEngine.evaluatePolicy(agentMetadata, 'any-policy');

      expect(result).toBe(true);
    });
  });
});

