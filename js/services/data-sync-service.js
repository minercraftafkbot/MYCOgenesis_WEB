/**
 * Data Synchronization Service
 * Maintains consistency between Sanity CMS and Firebase
 * Handles webhooks, data validation, and conflict resolution
 */

export class DataSyncService {
    constructor() {
        this.syncQueue = [];
        this.isProcessing = false;
        this.syncInterval = null;
        this.conflictResolutionStrategies = {
            'last-write-wins': this.lastWriteWins.bind(this),
            'sanity-priority': this.sanityPriority.bind(this),
            'manual-review': this.manualReview.bind(this)
        };
        this.pendingConflicts = new Map();
    }

    /**
     * Initialize the sync service
     */
    async initialize() {
        // Setup periodic sync check
        this.syncInterval = setInterval(() => {
            this.processSyncQueue();
        }, 30000); // Every 30 seconds

        // Listen for Sanity webhooks (if configured)
        this.setupWebhookListener();
        
        // Listen for Firebase changes
        this.setupFirebaseListeners();

        console.log('🔄 Data sync service initialized');
    }

    /**
     * Setup webhook listener for Sanity CMS changes
     * @private
     */
    setupWebhookListener() {
        // This would typically be handled by your backend
        // For client-side, we'll poll for changes instead
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SANITY_WEBHOOK') {
                    this.handleSanityWebhook(event.data.payload);
                }
            });
        }
    }

    /**
     * Setup Firebase real-time listeners
     * @private
     */
    setupFirebaseListeners() {
        // Listen for view count changes
        if (window.firebaseServices?.db) {
            // Listen to blog-views changes
            window.firebaseServices.db.collection('blog-views')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'modified') {
                            this.queueSync({
                                type: 'blog-view-update',
                                docId: change.doc.id,
                                data: change.doc.data(),
                                timestamp: Date.now()
                            });
                        }
                    });
                });

            // Listen to product-views changes
            window.firebaseServices.db.collection('product-views')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'modified') {
                            this.queueSync({
                                type: 'product-view-update',
                                docId: change.doc.id,
                                data: change.doc.data(),
                                timestamp: Date.now()
                            });
                        }
                    });
                });
        }
    }

    /**
     * Handle Sanity webhook notifications
     * @param {Object} payload - Webhook payload from Sanity
     */
    handleSanityWebhook(payload) {
        console.log('📥 Received Sanity webhook:', payload);

        const syncItem = {
            type: 'sanity-update',
            documentType: payload._type,
            documentId: payload._id,
            action: payload._action || 'update',
            timestamp: Date.now(),
            data: payload
        };

        this.queueSync(syncItem);
    }

    /**
     * Queue a sync operation
     * @param {Object} syncItem - Item to sync
     */
    queueSync(syncItem) {
        // Avoid duplicate items in queue
        const existingIndex = this.syncQueue.findIndex(
            item => item.type === syncItem.type && 
                   item.documentId === syncItem.documentId
        );

        if (existingIndex !== -1) {
            // Update existing item with latest data
            this.syncQueue[existingIndex] = syncItem;
        } else {
            this.syncQueue.push(syncItem);
        }

        console.log(`📋 Queued sync operation: ${syncItem.type}`);
        
        // Process immediately if not currently processing
        if (!this.isProcessing) {
            this.processSyncQueue();
        }
    }

    /**
     * Process the sync queue
     * @private
     */
    async processSyncQueue() {
        if (this.isProcessing || this.syncQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`🔄 Processing ${this.syncQueue.length} sync operations`);

        while (this.syncQueue.length > 0) {
            const syncItem = this.syncQueue.shift();
            
            try {
                await this.processSyncItem(syncItem);
            } catch (error) {
                console.error('❌ Sync operation failed:', error);
                // Re-queue failed item with retry count
                syncItem.retryCount = (syncItem.retryCount || 0) + 1;
                
                if (syncItem.retryCount < 3) {
                    this.syncQueue.push(syncItem);
                    console.log(`🔄 Re-queued failed sync (attempt ${syncItem.retryCount})`);
                } else {
                    console.error('❌ Max retries exceeded for sync item:', syncItem);
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Process individual sync item
     * @private
     */
    async processSyncItem(syncItem) {
        console.log('⚙️ Processing sync item:', syncItem.type);

        switch (syncItem.type) {
            case 'sanity-update':
                await this.handleSanityUpdate(syncItem);
                break;
            
            case 'blog-view-update':
                await this.handleBlogViewUpdate(syncItem);
                break;
            
            case 'product-view-update':
                await this.handleProductViewUpdate(syncItem);
                break;
            
            case 'cache-invalidation':
                await this.handleCacheInvalidation(syncItem);
                break;
            
            default:
                console.warn('⚠️ Unknown sync item type:', syncItem.type);
        }
    }

    /**
     * Handle Sanity content updates
     * @private
     */
    async handleSanityUpdate(syncItem) {
        const { documentType, documentId, action, data } = syncItem;
        
        // Update local cache
        if (window.enhancedContentService) {
            window.enhancedContentService.clearCache();
        }

        // Handle specific document types
        switch (documentType) {
            case 'product':
                await this.syncProductUpdate(documentId, action, data);
                break;
            
            case 'blogPost':
                await this.syncBlogPostUpdate(documentId, action, data);
                break;
            
            case 'category':
                await this.syncCategoryUpdate(documentId, action, data);
                break;
        }

        // Notify UI components of content changes
        this.notifyContentChange(documentType, documentId, action);
    }

    /**
     * Sync product updates with Firebase
     * @private
     */
    async syncProductUpdate(productId, action, data) {
        if (!window.firebaseServices?.db) return;

        try {
            const productViewsRef = window.firebaseServices.db
                .collection('product-views')
                .doc(productId);

            if (action === 'delete') {
                // Remove analytics data for deleted product
                await productViewsRef.delete();
                console.log('🗑️ Removed analytics for deleted product:', productId);
            } else {
                // Ensure analytics document exists for active product
                const doc = await productViewsRef.get();
                if (!doc.exists && data.availability !== 'discontinued') {
                    await productViewsRef.set({
                        sanityProductId: productId,
                        viewCount: 0,
                        lastViewed: null,
                        createdAt: window.firebaseServices.utils.serverTimestamp()
                    });
                    console.log('✅ Created analytics document for product:', productId);
                }
            }
        } catch (error) {
            console.error('❌ Failed to sync product update:', error);
            throw error;
        }
    }

    /**
     * Sync blog post updates with Firebase
     * @private
     */
    async syncBlogPostUpdate(postId, action, data) {
        if (!window.firebaseServices?.db) return;

        try {
            const blogViewsRef = window.firebaseServices.db
                .collection('blog-views')
                .doc(postId);

            if (action === 'delete') {
                // Remove analytics data for deleted post
                await blogViewsRef.delete();
                console.log('🗑️ Removed analytics for deleted blog post:', postId);
            } else if (data.status === 'published') {
                // Ensure analytics document exists for published post
                const doc = await blogViewsRef.get();
                if (!doc.exists) {
                    await blogViewsRef.set({
                        sanityPostId: postId,
                        viewCount: 0,
                        lastViewed: null,
                        createdAt: window.firebaseServices.utils.serverTimestamp()
                    });
                    console.log('✅ Created analytics document for blog post:', postId);
                }
            }
        } catch (error) {
            console.error('❌ Failed to sync blog post update:', error);
            throw error;
        }
    }

    /**
     * Sync category updates
     * @private
     */
    async syncCategoryUpdate(categoryId, action, data) {
        // Categories mainly affect cache invalidation
        if (window.enhancedContentService) {
            window.enhancedContentService.clearCache();
        }
        
        console.log('🏷️ Category update processed:', categoryId);
    }

    /**
     * Handle blog view count updates
     * @private
     */
    async handleBlogViewUpdate(syncItem) {
        // Could trigger related content updates or recommendations
        console.log('📊 Blog view update processed:', syncItem.docId);
    }

    /**
     * Handle product view count updates
     * @private
     */
    async handleProductViewUpdate(syncItem) {
        // Could trigger inventory alerts or popularity tracking
        console.log('📊 Product view update processed:', syncItem.docId);
    }

    /**
     * Handle cache invalidation
     * @private
     */
    async handleCacheInvalidation(syncItem) {
        if (window.enhancedContentService) {
            if (syncItem.specific) {
                // Invalidate specific cache keys
                syncItem.cacheKeys?.forEach(key => {
                    window.enhancedContentService.cache.delete(key);
                });
            } else {
                // Clear all cache
                window.enhancedContentService.clearCache();
            }
        }
        
        console.log('🗑️ Cache invalidation processed');
    }

    /**
     * Notify UI components of content changes
     * @private
     */
    notifyContentChange(documentType, documentId, action) {
        const event = new CustomEvent('contentChanged', {
            detail: {
                documentType,
                documentId,
                action,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
        console.log('📢 Content change notification sent:', documentType);
    }

    /**
     * Conflict resolution strategies
     */
    async lastWriteWins(conflict) {
        // Simple strategy: use the most recent data
        return conflict.sources.sort((a, b) => b.timestamp - a.timestamp)[0];
    }

    async sanityPriority(conflict) {
        // Always prioritize Sanity CMS data
        return conflict.sources.find(source => source.origin === 'sanity') || 
               conflict.sources[0];
    }

    async manualReview(conflict) {
        // Queue conflict for manual review
        this.pendingConflicts.set(conflict.id, conflict);
        console.log('⚠️ Conflict queued for manual review:', conflict.id);
        return null; // No automatic resolution
    }

    /**
     * Get pending conflicts for admin review
     */
    getPendingConflicts() {
        return Array.from(this.pendingConflicts.values());
    }

    /**
     * Resolve conflict manually
     */
    async resolveConflict(conflictId, resolution) {
        const conflict = this.pendingConflicts.get(conflictId);
        if (!conflict) {
            throw new Error('Conflict not found');
        }

        // Apply resolution
        await this.applyConflictResolution(conflict, resolution);
        
        // Remove from pending
        this.pendingConflicts.delete(conflictId);
        
        console.log('✅ Conflict resolved:', conflictId);
    }

    /**
     * Apply conflict resolution
     * @private
     */
    async applyConflictResolution(conflict, resolution) {
        // Implementation depends on specific conflict type
        console.log('⚙️ Applying conflict resolution:', resolution);
    }

    /**
     * Validate data consistency
     */
    async validateDataConsistency() {
        console.log('🔍 Starting data consistency validation...');
        
        const issues = [];
        
        try {
            // Check for orphaned analytics records
            const orphanedAnalytics = await this.findOrphanedAnalytics();
            if (orphanedAnalytics.length > 0) {
                issues.push({
                    type: 'orphaned-analytics',
                    count: orphanedAnalytics.length,
                    records: orphanedAnalytics
                });
            }

            // Check for missing analytics records
            const missingAnalytics = await this.findMissingAnalytics();
            if (missingAnalytics.length > 0) {
                issues.push({
                    type: 'missing-analytics',
                    count: missingAnalytics.length,
                    records: missingAnalytics
                });
            }

            console.log(`✅ Consistency validation complete. Found ${issues.length} issues.`);
            return issues;

        } catch (error) {
            console.error('❌ Consistency validation failed:', error);
            throw error;
        }
    }

    /**
     * Find orphaned analytics records
     * @private
     */
    async findOrphanedAnalytics() {
        // Implementation would check Firebase analytics vs Sanity content
        return [];
    }

    /**
     * Find missing analytics records
     * @private
     */
    async findMissingAnalytics() {
        // Implementation would check Sanity content vs Firebase analytics
        return [];
    }

    /**
     * Cleanup orphaned data
     */
    async cleanupOrphanedData() {
        const orphaned = await this.findOrphanedAnalytics();
        
        for (const record of orphaned) {
            await this.removeOrphanedRecord(record);
        }
        
        console.log(`🧹 Cleaned up ${orphaned.length} orphaned records`);
    }

    /**
     * Remove orphaned record
     * @private
     */
    async removeOrphanedRecord(record) {
        // Remove the orphaned record from Firebase
        console.log('🗑️ Removing orphaned record:', record.id);
    }

    /**
     * Shutdown the sync service
     */
    shutdown() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.syncQueue = [];
        this.isProcessing = false;
        
        console.log('🛑 Data sync service shutdown');
    }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await dataSyncService.initialize();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    dataSyncService.shutdown();
});

export default dataSyncService;
