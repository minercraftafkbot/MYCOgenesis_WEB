/**
 * Firebase Security Rules Test Scenarios for MYCOgenesis_WEB
 * 
 * These test scenarios validate the security rules work as expected.
 * Run with: npm install -g @firebase/rules-unit-testing
 * Then: node test-firebase-rules.js
 * 
 * Or use Firebase Emulator UI for interactive testing
 */

const firebase = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'mycogen-57ade-test';
const COVERAGE_URL = `http://localhost:8080/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;

// Test data
const testUsers = {
  regularUser: { uid: 'user123', email: 'user@test.com', role: 'user', status: 'active' },
  editor: { uid: 'editor123', email: 'editor@test.com', role: 'editor', status: 'active' },
  admin: { uid: 'admin123', email: 'admin@test.com', role: 'admin', status: 'active' },
  inactiveUser: { uid: 'inactive123', email: 'inactive@test.com', role: 'user', status: 'inactive' }
};

/**
 * Create a Firestore instance with specific authentication
 */
function getFirestore(auth = null) {
  return firebase.initializeTestApp({
    projectId: PROJECT_ID,
    auth: auth
  }).firestore();
}

/**
 * Setup test user profiles in Firestore
 */
async function setupTestUsers() {
  const adminDb = firebase.initializeAdminApp({ projectId: PROJECT_ID }).firestore();
  
  for (const [key, user] of Object.entries(testUsers)) {
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
  }
  
  console.log('✅ Test users setup complete');
}

/**
 * Test Suite: User Profile Rules
 */
async function testUserProfileRules() {
  console.log('\n🧪 Testing User Profile Rules...');
  
  // Test 1: User can read their own profile
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('users').doc(testUsers.regularUser.uid).get();
    console.log('✅ User can read own profile');
  } catch (error) {
    console.log('❌ User cannot read own profile:', error.message);
  }
  
  // Test 2: User cannot read other user's profile
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('users').doc(testUsers.editor.uid).get();
    console.log('❌ User should not read other profiles');
  } catch (error) {
    console.log('✅ User correctly blocked from reading other profiles');
  }
  
  // Test 3: Editor can read any profile
  try {
    const editorDb = getFirestore(testUsers.editor);
    await editorDb.collection('users').doc(testUsers.regularUser.uid).get();
    console.log('✅ Editor can read any profile');
  } catch (error) {
    console.log('❌ Editor cannot read profiles:', error.message);
  }
  
  // Test 4: User can update their own profile (not role/status)
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('users').doc(testUsers.regularUser.uid).update({
      displayName: 'Updated Name',
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ User can update own profile');
  } catch (error) {
    console.log('❌ User cannot update own profile:', error.message);
  }
  
  // Test 5: User cannot change their role
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('users').doc(testUsers.regularUser.uid).update({
      role: 'admin',
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ User should not change their role');
  } catch (error) {
    console.log('✅ User correctly blocked from changing role');
  }
  
  // Test 6: Admin can change user roles
  try {
    const adminDb = getFirestore(testUsers.admin);
    await adminDb.collection('users').doc(testUsers.regularUser.uid).update({
      role: 'editor',
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ Admin can change user roles');
  } catch (error) {
    console.log('❌ Admin cannot change user roles:', error.message);
  }
  
  // Test 7: Self-registration works
  try {
    const newUser = { uid: 'newuser123', email: 'new@test.com' };
    const newUserDb = getFirestore(newUser);
    await newUserDb.collection('users').doc(newUser.uid).set({
      uid: newUser.uid,
      email: newUser.email,
      role: 'user',
      status: 'active',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ Self-registration works');
  } catch (error) {
    console.log('❌ Self-registration failed:', error.message);
  }
}

/**
 * Test Suite: Contact Inquiries Rules
 */
async function testContactInquiriesRules() {
  console.log('\n🧪 Testing Contact Inquiries Rules...');
  
  // Test 1: Anonymous user can create contact inquiry
  try {
    const anonDb = getFirestore(null);
    await anonDb.collection('contact-inquiries').add({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      status: 'new',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ Anonymous user can create contact inquiry');
  } catch (error) {
    console.log('❌ Anonymous user cannot create contact inquiry:', error.message);
  }
  
  // Test 2: Regular user cannot read contact inquiries
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('contact-inquiries').get();
    console.log('❌ Regular user should not read contact inquiries');
  } catch (error) {
    console.log('✅ Regular user correctly blocked from reading inquiries');
  }
  
  // Test 3: Admin can read contact inquiries
  try {
    const adminDb = getFirestore(testUsers.admin);
    await adminDb.collection('contact-inquiries').get();
    console.log('✅ Admin can read contact inquiries');
  } catch (error) {
    console.log('❌ Admin cannot read contact inquiries:', error.message);
  }
  
  // Test 4: Invalid email format is rejected
  try {
    const anonDb = getFirestore(null);
    await anonDb.collection('contact-inquiries').add({
      name: 'Test User',
      email: 'invalid-email',
      subject: 'Test Subject',
      message: 'Test message',
      status: 'new',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ Invalid email should be rejected');
  } catch (error) {
    console.log('✅ Invalid email correctly rejected');
  }
}

/**
 * Test Suite: Analytics Rules
 */
async function testAnalyticsRules() {
  console.log('\n🧪 Testing Analytics Rules...');
  
  // Test 1: Authenticated user can create analytics
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('analytics').add({
      userId: testUsers.regularUser.uid,
      sessionId: 'session123',
      page: '/home',
      event: 'page_view',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ Authenticated user can create analytics');
  } catch (error) {
    console.log('❌ User cannot create analytics:', error.message);
  }
  
  // Test 2: Anonymous user cannot create analytics
  try {
    const anonDb = getFirestore(null);
    await anonDb.collection('analytics').add({
      sessionId: 'session123',
      page: '/home',
      event: 'page_view',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ Anonymous user should not create analytics');
  } catch (error) {
    console.log('✅ Anonymous user correctly blocked from analytics');
  }
  
  // Test 3: Regular user cannot read analytics
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('analytics').get();
    console.log('❌ Regular user should not read analytics');
  } catch (error) {
    console.log('✅ Regular user correctly blocked from reading analytics');
  }
  
  // Test 4: Editor can read analytics
  try {
    const editorDb = getFirestore(testUsers.editor);
    await editorDb.collection('analytics').get();
    console.log('✅ Editor can read analytics');
  } catch (error) {
    console.log('❌ Editor cannot read analytics:', error.message);
  }
}

/**
 * Test Suite: View Counters Rules
 */
async function testViewCountersRules() {
  console.log('\n🧪 Testing View Counters Rules...');
  
  // Test 1: Anonymous user can read view counters
  try {
    const anonDb = getFirestore(null);
    await anonDb.collection('blog-views').get();
    console.log('✅ Anonymous user can read view counters');
  } catch (error) {
    console.log('❌ Anonymous user cannot read view counters:', error.message);
  }
  
  // Test 2: Authenticated user can increment view counters
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('blog-views').add({
      sanityPostId: 'post123',
      viewCount: 1,
      lastViewed: firebase.firestore.Timestamp.now(),
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ User can increment view counters');
  } catch (error) {
    console.log('❌ User cannot increment view counters:', error.message);
  }
  
  // Test 3: Anonymous user cannot increment view counters
  try {
    const anonDb = getFirestore(null);
    await anonDb.collection('blog-views').add({
      sanityPostId: 'post123',
      viewCount: 1,
      lastViewed: firebase.firestore.Timestamp.now(),
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ Anonymous user should not increment view counters');
  } catch (error) {
    console.log('✅ Anonymous user correctly blocked from incrementing views');
  }
}

/**
 * Test Suite: Audit Logs Rules
 */
async function testAuditLogsRules() {
  console.log('\n🧪 Testing Audit Logs Rules...');
  
  // Test 1: User can create audit log for themselves
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('audit-logs').add({
      userId: testUsers.regularUser.uid,
      action: 'profile_update',
      resource: 'users',
      timestamp: firebase.firestore.Timestamp.now(),
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('✅ User can create audit log for themselves');
  } catch (error) {
    console.log('❌ User cannot create audit log:', error.message);
  }
  
  // Test 2: User cannot create audit log for others
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('audit-logs').add({
      userId: testUsers.editor.uid,
      action: 'profile_view',
      resource: 'users',
      timestamp: firebase.firestore.Timestamp.now(),
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ User should not create audit log for others');
  } catch (error) {
    console.log('✅ User correctly blocked from creating logs for others');
  }
  
  // Test 3: Regular user cannot read audit logs
  try {
    const userDb = getFirestore(testUsers.regularUser);
    await userDb.collection('audit-logs').get();
    console.log('❌ Regular user should not read audit logs');
  } catch (error) {
    console.log('✅ Regular user correctly blocked from reading audit logs');
  }
  
  // Test 4: Admin can read audit logs
  try {
    const adminDb = getFirestore(testUsers.admin);
    await adminDb.collection('audit-logs').get();
    console.log('✅ Admin can read audit logs');
  } catch (error) {
    console.log('❌ Admin cannot read audit logs:', error.message);
  }
}

/**
 * Test Suite: Inactive User Rules
 */
async function testInactiveUserRules() {
  console.log('\n🧪 Testing Inactive User Rules...');
  
  // Test 1: Inactive user cannot create analytics
  try {
    const inactiveDb = getFirestore(testUsers.inactiveUser);
    await inactiveDb.collection('analytics').add({
      userId: testUsers.inactiveUser.uid,
      sessionId: 'session123',
      page: '/home',
      event: 'page_view',
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ Inactive user should not create analytics');
  } catch (error) {
    console.log('✅ Inactive user correctly blocked from creating analytics');
  }
  
  // Test 2: Inactive user cannot update profile
  try {
    const inactiveDb = getFirestore(testUsers.inactiveUser);
    await inactiveDb.collection('users').doc(testUsers.inactiveUser.uid).update({
      displayName: 'Updated',
      updatedAt: firebase.firestore.Timestamp.now()
    });
    console.log('❌ Inactive user should not update profile');
  } catch (error) {
    console.log('✅ Inactive user correctly blocked from updating profile');
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Firebase Security Rules Tests for MYCOgenesis_WEB\n');
  
  try {
    await setupTestUsers();
    
    await testUserProfileRules();
    await testContactInquiriesRules();
    await testAnalyticsRules();
    await testViewCountersRules();
    await testAuditLogsRules();
    await testInactiveUserRules();
    
    console.log('\n✅ All tests completed!');
    console.log(`\n📊 View test coverage: ${COVERAGE_URL}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    // Clean up
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });
  }
}

