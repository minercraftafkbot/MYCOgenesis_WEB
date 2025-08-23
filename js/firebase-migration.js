/**
 * Firebase Migration Utility
 * Helps migrate from older Firebase versions to v10.x
 */

/**
 * Migration utility class
 */
export class FirebaseMigration {
    constructor(firebaseServices) {
        this.services = firebaseServices;
        this.db = firebaseServices.db;
        this.auth = firebaseServices.auth;
        this.utils = firebaseServices.utils;
    }

    /**
     * Check if migration is needed
     */
    async checkMigrationNeeded() {
        try {
            const migrationDoc = await this.db.collection('system').doc('migration').get();
            
            if (!migrationDoc.exists) {
                return {
                    needed: true,
                    reason: 'No migration record found',
                    fromVersion: 'unknown',
                    toVersion: '10.13.2'
                };
            }
            
            const migrationData = migrationDoc.data();
            const currentVersion = '10.13.2';
            
            if (migrationData.version !== currentVersion) {
                return {
                    needed: true,
                    reason: 'Version mismatch',
                    fromVersion: migrationData.version,
                    toVersion: currentVersion
                };
            }
            
            return {
                needed: false,
                currentVersion: migrationData.version
            };
            
        } catch (error) {
            console.error('Error checking migration status:', error);
            return {
                needed: true,
                reason: 'Error checking migration status',
                error: error.message
            };
        }
    }

    /**
     * Migrate user documents to new schema
     */
    async migrateUserDocuments() {
        try {
            console.log('🔄 Migrating user documents...');
            
            const usersSnapshot = await this.db.collection('users').get();
            const batch = this.utils.batch();
            let migratedCount = 0;
            
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const updates = {};
                
                // Add missing fields with defaults
                if (!userData.activity) {
                    updates.activity = {
                        lastLogin: userData.lastLogin || null,
                        postsCreated: 0,
                        postsEdited: 0
                    };
                }
                
                if (!userData.preferences) {
                    updates.preferences = {
                        favoriteArticles: [],
                        favoriteProducts: [],
                        emailNotifications: true
                    };
                }
                
                if (!userData.status) {
                    updates.status = 'active';
                }
                
                if (!userData.updatedAt) {
                    updates.updatedAt = this.utils.serverTimestamp();
                }
                
                // Only update if there are changes
                if (Object.keys(updates).length > 0) {
                    batch.update(doc.ref, updates);
                    migratedCount++;
                }
            });
            
            if (migratedCount > 0) {
                await batch.commit();
                console.log(`✅ Migrated ${migratedCount} user documents`);
            } else {
                console.log('✅ No user documents needed migration');
            }
            
