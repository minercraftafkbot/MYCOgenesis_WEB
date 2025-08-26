/**
 * Sanity CMS Service
 * Handles all interactions with Sanity CMS for content management
 */

import { createClient } from 'https://esm.sh/@sanity/client@6.8.6';
import imageUrlBuilder from 'https://esm.sh/@sanity/image-url@1.0.2';

class SanityService {
    constructor() {
        this.client = null;
        this.imageBuilder = null;
        this.initialized = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialize Sanity client
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Get configuration from environment
            const config = this.getSanityConfig();
            
            this.client = createClient(config);
            this.imageBuilder = imageUrlBuilder(this.client);
            
            // Test connection
            await this.testConnection();
            
            this.initialized = true;
            console.log('✅ Sanity CMS service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Sanity service:', error);
            throw error;
        }
    }

    /**
     * Get Sanity configuration
     */
    getSanityConfig() {
        // Try to get from environment loader first
        if (window.environmentLoader) {
            return window.environmentLoader.getSanityConfig();
        }
        
        // Fallback to known working configuration
        return {
            projectId: 'gae98lpg',
            dataset: 'production',
            apiVersion: '2023-12-01',
            useCdn: true,
            perspective: 'published'
        };
    }

    /**
     * Test Sanity connection
     */
    async testConnection() {
        try {
            const query = '*[_type == "product"][0...1] { _id }';
            await this.client.fetch(query);
            console.log('✅ Sanity connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Sanity connection test failed:', error);
            throw error;
        }
    }

    /**
     * Get image URL builder
     */
    urlFor(source) {
        if (!this.imageBuilder) {
            console.warn('Image builder not initialized');
            return { url: () => '' };
        }
        return this.imageBuilder.image(source);
    }

    /**
     * Fetch data with caching
     */
    async fetch(query, params = {}) {
        const cacheKey = `${query}-${JSON.stringify(params)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const data = await this.client.fetch(query, params);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Sanity fetch error:', error);
            throw error;
        }
    }

    /**
     * Get featured products
     */
    async getFeaturedProducts(limit = 6) {
        await this.initialize();
        
        const query = `*[_type == "product" && featured == true] | order(priority desc, _createdAt desc)[0...${limit}] {
            _id,
            name,
            slug,
            shortDescription,
            description,
            images[] {
                asset-> {
                    _id,
                    url
                },
                alt,
                isPrimary
            },
            category-> {
                name,
                slug
            },
            availability,
            price,
            featured,
            priority,
            healthBenefits,
            cookingTips,
            nutritionalInfo
        }`;

        const products = await this.fetch(query);
        
        // Transform images to include proper URLs
        return products.map(product => ({
            ...product,
            images: product.images?.map(img => ({
                ...img,
                url: this.urlFor(img.asset).width(600).height(400).format('webp').url()
            })) || []
        }));
    }

    /**
     * Get available products
     */
    async getAvailableProducts(options = {}) {
        await this.initialize();
        
        const { limit = 20, category = null } = options;
        
        let query = `*[_type == "product" && availability == "available"`;
        
        if (category) {
            query += ` && category->slug.current == $category`;
        }
        
        query += `] | order(priority desc, _createdAt desc)[0...${limit}] {
            _id,
            name,
            slug,
            shortDescription,
            description,
            images[] {
                asset-> {
                    _id,
                    url
                },
                alt,
                isPrimary
            },
            category-> {
                name,
                slug
            },
            availability,
            price,
            healthBenefits,
            cookingTips,
            nutritionalInfo
        }`;

        const products = await this.fetch(query, { category });
        
        return products.map(product => ({
            ...product,
            images: product.images?.map(img => ({
                ...img,
                url: this.urlFor(img.asset).width(600).height(400).format('webp').url()
            })) || []
        }));
    }

    /**
     * Get blog posts
     */
    async getBlogPosts(options = {}) {
        await this.initialize();
        
        const { 
            limit = 10, 
            featured = null, 
            category = null,
            page = 1
        } = options;
        
        const offset = (page - 1) * limit;
        
        let query = `*[_type == "blogPost" && status == "published"`;
        
        if (featured !== null) {
            query += ` && featured == ${featured}`;
        }
        
        if (category) {
            query += ` && $category in categories`;
        }
        
        query += `] | order(publishedAt desc)[${offset}...${offset + limit}] {
            _id,
            title,
            slug,
            excerpt,
            mainImage {
                asset-> {
                    _id,
                    url
                },
                alt
            },
            author-> {
                name,
                slug,
                image {
                    asset-> {
                        url
                    }
                }
            },
            categories,
            publishedAt,
            featured,
            readingTime,
            content[] {
                ...,
                _type == "image" => {
                    asset-> {
                        _id,
                        url
                    },
                    alt
                }
            }
        }`;

        const posts = await this.fetch(query, { category });
        
        return posts.map(post => ({
            ...post,
            featuredImage: post.mainImage ? {
                url: this.urlFor(post.mainImage.asset).width(800).height(600).format('webp').url(),
                alt: post.mainImage.alt
            } : null
        }));
    }

    /**
     * Get single blog post by slug
     */
    async getBlogPost(slug) {
        await this.initialize();
        
        const query = `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
            _id,
            title,
            slug,
            excerpt,
            mainImage {
                asset-> {
                    _id,
                    url
                },
                alt
            },
            author-> {
                name,
                slug,
                bio,
                image {
                    asset-> {
                        url
                    }
                }
            },
            categories,
            publishedAt,
            featured,
            readingTime,
            content[] {
                ...,
                _type == "image" => {
                    asset-> {
                        _id,
                        url
                    },
                    alt
                }
            },
            seo {
                metaTitle,
                metaDescription,
                keywords
            }
        }`;

        const post = await this.fetch(query, { slug });
        
        if (!post) return null;
        
        return {
            ...post,
            featuredImage: post.mainImage ? {
                url: this.urlFor(post.mainImage.asset).width(1200).height(800).format('webp').url(),
                alt: post.mainImage.alt
            } : null
        };
    }

    /**
     * Get categories
     */
    async getCategories() {
        await this.initialize();
        
        const query = `*[_type == "category"] | order(name) {
            _id,
            name,
            slug,
            description,
            color
        }`;

        return await this.fetch(query);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Sanity service cache cleared');
    }
}

// Create singleton instance
export const sanityService = new SanityService();

// Make available globally
window.sanityService = sanityService;

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await sanityService.initialize();
    } catch (error) {
        console.warn('⚠️ Sanity service initialization failed:', error);
    }
});

export default sanityService;