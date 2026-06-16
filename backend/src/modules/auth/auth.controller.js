import { catchAsync } from '../../utils/catchAsync.js';
import { ApiError } from '../../utils/ApiError.js';
import User from '../users/user.model.js';
import RefreshToken from '../users/refresh-token.model.js';
import * as authService from './auth.service.js';
import * as billingService from '../billing/billing.service.js';
import { PlanType } from '../../constants/billing.constants.js';
import { BillingInterval, SubscriptionStatus } from '../../constants/billing.constants.js';

/**
 * POST /api/auth/register
 */
export const register = catchAsync(async (req, res) => {
  const data = req.validated.body;

  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const hashed = await authService.hashPassword(data.password);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase().trim(),
    password: hashed,
    providers: { local: { enabled: true, connectedAt: new Date() }, google: { enabled: false } },
  });

  // Ensure default plans exist in DB (safe no-op if already present)
  try {
    await billingService.seedDefaultPlans();
  } catch (err) {
    // non-fatal: continue without seeding
    // eslint-disable-next-line no-console
    console.warn('Failed to seed default plans:', err.message || err);
  }

  // Attach a default free subscription to the newly created user
  try {
    let plan = await billingService.getPlanByType(PlanType.FREE);
    if (!plan) {
      // If plan not found, attempt to seed and re-fetch
      await billingService.seedDefaultPlans();
      plan = await billingService.getPlanByType(PlanType.FREE);
    }

    if (plan) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await billingService.createSubscription({
        userId: user._id,
        planId: plan._id,
        status: SubscriptionStatus.ACTIVE,
        billingInterval: BillingInterval.MONTHLY,
        billingEmail: user.email,
        currentAmount: (plan.pricing && plan.pricing.monthly && plan.pricing.monthly.amount) ? plan.pricing.monthly.amount : 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: false,
      });
    }
  } catch (err) {
    // non-fatal: log and continue
    // eslint-disable-next-line no-console
    console.warn('Failed to create default subscription for user:', err.message || err);
  }

  const accessToken = authService.generateAccessToken(user);
  const refresh = await authService.createRefreshToken({ userId: user._id, userAgent: req.headers['user-agent'], ipAddress: req.ip });

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken: refresh.token,
        refreshExpiresAt: refresh.expiresAt,
      },
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = catchAsync(async (req, res) => {
  const data = req.validated.body;

  const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const match = await authService.comparePassword(data.password, user.password);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = authService.generateAccessToken(user);
  const refresh = await authService.createRefreshToken({ userId: user._id, userAgent: req.headers['user-agent'], ipAddress: req.ip });

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken: refresh.token,
        refreshExpiresAt: refresh.expiresAt,
      },
    },
  });
});

/**
 * POST /api/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
  // Accept refreshToken in body (validated by middleware)
  const { refreshToken } = req.validated.body;
  if (!refreshToken) throw new ApiError(400, 'refreshToken required');

  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (tokenDoc) {
    await tokenDoc.revoke();
  }

  res.json({ success: true, message: 'Logged out' });
});

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.validated.body;
  if (!refreshToken) throw new ApiError(400, 'refreshToken required');

  // Find valid token
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken, isRevoked: false, expiresAt: { $gt: new Date() } });
  if (!tokenDoc) throw new ApiError(401, 'Invalid or expired refresh token');

  // Rotate
  const rotated = await authService.rotateRefreshToken(tokenDoc, { userAgent: req.headers['user-agent'], ipAddress: req.ip });

  // Issue new access token
  const user = await User.findById(tokenDoc.userId);
  if (!user) throw new ApiError(401, 'User not found');

  const accessToken = authService.generateAccessToken(user);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: rotated.token,
      refreshExpiresAt: rotated.expiresAt,
    },
  });
});

/**
 * GET /api/auth/me
 */
export const me = catchAsync(async (req, res) => {
  // authMiddleware should set req.user
  if (!req.user) throw new ApiError(401, 'Authentication required');
  res.json({ success: true, data: req.user.toJSON() });
});

export default {
  register,
  login,
  logout,
  refreshToken,
  me,
};
