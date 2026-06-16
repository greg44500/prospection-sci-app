# Prospection SCI App

Application SaaS de prospection immobilière orientée SCI, destinée aux conseillers immobiliers, agents commerciaux, mandataires, agences ou réseaux immobiliers souhaitant identifier, qualifier, scorer et suivre des prospects immobiliers à partir de données publiques françaises.

## 1. Objectif du projet

L’objectif est de créer une application web commercialisable permettant de :

- rechercher des SCI dans une zone géographique précise ;
- filtrer les SCI actives selon leur ancienneté, leur commune, leur activité et leur statut administratif ;
- identifier les dirigeants ou gérants disponibles dans les sources publiques ;
- qualifier les prospects selon des critères métier immobiliers ;
- scorer les prospects selon leur potentiel commercial ;
- suivre les actions commerciales dans un mini-CRM ;
- afficher des KPIs utiles dans un dashboard utilisateur ;
- gérer plusieurs utilisateurs avec authentification ;
- gérer des plans d’abonnement et des limites d’usage ;
- respecter les règles de traçabilité, de conformité RGPD et d’opposition à la prospection.

Cas d’usage initial :

> Identifier les SCI actives de moins de 8 ans à La Baule-Escoublac, code postal 44500, code commune INSEE 44055, afin de créer une base de prospection immobilière qualifiée.

---

## 2. Positionnement produit

L’application doit être pensée comme une vraie application SaaS professionnelle, et non comme un simple MVP.

Elle doit être conçue pour pouvoir évoluer vers :

- un produit commercialisé par abonnement ;
- une gestion multi-utilisateur ;
- une gestion future d’équipes ou d’organisations ;
- des limites par plan ;
- un dashboard métier ;
- un suivi d’usage ;
- des intégrations futures ;
- une architecture maintenable et sécurisée.

---

## 3. Utilisateurs cibles

L’application s’adresse principalement à :

- conseillers immobiliers indépendants ;
- mandataires immobiliers ;
- agences immobilières ;
- chasseurs immobiliers ;
- réseaux de conseillers ;
- professionnels de l’investissement immobilier ;
- professionnels souhaitant cibler des SCI, bailleurs, investisseurs ou structures patrimoniales.

---

## 4. Fonctionnalités principales

### 4.1 Authentification

L’application doit permettre :

- création de compte par email et mot de passe ;
- connexion par email et mot de passe ;
- connexion via Google OAuth ;
- déconnexion ;
- réinitialisation de mot de passe ;
- vérification d’email si nécessaire ;
- gestion des sessions ;
- protection des routes privées ;
- rotation des refresh tokens ;
- stockage sécurisé des mots de passe avec hash ;
- blocage des comptes désactivés ou suspendus.

### 4.2 Profil utilisateur

Chaque utilisateur doit pouvoir gérer :

- prénom ;
- nom ;
- email ;
- photo de profil ;
- téléphone professionnel facultatif ;
- nom commercial ou agence ;
- ville principale ;
- zone de prospection principale ;
- préférences d’affichage ;
- préférences de notifications ;
- plan actuel ;
- statut d’abonnement ;
- historique d’usage.

### 4.3 Plans et abonnements

L’application doit prévoir une logique de plans commercialisables.

Plans indicatifs :

#### Free

- nombre limité de recherches mensuelles ;
- nombre limité de prospects sauvegardés ;
- accès aux fonctionnalités de base ;
- export CSV désactivé ou limité ;
- dashboard simple.

#### Starter

- recherches mensuelles supérieures ;
- sauvegarde de prospects ;
- scoring ;
- export CSV limité ;
- historique des recherches ;
- accès au dashboard complet.

#### Pro

- recherches avancées ;
- export CSV complet ;
- scoring avancé ;
- suivi CRM complet ;
- accès aux signaux ;
- accès à plus de filtres ;
- volume supérieur de prospects ;
- enrichissements supplémentaires.

#### Business

- usage équipe ou organisation ;
- quotas plus élevés ;
- gestion de plusieurs utilisateurs ;
- permissions ;
- reporting avancé ;
- support prioritaire ;
- options d’intégration.

Les limites d’usage doivent être configurables par plan :

