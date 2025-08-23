import { AuthManager } from '../auth/auth-manager.js';
import { DashboardManager } from '../dashboard/dashboard-manager.js';
import { BlogManager } from '../blog/blog-manager.js';

class CMSApp {
    constructor() {
        this.authManager = null;
        this.dashboardManager = null;
        this.blogManager = null;
        this.init();
    }

    /**
     * Initialize the CMS application
     */
    async init() {
        try {
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Initialize authentication manager
            this.authManager = new AuthManager();
            
            // Initialize dashboard manager
            this.dashboardManager = new DashboardManager(this.authManager);
            
            // Initialize blog manager
            this.blogManager = new BlogManager(this.authManager);
            
            // Setup login form
            this.setupLoginForm();
            
            // Setup error handling
            this.setupErrorHandling();
            
            console.log('CMS App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize CMS App:', error);
            this.showGlobalError('Failed to initialize application. Please refresh the page.');
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
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Firebase services not available'));
            }, 10000);
        });
    }

    /**
     * Setup login form event handlers
     */
    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                this.authManager.showError('Please enter both email and password.');
                return;
            }

            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span>Signing in...';
            
            try {
                this.authManager.clearError();
                await this.authManager.signIn(email, password);
                
                // Clear form
                loginForm.reset();
            } catch (error) {
                this.authManager.showError(error.message);
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // Clear errors when user starts typing
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        [emailInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.authManager.clearError();
                });
            }
        });
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showGlobalError('An unexpected error occurred. Please try again.');
            event.preventDefault();
        });

        // Handle general errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showGlobalError('An unexpected error occurred. Please refresh the page.');
        });
    }

    /**
     * Show global error message
     * @param {string} message - Error message to display
     */
    showGlobalError(message) {
        // Create or update global error display
        let errorDiv = document.getElementById('global-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'global-error';
            errorDiv.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-50';
            document.body.insertBefore(errorDiv, document.body.firstChild);
        }
        
        errorDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-4 text-red-200 hover:text-white">×</button>
        `;
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    /**
     * Get authentication manager instance
     * @returns {AuthManager} - Auth manager instance
     */
    getAuthManager() {
        return this.authManager;
    }

    /**
     * Get dashboard manager instance
     * @returns {DashboardManager} - Dashboard manager instance
     */
    getDashboardManager() {
        return this.dashboardManager;
    }

    /**
     * Get blog manager instance
     * @returns {BlogManager} - Blog manager instance
     */
    getBlogManager() {
        return this.blogManager;
    }
}

// Initialize the CMS application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cmsApp = new CMSApp();
});

// Export for use in other modules
export { CMSApp };