/**
 * Require Plan Middleware
 * Ensures user has an active subscription with a valid plan
 * Attaches req.subscription and req.plan for downstream use
 */

import { catchAsync } from '../utils/catchAsync.js';
import { ApiError } from '../utils/ApiError.js';
import Subscription from '../modules/billing/subscription.model.js';
import { SubscriptionStatus } from '../constants/billing.constants.js';

/**
 * Middleware: Verify user has active subscription and valid plan
 * Requirements:
 * - req.user must exist (authMiddleware should be applied first)
 * - User must have a subscription
 * - Subscription must be in an active status
 * - Subscription period must not have expired
 */
export const requirePlan = catchAsync(async (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  // Load user's subscription with plan details
  const subscription = await Subscription.findOne({ userId: req.user._id })
    .populate('planId')
    .lean();

  if (!subscription) {
    throw new ApiError(403, 'No active subscription found. Please subscribe to a plan.');
  }

  // Check subscription status
  const activeStatuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL];
  if (!activeStatuses.includes(subscription.status)) {
    throw new ApiError(
      403,
      `Subscription is ${subscription.status}. Please reactivate or renew your subscription.`
    );
  }

  // Check if subscription has expired
  if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date()) {
    throw new ApiError(
      403,
      'Subscription has expired. Please renew your subscription to continue.'
    );
  }

  // Check if plan exists and is active
  const plan = subscription.planId;
  if (!plan) {
    throw new ApiError(403, 'Associated plan not found. Please contact support.');
  }

  if (!plan.isActive) {
    throw new ApiError(403, 'Subscription plan is no longer active. Please contact support.');
  }

  // Attach to request for downstream use
  req.subscription = subscription;
  req.plan = plan;

  next();
});

export default requirePlan;
