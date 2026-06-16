import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../users/user.model.js';
import RefreshToken from '../users/refresh-token.model.js';
import { ApiError } from '../../utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET || !REFRESH_SECRET) {
  // do not throw here to avoid breaking non-runtime analysis, controllers will check
}

const parseDurationToMs = (str) => {
  // support formats: '7d', '24h', '15m' or numeric seconds
  if (!str) return 7 * 24 * 60 * 60 * 1000;
  if (typeof str === 'number') return str * 1000;
  if (/^\d+$/.test(str)) return parseInt(str, 10) * 1000; // seconds
  const unit = str.slice(-1);
  const val = parseInt(str.slice(0, -1), 10);
  if (unit === 'd') return val * 24 * 60 * 60 * 1000;
  if (unit === 'h') return val * 60 * 60 * 1000;
  if (unit === 'm') return val * 60 * 1000;
  // fallback assume minutes
  return parseInt(str, 10) * 60 * 1000;
};

export const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user) => {
  if (!JWT_SECRET) throw new ApiError(500, 'JWT secret not configured');
  const payload = { userId: user._id.toString() };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAccessToken = (token) => {
  if (!JWT_SECRET) throw new ApiError(500, 'JWT secret not configured');
  return jwt.verify(token, JWT_SECRET);
};

export const generateRefreshTokenString = () => {
  return crypto.randomBytes(48).toString('hex');
};

export const createRefreshToken = async ({ userId, userAgent = null, ipAddress = null }) => {
  if (!REFRESH_SECRET) throw new ApiError(500, 'Refresh token secret not configured');

  const tokenString = generateRefreshTokenString();
  const ms = parseDurationToMs(REFRESH_EXPIRES);
  const expiresAt = new Date(Date.now() + ms);

  const doc = await RefreshToken.create({
    userId,
    token: tokenString,
    expiresAt,
    userAgent,
    ipAddress,
  });

  // Return token string (not JWT) to client
  return { token: tokenString, expiresAt };
};

export const findValidRefreshToken = async (userId, token) => {
  return RefreshToken.findValidToken(userId, token);
};

export const revokeRefreshToken = async (tokenDoc) => {
  if (!tokenDoc) return null;
  tokenDoc.isRevoked = true;
  tokenDoc.revokedAt = new Date();
  return tokenDoc.save();
};

export const rotateRefreshToken = async (tokenDoc, { userAgent = null, ipAddress = null } = {}) => {
  // revoke old
  await revokeRefreshToken(tokenDoc);
  // create a new one
  return createRefreshToken({ userId: tokenDoc.userId, userAgent, ipAddress });
};

export default {
  hashPassword,
  comparePassword,
  generateAccessToken,
  verifyAccessToken,
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
};
