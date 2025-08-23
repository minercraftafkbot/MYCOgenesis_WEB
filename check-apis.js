#!/usr/bin/env node

/**
 * Check Firebase APIs Status
 * For MYCOgenesis project (mycogen-57ade)
 */

const { execSync } = require('child_process');

console.log('🔍 Checking Firebase APIs Status');
console.log('📍 Project: mycogen-57ade');
console.log('---');

/**
 * Check if an API is enabled
 */
function checkAPI(apiName, description) {
    try {
        const result = execSync(`gcloud services list --enabled --project=mycogen-57ade --filter="name:${apiName}" --format="value(name)"`, { 
            stdio: 'pipe', 
            encoding: 'utf8' 
        });
        
        if (result.trim()) {
            console.log(`✅ ${description}: Enabled`);
            return true;
        } else {
            console.log(`❌ ${description}: Not enabled`);
            return false;
        }
    } catch (error) {
        console.log(`⚠️ ${description}: Unable to check (gcloud CLI not available)`);
        return null;
    }
}

/**
 * Enable an API
 */
function enableAPI(apiName, description) {
    try {
        console.log(`🔧 Enabling ${description}...`);
        execSync(`gcloud services enable ${apiName} --project=mycogen-57ade`, { stdio: 'inherit' });
        console.log(`✅ ${description} enabled successfully`);
        return true;
    } catch (error) {
        console.log(`❌ Failed to enable ${description}`);
        return false;
    }
}

/**
 * Main function
 */
async function checkAPIs() {
    console.log('📋 Checking required APIs...');
    
    const apis = [
        { name: 'firestore.googleapis.com', description: 'Cloud Firestore API' },
        { name: 'firebase.googleapis.com', description: 'Firebase Management API' },
        { name: 'firebasestorage.googleapis.com', description: 'Firebase Storage API' },
        { name: 'identitytoolkit.googleapis.com', description: 'Identity Toolkit API' }
    ];
    
    let allEnabled = true;
    const toEnable = [];
    
    for (const api of apis) {
        const status = checkAPI(api.name, api.description);
        if (status === false) {
            allEnabled = false;
            toEnable.push(api);
        }
    }
    
    if (allEnabled) {
        console.log('---');
        console.log('🎉 All required APIs are enabled!');
        console.log('✅ You can now deploy Firestore rules');
        console.log('');
        console.log('Run: firebase deploy --only firestore:rules --project mycogen-57ade');
        return true;
    } else if (toEnable.length > 0) {
        console.log('---');
        console.log('⚠️ Some APIs need to be enabled');
        console.log('');
        console.log('🔧 Enable them manually:');
        
        toEnable.forEach(api => {
            console.log(`• ${api.description}: https://console.developers.google.com/apis/api/${api.name}/overview?project=mycogen-57ade`);
        });
        
        console.log('');
        console.log('Or enable via Firebase Console:');
        console.log('• https://console.firebase.google.com/project/mycogen-57ade');
        
        return false;
    } else {
        console.log('---');
        console.log('⚠️ Unable to check API status (gcloud CLI not available)');
        console.log('');
        console.log('📋 Manual steps:');
        console.log('1. Go to: https://console.firebase.google.com/project/mycogen-57ade');
        console.log('2. Click "Firestore Database" to enable Firestore');
        console.log('3. Then run: firebase deploy --only firestore:rules --project mycogen-57ade');
        
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    checkAPIs().then(result => {
        process.exit(result === true ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error checking APIs:', error);
        process.exit(1);
    });
}

module.exports = { checkAPIs };