import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ANSRegistry, RegistryConfig } from './registry';
import { AgentRegistration, AgentMetadata } from './ans';
import * as jwt from 'jsonwebtoken';
import * as forge from 'node-forge';

export class ANSServer {
  private app: express.Application;
  private registry: ANSRegistry;
  private config: RegistryConfig;

  constructor(config: RegistryConfig) {
    this.config = config;
    this.registry = new ANSRegistry(config);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.authenticateRequest.bind(this));
  }

  private async authenticateRequest(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, this.registry.getCACertificate(), { algorithms: ['RS256'] }) as any;
      
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Register agent
    this.app.post('/api/v1/agents', async (req, res) => {
      try {
        const registration: AgentRegistration = req.body;
        await this.registry.registerAgent(registration);
        res.status(201).json({ 
          message: 'Agent registered successfully',
          ansName: registration.ansName 
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Resolve agent
    this.app.get('/api/v1/agents/:ansName', async (req, res) => {
      try {
        const ansName = decodeURIComponent(req.params.ansName);
        const metadata = await this.registry.resolveAgent(ansName);
        
        if (!metadata) {
          res.status(404).json({ error: 'Agent not found' });
          return;
        }

        res.json({ metadata });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Discover agents
    this.app.get('/api/v1/agents', async (req, res) => {
      try {
        const { capability, provider } = req.query;
        
        if (!capability) {
          const agents = await this.registry.listAgents();
          res.json({ agents });
          return;
        }

        const agents = await this.registry.discoverAgents(
          capability as string,
          provider as string
        );
        
        res.json({ agents });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Verify capability
    this.app.post('/api/v1/verify', async (req, res) => {
      try {
        const { ansName, capability, proof } = req.body;
        const verified = await this.registry.verifyCapability(ansName, capability, proof);
        res.json({ verified });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Remove agent
    this.app.delete('/api/v1/agents/:ansName', async (req, res) => {
      try {
        const ansName = decodeURIComponent(req.params.ansName);
        const removed = await this.registry.removeAgent(ansName);
        
        if (!removed) {
          res.status(404).json({ error: 'Agent not found' });
          return;
        }

        res.json({ message: 'Agent removed successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get CA certificate
    this.app.get('/api/v1/ca', (req, res) => {
      const caCert = this.registry.getCACertificate();
      res.json({ certificate: caCert });
    });

    // Issue certificate
    this.app.post('/api/v1/certificates', async (req, res) => {
      try {
        const { agentName, publicKey } = req.body;
        const certificate = this.registry.issueCertificate(agentName, publicKey);
        res.json({ certificate });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  public start(): void {
    this.app.listen(this.config.port, this.config.host, () => {
      console.log(`ANS Registry server running on ${this.config.host}:${this.config.port}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default ANSServer;
