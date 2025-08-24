/**
 * Sanity CMS Integration Service
 * Connects MYCOgenesis website with Sanity headless CMS
 */

import { createClient } from 'https://esm.sh/@sanity/client@6.8.6';
import imageUrlBuilder from 'https://esm.sh/@sanity/image-url@1.0.2';

class SanityService {
    constructor() {
        this.projectId = 'gae98lpg'; // Fixed project ID to match valid format
        this.dataset = 'production';
        this.apiVersion = '2024-01-01';
        this.useCdn = true;

        // Initialize Sanity client
        this.client = createClient({
            projectId: this.projectId,
            dataset: this.dataset,
            apiVersion: this.apiVersion,
            useCdn: this.useCdn,
        });

        // Initialize image URL builder
        this.builder = imageUrlBuilder(this.client);
    }

    /**
     * Get image URL from Sanity asset
     * @param {Object} source - Sanity image asset
     * @returns {string} - Optimized image URL
     */
    urlFor(source) {
        return this.builder.image(source);
    }

    /**
     * Get featured products for homepage
     * @param {number} limit - Maximum number of products
     * @returns {Promise<Array>} - Featured products array
     */
    async getFeaturedProducts(limit = 3) {
        try {
            const query = `*[_type == "product" && isFeatured == true] | order(sortOrder asc) [0...${limit}] {
                _id,
                name,
                slug,
                shortDescription,
                description,
                images[] {
                    asset,
                    alt,
                    isPrimary
                },
                category->{name, slug},
                availability,
                healthBenefits,
                cookingTips,
                nutritionalInfo,
                sortOrder
            }`;

            const products = await this.client.fetch(query);
            return this.transformProducts(products);
        } catch (error) {
            console.error('Error fetching featured products:', error);
            return [];
        }
    }

    /**
     * Get all available products
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Products array
     */
    async getAvailableProducts(options = {}) {
        const { limit = 20, category = null } = options;
        
        try {
            let query = `*[_type == "product" && availability != "discontinued"`;
            
            if (category) {
                query += ` && category->slug.current == "${category}"`;
            }
            
            query += `] | order(sortOrder asc, name asc) [0...${limit}] {
                _id,
                name,
                slug,
                shortDescription,
                description,
                images[] {
                    asset,
                    alt,
                    isPrimary
                },
                category->{name, slug, color},
                availability,
                healthBenefits,
                cookingTips,
                nutritionalInfo,
                isFeatured,
                sortOrder
            }`;

            const products = await this.client.fetch(query);
            return this.transformProducts(products);
        } catch (error) {
            console.error('Error fetching available products:', error);
            return [];
        }
    }

