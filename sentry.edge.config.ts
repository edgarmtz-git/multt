import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Disable debug to improve performance
  debug: false,
  
  // Configure environment
  environment: process.env.NODE_ENV,
  
  // Configure release
  release: process.env.SENTRY_RELEASE || '1.0.0',
})
