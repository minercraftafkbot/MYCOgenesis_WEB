/**
 * Environment Configuration for MYCOgenesis_WEB
 * Production-ready environment variable handling for Vercel deployment
 */

// Environment configuration
window.ENV_CONFIG = {
    // Firebase Configuration - should be set as Vercel environment variables
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
    ENVIRONMENT: 'production',
    DEBUG_MODE: 'false',
    
    // Sanity CMS Configuration
    SANITY_PROJECT_ID: 'gae98lpg',
    SANITY_DATASET: 'production',
    SANITY_API_VERSION: '2023-12-01',
    SANITY_USE_CDN: 'true'
};

// Only show console messages in development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    console.log('🔧 Environment configuration loaded:', window.ENV_CONFIG);
}
