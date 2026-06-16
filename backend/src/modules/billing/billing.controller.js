import { catchAsync } from '../../utils/catchAsync.js';
import { ApiError } from '../../utils/ApiError.js';
import Plan from './plan.model.js';
import Subscription from './subscription.model.js';
import { config } from '../../config/env.js';

export const getPlans = catchAsync(async (req, res) => {
  const plans = await Plan.find().lean();
  if (!plans || plans.length === 0) {
    // Fallback to in-memory default plans for local/dev when DB has none
    const defaultPlans = Plan.getDefaultPlans().map((p) => ({ ...p, isFixture: true }));
    return res.json({ success: true, data: defaultPlans });
  }
  res.json({ success: true, data: plans });
});

export const getSubscription = catchAsync(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const sub = await Subscription.findOne({ userId: req.user._id });
  res.json({ success: true, data: sub || null });
});

export const createCheckoutSession = catchAsync(async (req, res) => {
  if (!config.stripe.enabled) {
    return res.status(503).json({ success: false, message: 'Stripe is not enabled in this environment' });
  }

  // If enabled, the real implementation will go here (Stripe calls)
  res.status(501).json({ success: false, message: 'Not implemented' });
});

export const createCustomerPortalSession = catchAsync(async (req, res) => {
  if (!config.stripe.enabled) {
    return res.status(503).json({ success: false, message: 'Stripe is not enabled in this environment' });
  }

  // If enabled, the real implementation will go here (Stripe calls)
  res.status(501).json({ success: false, message: 'Not implemented' });
});

export default { getPlans, getSubscription, createCheckoutSession, createCustomerPortalSession };
