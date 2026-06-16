/**
 * API Error Class
 * Custom error class for API responses
 */

export class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
