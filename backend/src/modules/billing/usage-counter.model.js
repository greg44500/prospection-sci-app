/**
 * Usage Counter Model
 * Tracks usage of features by users (monthly resets)
 */

import mongoose from 'mongoose';
import { UsageMetric } from '../../constants/billing.constants.js';

const usageCounterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },

    // Billing month (format: YYYY-MM)
    billingMonth: {
      type: String,
      required: true,
      index: true,
    },

    // Usage metrics
    usage: {
      [UsageMetric.SEARCHES]: {
        type: Number,
        default: 0,
        min: 0,
      },
      [UsageMetric.PROSPECTS_IMPORTED]: {
        type: Number,
        default: 0,
        min: 0,
      },
      [UsageMetric.PROSPECTS_SAVED]: {
        type: Number,
        default: 0,
        min: 0,
      },
      [UsageMetric.CSV_EXPORTS]: {
        type: Number,
        default: 0,
        min: 0,
      },
      [UsageMetric.ENRICHMENTS]: {
        type: Number,
        default: 0,
        min: 0,
      },
      [UsageMetric.ADVANCED_DASHBOARD]: {
        type: Boolean,
        default: false,
      },
      [UsageMetric.SIGNALS]: {
        type: Boolean,
        default: false,
      },
      [UsageMetric.TEAM_MEMBERS]: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    // Warnings & notifications
    sentLimitWarningAt: {
      type: Date,
      default: null,
    },
    sentLimitExceededAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Composite unique index: user + billing month
 * Ensures only one usage counter per user per month
 */
usageCounterSchema.index({ userId: 1, billingMonth: 1 }, { unique: true });
usageCounterSchema.index({ subscriptionId: 1, billingMonth: 1 });

/**
 * Methods
 */

/**
 * Increment usage counter
 */
usageCounterSchema.methods.increment = function (metric, amount = 1) {
  if (!this.usage.hasOwnProperty(metric)) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  if (typeof this.usage[metric] === 'number') {
    this.usage[metric] += amount;
  }
  return this.save();
};

/**
 * Check if limit is exceeded for a metric
 */
usageCounterSchema.methods.isLimitExceeded = function (metric, planLimits) {
  if (!planLimits[metric]) {
    return false;
  }

  const limit = planLimits[metric];
  const current = this.usage[metric];

  // -1 means unlimited
  if (limit === -1) {
    return false;
  }

  return current >= limit;
};

/**
 * Get remaining usage for a metric
 */
usageCounterSchema.methods.getRemainingUsage = function (metric, planLimits) {
  if (!planLimits[metric]) {
    return null;
  }

  const limit = planLimits[metric];
  const current = this.usage[metric];

  // -1 means unlimited
  if (limit === -1) {
    return -1;
  }

  return Math.max(0, limit - current);
};

/**
 * Get usage percentage
 */
usageCounterSchema.methods.getUsagePercentage = function (metric, planLimits) {
  if (!planLimits[metric]) {
    return null;
  }

  const limit = planLimits[metric];
  const current = this.usage[metric];

  // -1 means unlimited
  if (limit === -1) {
    return 0;
  }

  return Math.min(100, Math.round((current / limit) * 100));
};

/**
 * Statics
 */

/**
 * Get or create usage counter for current month
 */
usageCounterSchema.statics.getOrCreateForMonth = function (userId, subscriptionId, billingMonth) {
  return this.findOneAndUpdate(
    { userId, subscriptionId, billingMonth },
    { userId, subscriptionId, billingMonth },
    { upsert: true, new: true }
  );
};

/**
 * Get current month billing string (YYYY-MM)
 */
usageCounterSchema.statics.getCurrentBillingMonth = function () {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Find usage for user in month
 */
usageCounterSchema.statics.findForUserInMonth = function (userId, billingMonth) {
  return this.findOne({ userId, billingMonth });
};

/**
 * Reset usage for a month (for testing/admin)
 */
usageCounterSchema.statics.resetForMonth = function (userId, billingMonth) {
  return this.findOneAndUpdate(
    { userId, billingMonth },
    {
      $set: {
        usage: {
          [UsageMetric.SEARCHES]: 0,
          [UsageMetric.PROSPECTS_IMPORTED]: 0,
          [UsageMetric.PROSPECTS_SAVED]: 0,
          [UsageMetric.CSV_EXPORTS]: 0,
          [UsageMetric.ENRICHMENTS]: 0,
          [UsageMetric.ADVANCED_DASHBOARD]: false,
          [UsageMetric.SIGNALS]: false,
          [UsageMetric.TEAM_MEMBERS]: 1,
        },
      },
    }
  );
};

const UsageCounter = mongoose.model('UsageCounter', usageCounterSchema);

export default UsageCounter;
