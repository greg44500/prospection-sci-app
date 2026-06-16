import express from 'express';
import request from 'supertest';
import authRoutes from '../src/modules/auth/auth.routes.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('Auth routes validation', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    // Minimal error handler for tests (format Zod errors)
    app.use((err, req, res, next) => {
      if (err && err.errors) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
      }
      return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
    });
  });

  test('POST /api/auth/register returns validation error if body invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    const msg = String(res.body.message || '');
    expect(msg).toMatch(/Invalid input|firstName/);
  });

  test('POST /api/auth/refresh-token returns validation error if missing refreshToken', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    const msg = String(res.body.message || '');
    expect(msg).toMatch(/Invalid input|refreshToken/);
  });
});
