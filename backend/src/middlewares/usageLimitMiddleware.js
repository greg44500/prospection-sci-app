/**
 * Usage Limit Middleware
 * Checks if user has reached usage limits
 */

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { getUserCurrentMonthUsage, getUserActiveSubscription } from '../modules/billing/billing.service.js';
import { getPlanById } from '../modules/billing/billing.service.js';
import { PlanLimits } from '../constants/billing.constants.js';

/**
 * Check if user has usage limit for a specific metric
 * Attach usage info to request
 */
export const checkUsageLimit = (metric) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Get active subscription
    const subscription = await getUserActiveSubscription(req.user._id);

    if (!subscription) {
      throw new ApiError(402, 'No active subscription');
    }

    // Get plan
    const plan = await getPlanById(subscription.planId);
    if (!plan) {
      throw new ApiError(500, 'Plan not found');
    }

    // Get current usage
    const usage = await getUserCurrentMonthUsage(req.user._id, subscription._id);

    // Get limits for this plan
    const limits = plan.limits || PlanLimits[plan.name];

    // Check if limit is exceeded
    if (usage.isLimitExceeded(metric, limits)) {
      throw new ApiError(429, `Usage limit exceeded for: ${metric}`, {
        metric,
        limit: limits[metric],
        current: usage.usage[metric],
      });
    }

    // Attach usage info to request
    req.subscription = subscription;
    req.plan = plan;
    req.usage = usage;
    req.limits = limits;
    req.remaining = usage.getRemainingUsage(metric, limits);

    next();
  });
};

/**
 * Check if user has access to feature
 */
export const requirePlanFeature = (feature) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Get active subscription
    const subscription = await getUserActiveSubscription(req.user._id);

    if (!subscription) {
      throw new ApiError(402, 'No active subscription');
    }

    // Get plan
    const plan = await getPlanById(subscription.planId);
    if (!plan) {
      throw new ApiError(500, 'Plan not found');
    }

    // Get limits (which includes feature flags)
    const limits = plan.limits || PlanLimits[plan.name];

    // Check if feature is available
    if (limits[feature] === false || limits[feature] === 0) {
      throw new ApiError(403, `This feature is not available in your plan: ${feature}`);
    }

    req.subscription = subscription;
    req.plan = plan;

    next();
  });
};

/**
 * Attach usage data to request (without blocking)
 */
export const attachUsageData = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    const subscription = await getUserActiveSubscription(req.user._id);

    if (subscription) {
      const plan = await getPlanById(subscription.planId);
      if (plan) {
        const usage = await getUserCurrentMonthUsage(req.user._id, subscription._id);
        const limits = plan.limits || PlanLimits[plan.name];

        req.subscription = subscription;
        req.plan = plan;
        req.usage = usage;
        req.limits = limits;
      }
    }
  } catch (error) {
    // Don't block if there's an error getting usage data
    console.error('Error attaching usage data:', error);
  }

  next();
});

export default {
  checkUsageLimit,
  requirePlanFeature,
  attachUsageData,
};
