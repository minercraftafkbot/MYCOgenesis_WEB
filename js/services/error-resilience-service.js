/**
 * Error Resilience Service
 * Provides robust error handling, offline support, and graceful degradation
 */

export class ErrorResilienceService {
    constructor() {
        this.serviceHealth = {
            sanity: { status: 'unknown', lastCheck: null, errors: [] },
            firebase: { status: 'unknown', lastCheck: null, errors: [] },
            connectivity: { status: 'unknown', lastCheck: null }
        };
        
        this.fallbackData = new Map();
        this.errorHandlers = new Map();
        this.retryPolicies = new Map();
        this.healthCheckInterval = null;
        
        this.setupDefaultRetryPolicies();
        this.setupErrorHandlers();
        this.startHealthChecks();
    }

    /**
     * Initialize the error resilience service
     */
    async initialize() {
        // Setup offline detection
        this.setupOfflineDetection();
        
        // Setup service worker for offline support
        await this.setupServiceWorker();
        
        // Setup error boundary for unhandled errors
        this.setupGlobalErrorHandler();
        
        // Load fallback data
        await this.loadFallbackData();
        
        console.log('🛡️ Error resilience service initialized');
    }

    /**
     * Setup default retry policies
     * @private
     */
    setupDefaultRetryPolicies() {
        // Exponential backoff for API calls
        this.retryPolicies.set('api-call', {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffFactor: 2,
            jitter: true
        });

        // Quick retry for network errors
        this.retryPolicies.set('network', {
            maxRetries: 2,
            baseDelay: 500,
            maxDelay: 2000,
            backoffFactor: 1.5,
            jitter: false
        });

        // Patient retry for service unavailable
        this.retryPolicies.set('service-unavailable', {
            maxRetries: 5,
            baseDelay: 5000,
            maxDelay: 30000,
            backoffFactor: 2,
            jitter: true
        });
    }

    /**
     * Setup error handlers for different error types
     * @private
     */
    setupErrorHandlers() {
        // Sanity API errors
        this.errorHandlers.set('sanity-api', async (error, context) => {
            console.warn('🎨 Sanity API error:', error.message);
            
            this.serviceHealth.sanity.status = 'error';
            this.serviceHealth.sanity.errors.push({
                message: error.message,
                timestamp: Date.now(),
                context
            });

            // Try fallback data
            const fallback = await this.getFallbackData(context.contentType, context.options);
            if (fallback) {
                this.showUserNotification('Content loaded from cache due to service issues', 'warning');
                return fallback;
            }

            // Show user-friendly error
            this.showUserNotification('Unable to load latest content. Please try again later.', 'error');
            return null;
        });

        // Firebase errors
        this.errorHandlers.set('firebase-api', async (error, context) => {
            console.warn('🔥 Firebase API error:', error.message);
            
            this.serviceHealth.firebase.status = 'error';
            this.serviceHealth.firebase.errors.push({
                message: error.message,
                timestamp: Date.now(),
                context
            });

            // Handle auth errors specially
            if (error.code?.startsWith('auth/')) {
                return this.handleAuthError(error, context);
            }

            // Handle Firestore errors
            if (error.code?.startsWith('firestore/')) {
                return this.handleFirestoreError(error, context);
            }

            return null;
        });

        // Network errors
        this.errorHandlers.set('network', async (error, context) => {
            console.warn('🌐 Network error:', error.message);
            
            this.serviceHealth.connectivity.status = 'error';
            
            // Check if offline
            if (!navigator.onLine) {
                return this.handleOfflineMode(context);
            }

            // Try different endpoints or cached data
            const fallback = await this.getFallbackData(context.contentType, context.options);
            if (fallback) {
                this.showUserNotification('Using cached data due to network issues', 'info');
                return fallback;
            }

            this.showUserNotification('Network unavailable. Some features may be limited.', 'warning');
            return null;
        });
    }

    /**
     * Execute operation with comprehensive error handling
     * @param {Function} operation - Operation to execute
     * @param {Object} context - Operation context
     * @param {string} errorType - Type of error handling to apply
     * @returns {Promise<*>} - Operation result or fallback
     */
    async executeWithResilience(operation, context, errorType = 'api-call') {
        const startTime = Date.now();
        let lastError;
        
        const retryPolicy = this.retryPolicies.get(errorType) || this.retryPolicies.get('api-call');
        
        for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
            try {
                // Add timeout to prevent hanging
                const result = await this.withTimeout(operation(), 10000);
                
                // Log success metrics
                this.logOperationMetrics(context, attempt, Date.now() - startTime, true);
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                console.warn(`⚠️ Operation failed (attempt ${attempt + 1}/${retryPolicy.maxRetries + 1}):`, error.message);
                
                // Don't retry on final attempt
                if (attempt === retryPolicy.maxRetries) {
                    break;
                }
                
                // Calculate delay with jitter
                const delay = this.calculateRetryDelay(attempt, retryPolicy);
                console.log(`⏳ Retrying in ${delay}ms...`);
                
                await this.sleep(delay);
            }
        }
        
        // All retries failed, use error handler
        this.logOperationMetrics(context, retryPolicy.maxRetries + 1, Date.now() - startTime, false);
        
