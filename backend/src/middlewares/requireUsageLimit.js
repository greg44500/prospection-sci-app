/**
 * Require Usage Limit Middleware
 * Ensures user has not exceeded usage limits for specified metrics
 * Factory pattern: returns middleware function(s)
 * Attaches req.usageCounter for controllers to increment after action
 */

import { catchAsync } from '../utils/catchAsync.js';
import { ApiError } from '../utils/ApiError.js';
import Subscription from '../modules/billing/subscription.model.js';
import UsageCounter from '../modules/billing/usage-counter.model.js';
import { PlanLimits } from '../constants/billing.constants.js';

/**
 * Factory function: creates middleware to check usage limits
 *
 * @param {string|string[]} metrics - Usage metric(s) to check (e.g., 'searches', ['searches', 'csv_exports'])
 * @param {object} options - Optional configuration
 * @param {boolean} options.strict - If true, throw error on limit exceeded; if false, attach warning
 * @returns {function} Express middleware
 *
 * Usage:
 *   app.post('/search', authMiddleware, requirePlan, requireUsageLimit('searches'), searchController);
 *   app.post('/export', authMiddleware, requirePlan, requireUsageLimit(['csv_exports', 'prospects_saved']), exportController);
 */
export const requireUsageLimit = (metrics, options = {}) => {
  // Normalize metrics to array
  const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
  const strict = options.strict !== false; // Default to strict

  return catchAsync(async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Ensure requirePlan has been called (should populate req.subscription and req.plan)
    if (!req.subscription || !req.plan) {
      throw new ApiError(
        500,
        'requirePlan middleware must be called before requireUsageLimit'
      );
    }

    const { subscription, plan } = req;

    // Get plan limits (from DB or fallback to constants)
    const planLimits = plan.limits || PlanLimits[plan.name] || {};

    // Get current month usage counter
    const billingMonth = UsageCounter.getCurrentBillingMonth();
    const usageCounter = await UsageCounter.getOrCreateForMonth(
      req.user._id,
      subscription._id,
      billingMonth
    );

    // Check each metric
    const violations = [];
    for (const metric of metricsArray) {
      const limit = planLimits[metric];

      // Skip if limit is not defined or is -1 (unlimited)
      if (limit === undefined || limit === -1 || limit === false) {
        continue;
      }

      const current = usageCounter.usage[metric] || 0;

      // Check if limit exceeded
      if (current >= limit) {
        violations.push({
          metric,
          limit,
          current,
          remaining: 0,
        });
      }
    }

    // Handle violations
    if (violations.length > 0) {
      if (strict) {
        const firstViolation = violations[0];
        throw new ApiError(
          429,
          `Usage limit exceeded for ${firstViolation.metric}. Limit: ${firstViolation.limit}, Current: ${firstViolation.current}`
        );
      } else {
        // Attach warning info but allow request to proceed
        req.usageLimitWarnings = violations;
      }
    }

    // Attach usage counter for controller to increment after action
    req.usageCounter = usageCounter;

    next();
  });
};

/**
 * Helper: Check usage without enforcing (returns result instead of throwing)
 * Useful for UI to show remaining quota without blocking
 *
 * @param {string|string[]} metrics - Usage metric(s) to check
 * @returns {function} Express middleware that attaches req.usageStatus
 */
export const checkUsageStatus = (metrics) => {
  const metricsArray = Array.isArray(metrics) ? metrics : [metrics];

  return catchAsync(async (req, res, next) => {
    // Optional auth and plan check
    if (!req.user || !req.subscription || !req.plan) {
      // Attach empty status if not authenticated
      req.usageStatus = {};
      return next();
    }

    const { subscription, plan } = req;
    const planLimits = plan.limits || {};
    const billingMonth = UsageCounter.getCurrentBillingMonth();
    const usageCounter = await UsageCounter.getOrCreateForMonth(
      req.user._id,
      subscription._id,
      billingMonth
    );

    req.usageStatus = {};

    for (const metric of metricsArray) {
      const limit = planLimits[metric];
      const current = usageCounter.usage[metric] || 0;

      req.usageStatus[metric] = {
        current,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - current),
        percentage: limit === -1 ? 0 : Math.min(100, Math.round((current / limit) * 100)),
        unlimited: limit === -1,
      };
    }

    next();
  });
};

/**
 * Helper: Increment usage counter after action succeeds
 * Typically called inside a controller after business logic succeeds
 *
 * @param {object} usageCounter - UsageCounter document from middleware
 * @param {string} metric - Metric to increment
 * @param {number} amount - Amount to increment (default 1)
 * @returns {Promise<object>} Updated UsageCounter
 */
export const incrementUsage = async (usageCounter, metric, amount = 1) => {
  if (!usageCounter) {
    throw new Error('usageCounter not found (requireUsageLimit middleware not applied)');
  }

  return usageCounter.increment(metric, amount);
};

export default { requireUsageLimit, checkUsageStatus, incrementUsage };
