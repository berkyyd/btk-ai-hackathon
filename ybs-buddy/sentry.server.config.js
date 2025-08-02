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
    // Database errors
    'Firestore: Error (permission-denied)',
    'Firestore: Error (not-found)',
    
    // API errors
    'API Error: Rate limit exceeded',
    'API Error: Invalid request',
  ],
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive data from request body
    if (event.request?.data) {
      const data = event.request.data;
      if (data.password) data.password = '***';
      if (data.token) data.token = '***';
      if (data.apiKey) data.apiKey = '***';
    }
    
    // Remove sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers;
      if (headers.authorization) headers.authorization = '***';
      if (headers['x-api-key']) headers['x-api-key'] = '***';
    }
    
    return event;
  },
}); 