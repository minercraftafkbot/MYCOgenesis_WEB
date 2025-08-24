/**
 * Enhanced Service Coordinator Extension
 * Extends the core service coordinator with integration for business pages, tutorials and FAQs
 */

import { serviceCoordinator } from './service-coordinator.js';

class EnhancedServiceCoordinator {
  constructor() {
    this.serviceCoordinator = serviceCoordinator;
    this.cacheSettings = {
      businessPages: {
        ttl: 60 * 60 * 1000, // 1 hour
        maxItems: 20
      },
      tutorials: {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        maxItems: 30
      },
      faqs: {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        maxItems: 100
      }
    };
    
    this.cache = {
      businessPages: new Map(),
      tutorials: new Map(),
      faqs: new Map(),
      categories: new Map()
    };
    
    this.pendingRequests = new Map();
    this.initialized = false;
    this.seoManager = null;
    this.uiStateManager = null;
  }

  /**
   * Initialize the enhanced coordinator
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Enhanced Service Coordinator...');
    
    // Wait for the main service coordinator to be ready
    if (!this.serviceCoordinator.initialized) {
      await this.serviceCoordinator.initialize();
    }
    
    // Setup references to other utilities
    this.setupUtilityReferences();
    
    // Add enhanced content type handlers
    this.enhanceContentServices();
    
    // Setup real-time updates if available
    this.setupRealtimeUpdates();
    
    // Setup cache cleanup
    this.setupCacheCleanup();
    
    this.initialized = true;
    console.log('✅ Enhanced Service Coordinator initialized');
    
    return this;
  }
  
  /**
   * Setup references to utility classes
   */
  setupUtilityReferences() {
    // Set up references to SEO and UI state managers if available
    if (window.seoManager) {
      this.seoManager = window.seoManager;
      console.log('✅ SEO Manager integration complete');
    }
    
    if (window.uiStateManager) {
      this.uiStateManager = window.uiStateManager;
      console.log('✅ UI State Manager integration complete');
    }
    
    // Set up reference to ContentRenderer
    if (window.ContentRenderer) {
      this.contentRenderer = window.ContentRenderer;
      console.log('✅ Content Renderer integration complete');
    }
  }
  
  /**
   * Enhance content services with new content types
   */
  enhanceContentServices() {
    const contentService = this.serviceCoordinator.services.content;
    
    // Add business page content handlers
    contentService.registerContentType('business-page', {
      load: this.loadBusinessPage.bind(this),
      preload: this.preloadBusinessPages.bind(this),
      update: this.updateBusinessPage.bind(this)
    });
    
    // Add tutorial content handlers
    contentService.registerContentType('tutorial', {
      load: this.loadTutorial.bind(this),
      preload: this.preloadTutorials.bind(this),
      update: this.updateTutorial.bind(this)
    });
    
    // Add FAQ content handlers
    contentService.registerContentType('faq', {
      load: this.loadFAQs.bind(this),
      preload: this.preloadFAQs.bind(this),
      update: this.updateFAQs.bind(this)
    });
    
    console.log('✅ Content service enhanced with new content types');
  }
  
  /**
   * Setup real-time updates via Sanity listener
   */
  setupRealtimeUpdates() {
    try {
      const dataSync = this.serviceCoordinator.services.dataSync;
      
      if (dataSync && dataSync.addDocumentListener) {
        // Listen for business page updates
        dataSync.addDocumentListener('business-page', (updatedDoc) => {
          this.updateBusinessPage(updatedDoc);
        });
        
        // Listen for tutorial updates
        dataSync.addDocumentListener('tutorial', (updatedDoc) => {
          this.updateTutorial(updatedDoc);
        });
        
        // Listen for FAQ updates
        dataSync.addDocumentListener('faq', (updatedDoc) => {
          this.updateFAQs(updatedDoc);
        });
        
        console.log('✅ Real-time updates configured');
      }
    } catch (error) {
      console.warn('⚠️ Could not set up real-time updates:', error);
    }
  }
  
