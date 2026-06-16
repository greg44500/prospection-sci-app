/**
 * Health Check Routes
 * Endpoint to verify API and database status
 */

import express from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { isConnected } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', catchAsync(async (req, res) => {
  const isDbConnected = isConnected();

  const health = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: isDbConnected ? 'healthy' : 'degraded',
    checks: {
      api: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      },
    },
  };

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(health);
}));

export default router;
