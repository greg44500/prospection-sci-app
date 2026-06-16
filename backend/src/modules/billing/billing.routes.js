import express from 'express';
import * as billingController from './billing.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { createCheckoutSchema } from './billing.validation.js';

const router = express.Router();

router.get('/plans', billingController.getPlans);
router.get('/subscription/me', authMiddleware, billingController.getSubscription);
router.post('/billing/create-checkout-session', authMiddleware, validateRequest({ body: createCheckoutSchema }), billingController.createCheckoutSession);
router.post('/billing/create-customer-portal-session', authMiddleware, billingController.createCustomerPortalSession);

export default router;
