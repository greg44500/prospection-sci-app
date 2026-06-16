# Instructions pour Codex

## 1. Rôle de Codex

Tu travailles sur une application SaaS professionnelle de prospection immobilière orientée SCI.

Tu dois agir comme un développeur full-stack senior spécialisé en :

* React ;
* Vite ;
* TypeScript ;
* Tailwind CSS ;
* shadcn/ui ;
* Node.js ;
* Express ;
* MongoDB ;
* Mongoose ;
* authentification sécurisée ;
* SaaS billing ;
* architecture maintenable ;
* conformité RGPD ;
* APIs publiques françaises.

Le projet doit être conçu pour être commercialisable. Il ne doit pas être traité comme un simple prototype.

---

## 2. Objectif produit

Créer une application permettant à un conseiller immobilier de :

* créer un compte ;
* se connecter par email/mot de passe ;
* se connecter avec Google OAuth ;
* gérer son profil utilisateur ;
* consulter un dashboard métier ;
* lancer des recherches de SCI ;
* sauvegarder des prospects ;
* qualifier des prospects ;
* scorer des prospects ;
* suivre des actions commerciales ;
* gérer les oppositions RGPD ;
* exporter des prospects selon les limites de son plan ;
* gérer son abonnement ;
* consulter son plan et son usage.

---

## 3. Stack obligatoire

### Frontend

Utiliser obligatoirement :

* React ;
* Vite ;
* TypeScript ;
* Tailwind CSS ;
* shadcn/ui ;
* React Router ;
* TanStack Query ou Redux Toolkit Query ;
* React Hook Form ;
* Zod ;
* Recharts ;
* Lucide React ;
* Sonner.

Interdiction d’utiliser :

* Bootstrap ;
* Material UI ;
* Ant Design ;
* Chakra UI ;
* styled-components ;
* CSS non structuré ;
* UI kit non demandé.

Le design doit être construit avec Tailwind CSS et shadcn/ui.

### Backend

Utiliser :

* Node.js ;
* Express ;
* MongoDB ;
* Mongoose ;
* Zod ou Joi ;
* JWT ;
* refresh token rotation ;
* bcrypt ou argon2 ;
* Helmet ;
* CORS ;
* rate limiting ;
* dotenv ;
* Stripe ;
* Google OAuth côté backend ;
* gestion centralisée des erreurs ;
* utilitaire maison `catchAsync.js`.

Ne pas utiliser `express-async-handler`.

---

## 4. Architecture attendue

### Racine

```txt
prospection-sci-app/
  README.md
  AGENTS.md
  docs/
    cahier-des-charges.md
  backend/
  frontend/
  .gitignore
```

### Backend

```txt
backend/
  src/
    app.js
    server.js

    config/
      env.js
      database.js
      passport.js
      stripe.js

    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.validation.js

      users/
        user.model.js
        user.routes.js
        user.controller.js
        user.service.js
        user.validation.js

      billing/
        plan.model.js
        subscription.model.js
        usageCounter.model.js
        billing.routes.js
        billing.controller.js
        billing.service.js
        stripeWebhook.controller.js

      prospects/
        prospectCompany.model.js
        prospect.routes.js
        prospect.controller.js
        prospect.service.js
        prospect.validation.js

      officers/
        companyOfficer.model.js
        officer.service.js

      searches/
        searchRun.model.js
        search.routes.js
        search.controller.js
        search.service.js
        search.validation.js

      actions/
        prospectAction.model.js
        action.routes.js
        action.controller.js
        action.service.js

      signals/
        prospectSignal.model.js
        signal.service.js

      dashboard/
        dashboard.routes.js
        dashboard.controller.js
        dashboard.service.js

      external/
        apiRechercheEntreprises.client.js
        apiGeo.client.js
        apiSirene.client.js
        apiBodacc.client.js

      scoring/
        scoring.service.js

      rgpd/
        rgpd.service.js

    middlewares/
      authMiddleware.js
      requirePlan.js
      requireUsageLimit.js
      errorHandler.js
      validateRequest.js
      rateLimiter.js

    utils/
      catchAsync.js
      ApiError.js
      date.utils.js
      normalize.utils.js
      csvExport.js
      logger.js
```

