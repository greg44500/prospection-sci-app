import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});

export const emptySchema = z.object({});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
