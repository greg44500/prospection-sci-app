import { catchAsync } from '../../utils/catchAsync.js';
import { ApiError } from '../../utils/ApiError.js';
import User from './user.model.js';
import * as authService from '../auth/auth.service.js';

export const getMe = catchAsync(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  res.json({ success: true, data: req.user.toJSON() });
});

export const updateMe = catchAsync(async (req, res) => {
  const data = req.validated.body;
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, 'Authentication required');

  if (data.email) {
    const exists = await User.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: userId } });
    if (exists) throw new ApiError(409, 'Email already in use');
  }

  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true });
  res.json({ success: true, data: user.toJSON() });
});

export const changePassword = catchAsync(async (req, res) => {
  const data = req.validated.body;
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, 'Authentication required');

  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const match = await authService.comparePassword(data.currentPassword, user.password);
  if (!match) throw new ApiError(401, 'Invalid current password');

  user.password = await authService.hashPassword(data.newPassword);
  await user.save();

  res.json({ success: true, message: 'Password updated' });
});

export const deleteMe = catchAsync(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, 'Authentication required');

  // Soft-delete
  await User.findByIdAndUpdate(userId, { status: 'deleted' });
  res.json({ success: true, message: 'Account deleted' });
});

export default { getMe, updateMe, changePassword, deleteMe };
