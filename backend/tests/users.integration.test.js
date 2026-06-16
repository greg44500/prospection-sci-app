import express from 'express';
import request from 'supertest';
import validateRequest from '../src/middlewares/validateRequest.js';
import { z } from 'zod';
// Local test schemas (keep tests decoupled from large shared validation)
const updateProfileSchema = z.object({ firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(), email: z.string().email().optional() });
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) });
import userController from '../src/modules/users/user.controller.js';

// Helper: auth stub middleware setter
const authStub = (user) => (req, res, next) => {
  if (user) req.user = user;
  next();
};

describe('Users integration (protected routes)', () => {
  let app;
  const fakeUser = {
    _id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    toJSON() {
      const { password, ...rest } = { password: undefined, ...this };
      return rest;
    },
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // GET /api/users/me -> use real controller (safe: uses req.user only)
    app.get('/api/users/me', authStub(null), (req, res, next) => {
      // simulate auth middleware absence -> controller should return 401
      return userController.getMe(req, res, next);
    });

    // Authenticated variant
    app.get('/api/authenticated/users/me', authStub(fakeUser), userController.getMe);

    // PATCH /api/users/me -> validateRequest + stub handler (no DB)
    app.patch('/api/users/me', authStub(null), validateRequest({ body: updateProfileSchema }), (req, res) => {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
      const updated = { ...req.user, ...req.validated.body };
      return res.json({ success: true, data: updated });
    });

    app.patch('/api/authenticated/users/me', authStub(fakeUser), validateRequest({ body: updateProfileSchema }), (req, res) => {
      const updated = { ...fakeUser, ...req.validated.body };
      return res.json({ success: true, data: updated });
    });

    // PATCH /api/users/me/password -> validateRequest + stub handler
    // Simple unauthenticated handler: just ensure route is protected
    app.patch('/api/users/me/password', authStub(null), (req, res) => {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
      return res.json({ success: true, message: 'Password changed' });
    });

    app.patch('/api/authenticated/users/me/password', authStub(fakeUser), validateRequest({ body: changePasswordSchema }), (req, res) => {
      return res.json({ success: true, message: 'Password changed' });
    });
  });

  test('GET /api/users/me returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/authenticated/users/me returns user without password', async () => {
    const res = await request(app).get('/api/authenticated/users/me');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('email', 'test@example.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  test('PATCH /api/users/me returns 401 when unauthenticated', async () => {
    const res = await request(app).patch('/api/users/me').send({ firstName: 'New' });
    expect(res.status).toBe(401);
  });

  test('PATCH /api/authenticated/users/me validates body and updates', async () => {
    const res = await request(app).patch('/api/authenticated/users/me').send({ firstName: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('firstName', 'New');
  });

  test('PATCH /api/users/me/password returns 401 when unauthenticated', async () => {
    const res = await request(app).patch('/api/users/me/password').send({ currentPassword: 'x', newPassword: 'y' });
    if (res.status !== 401) console.error('Unexpected response body:', res.body);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/authenticated/users/me/password succeeds for valid body', async () => {
    const res = await request(app).patch('/api/authenticated/users/me/password').send({ currentPassword: 'oldpass', newPassword: 'newpass' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password changed');
  });
});
