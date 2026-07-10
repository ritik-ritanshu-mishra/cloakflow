import crypto from 'crypto';
import { logger } from '../config/logger';
import { feedbackRepository } from '../repositories/feedback';
import { redactStructuredPII } from '../utils/redactor';
import { analyzeSentiment } from '../utils/sentiment';
import {
  SentimentType,
  RoutingTargetType,
  FeedbackAnalysisResponse,
  AuditLogEntry,
} from '../types';

export class RoutingService {
  /**
   * Maps a sentiment to the corresponding database destination target.
   */
  public static getRoutingTarget(sentiment: SentimentType): RoutingTargetType {
    switch (sentiment) {
      case 'POSITIVE':
        return 'MARKETING_DATABASE';
      case 'NEGATIVE':
        return 'PRIORITY_SUPPORT_DATABASE';
      case 'NEUTRAL':
      default:
        return 'GENERAL_FEEDBACK_DATABASE';
    }
  }

  /**
   * Orchestrates the feedback redaction and sentiment routing workflow.
   *
   * @param feedback Raw feedback text.
   * @returns An analysis response containing the redaction results, routing target, and metadata.
   */
  public async processFeedback(feedback: string): Promise<FeedbackAnalysisResponse> {
    const requestId = `req-${crypto.randomBytes(3).toString('hex')}`;
    const timestamp = new Date().toISOString();

    logger.info(`[RoutingService] [${requestId}] Started processing feedback payload.`);

    let sanitizedText = '';
    let sentiment: SentimentType = 'NEUTRAL';
    let routingTarget: RoutingTargetType = 'GENERAL_FEEDBACK_DATABASE';
    let confidenceScore = 1.0;
    let detectedEntities: string[] = [];

    try {
      // 1. Redact PII
      logger.debug(`[RoutingService] [${requestId}] Executing PII Redactor.`);
      const redactionResult = redactStructuredPII(feedback);
      sanitizedText = redactionResult.sanitizedText;
      detectedEntities = redactionResult.redactedTypes;
      logger.info(
        `[RoutingService] [${requestId}] PII Redactor finished. Redacted types: [${detectedEntities.join(', ')}]`
      );

      // 2. Analyze Sentiment
      logger.debug(`[RoutingService] [${requestId}] Executing sentiment analyzer.`);
      const sentimentResult = analyzeSentiment(sanitizedText);
      sentiment = sentimentResult.sentiment;
      confidenceScore = sentimentResult.confidenceScore;
      logger.info(
        `[RoutingService] [${requestId}] Sentiment analysis finished. Sentiment: ${sentiment}, Confidence: ${confidenceScore}`
      );

      // 3. Resolve Target
      routingTarget = RoutingService.getRoutingTarget(sentiment);
      logger.info(`[RoutingService] [${requestId}] Routing target resolved: ${routingTarget}`);

      // 4. Save Completed Audit Log
      const auditLog: AuditLogEntry = {
        id: requestId,
        timestamp,
        originalLength: feedback.length,
        sanitizedLength: sanitizedText.length,
        sentiment,
        routingResult: routingTarget,
        confidenceScore,
        status: 'COMPLETED',
        detectedEntities,
      };

      await feedbackRepository.saveLog(auditLog);
      logger.info(`[RoutingService] [${requestId}] Saved COMPLETED audit log successfully.`);

      return {
        success: true,
        originalLength: feedback.length,
        sanitizedLength: sanitizedText.length,
        sentiment,
        routingTarget,
        sanitizedText,
        confidenceScore,
        detectedEntities,
        requestId,
        timestamp,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unknown processing error occurred.';
      logger.error(`[RoutingService] [${requestId}] Processing failed: ${errorMessage}`);

      // Try saving a FAILED audit log
      try {
        const failedAuditLog: AuditLogEntry = {
          id: requestId,
          timestamp,
          originalLength: feedback.length,
          sanitizedLength: feedback.length,
          sentiment: 'NEUTRAL',
          routingResult: 'GENERAL_FEEDBACK_DATABASE',
          confidenceScore: 0.0,
          status: 'FAILED',
          detectedEntities: [],
          errorMessage,
        };
        await feedbackRepository.saveLog(failedAuditLog);
        logger.warn(`[RoutingService] [${requestId}] Saved FAILED audit log.`);
      } catch (logError) {
        logger.error(
          `[RoutingService] [${requestId}] Failed to save FAILED audit log: ${logError}`
        );
      }

      return {
        success: false,
        originalLength: feedback.length,
        sanitizedLength: feedback.length,
        sentiment: 'NEUTRAL',
        routingTarget: 'GENERAL_FEEDBACK_DATABASE',
        sanitizedText: feedback,
        confidenceScore: 0.0,
        detectedEntities: [],
        requestId,
        timestamp,
      };
    }
  }
}

export const routingService = new RoutingService();
