import { describe, it, expect } from 'vitest';
import { redactStructuredPII } from '../utils/redactor';
import { analyzeSentiment } from '../utils/sentiment';

describe('Unit Tests: PII Redactor', () => {
  it('should redact Visa credit cards', () => {
    const result = redactStructuredPII('Visa: 4111-2222-3333-4444.');
    expect(result.sanitizedText).toBe('Visa: [REDACTED].');
    expect(result.redactedTypes).toContain('CREDIT_CARD');
  });

  it('should redact MasterCard credit cards', () => {
    const result = redactStructuredPII('MasterCard: 5500 1100 2200 3300.');
    expect(result.sanitizedText).toBe('MasterCard: [REDACTED].');
    expect(result.redactedTypes).toContain('CREDIT_CARD');
  });

  it('should redact Amex credit cards', () => {
    const result = redactStructuredPII('Amex: 3782-822463-10005.');
    expect(result.sanitizedText).toBe('Amex: [REDACTED].');
    expect(result.redactedTypes).toContain('CREDIT_CARD');
  });

  it('should redact Discover credit cards', () => {
    const result = redactStructuredPII('Discover: 6011111111111111.');
    expect(result.sanitizedText).toBe('Discover: [REDACTED].');
    expect(result.redactedTypes).toContain('CREDIT_CARD');
  });

  it('should redact email addresses', () => {
    const result = redactStructuredPII('My email is test@company.com.');
    expect(result.sanitizedText).toBe('My email is [REDACTED].');
    expect(result.redactedTypes).toContain('EMAIL');
  });

  it('should redact Social Security Numbers', () => {
    const result = redactStructuredPII('SSN: 000-12-3456.');
    expect(result.sanitizedText).toBe('SSN: [REDACTED].');
    expect(result.redactedTypes).toContain('SSN');
  });

  it('should redact Medical Record Numbers', () => {
    const result = redactStructuredPII('Record MRN-XY98765432.');
    expect(result.sanitizedText).toBe('Record [REDACTED].');
    expect(result.redactedTypes).toContain('MRN');
  });

  it('should redact Healthcare NPI identifiers', () => {
    const result = redactStructuredPII('Provider NPI 1234567890 approved.');
    expect(result.sanitizedText).toBe('Provider [REDACTED] approved.');
    expect(result.redactedTypes).toContain('NPI');
  });

  it('should redact US and international phone numbers', () => {
    const res1 = redactStructuredPII('Call (555) 019-2834.');
    expect(res1.sanitizedText).toBe('Call [REDACTED].');
    expect(res1.redactedTypes).toContain('PHONE');

    const res2 = redactStructuredPII('Reach us at +44 20 7946 0958.');
    expect(res2.sanitizedText).toBe('Reach us at [REDACTED].');
    expect(res2.redactedTypes).toContain('PHONE');
  });

  it('should redact both email and phone in a single pass', () => {
    const result = redactStructuredPII('Mail developer@work.com or call 555-123-4567.');
    expect(result.sanitizedText).toBe('Mail [REDACTED] or call [REDACTED].');
    expect(result.redactedTypes).toContain('EMAIL');
    expect(result.redactedTypes).toContain('PHONE');
  });
});

describe('Unit Tests: Sentiment Analyzer', () => {
  it('should analyze positive sentiment', () => {
    const result = analyzeSentiment('This service is excellent and amazing!');
    expect(result.sentiment).toBe('POSITIVE');
    expect(result.confidenceScore).toBe(1.0);
  });

  it('should analyze negative sentiment', () => {
    const result = analyzeSentiment('I have a terrible problem and complaint.');
    expect(result.sentiment).toBe('NEGATIVE');
    expect(result.confidenceScore).toBe(1.0);
  });

  it('should analyze neutral sentiment when matches are equal', () => {
    const result = analyzeSentiment('It is good but has a problem.');
    expect(result.sentiment).toBe('NEUTRAL');
    expect(result.confidenceScore).toBe(0.5);
  });

  it('should analyze neutral sentiment when no keywords exist', () => {
    const result = analyzeSentiment('The patient arrived at the clinic.');
    expect(result.sentiment).toBe('NEUTRAL');
    expect(result.confidenceScore).toBe(1.0);
  });
});
