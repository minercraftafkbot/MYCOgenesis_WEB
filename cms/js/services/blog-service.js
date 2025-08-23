/**
 * Blog Service
 * Handles all blog post CRUD operations and Firebase integration
 */

import { BlogPost } from '../models/blog-post.js';

export class BlogService {
    constructor() {
        this.db = window.firebaseServices.db;
        this.collection = 'blogs';
        this.categoriesCollection = 'categories';
    }

    /**
     * Create a new blog post
     * @param {BlogPost} blogPost - Blog post instance
     * @returns {Promise<string>} - Created post ID
     */
    async createPost(blogPost) {
        try {
            // Validate and sanitize
            const validation = blogPost.validate();
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            blogPost.sanitize();

            // Check for duplicate slug
            await this.ensureUniqueSlug(blogPost.slug);

            // Convert to Firestore document
            const docData = blogPost.toFirestoreDoc();

            // Create document
            const docRef = await this.db.collection(this.collection).add(docData);

            console.log('Blog post created successfully:', docRef.id);
            return docRef.id;

        } catch (error) {
            console.error('Error creating blog post:', error);
            throw new Error(`Failed to create blog post: ${error.message}`);
        }
    }

    /**
     * Update an existing blog post
     * @param {string} postId - Post ID
     * @param {BlogPost} blogPost - Updated blog post instance
     * @returns {Promise<void>}
     */
    async updatePost(postId, blogPost) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            // Validate and sanitize
            const validation = blogPost.validate();
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            blogPost.sanitize();

            // Check for duplicate slug (excluding current post)
            await this.ensureUniqueSlug(blogPost.slug, postId);

            // Convert to Firestore document
            const docData = blogPost.toFirestoreDoc();

            // Update document
            await this.db.collection(this.collection).doc(postId).update(docData);

