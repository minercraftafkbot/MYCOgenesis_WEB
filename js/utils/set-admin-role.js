/**
 * Set Admin Role Utility
 * Updates user role to 'admin' in Firestore database
 */

import { initializeModularFirebase } from '../firebase-init.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

class AdminRoleSetter {
    constructor() {
        this.firebaseServices = null;
        this.init();
    }

    async init() {
        try {
            this.firebaseServices = await initializeModularFirebase();
            console.log('✅ Firebase initialized for admin role setter');
        } catch (error) {
            console.error('❌ Failed to initialize admin role setter:', error);
        }
    }

    /**
     * Set current user as admin
     */
    async setCurrentUserAsAdmin() {
        const { auth, db } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in. Please log in first.');
            return false;
        }

        console.log('\n🔧 SETTING ADMIN ROLE');
        console.log('==========================================');
        console.log(`👤 User: ${currentUser.email}`);
        console.log(`   UID: ${currentUser.uid}`);
        
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                // Update existing profile
                await updateDoc(userDocRef, {
                    role: 'admin',
                    updatedAt: serverTimestamp()
                });
                console.log('✅ Updated existing user profile to admin role');
            } else {
                // Create new profile with admin role
                const adminProfile = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'Admin User',
                    photoURL: currentUser.photoURL || this.generateAvatarUrl(currentUser.displayName || currentUser.email),
                    role: 'admin', // Admin role!
                    status: 'active',
                    emailVerified: currentUser.emailVerified,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    preferences: {
                        notifications: true,
                        newsletter: false,
                        theme: 'light'
                    },
                    profile: {
                        bio: 'System Administrator',
                        location: '',
                        website: '',
                        avatar: currentUser.photoURL || this.generateAvatarUrl(currentUser.displayName || currentUser.email)
                    },
                    metadata: {
                        signupMethod: 'admin-setup',
                        creationTime: currentUser.metadata.creationTime,
                        lastSignInTime: currentUser.metadata.lastSignInTime
                    }
                };
                
                await setDoc(userDocRef, adminProfile);
                console.log('✅ Created new user profile with admin role');
            }
            
            console.log('🎉 SUCCESS: User now has admin access to CMS!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Refresh the page');
            console.log('2. Click "CMS Studio" link in the footer');
            console.log('3. You should now have access to the content management system');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error setting admin role:', error);
            return false;
        }
    }

    /**
     * Set specific user as admin by email
     */
    async setUserAsAdminByEmail(email) {
        console.log('\n🔧 SETTING ADMIN ROLE BY EMAIL');
        console.log('==========================================');
        console.log(`📧 Target Email: ${email}`);
        
        // Note: This is a simplified version. In a real admin interface,
        // you'd need to look up the user by email first
        console.log('⚠️ This function requires the user to be currently logged in');
        console.log('   Please log in as the target user and run setCurrentUserAsAdmin()');
    }

    /**
     * Check current user role
     */
    async checkCurrentUserRole() {
        const { auth, db } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in');
            return null;
        }

        console.log('\n🔍 CHECKING USER ROLE');
        console.log('==========================================');
        console.log(`👤 User: ${currentUser.email}`);
        console.log(`   UID: ${currentUser.uid}`);
        
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log(`📋 Current Role: ${userData.role || 'undefined'}`);
                console.log(`📊 Status: ${userData.status || 'undefined'}`);
                console.log('📄 Full Profile:', JSON.stringify(userData, null, 2));
                return userData;
            } else {
                console.log('❌ User profile not found in Firestore');
                console.log('💡 Run setCurrentUserAsAdmin() to create admin profile');
                return null;
            }
        } catch (error) {
            console.error('❌ Error checking user role:', error);
            return null;
        }
    }

    /**
     * Generate avatar URL for user
     */
    generateAvatarUrl(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=128`;
    }
}

// Export for use in other modules
export { AdminRoleSetter };

// Auto-initialize if loaded directly
if (typeof window !== 'undefined') {
    window.adminRoleSetter = new AdminRoleSetter();
    
    // Add global functions for easy testing
    window.setAdminRole = () => window.adminRoleSetter.setCurrentUserAsAdmin();
    window.checkUserRole = () => window.adminRoleSetter.checkCurrentUserRole();
    
    console.log('\n🔧 ADMIN ROLE SETTER LOADED');
    console.log('==========================================');
    console.log('Available commands:');
    console.log('  setAdminRole() - Set current user as admin');
    console.log('  checkUserRole() - Check current user role');
    console.log('==========================================\n');
}
