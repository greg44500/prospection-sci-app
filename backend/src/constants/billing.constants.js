/**
 * Billing Constants and Enums
 */

export const PlanType = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  BUSINESS: 'business',
};

export const SubscriptionStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  TRIAL: 'trial',
};

export const BillingInterval = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const UsageMetric = {
  SEARCHES: 'searches',
  PROSPECTS_IMPORTED: 'prospects_imported',
  PROSPECTS_SAVED: 'prospects_saved',
  CSV_EXPORTS: 'csv_exports',
  ENRICHMENTS: 'enrichments',
  ADVANCED_DASHBOARD: 'advanced_dashboard',
  SIGNALS: 'signals',
  TEAM_MEMBERS: 'team_members',
};

/**
 * Plan Limits (default values)
 */
export const PlanLimits = {
  [PlanType.FREE]: {
    [UsageMetric.SEARCHES]: 5,
    [UsageMetric.PROSPECTS_IMPORTED]: 50,
    [UsageMetric.PROSPECTS_SAVED]: 100,
    [UsageMetric.CSV_EXPORTS]: 0,
    [UsageMetric.ENRICHMENTS]: 0,
    [UsageMetric.ADVANCED_DASHBOARD]: false,
    [UsageMetric.SIGNALS]: false,
    [UsageMetric.TEAM_MEMBERS]: 1,
  },
  [PlanType.STARTER]: {
    [UsageMetric.SEARCHES]: 50,
    [UsageMetric.PROSPECTS_IMPORTED]: 500,
    [UsageMetric.PROSPECTS_SAVED]: 1000,
    [UsageMetric.CSV_EXPORTS]: 10,
    [UsageMetric.ENRICHMENTS]: 50,
    [UsageMetric.ADVANCED_DASHBOARD]: true,
    [UsageMetric.SIGNALS]: false,
    [UsageMetric.TEAM_MEMBERS]: 1,
  },
  [PlanType.PRO]: {
    [UsageMetric.SEARCHES]: 500,
    [UsageMetric.PROSPECTS_IMPORTED]: 5000,
    [UsageMetric.PROSPECTS_SAVED]: 10000,
    [UsageMetric.CSV_EXPORTS]: 100,
    [UsageMetric.ENRICHMENTS]: 1000,
    [UsageMetric.ADVANCED_DASHBOARD]: true,
    [UsageMetric.SIGNALS]: true,
    [UsageMetric.TEAM_MEMBERS]: 3,
  },
  [PlanType.BUSINESS]: {
    [UsageMetric.SEARCHES]: -1, // Unlimited
    [UsageMetric.PROSPECTS_IMPORTED]: -1,
    [UsageMetric.PROSPECTS_SAVED]: -1,
    [UsageMetric.CSV_EXPORTS]: -1,
    [UsageMetric.ENRICHMENTS]: -1,
    [UsageMetric.ADVANCED_DASHBOARD]: true,
    [UsageMetric.SIGNALS]: true,
    [UsageMetric.TEAM_MEMBERS]: -1,
  },
};

export default {
  PlanType,
  SubscriptionStatus,
  BillingInterval,
  UsageMetric,
  PlanLimits,
};
