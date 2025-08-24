/**
 * Modern Firebase Initialization Script
 * Supports both Firebase v9+ modular SDK and compat SDK
 * Updated for Firebase v10.x
 */

// Import Firebase configuration (now from environment variables)
import environmentLoader from './utils/environment-loader.js';

// Get Firebase configuration from environment variables
const firebaseConfig = environmentLoader.getFirebaseConfig();

/**
 * Initialize Firebase with modular SDK (for modern applications)
 * This is the recommended approach for new projects
 */
export async function initializeModularFirebase() {
    try {
        // Dynamic imports for tree-shaking and better performance
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
        const { getAuth, connectAuthEmulator } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
        const { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');
        const { getStorage, connectStorageEmulator } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js');

        // Initialize Firebase app
        const app = initializeApp(firebaseConfig);
        
        // Initialize services
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
        
        // Connect to emulators ONLY in local development
        const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                   window.location.hostname === '127.0.0.1' ||
                                   window.location.hostname.includes('localhost');
        
        const isVercelDeployment = window.location.hostname.includes('.vercel.app') || 
                                   window.location.hostname.includes('mycogenesis.com');
        
        // Log environment detection
        console.log('🌍 Environment Detection:', {
            hostname: window.location.hostname,
            isLocalDevelopment,
            isVercelDeployment,
            willUseEmulators: isLocalDevelopment && !isVercelDeployment
        });
        
        // Skip emulators for production deployments
        if (isLocalDevelopment && !isVercelDeployment) {
            console.log('🔧 Connecting to Firebase emulators...');
            try {
                // Only connect if not already connected (check for existing emulator config)
                let authEmulatorConnected = false;
                let firestoreEmulatorConnected = false;
                let storageEmulatorConnected = false;
                
                try {
                    // Check if auth emulator is already connected
                    if (auth.config?.emulator) {
                        authEmulatorConnected = true;
                    } else {
                        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
                        authEmulatorConnected = true;
                    }
                } catch (e) {
                    // Auth emulator already connected or failed
                    if (e.message?.includes('emulator')) {
                        authEmulatorConnected = true;
                    }
                }
                
                try {
                    // Check if firestore emulator is already connected
                    connectFirestoreEmulator(db, 'localhost', 8082);
                    firestoreEmulatorConnected = true;
                } catch (e) {
                    // Firestore emulator already connected or failed
                    if (e.message?.includes('emulator')) {
                        firestoreEmulatorConnected = true;
                    }
                }
                
                try {
                    // Check if storage emulator is already connected
                    connectStorageEmulator(storage, 'localhost', 9199);
                    storageEmulatorConnected = true;
                } catch (e) {
                    // Storage emulator already connected or failed
                    if (e.message?.includes('emulator')) {
                        storageEmulatorConnected = true;
                    }
                }
                
                if (authEmulatorConnected || firestoreEmulatorConnected || storageEmulatorConnected) {
                    console.log('🔧 Firebase emulators configured:', {
                        auth: authEmulatorConnected,
                        firestore: firestoreEmulatorConnected,
                        storage: storageEmulatorConnected
                    });
                }
            } catch (error) {
                console.warn('Emulator configuration completed (some may already be connected):', error.message);
            }
        }
        
        console.log('✅ Firebase v10.x initialized with modular SDK');
        
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
        console.error('❌ Failed to initialize Firebase with modular SDK:', error);
        throw error;
    }
}

/**
 * Initialize Firebase with performance monitoring
 */
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

/**
 * Check Firebase connection status
 */
export function checkFirebaseConnection(db) {
    return new Promise((resolve) => {
        const unsubscribe = db.onSnapshot(
            db.doc('.info/connected'),
            (doc) => {
                const connected = doc.data();
                unsubscribe();
                resolve(connected);
            },
            (error) => {
                console.warn('Connection check failed:', error);
                unsubscribe();
                resolve(false);
            }
        );
    });
}

/**
 * Firebase health check
 */
export async function firebaseHealthCheck() {
    try {
        const services = await initializeModularFirebase();
        
        const health = {
            auth: false,
            firestore: false,
            storage: false,
            analytics: false,
            timestamp: new Date().toISOString()
        };
        
        // Test Auth
        try {
            await services.auth.currentUser;
            health.auth = true;
        } catch (error) {
            console.warn('Auth health check failed:', error);
        }
        
        // Test Firestore
        try {
            await checkFirebaseConnection(services.db);
            health.firestore = true;
        } catch (error) {
            console.warn('Firestore health check failed:', error);
        }
        
        // Test Storage
        try {
            services.storage.ref();
            health.storage = true;
        } catch (error) {
            console.warn('Storage health check failed:', error);
        }
        
        // Test Analytics
        if (services.analytics) {
            health.analytics = true;
        }
        
        console.log('🏥 Firebase Health Check:', health);
        return health;
        
    } catch (error) {
        console.error('❌ Firebase health check failed:', error);
        return {
            auth: false,
            firestore: false,
            storage: false,
            analytics: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Get Firebase SDK version info
 */
export function getFirebaseVersion() {
    return {
        version: '10.13.2',
        type: 'modular',
        features: [
            'Authentication',
            'Firestore',
            'Storage',
            'Analytics',
            'Performance',
            'Emulator Support'
        ]
    };
}

// Auto-initialize for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode detected');
    
    // Expose Firebase services globally for debugging
    window.initFirebase = initializeModularFirebase;
    window.firebaseHealthCheck = firebaseHealthCheck;
    window.getFirebaseVersion = getFirebaseVersion;
}