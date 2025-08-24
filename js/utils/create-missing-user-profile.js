/**
 * Create Missing User Profile Utility
 * Creates Firestore user documents for users who are authenticated but missing database records
 */

import { initializeModularFirebase } from '../firebase-init.js';
import { 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    doc, 
    getDoc,
    setDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

class UserProfileCreator {
    constructor() {
        this.firebaseServices = null;
        this.init();
    }

    /**
     * Initialize the profile creator
     */
    async init() {
        try {
            this.firebaseServices = await initializeModularFirebase();
            console.log('✅ Firebase initialized for user profile creator');
            this.setupAuthListener();
        } catch (error) {
            console.error('❌ Failed to initialize profile creator:', error);
        }
    }

    /**
     * Setup authentication listener
     */
    setupAuthListener() {
        const { auth } = this.firebaseServices;
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('\n🔍 CHECKING USER PROFILE STATUS');
                console.log('==========================================');
                await this.checkAndCreateProfile(user);
            }
        });
    }

    /**
     * Check if user profile exists and create if missing
     */
    async checkAndCreateProfile(user) {
        try {
            const { db } = this.firebaseServices;
            
            console.log(`👤 Checking profile for user: ${user.email}`);
            console.log(`   UID: ${user.uid}`);
            
            // Check if user document exists
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                console.log('✅ User profile already exists in database');
                const userData = userDoc.data();
                console.log('📄 Existing profile data:', JSON.stringify(userData, null, 2));
                return userData;
            } else {
                console.log('❌ User profile missing from database');
                console.log('🔧 Creating user profile...');
                
                const newProfile = await this.createUserProfile(user, db);
                console.log('✅ User profile created successfully!');
                console.log('📄 New profile data:', JSON.stringify(newProfile, null, 2));
                return newProfile;
            }
            
        } catch (error) {
            console.error('❌ Error checking/creating user profile:', error);
            throw error;
        }
    }

    /**
     * Create user profile in Firestore
     */
    async createUserProfile(user, database) {
        try {
            // Extract name from display name
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Create comprehensive user profile
            const userProfile = {
                uid: user.uid,
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                displayName: user.displayName || `${firstName} ${lastName}`.trim() || user.email.split('@')[0],
                photoURL: user.photoURL || this.generateAvatarUrl(user.displayName || user.email),
                role: 'user', // Default role
                status: 'active',
                emailVerified: user.emailVerified,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                preferences: {
                    notifications: true,
                    newsletter: false,
                    theme: 'light'
                },
                profile: {
                    bio: '',
                    location: '',
                    website: '',
                    avatar: user.photoURL || this.generateAvatarUrl(user.displayName || user.email)
                },
                metadata: {
                    signupMethod: 'migration', // Indicates this was created via migration
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime
                }
            };

            // Create user document in Firestore
            const userDocRef = doc(database, 'users', user.uid);
            await setDoc(userDocRef, userProfile);
            
            console.log('✅ User profile document created in Firestore');
            return userProfile;
            
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            throw error;
        }
    }

    /**
     * Generate avatar URL for user
     */
    generateAvatarUrl(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=128`;
    }

    /**
     * Manually create profile for current user
     */
    async createCurrentUserProfile() {
        const { auth } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in');
            return null;
        }
        
        console.log('\n🔧 MANUALLY CREATING USER PROFILE');
        console.log('==========================================');
        
        try {
            const profile = await this.checkAndCreateProfile(currentUser);
            console.log('✅ Profile creation completed successfully');
            return profile;
        } catch (error) {
            console.error('❌ Failed to create user profile:', error);
            return null;
        }
    }

    /**
     * Batch create profiles for all authenticated users (admin function)
     */
    async batchCreateMissingProfiles() {
        console.log('\n🔧 BATCH PROFILE CREATION');
        console.log('==========================================');
        console.log('⚠️ This function requires admin privileges');
        
        // This would require admin SDK or special permissions
        // For now, we'll just handle the current user
        return await this.createCurrentUserProfile();
    }
}

// Export for use in other modules
export { UserProfileCreator };

// Auto-initialize if loaded directly
if (typeof window !== 'undefined') {
    window.profileCreator = new UserProfileCreator();
    
    // Add global functions for easy testing
    window.createUserProfile = () => window.profileCreator.createCurrentUserProfile();
    window.checkUserProfile = () => {
        const user = window.profileCreator.firebaseServices?.auth?.currentUser;
        if (user) {
            return window.profileCreator.checkAndCreateProfile(user);
        } else {
            console.log('❌ No user logged in');
        }
    };
    
    console.log('\n🔧 USER PROFILE CREATOR LOADED');
    console.log('==========================================');
    console.log('Available commands:');
    console.log('  createUserProfile() - Create profile for current user');
    console.log('  checkUserProfile() - Check and create if missing');
    console.log('==========================================\n');
}