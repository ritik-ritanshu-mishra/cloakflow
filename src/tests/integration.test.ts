import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../express-app';
import { feedbackRepository } from '../repositories/feedback';
import { logger } from '../config/logger';

// Mock logger to prevent logs during test runs
vi.spyOn(logger, 'info').mockImplementation(() => logger);
vi.spyOn(logger, 'warn').mockImplementation(() => logger);
vi.spyOn(logger, 'error').mockImplementation(() => logger);

describe('Integration Tests: Express API', () => {
  beforeEach(() => {
    feedbackRepository.clear();
  });

  it('POST /api/v1/analyze with a credit card number in feedback', async () => {
    const res = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'Credit card: 4111-2222-3333-4444.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sanitizedText).toBe('Credit card: [REDACTED].');
    expect(res.body.detectedEntities).toContain('CREDIT_CARD');
  });

  it('POST /api/v1/analyze with an email', async () => {
    const res = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'My email is user@domain.com.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sanitizedText).toBe('My email is [REDACTED].');
    expect(res.body.detectedEntities).toContain('EMAIL');
  });

  it('POST /api/v1/analyze with a phone number', async () => {
    const res = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'Call +1 (555) 019-2834.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sanitizedText).toBe('Call [REDACTED].');
    expect(res.body.detectedEntities).toContain('PHONE');
  });

  it('POST /api/v1/analyze with both email and phone number in the same message', async () => {
    const res = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'Email user@domain.com, Call +1 (555) 019-2834.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sanitizedText).toBe('Email [REDACTED], Call [REDACTED].');
    expect(res.body.detectedEntities).toContain('EMAIL');
    expect(res.body.detectedEntities).toContain('PHONE');
  });

  it('POST /api/v1/analyze with empty feedback string should return 400 and continue working on next request', async () => {
    // 1. Send empty request -> expect 400
    const failRes = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: '    ' });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error).toBe('Validation Error');

    // 2. Send valid request -> expect 200 (shows server didn't crash)
    const successRes = await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'This is a great product!' });

    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.sentiment).toBe('POSITIVE');
  });

  it('GET /health and GET /api/v1/health should return healthy status', async () => {
    const res1 = await request(app).get('/health');
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ status: 'healthy' });

    const res2 = await request(app).get('/api/v1/health');
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ status: 'healthy' });
  });

  it('GET /api/v1/logs should return saved audit log entries', async () => {
    // Populate database
    await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'First user feedback' });

    const res = await request(app).get('/api/v1/logs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.logs[0].originalLength).toBe(19);
  });

  it('GET /api/v1/stats should return aggregated logs statistics', async () => {
    await request(app)
      .post('/api/v1/analyze')
      .send({ feedback: 'This is an excellent product!' });

    const res = await request(app).get('/api/v1/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalRequests).toBe(1);
    expect(res.body.stats.positiveFeedback).toBe(1);
  });
});
