# 🚀 MYCOgenesis Website Deployment Guide

Complete deployment guide for the MYCOgenesis mushroom farming website with Firebase backend and Sanity CMS integration.

## 📋 Project Overview

**Technology Stack:**
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **CMS**: Sanity Studio with custom schemas
- **Build Tools**: Tailwind CSS compiler
- **Hosting Options**: Vercel, Firebase Hosting

---

## 🔧 Pre-Deployment Setup

### 1. Build Assets

Before deploying, ensure your CSS is compiled:

```bash
# Navigate to project directory
cd C:\Users\prave\Documents\GitHub\MYCOgenesis_WEB

# Install dependencies
npm install

# Build Tailwind CSS
npm run build-css

# Optional: Watch mode during development
npm run watch-css
```

### 2. Environment Configuration

Create environment files for different deployment targets:

**`.env.production`** (for production builds):
```env
# Firebase Production Configuration
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Sanity Configuration
VITE_SANITY_PROJECT_ID=your_sanity_project_id
VITE_SANITY_DATASET=production
```

---

## 🌐 Option 1: Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Repository pushed to GitHub

### Step 1: Repository Setup

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for deployment"

# Add remote origin (replace with your GitHub repo)
git remote add origin https://github.com/praveensaummya/MYCOgenesis_WEB.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create `vercel.json` Configuration

```json
{
  "version": 2,
  "name": "mycogenesis-web",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "."
      }
    }
  ],
  "routes": [
    {
      "src": "/css/(.*)",
      "dest": "/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/js/$1"
    },
    {
      "src": "/images/(.*)",
      "dest": "/images/$1"
    },
    {
      "src": "/auth/(.*)",
      "dest": "/auth/$1"
    },
    {
      "src": "/blog/(.*)",
      "dest": "/blog/$1"
    },
    {
      "src": "/pages/(.*)",
      "dest": "/pages/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "functions": {
    "js/temp-env-injector.js": {
      "includeFiles": "js/**"
    }
  },
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase_api_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "VITE_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "VITE_FIREBASE_APP_ID": "@firebase_app_id",
    "VITE_SANITY_PROJECT_ID": "@sanity_project_id",
    "VITE_SANITY_DATASET": "@sanity_dataset"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: mycogenesis-web
# - Select framework: Other
# - Set build command: npm run build-css
# - Set output directory: . (current directory)
```

**Option B: Using Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `MYCOgenesis_WEB` repository
5. Configure project settings:
   - **Framework**: Other
   - **Build Command**: `npm run build-css`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

### Step 4: Configure Environment Variables in Vercel

1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_FIREBASE_API_KEY = your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_SANITY_PROJECT_ID = your_sanity_project_id
VITE_SANITY_DATASET = production
```

### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `mycogenesis.com`)
3. Update DNS records as instructed
4. Enable SSL (automatic with Vercel)

---

## 🔥 Option 2: Firebase Hosting

### Prerequisites
- Firebase CLI installed
- Firebase project created
- Firebase configuration completed

### Step 1: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

### Step 2: Firebase Configuration

During `firebase init`, select:
- ✅ **Hosting**: Configure files for Firebase Hosting
- ✅ **Firestore**: Configure security rules and indexes files
- ✅ **Storage**: Configure security rules file

**Configuration Options:**
```
? What do you want to use as your public directory? . (current directory)
? Configure as a single-page app (rewrite all urls to /index.html)? No
? Set up automatic builds and deploys with GitHub? Yes (optional)
? File index.html already exists. Overwrite? No
```

### Step 3: Update `firebase.json`

Your existing `firebase.json` needs hosting configuration:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "firestore.rules",
      "storage.rules",
      "firestore.indexes.json",
      "test-firebase-rules.js",
      "FIREBASE_RULES_DEPLOYMENT.md",
      "ENVIRONMENT_SETUP*.md",
      "DEPLOYMENT_GUIDE.md",
      "sanity-cms/**",
      "src/**",
      "*.md",
      "package*.json"
    ],
    "rewrites": [
      {
        "source": "/auth/**",
        "destination": "/auth/index.html"
      },
      {
        "source": "/blog/**",
        "destination": "/blog/index.html"
      },
      {
        "source": "/pages/**",
        "destination": "/pages/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(eot|otf|ttf|ttc|woff|font.css)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(css|js)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Step 4: Build and Deploy

```bash
# Build CSS assets
npm run build-css

# Test locally with Firebase emulator
firebase emulators:start --only hosting

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything (hosting + firestore + storage)
firebase deploy
```

### Step 5: Configure Custom Domain (Optional)

```bash
# Add custom domain
firebase hosting:channel:deploy live --expires 1h

# In Firebase Console:
# 1. Go to Hosting section
# 2. Click "Add custom domain"
# 3. Enter your domain (e.g., mycogenesis.com)
# 4. Follow DNS configuration instructions
```

---

## 📝 CMS Deployment (Sanity Studio)

### Option 1: Deploy to Sanity Cloud (Recommended)

```bash
# Navigate to Sanity CMS directory
cd sanity-cms

