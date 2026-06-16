/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

import 'dotenv/config.js';
import app from './app.js';
import { config, validateConfig } from './config/env.js';
import { connectDB } from './config/database.js';

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Validate environment configuration
    validateConfig();

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Prospection SCI App - Backend API    ║
╚════════════════════════════════════════╝

✓ Server running on port ${config.port}
✓ Environment: ${config.env}
✓ Database: Connected

URLs:
  - API Base: ${config.appBaseUrl}
  - Health Check: ${config.appBaseUrl}/api/health
  - Frontend: ${config.frontendUrl}
      `);
    });

    /**
     * Graceful Shutdown
     */
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    /**
     * Handle uncaught exceptions
     */
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    /**
     * Handle unhandled promise rejections
     */
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
