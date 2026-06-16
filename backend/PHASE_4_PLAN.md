# Phase 4 - Controllers & Routes

## Objectif

Créer les controllers et routes pour exposer les modèles backend via l'API REST.

## Tâches

### 1. User Controllers (`user.controller.js`)

```javascript
// GET /api/users/me
export const getUserProfile = async (req, res) => {
  // req.user vient du middleware auth
  // Retourne l'utilisateur actuel
}

// PATCH /api/users/me
export const updateUserProfile = async (req, res) => {
  // Valide avec updateUserSchema
  // Appelle userService.updateUser()
}

// PATCH /api/users/me/password
export const changePassword = async (req, res) => {
  // Valide avec changePasswordSchema
  // Hash le nouveau mot de passe
  // Appelle userService.updatePassword()
}

// DELETE /api/users/me
export const deactivateAccount = async (req, res) => {
  // Appelle userService.deactivateUser()
  // Revoque tous les tokens
}
```

### 2. Auth Controllers (`auth.controller.js`)

```javascript
// POST /api/auth/register
export const register = async (req, res) => {
  // Valide avec createUserSchema
  // Hash le mot de passe
  // Crée l'utilisateur
  // Retourne user + tokens
}

// POST /api/auth/login
export const login = async (req, res) => {
  // Cherche l'utilisateur
  // Vérifie le mot de passe
  // Crée refresh token
  // Retourne user + tokens
}

// POST /api/auth/logout
export const logout = async (req, res) => {
  // Revoque le token actuel
}

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  // Vérifie le refresh token
  // Génère un nouveau access token
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  // Retourne l'utilisateur actuel
}
```

### 3. Billing Controllers (`billing.controller.js`)

```javascript
// GET /api/plans
export const getPlans = async (req, res) => {
  // Retourne tous les plans actifs
}

// GET /api/subscription/me
export const getSubscription = async (req, res) => {
  // Retourne l'abonnement actif de l'utilisateur
}

// POST /api/billing/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  // Crée une Stripe checkout session
  // Retourne l'URL vers Stripe
}

// POST /api/billing/create-customer-portal-session
export const createCustomerPortalSession = async (req, res) => {
  // Crée une session Stripe Customer Portal
  // Permet gérer l'abonnement
}

// GET /api/usage/me
export const getUsage = async (req, res) => {
  // Retourne l'usage du mois actuel
}
```

### 4. Stripe Webhook Handler (`webhook.controller.js`)

```javascript
// POST /api/webhooks/stripe
export const handleStripeWebhook = async (req, res) => {
  // Vérifie la signature Stripe
  // Traite les événements:
  // - customer.subscription.created
  // - customer.subscription.updated
  // - customer.subscription.deleted
  // - payment_intent.succeeded
  // - payment_intent.payment_failed
}
```

### 5. Routes

#### `users.routes.js`
```javascript
import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

router.get('/me', isAuthenticated, userController.getUserProfile);
router.patch('/me', isAuthenticated, userController.updateUserProfile);
router.patch('/me/password', isAuthenticated, userController.changePassword);
router.delete('/me', isAuthenticated, userController.deactivateAccount);

export default router;
```

#### `auth.routes.js`
```javascript
import express from 'express';
import * as authController from './auth.controller.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', isAuthenticated, authController.getMe);

// Google OAuth (prochaine phase)
// router.get('/google', authController.googleAuth);
// router.get('/google/callback', authController.googleCallback);

export default router;
```

#### `billing.routes.js`
```javascript
import express from 'express';
import { isAuthenticated, requireActiveSubscription } from '../middlewares/authMiddleware.js';
import * as billingController from './billing.controller.js';

const router = express.Router();

router.get('/plans', billingController.getPlans);
router.get('/subscription/me', isAuthenticated, billingController.getSubscription);
router.post('/create-checkout-session', isAuthenticated, billingController.createCheckoutSession);
router.post('/create-customer-portal-session', isAuthenticated, billingController.createCustomerPortalSession);
router.get('/usage/me', isAuthenticated, billingController.getUsage);

export default router;
```

#### `webhooks.routes.js`
```javascript
import express from 'express';
import * as webhookController from './webhook.controller.js';

const router = express.Router();

router.post('/stripe', webhookController.handleStripeWebhook);

export default router;
```

### 6. Intégration dans `app.js`

```javascript
import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';

const app = express();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
```

## Tâches Détaillées

### Step 1: Créer `auth.service.js`

