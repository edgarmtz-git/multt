import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Disable debug to improve performance
  debug: false,
  
  // Performance Monitoring
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (process.env.NODE_ENV === 'development') {
      const error = hint.originalException
      if (error instanceof Error) {
        // Filter out common development errors
        if (
          error.message.includes('ResizeObserver loop limit exceeded') ||
          error.message.includes('Non-Error promise rejection captured') ||
          error.message.includes('Loading chunk')
        ) {
          return null
        }
      }
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      component: 'server',
      environment: process.env.NODE_ENV,
    }
    
    return event
  },
  
  // Configure which URLs to trace
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/yourserver\.com\/api/,
  ],
  
  // Configure environment
  environment: process.env.NODE_ENV,
  
  // Configure release
  release: process.env.SENTRY_RELEASE || '1.0.0',
  
  // Configure integrations
  integrations: [
    // Add custom integrations here
  ],
})
