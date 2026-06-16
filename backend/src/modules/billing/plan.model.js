/**
 * Plan Model
 * Available subscription plans
 */

import mongoose from 'mongoose';
import { PlanType, BillingInterval, UsageMetric, PlanLimits } from '../../constants/billing.constants.js';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
      enum: Object.values(PlanType),
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },

    // Pricing
    pricing: {
      monthly: {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        stripePriceId: {
          type: String,
          default: null,
        },
      },
      yearly: {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        stripePriceId: {
          type: String,
          default: null,
        },
      },
    },

    // Features & Limits
    limits: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // Example: { searches: 50, prospects_saved: 1000, ... }
    },

    features: [
      {
        name: String,
        description: String,
        included: Boolean,
      },
    ],

    // Trial
    trialDays: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    order: {
      type: Number,
      default: 0, // For sorting plans in UI
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
planSchema.index({ name: 1 });
planSchema.index({ isActive: 1 });
planSchema.index({ order: 1 });

/**
 * Statics
 */

/**
 * Find all active plans ordered
 */
planSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ order: 1 });
};

/**
 * Find plan by type
 */
planSchema.statics.findByType = function (planType) {
  return this.findOne({ name: planType });
};

/**
 * Get default plans data
 */
planSchema.statics.getDefaultPlans = function () {
  return [
    {
      name: PlanType.FREE,
      displayName: 'Free',
      description: 'Pour découvrir la plateforme',
      pricing: {
        monthly: { amount: 0 },
        yearly: { amount: 0 },
      },
      limits: PlanLimits[PlanType.FREE],
      features: [
        { name: 'Recherches mensuelles', description: '5 recherches', included: true },
        { name: 'Prospects sauvegardés', description: 'Jusqu\'à 100', included: true },
        { name: 'Export CSV', included: false },
        { name: 'Dashboard avancé', included: false },
      ],
      trialDays: 0,
      isActive: true,
      order: 1,
    },
    {
      name: PlanType.STARTER,
      displayName: 'Starter',
      description: 'Pour débuter votre prospection',
      pricing: {
        monthly: { amount: 2999 }, // 29,99€
        yearly: { amount: 29990 }, // 299,90€
      },
      limits: PlanLimits[PlanType.STARTER],
      features: [
        { name: 'Recherches mensuelles', description: '50 recherches', included: true },
        { name: 'Prospects sauvegardés', description: 'Jusqu\'à 1 000', included: true },
        { name: 'Export CSV', description: '10 exports/mois', included: true },
        { name: 'Dashboard avancé', included: true },
        { name: 'Signaux', included: false },
      ],
      trialDays: 14,
      isActive: true,
      order: 2,
    },
    {
      name: PlanType.PRO,
      displayName: 'Pro',
      description: 'Pour les prospecteurs actifs',
      pricing: {
        monthly: { amount: 7999 }, // 79,99€
        yearly: { amount: 79990 }, // 799,90€
      },
      limits: PlanLimits[PlanType.PRO],
      features: [
        { name: 'Recherches mensuelles', description: '500 recherches', included: true },
        { name: 'Prospects sauvegardés', description: 'Jusqu\'à 10 000', included: true },
        { name: 'Export CSV', description: 'Illimité', included: true },
        { name: 'Dashboard avancé', included: true },
        { name: 'Signaux', included: true },
        { name: 'Enrichissements', description: '1 000/mois', included: true },
      ],
      trialDays: 14,
      isActive: true,
      order: 3,
    },
    {
      name: PlanType.BUSINESS,
      displayName: 'Business',
      description: 'Pour les équipes et organisations',
      pricing: {
        monthly: { amount: 24999 }, // 249,99€
        yearly: { amount: 249990 }, // 2 499,90€
      },
      limits: PlanLimits[PlanType.BUSINESS],
      features: [
        { name: 'Recherches mensuelles', description: 'Illimitées', included: true },
        { name: 'Prospects sauvegardés', description: 'Illimitées', included: true },
        { name: 'Export CSV', description: 'Illimitées', included: true },
        { name: 'Dashboard avancé', included: true },
        { name: 'Signaux', included: true },
        { name: 'Enrichissements', description: 'Illimitées', included: true },
        { name: 'Membres d\'équipe', description: 'Illimités', included: true },
      ],
      trialDays: 30,
      isActive: true,
      order: 4,
    },
  ];
};

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
