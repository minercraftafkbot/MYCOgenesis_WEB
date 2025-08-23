/**
 * User Profile Migration Utility
 * Creates Firestore user profiles for existing Firebase Auth users
 */

import { initializeModularFirebase } from '../firebase-init.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/**
 * Migrate user profile to Firestore if it doesn't exist
 * This function can be called from the browser console or integrated into the app
 */
export async function migrateUserProfile() {
    try {
        console.log('🔄 Starting user profile migration...');
        
        // Initialize Firebase
        const firebaseServices = await initializeModularFirebase();
        const { auth, db } = firebaseServices;
        
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No authenticated user found. Please log in first.');
            return false;
        }
        
        console.log('👤 Checking profile for user:', user.email);
        
        // Check if user profile exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            console.log('✅ User profile already exists in Firestore');
            return true;
        }
        
        console.log('🔧 Creating user profile in Firestore...');
        
        // Extract name from display name
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create user profile
        const userProfile = {
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            displayName: user.displayName || `${firstName} ${lastName}`.trim(),
            photoURL: user.photoURL || '',
            role: 'user', // Default role
            status: 'active',
            emailVerified: user.emailVerified,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            preferences: {
                notifications: true,
                newsletter: false
            },
            profile: {
                bio: '',
                avatar: user.photoURL || ''
            },
            activity: {
                postsCreated: 0,
                postsEdited: 0
            }
        };
        
        // Save to Firestore
        await setDoc(userDocRef, userProfile);
        
        console.log('✅ User profile created successfully in Firestore');
        console.log('📊 Profile data:', userProfile);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error during user profile migration:', error);
        return false;
    }
}

/**
 * Check if current user has a Firestore profile
 */
export async function checkUserProfile() {
    try {
        const firebaseServices = await initializeModularFirebase();
        const { auth, db } = firebaseServices;
        
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No authenticated user found');
            return false;
        }
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            console.log('✅ User profile exists in Firestore');
            console.log('📊 Profile data:', userDoc.data());
            return true;
        } else {
            console.log('❌ User profile does not exist in Firestore');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error checking user profile:', error);
        return false;
    }
}

// Make functions available globally for console usage
if (typeof window !== 'undefined') {
    window.migrateUserProfile = migrateUserProfile;
    window.checkUserProfile = checkUserProfile;
    
    console.log('🔧 User profile migration utilities loaded');
    console.log('📝 Available functions:');
    console.log('  - migrateUserProfile() - Create Firestore profile for current user');
    console.log('  - checkUserProfile() - Check if current user has Firestore profile');
}