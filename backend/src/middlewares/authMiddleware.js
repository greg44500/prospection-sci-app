/**
 * Authentication Middleware
 * Basic auth middleware (full implementation in auth module)
 */

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import User from '../modules/users/user.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'No authentication token provided');
  }

  if (!JWT_SECRET) {
    throw new ApiError(500, 'JWT secret not configured');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const userId = payload.userId || payload.sub;
  if (!userId) throw new ApiError(401, 'Invalid token payload');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, 'User not found');

  req.userId = user._id;
  req.user = user;
  next();
});

/**
 * Verify user is authenticated
 */
export const isAuthenticated = catchAsync(async (req, res, next) => {
  if (!req.userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  req.user = user;
  next();
});

/**
 * Verify user role
 */
export const requireRole = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `This action requires one of: ${roles.join(', ')}`);
    }

    next();
  });
};

/**
 * Verify user has active subscription
 */
export const requireActiveSubscription = catchAsync(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.currentSubscriptionId) {
    throw new ApiError(402, 'Active subscription required');
  }

  // TODO: Verify subscription is actually active
  next();
});

export default {
  authMiddleware,
  isAuthenticated,
  requireRole,
  requireActiveSubscription,
};
