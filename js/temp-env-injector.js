/**
 * TEMPORARY Environment Variable Injector
 * This is a temporary fix to restore login functionality
 * 
 * IMPORTANT: This should be replaced with proper build tools (like Vite)
 * or server-side environment injection in production
 */

// Inject environment variables into window object
window.ENV_CONFIG = {
    // Firebase Configuration
    FIREBASE_API_KEY: 'AIzaSyA8ustH6URtqM5S4F_IUszDBpiflel3utI',
    FIREBASE_AUTH_DOMAIN: 'mycogen-57ade.firebaseapp.com',
    FIREBASE_DATABASE_URL: 'https://mycogen-57ade-default-rtdb.firebaseio.com',
    FIREBASE_PROJECT_ID: 'mycogen-57ade',
    FIREBASE_STORAGE_BUCKET: 'mycogen-57ade.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '987955981851',
    FIREBASE_APP_ID: '1:987955981851:web:780126aeac499bf0d512be',
    FIREBASE_MEASUREMENT_ID: 'G-S0KN75E7HZ',
    
    // Application Settings
    APP_NAME: 'MYCOgenesis',
    APP_URL: window.location.origin,
    ENVIRONMENT: 'development',
    DEBUG_MODE: 'true',
    
    // Sanity CMS Configuration
    SANITY_DATASET: 'production',
    SANITY_API_VERSION: '2023-12-01',
    SANITY_USE_CDN: 'true'
};

console.log('🔧 Temporary environment variables injected');
console.log('⚠️  WARNING: This is a temporary fix. Please set up proper environment variable handling.');
console.log('📚 See SECURITY_SETUP.md for proper configuration instructions.');
