/**
 * Billing Validation Schemas (Zod)
 */

import { z } from 'zod';
import { PlanType, BillingInterval, SubscriptionStatus } from '../../constants/billing.constants.js';

/**
 * Create Plan validation
 */
export const createPlanSchema = z.object({
  name: z.enum(Object.values(PlanType)),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  pricing: z.object({
    monthly: z.object({
      amount: z.number().min(0, 'Amount must be positive'),
      stripePriceId: z.string().optional(),
    }),
    yearly: z.object({
      amount: z.number().min(0, 'Amount must be positive'),
      stripePriceId: z.string().optional(),
    }),
  }),
  limits: z.record(z.any()), // Flexible limits object
  features: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        included: z.boolean(),
      })
    )
    .optional(),
  trialDays: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

/**
 * Update Plan validation
 */
export const updatePlanSchema = createPlanSchema.partial();

/**
 * Create Subscription validation
 */
export const createSubscriptionSchema = z.object({
  userId: z.string().refine((id) => {
    // Simple MongoDB ObjectId validation
    return /^[0-9a-fA-F]{24}$/.test(id);
  }, 'Invalid user ID'),
  planId: z.string().refine((id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }, 'Invalid plan ID'),
  billingInterval: z.enum(Object.values(BillingInterval)),
  billingEmail: z.string().email('Invalid billing email'),
});

/**
 * Update Subscription validation
 */
export const updateSubscriptionSchema = z.object({
  billingInterval: z.enum(Object.values(BillingInterval)).optional(),
  billingEmail: z.string().email('Invalid billing email').optional(),
  autoRenew: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Cancel Subscription validation
 */
export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Stripe Webhook validation
 */
export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export default {
  createPlanSchema,
  updatePlanSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
  stripeWebhookSchema,
};
