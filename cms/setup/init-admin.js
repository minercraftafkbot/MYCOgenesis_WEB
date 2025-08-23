// Script to create initial admin user
// Updated for Firebase v10.x
// This should be run once during initial setup

class AdminSetup {
    constructor() {
        // Wait for Firebase services to be available
        if (!window.firebaseServices) {
            throw new Error('Firebase services not initialized');
        }
        
        this.db = window.firebaseServices.db;
        this.auth = window.firebaseServices.auth;
        this.utils = window.firebaseServices.utils;
        
        console.log('🚀 AdminSetup initialized with Firebase v10.x');
    }

    /**
     * Create initial admin user
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @param {string} displayName - Admin display name
     */
    async createInitialAdmin(email, password, displayName) {
        try {
            console.log('Creating initial admin user...');
            
            // Create Firebase Auth user
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update display name
            await user.updateProfile({
                displayName: displayName
            });
            
            // Create admin user profile in Firestore
            const adminProfile = {
                uid: user.uid,
                email: email,
                displayName: displayName,
                role: 'admin',
                profile: {
                    firstName: displayName.split(' ')[0] || '',
                    lastName: displayName.split(' ').slice(1).join(' ') || '',
                    bio: 'System Administrator',
                    avatar: ''
                },
                preferences: {
                    favoriteArticles: [],
                    favoriteProducts: [],
                    emailNotifications: true
                },
                activity: {
                    lastLogin: this.utils.serverTimestamp(),
                    postsCreated: 0,
                    postsEdited: 0
                },
                status: 'active',
                createdAt: this.utils.serverTimestamp(),
                updatedAt: this.utils.serverTimestamp()
            };
            
            await this.db.collection('users').doc(user.uid).set(adminProfile);
            
            console.log('Initial admin user created successfully!');
            console.log('Email:', email);
            console.log('UID:', user.uid);
            
            return {
                success: true,
                user: user,
                profile: adminProfile
            };
            
        } catch (error) {
            console.error('Error creating admin user:', error);
            throw error;
        }
    }

    /**
     * Initialize site settings
     */
    async initializeSiteSettings() {
        try {
            console.log('Initializing site settings...');
            
            const generalSettings = {
                siteName: 'MYCOgenesis',
                siteDescription: 'Premium mushroom cultivation and products',
                contactEmail: 'info@mycogenesis.com',
                contactPhone: '',
                address: '',
                socialMedia: {
                    facebook: '',
                    instagram: '',
                    twitter: ''
                },
                updatedAt: this.utils.serverTimestamp()
            };
            
            const seoSettings = {
                defaultMetaTitle: 'MYCOgenesis - Premium Mushroom Products',
                defaultMetaDescription: 'Discover premium mushroom varieties and cultivation expertise at MYCOgenesis.',
                defaultKeywords: ['mushrooms', 'cultivation', 'organic', 'premium'],
                googleAnalyticsId: '',
                googleSearchConsoleId: '',
                updatedAt: this.utils.serverTimestamp()
            };
            
            const featureSettings = {
                maintenanceMode: false,
                userRegistration: true,
                commentSystem: true,
                newsletterSignup: true,
                contactForm: true,
                updatedAt: this.utils.serverTimestamp()
            };
            
            await Promise.all([
                this.db.collection('site-settings').doc('general').set(generalSettings),
                this.db.collection('site-settings').doc('seo').set(seoSettings),
                this.db.collection('site-settings').doc('features').set(featureSettings)
            ]);
            
            console.log('Site settings initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing site settings:', error);
            throw error;
        }
    }

    /**
     * Create initial categories
     */
    async initializeCategories() {
        try {
            console.log('Creating initial categories...');
            
            const blogCategories = [
                {
                    name: 'Cultivation Tips',
                    description: 'Expert advice on mushroom cultivation',
                    type: 'blog',
                    slug: 'cultivation-tips',
                    order: 1
                },
                {
                    name: 'Health & Nutrition',
                    description: 'Health benefits and nutritional information',
                    type: 'blog',
                    slug: 'health-nutrition',
                    order: 2
                },
                {
                    name: 'Recipes',
                    description: 'Delicious mushroom recipes and cooking tips',
                    type: 'blog',
                    slug: 'recipes',
                    order: 3
                },
                {
                    name: 'Company News',
                    description: 'Updates and news from MYCOgenesis',
                    type: 'blog',
                    slug: 'company-news',
                    order: 4
                }
            ];
            
            const productCategories = [
                {
                    name: 'Gourmet Mushrooms',
                    description: 'Premium gourmet mushroom varieties',
                    type: 'product',
                    slug: 'gourmet-mushrooms',
                    order: 1
                },
                {
                    name: 'Medicinal Mushrooms',
                    description: 'Mushrooms with health benefits',
                    type: 'product',
                    slug: 'medicinal-mushrooms',
                    order: 2
                },
                {
                    name: 'Growing Kits',
                    description: 'DIY mushroom growing kits',
                    type: 'product',
                    slug: 'growing-kits',
                    order: 3
                }
            ];
            
            const allCategories = [...blogCategories, ...productCategories];
            
            const batch = this.db.batch();
            
            allCategories.forEach(category => {
                const docRef = this.db.collection('categories').doc();
                batch.set(docRef, {
                    ...category,
                    id: docRef.id,
                    createdAt: this.utils.serverTimestamp(),
                    updatedAt: this.utils.serverTimestamp()
                });
            });
            
            await batch.commit();
            
            console.log('Categories initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing categories:', error);
            throw error;
        }
    }

