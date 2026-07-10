export type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export type RoutingTargetType =
  | 'MARKETING_DATABASE'
  | 'PRIORITY_SUPPORT_DATABASE'
  | 'GENERAL_FEEDBACK_DATABASE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  originalLength: number;
  sanitizedLength: number;
  sentiment: SentimentType;
  routingResult: RoutingTargetType;
  confidenceScore: number;
  status: 'COMPLETED' | 'FAILED';
  detectedEntities: string[];
  errorMessage?: string;
}

export interface FeedbackAnalysisResponse {
  success: boolean;
  originalLength: number;
  sanitizedLength: number;
  sentiment: SentimentType;
  routingTarget: RoutingTargetType;
  sanitizedText: string;
  confidenceScore: number;
  detectedEntities: string[];
  requestId: string;
  timestamp: string;
}
