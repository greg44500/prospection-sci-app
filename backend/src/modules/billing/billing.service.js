/**
 * Billing Service
 * Business logic for billing operations
 */

import Plan from './plan.model.js';
import Subscription from './subscription.model.js';
import UsageCounter from './usage-counter.model.js';
import { SubscriptionStatus } from '../../constants/billing.constants.js';

/**
 * Get all active plans
 */
export const getActivePlans = async () => {
  return Plan.findActive();
};

/**
 * Find plan by ID
 */
export const getPlanById = async (planId) => {
  return Plan.findById(planId);
};

/**
 * Find plan by type
 */
export const getPlanByType = async (planType) => {
  return Plan.findByType(planType);
};

/**
 * Create or get default plans (seeding)
 */
export const seedDefaultPlans = async () => {
  const defaultPlans = Plan.getDefaultPlans();
  const results = [];

  for (const planData of defaultPlans) {
    try {
      const existing = await Plan.findOne({ name: planData.name });
      if (!existing) {
        const plan = await Plan.create(planData);
        results.push({ created: true, plan });
      } else {
        results.push({ created: false, plan: existing });
      }
    } catch (error) {
      results.push({ error: error.message });
    }
  }

  return results;
};

/**
 * Find active subscription for user
 */
export const getUserActiveSubscription = async (userId) => {
  return Subscription.findActiveForUser(userId);
};

/**
 * Create subscription
 */
export const createSubscription = async (subscriptionData) => {
  const subscription = new Subscription(subscriptionData);
  await subscription.save();
  return subscription.populate('planId');
};

/**
 * Update subscription
 */
export const updateSubscription = async (subscriptionId, updateData) => {
  return Subscription.findByIdAndUpdate(subscriptionId, updateData, { new: true }).populate('planId');
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId, reason = null) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  return subscription.cancel(reason);
};

/**
 * Get current month usage for user
 */
export const getUserCurrentMonthUsage = async (userId, subscriptionId) => {
  const currentMonth = UsageCounter.getCurrentBillingMonth();
  return UsageCounter.getOrCreateForMonth(userId, subscriptionId, currentMonth);
};

/**
 * Increment usage metric
 */
export const incrementUsageMetric = async (userId, subscriptionId, metric, amount = 1) => {
  const currentMonth = UsageCounter.getCurrentBillingMonth();
  const usage = await UsageCounter.getOrCreateForMonth(userId, subscriptionId, currentMonth);
  return usage.increment(metric, amount);
};

/**
 * Check if user has limit for metric
 */
export const checkUsageLimit = async (userId, subscriptionId, metric, planLimits) => {
  const currentMonth = UsageCounter.getCurrentBillingMonth();
  const usage = await UsageCounter.getOrCreateForMonth(userId, subscriptionId, currentMonth);

  if (usage.isLimitExceeded(metric, planLimits)) {
    return {
      exceeded: true,
      limit: planLimits[metric],
      current: usage.usage[metric],
      remaining: 0,
    };
  }

  return {
    exceeded: false,
    limit: planLimits[metric],
    current: usage.usage[metric],
    remaining: usage.getRemainingUsage(metric, planLimits),
  };
};

/**
 * Find subscriptions expiring soon
 */
export const findExpiringSubscriptions = async (daysUntilExpiry = 7) => {
  return Subscription.findExpiringSoon(daysUntilExpiry);
};

/**
 * Find subscription by Stripe ID
 */
export const findSubscriptionByStripeId = async (stripeSubscriptionId) => {
  return Subscription.findByStripeId(stripeSubscriptionId);
};

export default {
  getActivePlans,
  getPlanById,
  getPlanByType,
  seedDefaultPlans,
  getUserActiveSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getUserCurrentMonthUsage,
  incrementUsageMetric,
  checkUsageLimit,
  findExpiringSubscriptions,
  findSubscriptionByStripeId,
};
