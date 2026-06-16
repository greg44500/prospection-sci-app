/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import billingService from './modules/billing/billing.service.js';

const app = express();

/**
 * Trust proxy
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 */
app.use(helmet());

/**
 * CORS Middleware
 */
app.use(
    cors({
        origin: config.frontendUrl,
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

/**
 * Morgan Logger
 */
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

/**
 * Rate Limiting
 */
app.use('/api/', apiLimiter);

/**
 * Health Check Routes
 */
app.use('/api/health', healthRoutes);

/**
 * Auth Routes
 */
app.use('/api/auth', authRoutes);

/**
 * Users + Billing Routes
 */
app.use('/api/users', userRoutes);
app.use('/api', billingRoutes);

// Seed default plans in non-production environments so local dev works without Stripe
if (config.env !== 'production') {
    (async () => {
        try {
            await billingService.seedDefaultPlans();
            // eslint-disable-next-line no-console
            console.log('Default billing plans seeded (or already present)');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed seeding billing plans:', err.message || err);
        }
    })();
}

/**
 * API Routes (will be added later)
 */
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/billing', billingRoutes);
// ... other routes

/**
 * Base Route
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Prospection SCI App Backend API',
        version: '1.0.0',
        status: 'running',
    });
});

/**
 * 404 Not Found Middleware
 */
app.use(notFound);

/**
 * Error Handling Middleware
 */
app.use(errorHandler);

export default app;
