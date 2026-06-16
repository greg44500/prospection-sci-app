# Modèles Backend - Documentation

## Vue d'ensemble

Ce document décrit les modèles Mongoose créés pour l'application SaaS.

## Structure des modules

```
src/
├── modules/
│   ├── users/
│   │   ├── user.model.js           # Modèle User
│   │   ├── refresh-token.model.js  # Modèle RefreshToken
│   │   ├── user.service.js         # Logique métier utilisateurs
│   │   ├── user.validation.js      # Validations Zod
│   │   └── index.js                # Exports
│   ├── billing/
│   │   ├── plan.model.js           # Modèle Plan
│   │   ├── subscription.model.js   # Modèle Subscription
│   │   ├── usage-counter.model.js  # Modèle UsageCounter
│   │   ├── billing.service.js      # Logique métier facturation
│   │   ├── billing.validation.js   # Validations Zod
│   │   └── index.js                # Exports
├── constants/
│   ├── user.constants.js           # Constantes utilisateur
│   ├── billing.constants.js        # Constantes facturation
│   └── index.js                    # Exports
└── middlewares/
    ├── authMiddleware.js           # Auth (placeholder)
    └── usageLimitMiddleware.js      # Limites d'usage
```

---

## Module Users

### User Model

**Champs principaux:**

```javascript
{
  // Identité
  firstName: String,          // Requis
  lastName: String,           // Requis
  email: String,              // Requis, unique, validé
  phone: String,              // Optionnel

  // Authentification
  password: String,           // Pour local auth (hashé)
  emailVerified: Boolean,     // Statut de vérification email
  providers: {
    local: { enabled, connectedAt },
    google: { enabled, googleId, connectedAt }
  },

  // Récupération de mot de passe
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  passwordChangedAt: Date,

  // Profil professionnel
  companyName: String,
  mainCity: String,
  mainProspectionZone: String,
  profilePictureUrl: String,

  // Compte
  role: 'admin' | 'user' | 'team_member',
  status: 'active' | 'inactive' | 'suspended' | 'deleted',

  // Préférences
  emailNotificationsEnabled: Boolean,
  displayPreferences: {
    theme: 'light' | 'dark' | 'auto',
    itemsPerPage: Number
  },

  // Facturation
  currentSubscriptionId: ObjectId,  // Référence Subscription

  // Système
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date               // Pour soft delete
}
```

**Méthodes:**

- `user.toJSON()` - Retourne l'objet sans données sensibles
- `user.hasPassword()` - Vérifie si un mot de passe est défini
- `user.isProviderConnected(provider)` - Vérifie si un provider est connecté

**Statics:**

- `User.findByEmail(email)` - Recherche par email (case-insensitive)

**Virtuals:**

- `user.fullName` - Retourne le nom complet
- `user.isActive` - Vérifie si l'utilisateur est actif

---

### RefreshToken Model

**Champs:**

```javascript
{
  userId: ObjectId,           // Référence User
  token: String,              // Le token lui-même
  expiresAt: Date,            // Expiration (TTL index auto-supprime)
  isRevoked: Boolean,         // Statut de révocation
  revokedAt: Date,            // Date de révocation
  userAgent: String,          // User-Agent du client
  ipAddress: String,          // Adresse IP
  createdAt: Date
}
```

**Méthodes:**

- `token.isValid()` - Vérifie si le token est valide
- `token.revoke()` - Révoque le token

**Statics:**

- `RefreshToken.findValidToken(userId, token)` - Trouve un token valide
- `RefreshToken.revokeUserTokens(userId)` - Révoque tous les tokens d'un utilisateur
- `RefreshToken.cleanupRevokedTokens(daysOld)` - Nettoie les vieux tokens révoqués

---

## Module Billing

### Plan Model

**Champs:**