- nombre de recherches par mois ;
- nombre de prospects importés par mois ;
- nombre de prospects sauvegardés ;
- nombre d’exports CSV ;
- accès aux enrichissements ;
- accès aux dashboards avancés ;
- accès aux fonctionnalités CRM avancées.

### 4.4 Prospection SCI

L’utilisateur doit pouvoir lancer une recherche à partir de critères comme :

- commune ;
- code postal ;
- code commune INSEE ;
- rayon géographique ;
- âge maximum de la SCI ;
- société active uniquement ;
- activité immobilière ;
- présence d’un dirigeant ;
- score minimum ;
- statut CRM ;
- date de collecte ;
- source utilisée.

Exemple de recherche initiale :

```txt
Recherche des SCI actives de moins de 8 ans à La Baule-Escoublac, 44500.
```

Filtres techniques initiaux :

```txt
q=SCI
code_postal=44500
code_commune=44055
etat_administratif=A
section_activite_principale=L
maxAgeYears=8
```

### 4.5 CRM de prospection

Chaque prospect doit pouvoir être suivi avec :

- statut ;
- score ;
- notes ;
- actions prévues ;
- historique ;
- source ;
- date de collecte ;
- dirigeant identifié ;
- opposition RGPD ;
- date du dernier contact ;
- prochaine relance ;
- qualification manuelle.

Statuts proposés :

```txt
new
to_review
qualified
contacted
interested
meeting_scheduled
not_relevant
opposed
archived
```

Types d’actions commerciales :

```txt
manual_review
email_draft
linkedin_research
letter_prepared
call_logged
meeting_scheduled
follow_up
do_not_contact
note
```

### 4.6 Dashboard utilisateur

L’utilisateur doit avoir un dashboard affichant les KPIs pertinents.

KPIs minimum :

- nombre total de prospects sauvegardés ;
- nombre de prospects qualifiés ;
- nombre de prospects à vérifier ;
- nombre de prospects contactés ;
- nombre de prospects intéressés ;
- nombre d’oppositions RGPD ;
- score moyen des prospects ;
- répartition des prospects par commune ;
- répartition des prospects par statut ;
- nombre de recherches réalisées ce mois-ci ;
- quota de recherches restant ;
- quota de prospects importables restant ;
- nombre d’actions commerciales prévues ;
- nombre d’actions en retard ;
- taux de qualification ;
- taux de transformation en prospect intéressé ;
- volume d’export CSV utilisé ;
- évolution mensuelle des prospects collectés.

### 4.7 Exports

L’application doit permettre l’export CSV des prospects selon le plan utilisateur.

Contraintes :

- ne jamais exporter les prospects avec opposition RGPD ;
- ne jamais exporter les données non disponibles ;
- afficher clairement la source de chaque donnée ;
- inclure la date de collecte ;
- inclure le statut de qualification ;
- inclure le score ;
- inclure les limites du fichier exporté.

### 4.8 Conformité RGPD

L’application doit intégrer dès le départ :

- source de la donnée ;
- endpoint utilisé ;
- date de collecte ;
- finalité de traitement ;
- statut d’opposition ;
- durée de conservation ;
- historique des actions ;
- blocage automatique des prospects opposés ;
- impossibilité d’exporter les prospects opposés ;
- distinction entre dirigeant, associé et bénéficiaire effectif ;
- mention explicite lorsqu’une donnée n’est pas disponible.

Si une donnée n’est pas fournie par la source, afficher :

```txt
Non disponible via cette source.
```

L’application ne doit jamais inventer d’associés, de gérants ou de bénéficiaires effectifs.

---

## 5. Stack technique

### 5.1 Frontend

Stack obligatoire :

- React ;
- Vite ;
- TypeScript recommandé ;
- Tailwind CSS obligatoire ;
- shadcn/ui obligatoire ;
- React Router ;
- TanStack Query ou Redux Toolkit Query ;
- React Hook Form ;
- Zod ;
- Recharts pour les graphiques ;
- Lucide React pour les icônes ;
- Sonner pour les notifications.

Le style doit obligatoirement être construit avec :

- Tailwind CSS ;
- shadcn/ui ;
- composants réutilisables ;
- design clair, professionnel, sobre ;
- interface responsive desktop et mobile ;
- dashboard orienté cartes KPI, tableaux, filtres et graphiques.

