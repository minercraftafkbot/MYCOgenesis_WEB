/**
 * Enhanced Home Page Content Loader
 * Integrates with enhanced service coordinator for products and blog content
 */

import { publicContentService } from '../services/public-content-service.js';
import { sanityService } from '../services/sanity-service.js';

export class EnhancedHomeLoader {
  constructor() {
    this.isLoading = false;
    this.enhancedCoordinator = null;
    this.uiStateManager = null;
    this.seoManager = null;
    this.sanityService = sanityService;
  }

  /**
   * Initialize the enhanced home loader
   */
  async init() {
    console.log('🚀 Initializing Enhanced Home Loader...');
    
    // Wait for enhanced services to be available
    await this.waitForServices();
    
    // Setup service references
    this.setupServiceReferences();
    
    // Load content sections
    await this.loadAllContent();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ Enhanced Home Loader initialized');
  }

  /**
   * Wait for enhanced services to be available
   */
  async waitForServices() {
    let attempts = 0;
    const maxAttempts = 10;
    const waitTime = 500; // ms

    while (attempts < maxAttempts) {
      if (window.enhancedServiceCoordinator && window.enhancedServiceCoordinator.initialized) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
    }
    
    console.warn('⚠️ Enhanced services not available, using fallback');
  }

  /**
   * Setup references to enhanced services
   */
  setupServiceReferences() {
    if (window.enhancedServiceCoordinator && window.enhancedServiceCoordinator.initialized) {
      this.enhancedCoordinator = window.enhancedServiceCoordinator;
      this.uiStateManager = this.enhancedCoordinator.uiStateManager;
      this.seoManager = this.enhancedCoordinator.seoManager;
      console.log('✅ Enhanced services connected');
    }
  }

  /**
   * Load all content sections
   */
  async loadAllContent() {
    // Load sections in parallel for better performance
    const promises = [
      this.loadFeaturedProducts(),
      this.loadShopProducts(),
      this.loadBlogPreview()
    ];

    await Promise.allSettled(promises);
  }

