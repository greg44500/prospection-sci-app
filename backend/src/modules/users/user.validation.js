/**
 * User Validation Schemas (Zod)
 */

import { z } from 'zod';
import { UserRole, UserStatus, AuthProvider } from '../../constants/user.constants.js';

/**
 * Email validation
 */
const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation
 * Minimum 6 characters, at least one uppercase, one lowercase, one number
 */
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Create User validation
 */
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  mainCity: z.string().optional().nullable(),
  mainProspectionZone: z.string().optional().nullable(),
});

/**
 * Update User validation
 */
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters')
    .optional(),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  mainCity: z.string().optional().nullable(),
  mainProspectionZone: z.string().optional().nullable(),
  emailNotificationsEnabled: z.boolean().optional(),
  displayPreferences: z
    .object({
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      itemsPerPage: z.number().int().min(5).max(100).optional(),
    })
    .optional(),
});

/**
 * Change Password validation
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

/**
 * Update User Status validation
 */
export const updateUserStatusSchema = z.object({
  status: z.enum(Object.values(UserStatus)),
});

/**
 * Update User Role validation
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(UserRole)),
});

/**
 * Update Profile validation
 * User can update only personal/profile preferences, not role/status/provider/password.
 */
export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(50, 'First name must be at most 50 characters')
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be at most 50 characters')
      .optional(),

    phone: z
      .string()
      .trim()
      .max(30, 'Phone must be at most 30 characters')
      .optional()
      .nullable(),

    companyName: z
      .string()
      .trim()
      .max(100, 'Company name must be at most 100 characters')
      .optional()
      .nullable(),

    mainCity: z
      .string()
      .trim()
      .max(100, 'Main city must be at most 100 characters')
      .optional()
      .nullable(),

    mainProspectionZone: z
      .string()
      .trim()
      .max(150, 'Main prospection zone must be at most 150 characters')
      .optional()
      .nullable(),

    emailNotificationsEnabled: z.boolean().optional(),

    displayPreferences: z
      .object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        itemsPerPage: z.number().int().min(5).max(100).optional(),
      })
      .optional(),
  })
  .strict();

export default {
  createUserSchema,
  updateProfileSchema,
  updateUserSchema,
  changePasswordSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  emailSchema,
  passwordSchema,
};
