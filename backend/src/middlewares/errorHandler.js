/**
 * Error Handler Middleware
 * Centralized error handling for all Express routes
 */

import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

/**
 * Format error response
 * @param {*} error
 * @returns {Object}
 */
const formatError = (error) => {
  let apiError = error;

  // Convert Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
    apiError = new ApiError(400, 'Validation Error', errors);
  }

  // Convert Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = `${field} already exists`;
    apiError = new ApiError(409, message);
  }

  // Convert Mongoose cast error
  if (error.name === 'CastError') {
    apiError = new ApiError(400, `Invalid ${error.kind}: ${error.value}`);
  }

  // Convert JWT errors
  if (error.name === 'JsonWebTokenError') {
    apiError = new ApiError(401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    apiError = new ApiError(401, 'Token expired');
  }

  // If already an ApiError, use as is
  if (error instanceof ApiError) {
    apiError = error;
  }

  return apiError;
};

/**
 * Error handling middleware
 * Must be the last middleware in the app
 */
export const errorHandler = (err, req, res, next) => {
  const error = formatError(err);

  const response = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error',
  };

  // Add errors details if available
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (config.env === 'development') {
    response.stack = error.stack;
  }

  // Log error in production
  if (config.env === 'production' && !error.isOperational) {
    console.error('❌ Unhandled Error:', error);
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * 404 Not Found middleware
 * Should be placed before the error handler
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

export default errorHandler;
