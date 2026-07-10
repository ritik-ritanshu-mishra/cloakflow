import { SentimentType } from '../types';

/**
 * Analyzes the sentiment of a text based on a local keyword scoring system.
 *
 * @param text The input string to classify.
 * @returns An object detailing the classified sentiment and the confidence score.
 */
export function analyzeSentiment(text: string): { sentiment: SentimentType; confidenceScore: number } {
  const positiveKeywords = /\b(good|excellent|amazing|great|happy|love|awesome)\b/gi;
  const negativeKeywords = /\b(bad|poor|terrible|issue|problem|complaint|angry|disappointed)\b/gi;

  const positiveMatches = text.match(positiveKeywords) || [];
  const negativeMatches = text.match(negativeKeywords) || [];

  const posCount = positiveMatches.length;
  const negCount = negativeMatches.length;
  const totalMatches = posCount + negCount;

  // 1. No keyword matches
  if (totalMatches === 0) {
    return {
      sentiment: 'NEUTRAL',
      confidenceScore: 1.0,
    };
  }

  // 2. Equal positive and negative matches
  if (posCount === negCount) {
    return {
      sentiment: 'NEUTRAL',
      confidenceScore: 0.5,
    };
  }

  // 3. Score-based winner classification
  if (posCount > negCount) {
    const confidenceScore = Number((posCount / totalMatches).toFixed(2));
    return {
      sentiment: 'POSITIVE',
      confidenceScore,
    };
  } else {
    const confidenceScore = Number((negCount / totalMatches).toFixed(2));
    return {
      sentiment: 'NEGATIVE',
      confidenceScore,
    };
  }
}