            return migratedCount;
            
        } catch (error) {
            console.error('❌ User document migration failed:', error);
            throw error;
        }
    }

    /**
     * Migrate blog posts to new schema
     */
    async migrateBlogPosts() {
        try {
            console.log('🔄 Migrating blog posts...');
            
            const blogsSnapshot = await this.db.collection('blogs').get();
            const batch = this.utils.batch();
            let migratedCount = 0;
            
            blogsSnapshot.forEach(doc => {
                const blogData = doc.data();
                const updates = {};
                
                // Ensure required fields exist
                if (!blogData.slug && blogData.title) {
                    updates.slug = blogData.title.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                }
                
                if (!blogData.excerpt && blogData.content) {
                    updates.excerpt = blogData.content.substring(0, 200) + '...';
                }
                
                if (!blogData.tags) {
                    updates.tags = [];
                }
                
                if (!blogData.seo) {
                    updates.seo = {
                        metaTitle: blogData.title || '',
                        metaDescription: updates.excerpt || blogData.excerpt || '',
                        keywords: []
                    };
                }
                
                if (!blogData.updatedAt) {
                    updates.updatedAt = this.utils.serverTimestamp();
                }
                
                if (Object.keys(updates).length > 0) {
                    batch.update(doc.ref, updates);
                    migratedCount++;
                }
            });
            
            if (migratedCount > 0) {
                await batch.commit();
                console.log(`✅ Migrated ${migratedCount} blog posts`);
            } else {
                console.log('✅ No blog posts needed migration');
            }
            
            return migratedCount;
            
        } catch (error) {
            console.error('❌ Blog post migration failed:', error);
            throw error;
        }
    }

    /**
     * Migrate products to new schema
     */
    async migrateProducts() {
        try {
            console.log('🔄 Migrating products...');
            
            const productsSnapshot = await this.db.collection('products').get();
            const batch = this.utils.batch();
            let migratedCount = 0;
            
            productsSnapshot.forEach(doc => {
                const productData = doc.data();
                const updates = {};
                
                // Ensure required fields exist
                if (!productData.slug && productData.name) {
                    updates.slug = productData.name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                }
                
                if (!productData.inventory) {
                    updates.inventory = {
                        stock: productData.stock || 0,
                        lowStockThreshold: 5,
                        trackInventory: true
                    };
                }
                
                if (!productData.seo) {
                    updates.seo = {
                        metaTitle: productData.name || '',
                        metaDescription: productData.description || '',
                        keywords: []
                    };
                }
                
                if (!productData.updatedAt) {
                    updates.updatedAt = this.utils.serverTimestamp();
                }
                
                if (Object.keys(updates).length > 0) {
                    batch.update(doc.ref, updates);
                    migratedCount++;
                }
            });
            
            if (migratedCount > 0) {
                await batch.commit();
                console.log(`✅ Migrated ${migratedCount} products`);
            } else {
                console.log('✅ No products needed migration');
            }
            
            return migratedCount;
            
        } catch (error) {
            console.error('❌ Product migration failed:', error);
            throw error;
        }
    }

    /**
     * Update security rules for new Firebase version
     */
    async updateSecurityRules() {
        console.log('⚠️ Security rules need to be updated manually');
        console.log('📖 Please update your Firestore and Storage rules in the Firebase Console');
        console.log('🔗 Visit: https://console.firebase.google.com/project/your-project/firestore/rules');
        
        return {
            action: 'manual',
            message: 'Security rules must be updated manually in Firebase Console'
        };
    }

    /**
     * Run complete migration
     */
    async runMigration() {
        try {
            console.log('🚀 Starting Firebase migration to v10.x...');
            
            const migrationCheck = await this.checkMigrationNeeded();
            
            if (!migrationCheck.needed) {
                console.log('✅ No migration needed');
                return {
                    success: true,
                    message: 'No migration needed',
                    currentVersion: migrationCheck.currentVersion
                };
            }
            
            console.log(`🔄 Migrating from ${migrationCheck.fromVersion} to ${migrationCheck.toVersion}`);
            
            const results = {
                users: await this.migrateUserDocuments(),
                blogs: await this.migrateBlogPosts(),
                products: await this.migrateProducts(),
                securityRules: await this.updateSecurityRules()
            };
            
            // Record migration completion
            await this.db.collection('system').doc('migration').set({
                version: '10.13.2',
                migratedAt: this.utils.serverTimestamp(),
                fromVersion: migrationCheck.fromVersion,
                results: results
            });
            
            console.log('🎉 Migration completed successfully!');
            
            return {
                success: true,
                message: 'Migration completed successfully',
                results: results
            };
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            
            // Log migration failure
            try {
                await this.db.collection('system-logs').add({
                    type: 'migration_failed',
                    error: error.message,
                    timestamp: this.utils.serverTimestamp()
                });
            } catch (logError) {
                console.error('Failed to log migration error:', logError);
            }
            
            throw error;
        }
    }

    /**
     * Get migration status
     */
    async getMigrationStatus() {
        try {
            const migrationDoc = await this.db.collection('system').doc('migration').get();
            
            if (!migrationDoc.exists) {
                return {
                    status: 'not_migrated',
                    message: 'No migration record found'
                };
            }
            
            const migrationData = migrationDoc.data();
            
            return {
                status: 'migrated',
                version: migrationData.version,
                migratedAt: migrationData.migratedAt,
                fromVersion: migrationData.fromVersion,
                results: migrationData.results
            };
            
        } catch (error) {
            console.error('Error getting migration status:', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }
}

/**
 * Auto-run migration check on load
 */
export async function autoCheckMigration(firebaseServices) {
    try {
        const migration = new FirebaseMigration(firebaseServices);
        const check = await migration.checkMigrationNeeded();
        
        if (check.needed) {
            console.warn('⚠️ Firebase migration needed');
            console.log('🔧 Run migration with: migration.runMigration()');
            
            // Expose migration utility globally for manual execution
            window.firebaseMigration = migration;
        }
        
        return check;
        
    } catch (error) {
        console.error('Auto migration check failed:', error);
        return { needed: false, error: error.message };
    }
}

// Export migration utility
export default FirebaseMigration;