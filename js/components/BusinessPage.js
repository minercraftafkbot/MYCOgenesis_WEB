/**
 * Business Page Component
 * Displays business information pages with rich content blocks
 */

class BusinessPageComponent {
    constructor() {
        this.currentPage = null;
        this.contentRenderer = new ContentRenderer();
    }

    /**
     * Initialize business page
     * @param {string} slug - Page slug
     */
    async init(slug) {
        try {
            // Use enhanced service coordinator if available
            if (window.enhancedServiceCoordinator && window.enhancedServiceCoordinator.initialized) {
                this.currentPage = await window.enhancedServiceCoordinator.loadBusinessPage(slug);
            } else {
                this.showLoading();
                this.currentPage = await sanityService.getBusinessPage(slug);
            }
            
            if (!this.currentPage) {
                this.showNotFound();
                return;
            }

            this.render();
            this.setupInteractivity();
            this.updateSEO();
        } catch (error) {
            console.error('Error loading business page:', error);
            this.showError();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const container = document.getElementById('business-page-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p class="text-slate-600">Loading page...</p>
                </div>
            </div>
        `;
    }

    /**
     * Show not found state
     */
    showNotFound() {
        const container = document.getElementById('business-page-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center max-w-md mx-auto px-4">
                    <div class="text-6xl mb-4">😔</div>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h1>
                    <p class="text-slate-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
                    <a href="/" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors">
                        Return Home
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError() {
        const container = document.getElementById('business-page-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center max-w-md mx-auto px-4">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Something went wrong</h1>
                    <p class="text-slate-600 mb-6">We're having trouble loading this page. Please try again later.</p>
                    <button onclick="location.reload()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render the business page
     */
    render() {
        const container = document.getElementById('business-page-container') || document.body;
        const page = this.currentPage;
        
        container.innerHTML = `
            <div class="business-page">
                ${this.renderHeroSection(page)}
                
                <div class="container mx-auto px-4 sm:px-6 py-8">
                    <div class="grid grid-cols-1 ${page.sidebar?.showSidebar ? 'lg:grid-cols-4' : ''} gap-8">
                        <!-- Main Content -->
                        <div class="${page.sidebar?.showSidebar ? 'lg:col-span-3' : 'max-w-4xl mx-auto'}">
                            ${this.renderMainContent(page)}
                        </div>
                        
                        ${page.sidebar?.showSidebar ? this.renderSidebar(page.sidebar) : ''}
                    </div>
                </div>

                ${this.renderRelatedPages(page.relatedPages)}
                ${page.ctaSection?.showCta ? this.renderCTASection(page.ctaSection) : ''}
            </div>
        `;
    }

    /**
     * Render hero section
     */
    renderHeroSection(page) {
        if (!page.heroImage && !page.title) return '';

        return `
            <section class="relative bg-slate-900 text-white">
                ${page.heroImage ? `
                    <div class="absolute inset-0">
                        <img src="${page.heroImage.url}" 
                             alt="${page.heroImage.alt || page.title}"
                             class="w-full h-full object-cover opacity-50">
                        <div class="absolute inset-0 bg-black/40"></div>
                    </div>
                ` : ''}
                
                <div class="relative container mx-auto px-4 sm:px-6 py-16 lg:py-24">
                    <div class="max-w-4xl">
                        ${this.renderBreadcrumbs(page)}
                        
                        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            ${page.title}
                        </h1>
                        
                        ${page.subtitle ? `
                            <p class="text-xl sm:text-2xl text-gray-200 mb-6 max-w-3xl">
                                ${page.subtitle}
                            </p>
                        ` : ''}
                        
                        ${page.excerpt ? `
                            <p class="text-lg text-gray-300 max-w-2xl">
                                ${page.excerpt}
                            </p>
                        ` : ''}
                        
                        ${page.lastUpdated ? `
                            <div class="mt-8 text-sm text-gray-400">
                                Last updated: ${new Date(page.lastUpdated).toLocaleDateString()}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render breadcrumbs
     */
    renderBreadcrumbs(page) {
        return `
            <nav class="mb-6">
                <div class="flex items-center space-x-2 text-sm text-gray-300">
                    <a href="/" class="hover:text-white transition-colors">Home</a>
                    <span>/</span>
                    <span class="text-white">${page.title}</span>
                </div>
            </nav>
        `;
    }

    /**
     * Render main content
     */
    renderMainContent(page) {
        if (!page.content || page.content.length === 0) {
            return '<p class="text-slate-600">No content available.</p>';
        }

        let html = '<div class="prose prose-slate max-w-none">';
        
        page.content.forEach(block => {
            html += this.contentRenderer.renderBlock(block);
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Render sidebar
     */
    renderSidebar(sidebar) {
        return `
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                    ${sidebar.title ? `<h3 class="text-lg font-semibold mb-4">${sidebar.title}</h3>` : ''}
                    
                    ${sidebar.content ? this.contentRenderer.renderBlocks(sidebar.content) : ''}
                    
                    ${sidebar.quickLinks && sidebar.quickLinks.length > 0 ? `
                        <div class="mt-6">
                            <h4 class="font-medium mb-3">Quick Links</h4>
                            <ul class="space-y-2">
                                ${sidebar.quickLinks.map(link => `
                                    <li>
                                        <a href="${link.url}" 
                                           class="text-teal-600 hover:text-teal-800 text-sm transition-colors"
                                           ${link.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                            ${link.title}
                                            ${link.isExternal ? '<svg class="inline w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path></svg>' : ''}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render related pages section
     */
    renderRelatedPages(relatedPages) {
        if (!relatedPages || relatedPages.length === 0) return '';

        return `
            <section class="bg-gray-50 py-12">
                <div class="container mx-auto px-4 sm:px-6">
                    <h2 class="text-2xl font-bold text-center mb-8">Related Information</h2>
                    
                    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        ${relatedPages.map(page => `
                            <div class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                ${page.featuredImage || page.heroImage ? `
                                    <img src="${(page.featuredImage || page.heroImage).url}" 
                                         alt="${(page.featuredImage || page.heroImage).alt || page.title}"
                                         class="w-full h-40 object-cover">
                                ` : ''}
                                
                                <div class="p-4">
                                    <h3 class="font-semibold mb-2 line-clamp-2">${page.title}</h3>
                                    ${page.excerpt ? `
                                        <p class="text-sm text-slate-600 line-clamp-2 mb-3">${page.excerpt}</p>
                                    ` : ''}
                                    <a href="/${page._type}/${page.slug}" 
                                       class="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors">
                                        Learn more →
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render CTA section
     */
    renderCTASection(cta) {
        return `
            <section class="bg-teal-600 text-white py-12">
                <div class="container mx-auto px-4 sm:px-6 text-center">
                    ${cta.title ? `<h2 class="text-2xl font-bold mb-4">${cta.title}</h2>` : ''}
                    ${cta.description ? `<p class="text-lg mb-8 max-w-2xl mx-auto">${cta.description}</p>` : ''}
                    
                    <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                        ${cta.primaryButton?.text ? `
                            <a href="${cta.primaryButton.url}" 
                               class="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
                               ${cta.primaryButton.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                ${cta.primaryButton.text}
                            </a>
                        ` : ''}
                        
                        ${cta.secondaryButton?.text ? `
                            <a href="${cta.secondaryButton.url}" 
                               class="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-3 rounded-lg font-semibold transition-colors"
                               ${cta.secondaryButton.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                ${cta.secondaryButton.text}
                            </a>
                        ` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Setup interactivity
     */
    setupInteractivity() {
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Add click tracking for analytics
        document.querySelectorAll('.business-page a').forEach(link => {
            link.addEventListener('click', () => {
                // Track link clicks for analytics
                if (window.gtag) {
                    gtag('event', 'click', {
                        event_category: 'business_page',
                        event_label: link.href,
                        page_type: this.currentPage?.pageType
                    });
                }
            });
        });
    }

    /**
     * Update SEO meta tags
     */
    updateSEO() {
        if (!this.currentPage) return;

        const page = this.currentPage;
        
        // Update title
        document.title = page.seo?.metaTitle || `${page.title} | MYCOgenesis`;
        
        // Update meta description
        this.updateMetaTag('description', page.seo?.metaDescription || page.excerpt || '');
        
        // Update Open Graph tags
        this.updateMetaTag('og:title', page.seo?.metaTitle || page.title);
        this.updateMetaTag('og:description', page.seo?.metaDescription || page.excerpt || '');
        this.updateMetaTag('og:type', 'article');
        this.updateMetaTag('og:url', window.location.href);
        
        if (page.seo?.ogImage?.url || page.heroImage?.url) {
            this.updateMetaTag('og:image', page.seo?.ogImage?.url || page.heroImage?.url);
        }
        
        // Update Twitter Card tags
        this.updateMetaTag('twitter:card', 'summary_large_image');
        this.updateMetaTag('twitter:title', page.seo?.metaTitle || page.title);
        this.updateMetaTag('twitter:description', page.seo?.metaDescription || page.excerpt || '');
        
        // Update canonical URL
        this.updateLinkTag('canonical', window.location.href);
        
        // Add structured data
        this.addStructuredData(page);
    }

    /**
     * Update meta tag
     */
    updateMetaTag(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    /**
     * Update link tag
     */
    updateLinkTag(rel, href) {
        let link = document.querySelector(`link[rel="${rel}"]`);
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', rel);
            document.head.appendChild(link);
        }
        link.setAttribute('href', href);
    }

    /**
     * Add structured data
     */
    addStructuredData(page) {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": page.title,
            "description": page.excerpt || '',
            "url": window.location.href,
            "publisher": {
                "@type": "Organization",
                "name": "MYCOgenesis",
                "url": window.location.origin
            },
            "datePublished": page.publishedAt,
            "dateModified": page.lastUpdated || page.publishedAt
        };

        // Remove existing structured data
        const existing = document.querySelector('script[type="application/ld+json"]');
        if (existing) {
            existing.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

// Export for use
window.BusinessPageComponent = BusinessPageComponent;