/**
 * Interactive test runner
 */
async function runInteractiveTests() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🧪 Interactive Firebase Rules Testing');
  console.log('Available test suites:');
  console.log('1. User Profile Rules');
  console.log('2. Contact Inquiries Rules');
  console.log('3. Analytics Rules');
  console.log('4. View Counters Rules');
  console.log('5. Audit Logs Rules');
  console.log('6. Inactive User Rules');
  console.log('7. Run All Tests');
  
  rl.question('Select test suite (1-7): ', async (answer) => {
    await setupTestUsers();
    
    switch (answer) {
      case '1':
        await testUserProfileRules();
        break;
      case '2':
        await testContactInquiriesRules();
        break;
      case '3':
        await testAnalyticsRules();
        break;
      case '4':
        await testViewCountersRules();
        break;
      case '5':
        await testAuditLogsRules();
        break;
      case '6':
        await testInactiveUserRules();
        break;
      case '7':
        await runAllTests();
        break;
      default:
        console.log('Invalid selection');
    }
    
    rl.close();
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });
  });
}

// Export for use as module
module.exports = {
  runAllTests,
  runInteractiveTests,
  testUserProfileRules,
  testContactInquiriesRules,
  testAnalyticsRules,
  testViewCountersRules,
  testAuditLogsRules,
  testInactiveUserRules
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(() => process.exit(0));
}
