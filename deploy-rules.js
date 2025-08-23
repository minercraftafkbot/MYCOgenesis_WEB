#!/usr/bin/env node

/**
 * Firebase Security Rules Deployment Script
 * For MYCOgenesis project (mycogen-57ade)
 * Firebase v10.13.2 compatible
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Security Rules Deployment');
console.log('📍 Project: mycogen-57ade');
console.log('🔧 Firebase v10.13.2 Compatible Rules');
console.log('---');

/**
 * Check if Firebase CLI is installed
 */
function checkFirebaseCLI() {
    try {
        execSync('firebase --version', { stdio: 'pipe' });
        console.log('✅ Firebase CLI is installed');
        return true;
    } catch (error) {
        console.error('❌ Firebase CLI not found');
        console.log('📦 Install with: npm install -g firebase-tools');
        return false;
    }
}

/**
 * Check if user is logged in to Firebase
 */
function checkFirebaseAuth() {
    try {
        const result = execSync('firebase projects:list', { stdio: 'pipe', encoding: 'utf8' });
        if (result.includes('mycogen-57ade')) {
            console.log('✅ Authenticated and project found');
            return true;
        } else {
            console.log('⚠️ Project mycogen-57ade not found in your account');
            return false;
        }
    } catch (error) {
        console.error('❌ Not authenticated with Firebase');
        console.log('🔐 Login with: firebase login');
        return false;
    }
}

/**
 * Validate rules files exist
 */
function validateRulesFiles() {
    const firestoreRules = path.join(__dirname, 'cms/firebase/firestore.rules');
    const storageRules = path.join(__dirname, 'cms/firebase/storage.rules');
    
    if (!fs.existsSync(firestoreRules)) {
        console.error('❌ Firestore rules not found:', firestoreRules);
        return false;
    }
    
    if (!fs.existsSync(storageRules)) {
        console.error('❌ Storage rules not found:', storageRules);
        return false;
    }
    
    console.log('✅ Rules files found');
    return true;
}

/**
 * Initialize Firebase project if needed
 */
function initializeFirebase() {
    const firebaseJson = path.join(__dirname, 'firebase.json');
    
    if (!fs.existsSync(firebaseJson)) {
        console.log('🔧 Initializing Firebase project...');
        
        const config = {
            firestore: {
                rules: "cms/firebase/firestore.rules",
                indexes: "cms/firebase/firestore.indexes.json"
            },
            storage: {
                rules: "cms/firebase/storage.rules"
            },
            hosting: {
                public: ".",
                ignore: [
                    "firebase.json",
                    "**/.*",
                    "**/node_modules/**"
                ]
            }
        };
        
        fs.writeFileSync(firebaseJson, JSON.stringify(config, null, 2));
        console.log('✅ firebase.json created');
    } else {
        console.log('✅ Firebase project already initialized');
    }
}

/**
 * Deploy Firestore rules
 */
function deployFirestoreRules() {
    try {
        console.log('📋 Deploying Firestore rules...');
        execSync('firebase deploy --only firestore:rules --project mycogen-57ade', { 
            stdio: 'inherit' 
        });
        console.log('✅ Firestore rules deployed successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to deploy Firestore rules');
        return false;
    }
}

/**
 * Deploy Storage rules
 */
function deployStorageRules() {
    try {
        console.log('📋 Deploying Storage rules...');
        execSync('firebase deploy --only storage --project mycogen-57ade', { 
            stdio: 'inherit' 
        });
        console.log('✅ Storage rules deployed successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to deploy Storage rules');
        return false;
    }
}

/**
 * Test rules deployment
 */
function testRulesDeployment() {
    try {
        console.log('🧪 Testing rules deployment...');
        
        // Test Firestore rules
        execSync('firebase firestore:rules:get --project mycogen-57ade', { 
            stdio: 'pipe' 
        });
        console.log('✅ Firestore rules are active');
        
        // Test Storage rules
        execSync('firebase storage:rules:get --project mycogen-57ade', { 
            stdio: 'pipe' 
        });
        console.log('✅ Storage rules are active');
        
        return true;
    } catch (error) {
        console.error('❌ Rules testing failed');
        return false;
    }
}

/**
 * Main deployment function
 */
async function deployRules() {
    console.log('🚀 Starting rules deployment...');
    
    // Pre-deployment checks
    if (!checkFirebaseCLI()) return false;
    if (!checkFirebaseAuth()) return false;
    if (!validateRulesFiles()) return false;
    
    // Initialize project
    initializeFirebase();
    
    // Deploy rules
    const firestoreSuccess = deployFirestoreRules();
    const storageSuccess = deployStorageRules();
    
    if (firestoreSuccess && storageSuccess) {
        console.log('---');
        console.log('🎉 All rules deployed successfully!');
        
        // Test deployment
        if (testRulesDeployment()) {
            console.log('✅ Rules are active and working');
        }
        
        console.log('---');
        console.log('📊 Deployment Summary:');
        console.log('• Firestore Rules: ✅ Deployed');
        console.log('• Storage Rules: ✅ Deployed');
        console.log('• Project: mycogen-57ade');
        console.log('• Firebase Version: v10.13.2 Compatible');
        
        return true;
    } else {
        console.log('---');
        console.log('❌ Some rules failed to deploy');
        console.log('📋 Check the errors above and try again');
        return false;
    }
}

/**
 * Show usage information
 */
function showUsage() {
    console.log('📚 Firebase Rules Deployment Usage:');
    console.log('');
    console.log('Prerequisites:');
    console.log('1. Install Firebase CLI: npm install -g firebase-tools');
    console.log('2. Login to Firebase: firebase login');
    console.log('3. Ensure you have access to mycogen-57ade project');
    console.log('');
    console.log('Run deployment:');
    console.log('node deploy-rules.js');
    console.log('');
    console.log('Manual deployment:');
    console.log('firebase deploy --only firestore:rules,storage --project mycogen-57ade');
}

// Run deployment if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
    } else {
        deployRules().then(success => {
            process.exit(success ? 0 : 1);
        }).catch(error => {
            console.error('❌ Deployment failed:', error);
            process.exit(1);
        });
    }
}

module.exports = { deployRules, showUsage };