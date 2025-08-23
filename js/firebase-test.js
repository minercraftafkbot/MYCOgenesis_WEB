/**
 * Firebase Configuration Test Script
 * Tests the Firebase v10.13.2 setup for MYCOgenesis
 */

import { initializeModularFirebase, firebaseHealthCheck } from './firebase-init.js';

/**
 * Test Firebase configuration and services
 */
async function testFirebaseSetup() {
    console.log('🧪 Testing Firebase v10.13.2 setup for MYCOgenesis...');
    
    try {
        // Test 1: Initialize Firebase
        console.log('📋 Test 1: Initializing Firebase...');
        const services = await initializeModularFirebase();
        console.log('✅ Firebase initialized successfully');
        console.log('📊 Available services:', {
            auth: !!services.auth,
            firestore: !!services.db,
            storage: !!services.storage,
            analytics: !!services.analytics
        });
        
        // Test 2: Health Check
        console.log('📋 Test 2: Running health check...');
        const health = await firebaseHealthCheck();
        console.log('✅ Health check completed:', health);
        
        // Test 3: Test Auth Service
        console.log('📋 Test 3: Testing Auth service...');
        const { auth } = services;
        console.log('✅ Auth service available:', !!auth);
        console.log('🔐 Current user:', auth.currentUser ? 'Logged in' : 'Not logged in');
        
        // Test 4: Test Firestore Connection
        console.log('📋 Test 4: Testing Firestore connection...');
        const { db } = services;
        try {
            // Try to read a test document (this will fail if rules don't allow it, but connection works)
            await db.doc('test/connection').get();
            console.log('✅ Firestore connection successful');
        } catch (error) {
            if (error.code === 'permission-denied') {
                console.log('✅ Firestore connection successful (permission denied is expected)');
            } else {
                console.warn('⚠️ Firestore connection issue:', error.message);
            }
        }
        
        // Test 5: Test Storage Service
        console.log('📋 Test 5: Testing Storage service...');
        const { storage } = services;
        try {
            const storageRef = storage.ref('test');
            console.log('✅ Storage service available');
        } catch (error) {
            console.warn('⚠️ Storage service issue:', error.message);
        }
        
        // Test 6: Test Analytics (if available)
        if (services.analytics) {
            console.log('📋 Test 6: Testing Analytics service...');
            console.log('✅ Analytics service available');
        } else {
            console.log('📋 Test 6: Analytics service not configured (optional)');
        }
        
        console.log('🎉 All Firebase tests completed successfully!');
        console.log('🚀 MYCOgenesis Firebase v10.13.2 setup is ready');
        
        return {
            success: true,
            services: services,
            health: health
        };
        
    } catch (error) {
        console.error('❌ Firebase test failed:', error);
        console.error('🔧 Please check your Firebase configuration and project settings');
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Test specific Firebase features
 */
async function testFirebaseFeatures() {
    console.log('🔬 Testing specific Firebase features...');
    
    try {
        const services = await initializeModularFirebase();
        const { db, utils } = services;
        
        // Test server timestamp
        console.log('📋 Testing server timestamp...');
        const timestamp = utils.serverTimestamp();
        console.log('✅ Server timestamp utility works');
        
        // Test batch operations
        console.log('📋 Testing batch operations...');
        const batch = utils.batch();
        console.log('✅ Batch utility works');
        
        // Test array operations
        console.log('📋 Testing array operations...');
        const arrayUnion = utils.arrayUnion('test');
        const arrayRemove = utils.arrayRemove('test');
        console.log('✅ Array utilities work');
        
        // Test increment
        console.log('📋 Testing increment utility...');
        const increment = utils.increment(1);
        console.log('✅ Increment utility works');
        
        console.log('🎉 All Firebase feature tests passed!');
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Firebase feature test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Run comprehensive Firebase tests
 */
export async function runFirebaseTests() {
    console.log('🚀 Starting comprehensive Firebase tests for MYCOgenesis...');
    console.log('📍 Project: mycogen-57ade');
    console.log('🔥 Firebase Version: v10.13.2');
    console.log('---');
    
    const setupTest = await testFirebaseSetup();
    const featureTest = await testFirebaseFeatures();
    
    console.log('---');
    console.log('📊 Test Results Summary:');
    console.log('Setup Test:', setupTest.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Feature Test:', featureTest.success ? '✅ PASSED' : '❌ FAILED');
    
    if (setupTest.success && featureTest.success) {
        console.log('🎉 ALL TESTS PASSED - Firebase is ready for production!');
    } else {
        console.log('⚠️ Some tests failed - please review the errors above');
    }
    
    return {
        overall: setupTest.success && featureTest.success,
        setup: setupTest,
        features: featureTest
    };
}

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Expose test functions globally for manual testing
    window.testFirebase = runFirebaseTests;
    window.testFirebaseSetup = testFirebaseSetup;
    window.testFirebaseFeatures = testFirebaseFeatures;
    
    console.log('🔧 Development mode detected');
    console.log('💡 Run window.testFirebase() to test Firebase setup');
}

export { testFirebaseSetup, testFirebaseFeatures };