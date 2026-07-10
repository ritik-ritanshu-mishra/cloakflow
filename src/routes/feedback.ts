import { Router } from 'express';
import { feedbackSchema } from '../validators/feedback';
import { routingService } from '../services/routing';
import { feedbackRepository } from '../repositories/feedback';

export const feedbackRouter = Router();

// Health check routes
feedbackRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

feedbackRouter.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// POST feedback analysis endpoint
feedbackRouter.post('/api/v1/analyze', async (req, res, next) => {
  try {
    // Validate request payload using feedbackSchema
    const parsedBody = feedbackSchema.parse(req.body);

    // Coordinate redaction, routing, logging, and repo save
    const result = await routingService.processFeedback(parsedBody.feedback);

    res.status(200).json(result);
  } catch (error) {
    // Let validation and database errors bubble up to Express error middleware
    next(error);
  }
});

// GET logs retrieval endpoint
feedbackRouter.get('/api/v1/logs', async (_req, res, next) => {
  try {
    const logs = await feedbackRepository.getAllLogs();
    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
});

// GET statistics retrieval endpoint
feedbackRouter.get('/api/v1/stats', async (_req, res, next) => {
  try {
    const stats = await feedbackRepository.getStats();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

// Default export
export default feedbackRouter;
