import express from 'express';
import request from 'supertest';
import validateRequest from '../src/middlewares/validateRequest.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { registerSchema } from '../src/modules/auth/auth.validation.js';

describe('validateRequest middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/test', validateRequest({ body: registerSchema }), (req, res) => {
      res.status(200).json({ success: true, data: req.validated.body });
    });
    // Minimal error handler for tests (format Zod errors)
    app.use((err, req, res, next) => {
      if (err && err.errors) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
      }
      return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
    });
  });

  test('returns validation error for invalid body', async () => {
    const res = await request(app).post('/test').send({});
    // Accept either structured ApiError or raw Zod message
    expect(res.status).toBeGreaterThanOrEqual(400);
    const msg = String(res.body.message || '');
    expect(msg).toMatch(/Invalid input|firstName/);
  });

  test('passes for valid body', async () => {
    const payload = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      password: 'Secret123',
    };
    const res = await request(app).post('/test').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ firstName: 'Jean', email: 'jean@example.com' });
  });
});