        const errorHandler = this.getErrorHandler(lastError, errorType);
        if (errorHandler) {
            return await errorHandler(lastError, context);
        }
        
        // No handler, rethrow error
        throw lastError;
    }

    /**
     * Get appropriate error handler based on error type
     * @private
     */
    getErrorHandler(error, defaultType) {
        // Determine error type from error object
        if (error.message?.includes('sanity') || error.code?.includes('sanity')) {
            return this.errorHandlers.get('sanity-api');
        }
        
        if (error.code?.startsWith('auth/') || error.code?.startsWith('firestore/')) {
            return this.errorHandlers.get('firebase-api');
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return this.errorHandlers.get('network');
        }
        
        return this.errorHandlers.get(defaultType);
    }

    /**
     * Calculate retry delay with exponential backoff and jitter
     * @private
     */
    calculateRetryDelay(attempt, policy) {
        const exponentialDelay = Math.min(
            policy.baseDelay * Math.pow(policy.backoffFactor, attempt),
            policy.maxDelay
        );
        
        if (policy.jitter) {
            // Add random jitter ±25%
            const jitter = exponentialDelay * 0.25;
            return exponentialDelay + (Math.random() * 2 - 1) * jitter;
        }
        
        return exponentialDelay;
    }

    /**
     * Add timeout to operation
     * @private
     */
    withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
            )
        ]);
    }

    /**
     * Handle authentication errors
     * @private
     */
    async handleAuthError(error, context) {
        switch (error.code) {
            case 'auth/network-request-failed':
                this.showUserNotification('Network connection required for authentication', 'warning');
                break;
            
            case 'auth/too-many-requests':
                this.showUserNotification('Too many login attempts. Please wait and try again.', 'error');
                break;
            
            case 'auth/user-disabled':
                this.showUserNotification('Your account has been disabled. Please contact support.', 'error');
                break;
            
            default:
                this.showUserNotification('Authentication error. Please try logging in again.', 'error');
        }
        
        return null;
    }

    /**
     * Handle Firestore errors
     * @private
     */
    async handleFirestoreError(error, context) {
        switch (error.code) {
            case 'firestore/unavailable':
                // Service temporarily unavailable
                const fallback = await this.getFallbackData(context.contentType, context.options);
                if (fallback) {
                    this.showUserNotification('Using cached data while service recovers', 'info');
                    return fallback;
                }
                break;
            
            case 'firestore/permission-denied':
                this.showUserNotification('Access denied. Please check your permissions.', 'error');
                break;
            
            case 'firestore/quota-exceeded':
                this.showUserNotification('Service quota exceeded. Please try again later.', 'warning');
                break;
        }
        
        return null;
    }

    /**
     * Handle offline mode
     * @private
     */
    async handleOfflineMode(context) {
        console.log('📴 Entering offline mode');
        
        const cached = await this.getFallbackData(context.contentType, context.options);
        if (cached) {
            this.showUserNotification('You are offline. Showing cached content.', 'info');
            return cached;
        }
        
        this.showUserNotification('You are offline and no cached content is available.', 'warning');
        return this.getOfflinePlaceholder(context.contentType);
    }

    /**
     * Get offline placeholder content
     * @private
     */
    getOfflinePlaceholder(contentType) {
        const placeholders = {
            'products': {
                success: false,
                data: { featuredProducts: [], products: [] },
                offline: true,
                message: 'Product catalog unavailable offline'
            },
            'blog': {
                success: false,
                data: { blogPosts: [], featuredPosts: [] },
                offline: true,
                message: 'Blog posts unavailable offline'
            }
        };
        
        return placeholders[contentType] || {
            success: false,
            data: null,
            offline: true,
            message: 'Content unavailable offline'
        };
    }

    /**
     * Setup offline detection
     * @private
     */
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.serviceHealth.connectivity.status = 'healthy';
            this.showUserNotification('Connection restored', 'success');
            console.log('🌐 Back online');
            
            // Trigger cache refresh
            if (window.enhancedContentService) {
                window.enhancedContentService.clearCache();
            }
        });
        
        window.addEventListener('offline', () => {
            this.serviceHealth.connectivity.status = 'offline';
            this.showUserNotification('You are now offline', 'warning');
            console.log('📴 Gone offline');
        });
    }

    /**
     * Setup service worker for offline support
     * @private
     */
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker if available
                console.log('🔧 Service worker support detected');
                // Implementation would register SW for offline caching
            } catch (error) {
                console.warn('⚠️ Service worker registration failed:', error);
            }
        }
    }

    /**
     * Setup global error handler
     * @private
     */
    setupGlobalErrorHandler() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled promise rejection:', event.reason);
            
            // Prevent default browser error handling
            event.preventDefault();
            
            // Log error for monitoring
            this.logError('unhandled-promise', event.reason, {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });
            
            // Show user notification for critical errors
            if (this.isCriticalError(event.reason)) {
                this.showUserNotification('An unexpected error occurred. Page may need to be refreshed.', 'error');
            }
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('❌ JavaScript error:', event.error);
            
            this.logError('javascript-error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                url: window.location.href,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Check if error is critical
     * @private
     */
    isCriticalError(error) {
        const criticalPatterns = [
            /firebase.*initialization/i,
            /sanity.*client.*failed/i,
            /chunk.*load.*failed/i,
            /script.*error/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(error?.message || error?.toString() || '')
        );
    }

    /**
     * Start periodic health checks
     * @private
     */
    startHealthChecks() {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, 60000); // Every minute
    }

    /**
     * Perform health checks on all services
     * @private
     */
    async performHealthChecks() {
        const checks = [
            this.checkSanityHealth(),
            this.checkFirebaseHealth(),
            this.checkConnectivityHealth()
        ];
        
        await Promise.allSettled(checks);
    }

    /**
     * Check Sanity CMS health
     * @private
     */
    async checkSanityHealth() {
        try {
            // Simple health check - try to fetch a single document
            if (window.sanityService) {
                await window.sanityService.testConnection();
                this.serviceHealth.sanity.status = 'healthy';
            }
        } catch (error) {
            this.serviceHealth.sanity.status = 'unhealthy';
        }
        
        this.serviceHealth.sanity.lastCheck = Date.now();
    }

    /**
     * Check Firebase health
     * @private
     */
    async checkFirebaseHealth() {
        try {
            // Check Firebase connection
            if (window.firebaseServices?.db) {
                // Simple read operation to test connection
                await window.firebaseServices.db.doc('health-check/test').get();
                this.serviceHealth.firebase.status = 'healthy';
            }
        } catch (error) {
            this.serviceHealth.firebase.status = 'unhealthy';
        }
        
        this.serviceHealth.firebase.lastCheck = Date.now();
    }

    /**
     * Check connectivity health
     * @private
     */
    async checkConnectivityHealth() {
        this.serviceHealth.connectivity.status = navigator.onLine ? 'healthy' : 'offline';
        this.serviceHealth.connectivity.lastCheck = Date.now();
    }

    /**
     * Load fallback data from various sources
     * @private
     */
    async loadFallbackData() {
        // Load from localStorage if available
        try {
            const cached = localStorage.getItem('myco-fallback-data');
            if (cached) {
                const parsed = JSON.parse(cached);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.fallbackData.set(key, value);
                });
                console.log('📦 Loaded fallback data from localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load fallback data:', error);
        }
    }

    /**
     * Get fallback data for content type
     * @private
     */
    async getFallbackData(contentType, options = {}) {
        const cacheKey = `${contentType}-${JSON.stringify(options)}`;
        return this.fallbackData.get(cacheKey) || this.fallbackData.get(contentType);
    }

    /**
     * Store fallback data
     */
    storeFallbackData(contentType, data, options = {}) {
        const cacheKey = `${contentType}-${JSON.stringify(options)}`;
        this.fallbackData.set(cacheKey, {
            data,
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
        
        // Also store in localStorage
        try {
            const fallbackObj = Object.fromEntries(this.fallbackData);
            localStorage.setItem('myco-fallback-data', JSON.stringify(fallbackObj));
        } catch (error) {
            console.warn('⚠️ Failed to store fallback data:', error);
        }
    }

    /**
     * Show user notification
     * @private
     */
    showUserNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.realTimeContentService?.showUpdateNotification) {
            window.realTimeContentService.showUpdateNotification(message, type);
            return;
        }
        
        // Fallback to simple notification
        console.log(`📢 User notification (${type}):`, message);
        
        // Create simple toast notification
        this.createToastNotification(message, type);
    }

    /**
     * Create toast notification
     * @private
     */
    createToastNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            info: 'bg-blue-100 text-blue-800 border-blue-200',
            success: 'bg-green-100 text-green-800 border-green-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            error: 'bg-red-100 text-red-800 border-red-200'
        };
        
        notification.className += ` ${colors[type] || colors.info} border`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-current hover:opacity-75">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * Log error for monitoring
     * @private
     */
    logError(type, error, context = {}) {
        const errorLog = {
            type,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        console.error('🚨 Error logged:', errorLog);
        
        // Send to analytics if available
        if (window.firebaseServices?.analytics) {
            // Log error event
        }
    }

    /**
     * Log operation metrics
     * @private
     */
    logOperationMetrics(context, attempts, duration, success) {
        const metrics = {
            operation: context.operation || 'unknown',
            attempts,
            duration,
            success,
            timestamp: Date.now()
        };
        
        console.log('📊 Operation metrics:', metrics);
    }

    /**
     * Get service health status
     */
    getServiceHealth() {
        return { ...this.serviceHealth };
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            sanity: this.serviceHealth.sanity.errors.length,
            firebase: this.serviceHealth.firebase.errors.length,
            total: 0
        };
        
        stats.total = stats.sanity + stats.firebase;
        return stats;
    }

    /**
     * Utility sleep function
     * @private
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cleanup and shutdown
     */
    shutdown() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        console.log('🛑 Error resilience service shutdown');
    }
}

// Export singleton instance
export const errorResilienceService = new ErrorResilienceService();

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    await errorResilienceService.initialize();
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    errorResilienceService.shutdown();
});

export default errorResilienceService;
