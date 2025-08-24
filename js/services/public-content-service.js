/**
 * Public Content Service
 * Handles loading dynamic content for public website pages
 */

export class PublicContentService {
    constructor() {
        this.db = window.firebaseServices?.db;
        this.initialized = false;
    }

    /**
     * Initialize the service
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) return;

        // Wait for Firebase to be initialized
        if (!this.db) {
            await this.waitForFirebase();
        }

        this.initialized = true;
    }

    /**
     * Wait for Firebase services to be available
     * @returns {Promise<void>}
     */
    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseServices?.db) {
                    this.db = window.firebaseServices.db;
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    /**
     * Get published blog posts for public display
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Array of published blog posts
     */
    async getPublishedBlogPosts(options = {}) {
        try {
            await this.initialize();

            const {
                limit = 10,
                featured = null,
                category = null,
                excludeId = null
            } = options;

            let query = this.db.collection('blogs')
                .where('status', '==', 'published')
                .orderBy('publishedAt', 'desc');

            if (featured !== null) {
                query = query.where('featured', '==', featured);
            }

            if (category) {
                query = query.where('category', '==', category);
            }

            query = query.limit(limit);

            const querySnapshot = await query.get();
            
            let posts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

            // Exclude specific post if requested
            if (excludeId) {
                posts = posts.filter(post => post.id !== excludeId);
            }

            return posts;

        } catch (error) {
            console.error('Error getting published blog posts:', error);
            return [];
        }
    }

    /**
     * Get a single blog post by slug
     * @param {string} slug - Post slug
     * @returns {Promise<Object|null>} - Blog post or null
     */
    async getBlogPostBySlug(slug) {
        try {
            await this.initialize();

            if (!slug) return null;

            const querySnapshot = await this.db
                .collection('blogs')
                .where('slug', '==', slug)
                .where('status', '==', 'published')
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
            };

        } catch (error) {
            console.error('Error getting blog post by slug:', error);
            return null;
        }
    }

    /**
     * Get featured products for public display
     * @param {number} limit - Maximum number of products to return
     * @returns {Promise<Array>} - Array of featured products
     */
    async getFeaturedProducts(limit = 6) {
        try {
            await this.initialize();

            const querySnapshot = await this.db
                .collection('products')
                .where('featured', '==', true)
                .where('availability', '==', 'available')
                .orderBy('order', 'asc')
                .limit(limit)
                .get();

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

        } catch (error) {
            console.error('Error getting featured products:', error);
            return [];
        }
    }

    /**
     * Get all available products
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Array of available products
     */
    async getAvailableProducts(options = {}) {
        try {
            await this.initialize();

            const {
                limit = 20,
                category = null,
                orderBy = 'order',
                orderDirection = 'asc'
            } = options;

            let query = this.db.collection('products')
                .where('availability', '==', 'available');

            if (category) {
                query = query.where('category', '==', category);
            }

            query = query.orderBy(orderBy, orderDirection);

            if (limit) {
                query = query.limit(limit);
            }

            const querySnapshot = await query.get();

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

        } catch (error) {
            console.error('Error getting available products:', error);
            return [];
        }
    }

    /**
     * Get a single product by slug
     * @param {string} slug - Product slug
     * @returns {Promise<Object|null>} - Product or null
     */
    async getProductBySlug(slug) {
        try {
            await this.initialize();

            if (!slug) return null;

            const querySnapshot = await this.db
                .collection('products')
                .where('slug', '==', slug)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
            };

        } catch (error) {
            console.error('Error getting product by slug:', error);
            return null;
        }
    }

    /**
     * Increment view count for a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async incrementBlogPostViews(postId) {
        try {
            await this.initialize();

            if (!postId) return;

            const { increment } = window.firebaseServices.utils;
            
            await this.db.collection('blogs').doc(postId).update({
                viewCount: increment(1)
            });

        } catch (error) {
            console.error('Error incrementing blog post views:', error);
            // Don't throw error to avoid disrupting user experience
        }
    }

    /**
     * Get related blog posts based on category and tags
     * @param {Object} currentPost - Current blog post
     * @param {number} limit - Maximum number of related posts
     * @returns {Promise<Array>} - Array of related posts
     */
    async getRelatedBlogPosts(currentPost, limit = 3) {
        try {
            await this.initialize();

            if (!currentPost) return [];

            // First try to get posts from the same category
            let relatedPosts = [];

            if (currentPost.category) {
                const categoryPosts = await this.getPublishedBlogPosts({
                    category: currentPost.category,
                    limit: limit + 1, // Get one extra in case current post is included
                    excludeId: currentPost.id
                });
                relatedPosts = categoryPosts.filter(post => post.id !== currentPost.id);
            }

            // If we don't have enough posts, get recent posts
            if (relatedPosts.length < limit) {
                const recentPosts = await this.getPublishedBlogPosts({
                    limit: limit * 2,
                    excludeId: currentPost.id
                });

                // Add recent posts that aren't already in relatedPosts
                const existingIds = relatedPosts.map(post => post.id);
                const additionalPosts = recentPosts
                    .filter(post => !existingIds.includes(post.id))
                    .slice(0, limit - relatedPosts.length);

                relatedPosts = [...relatedPosts, ...additionalPosts];
            }

            return relatedPosts.slice(0, limit);

        } catch (error) {
            console.error('Error getting related blog posts:', error);
            return [];
        }
    }

    /**
     * Search blog posts
     * @param {string} searchTerm - Search term
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Array of matching posts
     */
    async searchBlogPosts(searchTerm, limit = 10) {
        try {
            await this.initialize();

            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }

            // Get all published posts (Firebase doesn't support full-text search natively)
            const allPosts = await this.getPublishedBlogPosts({ limit: 100 });

            // Client-side search
            const term = searchTerm.toLowerCase();
            const matchingPosts = allPosts.filter(post => 
                post.title.toLowerCase().includes(term) ||
                post.excerpt.toLowerCase().includes(term) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term))) ||
                post.content.toLowerCase().includes(term)
            );

            return matchingPosts.slice(0, limit);

        } catch (error) {
            console.error('Error searching blog posts:', error);
            return [];
        }
    }

    /**
     * Get blog categories with post counts
     * @returns {Promise<Array>} - Array of categories with counts
     */
    async getBlogCategories() {
        try {
            await this.initialize();

            // Get all published posts
            const posts = await this.getPublishedBlogPosts({ limit: 1000 });

            // Count posts by category
            const categoryCounts = {};
            posts.forEach(post => {
                if (post.category) {
                    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
                }
            });

            // Convert to array and sort by count
            return Object.entries(categoryCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

        } catch (error) {
            console.error('Error getting blog categories:', error);
            return [];
        }
    }
}

// Create and export a singleton instance
export const publicContentService = new PublicContentService();