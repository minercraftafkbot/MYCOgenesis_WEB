/**
 * Blog Content Loader
 * Dynamically loads and displays blog content from Sanity CMS
 */

import { getBlogPosts, sanityService } from '../services/sanity-service.js';

const blogLoader = {
    blogPostsGrid: null,
    loadingSpinner: null,
    errorMessage: null,
    filters: {
        categoryFilter: null,
        sortFilter: null,
        searchFilter: null
    },
    currentPage: 1,
    postsPerPage: 6,
    isLoading: false,
    hasMorePosts: true,
    currentCategory: '',
    currentSort: 'latest',
    searchTerm: '',
    htmlEscapes: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    },

    async init() {
        await this.initialize();
    },

    async initialize() {
        try {
            console.log('🔄 Initializing blog loader components...');
            
            // Get required DOM elements
            this.blogPostsGrid = document.getElementById('blog-posts-grid');
            this.loadingSpinner = document.getElementById('loading-spinner');
            this.errorMessage = document.getElementById('error-message');
            
            // Get filter elements
            this.filters.categoryFilter = document.getElementById('category-filter');
            this.filters.sortFilter = document.getElementById('sort-filter');
            this.filters.searchFilter = document.getElementById('search-filter');

            // Load initial content
            await this.loadFeaturedPost();
            await this.loadLatestPosts();
            
            // Initialize filters and event listeners
            await this.initializeFilters();
            this.setupEventListeners();
            
            console.log('✅ Blog loader fully initialized');
        } catch (error) {
            console.error('Error initializing blog loader:', error);
            this.showErrorMessage('Failed to load blog content');
        }
    },

    async initializeFilters() {
        try {
            console.log('🔄 Initializing blog filters...');
            
            // Only proceed if we have the category filter
            if (!this.filters.categoryFilter) {
                console.log('⚠️ Category filter element not found, skipping filter initialization');
                return;
            }

            // Load categories from Sanity
            const categories = await sanityService.getCategories();
            
            // Clear existing options except "All Categories"
            while (this.filters.categoryFilter.children.length > 1) {
                this.filters.categoryFilter.removeChild(this.filters.categoryFilter.lastChild);
            }

            // Add categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.slug?.current || '';
                option.textContent = category.name;
                this.filters.categoryFilter.appendChild(option);
            });

            console.log(`✅ Initialized filters with ${categories.length} categories`);
        } catch (error) {
            console.error('Error initializing filters:', error);
            // Don't throw error, just log it - the blog should still work without filters
        }
    },

    /**
     * Initialize blog loader
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log('🔄 Initializing blog loader components...');
            
            // Get required DOM elements
            this.blogPostsGrid = document.getElementById('blog-posts-grid');
            this.loadingSpinner = document.getElementById('loading-spinner');
            this.errorMessage = document.getElementById('error-message');
            
            // Get filter elements
            this.filters.categoryFilter = document.getElementById('category-filter');
            this.filters.sortFilter = document.getElementById('sort-filter');
            this.filters.searchFilter = document.getElementById('search-filter');

            // Load initial content
            await this.loadFeaturedPost();
            await this.loadLatestPosts();
            
            // Initialize filters and event listeners
            await this.initializeFilters();
            this.setupEventListeners();
            
            console.log('✅ Blog loader fully initialized');
        } catch (error) {
            console.error('Error initializing blog loader:', error);
            this.showErrorMessage('Failed to load blog content');
        }
    },

    /**
     * Initialize filters with data from Sanity
     * @returns {Promise<void>}
     */
    async initializeFilters() {
        try {
            console.log('🔄 Initializing blog filters...');
            
            // Only proceed if we have the category filter
            if (!this.filters.categoryFilter) {
                console.log('⚠️ Category filter element not found, skipping filter initialization');
                return;
            }

            // Load categories from Sanity
            const categories = await sanityService.getCategories();
            
            // Clear existing options except "All Categories"
            while (this.filters.categoryFilter.children.length > 1) {
                this.filters.categoryFilter.removeChild(this.filters.categoryFilter.lastChild);
            }

            // Add categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.slug?.current || '';
                option.textContent = category.name;
                this.filters.categoryFilter.appendChild(option);
            });

            console.log(`✅ Initialized filters with ${categories.length} categories`);
        } catch (error) {
            console.error('Error initializing filters:', error);
            // Don't throw error, just log it - the blog should still work without filters
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Infinite scroll
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                this.loadMorePosts();
            }
        });

        // Category filter
        if (this.filters.categoryFilter) {
            this.filters.categoryFilter.addEventListener('change', async () => {
                this.currentCategory = this.filters.categoryFilter.value;
                this.resetAndReload();
            });
        }

        // Sort filter
        if (this.filters.sortFilter) {
            this.filters.sortFilter.addEventListener('change', async () => {
                this.currentSort = this.filters.sortFilter.value;
                this.resetAndReload();
            });
        }

        // Search filter with debounce
        if (this.filters.searchFilter) {
            let debounceTimer;
            this.filters.searchFilter.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchTerm = this.filters.searchFilter.value;
                    this.resetAndReload();
                }, 500);
            });
        }
    },

    /**
     * Reset page and reload posts
     */
    async resetAndReload() {
        this.currentPage = 1;
        this.hasMorePosts = true;
        if (this.blogPostsGrid) {
            this.blogPostsGrid.innerHTML = '';
        }
        await this.loadLatestPosts();
    },

    /**
     * Load and display featured blog post
     * @returns {Promise<void>}
     */
    async loadFeaturedPost() {
        try {
            const featuredPosts = await sanityService.getBlogPosts({
                featured: true,
                limit: 1
            });

            if (featuredPosts.length > 0) {
                this.renderFeaturedPost(featuredPosts[0]);
            }
        } catch (error) {
            console.error('Error loading featured post:', error);
        }
    },

    /**
     * Load and display latest blog posts
     * @returns {Promise<void>}
     */
    async loadLatestPosts() {
        if (this.isLoading || !this.hasMorePosts) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const posts = await getBlogPosts({
                category: this.currentCategory,
                search: this.searchTerm,
                sort: this.currentSort,
                page: this.currentPage,
                limit: this.postsPerPage
            });

            console.log('📦 Fetched posts:', posts);
            
            if (posts.length < this.postsPerPage) {
                this.hasMorePosts = false;
                console.log('🏁 No more posts available');
            }

            this.renderPosts(posts);
            this.currentPage++;
            
            this.hideLoadingState();
            console.log(`✅ Successfully rendered ${posts.length} posts`);

        } catch (error) {
            console.error('❌ Error loading latest posts:', error);
            this.showErrorMessage('Failed to load blog posts. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
        }
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, char => this.htmlEscapes[char] || char);
    },

    /**
     * Show empty state when no posts are found
     */
    showEmptyState() {
        if (!this.blogPostsGrid) return;
        
        this.blogPostsGrid.innerHTML = `
            <div class="col-span-full text-center py-10">
                <svg class="mx-auto h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <h3 class="mt-4 text-lg font-semibold text-slate-900">Blog Coming Soon!</h3>
                <p class="mt-2 text-base text-slate-600 max-w-md mx-auto">
                    We're working on exciting content about mushroom cultivation, sustainable farming, and culinary insights. 
                    Check back soon for our latest articles!
                </p>
                <div class="mt-6">
                    <a href="../index.html#contact" 
                       class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Get Notified When We Launch
                    </a>
                </div>
            </div>
        `;
        this.hideLoadingState();
    },

    /**
     * Load more posts for infinite scroll
     */
    async loadMorePosts() {
        if (!this.isLoading && this.hasMorePosts) {
            await this.loadLatestPosts();
        }
    },

    /**
     * Render featured blog post
     * @param {Object} post - Featured blog post
     */
    renderFeaturedPost(post) {
        const featuredSection = document.getElementById('featured-post-section');
        if (!featuredSection) return;

        const imageUrl = post.mainImage ? sanityService.urlFor(post.mainImage).width(1200).url() : 'images/default-featured.jpg';
        
        featuredSection.innerHTML = `
            <div class="container mx-auto px-6">
                <a href="blog-post.html?slug=${post.slug.current}" class="block group">
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.02]">
                        <div class="relative">
                            <img src="${imageUrl}" alt="${post.title}" class="w-full h-96 object-cover">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <span class="text-teal-400 text-sm font-semibold uppercase">${post.category?.name || 'Featured'}</span>
                                <h2 class="text-3xl font-bold mt-2 mb-3 group-hover:text-teal-400 transition-colors">${post.title}</h2>
                                <p class="text-slate-200 line-clamp-2">${post.excerpt}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>`;
    },

    /**
     * Render blog posts
     * @param {Array} posts - Array of blog posts
     */
    renderPosts(posts) {
        if (!this.blogPostsGrid || !posts.length) return;

        const postsHTML = posts.map(post => {
            const imageUrl = post.mainImage ? sanityService.urlFor(post.mainImage).width(600).url() : 'images/default-post.jpg';
            const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <article class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                    <a href="blog-post.html?slug=${post.slug.current}" class="block">
                        <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <span class="text-teal-600 text-sm font-semibold uppercase">${post.category?.name || 'Blog'}</span>
                            <h3 class="font-bold text-xl mt-2 mb-3 text-slate-800 hover:text-teal-600 transition-colors">${post.title}</h3>
                            <p class="text-slate-600 mb-4 line-clamp-2">${post.excerpt}</p>
                            <div class="flex items-center justify-between text-sm text-slate-500">
                                <span>${date}</span>
                                <span class="text-teal-600 font-medium">Read More →</span>
                            </div>
                        </div>
                    </a>
                </article>`;
        }).join('');

        if (this.currentPage === 1) {
            this.blogPostsGrid.innerHTML = postsHTML;
        } else {
            this.blogPostsGrid.insertAdjacentHTML('beforeend', postsHTML);
        }
    },

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.remove('hidden');
            
            // Dim existing content while loading
            if (this.blogPostsGrid) {
                this.blogPostsGrid.style.opacity = '0.5';
            }
        }
    },

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
            
            // Restore content visibility
            if (this.blogPostsGrid) {
                this.blogPostsGrid.style.opacity = '1';
            }
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        if (this.errorMessage) {
            this.errorMessage.innerHTML = `
                <div class="flex items-center">
                    <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>${this.escapeHtml(message)}</span>
                </div>
            `;
            this.errorMessage.classList.remove('hidden');
        }
    }
};

export { blogLoader };