### Frontend

```txt
frontend/
  src/
    main.tsx
    App.tsx

    app/
      router.tsx
      queryClient.ts
      providers.tsx

    components/
      ui/
      layout/
      dashboard/
      prospects/
      search/
      billing/
      profile/

    pages/
      public/
        LandingPage.tsx
        LoginPage.tsx
        RegisterPage.tsx
        ForgotPasswordPage.tsx
        ResetPasswordPage.tsx

      private/
        DashboardPage.tsx
        SearchPage.tsx
        SearchRunsPage.tsx
        ProspectsPage.tsx
        ProspectDetailPage.tsx
        ActionsPage.tsx
        BillingPage.tsx
        ProfilePage.tsx
        SettingsPage.tsx
        RgpdPage.tsx

    features/
      auth/
      users/
      billing/
      searches/
      prospects/
      dashboard/

    lib/
      api.ts
      auth.ts
      utils.ts
      constants.ts

    styles/
      globals.css
```

---

## 5. Règles de sécurité

Respecter strictement les règles suivantes :

* ne jamais versionner `.env` ;
* ne jamais créer de secret réel ;
* créer uniquement `.env.example` ;
* ne jamais exposer `STRIPE_SECRET_KEY` côté frontend ;
* ne jamais exposer `GOOGLE_CLIENT_SECRET` côté frontend ;
* ne jamais exposer `INSEE_API_KEY` côté frontend ;
* hasher les mots de passe ;
* ne jamais stocker de mot de passe en clair ;
* protéger toutes les routes privées ;
* vérifier l’utilisateur propriétaire des données ;
* empêcher un utilisateur d’accéder aux prospects d’un autre utilisateur ;
* valider toutes les entrées utilisateur ;
* gérer les erreurs proprement ;
* prévoir le rate limiting ;
* prévoir les rôles utilisateur.

---

## 6. Variables d’environnement

Créer les fichiers suivants :

```txt
backend/.env.example
frontend/.env.example
```

Ne jamais créer :

```txt
.env
.env.local
.env.production
```

### Backend `.env.example`

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=

APP_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_BUSINESS_MONTHLY=

API_RECHERCHE_ENTREPRISES_BASE_URL=https://recherche-entreprises.api.gouv.fr
API_GEO_BASE_URL=https://geo.api.gouv.fr
API_SIRENE_BASE_URL=https://api.insee.fr/api-sirene/3.11
INSEE_API_KEY=

