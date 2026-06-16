/**
 * User Service
 * Business logic for user operations
 */

import User from './user.model.js';
import RefreshToken from './refresh-token.model.js';
import { UserStatus } from '../../constants/user.constants.js';

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  return User.findByEmail(email);
};

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  return User.findById(userId);
};

/**
 * Update user
 */
export const updateUser = async (userId, updateData) => {
  return User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
};

/**
 * Deactivate user (soft delete)
 */
export const deactivateUser = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    {
      status: UserStatus.INACTIVE,
      deletedAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Create refresh token
 */
export const createRefreshToken = async (userId, token, expiresAt, metadata = {}) => {
  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt,
    userAgent: metadata.userAgent || null,
    ipAddress: metadata.ipAddress || null,
  });
  await refreshToken.save();
  return refreshToken;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (userId, token) => {
  const refreshToken = await RefreshToken.findValidToken(userId, token);
  return refreshToken && refreshToken.isValid();
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (userId, token) => {
  const refreshToken = await RefreshToken.findOne({ userId, token });
  if (refreshToken) {
    await refreshToken.revoke();
  }
  return refreshToken;
};

/**
 * Revoke all user tokens (logout everywhere)
 */
export const revokeAllUserTokens = async (userId) => {
  return RefreshToken.revokeUserTokens(userId);
};

/**
 * Find user with select specific fields
 */
export const findUserWithFields = async (userId, fields) => {
  return User.findById(userId).select(fields);
};

/**
 * Check if email exists
 */
export const emailExists = async (email) => {
  const user = await User.findByEmail(email);
  return !!user;
};

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deactivateUser,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findUserWithFields,
  emailExists,
};
