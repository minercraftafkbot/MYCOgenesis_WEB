// Unified Firebase configuration for both main website and CMS
// Updated for Firebase v10.x (Latest)
// This replaces both js/auth/firebase-config.js and cms/js/config/firebase-config.js

// Firebase configuration
// Updated with actual MYCOgenesis project settings
const firebaseConfig = {
    apiKey: "AIzaSyA8ustH6URtqM5S4F_IUszDBpiflel3utI",
    authDomain: "mycogen-57ade.firebaseapp.com",
    databaseURL: "https://mycogen-57ade-default-rtdb.firebaseio.com",
    projectId: "mycogen-57ade",
    storageBucket: "mycogen-57ade.firebasestorage.app",
    messagingSenderId: "987955981851",
    appId: "1:987955981851:web:780126aeac499bf0d512be",
    measurementId: "G-S0KN75E7HZ"
};

// Validate configuration
console.log("✅ Firebase configuration loaded for MYCOgenesis project");
console.log("🔗 Project ID:", firebaseConfig.projectId);

// Support both modular and compat SDKs
let app, auth, db, storage, analytics;

// Check if we're using compat SDK (for CMS)
if (typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase app
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        
        // Initialize services
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Optional: Initialize Analytics if measurementId is provided
        if (firebaseConfig.measurementId && typeof firebase.analytics !== 'undefined') {
            analytics = firebase.analytics();
        }
        
        // Configure Firestore settings for better performance
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // Enable offline persistence
        db.enablePersistence({
            synchronizeTabs: true
        }).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.");
            } else if (err.code === 'unimplemented') {
                console.warn("⚠️ The current browser doesn't support offline persistence.");
            }
        });
        
        console.log("✅ Firebase v10.x initialized with compat SDK");
        console.log("📊 Services available:", {
            auth: !!auth,
            firestore: !!db,
            storage: !!storage,
            analytics: !!analytics
        });
        
    } catch (error) {
        console.error("❌ Firebase compat initialization failed:", error);
        
        // Provide helpful error messages
        if (error.code === 'app/duplicate-app') {
            console.warn("⚠️ Firebase app already initialized");
        } else if (error.code === 'app/invalid-app-argument') {
            console.error("❌ Invalid Firebase configuration. Please check your config values.");
        }
    }
}

// Check if we're using modular SDK (for main website)
if (typeof window !== 'undefined' && !window.firebase) {
    // This will be handled by dynamic imports in the main website
    console.log("🔄 Modular SDK will be initialized dynamically");
}

// Enhanced Firebase services object with additional utilities
const firebaseServices = {
    app,
    auth,
    db,
    storage,
    analytics,
    
    // Utility functions
    utils: {
        // Server timestamp helper
        serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
        
        // Array operations
        arrayUnion: (...elements) => firebase.firestore.FieldValue.arrayUnion(...elements),
        arrayRemove: (...elements) => firebase.firestore.FieldValue.arrayRemove(...elements),
        
        // Increment helper
        increment: (n = 1) => firebase.firestore.FieldValue.increment(n),
        
        // Delete field helper
        deleteField: () => firebase.firestore.FieldValue.delete(),
        
        // Batch operations
        batch: () => db.batch(),
        
        // Transaction helper
        runTransaction: (updateFunction) => db.runTransaction(updateFunction),
        
        // Storage reference helper
        storageRef: (path) => storage.ref(path),
        
        // Auth state observer
        onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback),
        
        // Connection state observer
        onConnectionStateChanged: (callback) => {
            const connectedRef = db.doc('.info/connected');
            return connectedRef.onSnapshot((doc) => {
                callback(doc.data());
            });
        }
    },
    
    // Configuration info
    config: {
        version: '10.13.2',
        projectId: firebaseConfig.projectId,
        features: {
            auth: true,
            firestore: true,
            storage: true,
            analytics: !!firebaseConfig.measurementId,
            offline: true
        }
    }
};

// Export for compat SDK (CMS)
if (typeof window !== 'undefined') {
    window.firebaseServices = firebaseServices;
    
    // Global error handler for Firebase
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.code && event.reason.code.startsWith('auth/')) {
            console.error('🔐 Firebase Auth Error:', event.reason);
        } else if (event.reason && event.reason.code && event.reason.code.startsWith('firestore/')) {
            console.error('🗄️ Firestore Error:', event.reason);
        } else if (event.reason && event.reason.code && event.reason.code.startsWith('storage/')) {
            console.error('📁 Storage Error:', event.reason);
        }
    });
}

// Export for modular SDK (main website)
export { firebaseConfig };
export { auth, db, storage, analytics };
export default firebaseServices;