USER_AGENT=prospection-sci-app/1.0 contact@example.com

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Prospection SCI App
```

---

## 7. Authentification attendue

Implémenter une architecture permettant :

* inscription email/mot de passe ;
* connexion email/mot de passe ;
* connexion Google OAuth ;
* refresh token rotation ;
* logout ;
* récupération utilisateur courant ;
* protection des routes privées ;
* réinitialisation de mot de passe ;
* vérification email ultérieure si nécessaire.

Modèles nécessaires :

* `User` ;
* `RefreshToken` ou mécanisme équivalent ;
* éventuel `PasswordResetToken` ;
* éventuel `EmailVerificationToken`.

Règles :

* un utilisateur peut avoir plusieurs providers ;
* Google OAuth ne doit pas écraser un compte existant sans contrôle ;
* si un email existe déjà, prévoir une logique de liaison sécurisée ;
* le frontend ne doit jamais gérer directement le secret Google.

---

## 8. SaaS, plans et abonnements

L’application doit être construite pour gérer des plans.

Créer les modèles :

* `Plan` ;
* `Subscription` ;
* `UsageCounter`.

Prévoir Stripe pour :

* Checkout Session ;
* Customer Portal ;
* webhooks ;
* mise à jour du statut d’abonnement ;
* changement de plan ;
* annulation ;
* synchronisation de la période d’abonnement ;
* blocage des fonctionnalités selon le plan.

Endpoints attendus :

```txt
GET /api/plans
GET /api/subscription/me
POST /api/billing/create-checkout-session
POST /api/billing/create-customer-portal-session
POST /api/webhooks/stripe
```

Les webhooks Stripe doivent être vérifiés avec la signature Stripe. Ne pas traiter un webhook non vérifié.

---

## 9. Limites d’usage par plan

Prévoir un middleware :

```txt
requirePlan
requireUsageLimit
```

Les limites doivent pouvoir porter sur :

* recherches mensuelles ;
* prospects importés mensuellement ;
* prospects sauvegardés ;
* exports CSV ;
* enrichissements ;
* accès aux dashboards avancés ;
* accès aux signaux ;
* nombre de membres d’équipe futur.

Le code doit être extensible.

Ne pas hardcoder définitivement les limites dans les controllers. Les limites doivent venir du modèle `Plan` ou d’une configuration centralisée.

---

## 10. APIs externes à intégrer

### 10.1 API Recherche d’Entreprises

Base URL :

```txt
https://recherche-entreprises.api.gouv.fr
```

Endpoint :

```txt
GET /search
```

Paramètres utiles :

```txt
q
code_postal
code_commune
departement
region
epci
activite_principale
section_activite_principale
nature_juridique
etat_administratif
nom_personne
prenoms_personne
type_personne
minimal
include
page
per_page
limite_matching_etablissements
```

Requête de référence :

```txt
GET https://recherche-entreprises.api.gouv.fr/search?q=SCI&code_postal=44500&code_commune=44055&etat_administratif=A&section_activite_principale=L&minimal=true&include=dirigeants,siege,matching_etablissements&page=1&per_page=25
```

### 10.2 API Découpage administratif

Base URL :

```txt
https://geo.api.gouv.fr
```

Endpoint :

```txt
GET /communes
```

Requête de référence :

```txt
GET https://geo.api.gouv.fr/communes?codePostal=44500&fields=nom,code,codesPostaux,centre,departement,region&format=json
```

### 10.3 API Sirene INSEE

Base URL :

```txt
https://api.insee.fr/api-sirene/3.11
```

Endpoints prévus :

```txt
GET /siren
GET /siren/{siren}
GET /siret
GET /siret/{siret}
GET /informations
```

Utiliser uniquement côté backend.

### 10.4 API BODACC

Prévoir un client séparé, mais ne pas bloquer la V1 dessus.

---

## 11. Recherche SCI

Endpoint interne :

```txt
POST /api/searches/sci
```

Body attendu :

```json
{
  "cityName": "La Baule-Escoublac",
  "postalCode": "44500",
  "cityCode": "44055",
  "maxAgeYears": 8,
  "activitySection": "L",
  "administrativeStatus": "A",
  "query": "SCI"
}
```

Le service doit :

1. valider le body ;
2. vérifier la commune avec l’API Découpage administratif ;
3. interroger l’API Recherche d’Entreprises ;
4. gérer la pagination ;
5. filtrer les entreprises actives ;
6. filtrer les SCI candidates ;
7. filtrer les sociétés de moins de `maxAgeYears` ;
8. extraire les dirigeants disponibles ;
9. ne jamais inventer les données manquantes ;
10. calculer un score ;
11. sauvegarder en MongoDB ;
12. rattacher les prospects à l’utilisateur connecté ;
13. créer un `SearchRun` ;
14. incrémenter le compteur d’usage.

---

## 12. Règles métier SCI

Une entreprise est une SCI confirmée si :

* sa dénomination contient clairement `SCI` ;
* ou sa forme juridique indique une société civile immobilière ;
* et son activité ou sa section d’activité est compatible avec l’immobilier ;
* et elle est active ;
* et elle est dans la zone demandée.

Statuts de qualification :

```txt
confirmed
to_verify
excluded
```

Ne pas confondre :

```txt
dirigeant
gérant
associé
bénéficiaire effectif
```

Les associés et bénéficiaires effectifs ne doivent pas être générés automatiquement si la source ne les fournit pas explicitement.

---

## 13. Scoring

Créer un service dédié :

```txt
scoring.service.js
```

Score initial recommandé :

```txt
SCI confirmée : +25
SCI à vérifier : +10
Entreprise active : +15
Commune cible exacte : +20
Moins de 8 ans : +15
Gérant identifié : +10
Activité immobilière section L : +10
Signal récent : +10
Donnée incomplète : -10
Opposition RGPD : score forcé à 0
```

Le score doit être explicable.

Chaque prospect doit avoir :

```js
score: Number
scoreDetails: Object
```

---

## 14. RGPD

Chaque prospect doit avoir un bloc RGPD :

```js
rgpd: {
  sourceRecorded: Boolean,
  collectionDate: Date,
  purpose: String,
  lawfulBasis: String,
  oppositionStatus: "none" | "opposed" | "unknown",
  lastOppositionDate: Date,
  retentionUntil: Date
}
```

Règles strictes :

* un prospect opposé ne peut pas être exporté ;
* un prospect opposé ne peut pas être recontacté ;
* l’opposition doit être historisée ;
* les sources doivent être conservées ;
* la date de collecte doit être conservée ;
* les exports doivent exclure automatiquement les oppositions ;
* les données personnelles ne doivent pas être enrichies sans base claire.

---

## 15. Dashboard utilisateur

Créer des endpoints dashboard :

```txt
GET /api/dashboard/overview
GET /api/dashboard/prospects-by-status
GET /api/dashboard/prospects-by-city
GET /api/dashboard/usage
GET /api/dashboard/actions
```

KPIs attendus :

* total prospects ;
* prospects qualifiés ;
* prospects à vérifier ;
* prospects contactés ;
* prospects intéressés ;
* prospects opposés ;
* score moyen ;
* recherches du mois ;
* quota de recherches utilisé ;
* quota de prospects importés utilisé ;
* actions prévues ;
* actions en retard ;
* taux de qualification ;
* taux d’intérêt ;
* répartition par statut ;
* répartition par commune.

Le dashboard frontend doit utiliser :

* cards shadcn/ui ;
* tables shadcn/ui ;
* badges shadcn/ui ;
* graphiques Recharts ;
* Tailwind CSS.

---

## 16. Frontend : règles UI strictes

Créer une interface SaaS professionnelle.

Pages publiques :

```txt
/
/login
/register
/forgot-password
/reset-password
```

Pages privées :

```txt
/dashboard
/search
/search-runs
/prospects
/prospects/:id
/actions
/billing
/profile
/settings
/rgpd
```

Layout privé :

* sidebar ;
* topbar ;
* contenu principal ;
* menu utilisateur ;
* bouton logout ;
* affichage plan actuel ;
* indicateur d’usage ;
* navigation claire.

Utiliser les composants shadcn/ui dès que possible.

Composants prioritaires :

* Button ;
* Card ;
* Badge ;
* Table ;
* Input ;
* Form ;
* Select ;
* Dialog ;
* Sheet ;
* DropdownMenu ;
* Tabs ;
* Alert ;
* Skeleton ;
* Progress ;
* Separator.

---

## 17. Endpoints internes complets

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/me
```

