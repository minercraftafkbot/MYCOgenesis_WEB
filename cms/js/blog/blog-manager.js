/**
 * Blog Manager
 * Coordinates blog operations between UI and service layer
 */

import { BlogService } from '../services/blog-service.js';
import { BlogPost } from '../models/blog-post.js';

export class BlogManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.blogService = new BlogService();
        this.currentPosts = [];
        this.currentCategories = [];
        this.listeners = [];
        
        this.init();
    }

    /**
     * Initialize blog manager
     */
    init() {
        console.log('Blog Manager initialized');
    }

    /**
     * Add event listener for blog updates
     * @param {Function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Remove event listener
     * @param {Function} listener - Callback function to remove
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners of blog updates
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Error in blog listener:', error);
            }
        });
    }

    /**
     * Create a new blog post
     * @param {Object} postData - Blog post data
     * @returns {Promise<string>} - Created post ID
     */
    async createPost(postData) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.create')) {
                throw new Error('You do not have permission to create blog posts');
            }

            // Add author information
            const currentUser = this.authManager.getCurrentUser();
            postData.author = {
                id: currentUser.user.uid,
                name: currentUser.user.displayName || currentUser.user.email,
                email: currentUser.user.email
            };

            // Create blog post instance
            const blogPost = new BlogPost(postData);

            // Create post
            const postId = await this.blogService.createPost(blogPost);

            // Notify listeners
            this.notifyListeners('postCreated', { postId, post: blogPost });

            return postId;

        } catch (error) {
            console.error('Error creating blog post:', error);
            throw error;
        }
    }

    /**
     * Update an existing blog post
     * @param {string} postId - Post ID
     * @param {Object} postData - Updated post data
     * @returns {Promise<void>}
     */
    async updatePost(postId, postData) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.edit')) {
                throw new Error('You do not have permission to edit blog posts');
            }

            // Get existing post to preserve author and creation date
            const existingPost = await this.blogService.getPost(postId);
            if (!existingPost) {
                throw new Error('Post not found');
            }

            // Merge with existing data
            const updatedData = {
                ...existingPost,
                ...postData,
                id: postId,
                author: existingPost.author, // Preserve original author
                createdAt: existingPost.createdAt // Preserve creation date
            };

            // Create blog post instance
            const blogPost = new BlogPost(updatedData);

            // Update post
            await this.blogService.updatePost(postId, blogPost);

            // Notify listeners
            this.notifyListeners('postUpdated', { postId, post: blogPost });

        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    }

    /**
     * Delete a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async deletePost(postId) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.delete')) {
                throw new Error('You do not have permission to delete blog posts');
            }

            // Delete post
            await this.blogService.deletePost(postId);

            // Notify listeners
            this.notifyListeners('postDeleted', { postId });

        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw error;
        }
    }

    /**
     * Archive a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async archivePost(postId) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.edit')) {
                throw new Error('You do not have permission to archive blog posts');
            }

            // Archive post
            await this.blogService.archivePost(postId);

            // Notify listeners
            this.notifyListeners('postArchived', { postId });

        } catch (error) {
            console.error('Error archiving blog post:', error);
            throw error;
        }
    }

    /**
     * Publish a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async publishPost(postId) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.edit')) {
                throw new Error('You do not have permission to publish blog posts');
            }

            // Publish post
            await this.blogService.publishPost(postId);

            // Notify listeners
            this.notifyListeners('postPublished', { postId });

        } catch (error) {
            console.error('Error publishing blog post:', error);
            throw error;
        }
    }

    /**
     * Schedule a blog post
     * @param {string} postId - Post ID
     * @param {Date} scheduledDate - Scheduled publication date
     * @returns {Promise<void>}
     */
    async schedulePost(postId, scheduledDate) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.edit')) {
                throw new Error('You do not have permission to schedule blog posts');
            }

            // Schedule post
            await this.blogService.schedulePost(postId, scheduledDate);

            // Notify listeners
            this.notifyListeners('postScheduled', { postId, scheduledDate });

        } catch (error) {
            console.error('Error scheduling blog post:', error);
            throw error;
        }
    }

    /**
     * Get a blog post by ID
     * @param {string} postId - Post ID
     * @returns {Promise<BlogPost|null>} - Blog post or null
     */
    async getPost(postId) {
        try {
            return await this.blogService.getPost(postId);
        } catch (error) {
            console.error('Error getting blog post:', error);
            throw error;
        }
    }

    /**
     * Get blog posts with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Posts and pagination info
     */
    async getPosts(options = {}) {
        try {
            const result = await this.blogService.getPosts(options);
            this.currentPosts = result.posts;
            return result;
        } catch (error) {
            console.error('Error getting blog posts:', error);
            throw error;
        }
    }

    /**
     * Get blog categories
     * @returns {Promise<Array>} - Array of categories
     */
    async getCategories() {
        try {
            const categories = await this.blogService.getCategories();
            this.currentCategories = categories;
            return categories;
        } catch (error) {
            console.error('Error getting blog categories:', error);
            throw error;
        }
    }

    /**
     * Save a blog category
     * @param {Object} category - Category data
     * @returns {Promise<string>} - Category ID
     */
    async saveCategory(category) {
        try {
            // Check permissions
            if (!this.authManager.hasPermission('blog.create')) {
                throw new Error('You do not have permission to manage categories');
            }

            const categoryId = await this.blogService.saveCategory(category);

            // Refresh categories
            await this.getCategories();

            // Notify listeners
            this.notifyListeners('categoryUpdated', { categoryId, category });

            return categoryId;

        } catch (error) {
            console.error('Error saving blog category:', error);
            throw error;
        }
    }

    /**
     * Get blog statistics
     * @returns {Promise<Object>} - Blog statistics
     */
    async getStatistics() {
        try {
            return await this.blogService.getStatistics();
        } catch (error) {
            console.error('Error getting blog statistics:', error);
            throw error;
        }
    }

    /**
     * Generate slug from title
     * @param {string} title - Post title
     * @returns {string} - Generated slug
     */
    generateSlug(title) {
        return BlogPost.generateSlug(title);
    }

    /**
     * Generate excerpt from content
     * @param {string} content - Post content
     * @param {number} maxLength - Maximum excerpt length
     * @returns {string} - Generated excerpt
     */
    generateExcerpt(content, maxLength = 160) {
        return BlogPost.generateExcerpt(content, maxLength);
    }

    /**
     * Validate blog post data
     * @param {Object} postData - Post data to validate
     * @returns {Object} - Validation result
     */
    validatePost(postData) {
        const blogPost = new BlogPost(postData);
        return blogPost.validate();
    }

    /**
     * Search posts by term
     * @param {string} searchTerm - Search term
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} - Search results
     */
    async searchPosts(searchTerm, options = {}) {
        try {
            return await this.getPosts({
                ...options,
                searchTerm
            });
        } catch (error) {
            console.error('Error searching blog posts:', error);
            throw error;
        }
    }

    /**
     * Get posts by author
     * @param {string} authorId - Author ID
     * @param {Object} options - Additional query options
     * @returns {Promise<Object>} - Author's posts
     */
    async getPostsByAuthor(authorId, options = {}) {
        try {
            return await this.getPosts({
                ...options,
                author: authorId
            });
        } catch (error) {
            console.error('Error getting posts by author:', error);
            throw error;
        }
    }

    /**
     * Get posts by category
     * @param {string} category - Category name
     * @param {Object} options - Additional query options
     * @returns {Promise<Object>} - Category posts
     */
    async getPostsByCategory(category, options = {}) {
        try {
            return await this.getPosts({
                ...options,
                category
            });
        } catch (error) {
            console.error('Error getting posts by category:', error);
            throw error;
        }
    }

    /**
     * Get featured posts
     * @param {Object} options - Additional query options
     * @returns {Promise<Object>} - Featured posts
     */
    async getFeaturedPosts(options = {}) {
        try {
            return await this.getPosts({
                ...options,
                featured: true
            });
        } catch (error) {
            console.error('Error getting featured posts:', error);
            throw error;
        }
    }

    /**
     * Toggle featured status of a post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async toggleFeatured(postId) {
        try {
            const post = await this.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            post.featured = !post.featured;
            await this.updatePost(postId, post);

        } catch (error) {
            console.error('Error toggling featured status:', error);
            throw error;
        }
    }
}