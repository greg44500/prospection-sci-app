/**
 * Middleware Tests: requirePlan & requireUsageLimit
 */

import request from 'supertest';
import express from 'express';
import { requirePlan } from '../src/middlewares/requirePlan.js';
import { requireUsageLimit, checkUsageStatus } from '../src/middlewares/requireUsageLimit.js';
import Subscription from '../src/modules/billing/subscription.model.js';
import UsageCounter from '../src/modules/billing/usage-counter.model.js';
import { SubscriptionStatus, BillingInterval } from '../src/constants/billing.constants.js';

/**
 * Test Setup: Mock middleware for auth stub
 */
const authStub = (user) => (req, res, next) => {
  req.user = user;
  next();
};

/**
 * Test Plan Data (fixtures)
 */
const mockPlan = {
  _id: '507f1f77bcf86cd799439011',
  name: 'starter',
  displayName: 'Starter',
  isActive: true,
  limits: {
    searches: 50,
    csv_exports: 10,
    prospects_saved: 1000,
  },
};

const mockInactivePlan = {
  _id: '507f1f77bcf86cd799439012',
  name: 'archived',
  displayName: 'Archived Plan',
  isActive: false,
  limits: { searches: 50 },
};

const mockUnlimitedPlan = {
  _id: '507f1f77bcf86cd799439013',
  name: 'business',
  displayName: 'Business',
  isActive: true,
  limits: {
    searches: -1,
    csv_exports: -1,
    prospects_saved: -1,
  },
};

const mockUser = {
  _id: '507f1f77bcf86cd799439020',
  email: 'test@example.com',
};

