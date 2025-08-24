/**
 * Real-time Content Service
 * Handles real-time updates for content changes using Firestore listeners
 */

export class RealTimeContentService {
    constructor() {
        this.db = window.firebaseServices?.db;
        this.listeners = new Map();
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
     * Listen for published blog posts changes
     * @param {Function} callback - Callback function to handle changes
     * @returns {Function} - Unsubscribe function
     */
    listenToPublishedBlogPosts(callback) {
        if (!this.initialized) {
            console.warn('RealTimeContentService not initialized');
            return () => {};
        }

        const query = this.db.collection('blogs')
            .where('status', '==', 'published')
            .orderBy('publishedAt', 'desc');

        const unsubscribe = query.onSnapshot((snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

            callback(posts, snapshot.docChanges());
        }, (error) => {
            console.error('Error listening to blog posts:', error);
        });

        // Store listener for cleanup
        const listenerId = 'blog-posts-' + Date.now();
        this.listeners.set(listenerId, unsubscribe);

        return unsubscribe;
    }

    /**
     * Listen for featured products changes
     * @param {Function} callback - Callback function to handle changes
     * @returns {Function} - Unsubscribe function
     */
    listenToFeaturedProducts(callback) {
        if (!this.initialized) {
            console.warn('RealTimeContentService not initialized');
            return () => {};
        }

        const query = this.db.collection('products')
            .where('featured', '==', true)
            .where('availability', '==', 'available')
            .orderBy('order', 'asc');

        const unsubscribe = query.onSnapshot((snapshot) => {
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

            callback(products, snapshot.docChanges());
        }, (error) => {
            console.error('Error listening to featured products:', error);
        });

        // Store listener for cleanup
        const listenerId = 'featured-products-' + Date.now();
        this.listeners.set(listenerId, unsubscribe);

        return unsubscribe;
    }

    /**
     * Listen for all available products changes
     * @param {Function} callback - Callback function to handle changes
     * @returns {Function} - Unsubscribe function
     */
    listenToAvailableProducts(callback) {
        if (!this.initialized) {
            console.warn('RealTimeContentService not initialized');
            return () => {};
        }

        const query = this.db.collection('products')
            .where('availability', '==', 'available')
            .orderBy('order', 'asc');

        const unsubscribe = query.onSnapshot((snapshot) => {
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
            }));

            callback(products, snapshot.docChanges());
        }, (error) => {
            console.error('Error listening to available products:', error);
        });

        // Store listener for cleanup
        const listenerId = 'available-products-' + Date.now();
        this.listeners.set(listenerId, unsubscribe);

        return unsubscribe;
    }

    /**
     * Listen for a specific blog post changes
     * @param {string} postId - Blog post ID
     * @param {Function} callback - Callback function to handle changes
     * @returns {Function} - Unsubscribe function
     */
    listenToBlogPost(postId, callback) {
        if (!this.initialized) {
            console.warn('RealTimeContentService not initialized');
            return () => {};
        }

        const unsubscribe = this.db.collection('blogs').doc(postId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const post = {
                        id: doc.id,
                        ...doc.data(),
                        publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
                    };
                    callback(post);
                } else {
                    callback(null);
                }
            }, (error) => {
                console.error('Error listening to blog post:', error);
            });

        // Store listener for cleanup
        const listenerId = 'blog-post-' + postId + '-' + Date.now();
        this.listeners.set(listenerId, unsubscribe);

        return unsubscribe;
    }

    /**
     * Listen for a specific product changes
     * @param {string} productId - Product ID
     * @param {Function} callback - Callback function to handle changes
     * @returns {Function} - Unsubscribe function
     */
    listenToProduct(productId, callback) {
        if (!this.initialized) {
            console.warn('RealTimeContentService not initialized');
            return () => {};
        }

        const unsubscribe = this.db.collection('products').doc(productId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const product = {
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
                    };
                    callback(product);
                } else {
                    callback(null);
                }
            }, (error) => {
                console.error('Error listening to product:', error);
            });

        // Store listener for cleanup
        const listenerId = 'product-' + productId + '-' + Date.now();
        this.listeners.set(listenerId, unsubscribe);

        return unsubscribe;
    }

    /**
     * Show content update notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('info', 'success', 'warning')
     */
    showUpdateNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('content-update-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'content-update-notification';
            notification.className = 'fixed top-4 right-4 z-50 max-w-sm';
            document.body.appendChild(notification);
        }

        // Set notification styles based on type
        let bgColor, textColor, borderColor;
        switch (type) {
            case 'success':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                borderColor = 'border-green-200';
                break;
            case 'warning':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                borderColor = 'border-yellow-200';
                break;
            case 'error':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                borderColor = 'border-red-200';
                break;
            default:
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                borderColor = 'border-blue-200';
        }

        notification.innerHTML = `
            <div class="${bgColor} ${textColor} ${borderColor} border rounded-lg p-4 shadow-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-sm font-medium">${message}</span>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current hover:opacity-75">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Handle content changes and show appropriate notifications
     * @param {Array} changes - Firestore document changes
     * @param {string} contentType - Type of content ('blog', 'product')
     */
    handleContentChanges(changes, contentType) {
        changes.forEach(change => {
            const data = change.doc.data();
            
            switch (change.type) {
                case 'added':
                    if (contentType === 'blog' && data.status === 'published') {
                        this.showUpdateNotification(`New blog post: "${data.title}"`, 'success');
                    } else if (contentType === 'product' && data.featured) {
                        this.showUpdateNotification(`New featured product: "${data.name}"`, 'success');
                    }
                    break;
                    
                case 'modified':
                    if (contentType === 'blog' && data.status === 'published') {
                        this.showUpdateNotification(`Blog post updated: "${data.title}"`, 'info');
                    } else if (contentType === 'product') {
                        this.showUpdateNotification(`Product updated: "${data.name}"`, 'info');
                    }
                    break;
                    
                case 'removed':
                    this.showUpdateNotification(`${contentType === 'blog' ? 'Blog post' : 'Product'} removed`, 'warning');
                    break;
            }
        });
    }

    /**
     * Enable real-time updates for blog pages
     */
    enableBlogRealTimeUpdates() {
        this.listenToPublishedBlogPosts((posts, changes) => {
            this.handleContentChanges(changes, 'blog');
            
            // Trigger custom event for blog loaders to handle
            window.dispatchEvent(new CustomEvent('blogContentUpdated', {
                detail: { posts, changes }
            }));
        });
    }

    /**
     * Enable real-time updates for product pages
     */
    enableProductRealTimeUpdates() {
        this.listenToFeaturedProducts((products, changes) => {
            this.handleContentChanges(changes, 'product');
            
            // Trigger custom event for product loaders to handle
            window.dispatchEvent(new CustomEvent('productContentUpdated', {
                detail: { products, changes }
            }));
        });
    }

    /**
     * Cleanup all listeners
     */
    cleanup() {
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners.clear();
    }

    /**
     * Cleanup listeners when page is unloaded
     */
    setupCleanup() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Also cleanup on page hide (for mobile browsers)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cleanup();
            }
        });
    }
}

// Create and export a singleton instance
export const realTimeContentService = new RealTimeContentService();

// Auto-initialize and setup cleanup
document.addEventListener('DOMContentLoaded', async () => {
    await realTimeContentService.initialize();
    realTimeContentService.setupCleanup();
    
    // Enable real-time updates based on current page
    if (window.location.pathname.includes('blog') || 
        document.querySelector('#latest-posts-grid')) {
        realTimeContentService.enableBlogRealTimeUpdates();
    }
    
    if (window.location.pathname === '/' || 
        window.location.pathname.includes('index.html') ||
        document.querySelector('#featured-products')) {
        realTimeContentService.enableProductRealTimeUpdates();
    }
});