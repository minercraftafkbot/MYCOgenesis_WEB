/**
 * Blog Content Loader
 * Dynamically loads and displays blog content from Firestore
 */

import { publicContentService } from '../services/public-content-service.js';

export class BlogLoader {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.isLoading = false;
        this.hasMorePosts = true;
        this.currentCategory = null;
        this.searchTerm = null;
    }

    /**
     * Initialize blog loader
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            await this.loadFeaturedPost();
            await this.loadLatestPosts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing blog loader:', error);
            this.showErrorMessage('Failed to load blog content');
        }
    }

    /**
     * Load and display featured blog post
     * @returns {Promise<void>}
     */
    async loadFeaturedPost() {
        try {
            const featuredPosts = await publicContentService.getPublishedBlogPosts({
                featured: true,
                limit: 1
            });

            if (featuredPosts.length > 0) {
                this.renderFeaturedPost(featuredPosts[0]);
            } else {
                // Fallback to latest post if no featured post
                const latestPosts = await publicContentService.getPublishedBlogPosts({ limit: 1 });
                if (latestPosts.length > 0) {
                    this.renderFeaturedPost(latestPosts[0]);
                }
            }
        } catch (error) {
            console.error('Error loading featured post:', error);
        }
    }

    /**
     * Load and display latest blog posts
     * @param {boolean} append - Whether to append to existing posts or replace
     * @returns {Promise<void>}
     */
    async loadLatestPosts(append = false) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const options = {
                limit: this.postsPerPage,
                category: this.currentCategory
            };

            let posts;
            if (this.searchTerm) {
                posts = await publicContentService.searchBlogPosts(this.searchTerm, this.postsPerPage);
            } else {
                posts = await publicContentService.getPublishedBlogPosts(options);
            }

            if (append) {
                this.appendPosts(posts);
            } else {
                this.renderLatestPosts(posts);
            }

            this.hasMorePosts = posts.length === this.postsPerPage;
            this.updateLoadMoreButton();

        } catch (error) {
            console.error('Error loading latest posts:', error);
            this.showErrorMessage('Failed to load blog posts');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    /**
     * Render featured post
     * @param {Object} post - Featured blog post
     */
    renderFeaturedPost(post) {
        const featuredSection = document.querySelector('#featured-post-section');
        if (!featuredSection) return;

        const imageUrl = post.featuredImage?.url || 'https://images.unsplash.com/photo-1616597082843-a72175a3de38?q=80&w=800&auto=format&fit=crop';
        const imageAlt = post.featuredImage?.alt || post.title;
        const publishedDate = this.formatDate(post.publishedAt);
        const postUrl = this.generatePostUrl(post);

        featuredSection.innerHTML = `
            <div class="container mx-auto px-6">
                <h2 class="text-3xl font-bold mb-8">Featured Post</h2>
                <a href="${postUrl}" class="block group">
                    <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-white rounded-lg shadow-lg overflow-hidden">
                        <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-80 object-cover">
                        <div class="p-8">
                            <span class="text-sm font-semibold text-teal-600 uppercase">${post.category || 'Blog'}</span>
                            <h3 class="text-2xl md:text-3xl font-bold mt-2 mb-4 group-hover:text-teal-700 transition-colors">${post.title}</h3>
                            <p class="text-slate-600 mb-4">${post.excerpt}</p>
                            <p class="font-semibold text-slate-800">By ${post.author?.name || 'MYCOgenesis Team'} • ${publishedDate}</p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Render latest posts grid
     * @param {Array} posts - Array of blog posts
     */
    renderLatestPosts(posts) {
        const postsGrid = document.querySelector('#latest-posts-grid');
        if (!postsGrid) return;

        if (posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-slate-600 text-lg">No blog posts found.</p>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = posts.map(post => this.renderPostCard(post)).join('');
    }

    /**
     * Append posts to existing grid
     * @param {Array} posts - Array of blog posts to append
     */
    appendPosts(posts) {
        const postsGrid = document.querySelector('#latest-posts-grid');
        if (!postsGrid || posts.length === 0) return;

        const postsHTML = posts.map(post => this.renderPostCard(post)).join('');
        postsGrid.insertAdjacentHTML('beforeend', postsHTML);
    }

    /**
     * Render individual post card
     * @param {Object} post - Blog post object
     * @returns {string} - HTML string for post card
     */
    renderPostCard(post) {
        const imageUrl = post.featuredImage?.url || 'https://images.unsplash.com/photo-1604313324216-a7c751e7dd1e?q=80&w=600&auto=format&fit=crop';
        const imageAlt = post.featuredImage?.alt || post.title;
        const publishedDate = this.formatDate(post.publishedAt);
        const postUrl = this.generatePostUrl(post);

        return `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <a href="${postUrl}" class="block">
                    <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-56 object-cover">
                    <div class="p-6">
                        <span class="text-sm font-semibold text-teal-600 uppercase">${post.category || 'Blog'}</span>
                        <h3 class="font-bold text-xl my-2">${post.title}</h3>
                        <p class="text-slate-600 text-sm mb-4">${post.excerpt}</p>
                        <p class="text-xs text-slate-500">By ${post.author?.name || 'MYCOgenesis Team'} • ${publishedDate}</p>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Generate post URL
     * @param {Object} post - Blog post object
     * @returns {string} - Post URL
     */
    generatePostUrl(post) {
        // For now, use blog-post.html with post ID as parameter
        // In a real implementation, you might use the slug for SEO-friendly URLs
        return `blog-post.html?slug=${post.slug}`;
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Load more button
        const loadMoreBtn = document.querySelector('#load-more-posts');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadLatestPosts(true);
            });
        }

        // Category filter (if exists)
        const categoryFilter = document.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value || null;
                this.currentPage = 1;
                this.loadLatestPosts();
            });
        }

        // Search functionality (if exists)
        const searchInput = document.querySelector('#blog-search');
        const searchBtn = document.querySelector('#blog-search-btn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.searchTerm = searchInput.value.trim() || null;
                this.currentPage = 1;
                this.loadLatestPosts();
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Real-time content updates
        window.addEventListener('blogContentUpdated', (event) => {
            const { posts, changes } = event.detail;
            this.handleRealTimeUpdates(posts, changes);
        });
    }

    /**
     * Handle real-time content updates
     * @param {Array} posts - Updated posts array
     * @param {Array} changes - Firestore document changes
     */
    handleRealTimeUpdates(posts, changes) {
        // Only update if we're on the first page and not searching/filtering
        if (this.currentPage === 1 && !this.searchTerm && !this.currentCategory) {
            // Check if there are new posts or significant changes
            const hasNewPosts = changes.some(change => change.type === 'added');
            const hasModifiedPosts = changes.some(change => change.type === 'modified');
            
            if (hasNewPosts || hasModifiedPosts) {
                // Reload the latest posts to show updates
                this.loadLatestPosts();
                
                // Update featured post if it might have changed
                this.loadFeaturedPost();
            }
        }
    }

    /**
     * Update load more button state
     */
    updateLoadMoreButton() {
        const loadMoreBtn = document.querySelector('#load-more-posts');
        if (!loadMoreBtn) return;

        if (this.hasMorePosts) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Posts';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loadMoreBtn = document.querySelector('#load-more-posts');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
        }

        // Show loading spinner if exists
        const loadingSpinner = document.querySelector('#loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingSpinner = document.querySelector('#loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const errorContainer = document.querySelector('#error-message');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        } else {
            console.error(message);
        }
    }
}

// Auto-initialize if on blog page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('blog.html') || 
        document.querySelector('#latest-posts-grid')) {
        const blogLoader = new BlogLoader();
        blogLoader.initialize();
        
        // Make available globally for debugging
        window.blogLoader = blogLoader;
    }
});