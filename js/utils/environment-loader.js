/**
 * Environment Variable Loader for MYCOgenesis
 * Handles environment configuration in vanilla JavaScript
 * Supports both build-time and runtime environment variables
 */

class EnvironmentLoader {
    constructor() {
        this.config = {};
        this.isLoaded = false;
        this.initializeEnvironment();
    }

    /**
     * Initialize environment variables
     */
    initializeEnvironment() {
        // Check if we're in a build environment with injected variables
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // Vite/Modern build tools
            this.loadFromImportMeta();
        } else if (typeof process !== 'undefined' && process.env) {
            // Node.js environment
            this.loadFromProcess();
        } else {
            // Fallback: Try to load from window object or fetch from server
            this.loadFromWindow();
        }
        
        this.validateConfiguration();
        this.isLoaded = true;
        
        console.log('🔧 Environment configuration loaded:', {
            environment: this.get('ENVIRONMENT'),
            debug: this.get('DEBUG_MODE'),
            firebase: {
                projectId: this.get('FIREBASE_PROJECT_ID'),
                authDomain: this.get('FIREBASE_AUTH_DOMAIN')
            }
        });
    }

    /**
     * Load from import.meta.env (Vite/modern bundlers)
     */
    loadFromImportMeta() {
        const env = import.meta.env;
        for (const key in env) {
            if (key.startsWith('VITE_')) {
                const configKey = key.replace('VITE_', '');
                this.config[configKey] = env[key];
            }
        }
    }

    /**
     * Load from process.env (Node.js)
     */
    loadFromProcess() {
        const env = process.env;
        for (const key in env) {
            if (key.startsWith('VITE_')) {
                const configKey = key.replace('VITE_', '');
                this.config[configKey] = env[key];
            }
        }
    }

    /**
     * Load from window object or defaults
     */
    loadFromWindow() {
        // Check if environment variables are injected in window
        if (window.ENV_CONFIG) {
            this.config = { ...window.ENV_CONFIG };
            return;
        }

        // Fallback to development defaults
        console.warn('⚠️  No environment variables found, using development defaults');
        this.loadDevelopmentDefaults();
    }

    /**
     * Load development defaults (when no env vars are available)
     */
    loadDevelopmentDefaults() {
        console.error('❌ SECURITY WARNING: No environment variables configured!');
        console.error('🔧 Please create a .env file with your Firebase configuration.');
        console.error('📖 See .env.example for the required variables.');
        
        // Don't provide any defaults - force proper configuration
        this.config = {
            // Application Settings (non-sensitive only)
            APP_NAME: 'MYCOgenesis',
            APP_URL: window.location.origin,
            ENVIRONMENT: 'development',
            DEBUG_MODE: 'true',

            // Sanity CMS (non-sensitive defaults)
            SANITY_DATASET: 'production',
            SANITY_API_VERSION: '2023-12-01',
            SANITY_USE_CDN: 'true'
        };
        
        // Throw error for missing Firebase config
        throw new Error(
            'Firebase configuration is required but not found. ' +
            'Please create a .env file with your Firebase credentials. ' +
            'See .env.example for template.'
        );
    }

    /**
     * Get environment variable value
     * @param {string} key - Environment variable key (without VITE_ prefix)
     * @param {string} defaultValue - Default value if not found
     * @returns {string} Environment variable value
     */
    get(key, defaultValue = '') {
        return this.config[key] || defaultValue;
    }

    /**
     * Get boolean environment variable
     * @param {string} key - Environment variable key
     * @param {boolean} defaultValue - Default boolean value
     * @returns {boolean} Boolean value
     */
    getBoolean(key, defaultValue = false) {
        const value = this.get(key, defaultValue.toString());
        return value.toLowerCase() === 'true';
    }

    /**
     * Get Firebase configuration object
     * @returns {object} Firebase configuration
     */
    getFirebaseConfig() {
        return {
            apiKey: this.get('FIREBASE_API_KEY'),
            authDomain: this.get('FIREBASE_AUTH_DOMAIN'),
            databaseURL: this.get('FIREBASE_DATABASE_URL'),
            projectId: this.get('FIREBASE_PROJECT_ID'),
            storageBucket: this.get('FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: this.get('FIREBASE_MESSAGING_SENDER_ID'),
            appId: this.get('FIREBASE_APP_ID'),
            measurementId: this.get('FIREBASE_MEASUREMENT_ID')
        };
    }

    /**
     * Get Sanity CMS configuration
     * @returns {object} Sanity configuration
     */
    getSanityConfig() {
        return {
            projectId: this.get('SANITY_PROJECT_ID'),
            dataset: this.get('SANITY_DATASET', 'production'),
            apiVersion: this.get('SANITY_API_VERSION', '2023-12-01'),
            useCdn: this.getBoolean('SANITY_USE_CDN', true)
        };
    }

    /**
     * Check if running in development mode
     * @returns {boolean} True if in development
     */
    isDevelopment() {
        return this.get('ENVIRONMENT', 'development') === 'development';
    }

    /**
     * Check if running in production mode
     * @returns {boolean} True if in production
     */
    isProduction() {
        return this.get('ENVIRONMENT') === 'production';
    }

    /**
     * Check if debug mode is enabled
     * @returns {boolean} True if debug mode is on
     */
    isDebugMode() {
        return this.getBoolean('DEBUG_MODE', this.isDevelopment());
    }

    /**
     * Validate required configuration
     */
    validateConfiguration() {
        const requiredKeys = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_AUTH_DOMAIN',
            'FIREBASE_API_KEY'
        ];

        const missing = requiredKeys.filter(key => !this.get(key));
        
        if (missing.length > 0) {
            console.error('❌ Missing required environment variables:', missing);
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validate Firebase project ID format
        const projectId = this.get('FIREBASE_PROJECT_ID');
        if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
            console.warn('⚠️  Invalid Firebase project ID format:', projectId);
        }
    }

    /**
     * Get all configuration for debugging
     * @returns {object} All configuration (excluding sensitive data)
     */
    getDebugInfo() {
        const debug = { ...this.config };
        
        // Mask sensitive information
        if (debug.FIREBASE_API_KEY) {
            debug.FIREBASE_API_KEY = debug.FIREBASE_API_KEY.substring(0, 8) + '...';
        }
        
        return {
            environment: this.get('ENVIRONMENT'),
            isProduction: this.isProduction(),
            isDevelopment: this.isDevelopment(),
            debugMode: this.isDebugMode(),
            config: debug
        };
    }

    /**
     * Initialize for runtime configuration injection
     * This method can be called to inject server-side configuration
     * @param {object} runtimeConfig - Configuration from server
     */
    injectRuntimeConfig(runtimeConfig) {
        this.config = { ...this.config, ...runtimeConfig };
        this.validateConfiguration();
        console.log('🔄 Runtime configuration injected');
    }
}

// Create singleton instance
const environmentLoader = new EnvironmentLoader();

// Export for ES6 modules
export default environmentLoader;
export { EnvironmentLoader };

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
    window.environmentLoader = environmentLoader;
    window.EnvironmentLoader = EnvironmentLoader;
}
