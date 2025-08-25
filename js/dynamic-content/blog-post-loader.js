/**
 * Blog Post Content Loader
 * Dynamically loads and displays individual blog post content from Sanity CMS
 */

import { sanityService } from '../services/sanity-service.js';
import { publicContentService } from '../services/public-content-service.js';

export class BlogPostLoader {
    constructor() {
        this.currentPost = null;
        this.postSlug = null;
    }

    /**
     * Initialize blog post loader
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.postSlug = this.getPostSlugFromUrl();
            
            if (!this.postSlug) {
                this.showErrorMessage('Blog post not found');
                return;
            }

            // Update page title to loading state
            document.title = 'Loading... - MYCOgenesis Blog';

            await this.loadBlogPost();
            await this.loadRelatedPosts();
            
        } catch (error) {
            console.error('Error initializing blog post loader:', error);
            this.showErrorMessage('Failed to load blog post');
            // Update page title to error state
            document.title = 'Error - MYCOgenesis Blog';
        }
    }

    /**
     * Get post slug from URL parameters
     * @returns {string|null} - Post slug or null
     */
    getPostSlugFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug');
    }

    /**
     * Load and display blog post
     * @returns {Promise<void>}
     */
    async loadBlogPost() {
        try {
            this.showLoadingState();

            // Load from Sanity
            const post = await sanityService.getBlogPost(this.postSlug);
            
            if (!post) {
                this.showErrorMessage('Blog post not found');
                return;
            }

            this.currentPost = post;
            this.renderBlogPost(post);
            
            // Update page metadata
            this.updatePageMetadata(post);

        } catch (error) {
            console.error('Error loading blog post:', error);
            this.showErrorMessage('Failed to load blog post');
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Load and display related posts
     * @returns {Promise<void>}
     */
    async loadRelatedPosts() {
        if (!this.currentPost) return;

        try {
            const relatedPosts = await publicContentService.getRelatedBlogPosts(this.currentPost, 3);
            this.renderRelatedPosts(relatedPosts);
        } catch (error) {
            console.error('Error loading related posts:', error);
        }
    }

    /**
     * Render blog post content
     * @param {Object} post - Blog post object
     */
    renderBlogPost(post) {
        // Update article header
        this.updateArticleHeader(post);
        
        // Update article content
        this.updateArticleContent(post);
        
        // Update featured image
        this.updateFeaturedImage(post);
    }

    /**
     * Update article header
     * @param {Object} post - Blog post object
     */
    updateArticleHeader(post) {
        const categoryElement = document.getElementById('blog-post-category');
        const titleElement = document.getElementById('blog-post-title');
        const authorElement = document.getElementById('blog-post-author');
        const dateElement = document.getElementById('blog-post-date');

        if (categoryElement) {
            categoryElement.textContent = post.category || 'Blog';
        }

        if (titleElement) {
            titleElement.textContent = post.title;
        }

        if (authorElement) {
            authorElement.textContent = post.author?.name || 'MYCOgenesis Team';
        }

        if (dateElement) {
            dateElement.textContent = this.formatDate(post.publishedAt);
        }

        // Show content area
        const contentArea = document.getElementById('blog-post-content');
        if (contentArea) {
            contentArea.classList.remove('hidden');
        }
    }

    /**
     * Update article content
     * @param {Object} post - Blog post object
     */
    updateArticleContent(post) {
        const contentElement = document.getElementById('blog-post-body');
        if (!contentElement) return;

        if (typeof post.content === 'string') {
            contentElement.innerHTML = post.content;
        } else {
            // Handle Sanity portable text content
            contentElement.innerHTML = this.formatPortableText(post.content);
        }
    }

    /**
     * Update featured image
     * @param {Object} post - Blog post object
     */
    updateFeaturedImage(post) {
        const imageElement = document.getElementById('blog-post-image');
        if (!imageElement) return;

        if (post.featuredImage?.url) {
            imageElement.src = post.featuredImage.url;
            imageElement.alt = post.featuredImage.alt || post.title;
            imageElement.classList.remove('hidden');
        }
    }

    /**
     * Render related posts
     * @param {Array} posts - Array of related posts
     */
    renderRelatedPosts(posts) {
        const relatedSection = document.querySelector('#related-posts-grid');
        if (!relatedSection || posts.length === 0) return;

        relatedSection.innerHTML = posts.map(post => this.renderRelatedPostCard(post)).join('');
    }

    /**
     * Render related post card
     * @param {Object} post - Blog post object
     * @returns {string} - HTML string for related post card
     */
    renderRelatedPostCard(post) {
        const imageUrl = post.featuredImage?.url || 'https://images.unsplash.com/photo-1604313324216-a7c751e7dd1e?q=80&w=600&auto=format&fit=crop';
        const imageAlt = post.featuredImage?.alt || post.title;
        const postUrl = this.generatePostUrl(post);

        return `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <a href="${postUrl}" class="block">
                    <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="font-bold text-lg mb-2">${post.title}</h3>
                        <p class="text-slate-600 text-sm">${post.excerpt}</p>
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
        return `blog-post.html?slug=${post.slug}`;
    }

    /**
     * Update page metadata
     * @param {Object} post - Blog post object
     */
    updatePageMetadata(post) {
        // Update page title
        document.title = `${post.title} - MYCOgenesis Blog`;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = post.seo?.metaDescription || post.excerpt;
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = post.seo?.metaDescription || post.excerpt;
            document.head.appendChild(meta);
        }

        // Update Open Graph tags
        this.updateOpenGraphTags(post);
    }

    /**
     * Update Open Graph meta tags
     * @param {Object} post - Blog post object
     */
    updateOpenGraphTags(post) {
        const ogTags = [
            { property: 'og:title', content: post.title },
            { property: 'og:description', content: post.excerpt },
            { property: 'og:type', content: 'article' },
            { property: 'og:url', content: window.location.href },
            { property: 'og:image', content: post.featuredImage?.url || '' },
            { property: 'article:author', content: post.author?.name || 'MYCOgenesis Team' },
            { property: 'article:published_time', content: post.publishedAt?.toISOString() || '' },
            { property: 'article:section', content: post.category || 'Blog' }
        ];

        ogTags.forEach(tag => {
            if (!tag.content) return;

            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (metaTag) {
                metaTag.content = tag.content;
            } else {
                metaTag = document.createElement('meta');
                metaTag.property = tag.property;
                metaTag.content = tag.content;
                document.head.appendChild(metaTag);
            }
        });
    }

    /**
     * Format Sanity portable text content
     * @param {Array} blocks - Portable text blocks
     * @returns {string} - HTML string
     */
    formatPortableText(blocks) {
        if (!Array.isArray(blocks)) {
            console.error('Invalid portable text blocks:', blocks);
            return '';
        }

        return blocks.map(block => {
            if (block._type !== 'block' || !block.children) {
                return '';
            }

            const style = block.style || 'normal';

            // Process the text content
            const text = block.children.map(child => {
                const marks = child.marks || [];
                let content = child.text;

                // Apply text decorations
                if (marks.includes('strong')) {
                    content = `<strong>${content}</strong>`;
                }
                if (marks.includes('em')) {
                    content = `<em>${content}</em>`;
                }
                if (marks.includes('code')) {
                    content = `<code>${content}</code>`;
                }

                return content;
            }).join('');

            // Apply block-level styling
            switch (style) {
                case 'h1':
                    return `<h1 class="text-3xl font-bold mt-8 mb-4">${text}</h1>`;
                case 'h2':
                    return `<h2 class="text-2xl font-bold mt-6 mb-3">${text}</h2>`;
                case 'h3':
                    return `<h3 class="text-xl font-bold mt-4 mb-2">${text}</h3>`;
                case 'blockquote':
                    return `<blockquote class="pl-4 border-l-4 border-teal-500 italic my-4">${text}</blockquote>`;
                case 'code':
                    return `<pre class="bg-slate-100 p-4 rounded my-4"><code>${text}</code></pre>`;
                default:
                    return `<p class="mb-4">${text}</p>`;
            }
        }).join('\n');
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
     * Show loading state
     */
    showLoadingState() {
        const loadingSpinner = document.querySelector('#loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }

        // Hide main content while loading
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '0.5';
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

        // Show main content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '1';
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
        } else {
            // Create error message if container doesn't exist
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 my-4';
            errorDiv.textContent = message;
            
            const main = document.querySelector('main');
            if (main) {
                main.insertBefore(errorDiv, main.firstChild);
            }
        }
    }
}

// Auto-initialize if on blog post page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('blog-post.html') || 
        document.querySelector('article .prose')) {
        const blogPostLoader = new BlogPostLoader();
        blogPostLoader.initialize();
        
        // Make available globally for debugging
        window.blogPostLoader = blogPostLoader;
    }
});