/**
 * Database User Checker
 * Utility to check if logged-in users are properly stored in Firestore
 */

import { initializeModularFirebase } from '../firebase-init.js';
import { 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    doc, 
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

class DatabaseUserChecker {
    constructor() {
        this.firebaseServices = null;
        this.init();
    }

    /**
     * Initialize the checker
     */
    async init() {
        try {
            this.firebaseServices = await initializeModularFirebase();
            console.log('✅ Firebase initialized for DB checker');
            this.setupAuthListener();
        } catch (error) {
            console.error('❌ Failed to initialize DB checker:', error);
        }
    }

    /**
     * Setup authentication listener
     */
    setupAuthListener() {
        const { auth } = this.firebaseServices;
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('\n🔍 CHECKING DATABASE FOR CURRENT USER');
                console.log('==========================================');
                await this.checkCurrentUser(user);
                await this.listAllUsers();
            } else {
                console.log('\n❌ No user logged in');
            }
        });
    }

    /**
     * Check current user in database
     */
    async checkCurrentUser(user) {
        try {
            const { db } = this.firebaseServices;
            
            console.log(`👤 Current User (Firebase Auth):`);
            console.log(`   UID: ${user.uid}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Display Name: ${user.displayName || 'Not set'}`);
            console.log(`   Email Verified: ${user.emailVerified}`);
            console.log(`   Created: ${user.metadata.creationTime}`);
            console.log(`   Last Sign In: ${user.metadata.lastSignInTime}`);
            
            // Check if user document exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            console.log(`\n📄 User Document in Firestore:`);
            if (userDoc.exists()) {
                console.log(`   ✅ EXISTS in database`);
                const userData = userDoc.data();
                console.log(`   Data:`, JSON.stringify(userData, null, 2));
                
                // Check for required fields
                const requiredFields = ['email', 'createdAt', 'updatedAt'];
                const missingFields = requiredFields.filter(field => !userData[field]);
                
                if (missingFields.length > 0) {
                    console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
                } else {
                    console.log(`   ✅ All required fields present`);
                }
            } else {
                console.log(`   ❌ DOES NOT EXIST in database`);
                console.log(`   🔧 User should be created during signup/login process`);
            }
            
        } catch (error) {
            console.error('❌ Error checking current user:', error);
        }
    }

    /**
     * List all users in database
     */
    async listAllUsers() {
        try {
            const { db } = this.firebaseServices;
            
            console.log(`\n📋 ALL USERS IN DATABASE:`);
            console.log('==========================================');
            
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.log('   📭 No users found in database');
                return;
            }
            
            let userCount = 0;
            querySnapshot.forEach((doc) => {
                userCount++;
                const userData = doc.data();
                console.log(`\n   👤 User ${userCount}:`);
                console.log(`      UID: ${doc.id}`);
                console.log(`      Email: ${userData.email || 'Not set'}`);
                console.log(`      Name: ${userData.displayName || userData.firstName + ' ' + userData.lastName || 'Not set'}`);
                console.log(`      Created: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : 'Not set'}`);
                console.log(`      Role: ${userData.role || 'user'}`);
                console.log(`      Email Verified: ${userData.emailVerified || false}`);
            });
            
            console.log(`\n   📊 Total users in database: ${userCount}`);
            
        } catch (error) {
            console.error('❌ Error listing users:', error);
        }
    }

    /**
     * Check specific user by UID
     */
    async checkUserByUID(uid) {
        try {
            const { db } = this.firebaseServices;
            
            console.log(`\n🔍 CHECKING USER BY UID: ${uid}`);
            console.log('==========================================');
            
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                console.log(`   ✅ User found in database`);
                const userData = userDoc.data();
                console.log(`   Data:`, JSON.stringify(userData, null, 2));
            } else {
                console.log(`   ❌ User not found in database`);
            }
            
        } catch (error) {
            console.error('❌ Error checking user by UID:', error);
        }
    }

    /**
     * Run comprehensive database check
     */
    async runFullCheck() {
        console.log('\n🔍 RUNNING FULL DATABASE CHECK');
        console.log('==========================================');
        
        const { auth } = this.firebaseServices;
        const currentUser = auth.currentUser;
        
        if (currentUser) {
            await this.checkCurrentUser(currentUser);
        } else {
            console.log('❌ No user currently logged in');
        }
        
        await this.listAllUsers();
        
        console.log('\n✅ Database check complete');
    }
}

// Export for use in other modules
export { DatabaseUserChecker };

// Auto-initialize if loaded directly
if (typeof window !== 'undefined') {
    window.dbChecker = new DatabaseUserChecker();
    
    // Add global functions for easy testing
    window.checkDB = () => window.dbChecker.runFullCheck();
    window.checkUserByUID = (uid) => window.dbChecker.checkUserByUID(uid);
    
    console.log('\n🔧 DATABASE CHECKER LOADED');
    console.log('==========================================');
    console.log('Available commands:');
    console.log('  checkDB() - Run full database check');
    console.log('  checkUserByUID("uid") - Check specific user');
    console.log('==========================================\n');
}