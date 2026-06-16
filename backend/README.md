# Prospection SCI App - Backend

Backend Express.js pour l'application SaaS de prospection immobilière.

## Structure

```
src/
  ├── app.js                 # Configuration Express
  ├── server.js              # Point d'entrée
  ├── config/
  │   ├── env.js             # Gestion des variables d'environnement
  │   └── database.js        # Configuration MongoDB
  ├── routes/
  │   └── health.routes.js   # Endpoint de santé
  ├── middlewares/
  │   ├── errorHandler.js    # Gestion centralisée des erreurs
  │   └── rateLimiter.js     # Rate limiting
  └── utils/
      ├── catchAsync.js      # Wrapper pour async/await
      ├── ApiError.js        # Classe d'erreur personnalisée
      ├── date.utils.js      # Utilitaires de dates
      ├── normalize.utils.js # Utilitaires de normalisation
      └── logger.js          # Logger simple
```


```bash
npm run dev              # Démarrer mode dev (nodemon)
npm start                # Démarrer production
npm test                 # Tests (À faire)
npm run lint             # ESLint (À faire)
npm run seed:plans       # Seeder plans (À faire)
node test-models.js      # Valider models
```

## 📊 Architecture

### Couches

```
Routes (HTTP)
  ↓
Controllers (Request handling)
  ↓
Validation (Zod)
  ↓
Services (Business logic)
  ↓
Models (Mongoose)
  ↓
MongoDB (Data persistence)
```

### Modèles de Données

#### Users
- **User** - Compte utilisateur (email/password + OAuth)
- **RefreshToken** - Token rotation (TTL auto-cleanup)

#### Billing
- **Plan** - Templates d'abonnement (Free/Starter/Pro/Business)
- **Subscription** - Abonnements utilisateurs (Stripe-ready)
- **UsageCounter** - Tracking mensuel (searches, exports, etc.)

## 🔐 Sécurité

✅ **Implemented**
- Password hashing avec bcrypt (placeholder)
- JWT access tokens (15m expiry)
- Refresh token rotation (7d expiry)
- Email verification tokens
- Password reset tokens
- Usage limits per plan
- Role-based access control (admin, user, team_member)
- Soft delete (GDPR-compliant)
- Audit trail (lastLoginAt, createdAt, etc.)

⏳ **À faire**
- HTTPS enforcement
- CORS configuration
- Rate limiting per endpoint
- Request validation middleware
- Error handler middleware
- Stripe webhook verification
- Google OAuth

## 📈 Gestion de l'Usage

Chaque utilisateur a une limite par plan:

```
Free:      5 searches/month
Starter:   50 searches/month
Pro:       500 searches/month
Business:  ∞ searches/month
```

Autres métriques:
- prospects_imported
- prospects_saved
- csv_exports
- enrichments
- advanced_dashboard
- signals
- team_members

## 🧪 Tests

### Valider les models

```bash
node test-models.js
```

Output attendu:
```
✓ Users module loaded
✓ Billing module loaded
✓ User validations: 5 schemas
✓ Billing validations: 6 schemas
✓ User service: 12 functions
✓ Billing service: 14 functions
✓ Auth middleware: 5 functions
✓ Usage limit middleware: 4 functions
✓ Constants loaded: 9 items
✓ All models, services, and middleware loaded successfully!
```

### Tests E2E (À faire)

```bash
npm test -- auth.e2e.test.js
npm test -- billing.e2e.test.js
npm test -- users.e2e.test.js
```

## 📚 Documentation

- `MODELS_DOCUMENTATION.md` - Détail des modèles
- `PHASE_3_SUMMARY.md` - Ce qui a été fait
- `PHASE_4_PLAN.md` - Prochaines étapes
- `AGENTS.md` (racine) - Specs produit complètes

## 🚦 Endpoints (À faire - Phase 4)

### Auth
```
POST   /api/auth/register           # Inscription
POST   /api/auth/login              # Connexion
POST   /api/auth/logout             # Déconnexion
POST   /api/auth/refresh-token      # Nouveau access token
GET    /api/auth/me                 # Profil actuel
POST   /api/auth/forgot-password    # Demander reset
POST   /api/auth/reset-password     # Reset avec token
GET    /api/auth/google             # OAuth Google
GET    /api/auth/google/callback    # Callback Google
```

### Users
```
GET    /api/users/me                # Profil utilisateur
PATCH  /api/users/me                # Mise à jour profil
PATCH  /api/users/me/password       # Changer mot de passe
DELETE /api/users/me                # Désactiver compte
```