  /**
   * Set up periodic cache cleanup
   */
  setupCacheCleanup() {
    // Run cache cleanup every hour
    setInterval(() => {
      this.cleanupCache();
    }, 60 * 60 * 1000);
  }
  
  /**
   * Clean up expired cache items
   */
  cleanupCache() {
    const now = Date.now();
    
    // Clean business pages cache
    for (const [slug, item] of this.cache.businessPages.entries()) {
      if (now - item.timestamp > this.cacheSettings.businessPages.ttl) {
        this.cache.businessPages.delete(slug);
      }
    }
    
    // Clean tutorials cache
    for (const [slug, item] of this.cache.tutorials.entries()) {
      if (now - item.timestamp > this.cacheSettings.tutorials.ttl) {
        this.cache.tutorials.delete(slug);
      }
    }
    
    // Clean FAQs cache
    for (const [id, item] of this.cache.faqs.entries()) {
      if (now - item.timestamp > this.cacheSettings.faqs.ttl) {
        this.cache.faqs.delete(id);
      }
    }
    
    console.log('🧹 Cache cleanup completed');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      businessPages: {
        size: this.cache.businessPages.size,
        ttl: this.cacheSettings.businessPages.ttl
      },
      tutorials: {
        size: this.cache.tutorials.size,
        ttl: this.cacheSettings.tutorials.ttl
      },
      faqs: {
        size: this.cache.faqs.size,
        ttl: this.cacheSettings.faqs.ttl
      }
    };
  }

  /**
   * Load a business page by slug
   */
  async loadBusinessPage(slug, options = {}) {
    // Check cache first
    const cachedPage = this.cache.businessPages.get(slug);
    if (cachedPage && !options.forceRefresh) {
      console.log(`📄 Serving business page from cache: ${slug}`);
      return cachedPage.data;
    }
    
    // Check for pending request to avoid duplicate fetches
    const pendingKey = `business-page:${slug}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey);
    }
    
    // Create promise for the request
    const requestPromise = this._fetchBusinessPage(slug);
    this.pendingRequests.set(pendingKey, requestPromise);
    
    try {
      // Execute the fetch and cache the result
      const result = await requestPromise;
      
      // Cache the result
      this.cache.businessPages.set(slug, {
        data: result,
        timestamp: Date.now()
      });
      
      // Ensure we don't exceed max cache size
      if (this.cache.businessPages.size > this.cacheSettings.businessPages.maxItems) {
        // Remove oldest entry
        const oldestKey = Array.from(this.cache.businessPages.keys())[0];
        this.cache.businessPages.delete(oldestKey);
      }
      
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(pendingKey);
    }
  }
  
  /**
   * Fetch business page from Sanity
   */
  async _fetchBusinessPage(slug) {
    try {
      // Use the error resilience service for reliable fetching
      return await this.serviceCoordinator.services.errorResilience.executeWithResilience(
        async () => {
          // Show loading if UI state manager exists
          if (this.uiStateManager) {
            this.uiStateManager.showLoading('#business-page-container', {
              message: 'Loading business page content...'
            });
          }
          
          const sanityService = window.sanityService;
          if (!sanityService) {
            throw new Error('Sanity service not available');
          }
          
          const query = `*[_type == "businessPage" && slug.current == $slug][0] {
            _id,
            _createdAt,
            _updatedAt,
            title,
            slug,
            seoTitle,
            seoDescription,
            excerpt,
            heroImage {
              asset-> {
                _id,
                url
              }
            },
            tags,
            mainContent[] {
              ...,
              markDefs[] {
                ...,
                _type == "internalLink" => {
                  "slug": @.reference->slug.current,
                  "type": @.reference->_type
                }
              },
              _type == "image" => {
                asset-> {
                  _id,
                  url,
                  metadata {
                    dimensions
                  }
                }
              }
            },
            sidebar[] {
              ...,
              _type == "image" => {
                asset-> {
                  _id,
                  url
                }
              }
            },
            callToAction {
              heading,
              buttonText,
              buttonUrl,
              description
            }
          }`;
          
          const page = await sanityService.fetch(query, { slug });
          
          if (!page) {
            if (this.uiStateManager) {
              this.uiStateManager.show404Error('#business-page-container', 'business page');
            }
            throw new Error(`Business page not found: ${slug}`);
          }
          
          // Update SEO if manager exists
          if (this.seoManager) {
            this.seoManager.setBusinessPageSEO(page);
          }
          
          // Clear loading state
          if (this.uiStateManager) {
            this.uiStateManager.clearState('#business-page-container');
          }
          
          return page;
        },
        { 
          operation: 'load-business-page', 
          contentType: 'business-page', 
          slug 
        }
      );
    } catch (error) {
      console.error(`Failed to load business page (${slug}):`, error);
      
      // Show error state
      if (this.uiStateManager) {
        this.uiStateManager.showError('#business-page-container', {
          title: 'Could not load business page',
          message: 'We encountered an error while loading this business page. Please try again later.',
          retry: true,
          onRetry: () => this.loadBusinessPage(slug, { forceRefresh: true })
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Preload business pages
   */
  async preloadBusinessPages(options = {}) {
    const { limit = 5, category = null } = options;
    
    try {
      const sanityService = window.sanityService;
      if (!sanityService) return [];
      
      let query = `*[_type == "businessPage"`;
      
      if (category) {
        query += ` && $category in tags`;
      }
      
      query += `] | order(_createdAt desc)[0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        heroImage {
          asset-> {
            _id,
            url
          }
        }
      }`;
      
      const pages = await sanityService.fetch(query, { category });
      
      // Cache the results
      pages.forEach(page => {
        this.cache.businessPages.set(page.slug.current, {
          data: page,
          timestamp: Date.now()
        });
      });
      
      return pages;
    } catch (error) {
      console.warn('Failed to preload business pages:', error);
      return [];
    }
  }
  
  /**
   * Update a business page in the cache
   */
  updateBusinessPage(updatedDoc) {
    if (!updatedDoc.slug || !updatedDoc.slug.current) return;
    
    const slug = updatedDoc.slug.current;
    
    // If this page is in the cache, update it
    if (this.cache.businessPages.has(slug)) {
      console.log(`🔄 Updating cached business page: ${slug}`);
      
      this.cache.businessPages.set(slug, {
        data: updatedDoc,
        timestamp: Date.now()
      });
      
      // Notify subscribers if any
      this.notifyContentSubscribers('business-page', slug, updatedDoc);
    }
  }
  
  /**
   * Load a tutorial by slug
   */
  async loadTutorial(slug, options = {}) {
    // Check cache first
    const cachedTutorial = this.cache.tutorials.get(slug);
    if (cachedTutorial && !options.forceRefresh) {
      console.log(`📄 Serving tutorial from cache: ${slug}`);
      return cachedTutorial.data;
    }
    
    // Check for pending request
    const pendingKey = `tutorial:${slug}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey);
    }
    
    // Create promise for the request
    const requestPromise = this._fetchTutorial(slug);
    this.pendingRequests.set(pendingKey, requestPromise);
    
    try {
      // Execute the fetch and cache the result
      const result = await requestPromise;
      
      // Cache the result
      this.cache.tutorials.set(slug, {
        data: result,
        timestamp: Date.now()
      });
      
      // Ensure we don't exceed max cache size
      if (this.cache.tutorials.size > this.cacheSettings.tutorials.maxItems) {
        const oldestKey = Array.from(this.cache.tutorials.keys())[0];
        this.cache.tutorials.delete(oldestKey);
      }
      
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(pendingKey);
    }
  }
  
  /**
   * Fetch tutorial from Sanity
   */
  async _fetchTutorial(slug) {
    try {
      // Use the error resilience service for reliable fetching
      return await this.serviceCoordinator.services.errorResilience.executeWithResilience(
        async () => {
          // Show loading if UI state manager exists
          if (this.uiStateManager) {
            this.uiStateManager.showSkeleton('#tutorial-container', 'tutorial');
          }
          
          const sanityService = window.sanityService;
          if (!sanityService) {
            throw new Error('Sanity service not available');
          }
          
          const query = `*[_type == "tutorial" && slug.current == $slug][0] {
            _id,
            _createdAt,
            _updatedAt,
            title,
            slug,
            seoTitle,
            seoDescription,
            description,
            difficulty,
            estimatedTime,
            estimatedCost,
            category,
            featuredImage {
              asset-> {
                _id,
                url
              }
            },
            overview[] {
              ...,
              markDefs[] {
                ...,
                _type == "internalLink" => {
                  "slug": @.reference->slug.current,
                  "type": @.reference->_type
                }
              },
              _type == "image" => {
                asset-> {
                  _id,
                  url
                }
              }
            },
            materials[] {
              name,
              quantity,
              optional
            },
            steps[] {
              title,
              description[] {
                ...,
                markDefs[] {
                  ...,
                  _type == "internalLink" => {
                    "slug": @.reference->slug.current,
                    "type": @.reference->_type
                  }
                }
              },
              image {
                asset-> {
                  _id,
                  url
                }
              },
              video,
              tips[] {
                text
              }
            },
            relatedTutorials[]-> {
              _id,
              title,
              slug,
              difficulty
            }
          }`;
          
          const tutorial = await sanityService.fetch(query, { slug });
          
          if (!tutorial) {
            if (this.uiStateManager) {
              this.uiStateManager.show404Error('#tutorial-container', 'tutorial');
            }
            throw new Error(`Tutorial not found: ${slug}`);
          }
          
          // Update SEO if manager exists
          if (this.seoManager) {
            this.seoManager.setTutorialSEO(tutorial);
          }
          
          // Clear loading state
          if (this.uiStateManager) {
            this.uiStateManager.clearState('#tutorial-container');
          }
          
          return tutorial;
        },
        { 
          operation: 'load-tutorial', 
          contentType: 'tutorial', 
          slug 
        }
      );
    } catch (error) {
      console.error(`Failed to load tutorial (${slug}):`, error);
      
      // Show error state
      if (this.uiStateManager) {
        this.uiStateManager.showError('#tutorial-container', {
          title: 'Could not load tutorial',
          message: 'We encountered an error while loading this tutorial. Please try again later.',
          retry: true,
          onRetry: () => this.loadTutorial(slug, { forceRefresh: true })
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Preload tutorials
   */
  async preloadTutorials(options = {}) {
    const { limit = 5, category = null, difficulty = null } = options;
    
    try {
      const sanityService = window.sanityService;
      if (!sanityService) return [];
      
      let query = `*[_type == "tutorial"`;
      
      if (category) {
        query += ` && category == $category`;
      }
      
      if (difficulty) {
        query += ` && difficulty == $difficulty`;
      }
      
      query += `] | order(_createdAt desc)[0...${limit}] {
        _id,
        title,
        slug,
        description,
        difficulty,
        estimatedTime,
        featuredImage {
          asset-> {
            _id,
            url
          }
        }
      }`;
      
      const tutorials = await sanityService.fetch(query, { category, difficulty });
      
      // Cache the results
      tutorials.forEach(tutorial => {
        this.cache.tutorials.set(tutorial.slug.current, {
          data: tutorial,
          timestamp: Date.now()
        });
      });
      
      return tutorials;
    } catch (error) {
      console.warn('Failed to preload tutorials:', error);
      return [];
    }
  }
  
  /**
   * Update a tutorial in the cache
   */
  updateTutorial(updatedDoc) {
    if (!updatedDoc.slug || !updatedDoc.slug.current) return;
    
    const slug = updatedDoc.slug.current;
    
    // If this tutorial is in the cache, update it
    if (this.cache.tutorials.has(slug)) {
      console.log(`🔄 Updating cached tutorial: ${slug}`);
      
      this.cache.tutorials.set(slug, {
        data: updatedDoc,
        timestamp: Date.now()
      });
      
      // Notify subscribers if any
      this.notifyContentSubscribers('tutorial', slug, updatedDoc);
    }
  }
  
  /**
   * Load FAQs with optional filtering
   */
  async loadFAQs(options = {}) {
    const { category = null, searchTerm = null, limit = 100, forceRefresh = false } = options;
    
    // Create a cache key based on options
    const cacheKey = `faqs:${category || 'all'}:${searchTerm || 'none'}:${limit}`;
    
    // Check cache first
    const cachedFAQs = this.cache.faqs.get(cacheKey);
    if (cachedFAQs && !forceRefresh) {
      console.log(`📄 Serving FAQs from cache: ${cacheKey}`);
      return cachedFAQs.data;
    }
    
    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Create promise for the request
    const requestPromise = this._fetchFAQs(options);
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      // Execute the fetch and cache the result
      const result = await requestPromise;
      
      // Cache the result
      this.cache.faqs.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      // Ensure we don't exceed max cache size
      if (this.cache.faqs.size > this.cacheSettings.faqs.maxItems) {
        const oldestKey = Array.from(this.cache.faqs.keys())[0];
        this.cache.faqs.delete(oldestKey);
      }
      
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  /**
   * Fetch FAQs from Sanity
   */
  async _fetchFAQs(options = {}) {
    const { category = null, searchTerm = null, limit = 100 } = options;
    
    try {
      // Use the error resilience service for reliable fetching
      return await this.serviceCoordinator.services.errorResilience.executeWithResilience(
        async () => {
          // Show loading if UI state manager exists
          if (this.uiStateManager) {
            this.uiStateManager.showSkeleton('#faq-container', 'faq-list');
          }
          
          const sanityService = window.sanityService;
          if (!sanityService) {
            throw new Error('Sanity service not available');
          }
          
          let query = `*[_type == "faq"`;
          
          if (category) {
            query += ` && $category in categories`;
          }
          
          if (searchTerm) {
            query += ` && (question match $searchTerm || pt::text(answer) match $searchTerm)`;
          }
          
          query += `] | order(popular desc)[0...${limit}] {
            _id,
            _createdAt,
            question,
            answer[] {
              ...,
              markDefs[] {
                ...,
                _type == "internalLink" => {
                  "slug": @.reference->slug.current,
                  "type": @.reference->_type
                }
              },
              _type == "image" => {
                asset-> {
                  _id,
                  url
                }
              }
            },
            categories,
            popular,
            relatedFAQs[]-> {
              _id,
              question,
              categories
            },
            relatedContent[]-> {
              _id,
              _type,
              title,
              slug
            }
          }`;
          
          const faqs = await sanityService.fetch(query, { 
            category, 
            searchTerm: searchTerm ? `*${searchTerm}*` : undefined
          });
          
          // Also fetch all categories
          if (!this.cache.categories.has('faq-categories')) {
            const categoriesQuery = `*[_type == "faqCategory"] | order(title) {
              _id,
              title,
              slug,
              description
            }`;
            
            const categories = await sanityService.fetch(categoriesQuery);
            
            this.cache.categories.set('faq-categories', {
              data: categories,
              timestamp: Date.now()
            });
          }
          
          // Update SEO if manager exists and we're loading the main FAQ page
          if (this.seoManager) {
            this.seoManager.setFAQSEO(faqs, searchTerm, category);
          }
          
          // Clear loading state
          if (this.uiStateManager) {
            this.uiStateManager.clearState('#faq-container');
            
            // Show empty state if no results
            if (faqs.length === 0 && (searchTerm || category)) {
              if (searchTerm) {
                this.uiStateManager.showSearchEmpty('#faq-container', searchTerm);
              } else {
                this.uiStateManager.showEmpty('#faq-container', {
                  title: 'No FAQs found',
                  message: `There are no FAQs in the ${category} category yet.`,
                  icon: '🔍'
                });
              }
            }
          }
          
          return faqs;
        },
        { 
          operation: 'load-faqs', 
          contentType: 'faq', 
          options
        }
      );
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      
      // Show error state
      if (this.uiStateManager) {
        this.uiStateManager.showError('#faq-container', {
          title: 'Could not load FAQs',
          message: 'We encountered an error while loading FAQs. Please try again later.',
          retry: true,
          onRetry: () => this.loadFAQs({ ...options, forceRefresh: true })
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Get FAQ categories
   */
  async getFAQCategories() {
    const cachedCategories = this.cache.categories.get('faq-categories');
    if (cachedCategories) {
      return cachedCategories.data;
    }
    
    try {
      const sanityService = window.sanityService;
      if (!sanityService) {
        throw new Error('Sanity service not available');
      }
      
      const query = `*[_type == "faqCategory"] | order(title) {
        _id,
        title,
        slug,
        description
      }`;
      
      const categories = await sanityService.fetch(query);
      
      this.cache.categories.set('faq-categories', {
        data: categories,
        timestamp: Date.now()
      });
      
      return categories;
    } catch (error) {
      console.error('Failed to load FAQ categories:', error);
      return [];
    }
  }
  
  /**
   * Preload FAQs
   */
  async preloadFAQs(options = {}) {
    // Simply call loadFAQs with preload flag
    return this.loadFAQs({ ...options, isPreload: true });
  }
  
  /**
   * Update FAQs in the cache
   */
  updateFAQs(updatedDoc) {
    // Since FAQs are cached by query, we'll just invalidate all FAQ caches
    for (const key of this.cache.faqs.keys()) {
      if (key.startsWith('faqs:')) {
        this.cache.faqs.delete(key);
      }
    }
    
    console.log('🔄 FAQ cache invalidated due to update');
  }
  
  /**
   * Submit FAQ rating
   */
  async submitFAQRating(faqId, rating, feedback = '') {
    try {
      const sanityService = window.sanityService;
      if (!sanityService || !sanityService.client) {
        throw new Error('Sanity service not available');
      }
      
      // Create a document for the rating
      const ratingDoc = {
        _type: 'faqRating',
        faq: {
          _type: 'reference',
          _ref: faqId
        },
        rating,
        feedback,
        timestamp: new Date().toISOString()
      };
      
      // Submit rating to Sanity
      await sanityService.client.create(ratingDoc);
      
      console.log(`✅ Rating submitted for FAQ ${faqId}`);
      return true;
    } catch (error) {
      console.error('Failed to submit FAQ rating:', error);
      return false;
    }
  }
  
  /**
   * Notify subscribers of content updates
   */
  notifyContentSubscribers(contentType, id, data) {
    // Dispatch a custom event for components to listen to
    const event = new CustomEvent('content-update', {
      detail: {
        contentType,
        id,
        data
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Track user progress on tutorials
   */
  trackTutorialProgress(tutorialSlug, stepIndex, completed = false) {
    try {
      // Retrieve existing progress
      const progressKey = `tutorial-progress:${tutorialSlug}`;
      let progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      // Update progress
      if (completed) {
        progress.completed = true;
        progress.completedAt = new Date().toISOString();
      } else {
        progress.lastStep = stepIndex;
        progress.lastAccessed = new Date().toISOString();
      }
      
      // Save progress
      localStorage.setItem(progressKey, JSON.stringify(progress));
      
      return progress;
    } catch (error) {
      console.warn('Failed to track tutorial progress:', error);
      return null;
    }
  }
  
  /**
   * Get tutorial progress
   */
  getTutorialProgress(tutorialSlug) {
    try {
      const progressKey = `tutorial-progress:${tutorialSlug}`;
      return JSON.parse(localStorage.getItem(progressKey) || '{}');
    } catch (error) {
      console.warn('Failed to get tutorial progress:', error);
      return {};
    }
  }
  
  /**
   * Get status for admin/debugging
   */
  getStatus() {
    return {
      initialized: this.initialized,
      cacheStats: this.getCacheStats(),
      pendingRequests: Array.from(this.pendingRequests.keys()),
      utilities: {
        seoManager: !!this.seoManager,
        uiStateManager: !!this.uiStateManager,
        contentRenderer: !!this.contentRenderer
      }
    };
  }
}

// Create singleton instance
export const enhancedServiceCoordinator = new EnhancedServiceCoordinator();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await enhancedServiceCoordinator.initialize();
  } catch (error) {
    console.warn('⚠️ Enhanced service coordinator initialization failed:', error);
    // Continue with basic functionality
  }
});

// Make available globally
window.enhancedServiceCoordinator = enhancedServiceCoordinator;

export default enhancedServiceCoordinator;
