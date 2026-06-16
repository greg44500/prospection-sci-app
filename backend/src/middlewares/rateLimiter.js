/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting requests per IP
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

/**
 * Stricter rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false,
});

/**
 * Moderate rate limiter for general operations
 */
export const operationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many operations, please slow down.',
  skipSuccessfulRequests: false,
});

export default {
  apiLimiter,
  authLimiter,
  operationLimiter,
};
