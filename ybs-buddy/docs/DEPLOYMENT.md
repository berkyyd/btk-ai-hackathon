# Deployment Guide

This guide covers deploying YBS Buddy to various platforms.

## 🚀 Prerequisites

### Environment Setup
1. **Firebase Project**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Get Firebase configuration

2. **Google Gemini API**
   - Create Google AI Studio account
   - Get API key for Gemini
   - Set up billing if needed

3. **Environment Variables**
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_SUMMARY_API_KEY=your_gemini_summary_api_key

   # Development Settings
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

## 📦 Build Process

### Local Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm start
```

### Build Verification
- [ ] TypeScript compilation passes
- [ ] ESLint checks pass
- [ ] Prettier formatting is applied
- [ ] All environment variables are set
- [ ] Firebase configuration is correct
- [ ] Gemini API keys are valid

## 🌐 Deployment Options

### 1. Vercel (Recommended)

#### Setup
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all required environment variables

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Automatic Deployment
- Connect GitHub repository
- Enable automatic deployments
- Set up preview deployments for PRs

### 2. Netlify

#### Setup
1. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: .next
   Node version: 18
   ```

2. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required environment variables

3. **Redirects**
   ```bash
   # _redirects file
   /*    /index.html   200
   ```

### 3. Railway

#### Setup
1. **Connect Repository**
   - Connect GitHub repository
   - Railway will auto-detect Next.js

2. **Environment Variables**
   - Add all required environment variables
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically deploy on push

### 4. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  ybs-buddy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_SUMMARY_API_KEY=${GEMINI_SUMMARY_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
```

## 🔧 Configuration

### Firebase Configuration
1. **Authentication**
   - Enable Email/Password authentication
   - Configure authorized domains
   - Set up invitation code system

2. **Firestore Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow authenticated users to read public notes
       match /notes/{noteId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       // Allow authenticated users to read courses
       match /courses/{courseId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.token.admin == true;
       }
     }
   }
   ```

3. **Storage Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Domain Configuration
1. **Custom Domain**
   - Configure DNS settings
   - Set up SSL certificate
   - Update Firebase authorized domains

2. **Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` with your domain
   - Configure Firebase auth domains

## 🔍 Monitoring & Analytics

### Performance Monitoring
- Set up Vercel Analytics
- Configure Firebase Performance Monitoring
- Monitor API response times

### Error Tracking
- Set up Sentry for error tracking
- Configure Firebase Crashlytics
- Monitor console errors

### Usage Analytics
- Google Analytics 4
- Firebase Analytics
- Custom event tracking

## 🔒 Security

### Environment Variables
- Never commit sensitive data
- Use platform-specific secret management
- Rotate API keys regularly

### Firebase Security
- Configure proper Firestore rules
- Set up Storage security rules
- Enable Firebase App Check

### API Security
- Rate limiting for Gemini API
- Input validation
- CORS configuration

## 📊 Health Checks

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Firebase project configured
- [ ] Gemini API keys valid
- [ ] Domain configured (if custom)
- [ ] SSL certificate active

### Post-deployment Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] File uploads function
- [ ] Quiz generation works
- [ ] PDF processing works
- [ ] Mobile responsiveness
- [ ] Performance acceptable

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check TypeScript compilation errors

2. **Environment Variables**
   - Verify all required variables set
   - Check variable naming (NEXT_PUBLIC_ prefix)
   - Restart deployment after changes

3. **Firebase Issues**
   - Verify Firebase project configuration
   - Check Firestore rules
   - Verify Storage rules

4. **API Issues**
   - Check Gemini API key validity
   - Verify API quotas and billing
   - Check rate limiting

### Debug Commands
```bash
# Check build locally
npm run build

# Test production build
npm start

# Check environment variables
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 📈 Scaling

### Performance Optimization
- Enable Next.js image optimization
- Configure CDN for static assets
- Implement caching strategies
- Monitor bundle size

### Database Scaling
- Monitor Firestore usage
- Implement pagination
- Optimize queries
- Consider read replicas

### API Scaling
- Monitor Gemini API usage
- Implement request caching
- Consider API key rotation
- Monitor rate limits

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: npm run type-check
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Verify configuration
4. Contact platform support
5. Check project documentation

---

**Note**: This deployment guide is a living document. Update it as the project evolves and new deployment options become available. 