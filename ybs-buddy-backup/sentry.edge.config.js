import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific errors
  ignoreErrors: [
    // Edge runtime errors
    'Edge Runtime Error',
    'Function timeout',
  ],
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive data from request body
    if (event.request?.data) {
      const data = event.request.data;
      if (data.password) data.password = '***';
      if (data.token) data.token = '***';
    }
    
    return event;
  },
}); 