describe('Middleware: requirePlan', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('returns 401 if user not authenticated', async () => {
    app.get('/protected', requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('returns 403 if user has no subscription', async () => {
    // Mock Subscription.findOne to return null
    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/No active subscription/);

    Subscription.findOne.mockRestore();
  });

  test('returns 403 if subscription is inactive', async () => {
    const inactiveSubscription = {
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.CANCELED,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(inactiveSubscription),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/canceled/);

    Subscription.findOne.mockRestore();
  });

  test('returns 403 if subscription has expired', async () => {
    const expiredSubscription = {
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() - 10000), // past
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(expiredSubscription),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/expired/);

    Subscription.findOne.mockRestore();
  });

  test('returns 403 if plan is inactive', async () => {
    const subscription = {
      userId: mockUser._id,
      planId: mockInactivePlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/no longer active/);

    Subscription.findOne.mockRestore();
  });

  test('succeeds and attaches subscription & plan if valid', async () => {
    const subscription = {
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      expect(req.subscription).toBeDefined();
      expect(req.plan).toBeDefined();
      res.json({ success: true, subscription: req.subscription, plan: req.plan });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    Subscription.findOne.mockRestore();
  });

  test('accepts TRIAL status as active', async () => {
    const subscription = {
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.TRIAL,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    app.get('/protected', authStub(mockUser), requirePlan, (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);

    Subscription.findOne.mockRestore();
  });
});

describe('Middleware: requireUsageLimit', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('returns 401 if user not authenticated', async () => {
    app.get('/limited', requireUsageLimit('searches'), (req, res) => {
      res.json({ success: true });
    });

    const res = await request(app).get('/limited');
    expect(res.status).toBe(401);
  });

  test('returns 500 if requirePlan not applied first', async () => {
    app.get(
      '/limited',
      authStub(mockUser),
      requireUsageLimit('searches'),
      (req, res) => {
        res.json({ success: true });
      }
    );

    const res = await request(app).get('/limited');
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/requirePlan/);
  });

  test('returns 429 if usage limit exceeded (strict mode)', async () => {
    const subscription = {
      _id: '507f1f77bcf86cd799439030',
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    const usageCounter = {
      _id: '507f1f77bcf86cd799439040',
      userId: mockUser._id,
      subscriptionId: subscription._id,
      usage: { searches: 50 }, // at limit
      increment: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    jest.spyOn(UsageCounter, 'getCurrentBillingMonth').mockReturnValue('2026-06');
    jest.spyOn(UsageCounter, 'getOrCreateForMonth').mockResolvedValue(usageCounter);

    app.get(
      '/limited',
      authStub(mockUser),
      requirePlan,
      requireUsageLimit('searches', { strict: true }),
      (req, res) => {
        res.json({ success: true });
      }
    );

    const res = await request(app).get('/limited');
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/exceeded/);

    Subscription.findOne.mockRestore();
    UsageCounter.getOrCreateForMonth.mockRestore();
  });

  test('allows unlimited metrics (limit = -1)', async () => {
    const subscription = {
      _id: '507f1f77bcf86cd799439031',
      userId: mockUser._id,
      planId: mockUnlimitedPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    const usageCounter = {
      _id: '507f1f77bcf86cd799439041',
      userId: mockUser._id,
      subscriptionId: subscription._id,
      usage: { searches: 10000 }, // way over the free limit but unlimited
      increment: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    jest.spyOn(UsageCounter, 'getCurrentBillingMonth').mockReturnValue('2026-06');
    jest.spyOn(UsageCounter, 'getOrCreateForMonth').mockResolvedValue(usageCounter);

    app.get(
      '/limited',
      authStub(mockUser),
      requirePlan,
      requireUsageLimit('searches', { strict: true }),
      (req, res) => {
        res.json({ success: true });
      }
    );

    const res = await request(app).get('/limited');
    expect(res.status).toBe(200);

    Subscription.findOne.mockRestore();
    UsageCounter.getOrCreateForMonth.mockRestore();
  });

  test('attaches usageCounter for controller to increment', async () => {
    const subscription = {
      _id: '507f1f77bcf86cd799439032',
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    const usageCounter = {
      _id: '507f1f77bcf86cd799439042',
      userId: mockUser._id,
      subscriptionId: subscription._id,
      usage: { searches: 10 }, // under limit of 50
      increment: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    jest.spyOn(UsageCounter, 'getCurrentBillingMonth').mockReturnValue('2026-06');
    jest.spyOn(UsageCounter, 'getOrCreateForMonth').mockResolvedValue(usageCounter);

    app.get(
      '/limited',
      authStub(mockUser),
      requirePlan,
      requireUsageLimit('searches'),
      (req, res) => {
        expect(req.usageCounter).toBeDefined();
        res.json({ success: true, usageCounter: req.usageCounter });
      }
    );

    const res = await request(app).get('/limited');
    expect(res.status).toBe(200);
    expect(res.body.usageCounter).toBeDefined();

    Subscription.findOne.mockRestore();
    UsageCounter.getOrCreateForMonth.mockRestore();
  });

  test('supports multiple metrics in array', async () => {
    const subscription = {
      _id: '507f1f77bcf86cd799439033',
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    const usageCounter = {
      _id: '507f1f77bcf86cd799439043',
      userId: mockUser._id,
      subscriptionId: subscription._id,
      usage: { searches: 10, csv_exports: 5 }, // both under limit
      increment: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    jest.spyOn(UsageCounter, 'getCurrentBillingMonth').mockReturnValue('2026-06');
    jest.spyOn(UsageCounter, 'getOrCreateForMonth').mockResolvedValue(usageCounter);

    app.get(
      '/limited',
      authStub(mockUser),
      requirePlan,
      requireUsageLimit(['searches', 'csv_exports']),
      (req, res) => {
        res.json({ success: true });
      }
    );

    const res = await request(app).get('/limited');
    expect(res.status).toBe(200);

    Subscription.findOne.mockRestore();
    UsageCounter.getOrCreateForMonth.mockRestore();
  });
});

describe('Middleware: checkUsageStatus (informational)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('attaches empty status if not authenticated', async () => {
    app.get('/status', checkUsageStatus('searches'), (req, res) => {
      res.json({ status: req.usageStatus });
    });

    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toEqual({});
  });

  test('attaches usage status with remaining quota', async () => {
    const subscription = {
      _id: '507f1f77bcf86cd799439034',
      userId: mockUser._id,
      planId: mockPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 10000),
    };

    const usageCounter = {
      _id: '507f1f77bcf86cd799439044',
      userId: mockUser._id,
      subscriptionId: subscription._id,
      usage: { searches: 20 }, // 30 remaining out of 50
    };

    jest.spyOn(Subscription, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(subscription),
      }),
    });

    jest.spyOn(UsageCounter, 'getCurrentBillingMonth').mockReturnValue('2026-06');
    jest.spyOn(UsageCounter, 'getOrCreateForMonth').mockResolvedValue(usageCounter);

    app.get(
      '/status',
      authStub(mockUser),
      requirePlan,
      checkUsageStatus('searches'),
      (req, res) => {
        res.json({ status: req.usageStatus });
      }
    );

    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body.status.searches).toBeDefined();
    expect(res.body.status.searches.current).toBe(20);
    expect(res.body.status.searches.remaining).toBe(30);
    expect(res.body.status.searches.percentage).toBe(40); // 20/50 * 100

    Subscription.findOne.mockRestore();
    UsageCounter.getOrCreateForMonth.mockRestore();
  });
});
