import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// CORS middleware setup
export const corsMiddleware = cors();

// Helmet middleware setup (configured for SPA compatibility)
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
});

// Express rate limiter: limit each IP to 100 requests per 15 minutes
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again after 15 minutes.',
  },
});
