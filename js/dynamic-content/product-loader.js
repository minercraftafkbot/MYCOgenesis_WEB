/**
 * Product Content Loader
 * Dynamically loads and displays product content from Firestore
 */

import { publicContentService } from '../services/public-content-service.js';

export class ProductLoader {
    constructor() {
        this.isLoading = false;
    }

    /**
     * Initialize product loader
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            await this.loadFeaturedProducts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing product loader:', error);
            this.showErrorMessage('Failed to load product content');
        }
    }

    /**
     * Setup event listeners for real-time updates
     */
    setupEventListeners() {
        // Real-time content updates
        window.addEventListener('productContentUpdated', (event) => {
            const { products, changes } = event.detail;
            this.handleRealTimeUpdates(products, changes);
        });
    }

    /**
     * Handle real-time content updates
     * @param {Array} products - Updated products array
     * @param {Array} changes - Firestore document changes
     */
    handleRealTimeUpdates(products, changes) {
        // Check if there are changes to featured products
        const hasChanges = changes.some(change => 
            change.type === 'added' || 
            change.type === 'modified' || 
            change.type === 'removed'
        );
        
        if (hasChanges) {
            // Reload featured products to show updates
            this.renderFeaturedProducts(products);
        }
    }

    /**
     * Load and display featured products
     * @returns {Promise<void>}
     */
    async loadFeaturedProducts() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const products = await publicContentService.getFeaturedProducts(3);
            this.renderFeaturedProducts(products);
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.showErrorMessage('Failed to load featured products');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    /**
     * Render featured products
     * @param {Array} products - Array of product objects
     */
    renderFeaturedProducts(products) {
        const productsGrid = document.querySelector('#featured-products .grid');
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-slate-600 text-lg">No featured products available.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }

    /**
     * Render individual product card
     * @param {Object} product - Product object
     * @returns {string} - HTML string for product card
     */
    renderProductCard(product) {
        const primaryImage = this.getPrimaryImage(product);
        const imageUrl = primaryImage?.url || '/images/Featured_varieties/default-mushroom.png';
        const imageAlt = primaryImage?.alt || product.name;
        const productUrl = this.generateProductUrl(product);

        return `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-56 object-cover">
                <div class="p-6">
                    <h3 class="font-bold text-xl mb-2">${product.name}</h3>
                    <p class="text-slate-600 mb-4">${product.shortDescription || product.description}</p>
                    <div class="flex justify-between items-center">
                        <a href="${productUrl}" class="text-teal-600 hover:text-teal-800 font-semibold">
                            Learn More &rarr;
                        </a>
                        <span class="text-sm px-2 py-1 rounded-full ${this.getAvailabilityClass(product.availability)}">
                            ${this.getAvailabilityText(product.availability)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get primary image from product images
     * @param {Object} product - Product object
     * @returns {Object|null} - Primary image or null
     */
    getPrimaryImage(product) {
        if (!product.images || product.images.length === 0) {
            return null;
        }

        return product.images.find(img => img.isPrimary) || product.images[0];
    }

    /**
     * Generate product URL
     * @param {Object} product - Product object
     * @returns {string} - Product URL
     */
    generateProductUrl(product) {
        // For now, link to the mushrooms section with the product ID
        // In a real implementation, you might have dedicated product pages
        return `#mushrooms-${product.slug}`;
    }

    /**
     * Get availability CSS class
     * @param {string} availability - Product availability status
     * @returns {string} - CSS class name
     */
    getAvailabilityClass(availability) {
        switch (availability) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'out-of-stock':
                return 'bg-red-100 text-red-800';
            case 'seasonal':
                return 'bg-yellow-100 text-yellow-800';
            case 'discontinued':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Get availability display text
     * @param {string} availability - Product availability status
     * @returns {string} - Display text
     */
    getAvailabilityText(availability) {
        switch (availability) {
            case 'available':
                return 'Available';
            case 'out-of-stock':
                return 'Out of Stock';
            case 'seasonal':
                return 'Seasonal';
            case 'discontinued':
                return 'Discontinued';
            default:
                return 'Unknown';
        }
    }

    /**
     * Load all products for mushrooms section
     * @returns {Promise<void>}
     */
    async loadAllProducts() {
        try {
            const products = await publicContentService.getAvailableProducts({ limit: 20 });
            this.renderMushroomVarieties(products);
        } catch (error) {
            console.error('Error loading all products:', error);
        }
    }

    /**
     * Render mushroom varieties section
     * @param {Array} products - Array of product objects
     */
    renderMushroomVarieties(products) {
        const mushroomsSection = document.querySelector('#mushrooms .space-y-20');
        if (!mushroomsSection) return;

        if (products.length === 0) {
            mushroomsSection.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-slate-600 text-lg">No mushroom varieties available.</p>
                </div>
            `;
            return;
        }

        // Group products and render them in alternating layout
        const varietiesHTML = products.map((product, index) => 
            this.renderMushroomVariety(product, index % 2 === 0)
        ).join('');

        mushroomsSection.innerHTML = varietiesHTML;
    }

    /**
     * Render individual mushroom variety
     * @param {Object} product - Product object
     * @param {boolean} imageLeft - Whether image should be on the left
     * @returns {string} - HTML string for mushroom variety
     */
    renderMushroomVariety(product, imageLeft = true) {
        const primaryImage = this.getPrimaryImage(product);
        const imageUrl = primaryImage?.url || '/images/home_page/default-mushroom.png';
        const imageAlt = primaryImage?.alt || product.name;

        const imageElement = `
            <img src="${imageUrl}" alt="${imageAlt}" class="rounded-lg shadow-lg w-full" id="mushrooms-${product.slug}">
        `;

        const contentElement = `
            <div>
                <h3 class="text-2xl font-bold mb-3">${product.name}</h3>
                <p class="text-slate-600 mb-4">${product.description}</p>
                ${product.healthBenefits && product.healthBenefits.length > 0 ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-slate-800 mb-2">Health Benefits:</h4>
                        <ul class="list-disc list-inside text-slate-600 space-y-1">
                            ${product.healthBenefits.slice(0, 3).map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${product.cookingTips ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-slate-800 mb-2">Cooking Tips:</h4>
                        <p class="text-slate-600">${product.cookingTips}</p>
                    </div>
                ` : ''}
                <div class="flex items-center space-x-4">
                    <span class="text-sm px-3 py-1 rounded-full ${this.getAvailabilityClass(product.availability)}">
                        ${this.getAvailabilityText(product.availability)}
                    </span>
                    ${product.nutritionalInfo && product.nutritionalInfo.calories ? `
                        <span class="text-sm text-slate-500">
                            ${product.nutritionalInfo.calories} cal per 100g
                        </span>
                    ` : ''}
                </div>
            </div>
        `;

        if (imageLeft) {
            return `
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    ${imageElement}
                    ${contentElement}
                </div>
            `;
        } else {
            return `
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="md:order-2">
                        ${imageElement}
                    </div>
                    <div class="md:order-1">
                        ${contentElement}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loadingSpinner = document.querySelector('#products-loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingSpinner = document.querySelector('#products-loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const errorContainer = document.querySelector('#products-error-message');
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

// Auto-initialize if on main page
// DISABLED: Enhanced home loader now handles featured products
// document.addEventListener('DOMContentLoaded', () => {
//     if (window.location.pathname === '/' || 
//         window.location.pathname.includes('index.html') ||
//         document.querySelector('#featured-products')) {
//         const productLoader = new ProductLoader();
//         productLoader.initialize();
//         
//         // Load all products for mushrooms section if it exists
//         if (document.querySelector('#mushrooms')) {
//             productLoader.loadAllProducts();
//         }
//         
//         // Make available globally for debugging
//         window.productLoader = productLoader;
//     }
// });
