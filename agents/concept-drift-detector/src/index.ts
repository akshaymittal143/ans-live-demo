import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import { AgentNamingService, AgentMetadata, AgentCapability } from 'agent-name-service';
import { ConceptDriftDetector } from './drift-detector';
import { MetricsCollector } from './metrics';
import { Logger } from './logger';

class ConceptDriftAgent {
  private app: express.Application;
  private ans: AgentNamingService;
  private detector: ConceptDriftDetector;
  private metrics: MetricsCollector;
  private logger: Logger;
  private isRegistered: boolean = false;

  constructor() {
    this.app = express();
    this.logger = new Logger('concept-drift-detector');
    this.metrics = new MetricsCollector();
    this.detector = new ConceptDriftDetector(this.logger);
    
    this.ans = new AgentNamingService({
      registryUrl: process.env.ANS_REGISTRY_URL || 'http://ans-registry.ans-system.svc.cluster.local',
      caCert: process.env.ANS_CA_CERT_PATH,
      agentCert: process.env.ANS_AGENT_CERT_PATH,
      agentKey: process.env.ANS_AGENT_KEY_PATH
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.metrics.middleware());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        registered: this.isRegistered,
        version: '2.1.0'
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(this.metrics.getMetrics());
    });

    // Trigger drift detection
    this.app.post('/api/v1/detect', async (req, res) => {
      try {
        const { modelId, dataSource } = req.body;
        const result = await this.detector.detectDrift(modelId, dataSource);
        
        this.metrics.incrementDriftChecks();
        if (result.driftDetected) {
          this.metrics.incrementDriftDetections();
          await this.notifyDriftDetected(result);
        }

        res.json(result);
      } catch (error) {
        this.logger.error('Drift detection failed', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get drift history
    this.app.get('/api/v1/drift-history/:modelId', async (req, res) => {
      try {
        const { modelId } = req.params;
        const history = await this.detector.getDriftHistory(modelId);
        res.json(history);
      } catch (error) {
        this.logger.error('Failed to get drift history', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  private setupEventHandlers(): void {
    this.ans.on('agentRegistered', (data) => {
      this.logger.info('Agent registered with ANS', data);
      this.isRegistered = true;
    });

    this.ans.on('error', (error) => {
      this.logger.error('ANS error', error);
    });
  }

  private async registerWithANS(): Promise<void> {
    try {
      const capabilities: AgentCapability[] = [
        {
          name: 'concept-drift-detection',
          version: '2.1.0',
          description: 'Detects concept drift in machine learning models',
          permissions: ['read:model-metrics', 'read:data-samples', 'write:drift-alerts']
        },
        {
          name: 'statistical-analysis',
          version: '1.0.0',
          description: 'Performs statistical analysis on model performance',
          permissions: ['read:model-metrics', 'read:data-samples']
        }
      ];

      const metadata: AgentMetadata = {
        name: 'concept-drift-detector',
        version: '2.1.0',
        capabilities,
        provider: 'research-lab',
        endpoints: [{
          protocol: 'https',
          address: process.env.AGENT_ENDPOINT || 'https://concept-drift-detector.default.svc.cluster.local',
          port: 8080,
          path: '/api/v1'
        }],
        environment: 'prod',
        securityClearance: 3
      };

      await this.ans.registerAgent('concept-drift-detector', metadata);
      this.logger.info('Successfully registered with ANS');
    } catch (error) {
      this.logger.error('Failed to register with ANS', error);
      throw error;
    }
  }

  private async notifyDriftDetected(driftResult: any): Promise<void> {
    try {
      // Find notification agent
      const notificationAgents = await this.ans.discoverAgents('notification');
      
      if (notificationAgents.length === 0) {
        this.logger.warn('No notification agents found');
        return;
      }

      // Verify capability
      const notificationAgent = notificationAgents[0];
      const verified = await this.ans.verifyCapability(
        notificationAgent.name,
        'notification'
      );

      if (!verified) {
        this.logger.warn('Notification agent capability not verified');
        return;
      }

      // Send notification
      const notificationPayload = {
        type: 'concept-drift-detected',
        modelId: driftResult.modelId,
        severity: driftResult.severity,
        confidence: driftResult.confidence,
        timestamp: new Date().toISOString(),
        details: driftResult
      };

      // This would be implemented with actual HTTP call to notification agent
      this.logger.info('Drift notification sent', notificationPayload);
    } catch (error) {
      this.logger.error('Failed to send drift notification', error);
    }
  }

  private setupCronJobs(): void {
    // Run drift detection every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        this.logger.info('Running scheduled drift detection');
        
        // Get list of models to monitor
        const models = await this.getModelsToMonitor();
        
        for (const model of models) {
          const result = await this.detector.detectDrift(model.id, model.dataSource);
          
          this.metrics.incrementDriftChecks();
          if (result.driftDetected) {
            this.metrics.incrementDriftDetections();
            await this.notifyDriftDetected(result);
          }
        }
      } catch (error) {
        this.logger.error('Scheduled drift detection failed', error);
      }
    });
  }

  private async getModelsToMonitor(): Promise<any[]> {
    // This would typically query a model registry
    // For demo purposes, return mock data
    return [
      { id: 'model-1', dataSource: 'data-source-1' },
      { id: 'model-2', dataSource: 'data-source-2' }
    ];
  }

  public async start(): Promise<void> {
    try {
      // Register with ANS
      await this.registerWithANS();

      // Setup cron jobs
      this.setupCronJobs();

      // Start server
      const port = process.env.PORT || 8080;
      this.app.listen(port, () => {
        this.logger.info(`Concept drift detector agent started on port ${port}`);
      });
    } catch (error) {
      this.logger.error('Failed to start agent', error);
      process.exit(1);
    }
  }
}

// Start the agent
const agent = new ConceptDriftAgent();
agent.start().catch((error) => {
  console.error('Failed to start concept drift detector agent:', error);
  process.exit(1);
});