### Billing
```
GET    /api/plans                   # Tous les plans
GET    /api/subscription/me         # Abonnement actif
POST   /api/billing/create-checkout-session        # Stripe checkout
POST   /api/billing/create-customer-portal-session # Stripe portal
GET    /api/usage/me                # Usage du mois
```

### Webhooks
```
POST   /api/webhooks/stripe         # Stripe webhooks
```

## 🐛 Troubleshooting

### "Cannot find module"
Vérifier les imports relatifs. Les constantes sont dans `src/constants`, pas `src/modules/constants`.

### "MongoDB connection failed"
1. Vérifier MongoDB est lancé (local) ou la connexion Atlas est valide
2. Vérifier `MONGODB_URI` dans `.env`
3. Vérifier firewall pour port 27017

### "JWT error"
1. Vérifier `JWT_SECRET` dans `.env`
2. Vérifier token n'a pas expiré (15m)
3. Vérifier format du header: `Authorization: Bearer <token>`

## 📈 Prochaines Étapes

### Phase 4: Controllers & Routes
- [ ] Auth service (JWT + password hashing)
- [ ] Auth controllers & routes
- [ ] User controllers & routes
- [ ] Billing controllers & routes
- [ ] Error handler middleware
- [ ] Validation middleware

### Phase 5: Advanced Features
- [ ] Stripe integration
- [ ] Google OAuth
- [ ] Email verification
- [ ] Password reset
- [ ] Prospects CRUD
- [ ] Search API

### Phase 6: Frontend Integration
- [ ] CORS setup
- [ ] Frontend auth flow
- [ ] Dashboard pages
- [ ] Prospect management
- [ ] Billing pages

## 📦 Dépendances Principales

```json
{
  "express": "5.2.1",
  "mongoose": "9.7.0",
  "zod": "4.4.3",
  "jsonwebtoken": "9.0.3",
  "bcrypt": "6.0.0",
  "helmet": "8.2.0",
  "cors": "2.8.5",
  "dotenv": "16.4.7",
  "express-rate-limit": "8.5.2"
}
```

## 💡 Tips

- Toujours utiliser `catchAsync` pour les controllers
- Les services lancent `ApiError`, les controllers attrapent avec catch
- Les validations utilisent Zod, pas d'autres libs
- Les middlewares ne modifient que `req`, retournent via `next()`
- Les modèles utilisent Mongoose, jamais du SQL
- Les secrets JAMAIS en git, utiliser `.env.example`

## 📞 Support

Pour des questions:
1. Consulter la documentation dans `docs/`
2. Vérifier les exemples d'usage dans les fichiers
3. Valider avec `node test-models.js`
4. Vérifier les logs dans console

## 📝 License

MIT

---

**Last updated:** Phase 3 Complete
**Next phase:** Phase 4 - Controllers & Routes
**Status:** Development
## Scripts

- `npm start` - Lancer le serveur en production
- `npm run dev` - Lancer le serveur en mode développement avec auto-reload
- `npm test` - Lancer les tests
- `npm run test:watch` - Lancer les tests en mode watch
- `npm run lint` - Vérifier et corriger le style de code
- `npm run format` - Formater le code avec Prettier
- `npm run validate` - Linter + tests

## Endpoints

### Health Check
- `GET /api/health` - Vérifier l'état de l'API et de la base de données

Réponse (OK):
```json
{
  "success": true,
  "timestamp": "2026-06-16T10:30:00.000Z",
  "uptime": 123.456,
  "status": "healthy",
  "checks": {
    "api": {
      "status": "ok",
      "timestamp": "2026-06-16T10:30:00.000Z"
    },
    "database": {
      "status": "connected",
      "timestamp": "2026-06-16T10:30:00.000Z"
    }
  }
}
```

Réponse (Base de données déconnectée):
```json
{
  "success": true,
  "timestamp": "2026-06-16T10:30:00.000Z",
  "uptime": 123.456,
  "status": "degraded",
  "checks": {
    "api": {
      "status": "ok",
      "timestamp": "2026-06-16T10:30:00.000Z"
    },
    "database": {
      "status": "disconnected",
      "timestamp": "2026-06-16T10:30:00.000Z"
    }
  }
}
```

## Gestion des Erreurs

Les erreurs sont gérées de manière centralisée via le middleware `errorHandler`. 

Format de réponse d'erreur:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Rate Limiting

- API générale: 100 requêtes par 15 minutes
- Auth: 5 tentatives par 15 minutes
- Opérations: 30 par minute

## Notes

- Pas de `.env` réel dans le repository (voir `.gitignore`)
- Tous les secrets doivent être configurés dans `.env` local
- MongoDB obligatoire pour le fonctionnement complet
- JWT secret et Refresh token secret nécessaires pour l'auth
