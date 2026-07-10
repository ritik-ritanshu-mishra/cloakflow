import express from 'express';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
} from './middleware/security';
import { errorHandler } from './middleware/error';
import feedbackRouter from './routes/feedback';

const app = express();

// JSON body parsing with a 50KB limit to protect against oversized payloads
app.use(express.json({ limit: '50kb' }));

// Apply security and rate limiting middleware
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(rateLimitMiddleware);

// Mount main application router
app.use('/', feedbackRouter);

// Centralized error handling middleware must be registered LAST
app.use(errorHandler);

export default app;
export { app };