```javascript
{
  name: 'free' | 'starter' | 'pro' | 'business',  // Unique
  displayName: String,
  description: String,

  pricing: {
    monthly: { amount, stripePriceId },
    yearly: { amount, stripePriceId }
  },

  limits: {
    // Utilise PlanLimits du plan
    searches: Number,
    prospects_imported: Number,
    prospects_saved: Number,
    csv_exports: Number,
    enrichments: Number,
    advanced_dashboard: Boolean,
    signals: Boolean,
    team_members: Number
  },

  features: [
    { name, description, included }
  ],

  trialDays: Number,
  isActive: Boolean,
  order: Number,              // Pour tri dans UI

  createdAt: Date,
  updatedAt: Date
}
```

**Statics:**

- `Plan.findActive()` - Tous les plans actifs, triés
- `Plan.findByType(planType)` - Recherche par type
- `Plan.getDefaultPlans()` - Retourne les données par défaut des plans

---

### Subscription Model

**Champs:**

```javascript
{
  userId: ObjectId,           // Référence User (unique)
  planId: ObjectId,           // Référence Plan

  status: 'active' | 'past_due' | 'canceled' | 'expired' | 'pending' | 'trial',
  billingInterval: 'monthly' | 'yearly',
  billingEmail: String,

  currentAmount: Number,      // En cents

  // Stripe
  stripeCustomerId: String,
  stripeSubscriptionId: String,  // Unique
  stripePaymentMethodId: String,

  // Dates
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  trialStartsAt: Date,
  trialEndsAt: Date,
  canceledAt: Date,
  canceledReason: String,

  autoRenew: Boolean,
  metadata: Object,

  createdAt: Date,
  updatedAt: Date
}
```

**Virtuals:**

- `subscription.isTrial` - En période d'essai?
- `subscription.isActive` - Abonnement actif?

**Méthodes:**

- `subscription.hasExpired()` - A expiré?
- `subscription.cancel(reason)` - Annule l'abonnement

**Statics:**

- `Subscription.findActiveForUser(userId)` - Abonnement actif de l'utilisateur
- `Subscription.findByStripeId(stripeId)` - Recherche par Stripe ID
- `Subscription.findExpiringSoon(days)` - Qui expirent bientôt

---

### UsageCounter Model

**Champs:**

```javascript
{
  userId: ObjectId,
  subscriptionId: ObjectId,
  billingMonth: String,       // Format: "YYYY-MM" (unique avec userId)

  usage: {
    searches: Number,
    prospects_imported: Number,
    prospects_saved: Number,
    csv_exports: Number,
    enrichments: Number,
    advanced_dashboard: Boolean,
    signals: Boolean,
    team_members: Number
  },

  sentLimitWarningAt: Date,
  sentLimitExceededAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

**Méthodes:**

- `usage.increment(metric, amount)` - Incrémente un métrique
- `usage.isLimitExceeded(metric, planLimits)` - Dépassement?
- `usage.getRemainingUsage(metric, planLimits)` - Usage restant
- `usage.getUsagePercentage(metric, planLimits)` - En pourcentage

**Statics:**

- `UsageCounter.getOrCreateForMonth(userId, subscriptionId, billingMonth)` - Get or create
- `UsageCounter.getCurrentBillingMonth()` - Le mois actuel (YYYY-MM)
- `UsageCounter.findForUserInMonth(userId, billingMonth)` - Recherche
- `UsageCounter.resetForMonth(userId, billingMonth)` - Réinitialise (admin/test)

---

## Constantes

### user.constants.js

```javascript
UserRole:      'admin', 'user', 'team_member'
UserStatus:    'active', 'inactive', 'suspended', 'deleted'
AuthProvider:  'local', 'google'
UserDefaults:  role='user', status='active', emailVerified=false
```

### billing.constants.js

```javascript
PlanType:            'free', 'starter', 'pro', 'business'
SubscriptionStatus:  'active', 'past_due', 'canceled', 'expired', 'pending', 'trial'
BillingInterval:     'monthly', 'yearly'
UsageMetric:         'searches', 'prospects_imported', 'prospects_saved', ...

