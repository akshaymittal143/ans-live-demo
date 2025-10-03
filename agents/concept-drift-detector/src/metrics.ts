import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

export class MetricsCollector {
  private driftDetectionCounter: Counter;
  private driftDetectionDuration: Histogram;
  private activeDetections: Gauge;
  private driftErrors: Counter;
  private driftScore: Gauge;

  constructor() {
    // Collect default metrics
    collectDefaultMetrics();

    // Custom metrics
    this.driftDetectionCounter = new Counter({
      name: 'ans_drift_detections_total',
      help: 'Total number of drift detection requests',
      labelNames: ['model_id', 'data_source', 'status']
    });

    this.driftDetectionDuration = new Histogram({
      name: 'ans_drift_detection_duration_seconds',
      help: 'Duration of drift detection operations',
      labelNames: ['model_id', 'data_source', 'status'],
      buckets: [1, 5, 10, 30, 60, 120, 300]
    });

    this.activeDetections = new Gauge({
      name: 'ans_active_drift_detections',
      help: 'Number of active drift detection operations'
    });

    this.driftErrors = new Counter({
      name: 'ans_drift_detection_errors_total',
      help: 'Total number of drift detection errors',
      labelNames: ['model_id', 'error_type']
    });

    this.driftScore = new Gauge({
      name: 'ans_drift_score',
      help: 'Current drift score for models',
      labelNames: ['model_id', 'data_source']
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        // Record request metrics
        const route = req.route?.path || req.path;
        const method = req.method;
        const status = res.statusCode;
        
        // You can add more detailed metrics here
      });
      
      next();
    };
  }

  recordDriftDetection(modelId: string, dataSource: string, status: string) {
    this.driftDetectionCounter.inc({ model_id: modelId, data_source: dataSource, status });
  }

  recordDriftDetectionDuration(modelId: string, dataSource: string, status: string, duration: number) {
    this.driftDetectionDuration.observe({ model_id: modelId, data_source: dataSource, status }, duration);
  }

  setActiveDetections(count: number) {
    this.activeDetections.set(count);
  }

  recordDriftError(modelId: string, errorType: string) {
    this.driftErrors.inc({ model_id: modelId, error_type: errorType });
  }

  setDriftScore(modelId: string, dataSource: string, score: number) {
    this.driftScore.set({ model_id: modelId, data_source: dataSource }, score);
  }

  getMetrics(): string {
    return register.metrics();
  }

  getContentType(): string {
    return register.contentType;
  }
}
