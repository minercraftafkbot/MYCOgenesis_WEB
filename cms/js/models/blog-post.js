/**
 * Blog Post Data Model
 * Handles blog post data structure, validation, and sanitization
 */

export class BlogPost {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.slug = data.slug || '';
        this.content = data.content || '';
        this.excerpt = data.excerpt || '';
        this.author = data.author || {
            id: '',
            name: '',
            email: ''
        };
        this.category = data.category || '';
        this.tags = data.tags || [];
        this.featuredImage = data.featuredImage || {
            url: '',
            alt: '',
            caption: ''
        };
        this.seo = data.seo || {
            metaTitle: '',
            metaDescription: '',
            keywords: []
        };
        this.status = data.status || 'draft';
        this.publishedAt = data.publishedAt || null;
        this.scheduledFor = data.scheduledFor || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
        this.viewCount = data.viewCount || 0;
        this.featured = data.featured || false;
    }

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Post title
     * @returns {string} - URL-friendly slug
     */
    static generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Generate excerpt from content
     * @param {string} content - Post content (HTML)
     * @param {number} maxLength - Maximum excerpt length
     * @returns {string} - Generated excerpt
     */
    static generateExcerpt(content, maxLength = 160) {
        // Strip HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');
        
        // Truncate to maxLength
        if (textContent.length <= maxLength) {
            return textContent;
        }
        
        // Find the last complete word within the limit
        const truncated = textContent.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
    }

    /**
     * Validate blog post data
     * @returns {Object} - Validation result with isValid and errors
     */
    validate() {
        const errors = [];

        // Required fields validation
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        } else if (this.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }

        if (!this.content || this.content.trim().length === 0) {
            errors.push('Content is required');
        }

        if (!this.author.id) {
            errors.push('Author is required');
        }

        // Status validation
        const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
        if (!validStatuses.includes(this.status)) {
            errors.push('Invalid status');
        }

        // Category validation
        if (this.category && this.category.length > 50) {
            errors.push('Category must be less than 50 characters');
        }

        // Tags validation
        if (this.tags.length > 10) {
            errors.push('Maximum 10 tags allowed');
        }

        this.tags.forEach(tag => {
            if (typeof tag !== 'string' || tag.length > 30) {
                errors.push('Each tag must be a string with less than 30 characters');
            }
        });

        // SEO validation
        if (this.seo.metaTitle && this.seo.metaTitle.length > 60) {
            errors.push('Meta title should be less than 60 characters for optimal SEO');
        }

        if (this.seo.metaDescription && this.seo.metaDescription.length > 160) {
            errors.push('Meta description should be less than 160 characters for optimal SEO');
        }

        if (this.seo.keywords.length > 10) {
            errors.push('Maximum 10 SEO keywords allowed');
        }

        // Scheduled post validation
        if (this.status === 'scheduled' && !this.scheduledFor) {
            errors.push('Scheduled posts must have a scheduled date');
        }

        if (this.scheduledFor && new Date(this.scheduledFor) <= new Date()) {
            errors.push('Scheduled date must be in the future');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitize blog post data
     * @returns {BlogPost} - Sanitized blog post instance
     */
    sanitize() {
        // Sanitize title
        this.title = this.title.trim();
        
        // Generate slug if not provided
        if (!this.slug && this.title) {
            this.slug = BlogPost.generateSlug(this.title);
        }

        // Generate excerpt if not provided
        if (!this.excerpt && this.content) {
            this.excerpt = BlogPost.generateExcerpt(this.content);
        }

        // Sanitize tags
        this.tags = this.tags
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

        // Sanitize SEO keywords
        this.seo.keywords = this.seo.keywords
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => keyword.length > 0)
            .filter((keyword, index, arr) => arr.indexOf(keyword) === index); // Remove duplicates

        // Ensure featured image has proper structure
        if (this.featuredImage.url && !this.featuredImage.alt) {
            this.featuredImage.alt = this.title;
        }

        return this;
    }

    /**
     * Convert to Firestore document format
     * @returns {Object} - Firestore document data
     */
    toFirestoreDoc() {
        const { serverTimestamp } = window.firebaseServices.utils;
        const now = serverTimestamp();

        const doc = {
            title: this.title,
            slug: this.slug,
            content: this.content,
            excerpt: this.excerpt,
            author: this.author,
            category: this.category,
            tags: this.tags,
            featuredImage: this.featuredImage,
            seo: this.seo,
            status: this.status,
            viewCount: this.viewCount,
            featured: this.featured,
            updatedAt: now
        };

        // Add timestamps based on status
        if (this.status === 'published' && !this.publishedAt) {
            doc.publishedAt = now;
        } else if (this.publishedAt) {
            doc.publishedAt = this.publishedAt;
        }

        if (this.status === 'scheduled' && this.scheduledFor) {
            doc.scheduledFor = this.scheduledFor;
        }

        if (!this.createdAt) {
            doc.createdAt = now;
        } else {
            doc.createdAt = this.createdAt;
        }

        return doc;
    }

    /**
     * Create BlogPost instance from Firestore document
     * @param {string} id - Document ID
     * @param {Object} data - Firestore document data
     * @returns {BlogPost} - BlogPost instance
     */
    static fromFirestoreDoc(id, data) {
        return new BlogPost({
            id,
            ...data,
            // Convert Firestore timestamps to JavaScript dates
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
            scheduledFor: data.scheduledFor?.toDate?.() || data.scheduledFor
        });
    }

    /**
     * Check if post is published
     * @returns {boolean} - Whether post is published
     */
    isPublished() {
        return this.status === 'published' && this.publishedAt;
    }

    /**
     * Check if post is scheduled
     * @returns {boolean} - Whether post is scheduled
     */
    isScheduled() {
        return this.status === 'scheduled' && this.scheduledFor && new Date(this.scheduledFor) > new Date();
    }

    /**
     * Check if post is draft
     * @returns {boolean} - Whether post is draft
     */
    isDraft() {
        return this.status === 'draft';
    }

    /**
     * Get display status
     * @returns {string} - Human-readable status
     */
    getDisplayStatus() {
        switch (this.status) {
            case 'published':
                return 'Published';
            case 'draft':
                return 'Draft';
            case 'archived':
                return 'Archived';
            case 'scheduled':
                return `Scheduled for ${new Date(this.scheduledFor).toLocaleDateString()}`;
            default:
                return 'Unknown';
        }
    }
}