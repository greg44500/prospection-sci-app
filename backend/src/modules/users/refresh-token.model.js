/**
 * Refresh Token Model
 * Stores refresh tokens for token rotation
 */

import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // TTL index: automatically delete when expiration date is reached
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

/**
 * Methods
 */

/**
 * Check if token is still valid
 */
refreshTokenSchema.methods.isValid = function () {
  return !this.isRevoked && this.expiresAt > new Date();
};

/**
 * Revoke token
 */
refreshTokenSchema.methods.revoke = function () {
  this.isRevoked = true;
  this.revokedAt = new Date();
  return this.save();
};

/**
 * Statics
 */

/**
 * Find valid token by user and token
 */
refreshTokenSchema.statics.findValidToken = function (userId, token) {
  return this.findOne({
    userId,
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Revoke all tokens for a user
 */
refreshTokenSchema.statics.revokeUserTokens = function (userId) {
  return this.updateMany(
    { userId, isRevoked: false },
    {
      isRevoked: true,
      revokedAt: new Date(),
    }
  );
};

/**
 * Cleanup old revoked tokens (optional maintenance)
 */
refreshTokenSchema.statics.cleanupRevokedTokens = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    isRevoked: true,
    revokedAt: { $lt: cutoffDate },
  });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
