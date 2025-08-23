/**
 * Blog System Test
 * Simple test to verify blog post data models and Firebase integration
 */

import { BlogPost } from '../models/blog-post.js';
import { BlogService } from '../services/blog-service.js';
import { ValidationUtils } from '../utils/validation.js';

class BlogTest {
    constructor() {
        this.testResults = [];
        this.blogService = null;
    }

    /**
     * Run all blog tests
     */
    async runTests() {
        console.log('🧪 Starting Blog System Tests...');
        
        try {
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            this.blogService = new BlogService();
            
            // Run tests
            this.testBlogPostModel();
            this.testValidation();
            this.testSanitization();
            await this.testFirebaseIntegration();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Test setup failed:', error);
        }
    }

    /**
     * Wait for Firebase services to be available
     */
    waitForFirebase() {
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                if (window.firebaseServices && 
                    window.firebaseServices.auth && 
                    window.firebaseServices.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
            
            // Timeout after 5 seconds
            setTimeout(() => {
                reject(new Error('Firebase services not available'));
            }, 5000);
        });
    }

    /**
     * Test BlogPost model functionality
     */
    testBlogPostModel() {
        console.log('Testing BlogPost model...');

        try {
            // Test basic instantiation
            const post = new BlogPost({
                title: 'Test Blog Post',
                content: '<p>This is test content</p>',
                author: {
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });

            this.assert(post.title === 'Test Blog Post', 'BlogPost title should be set correctly');
            this.assert(post.status === 'draft', 'BlogPost should default to draft status');
            this.assert(post.viewCount === 0, 'BlogPost should default to 0 views');

            // Test slug generation
            const slug = BlogPost.generateSlug('Test Blog Post with Special Characters!');
            this.assert(slug === 'test-blog-post-with-special-characters', 'Slug generation should work correctly');

            // Test excerpt generation
            const excerpt = BlogPost.generateExcerpt('<p>This is a long piece of content that should be truncated to create an excerpt.</p>', 50);
            this.assert(excerpt.length <= 53, 'Excerpt should be truncated correctly'); // 50 + "..."

            console.log('✅ BlogPost model tests passed');

        } catch (error) {
            console.error('❌ BlogPost model tests failed:', error);
            this.testResults.push({ test: 'BlogPost Model', status: 'failed', error: error.message });
        }
    }

    /**
     * Test validation functionality
     */
    testValidation() {
        console.log('Testing validation...');

        try {
            // Test valid post
            const validPost = new BlogPost({
                title: 'Valid Post',
                content: '<p>Valid content</p>',
                author: {
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });

            const validResult = validPost.validate();
            this.assert(validResult.isValid === true, 'Valid post should pass validation');

            // Test invalid post
            const invalidPost = new BlogPost({
                title: '', // Empty title should fail
                content: '<p>Valid content</p>',
                author: {
                    id: '', // Empty author ID should fail
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });

            const invalidResult = invalidPost.validate();
            this.assert(invalidResult.isValid === false, 'Invalid post should fail validation');
            this.assert(invalidResult.errors.length > 0, 'Invalid post should have error messages');

            // Test HTML sanitization
            const dirtyHTML = '<script>alert("xss")</script><p>Clean content</p>';
            const cleanHTML = ValidationUtils.sanitizeHTML(dirtyHTML);
            this.assert(!cleanHTML.includes('<script>'), 'HTML sanitization should remove script tags');
            this.assert(cleanHTML.includes('<p>'), 'HTML sanitization should preserve allowed tags');

            console.log('✅ Validation tests passed');

        } catch (error) {
            console.error('❌ Validation tests failed:', error);
            this.testResults.push({ test: 'Validation', status: 'failed', error: error.message });
        }
    }

    /**
     * Test sanitization functionality
     */
    testSanitization() {
        console.log('Testing sanitization...');

        try {
            const post = new BlogPost({
                title: '  Test Post with Extra Spaces  ',
                content: '<p>Content</p>',
                tags: ['  Tag1  ', 'tag2', 'TAG1', ''], // Test tag deduplication and cleaning
                author: {
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });

            post.sanitize();

            this.assert(post.title === 'Test Post with Extra Spaces', 'Title should be trimmed');
            this.assert(post.slug === 'test-post-with-extra-spaces', 'Slug should be generated');
            this.assert(post.tags.length === 2, 'Duplicate tags should be removed');
            this.assert(post.tags.includes('tag1'), 'Tags should be normalized to lowercase');

            console.log('✅ Sanitization tests passed');

        } catch (error) {
            console.error('❌ Sanitization tests failed:', error);
            this.testResults.push({ test: 'Sanitization', status: 'failed', error: error.message });
        }
    }

    /**
     * Test Firebase integration (basic connectivity)
     */
    async testFirebaseIntegration() {
        console.log('Testing Firebase integration...');

        try {
            // Test database connection
            const testDoc = {
                title: 'Firebase Test Post',
                content: '<p>Test content</p>',
                author: {
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@example.com'
                },
                status: 'draft',
                createdAt: window.firebaseServices.utils.serverTimestamp(),
                updatedAt: window.firebaseServices.utils.serverTimestamp()
            };

            // Test if we can access the collection (without actually writing)
            const collection = window.firebaseServices.db.collection('blogs');
            this.assert(collection !== null, 'Should be able to access blogs collection');

            // Test if we can create a BlogPost from Firestore format
            const blogPost = BlogPost.fromFirestoreDoc('test-id', testDoc);
            this.assert(blogPost.id === 'test-id', 'Should create BlogPost from Firestore document');
            this.assert(blogPost.title === 'Firebase Test Post', 'Should preserve title from Firestore');

            // Test Firestore document conversion
            const firestoreDoc = blogPost.toFirestoreDoc();
            this.assert(firestoreDoc.title === 'Firebase Test Post', 'Should convert to Firestore format');
            this.assert(firestoreDoc.hasOwnProperty('updatedAt'), 'Should include timestamp fields');

            console.log('✅ Firebase integration tests passed');

        } catch (error) {
            console.error('❌ Firebase integration tests failed:', error);
            this.testResults.push({ test: 'Firebase Integration', status: 'failed', error: error.message });
        }
    }

    /**
     * Assert helper function
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * Display test results
     */
    displayResults() {
        console.log('\n📊 Blog System Test Results:');
        
        if (this.testResults.length === 0) {
            console.log('✅ All tests passed!');
        } else {
            console.log(`❌ ${this.testResults.length} test(s) failed:`);
            this.testResults.forEach(result => {
                console.log(`  - ${result.test}: ${result.error}`);
            });
        }
    }
}

// Export for use in browser console or other modules
window.BlogTest = BlogTest;

// Auto-run tests if this script is loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const test = new BlogTest();
            test.runTests();
        }, 1000); // Wait for Firebase to initialize
    });
} else {
    setTimeout(() => {
        const test = new BlogTest();
        test.runTests();
    }, 1000);
}

export { BlogTest };