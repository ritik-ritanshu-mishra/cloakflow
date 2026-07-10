import { AuditLogEntry } from '../types';

export class FeedbackRepository {
  private logs: AuditLogEntry[] = [];

  constructor() {
    this.seedLogs();
  }

  /**
   * Seeds the in-memory store with realistic historical audit logs.
   */
  private seedLogs(): void {
    const now = Date.now();
    this.logs = [
      {
        id: 'seed-log-1',
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        originalLength: 104,
        sanitizedLength: 82,
        sentiment: 'NEGATIVE',
        routingResult: 'PRIORITY_SUPPORT_DATABASE',
        confidenceScore: 1.0,
        status: 'COMPLETED',
        detectedEntities: ['PHONE', 'EMAIL'],
      },
      {
        id: 'seed-log-2',
        timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        originalLength: 72,
        sanitizedLength: 72,
        sentiment: 'POSITIVE',
        routingResult: 'MARKETING_DATABASE',
        confidenceScore: 0.88,
        status: 'COMPLETED',
        detectedEntities: [],
      },
      {
        id: 'seed-log-3',
        timestamp: new Date(now - 15 * 60 * 1000).toISOString(), // 15 mins ago
        originalLength: 145,
        sanitizedLength: 125,
        sentiment: 'NEUTRAL',
        routingResult: 'GENERAL_FEEDBACK_DATABASE',
        confidenceScore: 1.0,
        status: 'COMPLETED',
        detectedEntities: ['CREDIT_CARD'],
      },
    ];
  }

  /**
   * Saves an audit log entry.
   */
  public async saveLog(log: AuditLogEntry): Promise<AuditLogEntry> {
    this.logs.push(log);
    return log;
  }

  /**
   * Retrieves all audit log entries, sorted by timestamp descending.
   */
  public async getAllLogs(): Promise<AuditLogEntry[]> {
    return [...this.logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Computes statistics aggregated over all logs.
   */
  public async getStats() {
    const totalRequests = this.logs.length;
    // Sanitation happens when status is COMPLETED and at least one PII entity is redacted
    const totalSanitized = this.logs.filter(
      (l) => l.status === 'COMPLETED' && l.detectedEntities.length > 0
    ).length;

    const positiveFeedback = this.logs.filter((l) => l.sentiment === 'POSITIVE').length;
    const negativeFeedback = this.logs.filter((l) => l.sentiment === 'NEGATIVE').length;
    const neutralFeedback = this.logs.filter((l) => l.sentiment === 'NEUTRAL').length;

    let averageConfidenceScore = 0;
    if (totalRequests > 0) {
      const sum = this.logs.reduce((acc, curr) => acc + curr.confidenceScore, 0);
      averageConfidenceScore = Number((sum / totalRequests).toFixed(2));
    }

    return {
      totalRequests,
      totalSanitized,
      positiveFeedback,
      negativeFeedback,
      neutralFeedback,
      averageConfidenceScore,
    };
  }

  /**
   * Clears the in-memory log list. Useful for resetting test environments.
   */
  public clear(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const feedbackRepository = new FeedbackRepository();
