# 🔐 MYCOgenesis Security Setup Guide

## 🚨 IMMEDIATE ACTION REQUIRED

Your Firebase API key was accidentally exposed in your public repository. Follow these steps **immediately**:

## Step 1: Secure Your Firebase Project

1. **Go to Google Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `mycogen-57ade`
3. **Navigate to**: Project Settings > General > Web Apps
4. **Regenerate your API key** or **create restrictions**:
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Navigate to "APIs & Services" > "Credentials"
   - Find your API key: `AIzaSyA8ustH6URtqM5S4F_IUszDBpiflel3utI`
   - Either **DELETE IT** or **RESTRICT IT** to specific domains

## Step 2: Set Up Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file** with your actual Firebase credentials:
   ```bash
   # Get these from Firebase Console > Project Settings > Your Apps
   VITE_FIREBASE_API_KEY=your_new_secure_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=mycogen-57ade.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://mycogen-57ade-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=mycogen-57ade
   VITE_FIREBASE_STORAGE_BUCKET=mycogen-57ade.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=987955981851
   VITE_FIREBASE_APP_ID=1:987955981851:web:780126aeac499bf0d512be
   VITE_FIREBASE_MEASUREMENT_ID=G-S0KN75E7HZ
   ```

3. **NEVER commit the .env file** - it's already in .gitignore

## Step 3: Clean Your Git History

The compromised key is still in your git history. Run these commands:

```bash
# Install BFG Repo-Cleaner (recommended method)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove the exposed API key from all commits
java -jar bfg.jar --replace-text replacements.txt

# Or use git-filter-branch (slower but built-in)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch js/utils/environment-loader.js' \
  --prune-empty --tag-name-filter cat -- --all
```

## Step 4: Verify Security

1. **Check that no credentials are in source code**:
   ```bash
   git grep -i "AIzaSy"  # Should return nothing
   git grep -i "api.*key"  # Should only show env examples
   ```

2. **Test your app** - it should now load credentials from .env

3. **Force push** to update remote history:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## Step 5: Set Up Firebase Security Rules

Update your Firestore rules to restrict access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public content (like blogs) can be read by anyone, written by admins
    match /blog/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        resource.data.role == 'admin';
    }
  }
}
```

## Step 6: Monitor for Future Leaks

1. **Enable GitHub secret scanning** in your repository settings
2. **Set up Google Cloud monitoring** for unusual API usage
3. **Use a pre-commit hook** to check for secrets:

```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

## ⚠️ What Happens if You Ignore This?

- **Unauthorized access** to your Firebase project
- **Data theft or manipulation**
- **Unexpected charges** on your Google Cloud bill
- **Potential legal issues** if user data is compromised

## ✅ Security Best Practices

1. **Never hardcode secrets** in source code
2. **Use environment variables** for all sensitive data  
3. **Rotate API keys regularly**
4. **Set up monitoring and alerts**
5. **Review permissions** on your Firebase project
6. **Use Firebase security rules** to restrict access

---

**Need help?** Check Firebase documentation: https://firebase.google.com/docs/web/setup
