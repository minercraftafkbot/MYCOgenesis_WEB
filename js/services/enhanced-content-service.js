/**
 * Enhanced Content Service with Performance Optimizations
 * Implements parallel loading, advanced caching, and error resilience
 */

export class EnhancedContentService {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.contentTypes = new Map(); // Store registered content types
    }

    /**
     * Load page content with parallel API calls and intelligent caching
     * @param {string} pageType - Type of page (home, blog, product, etc.)
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} - Combined content data
     */
    async loadPageContent(pageType, options = {}) {
        const cacheKey = `${pageType}-${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📦 Returning cached content for:', pageType);
                return cached.data;
            }
        }

        // Check if already loading
        if (this.loadingPromises.has(cacheKey)) {
            console.log('⏳ Content already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        // Create loading promise
        const loadingPromise = this.performParallelLoad(pageType, options);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const result = await loadingPromise;
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            console.error('❌ Error loading content:', error);
            throw error;
        } finally {
            // Clean up loading promise
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Perform parallel loading of content from multiple sources
     * @private
     */
    async performParallelLoad(pageType, options) {
        console.log('🚀 Starting parallel content load for:', pageType);
        
        const startTime = performance.now();
        
        try {
            // Define parallel operations based on page type
            const operations = this.getOperationsForPageType(pageType, options);
            
            // Execute all operations in parallel with timeout and retry
            const results = await Promise.allSettled(
                operations.map(operation => this.executeWithRetry(operation))
            );

            // Process results and handle failures gracefully
            const processedData = this.processParallelResults(results, operations);
            
            const endTime = performance.now();
            console.log(`✅ Parallel load completed in ${(endTime - startTime).toFixed(2)}ms`);
            
            return processedData;

        } catch (error) {
            console.error('❌ Parallel load failed:', error);
            // Return fallback data instead of complete failure
            return this.getFallbackContent(pageType);
        }
    }

    /**
     * Get operations to execute based on page type
     * @private
     */
    getOperationsForPageType(pageType, options) {
        const operations = [];

        switch (pageType) {
            case 'home':
                operations.push(
                    {
                        name: 'featuredProducts',
                        fn: () => window.sanityService?.getFeaturedProducts(3),
                        required: true
                    },
                    {
                        name: 'featuredBlogPosts',
                        fn: () => window.sanityService?.getBlogPosts({ featured: true, limit: 3 }),
                        required: false
                    },
                    {
                        name: 'categories',
                        fn: () => window.sanityService?.getCategories(),
                        required: false
                    },
                    {
                        name: 'pageAnalytics',
                        fn: () => this.getPageAnalytics('home'),
                        required: false
                    }
                );
                break;

            case 'blog':
                operations.push(
                    {
                        name: 'blogPosts',
                        fn: () => window.sanityService?.getBlogPosts({ limit: options.limit || 12 }),
                        required: true
                    },
                    {
                        name: 'categories',
                        fn: () => window.publicContentService?.getBlogCategories(),
                        required: false
                    },
                    {
                        name: 'featuredPosts',
                        fn: () => window.sanityService?.getBlogPosts({ featured: true, limit: 3 }),
                        required: false
                    }
                );
                break;

            case 'product-catalog':
                operations.push(
                    {
                        name: 'products',
                        fn: () => window.sanityService?.getAvailableProducts(options),
                        required: true
                    },
                    {
                        name: 'categories',
                        fn: () => window.sanityService?.getCategories(),
                        required: true
                    },
                    {
                        name: 'featuredProducts',
                        fn: () => window.sanityService?.getFeaturedProducts(3),
                        required: false
                    }
                );
                break;

            case 'single-product':
                operations.push(
                    {
                        name: 'product',
                        fn: () => window.sanityService?.getProduct(options.slug),
                        required: true
                    },
                    {
                        name: 'relatedProducts',
                        fn: () => this.getRelatedProducts(options.slug),
                        required: false
                    },
                    {
                        name: 'productViews',
                        fn: () => this.getProductAnalytics(options.slug),
                        required: false
                    }
                );
                break;

            case 'single-blog-post':
                operations.push(
                    {
                        name: 'blogPost',
                        fn: () => window.sanityService?.getBlogPost(options.slug),
                        required: true
                    },
                    {
                        name: 'relatedPosts',
                        fn: () => this.getRelatedBlogPosts(options.slug),
                        required: false
                    },
                    {
                        name: 'postViews',
                        fn: () => this.getBlogPostAnalytics(options.slug),
                        required: false
                    }
                );
                break;

            default:
                console.warn(`Unknown page type: ${pageType}`);
                return [];
        }

        return operations;
    }

    /**
     * Execute operation with retry logic and timeout
     * @private
     */
    async executeWithRetry(operation, attempt = 1) {
        const timeout = 5000; // 5 seconds timeout
        
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Operation timeout')), timeout);
            });

            // Race between operation and timeout
            const result = await Promise.race([
                operation.fn(),
                timeoutPromise
            ]);

            return {
                name: operation.name,
                status: 'fulfilled',
                value: result,
                required: operation.required
            };

        } catch (error) {
            console.warn(`⚠️ Operation ${operation.name} failed (attempt ${attempt}):`, error.message);

            // Retry if not the last attempt
            if (attempt < this.retryAttempts) {
                console.log(`🔄 Retrying ${operation.name} (${attempt}/${this.retryAttempts})`);
                await this.delay(this.retryDelay * attempt); // Exponential backoff
                return this.executeWithRetry(operation, attempt + 1);
            }

            return {
                name: operation.name,
                status: 'rejected',
                reason: error,
                required: operation.required
            };
        }
    }

    /**
     * Process results from parallel operations
     * @private
     */
    processParallelResults(results, operations) {
        const processedData = {
            success: true,
            data: {},
            errors: [],
            performance: {
                totalOperations: results.length,
                successful: 0,
                failed: 0,
                criticalFailures: 0
            }
        };

        results.forEach((result, index) => {
            const operation = operations[index];
            
            if (result.status === 'fulfilled') {
                processedData.data[operation.name] = result.value;
                processedData.performance.successful++;
            } else {
                const error = {
                    operation: operation.name,
                    error: result.reason?.message || 'Unknown error',
                    required: operation.required
                };
                
                processedData.errors.push(error);
                processedData.performance.failed++;
                
                if (operation.required) {
                    processedData.performance.criticalFailures++;
                }
                
                // Set fallback data for failed operations
                processedData.data[operation.name] = this.getFallbackDataForOperation(operation.name);
            }
        });

        // Determine overall success
        processedData.success = processedData.performance.criticalFailures === 0;

        console.log('📊 Load Performance:', processedData.performance);
        
        if (processedData.errors.length > 0) {
            console.warn('⚠️ Some operations failed:', processedData.errors);
        }

        return processedData;
    }

    /**
     * Get fallback data for failed operations
     * @private
     */
    getFallbackDataForOperation(operationName) {
        const fallbacks = {
            featuredProducts: [],
            blogPosts: [],
            featuredBlogPosts: [],
            categories: [],
            product: null,
            blogPost: null,
            relatedProducts: [],
            relatedPosts: [],
            pageAnalytics: { views: 0, lastViewed: null },
            productViews: { views: 0, lastViewed: null },
            postViews: { views: 0, lastViewed: null }
        };

        return fallbacks[operationName] || null;
    }

    /**
     * Get fallback content for entire page
     * @private
     */
    getFallbackContent(pageType) {
        return {
            success: false,
            data: this.getFallbackDataForOperation('default'),
            errors: [`Failed to load content for ${pageType}`],
            performance: {
                totalOperations: 0,
                successful: 0,
                failed: 1,
                criticalFailures: 1
            }
        };
    }

    /**
     * Helper methods for specific data fetching
     */
    async getPageAnalytics(page) {
        // Placeholder for Firebase Analytics integration
        return { views: 0, lastViewed: null };
    }

    async getProductAnalytics(productSlug) {
        // Placeholder for product-specific analytics
        return { views: 0, lastViewed: null };
    }

    async getBlogPostAnalytics(postSlug) {
        // Placeholder for blog post analytics
        return { views: 0, lastViewed: null };
    }

    async getRelatedProducts(productSlug) {
        // Get related products based on category or tags
        try {
            const product = await window.sanityService?.getProduct(productSlug);
            if (product?.category) {
                return window.sanityService?.getAvailableProducts({
                    category: product.category.slug,
                    limit: 4
                });
            }
        } catch (error) {
            console.warn('Failed to get related products:', error);
        }
        return [];
    }

    async getRelatedBlogPosts(postSlug) {
        // Get related blog posts
        try {
            const post = await window.sanityService?.getBlogPost(postSlug);
            if (post) {
                return window.publicContentService?.getRelatedBlogPosts(post, 3);
            }
        } catch (error) {
            console.warn('Failed to get related posts:', error);
        }
        return [];
    }

    /**
     * Utility delay function
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear cache manually
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Content cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            activeLoading: this.loadingPromises.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Register a new content type with handlers
     * @param {string} contentType - Name of the content type
     * @param {Object} handlers - Object with load, preload, update methods
     */
    registerContentType(contentType, handlers) {
        if (!contentType || typeof contentType !== 'string') {
            throw new Error('Content type must be a non-empty string');
        }
        
        if (!handlers || typeof handlers !== 'object') {
            throw new Error('Handlers must be an object');
        }
        
        // Validate required methods
        const requiredMethods = ['load'];
        for (const method of requiredMethods) {
            if (!handlers[method] || typeof handlers[method] !== 'function') {
                throw new Error(`Handler must include ${method} method`);
            }
        }
        
        this.contentTypes.set(contentType, {
            load: handlers.load,
            preload: handlers.preload || (() => Promise.resolve()),
            update: handlers.update || (() => Promise.resolve()),
            registered: Date.now()
        });
        
        console.log(`📝 Content type '${contentType}' registered successfully`);
    }
    
    /**
     * Get registered content type handler
     * @param {string} contentType - Name of the content type
     * @returns {Object|null} - Content type handler or null if not found
     */
    getContentTypeHandler(contentType) {
        return this.contentTypes.get(contentType) || null;
    }
    
    /**
     * Load content using registered content type handler
     * @param {string} contentType - Name of the content type
     * @param {Object} options - Loading options
     * @returns {Promise<any>} - Content data
     */
    async loadContentType(contentType, options = {}) {
        const handler = this.getContentTypeHandler(contentType);
        if (!handler) {
            throw new Error(`Content type '${contentType}' is not registered`);
        }
        
        try {
            console.log(`🔄 Loading content type: ${contentType}`);
            const result = await handler.load(options);
            console.log(`✅ Content type '${contentType}' loaded successfully`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to load content type '${contentType}':`, error);
            throw error;
        }
    }
    
    /**
     * Update content using registered content type handler
     * @param {string} contentType - Name of the content type
     * @param {any} data - Update data
     * @returns {Promise<any>} - Update result
     */
    async updateContentType(contentType, data) {
        const handler = this.getContentTypeHandler(contentType);
        if (!handler) {
            throw new Error(`Content type '${contentType}' is not registered`);
        }
        
        try {
            console.log(`🔄 Updating content type: ${contentType}`);
            const result = await handler.update(data);
            console.log(`✅ Content type '${contentType}' updated successfully`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to update content type '${contentType}':`, error);
            throw error;
        }
    }
    
    /**
     * Preload content for better performance
     */
    async preloadContent(pageType, options = {}) {
        console.log('🚀 Preloading content for:', pageType);
        try {
            await this.loadPageContent(pageType, options);
            console.log('✅ Preload completed for:', pageType);
        } catch (error) {
            console.warn('⚠️ Preload failed for:', pageType, error);
        }
    }
}

// Export singleton instance
export const enhancedContentService = new EnhancedContentService();

// Auto-preload critical content on page load
document.addEventListener('DOMContentLoaded', () => {
    // Preload home page content
    enhancedContentService.preloadContent('home');
    
    // Preload based on current page
    const path = window.location.pathname;
    if (path.includes('blog')) {
        enhancedContentService.preloadContent('blog', { limit: 6 });
    } else if (path.includes('products')) {
        enhancedContentService.preloadContent('product-catalog');
    }
});

export default enhancedContentService;
