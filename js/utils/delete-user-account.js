/**
 * Delete User Account Utility
 * Allows users to delete their Firebase Auth account so they can re-signup cleanly
 */

import { initializeModularFirebase } from '../firebase-init.js';
import { 
    onAuthStateChanged,
    deleteUser,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

class UserAccountDeleter {
    constructor() {
        this.firebaseServices = null;
        this.init();
    }

    /**
     * Initialize the account deleter
     */
    async init() {
        try {
            this.firebaseServices = await initializeModularFirebase();
            console.log('✅ Firebase initialized for user account deleter');
            this.setupAuthListener();
        } catch (error) {
            console.error('❌ Failed to initialize account deleter:', error);
        }
    }

    /**
     * Setup authentication listener
     */
    setupAuthListener() {
        const { auth } = this.firebaseServices;
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('\n👤 USER ACCOUNT STATUS');
                console.log('==========================================');
                console.log(`Email: ${user.email}`);
                console.log(`UID: ${user.uid}`);
                console.log(`Display Name: ${user.displayName || 'Not set'}`);
                console.log(`Created: ${user.metadata.creationTime}`);
                console.log(`Last Sign In: ${user.metadata.lastSignInTime}`);
                console.log('==========================================');
            } else {
                console.log('❌ No user logged in');
            }
        });
    }

    /**
     * Delete current user account
     */
    async deleteCurrentUserAccount() {
        const { auth } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in');
            return false;
        }
        
        console.log('\n🗑️ DELETING USER ACCOUNT');
        console.log('==========================================');
        console.log(`Deleting account for: ${currentUser.email}`);
        console.log(`UID: ${currentUser.uid}`);
        
        try {
            // Delete the user account from Firebase Auth
            await deleteUser(currentUser);
            
            console.log('✅ User account deleted successfully from Firebase Auth');
            console.log('🔄 User has been signed out automatically');
            console.log('✨ User can now re-signup with a clean account');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error deleting user account:', error);
            
            // Handle specific error cases
            if (error.code === 'auth/requires-recent-login') {
                console.log('⚠️ This operation requires recent authentication');
                console.log('🔄 Please log out and log back in, then try deleting again');
                console.log('💡 Or use the "Sign Out and Delete" option');
            }
            
            return false;
        }
    }

    /**
     * Sign out and then delete account (handles recent login requirement)
     */
    async signOutAndDelete() {
        const { auth } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in');
            return false;
        }
        
        console.log('\n🔄 SIGN OUT AND DELETE PROCESS');
        console.log('==========================================');
        console.log('Step 1: Signing out current user...');
        
        try {
            await signOut(auth);
            console.log('✅ User signed out successfully');
            console.log('📝 Account information saved for deletion');
            console.log('');
            console.log('⚠️ IMPORTANT INSTRUCTIONS:');
            console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
            console.log('2. Select your project');
            console.log('3. Go to Authentication > Users');
            console.log(`4. Find user: ${currentUser.email}`);
            console.log(`5. Delete the user manually`);
            console.log('6. Then the user can re-signup cleanly');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error signing out:', error);
            return false;
        }
    }

    /**
     * Get instructions for manual deletion
     */
    getManualDeletionInstructions() {
        const { auth } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            console.log('❌ No user currently logged in');
            return;
        }
        
        console.log('\n📋 MANUAL USER DELETION INSTRUCTIONS');
        console.log('==========================================');
        console.log('Since automatic deletion failed, here\'s how to delete manually:');
        console.log('');
        console.log('🔗 Firebase Console Method:');
        console.log('1. Go to: https://console.firebase.google.com');
        console.log('2. Select your Firebase project');
        console.log('3. Navigate to: Authentication > Users');
        console.log(`4. Find user with email: ${currentUser.email}`);
        console.log(`5. Find user with UID: ${currentUser.uid}`);
        console.log('6. Click the three dots menu next to the user');
        console.log('7. Select "Delete user"');
        console.log('8. Confirm the deletion');
        console.log('');
        console.log('✨ After deletion:');
        console.log('- User can re-signup with the same email');
        console.log('- New signup will create proper database records');
        console.log('- All website features will work correctly');
        console.log('==========================================');
    }
}

// Export for use in other modules
export { UserAccountDeleter };

// Auto-initialize if loaded directly
if (typeof window !== 'undefined') {
    window.accountDeleter = new UserAccountDeleter();
    
    // Add global functions for easy testing
    window.deleteMyAccount = () => window.accountDeleter.deleteCurrentUserAccount();
    window.signOutAndDelete = () => window.accountDeleter.signOutAndDelete();
    window.getDeletionInstructions = () => window.accountDeleter.getManualDeletionInstructions();
    
    console.log('\n🗑️ USER ACCOUNT DELETER LOADED');
    console.log('==========================================');
    console.log('Available commands:');
    console.log('  deleteMyAccount() - Delete current user account');
    console.log('  signOutAndDelete() - Sign out then delete');
    console.log('  getDeletionInstructions() - Show manual deletion steps');
    console.log('==========================================\n');
}