Ne pas utiliser :

- Bootstrap ;
- Material UI ;
- Ant Design ;
- CSS global non structuré ;
- composants visuels non cohérents avec shadcn/ui.

### 5.2 Backend

Stack recommandée :

- Node.js ;
- Express ;
- MongoDB ;
- Mongoose ;
- Zod ou Joi pour la validation ;
- JWT ;
- refresh token rotation ;
- bcrypt ou argon2 pour les mots de passe ;
- Helmet ;
- CORS configuré ;
- rate limiting ;
- cookie sécurisé si nécessaire ;
- gestion centralisée des erreurs ;
- logs applicatifs.

### 5.3 Paiement et abonnements

Prévoir l’intégration Stripe :

- création de client Stripe ;
- création de session Checkout ;
- gestion des abonnements ;
- webhooks Stripe ;
- synchronisation du statut d’abonnement ;
- gestion du Customer Portal ;
- annulation, changement de plan et mise à jour du moyen de paiement ;
- blocage ou limitation des fonctionnalités selon le plan.

### 5.4 Authentification Google

Prévoir Google OAuth pour :

- inscription ;
- connexion ;
- liaison éventuelle d’un compte Google à un compte existant ;
- récupération des informations minimales du profil ;
- gestion sécurisée des callbacks ;
- stockage des identifiants OAuth nécessaires ;
- aucune exposition du secret Google côté frontend.

---

## 6. APIs externes

### 6.1 API Recherche d’Entreprises

Base URL :

```txt
https://recherche-entreprises.api.gouv.fr
```

Endpoint principal :

```txt
GET /search
```

Exemple :

```txt
https://recherche-entreprises.api.gouv.fr/search?q=SCI&code_postal=44500&code_commune=44055&etat_administratif=A&section_activite_principale=L&page=1&per_page=25
```

Avec données additionnelles :

```txt
https://recherche-entreprises.api.gouv.fr/search?q=SCI&code_postal=44500&code_commune=44055&etat_administratif=A&section_activite_principale=L&minimal=true&include=dirigeants,siege,matching_etablissements&page=1&per_page=25
```

Endpoint géographique :

```txt
GET /near_point
```

Exemple :

```txt
https://recherche-entreprises.api.gouv.fr/near_point?lat=47.2867&long=-2.3908&radius=10&section_activite_principale=L&page=1&per_page=25
```

### 6.2 API Découpage administratif

Base URL :

```txt
https://geo.api.gouv.fr
```

Endpoint communes :

```txt
GET /communes
```

Exemple :

```txt
https://geo.api.gouv.fr/communes?codePostal=44500&fields=nom,code,codesPostaux,centre,departement,region&format=json
```

### 6.3 API Sirene INSEE

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

L’API Sirene nécessite une clé API INSEE côté backend.

### 6.4 API BODACC

À prévoir en enrichissement ultérieur pour détecter certains événements juridiques.

Objectif :

- modifications ;
- radiations ;
- créations ;
- procédures ;
- événements liés à une société.

---

## 7. Modèles de données principaux

### 7.1 User

