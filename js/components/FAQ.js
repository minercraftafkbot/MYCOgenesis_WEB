/**
 * FAQ Component
 * Displays FAQs with search, filtering, and expandable answers
 */

class FAQComponent {
    constructor() {
        this.faqs = [];
        this.categories = [];
        this.filteredFaqs = [];
        this.expandedItems = new Set();
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.contentRenderer = new ContentRenderer();
        this.isLoading = false;
    }

    /**
     * Initialize FAQ system
     * @param {Object} options - Initialization options
     */
    async init(options = {}) {
        try {
            this.showLoading();
            
            // Load FAQs and categories in parallel
            const [faqs, categories] = await Promise.all([
                sanityService.getFaqs(options),
                sanityService.getFaqCategories(options)
            ]);

            this.faqs = faqs || [];
            this.categories = categories || [];
            this.filteredFaqs = [...this.faqs];

            this.render();
            this.setupInteractivity();
            this.updateSEO();
        } catch (error) {
            console.error('Error loading FAQs:', error);
            this.showError();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const container = document.getElementById('faq-container') || document.body;
        this.isLoading = true;
        
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p class="text-slate-600">Loading FAQs...</p>
                </div>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError() {
        const container = document.getElementById('faq-container') || document.body;
        
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center max-w-md mx-auto px-4">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Error Loading FAQs</h1>
                    <p class="text-slate-600 mb-6">We're having trouble loading the FAQ section. Please try again later.</p>
                    <button onclick="location.reload()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render the FAQ interface
     */
    render() {
        const container = document.getElementById('faq-container') || document.body;
        
        container.innerHTML = `
            <div class="faq-page bg-stone-50 min-h-screen">
                ${this.renderHeader()}
                
                <div class="container mx-auto px-4 sm:px-6 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- FAQ Filters & Categories -->
                        <div class="lg:col-span-1">
                            ${this.renderSidebar()}
                        </div>
                        
                        <!-- FAQ List -->
                        <div class="lg:col-span-3">
                            ${this.renderFAQList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.isLoading = false;
    }

    /**
     * Render FAQ header
     */
    renderHeader() {
        return `
            <section class="bg-white border-b">
                <div class="container mx-auto px-4 sm:px-6 py-12">
                    <div class="text-center max-w-3xl mx-auto">
                        <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p class="text-lg text-slate-600 mb-8">
                            Find answers to common questions about mushroom cultivation, our products, and services.
                        </p>
                        
                        <!-- Search Bar -->
                        <div class="relative max-w-md mx-auto">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input type="text" 
                                   id="faq-search" 
                                   class="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                   placeholder="Search FAQs..." 
                                   value="${this.searchQuery}">
                        </div>
                        
                        ${this.renderQuickStats()}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render quick stats
     */
    renderQuickStats() {
        const totalFaqs = this.faqs.length;
        const totalCategories = this.categories.length;
        const filteredCount = this.filteredFaqs.length;

        return `
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div class="bg-slate-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-teal-600">${totalFaqs}</div>
                    <div class="text-sm text-slate-600">Total Questions</div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-teal-600">${totalCategories}</div>
                    <div class="text-sm text-slate-600">Categories</div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-teal-600">${filteredCount}</div>
                    <div class="text-sm text-slate-600">Showing Results</div>
                </div>
            </div>
        `;
    }

    /**
     * Render sidebar with categories and filters
     */
    renderSidebar() {
        return `
            <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                <h3 class="font-semibold mb-4">FAQ Categories</h3>
                
                <!-- All Categories -->
                <div class="space-y-2 mb-6">
                    <button onclick="faqComponent.filterByCategory('all')" 
                            class="w-full text-left p-3 rounded-lg transition-colors ${this.selectedCategory === 'all' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'hover:bg-slate-50'}">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">All Categories</span>
                            <span class="text-sm text-slate-500">${this.faqs.length}</span>
                        </div>
                    </button>
                </div>
                
                <!-- Category List -->
                <div class="space-y-2">
                    ${this.categories.map(category => {
                        const count = this.faqs.filter(faq => faq.category === category.slug).length;
                        const isSelected = this.selectedCategory === category.slug;
                        
                        return `
                            <button onclick="faqComponent.filterByCategory('${category.slug}')" 
                                    class="w-full text-left p-3 rounded-lg transition-colors ${isSelected ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'hover:bg-slate-50'}">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="text-lg mr-2">${category.icon || '📁'}</span>
                                        <span class="font-medium text-sm">${category.name}</span>
                                    </div>
                                    <span class="text-xs text-slate-500">${count}</span>
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
                
                <!-- Clear Filters -->
                ${this.selectedCategory !== 'all' || this.searchQuery ? `
                    <div class="mt-6 pt-4 border-t">
                        <button onclick="faqComponent.clearFilters()" 
                                class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
                            🔄 Clear All Filters
                        </button>
                    </div>
                ` : ''}
                
                <!-- Contact Support -->
                <div class="mt-6 pt-4 border-t">
                    <div class="text-sm text-slate-600 mb-3">
                        Still have questions?
                    </div>
                    <a href="#contact" 
                       class="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center px-4 py-2 rounded-lg text-sm transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Render FAQ list
     */
    renderFAQList() {
        if (this.filteredFaqs.length === 0) {
            return this.renderEmptyState();
        }

        // Group FAQs by priority
        const highPriority = this.filteredFaqs.filter(faq => faq.priority === 'high');
        const mediumPriority = this.filteredFaqs.filter(faq => faq.priority === 'medium');
        const lowPriority = this.filteredFaqs.filter(faq => faq.priority === 'low');

        return `
            <div class="space-y-6">
                <!-- Search Results Info -->
                ${this.searchQuery || this.selectedCategory !== 'all' ? `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-blue-800">Search Results</h3>
                                <p class="text-sm text-blue-600">
                                    Showing ${this.filteredFaqs.length} result${this.filteredFaqs.length !== 1 ? 's' : ''}
                                    ${this.searchQuery ? ` for "${this.searchQuery}"` : ''}
                                    ${this.selectedCategory !== 'all' ? ` in ${this.getCategoryName(this.selectedCategory)}` : ''}
                                </p>
                            </div>
                            <button onclick="faqComponent.clearFilters()" 
                                    class="text-blue-600 hover:text-blue-800 text-sm underline">
                                Clear filters
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- High Priority FAQs -->
                ${highPriority.length > 0 ? `
                    <div>
                        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium mr-2">HIGH PRIORITY</span>
                            Most Important Questions
                        </h2>
                        <div class="space-y-4">
                            ${highPriority.map(faq => this.renderFAQItem(faq, true)).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Medium Priority FAQs -->
                ${mediumPriority.length > 0 ? `
                    <div>
                        ${highPriority.length > 0 ? '<div class="border-t pt-6"></div>' : ''}
                        <h2 class="text-lg font-semibold text-slate-800 mb-4">Common Questions</h2>
                        <div class="space-y-4">
                            ${mediumPriority.map(faq => this.renderFAQItem(faq)).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Low Priority FAQs -->
                ${lowPriority.length > 0 ? `
                    <div>
                        ${(highPriority.length > 0 || mediumPriority.length > 0) ? '<div class="border-t pt-6"></div>' : ''}
                        <h2 class="text-lg font-semibold text-slate-800 mb-4">Additional Information</h2>
                        <div class="space-y-4">
                            ${lowPriority.map(faq => this.renderFAQItem(faq)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render individual FAQ item
     */
    renderFAQItem(faq, isHighPriority = false) {
        const isExpanded = this.expandedItems.has(faq._id);
        const categoryInfo = this.categories.find(cat => cat.slug === faq.category);

        return `
            <div class="bg-white rounded-lg shadow-sm border ${isHighPriority ? 'border-red-200 shadow-red-50' : ''} overflow-hidden">
                <!-- Question Header -->
                <button onclick="faqComponent.toggleExpanded('${faq._id}')" 
                        class="w-full text-left p-6 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 pr-4">
                            <!-- Category Badge -->
                            <div class="flex items-center mb-2">
                                ${categoryInfo ? `
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mr-2">
                                        ${categoryInfo.icon || '📁'} ${categoryInfo.name}
                                    </span>
                                ` : ''}
                                
                                ${isHighPriority ? `
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        🔝 High Priority
                                    </span>
                                ` : ''}
                            </div>
                            
                            <!-- Question -->
                            <h3 class="text-lg font-medium text-slate-900 mb-1">
                                ${this.highlightSearchTerm(faq.question)}
                            </h3>
                            
                            <!-- Keywords (if search query) -->
                            ${this.searchQuery && faq.keywords ? `
                                <div class="text-xs text-slate-500">
                                    Keywords: ${faq.keywords.filter(keyword => 
                                        keyword.toLowerCase().includes(this.searchQuery.toLowerCase())
                                    ).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Expand/Collapse Icon -->
                        <div class="flex-shrink-0 ml-2">
                            <svg class="w-5 h-5 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}" 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                <!-- Answer Content -->
                <div class="faq-answer ${isExpanded ? 'expanded' : 'collapsed'}" 
                     style="display: ${isExpanded ? 'block' : 'none'}">
                    <div class="px-6 pb-6 border-t border-slate-100">
                        <div class="pt-4">
                            <!-- Answer Text -->
                            <div class="prose prose-slate max-w-none">
                                ${this.contentRenderer.renderBlocks(faq.answer)}
                            </div>
                            
                            <!-- Contact Information -->
                            ${faq.contactInfo?.showContactInfo ? `
                                <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 class="font-medium text-blue-800 mb-2">
                                        ${faq.contactInfo.contactTitle || 'Need more help?'}
                                    </h4>
                                    <div class="text-sm text-blue-700 space-y-1">
                                        ${faq.contactInfo.contactEmail ? `
                                            <div>📧 <a href="mailto:${faq.contactInfo.contactEmail}" 
                                                       class="underline hover:no-underline">${faq.contactInfo.contactEmail}</a></div>
                                        ` : ''}
                                        ${faq.contactInfo.contactPhone ? `
                                            <div>📞 <a href="tel:${faq.contactInfo.contactPhone}" 
                                                       class="underline hover:no-underline">${faq.contactInfo.contactPhone}</a></div>
                                        ` : ''}
                                        ${faq.contactInfo.contactHours ? `
                                            <div>🕒 ${faq.contactInfo.contactHours}</div>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Related Content -->
                            ${this.renderRelatedContent(faq.relatedContent)}
                            
                            <!-- Helpful Rating -->
                            <div class="mt-6 pt-4 border-t border-slate-100">
                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-slate-600">
                                        Was this helpful?
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="faqComponent.rateFAQ('${faq._id}', true)" 
                                                class="p-2 rounded-full hover:bg-green-50 transition-colors group">
                                            <svg class="w-4 h-4 text-slate-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V9a2 2 0 00-2-2H7.414a1 1 0 00-.707.293L4 10h3m7 0v11"></path>
                                            </svg>
                                        </button>
                                        <button onclick="faqComponent.rateFAQ('${faq._id}', false)" 
                                                class="p-2 rounded-full hover:bg-red-50 transition-colors group">
                                            <svg class="w-4 h-4 text-slate-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h2.828a1 1 0 00.707-.293L20 14h-3m-7 0v-11"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                ${faq.lastUpdated ? `
                                    <div class="text-xs text-slate-500 mt-2">
                                        Last updated: ${new Date(faq.lastUpdated).toLocaleDateString()}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render related content
     */
    renderRelatedContent(relatedContent) {
        if (!relatedContent || relatedContent.length === 0) return '';

        return `
            <div class="mt-6">
                <h4 class="font-medium text-slate-800 mb-3">Related Resources</h4>
                <div class="grid gap-3">
                    ${relatedContent.map(item => `
                        <a href="/${item._type}/${item.slug}" 
                           class="flex items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                            <div class="flex-shrink-0 mr-3">
                                ${this.getContentTypeIcon(item._type)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h5 class="font-medium text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                                    ${item.title}
                                </h5>
                                ${item.excerpt ? `
                                    <p class="text-sm text-slate-600 truncate">${item.excerpt}</p>
                                ` : ''}
                            </div>
                            <svg class="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Get content type icon
     */
    getContentTypeIcon(contentType) {
        const icons = {
            'blogPost': '📝',
            'tutorialGuide': '📚',
            'researchArticle': '🔬',
            'businessPage': '🏢',
            'product': '🍄'
        };
        return icons[contentType] || '📄';
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-lg font-medium text-slate-900 mb-2">No FAQs found</h3>
                <p class="text-slate-600 mb-6">
                    ${this.searchQuery 
                        ? `No questions match "${this.searchQuery}". Try different keywords or browse categories.`
                        : 'No FAQs are available in this category.'
                    }
                </p>
                <div class="flex justify-center space-x-4">
                    ${this.searchQuery || this.selectedCategory !== 'all' ? `
                        <button onclick="faqComponent.clearFilters()" 
                                class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Clear Filters
                        </button>
                    ` : ''}
                    <a href="#contact" 
                       class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * FAQ interaction methods
     */
    toggleExpanded(faqId) {
        if (this.expandedItems.has(faqId)) {
            this.expandedItems.delete(faqId);
        } else {
            this.expandedItems.add(faqId);
        }
        
        // Re-render just the affected FAQ item
        const faqElement = document.querySelector(`[onclick*="${faqId}"]`).closest('.bg-white');
        const faq = this.faqs.find(f => f._id === faqId);
        if (faq && faqElement) {
            faqElement.outerHTML = this.renderFAQItem(faq);
        }

        // Track analytics
        if (window.gtag) {
            gtag('event', this.expandedItems.has(faqId) ? 'expand_faq' : 'collapse_faq', {
                event_category: 'faq_interaction',
                event_label: faq?.question || faqId
            });
        }
    }

    filterByCategory(categorySlug) {
        this.selectedCategory = categorySlug;
        this.applyFilters();
        this.render();

        // Track analytics
        if (window.gtag) {
            gtag('event', 'filter_faq_category', {
                event_category: 'faq_interaction',
                event_label: categorySlug
            });
        }
    }

    searchFAQs(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applyFilters();
        this.render();

        // Track analytics
        if (window.gtag && this.searchQuery) {
            gtag('event', 'search_faq', {
                event_category: 'faq_interaction',
                event_label: this.searchQuery
            });
        }
    }

    clearFilters() {
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.applyFilters();
        this.render();
        
        // Clear search input
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    applyFilters() {
        let filtered = [...this.faqs];

        // Apply category filter
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(faq => faq.category === this.selectedCategory);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(faq => {
                const searchIn = [
                    faq.question,
                    ...(faq.keywords || []),
                    ...(faq.answer ? this.extractTextFromBlocks(faq.answer) : [])
                ].join(' ').toLowerCase();
                
                return searchIn.includes(this.searchQuery);
            });
        }

        this.filteredFaqs = filtered;
    }

    rateFAQ(faqId, isHelpful) {
        // Here you would typically send this to your analytics or feedback system
        console.log(`FAQ ${faqId} rated as ${isHelpful ? 'helpful' : 'not helpful'}`);
        
        // Show feedback message
        this.showFeedbackMessage(isHelpful);

        // Track analytics
        if (window.gtag) {
            gtag('event', 'rate_faq', {
                event_category: 'faq_interaction',
                event_label: faqId,
                value: isHelpful ? 1 : 0
            });
        }
    }

    showFeedbackMessage(isHelpful) {
        // Create and show a temporary feedback message
        const message = document.createElement('div');
        message.className = `fixed bottom-4 right-4 ${isHelpful ? 'bg-green-600' : 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        message.textContent = isHelpful ? 'Thanks for your feedback!' : 'We\'ll work to improve this answer.';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    /**
     * Utility methods
     */
    getCategoryName(slug) {
        const category = this.categories.find(cat => cat.slug === slug);
        return category ? category.name : slug;
    }

    highlightSearchTerm(text) {
        if (!this.searchQuery || !text) return text;
        
        const regex = new RegExp(`(${this.searchQuery})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    }

    extractTextFromBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) return [];
        
        return blocks
            .filter(block => block._type === 'block')
            .flatMap(block => block.children || [])
            .filter(child => child._type === 'span')
            .map(child => child.text || '')
            .filter(text => text.trim());
    }

    /**
     * Setup interactivity
     */
    setupInteractivity() {
        // Search input handler
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchFAQs(e.target.value);
                }, 300); // Debounce search
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search with Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('faq-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }

    /**
     * Update SEO meta tags
     */
    updateSEO() {
        document.title = 'Frequently Asked Questions | MYCOgenesis';
        
        this.updateMetaTag('description', 'Find answers to common questions about mushroom cultivation, our products, and services. Get help with growing, cooking, and storing mushrooms.');
        this.updateMetaTag('og:title', 'Frequently Asked Questions | MYCOgenesis');
        this.updateMetaTag('og:description', 'Find answers to common questions about mushroom cultivation, our products, and services.');
        this.updateMetaTag('og:type', 'website');
        this.updateMetaTag('og:url', window.location.href);
    }

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
}

// Export for use
window.FAQComponent = FAQComponent;
