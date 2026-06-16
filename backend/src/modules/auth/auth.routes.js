import express from 'express';
import * as authController from './auth.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation.js';

const router = express.Router();

router.post('/register', validateRequest({ body: registerSchema }), authController.register);
router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.post('/logout', validateRequest({ body: refreshTokenSchema }), authController.logout);
router.post('/refresh-token', validateRequest({ body: refreshTokenSchema }), authController.refreshToken);
router.get('/me', authMiddleware, authController.me);

export default router;