    /**
     * Get single product by slug
     * @param {string} slug - Product slug
     * @returns {Promise<Object|null>} - Product object or null
     */
    async getProduct(slug) {
        try {
            const query = `*[_type == "product" && slug.current == $slug][0] {
                _id,
                name,
                slug,
                shortDescription,
                description,
                images[] {
                    asset,
                    alt,
                    isPrimary
                },
                category->{name, slug, description, color},
                availability,
                healthBenefits,
                cookingTips,
                nutritionalInfo,
                isFeatured,
                sortOrder,
                seo
            }`;

            const product = await this.client.fetch(query, { slug });
            return product ? this.transformProduct(product) : null;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    /**
     * Get blog posts
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Blog posts array
     */
    async getBlogPosts(options = {}) {
        const { limit = 10, featured = false, category = null } = options;
        
        try {
            let query = `*[_type == "blogPost" && status == "published"`;
            
            if (featured) {
                query += ` && isFeatured == true`;
            }
            
            if (category) {
                query += ` && $category in categories`;
            }
            
            query += `] | order(publishedAt desc) [0...${limit}] {
                _id,
                title,
                slug,
                excerpt,
                featuredImage {
                    asset,
                    alt
                },
                author,
                categories,
                tags,
                publishedAt,
                readingTime,
                isFeatured
            }`;

            const posts = await this.client.fetch(query, { category });
            return this.transformBlogPosts(posts);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    }

    /**
     * Get single blog post by slug
     * @param {string} slug - Blog post slug
     * @returns {Promise<Object|null>} - Blog post object or null
     */
    async getBlogPost(slug) {
        try {
            const query = `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
                _id,
                title,
                slug,
                excerpt,
                content,
                featuredImage {
                    asset,
                    alt
                },
                author,
                categories,
                tags,
                publishedAt,
                readingTime,
                isFeatured,
                seo
            }`;

            const post = await this.client.fetch(query, { slug });
            return post ? this.transformBlogPost(post) : null;
        } catch (error) {
            console.error('Error fetching blog post:', error);
            return null;
        }
    }

    /**
     * Get categories
     * @returns {Promise<Array>} - Categories array
     */
    async getCategories() {
        try {
            const query = `*[_type == "category" && isActive == true] | order(sortOrder asc) {
                _id,
                name,
                slug,
                description,
                image {
                    asset,
                    alt
                },
                color,
                sortOrder
            }`;

            const categories = await this.client.fetch(query);
            return this.transformCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    /**
     * Transform products data for frontend use
     * @param {Array} products - Raw products from Sanity
     * @returns {Array} - Transformed products
     */
    transformProducts(products) {
        return products.map(product => this.transformProduct(product));
    }

    /**
     * Transform single product data
     * @param {Object} product - Raw product from Sanity
     * @returns {Object} - Transformed product
     */
    transformProduct(product) {
        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
        
        return {
            ...product,
            slug: product.slug?.current,
            images: product.images?.map(image => ({
                ...image,
                url: this.urlFor(image.asset).width(800).height(600).format('webp').url()
            })),
            primaryImage: primaryImage ? {
                ...primaryImage,
                url: this.urlFor(primaryImage.asset).width(800).height(600).format('webp').url()
            } : null
        };
    }

    /**
     * Transform blog posts data
     * @param {Array} posts - Raw blog posts from Sanity
     * @returns {Array} - Transformed blog posts
     */
    transformBlogPosts(posts) {
        return posts.map(post => this.transformBlogPost(post));
    }

    /**
     * Transform single blog post data
     * @param {Object} post - Raw blog post from Sanity
     * @returns {Object} - Transformed blog post
     */
    transformBlogPost(post) {
        return {
            ...post,
            slug: post.slug?.current,
            featuredImage: post.featuredImage ? {
                ...post.featuredImage,
                url: this.urlFor(post.featuredImage.asset).width(1200).height(630).format('webp').url()
            } : null,
            publishedAt: new Date(post.publishedAt)
        };
    }

    /**
     * Transform categories data
     * @param {Array} categories - Raw categories from Sanity
     * @returns {Array} - Transformed categories
     */
    transformCategories(categories) {
        return categories.map(category => ({
            ...category,
            slug: category.slug?.current,
            image: category.image ? {
                ...category.image,
                url: this.urlFor(category.image.asset).width(400).height(300).format('webp').url()
            } : null
        }));
    }

    /**
     * Subscribe to real-time updates
     * @param {string} query - GROQ query
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    subscribe(query, callback) {
        return this.client.listen(query).subscribe(callback);
    }

    /**
     * Get business information pages
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Business pages array
     */
    async getBusinessPages(options = {}) {
        const { navigation = false, pageType = null } = options;
        
        try {
            let query = `*[_type == "businessPage" && status == "published"`;
            
            if (navigation) {
                query += ` && showInNavigation == true`;
            }
            
            if (pageType) {
                query += ` && pageType == $pageType`;
            }
            
            query += `] | order(navigationOrder asc) {
                _id,
                title,
                slug,
                subtitle,
                pageType,
                excerpt,
                heroImage {
                    asset,
                    alt,
                    caption
                },
                showInNavigation,
                navigationOrder,
                publishedAt,
                lastUpdated,
                status,
                requiresAuth
            }`;

            const pages = await this.client.fetch(query, { pageType });
            return this.transformBusinessPages(pages);
        } catch (error) {
            console.error('Error fetching business pages:', error);
            return [];
        }
    }

    /**
     * Get single business page by slug
     * @param {string} slug - Business page slug
     * @returns {Promise<Object|null>} - Business page object or null
     */
    async getBusinessPage(slug) {
        try {
            const query = `*[_type == "businessPage" && slug.current == $slug && status == "published"][0] {
                _id,
                title,
                slug,
                subtitle,
                pageType,
                excerpt,
                heroImage {
                    asset,
                    alt,
                    caption
                },
                content,
                sidebar,
                relatedPages[]->,
                ctaSection,
                publishedAt,
                lastUpdated,
                status,
                showInNavigation,
                navigationOrder,
                requiresAuth,
                seo
            }`;

            const page = await this.client.fetch(query, { slug });
            return page ? this.transformBusinessPage(page) : null;
        } catch (error) {
            console.error('Error fetching business page:', error);
            return null;
        }
    }

    /**
     * Get tutorials/guides
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Tutorials array
     */
    async getTutorials(options = {}) {
        const { limit = 10, featured = false, category = null, difficulty = null } = options;
        
        try {
            let query = `*[_type == "tutorialGuide" && status == "published"`;
            
            if (featured) {
                query += ` && isFeatured == true`;
            }
            
            if (category) {
                query += ` && category == $category`;
            }
            
            if (difficulty) {
                query += ` && difficulty == $difficulty`;
            }
            
            query += `] | order(publishedAt desc) [0...${limit}] {
                _id,
                title,
                slug,
                subtitle,
                tutorialType,
                difficulty,
                estimatedTime,
                category,
                overview,
                featuredImage {
                    asset,
                    alt,
                    caption
                },
                learningOutcomes,
                publishedAt,
                lastUpdated,
                status,
                isFeatured,
                isPremium,
                author
            }`;

            const tutorials = await this.client.fetch(query, { category, difficulty });
            return this.transformTutorials(tutorials);
        } catch (error) {
            console.error('Error fetching tutorials:', error);
            return [];
        }
    }

    /**
     * Get single tutorial by slug
     * @param {string} slug - Tutorial slug
     * @returns {Promise<Object|null>} - Tutorial object or null
     */
    async getTutorial(slug) {
        try {
            const query = `*[_type == "tutorialGuide" && slug.current == $slug && status == "published"][0] {
                _id,
                title,
                slug,
                subtitle,
                tutorialType,
                difficulty,
                estimatedTime,
                category,
                overview,
                featuredImage {
                    asset,
                    alt,
                    caption
                },
                learningOutcomes,
                prerequisites,
                materials[],
                steps[],
                troubleshooting,
                results,
                nextSteps,
                author,
                reviewedBy[]->,
                publishedAt,
                lastUpdated,
                status,
                isFeatured,
                isPremium,
                tags,
                ratings,
                seo
            }`;

            const tutorial = await this.client.fetch(query, { slug });
            return tutorial ? this.transformTutorial(tutorial) : null;
        } catch (error) {
            console.error('Error fetching tutorial:', error);
            return null;
        }
    }

    /**
     * Get FAQ items
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - FAQ items array
     */
    async getFaqs(options = {}) {
        const { limit = 20, category = null, homepage = false } = options;
        
        try {
            let query = `*[_type == "faq" && isPublished == true`;
            
            if (homepage) {
                query += ` && showOnHomepage == true`;
            }
            
            if (category) {
                query += ` && category == $category`;
            }
            
            query += `] | order(priority desc) [0...${limit}] {
                _id,
                question,
                slug,
                answer,
                category,
                subcategory,
                priority,
                keywords,
                contactInfo,
                lastUpdated
            }`;

            const faqs = await this.client.fetch(query, { category });
            return this.transformFaqs(faqs);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return [];
        }
    }

    /**
     * Get FAQ categories
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - FAQ categories array
     */
    async getFaqCategories(options = {}) {
        const { homepage = false } = options;
        
        try {
            let query = `*[_type == "faqCategory" && isActive == true`;
            
            if (homepage) {
                query += ` && showOnHomepage == true`;
            }
            
            query += `] | order(displayOrder asc) {
                _id,
                name,
                slug,
                description,
                icon,
                color,
                displayOrder
            }`;

            const categories = await this.client.fetch(query);
            return this.transformFaqCategories(categories);
        } catch (error) {
            console.error('Error fetching FAQ categories:', error);
            return [];
        }
    }

    /**
     * Transform business pages data
     * @param {Array} pages - Raw business pages from Sanity
     * @returns {Array} - Transformed business pages
     */
    transformBusinessPages(pages) {
        return pages.map(page => this.transformBusinessPage(page));
    }

    /**
     * Transform single business page data
     * @param {Object} page - Raw business page from Sanity
     * @returns {Object} - Transformed business page
     */
    transformBusinessPage(page) {
        return {
            ...page,
            slug: page.slug?.current,
            heroImage: page.heroImage ? {
                ...page.heroImage,
                url: this.urlFor(page.heroImage.asset).width(1600).height(800).format('webp').url()
            } : null,
            publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
            lastUpdated: page.lastUpdated ? new Date(page.lastUpdated) : null
        };
    }

    /**
     * Transform tutorials/guides data
     * @param {Array} tutorials - Raw tutorials from Sanity
     * @returns {Array} - Transformed tutorials
     */
    transformTutorials(tutorials) {
        return tutorials.map(tutorial => this.transformTutorial(tutorial));
    }

    /**
     * Transform single tutorial data
     * @param {Object} tutorial - Raw tutorial from Sanity
     * @returns {Object} - Transformed tutorial
     */
    transformTutorial(tutorial) {
        const transformed = {
            ...tutorial,
            slug: tutorial.slug?.current,
            featuredImage: tutorial.featuredImage ? {
                ...tutorial.featuredImage,
                url: this.urlFor(tutorial.featuredImage.asset).width(1200).height(630).format('webp').url()
            } : null,
            publishedAt: tutorial.publishedAt ? new Date(tutorial.publishedAt) : null,
            lastUpdated: tutorial.lastUpdated ? new Date(tutorial.lastUpdated) : null
        };

        // Transform images in steps if they exist
        if (tutorial.steps) {
            transformed.steps = tutorial.steps.map(step => {
                if (step.images && step.images.length > 0) {
                    return {
                        ...step,
                        images: step.images.map(image => ({
                            ...image,
                            url: this.urlFor(image.asset).width(800).height(600).format('webp').url()
                        }))
                    };
                }
                return step;
            });
        }

        return transformed;
    }

    /**
     * Transform FAQs data
     * @param {Array} faqs - Raw FAQs from Sanity
     * @returns {Array} - Transformed FAQs
     */
    transformFaqs(faqs) {
        return faqs.map(faq => ({
            ...faq,
            slug: faq.slug?.current,
            lastUpdated: faq.lastUpdated ? new Date(faq.lastUpdated) : null
        }));
    }

    /**
     * Transform FAQ categories data
     * @param {Array} categories - Raw FAQ categories from Sanity
     * @returns {Array} - Transformed FAQ categories
     */
    transformFaqCategories(categories) {
        return categories.map(category => ({
            ...category,
            slug: category.slug?.current
        }));
    }

    /**
     * Test connection to Sanity
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            await this.client.fetch('*[_type == "product"][0]');
            return true;
        } catch (error) {
            console.error('Sanity connection test failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const sanityService = new SanityService();
export default sanityService;

// Make available globally for debugging and use by other scripts
if (typeof window !== 'undefined') {
    window.sanityService = sanityService;
    console.log('✅ Sanity service loaded and available globally');
}