### Users

```txt
GET /api/users/me
PATCH /api/users/me
PATCH /api/users/me/password
DELETE /api/users/me
```

### Billing

```txt
GET /api/plans
GET /api/subscription/me
POST /api/billing/create-checkout-session
POST /api/billing/create-customer-portal-session
POST /api/webhooks/stripe
```

### Searches

```txt
POST /api/searches/sci
POST /api/searches/sci/near-point
GET /api/searches
GET /api/searches/:id
```

### Prospects

```txt
GET /api/prospects
GET /api/prospects/:id
PATCH /api/prospects/:id
DELETE /api/prospects/:id
POST /api/prospects/:id/enrich/sirene
POST /api/prospects/:id/sync/bodacc
POST /api/prospects/:id/opposition
GET /api/prospects/export.csv
```

### Actions

```txt
GET /api/prospects/:id/actions
POST /api/prospects/:id/actions
PATCH /api/actions/:id
DELETE /api/actions/:id
```

### Dashboard

```txt
GET /api/dashboard/overview
GET /api/dashboard/prospects-by-status
GET /api/dashboard/prospects-by-city
GET /api/dashboard/usage
GET /api/dashboard/actions
```

---

## 18. Tests attendus

Écrire des tests pour :

* validation auth ;
* hash de mot de passe ;
* refresh token ;
* limites d’usage ;
* filtrage SCI ;
* calcul moins de 8 ans ;
* scoring ;
* exclusion RGPD ;
* export sans prospects opposés ;
* pagination API externe ;
* gestion des erreurs 429 ;
* accès interdit aux données d’un autre utilisateur.