            console.log('Blog post updated successfully:', postId);

        } catch (error) {
            console.error('Error updating blog post:', error);
            throw new Error(`Failed to update blog post: ${error.message}`);
        }
    }

    /**
     * Get a blog post by ID
     * @param {string} postId - Post ID
     * @returns {Promise<BlogPost|null>} - Blog post instance or null
     */
    async getPost(postId) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            const doc = await this.db.collection(this.collection).doc(postId).get();

            if (!doc.exists) {
                return null;
            }

            return BlogPost.fromFirestoreDoc(doc.id, doc.data());

        } catch (error) {
            console.error('Error getting blog post:', error);
            throw new Error(`Failed to get blog post: ${error.message}`);
        }
    }

    /**
     * Get blog post by slug
     * @param {string} slug - Post slug
     * @returns {Promise<BlogPost|null>} - Blog post instance or null
     */
    async getPostBySlug(slug) {
        try {
            if (!slug) {
                throw new Error('Slug is required');
            }

            const querySnapshot = await this.db
                .collection(this.collection)
                .where('slug', '==', slug)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            return BlogPost.fromFirestoreDoc(doc.id, doc.data());

        } catch (error) {
            console.error('Error getting blog post by slug:', error);
            throw new Error(`Failed to get blog post: ${error.message}`);
        }
    }

    /**
     * Get all blog posts with optional filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Posts and pagination info
     */
    async getPosts(options = {}) {
        try {
            const {
                status = null,
                category = null,
                author = null,
                featured = null,
                limit = 10,
                startAfter = null,
                orderBy = 'updatedAt',
                orderDirection = 'desc',
                searchTerm = null
            } = options;

            let query = this.db.collection(this.collection);

            // Apply filters
            if (status) {
                query = query.where('status', '==', status);
            }

            if (category) {
                query = query.where('category', '==', category);
            }

            if (author) {
                query = query.where('author.id', '==', author);
            }

            if (featured !== null) {
                query = query.where('featured', '==', featured);
            }

            // Apply ordering
            query = query.orderBy(orderBy, orderDirection);

            // Apply pagination
            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            query = query.limit(limit);

            // Execute query
            const querySnapshot = await query.get();

            // Convert to BlogPost instances
            const posts = querySnapshot.docs.map(doc => 
                BlogPost.fromFirestoreDoc(doc.id, doc.data())
            );

            // Apply client-side search if needed (for simple text search)
            let filteredPosts = posts;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredPosts = posts.filter(post => 
                    post.title.toLowerCase().includes(term) ||
                    post.excerpt.toLowerCase().includes(term) ||
                    post.tags.some(tag => tag.toLowerCase().includes(term))
                );
            }

            return {
                posts: filteredPosts,
                hasMore: querySnapshot.docs.length === limit,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
            };

        } catch (error) {
            console.error('Error getting blog posts:', error);
            throw new Error(`Failed to get blog posts: ${error.message}`);
        }
    }

    /**
     * Delete a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async deletePost(postId) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            // Check if post exists
            const post = await this.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Delete the document
            await this.db.collection(this.collection).doc(postId).delete();

            console.log('Blog post deleted successfully:', postId);

        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw new Error(`Failed to delete blog post: ${error.message}`);
        }
    }

    /**
     * Archive a blog post (soft delete)
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async archivePost(postId) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            const post = await this.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            post.status = 'archived';
            await this.updatePost(postId, post);

            console.log('Blog post archived successfully:', postId);

        } catch (error) {
            console.error('Error archiving blog post:', error);
            throw new Error(`Failed to archive blog post: ${error.message}`);
        }
    }

    /**
     * Publish a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async publishPost(postId) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            const post = await this.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            post.status = 'published';
            if (!post.publishedAt) {
                post.publishedAt = new Date();
            }

            await this.updatePost(postId, post);

            console.log('Blog post published successfully:', postId);

        } catch (error) {
            console.error('Error publishing blog post:', error);
            throw new Error(`Failed to publish blog post: ${error.message}`);
        }
    }

    /**
     * Schedule a blog post for future publication
     * @param {string} postId - Post ID
     * @param {Date} scheduledDate - Scheduled publication date
     * @returns {Promise<void>}
     */
    async schedulePost(postId, scheduledDate) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            if (!scheduledDate || scheduledDate <= new Date()) {
                throw new Error('Scheduled date must be in the future');
            }

            const post = await this.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            post.status = 'scheduled';
            post.scheduledFor = scheduledDate;

            await this.updatePost(postId, post);

            console.log('Blog post scheduled successfully:', postId);

        } catch (error) {
            console.error('Error scheduling blog post:', error);
            throw new Error(`Failed to schedule blog post: ${error.message}`);
        }
    }

    /**
     * Increment view count for a blog post
     * @param {string} postId - Post ID
     * @returns {Promise<void>}
     */
    async incrementViewCount(postId) {
        try {
            if (!postId) {
                throw new Error('Post ID is required');
            }

            const { increment } = window.firebaseServices.utils;
            
            await this.db.collection(this.collection).doc(postId).update({
                viewCount: increment(1)
            });

        } catch (error) {
            console.error('Error incrementing view count:', error);
            // Don't throw error for view count updates to avoid disrupting user experience
        }
    }

    /**
     * Get blog categories
     * @returns {Promise<Array>} - Array of categories
     */
    async getCategories() {
        try {
            const querySnapshot = await this.db
                .collection(this.categoriesCollection)
                .where('type', '==', 'blog')
                .orderBy('name')
                .get();

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error getting categories:', error);
            throw new Error(`Failed to get categories: ${error.message}`);
        }
    }

    /**
     * Create or update a blog category
     * @param {Object} category - Category data
     * @returns {Promise<string>} - Category ID
     */
    async saveCategory(category) {
        try {
            const categoryData = {
                name: category.name.trim(),
                description: category.description || '',
                type: 'blog',
                updatedAt: window.firebaseServices.utils.serverTimestamp()
            };

            if (category.id) {
                // Update existing category
                await this.db.collection(this.categoriesCollection).doc(category.id).update(categoryData);
                return category.id;
            } else {
                // Create new category
                categoryData.createdAt = window.firebaseServices.utils.serverTimestamp();
                const docRef = await this.db.collection(this.categoriesCollection).add(categoryData);
                return docRef.id;
            }

        } catch (error) {
            console.error('Error saving category:', error);
            throw new Error(`Failed to save category: ${error.message}`);
        }
    }

    /**
     * Ensure slug is unique
     * @param {string} slug - Proposed slug
     * @param {string} excludeId - Post ID to exclude from check
     * @returns {Promise<void>}
     */
    async ensureUniqueSlug(slug, excludeId = null) {
        try {
            let query = this.db.collection(this.collection).where('slug', '==', slug);
            
            const querySnapshot = await query.get();
            
            // Check if any documents match (excluding the current post if updating)
            const duplicates = querySnapshot.docs.filter(doc => doc.id !== excludeId);
            
            if (duplicates.length > 0) {
                throw new Error(`Slug "${slug}" is already in use. Please choose a different slug.`);
            }

        } catch (error) {
            if (error.message.includes('already in use')) {
                throw error;
            }
            console.error('Error checking slug uniqueness:', error);
            throw new Error('Failed to validate slug uniqueness');
        }
    }

    /**
     * Get blog statistics
     * @returns {Promise<Object>} - Blog statistics
     */
    async getStatistics() {
        try {
            const [publishedQuery, draftQuery, totalViewsQuery] = await Promise.all([
                this.db.collection(this.collection).where('status', '==', 'published').get(),
                this.db.collection(this.collection).where('status', '==', 'draft').get(),
                this.db.collection(this.collection).get()
            ]);

            const totalViews = totalViewsQuery.docs.reduce((sum, doc) => {
                return sum + (doc.data().viewCount || 0);
            }, 0);

            return {
                published: publishedQuery.size,
                drafts: draftQuery.size,
                total: totalViewsQuery.size,
                totalViews
            };

        } catch (error) {
            console.error('Error getting blog statistics:', error);
            throw new Error(`Failed to get blog statistics: ${error.message}`);
        }
    }
}