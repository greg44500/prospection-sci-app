/**
 * Models Test
 * Verifies that all models and services load correctly
 */

import 'dotenv/config.js';

console.log('\n=== Testing Models and Services ===\n');

try {
  // Test users module
  console.log('Loading users module...');
  const {
    User,
    RefreshToken,
    UserRole,
    UserStatus,
    AuthProvider,
  } = await import('./src/modules/users/index.js');
  console.log('✓ Users module loaded');
  console.log(`  - User model: ${User.modelName}`);
  console.log(`  - RefreshToken model: ${RefreshToken.modelName}`);
  console.log(`  - Roles: ${Object.values(UserRole).join(', ')}`);
  console.log(`  - Statuses: ${Object.values(UserStatus).join(', ')}`);
  console.log(`  - Providers: ${Object.values(AuthProvider).join(', ')}`);

  // Test billing module
  console.log('\nLoading billing module...');
  const {
    Plan,
    Subscription,
    UsageCounter,
    PlanType,
    SubscriptionStatus,
    BillingInterval,
    UsageMetric,
    PlanLimits,
  } = await import('./src/modules/billing/index.js');
  console.log('✓ Billing module loaded');
  console.log(`  - Plan model: ${Plan.modelName}`);
  console.log(`  - Subscription model: ${Subscription.modelName}`);
  console.log(`  - UsageCounter model: ${UsageCounter.modelName}`);
  console.log(`  - Plan types: ${Object.values(PlanType).join(', ')}`);
  console.log(`  - Subscription statuses: ${Object.values(SubscriptionStatus).join(', ')}`);
  console.log(`  - Billing intervals: ${Object.values(BillingInterval).join(', ')}`);
  console.log(`  - Usage metrics: ${Object.keys(UsageMetric).length} metrics`);

  // Test validations
  console.log('\nLoading validations...');
  const userValidations = await import('./src/modules/users/user.validation.js');
  const billingValidations = await import('./src/modules/billing/billing.validation.js');
  console.log('✓ User validations: ' + Object.keys(userValidations).filter(k => k.endsWith('Schema')).length + ' schemas');
  console.log('✓ Billing validations: ' + Object.keys(billingValidations).filter(k => k.endsWith('Schema')).length + ' schemas');

  // Test services
  console.log('\nLoading services...');
  const userService = await import('./src/modules/users/user.service.js');
  const billingService = await import('./src/modules/billing/billing.service.js');
  console.log('✓ User service: ' + Object.keys(userService).length + ' functions');
  console.log('✓ Billing service: ' + Object.keys(billingService).length + ' functions');

  // Test middlewares
  console.log('\nLoading middlewares...');
  const authMiddleware = await import('./src/middlewares/authMiddleware.js');
  const usageLimitMiddleware = await import('./src/middlewares/usageLimitMiddleware.js');
  console.log('✓ Auth middleware: ' + Object.keys(authMiddleware).length + ' functions');
  console.log('✓ Usage limit middleware: ' + Object.keys(usageLimitMiddleware).length + ' functions');

  // Test constants
  console.log('\nLoading constants...');
  const constants = await import('./src/constants/index.js');
  console.log('✓ Constants loaded: ' + Object.keys(constants).length + ' items');

  // Show plan limits
  console.log('\nPlan Limits configured:');
  Object.entries(PlanLimits).forEach(([planType, limits]) => {
    const searchLimit = limits.searches === -1 ? '∞' : limits.searches;
    console.log(`  - ${planType}: ${searchLimit} searches/month`);
  });

  console.log('\n✓ All models, services, and middleware loaded successfully!\n');
  process.exit(0);
} catch (error) {
  console.error('✗ Error loading models:', error.message);
  console.error(error.stack);
  process.exit(1);
}