Fonctions:
- `generateAccessToken(userId)` - JWT avec exp 15m
- `generateRefreshToken(userId)` - JWT avec exp 7d
- `verifyAccessToken(token)` - Vérifie et décod le JWT
- `verifyRefreshToken(token)` - Vérifie et décod le JWT
- `hashPassword(password)` - bcrypt
- `comparePassword(password, hash)` - bcrypt
- `authenticateUser(email, password)` - Cherche user + vérifie password

### Step 2: Créer `auth.controller.js`

**register**
```
1. Valider input (createUserSchema)
2. Vérifier si email existe
3. Hash password
4. Créer user
5. Créer subscription FREE par défaut
6. Générer tokens
7. Return user + tokens
```

**login**
```
1. Valider input
2. Chercher user par email
3. Vérifier password
4. Créer refresh token DB
5. Générer access token + refresh token
6. Return user + tokens
```

**logout**
```
1. Récupérer token depuis header
2. Révoquer le token
3. Return success
```

**refreshToken**
```
1. Récupérer refresh token depuis body/cookie
2. Vérifier token (service)
3. Vérifier token en DB
4. Générer nouveau access token
5. Return new access token
```

**getMe**
```
1. req.user vient du middleware
2. Return user profile
```

### Step 3: Créer `user.controller.js`

**getUserProfile**
```
1. Chercher user par ID
2. Retourner toJSON()
```

**updateUserProfile**
```
1. Valider input
2. Mettre à jour user
3. Return updated user
```

**changePassword**
```
1. Valider input
2. Vérifier ancien password
3. Hash nouveau password
4. Mettre à jour
5. Révoquer tous les tokens (force re-login)
6. Return success
```

**deactivateAccount**
```
1. Soft delete user (status: inactive, deletedAt: now)
2. Révoquer tous les tokens
3. Return success
```

### Step 4: Créer `billing.controller.js`

**getPlans**
```
1. Appeler billingService.getActivePlans()
2. Return plans
```

**getSubscription**
```
1. Appeler billingService.getUserActiveSubscription(userId)
2. Return subscription or null
```

**getUsage**
```
1. Chercher subscription active
2. Appeler billingService.getUserCurrentMonthUsage()
3. Return usage
```

**createCheckoutSession** (Stripe - prochaine phase)
```
1. Chercher plan par ID (param)
2. Créer session Stripe
3. Return session URL
```

**createCustomerPortalSession** (Stripe - prochaine phase)
```
1. Chercher subscription
2. Créer session Stripe Customer Portal
3. Return session URL
```

### Step 5: Créer `webhook.controller.js` (Stripe - prochaine phase)

```
1. Vérifier signature Stripe
2. Router selon event.type
3. Mettre à jour subscription/payment en DB
```

### Step 6: Créer middleware `errorHandler.js` (mieux que dans app.js)

```javascript
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors || undefined
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};
```

### Step 7: Créer middleware `validateRequest.js`

```javascript
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req.validatedData = data;
      next();
    } catch (error) {
      throw new ApiError(400, 'Validation failed', error.errors);
    }
  };
};

// Utilisation:
// router.post('/register', validateRequest(createUserSchema), authController.register);
```

## Ordre d'Implémentation

1. ✅ Phase 3 - Models & Services (DONE)
2. 📋 Phase 4a - Auth Service & Middleware JWT
3. 📋 Phase 4b - Auth Controllers & Routes
4. 📋 Phase 4c - User Controllers & Routes
5. 📋 Phase 4d - Billing Controllers & Routes
6. 📋 Phase 4e - Error Handler & Validation Middleware
7. 📋 Phase 4f - Intégration complète dans app.js
8. 📋 Phase 5 - Tests E2E
9. 📋 Phase 6 - Frontend Integration

## Checklist

- [ ] auth.service.js créé
- [ ] auth.controller.js créé
- [ ] auth.routes.js créé
- [ ] user.controller.js créé
- [ ] users.routes.js créé
- [ ] billing.controller.js créé
- [ ] billing.routes.js créé
- [ ] webhook.controller.js créé (placeholder)
- [ ] webhooks.routes.js créé
- [ ] errorHandler.js créé
- [ ] validateRequest.js créé
- [ ] app.js intégré
- [ ] Tests E2E passants
- [ ] Documentation mise à jour
- [ ] PR créée et mergée

## Notes

- Les controllers utilisent le pattern `catchAsync` pour la gestion d'erreurs
- Les validations utilisent Zod
- Les services fournissent la logique métier
- Les middlewares protègent les routes
- Les routes exposent l'API
- Stripe webhook: À faire APRÈS avoir un endpoint
