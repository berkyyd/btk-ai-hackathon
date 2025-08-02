import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific errors
  ignoreErrors: [
    // Network errors
    'Network Error',
    'Failed to fetch',
    'Request timeout',
    
    // Firebase errors
    'Firebase: Error (auth/user-not-found)',
    'Firebase: Error (auth/wrong-password)',
    
    // Browser specific errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive data from URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/password=[^&]*/, 'password=***');
      event.request.url = event.request.url.replace(/token=[^&]*/, 'token=***');
    }
    
    // Remove sensitive data from request body
    if (event.request?.data) {
      const data = event.request.data;
      if (data.password) data.password = '***';
      if (data.token) data.token = '***';
    }
    
    return event;
  },
}); 