---

## 19. Branches et commits

Ne pas tout faire dans une seule PR.

Branches recommandées :

```txt
feature/project-setup
feature/backend-initial-setup
feature/auth-local
feature/auth-google
feature/billing-models
feature/stripe-subscriptions
feature/external-api-clients
feature/sci-search
feature/prospect-crm
feature/dashboard
feature/frontend-shell
feature/frontend-auth
feature/frontend-dashboard
feature/frontend-prospects
feature/rgpd-controls
```

Commits recommandés :

```txt
chore: initialize repository
docs: add product and technical specifications
feat: initialize backend architecture
feat: add user auth models
feat: add local authentication
feat: add google oauth authentication
feat: add subscription models
feat: add stripe billing service
feat: add external enterprise api client
feat: add sci search endpoint
feat: add prospect crm models
feat: add dashboard endpoints
feat: initialize frontend with vite tailwind and shadcn
feat: add private app layout
feat: add user dashboard
feat: add prospect table
feat: add rgpd opposition controls
test: add sci filtering tests
test: add usage limit tests
```

---

## 20. Première tâche à exécuter

Commencer par :

```txt
Créer la structure initiale du repo, backend et frontend, sans implémenter toutes les fonctionnalités.

Objectif :
- initialiser backend Express ;
- initialiser frontend Vite React TypeScript ;
- configurer Tailwind CSS ;
- configurer shadcn/ui ;
- créer .env.example backend et frontend ;
- créer app.js et server.js ;
- créer database.js ;
- créer catchAsync.js ;
- créer errorHandler.js ;
- créer un endpoint GET /api/health ;
- créer un layout frontend minimal ;
- ne pas créer .env ;
- ne pas créer de secrets ;
- ouvrir une PR nommée feature/project-setup.
```

---

## 21. Règles absolues

* Ne jamais inventer de données.
* Ne jamais exposer de secrets.
* Ne jamais versionner `.env`.
* Ne jamais utiliser une UI autre que Tailwind CSS et shadcn/ui.
* Ne jamais confondre SCI, dirigeant, associé et bénéficiaire effectif.
* Ne jamais exporter un prospect opposé.
* Ne jamais permettre à un utilisateur de voir les données d’un autre utilisateur.
* Ne jamais hardcoder les limites commerciales dans les controllers.
* Ne jamais traiter un webhook Stripe non vérifié.
* Ne jamais exposer les secrets Google OAuth côté frontend.
* Toujours rattacher les données à un utilisateur.
* Toujours conserver la source et la date de collecte.
* Toujours écrire un code modulaire, testable et maintenable.
