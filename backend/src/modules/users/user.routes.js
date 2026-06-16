import express from 'express';
import * as userController from './user.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { updateProfileSchema, changePasswordSchema } from './user.validation.js';

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, validateRequest({ body: updateProfileSchema }), userController.updateMe);
router.patch('/me/password', authMiddleware, validateRequest({ body: changePasswordSchema }), userController.changePassword);
router.delete('/me', authMiddleware, userController.deleteMe);

export default router;