  /**
   * Load featured products with enhanced caching and error handling
   */
  async loadFeaturedProducts() {
    const container = document.querySelector('#featured-products .grid');
    if (!container) return;

    try {
      // Use UI state manager if available
      if (this.uiStateManager) {
        const products = await this.uiStateManager.handleAsyncOperation(
          container,
          () => this.fetchFeaturedProducts(),
          {
            loadingMessage: 'Loading featured products...',
            errorTitle: 'Failed to Load Products',
            errorMessage: 'We couldn\'t load our featured products. Please try again.',
            emptyTitle: 'No Products Available',
            emptyMessage: 'Featured products will be displayed here soon.',
            skeleton: true,
            skeletonType: 'card-grid',
            onRetry: () => this.loadFeaturedProducts()
          }
        );

        if (products) {
          this.renderFeaturedProducts(products);
        }
      } else {
        // Fallback to direct loading
        this.showProductsLoading();
        const products = await this.fetchFeaturedProducts();
        this.hideProductsLoading();
        this.renderFeaturedProducts(products);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      this.showProductsError('Failed to load featured products');
    }
  }

  /**
   * Fetch featured products using enhanced coordinator or fallback
   */
  async fetchFeaturedProducts() {
    try {
      const products = await this.sanityService.getFeaturedProducts(3);
      return products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.shortDescription || product.description,
        image: product.images && product.images.length > 0 
          ? this.sanityService.urlFor(product.images[0]).url() 
          : 'images/product-placeholder.jpg',
        price: product.price,
        slug: product.slug.current,
        category: product.category?.name || 'Mushroom',
        status: product.availability || 'in-stock'
      }));
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Fallback to public content service
      return await publicContentService.getFeaturedProducts();
    }
  }

  /**
   * Fetch latest blog posts using Sanity
   */
  async fetchLatestBlogPosts() {
    try {
      const posts = await this.sanityService.getBlogPosts({
        limit: 3,
        page: 1
      });
      
      return posts.map(post => ({
        id: post._id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.mainImage 
          ? this.sanityService.urlFor(post.mainImage).url() 
          : 'images/blog-placeholder.jpg',
        slug: post.slug.current,
        category: post.category?.title || 'Mycology',
        author: post.author?.name || 'MYCOgenesis Team',
        date: new Date(post.publishedAt).toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error fetching latest blog posts:', error);
      // Fallback to public content service
      return await publicContentService.getLatestPosts();
    }
  }
  /**
   * Load featured products section
   */
  async loadFeaturedProducts() {
    try {
      const products = await this.fetchFeaturedProducts();
      this.renderFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading featured products:', error);
      this.showProductsError('Failed to load featured products');
    }
  }

  /**
   * Fetch featured products using Sanity
   */
  async fetchFeaturedProducts() {
    try {
      const products = await this.sanityService.getFeaturedProducts(3);
      return products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.shortDescription || product.description,
        image: product.images && product.images.length > 0 
          ? this.sanityService.urlFor(product.images[0]).url() 
          : 'images/product-placeholder.jpg',
        price: product.price || 0,
        slug: product.slug.current,
        category: product.category?.name || 'Mushroom',
        status: product.availability || 'in-stock'
      }));
    } catch (error) {
      console.warn('Sanity products not available, using fallback:', error);
      return await publicContentService.getFeaturedProducts(3);
    }
  }

  /**
   * Render featured products
   */
  renderFeaturedProducts(products) {
    const container = document.querySelector('#featured-products .grid');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-6xl mb-4">🍄</div>
          <h3 class="text-xl font-semibold text-slate-800 mb-2">Featured Products Coming Soon</h3>
          <p class="text-slate-600">We're preparing our best mushroom varieties for you!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    
    // Track analytics if available
    this.trackProductsLoaded(products.length);
  }

  /**
   * Render individual product card
   */
  renderProductCard(product) {
    const imageUrl = this.getProductImageUrl(product);
    const imageAlt = product.featuredImage?.alt || product.name;
    const description = product.shortDescription || product.description || '';
    const productUrl = this.getProductUrl(product);

    return `
      <div class="enhanced-card rounded-2xl overflow-hidden group w-full max-w-sm fade-in-up">
        <div class="relative overflow-hidden">
          <img 
            src="${imageUrl}" 
            alt="${imageAlt}" 
            class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-700 rounded-full text-xs font-medium">
              🌱 Fresh
            </span>
          </div>
        </div>
        <div class="p-8">
          <h3 class="font-bold text-xl mb-3 group-hover:text-teal-600 transition-colors duration-200">
            ${product.name}
          </h3>
          <p class="text-slate-600 mb-6 line-clamp-2 leading-relaxed">${description}</p>
          <div class="flex justify-between items-center">
            <a 
              href="${productUrl}" 
              class="inline-flex items-center text-teal-600 hover:text-teal-800 font-semibold transition-all duration-200 group-hover:translate-x-1"
              data-product-id="${product._id || product.id}"
            >
              Learn More 
              <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            ${this.renderAvailabilityBadge(product.availability)}
          </div>
          ${product.price ? `<div class="mt-4 text-xl font-bold text-teal-600">$${product.price}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Load shop products with enhanced features
   */
  async loadShopProducts() {
    const container = document.querySelector('#shop .grid');
    if (!container) return;

    try {
      // Use UI state manager if available
      if (this.uiStateManager) {
        const products = await this.uiStateManager.handleAsyncOperation(
          container,
          () => this.fetchShopProducts(),
          {
            loadingMessage: 'Loading shop products...',
            errorTitle: 'Failed to Load Shop Products',
            errorMessage: 'We couldn\'t load our shop products. Please try again.',
            emptyTitle: 'Shop Coming Soon',
            emptyMessage: 'Our online store will be available soon!',
            skeleton: true,
            skeletonType: 'card-grid',
            onRetry: () => this.loadShopProducts()
          }
        );

        if (products) {
          this.renderShopProducts(products);
        }
      } else {
        // Fallback to direct loading
        this.showShopLoading();
        const products = await this.fetchShopProducts();
        this.hideShopLoading();
        this.renderShopProducts(products);
      }
    } catch (error) {
      console.error('Error loading shop products:', error);
      this.showShopError('Failed to load shop products');
    }
  }

  /**
   * Fetch shop products using enhanced coordinator or fallback
   */
  async fetchShopProducts() {
    // Try to use enhanced coordinator first
    if (this.enhancedCoordinator) {
      try {
        // Check if we can preload from Sanity
        const sanityService = window.sanityService;
        if (sanityService) {
          const query = `*[_type == "product" && availability == "available"] | order(priority desc, _createdAt desc)[0...6] {
            _id,
            name,
            slug,
            description,
            shortDescription,
            featuredImage {
              asset-> {
                _id,
                url
              },
              alt
            },
            availability,
            price,
            category,
            featured,
            priority
          }`;
          
          return await sanityService.fetch(query);
        }
      } catch (error) {
        console.warn('Sanity shop products not available, using Firestore fallback:', error);
      }
    }
    
    // Fallback to existing Firestore service
    return await publicContentService.getAvailableProducts(6);
  }

  /**
   * Render shop products
   */
  renderShopProducts(products) {
    const container = document.querySelector('#shop .grid');
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="enhanced-card max-w-2xl mx-auto p-12 rounded-2xl">
            <div class="text-6xl mb-6">🛒</div>
            <h3 class="text-2xl font-bold text-slate-800 mb-4">Online Store Coming Soon</h3>
            <p class="text-slate-600 mb-8 text-lg leading-relaxed">Get ready to order fresh, sustainably grown mushrooms delivered straight from our smart farm to your door.</p>
            <div class="flex flex-wrap gap-3 justify-center mb-8">
              <span class="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-sm font-medium">🚚 Fresh Delivery</span>
              <span class="px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium">🏭 Farm Direct</span>
              <span class="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm font-medium">🌱 Sustainable</span>
              <span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">⭐ Premium Quality</span>
          </div>
          <button 
            class="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            onclick="alert('Thank you for your interest! We\'ll notify you when our online store launches.')">
            🔔 Notify Me When Available
          </button>
          </div>
        </div>
      `;
      console.log('🛒 No shop products available, showing coming soon message');
      return;
    }

    container.innerHTML = products.map(product => this.renderShopProductCard(product)).join('');
    
    // Track analytics
    this.trackShopProductsLoaded(products.length);
  }

  /**
   * Render individual shop product card
   */
  renderShopProductCard(product) {
    const imageUrl = this.getProductImageUrl(product);
    const imageAlt = product.featuredImage?.alt || product.name;
    const description = product.shortDescription || product.description || '';
    const productUrl = this.getProductUrl(product);

    return `
      <div class="enhanced-card rounded-2xl overflow-hidden group w-full max-w-sm fade-in-up">
        <div class="relative overflow-hidden">
          <img 
            src="${imageUrl}" 
            alt="${imageAlt}" 
            class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
          ${product.price ? `<div class="absolute top-4 right-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-3 py-2 rounded-xl font-bold text-sm shadow-lg">$${product.price}</div>` : ''}
          <div class="absolute bottom-4 left-4">
            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 rounded-full text-xs font-medium">
              🛒 Available Now
            </span>
          </div>
        </div>
        <div class="p-8">
          <h3 class="font-bold text-xl mb-3 group-hover:text-teal-600 transition-colors duration-200">
            ${product.name}
          </h3>
          <p class="text-slate-600 mb-6 line-clamp-2 leading-relaxed">${description}</p>
          <div class="flex justify-between items-center">
            <a 
              href="${productUrl}" 
              class="inline-flex items-center bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              data-product-id="${product._id || product.id}"
            >
              Shop Now
              <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            ${this.renderAvailabilityBadge(product.availability)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load blog preview with enhanced features
   */
  async loadBlogPreview() {
    const container = document.querySelector('#blog .grid');
    if (!container) return;

    try {
      // Use UI state manager if available
      if (this.uiStateManager) {
        const posts = await this.uiStateManager.handleAsyncOperation(
          container,
          () => this.fetchLatestBlogPosts(),
          {
            loadingMessage: 'Loading latest blog posts...',
            errorTitle: 'Failed to Load Blog Posts',
            errorMessage: 'We couldn\'t load our latest blog posts. Please try again.',
            emptyTitle: 'No Blog Posts Available',
            emptyMessage: 'Blog posts will appear here soon.',
            skeleton: true,
            skeletonType: 'card-grid',
            onRetry: () => this.loadBlogPreview()
          }
        );

        if (posts) {
          this.renderBlogPosts(posts);
        }
      } else {
        // Fallback to direct loading
        const posts = await this.fetchLatestBlogPosts();
        this.renderBlogPosts(posts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }

  /**
   * Fetch latest blog posts
   */
  async fetchLatestBlogPosts() {
    // Try to use enhanced coordinator first
    if (this.enhancedCoordinator) {
      try {
        const sanityService = window.sanityService;
        if (sanityService) {
          // Use the Sanity service's getBlogPosts method which handles image transformation properly
          return await sanityService.getBlogPosts({ limit: 3 });
        }
      } catch (error) {
        console.warn('Sanity blog posts not available, using Firestore fallback:', error);
      }
    }
    
    // Fallback to existing Firestore service
    return await publicContentService.getPublishedBlogPosts({ limit: 3 });
  }

  /**
   * Render blog posts
   */
  renderBlogPosts(posts) {
    const container = document.querySelector('#blog .grid');
    if (!container) return;

    // If no dynamic posts, show coming soon message
    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="enhanced-card max-w-2xl mx-auto p-12 rounded-2xl">
            <div class="text-6xl mb-6">📝</div>
            <h3 class="text-2xl font-bold text-slate-800 mb-4">Blog Posts Coming Soon</h3>
            <p class="text-slate-600 mb-8 text-lg leading-relaxed">We're preparing engaging content about mushroom cultivation and sustainable farming practices.</p>
            <div class="flex flex-wrap gap-3 justify-center">
              <span class="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-sm font-medium">🌱 Growing Tips</span>
              <span class="px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium">🍳 Recipes</span>
              <span class="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm font-medium">💪 Health Benefits</span>
              <span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">♻️ Sustainability</span>
            </div>
          </div>
        </div>
      `;
      console.log('📝 No blog posts available, showing coming soon message');
      return;
    }

    container.innerHTML = posts.map(post => this.renderBlogCard(post)).join('');
    
    // Track analytics
    this.trackBlogPostsLoaded(posts.length);
  }

  /**
   * Render individual blog card
   */
  renderBlogCard(post) {
    const imageUrl = this.getBlogImageUrl(post);
    const imageAlt = post.featuredImage?.alt || post.title;
    const publishedDate = this.formatDate(post.publishedAt);
    const postUrl = this.getBlogPostUrl(post);
    const authorName = post.author?.name || 'MYCOgenesis Team';

    return `
      <div class="enhanced-card bg-white rounded-2xl overflow-hidden group w-full max-w-sm fade-in-up">
        <div class="relative overflow-hidden">
          <img 
            src="${imageUrl}" 
            alt="${imageAlt}" 
            class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 rounded-full text-xs font-medium">
              📚 Article
            </span>
          </div>
        </div>
        <div class="p-8">
          ${post.category ? `<span class="inline-block text-xs font-semibold text-teal-600 uppercase mb-3 tracking-wider">${post.category}</span>` : ''}
          <h3 class="font-bold text-xl mb-3 group-hover:text-teal-600 transition-colors duration-200 line-clamp-2 leading-tight">
            ${post.title}
          </h3>
          <p class="text-slate-600 mb-6 line-clamp-2 leading-relaxed">${post.excerpt || ''}</p>
          <div class="flex justify-between items-center text-sm text-slate-500 mb-4">
            <span>By ${authorName}</span>
            <time datetime="${post.publishedAt}">${publishedDate}</time>
          </div>
          <a 
            href="${postUrl}" 
            class="inline-flex items-center text-teal-600 hover:text-teal-800 font-semibold transition-all duration-200 group-hover:translate-x-1"
            data-post-id="${post._id || post.id}"
          >
            Read More 
            <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for real-time content updates
    document.addEventListener('content-update', (event) => {
      const { contentType } = event.detail;
      
      if (contentType === 'product') {
        this.loadFeaturedProducts();
      } else if (contentType === 'blogPost') {
        this.loadBlogPreview();
      }
    });

    // Track product clicks
    document.addEventListener('click', (event) => {
      const productLink = event.target.closest('[data-product-id]');
      if (productLink) {
        const productId = productLink.dataset.productId;
        this.trackProductClick(productId);
      }

      const postLink = event.target.closest('[data-post-id]');
      if (postLink) {
        const postId = postLink.dataset.postId;
        this.trackBlogClick(postId);
      }
    });

    // Preload content on hover
    document.addEventListener('mouseenter', (event) => {
      // Check if event.target is an Element before using closest()
      if (event.target && event.target.nodeType === Node.ELEMENT_NODE && typeof event.target.closest === 'function') {
        const productLink = event.target.closest('[data-product-id]');
        if (productLink && this.enhancedCoordinator) {
          // Preload product content if available
          console.log('Preloading product content...');
        }
      }
    }, true);
  }

  // Utility methods
  getProductImageUrl(product) {
    if (product.featuredImage?.asset?.url) {
      return product.featuredImage.asset.url;
    }
    if (product.images && product.images.length > 0) {
      return product.images.find(img => img.isPrimary)?.url || product.images[0].url;
    }
    return '/images/Featured_varieties/default-mushroom.png';
  }

  getBlogImageUrl(post) {
    // First try the transformed URL from Sanity service
    if (post.featuredImage?.url) {
      return post.featuredImage.url;
    }
    // Fallback to direct asset URL (for non-transformed data)
    if (post.featuredImage?.asset?.url) {
      return post.featuredImage.asset.url;
    }
    // Default fallback image
    return 'https://images.unsplash.com/photo-1542179224-445833e88414?q=80&w=600&auto=format&fit=crop';
  }

  getProductUrl(product) {
    if (product.slug) {
      return `pages/business.html?slug=product-${product.slug.current || product.slug}`;
    }
    return `#mushrooms-${product._id || product.id}`;
  }

  getBlogPostUrl(post) {
    if (post.slug) {
      return `blog/blog-post.html?slug=${post.slug.current || post.slug}`;
    }
    return `blog/blog-post.html?id=${post._id || post.id}`;
  }

  renderAvailabilityBadge(availability) {
    const classes = this.getAvailabilityClasses(availability);
    const text = this.getAvailabilityText(availability);
    
    return `<span class="text-xs px-2 py-1 rounded-full ${classes}">${text}</span>`;
  }

  getAvailabilityClasses(availability) {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'seasonal': return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAvailabilityText(availability) {
    switch (availability) {
      case 'available': return 'Available';
      case 'out-of-stock': return 'Out of Stock';
      case 'seasonal': return 'Seasonal';
      case 'coming-soon': return 'Coming Soon';
      default: return 'Unknown';
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Loading states (fallback when UI state manager not available)
  showProductsLoading() {
    const spinner = document.querySelector('#products-loading-spinner');
    if (spinner) {
      spinner.classList.remove('hidden');
    }
  }

  hideProductsLoading() {
    const spinner = document.querySelector('#products-loading-spinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }

  showProductsError(message) {
    const errorContainer = document.querySelector('#products-error-message');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  // Shop loading states (fallback when UI state manager not available)
  showShopLoading() {
    const spinner = document.querySelector('#shop-loading-spinner');
    if (spinner) {
      spinner.classList.remove('hidden');
    }
  }

  hideShopLoading() {
    const spinner = document.querySelector('#shop-loading-spinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }

  showShopError(message) {
    const errorContainer = document.querySelector('#shop-error-message');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  // Analytics tracking
  trackProductsLoaded(count) {
    if (window.gtag) {
      window.gtag('event', 'products_loaded', {
        event_category: 'homepage',
        value: count
      });
    }
  }

  trackBlogPostsLoaded(count) {
    if (window.gtag) {
      window.gtag('event', 'blog_posts_loaded', {
        event_category: 'homepage',
        value: count
      });
    }
  }

  trackProductClick(productId) {
    if (window.gtag) {
      window.gtag('event', 'product_click', {
        event_category: 'homepage',
        event_label: productId
      });
    }
  }

  trackBlogClick(postId) {
    if (window.gtag) {
      window.gtag('event', 'blog_click', {
        event_category: 'homepage',
        event_label: postId
      });
    }
  }

  trackShopProductsLoaded(count) {
    if (window.gtag) {
      window.gtag('event', 'shop_products_loaded', {
        event_category: 'homepage',
        value: count
      });
    }
  }

}

// Auto-initialize on homepage
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname === '/' || 
      window.location.pathname.includes('index.html') ||
      document.querySelector('#featured-products')) {
    
    const homeLoader = new EnhancedHomeLoader();
    await homeLoader.init();
    
    // Make available globally
    window.enhancedHomeLoader = homeLoader;
  }
});

export { EnhancedHomeLoader };
