// monitoring/sentry.config.js
import { init } from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

init({
  dsn: SENTRY_DSN,
  environment,
  enabled: environment !== 'development',
  
  // Performance monitoring
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  beforeSend(event) {
    // Filter out development errors
    if (environment === 'development') {
      return null;
    }
    
    // Filter out specific errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null; // Ignore chunk load errors
      }
    }
    
    return event;
  },
  
  // Additional configuration
  integrations: [
    // Add custom integrations here
  ],
  
  // User context
  initialScope: {
    tags: {
      component: 'frontend',
      version: process.env.npm_package_version,
    },
  },
});
