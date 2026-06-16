/**
 * Environment Configuration
 * Centralized environment variable management
 */

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // URLs
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  
  // Refresh Token
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || '',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  
  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  
  // Stripe
  stripe: {
    enabled: (process.env.STRIPE_ENABLED || 'false').toLowerCase() === 'true',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      starterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
      proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      businessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    },
  },
  
  // External APIs
  api: {
    rechercheEntreprises: {
      baseUrl: process.env.API_RECHERCHE_ENTREPRISES_BASE_URL || 'https://recherche-entreprises.api.gouv.fr',
    },
    geo: {
      baseUrl: process.env.API_GEO_BASE_URL || 'https://geo.api.gouv.fr',
    },
    sirene: {
      baseUrl: process.env.API_SIRENE_BASE_URL || 'https://api.insee.fr/api-sirene/3.11',
      apiKey: process.env.INSEE_API_KEY || '',
    },
  },
  
  // User Agent
  userAgent: process.env.USER_AGENT || 'prospection-sci-app/1.0 contact@example.com',
  
  // Rate Limiting
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};

/**
 * Validate critical environment variables
 */
export const validateConfig = () => {
  const requiredInProduction = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'MONGODB_URI'];
  
  if (config.env === 'production') {
    const missing = requiredInProduction.filter(
      (key) => !process.env[key]
    );
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missing.join(', ')}`
      );
    }
  }
};

export default config;