```js
{
  email: String,
  passwordHash: String,
  authProviders: ["local", "google"],
  googleId: String,

  profile: {
    firstName: String,
    lastName: String,
    avatarUrl: String,
    phone: String,
    companyName: String,
    mainCity: String,
    mainProspectingArea: String
  },

  role: {
    type: String,
    enum: ["user", "admin", "super_admin"]
  },

  status: {
    type: String,
    enum: ["active", "inactive", "suspended"]
  },

  emailVerified: Boolean,
  lastLoginAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 7.2 Subscription

```js
{
  userId: ObjectId,
  planCode: String,
  status: String,

  stripeCustomerId: String,
  stripeSubscriptionId: String,
  stripePriceId: String,

  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

### 7.3 Plan

```js
{
  code: String,
  name: String,
  description: String,
  monthlyPrice: Number,
  yearlyPrice: Number,

  limits: {
    searchesPerMonth: Number,
    importedProspectsPerMonth: Number,
    savedProspectsTotal: Number,
    csvExportsPerMonth: Number,
    enrichmentsPerMonth: Number,
    teamMembers: Number
  },

  features: {
    dashboard: Boolean,
    advancedScoring: Boolean,
    csvExport: Boolean,
    crmActions: Boolean,
    bodaccSignals: Boolean,
    teamAccess: Boolean
  },

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 7.4 UsageCounter

```js
{
  userId: ObjectId,
  period: String,

  searchesUsed: Number,
  importedProspectsUsed: Number,
  csvExportsUsed: Number,
  enrichmentsUsed: Number,

  createdAt: Date,
  updatedAt: Date
}
```

### 7.5 ProspectCompany

```js
{
  ownerId: ObjectId,

  name: String,
  siren: String,
  siretSiege: String,

  legalFormCode: String,
  legalFormLabel: String,

  nafCode: String,
  nafLabel: String,
  activitySection: String,

  creationDate: Date,
  administrativeStatus: String,

  address: {
    raw: String,
    street: String,
    postalCode: String,
    city: String,
    cityCode: String,
    departmentCode: String,
    regionCode: String,
    latitude: Number,
    longitude: Number
  },

  isSciCandidate: Boolean,
  sciQualificationStatus: {
    type: String,
    enum: ["confirmed", "to_verify", "excluded"]
  },

  score: Number,
  scoreDetails: Object,

  crmStatus: {
    type: String,
    enum: [
      "new",
      "to_review",
      "qualified",
      "contacted",
      "interested",
      "meeting_scheduled",
      "not_relevant",
      "opposed",
      "archived"
    ]
  },

  dataSources: [
    {
      sourceName: String,
      endpoint: String,
      collectedAt: Date,
      rawPayloadRef: String
    }
  ],

  rgpd: {
    sourceRecorded: Boolean,
    collectionDate: Date,
    purpose: String,
    lawfulBasis: String,
    oppositionStatus: {
      type: String,
      enum: ["none", "opposed", "unknown"]
    },
    lastOppositionDate: Date,
    retentionUntil: Date
  },

  createdAt: Date,
  updatedAt: Date
}
```

### 7.6 CompanyOfficer

```js
{
  ownerId: ObjectId,
  prospectCompanyId: ObjectId,
  siren: String,

  type: {
    type: String,
    enum: ["personne_physique", "personne_morale", "unknown"]
  },

  firstName: String,
  lastName: String,
  role: String,

  companyName: String,
  companySiren: String,

  sourceName: String,
  sourceEndpoint: String,
  collectedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 7.7 ProspectAction

```js
{
  ownerId: ObjectId,
  prospectCompanyId: ObjectId,

  actionType: {
    type: String,
    enum: [
      "manual_review",
      "email_draft",
      "linkedin_research",
      "letter_prepared",
      "call_logged",
      "meeting_scheduled",
      "follow_up",
      "do_not_contact",
      "note"
    ]
  },

  status: {
    type: String,
    enum: ["planned", "done", "cancelled"]
  },

  title: String,
  content: String,
  dueDate: Date,
  completedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 7.8 SearchRun

```js
{
  ownerId: ObjectId,

  searchLabel: String,

  criteria: {
    q: String,
    postalCode: String,
    cityCode: String,
    cityName: String,
    radius: Number,
    minCreationDate: Date,
    maxAgeYears: Number,
    activitySection: String,
    administrativeStatus: String
  },

  source: String,
  endpoint: String,

  startedAt: Date,
  finishedAt: Date,

  rawResultsCount: Number,
  importedCount: Number,
  excludedCount: Number,

  status: {
    type: String,
    enum: ["pending", "running", "completed", "failed"]
  },

  error: String,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. Endpoints internes attendus

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

### Profil utilisateur

```txt
GET /api/users/me
PATCH /api/users/me
PATCH /api/users/me/password
DELETE /api/users/me
```

### Plans et abonnements

```txt
GET /api/plans
GET /api/subscription/me
POST /api/billing/create-checkout-session
POST /api/billing/create-customer-portal-session
POST /api/webhooks/stripe
```

### Recherche SCI

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

### Actions commerciales

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

## 9. Design frontend attendu

L’interface doit être moderne, sobre, professionnelle et cohérente.

### 9.1 Stack UI obligatoire

- Tailwind CSS ;
- shadcn/ui ;
- lucide-react ;
- sonner ;
- recharts ;
- composants réutilisables ;
- thème clair en priorité ;
- dark mode possible ultérieurement.

### 9.2 Pages principales

```txt
/
/login
/register
/auth/callback
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
/admin
```

### 9.3 Composants shadcn/ui à utiliser

- Button ;
- Card ;
- Badge ;
- Table ;
- Dialog ;
- Sheet ;
- Dropdown Menu ;
- Select ;
- Input ;
- Form ;
- Tabs ;
- Alert ;
- Toast ou Sonner ;
- Skeleton ;
- Progress ;
- Separator ;
- Calendar si nécessaire ;
- Data table avec tri, filtres et pagination.

### 9.4 Layout attendu

L’application privée doit utiliser :

- sidebar ;
- topbar ;
- zone centrale ;
- cartes KPI ;
- tableaux filtrables ;
- fiche détail ;
- formulaires en modales ou pages dédiées.

---

## 10. Variables d’environnement

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

Aucune clé secrète ne doit être présente dans le frontend.

---

## 11. Critères d’acceptation V1

La V1 est acceptable si :

1. un utilisateur peut créer un compte ;
2. un utilisateur peut se connecter par email/mot de passe ;
3. la structure permet la connexion Google OAuth ;
4. un utilisateur connecté peut consulter son profil ;
5. l’application gère au moins un plan gratuit ou de test ;
6. la structure prévoit Stripe Checkout et Customer Portal ;
7. l’utilisateur peut lancer une recherche SCI ;
8. la recherche SCI interroge l’API Recherche d’Entreprises ;
9. les résultats sont filtrés selon la zone, l’activité, l’état actif et l’ancienneté ;
10. les prospects sont sauvegardés en base MongoDB ;
11. les prospects sont rattachés à l’utilisateur ;
12. l’utilisateur voit un dashboard avec des KPIs ;
13. l’utilisateur peut consulter une fiche prospect ;
14. l’utilisateur peut créer une action commerciale ;
15. l’utilisateur peut marquer une opposition RGPD ;
16. les prospects opposés ne peuvent pas être exportés ;
17. l’interface utilise Tailwind CSS et shadcn/ui ;
18. les secrets ne sont jamais exposés côté frontend ;
19. `.env` n’est jamais versionné ;
20. `.env.example` est versionné.

---

## 12. Principes de développement

Le projet doit être développé par lots :

```txt
Lot 1 — Documentation et structure initiale
Lot 2 — Backend Express + MongoDB
Lot 3 — Auth email/mot de passe
Lot 4 — Google OAuth
Lot 5 — Modèles SaaS : plans, subscription, usage
Lot 6 — Stripe Checkout + webhooks
Lot 7 — API Recherche d’Entreprises
Lot 8 — Recherche SCI
Lot 9 — CRM prospects
Lot 10 — Dashboard KPIs
Lot 11 — Frontend Tailwind + shadcn/ui
Lot 12 — Profil utilisateur
Lot 13 — Billing UI
Lot 14 — RGPD et exports
Lot 15 — Tests et durcissement sécurité
```

Ne pas demander à Codex de tout générer en une seule tâche.

---

## 13. Commandes initiales prévues

Backend :

```bash
cd backend
npm install
npm run dev
npm test
```

Frontend :

```bash
cd frontend
npm install
npm run dev
npm test
```

---

## 14. Licence et commercialisation

Le projet est destiné à une commercialisation SaaS.

Prévoir ultérieurement :

- conditions générales d’utilisation ;
- politique de confidentialité ;
- page mentions légales ;
- gestion des abonnements ;
- facturation ;
- suppression de compte ;
- export des données utilisateur ;
- registre de traitement ;
- support client ;
- monitoring ;
- logs ;
- sauvegardes ;
- gestion des incidents.

---

## 15. Règles absolues du projet

- Ne jamais inventer de données.
- Ne jamais exposer de secrets.
- Ne jamais contacter automatiquement des prospects sans validation humaine.
- Ne jamais exporter un prospect opposé.
- Ne jamais confondre dirigeant, associé et bénéficiaire effectif.
- Ne jamais supposer qu’une donnée absente est vraie.
- Toujours conserver la source et la date de collecte.
- Toujours rattacher les données à l’utilisateur propriétaire.
- Toujours prévoir les limites par plan.
- Toujours concevoir l’application comme un SaaS professionnel.
