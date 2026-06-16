/**
 * Logger Utility
 * Simple logging utility for the application
 */

import { config } from '../config/env.js';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = config.env === 'development' ? LogLevel.DEBUG : LogLevel.INFO;

const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;

  if (data) {
    return `${prefix} ${message}`, data;
  }
  return `${prefix} ${message}`;
};

export const logger = {
  debug: (message, data = null) => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      const formatted = formatMessage('DEBUG', message, data);
      console.log(`${colors.debug}${formatted}${colors.reset}`, data);
    }
  },

  info: (message, data = null) => {
    if (currentLogLevel <= LogLevel.INFO) {
      const formatted = formatMessage('INFO', message, data);
      console.log(`${colors.info}${formatted}${colors.reset}`, data);
    }
  },

  warn: (message, data = null) => {
    if (currentLogLevel <= LogLevel.WARN) {
      const formatted = formatMessage('WARN', message, data);
      console.warn(`${colors.warn}${formatted}${colors.reset}`, data);
    }
  },

  error: (message, error = null) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      const formatted = formatMessage('ERROR', message);
      console.error(`${colors.error}${formatted}${colors.reset}`, error);
    }
  },
};

export default logger;
