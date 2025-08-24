/**
 * Service Coordinator
 * Manages integration of all enhanced services with existing MYCOgenesis architecture
 */

import { enhancedContentService } from './enhanced-content-service.js';
import { errorResilienceService } from './error-resilience-service.js';
import { dataSyncService } from './data-sync-service.js';

class ServiceCoordinator {
    constructor() {
        this.services = {
            content: enhancedContentService,
            errorResilience: errorResilienceService,
            dataSync: dataSyncService
        };
        
        this.initialized = false;
        this.healthStatus = {};
    }

    /**
     * Initialize all enhanced services
     */
    async initialize() {
        if (this.initialized) return;

        console.log('🚀 Initializing MYCOgenesis Enhanced Services...');
        
        try {
            // Initialize services in dependency order
            await this.initializeErrorResilience();
            await this.initializeDataSync();
            await this.initializeContentService();
            
            // Setup service monitoring
            this.setupServiceMonitoring();
            
            // Integrate with existing components
            this.integrateWithExistingComponents();
            
            this.initialized = true;
            console.log('✅ All enhanced services initialized successfully');
            
            // Show user notification
            this.showInitializationSuccess();
            
        } catch (error) {
            console.error('❌ Service initialization failed:', error);
            this.showInitializationError(error);
            throw error;
        }
    }

    /**
     * Initialize error resilience service first (foundational)
     */
    async initializeErrorResilience() {
        console.log('🛡️ Initializing error resilience...');
        await this.services.errorResilience.initialize();
        this.healthStatus.errorResilience = 'healthy';
    }

    /**
     * Initialize data synchronization service
     */
    async initializeDataSync() {
        console.log('🔄 Initializing data synchronization...');
        await this.services.dataSync.initialize();
        this.healthStatus.dataSync = 'healthy';
    }

    /**
     * Initialize enhanced content service
     */
    async initializeContentService() {
        console.log('📊 Initializing enhanced content service...');
        // Content service initializes automatically
        this.healthStatus.content = 'healthy';
    }

    /**
     * Setup monitoring for all services
     */
    setupServiceMonitoring() {
        // Monitor service health every 30 seconds
        setInterval(() => {
            this.checkServiceHealth();
        }, 30000);

        console.log('📊 Service monitoring enabled');
    }

    /**
     * Check health of all services
     */
    async checkServiceHealth() {
        try {
            // Check error resilience service
            const errorResilienceHealth = this.services.errorResilience.getServiceHealth();
            
            // Check content service cache status
            const contentStats = this.services.content.getCacheStats();
            
            // Update health status
            this.healthStatus = {
                errorResilience: errorResilienceHealth.connectivity.status,
                content: contentStats.size > 0 ? 'healthy' : 'warning',
                dataSync: 'healthy',
                lastCheck: Date.now()
            };
            
        } catch (error) {
            console.warn('⚠️ Health check failed:', error);
        }
    }

    /**
     * Integrate with existing MYCOgenesis components
     */
    integrateWithExistingComponents() {
        // Enhance existing content loaders
        this.enhanceProductLoader();
        this.enhanceBlogLoader();
        this.enhanceMainSiteComponents();
        
        console.log('🔗 Integration with existing components complete');
    }

    /**
     * Enhance existing product loader
     */
    enhanceProductLoader() {
        if (window.productLoader) {
            const originalLoadFeaturedProducts = window.productLoader.loadFeaturedProducts;
            
            window.productLoader.loadFeaturedProducts = async () => {
                return this.services.errorResilience.executeWithResilience(
                    () => this.services.content.loadPageContent('home', { section: 'featured-products' }),
                    { operation: 'load-featured-products', contentType: 'products' }
                );
            };

            console.log('✅ Product loader enhanced');
        }
    }

    /**
     * Enhance existing blog loader
     */
    enhanceBlogLoader() {
        if (window.blogLoader) {
            const originalLoadBlogPosts = window.blogLoader.loadBlogPosts;
            
            window.blogLoader.loadBlogPosts = async (options = {}) => {
                return this.services.errorResilience.executeWithResilience(
                    () => this.services.content.loadPageContent('blog', options),
                    { operation: 'load-blog-posts', contentType: 'blog', options }
                );
            };

            console.log('✅ Blog loader enhanced');
        }
    }

    /**
     * Enhance main site components
     */
    enhanceMainSiteComponents() {
        // Add global error handling for existing components
        window.addEventListener('error', (event) => {
            this.services.errorResilience.logError('component-error', event.error, {
                component: 'main-site',
                url: window.location.href
            });
        });

        // Enhance existing navigation if present
        this.enhanceNavigation();
        
        // Add performance monitoring
        this.addPerformanceMonitoring();
    }

    /**
     * Enhance navigation with preloading
     */
    enhanceNavigation() {
        // Preload content on hover for key navigation links
        document.querySelectorAll('a[href*="blog"], a[href*="products"]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href.includes('blog')) {
                    this.services.content.preloadContent('blog', { limit: 6 });
                } else if (href.includes('products')) {
                    this.services.content.preloadContent('product-catalog');
                }
            });
        });

        console.log('✅ Navigation enhanced with preloading');
    }

    /**
     * Add performance monitoring
     */
    addPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lcp = entries[entries.length - 1];
                console.log('📊 LCP:', lcp.startTime);
            }).observe({entryTypes: ['largest-contentful-paint']});

            // First Input Delay
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('📊 FID:', entry.processingStart - entry.startTime);
                });
            }).observe({entryTypes: ['first-input']});
        }

        console.log('✅ Performance monitoring enabled');
    }

    /**
     * Get service status for admin/debugging
     */
    getServiceStatus() {
        return {
            initialized: this.initialized,
            health: this.healthStatus,
            services: Object.keys(this.services),
            timestamp: Date.now()
        };
    }

    /**
     * Show successful initialization to user
     */
    showInitializationSuccess() {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium">Website enhanced successfully!</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show initialization error to user
     */
    showInitializationError(error) {
        console.error('🚨 Service initialization failed:', error);
        
        // Still try to show a user-friendly message
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium">Some enhancements may be limited</span>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        Object.values(this.services).forEach(service => {
            if (service.shutdown) {
                service.shutdown();
            }
        });
        
        console.log('🛑 Service coordinator shutdown complete');
    }
}

// Create singleton instance
export const serviceCoordinator = new ServiceCoordinator();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await serviceCoordinator.initialize();
    } catch (error) {
        console.warn('⚠️ Some services may not be available:', error);
        // Continue with basic functionality
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    serviceCoordinator.cleanup();
});

// Make available globally for debugging
window.serviceCoordinator = serviceCoordinator;

export default serviceCoordinator;