    /**
     * Validate Firebase connection and configuration
     */
    async validateFirebaseSetup() {
        try {
            // Check if Firebase is properly configured
            if (!this.auth || !this.db) {
                throw new Error('Firebase services not properly initialized');
            }
            
            // Test Firestore connection
            await this.db.doc('test/connection').get();
            
            // Check if we can write to Firestore
            const testDoc = this.db.collection('setup-test').doc();
            await testDoc.set({ test: true, timestamp: this.utils.serverTimestamp() });
            await testDoc.delete();
            
            console.log('✅ Firebase validation passed');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase validation failed:', error);
            throw new Error(`Firebase setup validation failed: ${error.message}`);
        }
    }

    /**
     * Check if setup has already been completed
     */
    async checkExistingSetup() {
        try {
            // Check for existing admin users
            const adminUsers = await this.db.collection('users')
                .where('role', '==', 'admin')
                .limit(1)
                .get();
            
            if (!adminUsers.empty) {
                console.warn('⚠️ Admin user already exists');
                return {
                    hasAdmin: true,
                    adminCount: adminUsers.size
                };
            }
            
            // Check for existing site settings
            const siteSettings = await this.db.collection('site-settings').get();
            
            return {
                hasAdmin: false,
                hasSettings: !siteSettings.empty,
                settingsCount: siteSettings.size
            };
            
        } catch (error) {
            console.error('Error checking existing setup:', error);
            return {
                hasAdmin: false,
                hasSettings: false,
                error: error.message
            };
        }
    }

    /**
     * Run complete setup with validation and progress tracking
     * @param {Object} adminData - Admin user data
     */
    async runSetup(adminData) {
        const setupSteps = [
            { name: 'Validating Firebase', fn: () => this.validateFirebaseSetup() },
            { name: 'Checking existing setup', fn: () => this.checkExistingSetup() },
            { name: 'Creating admin user', fn: () => this.createInitialAdmin(adminData.email, adminData.password, adminData.displayName) },
            { name: 'Initializing site settings', fn: () => this.initializeSiteSettings() },
            { name: 'Creating categories', fn: () => this.initializeCategories() }
        ];
        
        try {
            console.log('🚀 Starting CMS setup with Firebase v10.x...');
            
            for (let i = 0; i < setupSteps.length; i++) {
                const step = setupSteps[i];
                console.log(`📋 Step ${i + 1}/${setupSteps.length}: ${step.name}...`);
                
                const result = await step.fn();
                
                // Handle existing setup check
                if (step.name === 'Checking existing setup' && result.hasAdmin) {
                    throw new Error('Setup has already been completed. An admin user already exists.');
                }
                
                console.log(`✅ Step ${i + 1} completed: ${step.name}`);
            }
            
            console.log('🎉 CMS setup completed successfully!');
            console.log('📧 Admin email:', adminData.email);
            console.log('🔐 You can now sign in with the admin credentials.');
            
            // Log setup completion to Firestore
            await this.db.collection('system-logs').add({
                type: 'setup_completed',
                adminEmail: adminData.email,
                timestamp: this.utils.serverTimestamp(),
                version: window.firebaseServices.config.version
            });
            
            return {
                success: true,
                message: 'CMS setup completed successfully',
                adminEmail: adminData.email
            };
            
        } catch (error) {
            console.error('❌ Setup failed:', error);
            
            // Log setup failure
            try {
                await this.db.collection('system-logs').add({
                    type: 'setup_failed',
                    error: error.message,
                    timestamp: this.utils.serverTimestamp(),
                    version: window.firebaseServices.config.version
                });
            } catch (logError) {
                console.error('Failed to log setup error:', logError);
            }
            
            throw error;
        }
    }

    /**
     * Get setup status and system information
     */
    async getSetupStatus() {
        try {
            const existingSetup = await this.checkExistingSetup();
            const firebaseConfig = window.firebaseServices.config;
            
            return {
                isSetupComplete: existingSetup.hasAdmin,
                hasSettings: existingSetup.hasSettings,
                firebase: {
                    version: firebaseConfig.version,
                    projectId: firebaseConfig.projectId,
                    features: firebaseConfig.features
                },
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error getting setup status:', error);
            return {
                isSetupComplete: false,
                hasSettings: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Export for use in setup page
window.AdminSetup = AdminSetup;