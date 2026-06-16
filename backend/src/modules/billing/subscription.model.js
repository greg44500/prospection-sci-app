/**
 * Subscription Model
 * User subscriptions to plans
 */

import mongoose from 'mongoose';
import { SubscriptionStatus, BillingInterval } from '../../constants/billing.constants.js';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },

    // Billing
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.PENDING,
      index: true,
    },
    billingInterval: {
      type: String,
      enum: Object.values(BillingInterval),
      default: BillingInterval.MONTHLY,
    },
    billingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },

    // Pricing
    currentAmount: {
      type: Number,
      required: true,
      min: 0,
    }, // Amount in cents

    // Stripe integration
    stripeCustomerId: {
      type: String,
      default: null,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    stripePaymentMethodId: {
      type: String,
      default: null,
    },

    // Dates
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    trialStartsAt: {
      type: Date,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    canceledReason: {
      type: String,
      default: null,
    },

    // Auto-renew
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
 * Indexes
 */

subscriptionSchema.index({ currentPeriodEnd: 1 });

/**
 * Virtual: Is trial
 */
subscriptionSchema.virtual('isTrial').get(function () {
  return (
    !!this.trialStartsAt &&
    !!this.trialEndsAt &&
    this.trialEndsAt > new Date()
  );
});

/**
 * Virtual: Is active
 */
subscriptionSchema.virtual('isActive').get(function () {
  return (
    this.status === SubscriptionStatus.ACTIVE ||
    this.status === SubscriptionStatus.TRIAL ||
    (this.status === SubscriptionStatus.PAST_DUE && this.currentPeriodEnd > new Date())
  );
});

/**
 * Methods
 */

/**
 * Check if subscription has expired
 */
subscriptionSchema.methods.hasExpired = function () {
  return (
    this.currentPeriodEnd < new Date() &&
    this.status !== SubscriptionStatus.CANCELED
  );
};

/**
 * Cancel subscription
 */
subscriptionSchema.methods.cancel = function (reason = null) {
  this.status = SubscriptionStatus.CANCELED;
  this.canceledAt = new Date();
  this.canceledReason = reason;
  this.autoRenew = false;
  return this.save();
};

/**
 * Statics
 */

/**
 * Find active subscription for user
 */
subscriptionSchema.statics.findActiveForUser = function (userId) {
  return this.findOne({
    userId,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
  })
    .populate('planId');
};

/**
 * Find subscription by Stripe ID
 */
subscriptionSchema.statics.findByStripeId = function (stripeSubscriptionId) {
  return this.findOne({ stripeSubscriptionId }).populate('planId');
};

/**
 * Find expiring soon subscriptions
 */
subscriptionSchema.statics.findExpiringSoon = function (daysUntilExpiry = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysUntilExpiry);

  return this.find({
    currentPeriodEnd: {
      $gte: startDate,
      $lte: endDate,
    },
    status: SubscriptionStatus.ACTIVE,
    autoRenew: true,
  });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