PlanLimits:          Limites pré-configurées pour chaque plan
```

---

## Services

### user.service.js

Fonctions helper pour les opérations utilisateur:

- `createUser(userData)` - Crée un utilisateur
- `findUserByEmail(email)` - Recherche par email
- `findUserById(userId)` - Recherche par ID
- `updateUser(userId, updateData)` - Met à jour
- `deactivateUser(userId)` - Soft delete
- `createRefreshToken()` - Crée un refresh token
- `verifyRefreshToken()` - Vérifie un token
- `revokeRefreshToken()` - Révoque un token
- `revokeAllUserTokens()` - Logout partout
- `emailExists(email)` - Vérifie si email existe

### billing.service.js

Fonctions helper pour la facturation:

- `getActivePlans()` - Tous les plans actifs
- `getPlanById(id)` - Un plan par ID
- `seedDefaultPlans()` - Initialise les plans par défaut
- `getUserActiveSubscription(userId)` - L'abonnement actif
- `createSubscription()` - Crée un abonnement
- `updateSubscription()` - Met à jour
- `cancelSubscription()` - Annule
- `getUserCurrentMonthUsage()` - Usage du mois
- `incrementUsageMetric()` - Incrémente l'usage
- `checkUsageLimit()` - Vérifie les limites

---

## Validations Zod

### user.validation.js

- `createUserSchema` - Validation création utilisateur
- `updateUserSchema` - Validation mise à jour
- `changePasswordSchema` - Validation changement mot de passe
- `emailSchema` - Validation email
- `passwordSchema` - Validation mot de passe (fort)

### billing.validation.js

- `createPlanSchema` - Validation création plan
- `createSubscriptionSchema` - Validation création abonnement
- `cancelSubscriptionSchema` - Validation annulation
- `stripeWebhookSchema` - Validation webhooks Stripe

---

## Middlewares

### authMiddleware.js

- `authMiddleware()` - Vérifie JWT (placeholder)
- `isAuthenticated` - User doit être connecté
- `requireRole(...roles)` - User doit avoir un rôle
- `requireActiveSubscription` - User doit avoir une subscription active

### usageLimitMiddleware.js

- `checkUsageLimit(metric)` - Vérifie limite avant action
- `requirePlanFeature(feature)` - Accès à une feature si plan la permet
- `attachUsageData` - Attache les données sans bloquer

---

## Utilisations Typiques

### Créer un utilisateur

```javascript
import { User } from './modules/users/index.js';
import * as userService from './modules/users/user.service.js';

const userData = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@example.com',
  password: 'HashedPassword123',
};

const user = await userService.createUser(userData);
```

### Initialiser les plans

```javascript
import * as billingService from './modules/billing/billing.service.js';

const results = await billingService.seedDefaultPlans();
console.log('Plans créés:', results);
```

### Créer une subscription

```javascript
const subscription = await billingService.createSubscription({
  userId: user._id,
  planId: plan._id,
  billingInterval: 'monthly',
  billingEmail: 'jean@example.com',
  currentAmount: 2999, // 29,99€ en cents
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
  status: 'active'
});
```

### Vérifier l'usage

```javascript
const usage = await billingService.getUserCurrentMonthUsage(
  userId,
  subscriptionId
);

const canSearch = !usage.isLimitExceeded('searches', planLimits);
if (canSearch) {
  await usage.increment('searches', 1);
}
```

---

## Prochaines Étapes

1. **Implémentation Auth**
   - JWT generation/verification
   - Password hashing avec bcrypt
   - Email verification
   - OAuth Google

2. **Controllers**
   - User CRUD
   - Auth endpoints
   - Billing management

3. **Routes**
   - `/api/auth/register`
   - `/api/auth/login`
   - `/api/users/me`
   - `/api/billing/plans`
   - `/api/subscription/me`

4. **Tests**
   - Unit tests models
   - Integration tests services
   - E2E tests routes
