/**
 * Production Firebase Initialization Script
 * Uses production Firebase without emulators
 */

// Import Firebase configuration
import environmentLoader from './utils/environment-loader.js';

// Get Firebase configuration from environment variables
const firebaseConfig = environmentLoader.getFirebaseConfig();

/**
 * Initialize Firebase with modular SDK (Production only - no emulators)
 */
export async function initializeModularFirebase() {
    try {
        // Dynamic imports for tree-shaking and better performance
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
        const { getFirestore, enableNetwork, disableNetwork } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js');

        // Initialize Firebase app
        const app = initializeApp(firebaseConfig);
        
        // Initialize services (PRODUCTION ONLY - NO EMULATORS)
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        let analytics = null;
        
        // Initialize Analytics if measurement ID is provided
        if (firebaseConfig.measurementId) {
            try {
                analytics = getAnalytics(app);
            } catch (error) {
                console.warn('Analytics initialization failed:', error);
            }
        }
        
        console.log('✅ Firebase v10.x initialized with PRODUCTION configuration (no emulators)');
        
        return {
            app,
            auth,
            db,
            storage,
            analytics,
            utils: {
                // Modern SDK utilities
                serverTimestamp: () => import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js').then(({ serverTimestamp }) => serverTimestamp()),
                arrayUnion: (...elements) => import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js').then(({ arrayUnion }) => arrayUnion(...elements)),
                arrayRemove: (...elements) => import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js').then(({ arrayRemove }) => arrayRemove(...elements)),
                increment: (n = 1) => import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js').then(({ increment }) => increment(n)),
                deleteField: () => import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js').then(({ deleteField }) => deleteField()),
                
                // Network control
                enableNetwork: () => enableNetwork(db),
                disableNetwork: () => disableNetwork(db)
            }
        };
        
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw error;
    }
}

// Export the same functions as the original
export async function initializeFirebaseWithPerformance() {
    try {
        const firebaseServices = await initializeModularFirebase();
        
        // Add performance monitoring
        const { getPerformance } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-performance.js');
        const perf = getPerformance(firebaseServices.app);
        
        console.log('📊 Firebase Performance monitoring enabled');
        
        return {
            ...firebaseServices,
            performance: perf
        };
        
    } catch (error) {
        console.warn('Performance monitoring failed, falling back to basic initialization:', error);
        return await initializeModularFirebase();
    }
}

// Auto-initialize for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Production Firebase mode (no emulators)');
    
    // Expose Firebase services globally for debugging
    window.initFirebase = initializeModularFirebase;
}