# Install dependencies
npm install

# Login to Sanity
npx sanity login

# Deploy studio
npm run deploy

# When prompted, enter studio hostname: mycogenesis
# Studio will be available at: https://mycogenesis.sanity.studio
```

### Option 2: Self-Host Sanity Studio

**Deploy to Vercel:**
```bash
# In sanity-cms directory
cd sanity-cms

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "mycogenesis-cms",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Deploy to Vercel
vercel --prod
```

**Deploy to Firebase Hosting:**
```bash
# In sanity-cms directory
cd sanity-cms

# Build studio
npm run build

# Deploy built studio to Firebase
firebase deploy --only hosting --public dist
```

---

## 🔐 Security & Environment Setup

### 1. Firebase Security Rules

Ensure your security rules are deployed:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### 2. CORS Configuration

For Firebase Storage, configure CORS:

```json
[
  {
    "origin": ["https://your-domain.com", "https://your-domain.vercel.app"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

```bash
# Apply CORS configuration
gsutil cors set cors.json gs://your-project.appspot.com
```

### 3. Content Security Policy

Add CSP headers in your hosting configuration (see vercel.json above).

---

## 🧪 Testing Deployments

### Pre-Deployment Checklist

```bash
# Test CSS compilation
npm run build-css

# Check for JavaScript errors
# Open browser console at http://localhost:5000

# Test Firebase emulator
firebase emulators:start

# Test authentication flow
# Test CMS access
# Test dynamic content loading
# Test responsive design
```

### Post-Deployment Testing

1. **Functionality Tests:**
   - [ ] Homepage loads correctly
   - [ ] Navigation works
   - [ ] Authentication (login/signup)
   - [ ] Dynamic content loads (products, blog)
   - [ ] CMS access for editors/admins
   - [ ] Contact form submission
   - [ ] Mobile responsiveness

2. **Performance Tests:**
   - [ ] Page load speed (<3 seconds)
   - [ ] Image optimization working
   - [ ] CSS/JS minification
   - [ ] CDN delivery

3. **Security Tests:**
   - [ ] HTTPS enabled
   - [ ] Security headers present
   - [ ] Firebase rules working
   - [ ] User role restrictions

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build CSS
      run: npm run build-css
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
    
    # Alternative: Deploy to Firebase
    # - name: Deploy to Firebase
    #   uses: FirebaseExtended/action-hosting-deploy@v0
    #   with:
    #     repoToken: '${{ secrets.GITHUB_TOKEN }}'
    #     firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    #     channelId: live
    #     projectId: your-project-id
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails:**
   ```bash
   # Check Tailwind installation
   npm install tailwindcss
   
   # Rebuild CSS
   npm run build-css
   ```

2. **Environment Variables Not Loading:**
   ```bash
   # Check temp-env-injector.js
   # Verify Firebase config in hosting dashboard
   ```

3. **CMS Access Issues:**
   ```bash
   # Check Sanity deployment
   cd sanity-cms
   npm run deploy
   
   # Verify user roles in Firebase
   ```

4. **Firebase Rules Errors:**
   ```bash
   # Deploy rules separately
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

### Performance Optimization

1. **Image Optimization:**
   - Use WebP format where possible
   - Implement lazy loading
   - Use Sanity's image CDN

2. **CSS/JS Minification:**
   ```bash
   # For production, consider using build tools
   npm install -g uglify-js clean-css-cli
   
   # Minify JS
   uglifyjs js/*.js -o js/bundle.min.js
   
   # Minify CSS
   cleancss css/tailwind.css -o css/tailwind.min.css
   ```

---

## 📊 Monitoring & Analytics

### 1. Setup Google Analytics
Add to `index.html` head section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Performance Monitoring
- Vercel Analytics (automatic)
- Firebase Performance Monitoring
- Web Vitals tracking

### 3. Error Tracking
Consider implementing:
- Sentry for error tracking
- Firebase Crashlytics
- Custom error logging

---

## 🎯 Next Steps After Deployment

1. **Content Population:**
   - Add products via Sanity Studio
   - Create blog posts
   - Update images and copy

2. **SEO Optimization:**
   - Submit sitemap to Google Search Console
   - Implement structured data
   - Optimize meta tags

3. **Marketing Integration:**
   - Setup email collection
   - Implement social sharing
   - Add newsletter signup

4. **Business Features:**
   - E-commerce integration
   - Customer accounts
   - Order management

---

## 📞 Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Firebase Hosting Guide**: https://firebase.google.com/docs/hosting
- **Sanity Studio Deployment**: https://www.sanity.io/docs/deployment
- **Tailwind CSS Build Process**: https://tailwindcss.com/docs/installation

---

**🎉 Your MYCOgenesis website is ready for the world!**

Choose your preferred hosting option and follow the steps above. Both Vercel and Firebase Hosting offer excellent performance and reliability for your mushroom farming business website.
