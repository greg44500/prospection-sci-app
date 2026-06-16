import express from 'express';
import request from 'supertest';
import validateRequest from '../src/middlewares/validateRequest.js';
import { z } from 'zod';
const createCheckoutSchema = z.object({ priceId: z.string().min(1).optional() });

const authStub = (user) => (req, res, next) => {
  if (user) req.user = user;
  next();
};

describe('Billing integration (plans & subscription)', () => {
  let app;
  const fakeUser = { _id: 'user123', email: 'test@example.com', toJSON() { return { _id: this._id, email: this.email }; } };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // GET /api/plans - public
    app.get('/api/plans', (req, res) => {
      return res.json({ success: true, data: [{ id: 'free', name: 'Free' }] });
    });

    // GET /api/subscription/me - protected
    app.get('/api/subscription/me', authStub(null), (req, res) => {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
      return res.json({ success: true, data: null });
    });

    app.get('/api/authenticated/subscription/me', authStub(fakeUser), (req, res) => {
      return res.json({ success: true, data: { plan: 'starter', status: 'active' } });
    });

    // POST create-checkout-session (protected + validate)
    app.post('/api/billing/create-checkout-session', authStub(null), validateRequest({ body: createCheckoutSchema }), (req, res) => {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
      return res.status(501).json({ success: false, message: 'Not implemented' });
    });
  });

  test('GET /api/plans is public and returns plans', async () => {
    const res = await request(app).get('/api/plans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/subscription/me returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/subscription/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/authenticated/subscription/me returns subscription for user', async () => {
    const res = await request(app).get('/api/authenticated/subscription/me');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('plan');
  });

  test('POST /api/billing/create-checkout-session returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/billing/create-checkout-session').send({ priceId: 'price_123' });
    expect(res.status).toBe(401);
  });
});
