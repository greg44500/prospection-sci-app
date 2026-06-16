/**
 * User Model
 * Mongoose schema for user accounts
 */

import mongoose from 'mongoose';
import { UserRole, UserStatus, AuthProvider, UserDefaults } from '../../constants/user.constants.js';

const userSchema = new mongoose.Schema(
  {
    // Basic info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // Authentication
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't include in queries by default
    },
    emailVerified: {
      type: Boolean,
      default: UserDefaults.emailVerified,
    },
    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    // Password recovery
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // Profile & Professional
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    mainCity: {
      type: String,
      trim: true,
      default: null,
    },
    mainProspectionZone: {
      type: String,
      trim: true,
      default: null,
    },
    profilePictureUrl: {
      type: String,
      default: null,
    },

    // Account status
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserDefaults.role,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserDefaults.status,
    },

    // OAuth Providers
    providers: {
      local: {
        enabled: Boolean,
        connectedAt: Date,
      },
      google: {
        enabled: Boolean,
        googleId: String,
        connectedAt: Date,
      },
    },

    // Preferences
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    displayPreferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      itemsPerPage: {
        type: Number,
        default: 20,
      },
    },

    // Billing reference
    currentSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },

    // System fields
    lastLoginAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'providers.google.googleId': 1, sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ deletedAt: 1 }); // For soft delete queries

/**
 * Virtual: Full name
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

/**
 * Virtual: Is active
 */
userSchema.virtual('isActive').get(function () {
  return this.status === UserStatus.ACTIVE && !this.deletedAt;
});

/**
 * Methods
 */

/**
 * Check if password is correct (for local auth)
 * Note: bcrypt comparison should be done in service/controller
 */
userSchema.methods.hasPassword = function () {
  return !!this.password;
};

/**
 * Check if provider is connected
 */
userSchema.methods.isProviderConnected = function (provider) {
  if (!this.providers[provider]) {
    return false;
  }
  return this.providers[provider].enabled === true;
};

/**
 * Get safe user object (without sensitive data)
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpiresAt;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpiresAt;
  delete user.providers?.google?.googleId; // Hide Google ID in public responses
  return user;
};

/**
 * Static: Find by email (case-insensitive)
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Middleware: Update updatedAt before save
 */
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Middleware: Create default provider object if not exists
 */
userSchema.pre('save', function (next) {
  if (!this.providers) {
    this.providers = {
      local: { enabled: false },
      google: { enabled: false },
    };
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
