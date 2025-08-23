import { RoleManager } from './role-manager.js';

export class AuthManager {
    constructor() {
        this.roleManager = new RoleManager();
        this.currentUser = null;
        this.currentUserRole = null;
        this.authStateListeners = [];
        
        this.initializeAuth();
    }

    /**
     * Initialize authentication state listener
     */
    initializeAuth() {
        const { auth } = window.firebaseServices;
        
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Check if user account is active
                    const isActive = await this.roleManager.isUserActive(user.uid);
                    if (!isActive) {
                        await this.signOut();
                        this.showError('Your account has been deactivated. Please contact an administrator.');
                        return;
                    }

                    // Get user role and update login timestamp
                    this.currentUser = user;
                    this.currentUserRole = await this.roleManager.getUserRole(user.uid);
                    await this.roleManager.updateLastLogin(user.uid);
                    
                    this.onAuthStateChanged(true);
                } catch (error) {
                    console.error('Error during authentication:', error);
                    await this.signOut();
                    this.showError('Authentication error. Please try again.');
                }
            } else {
                this.currentUser = null;
                this.currentUserRole = null;
                this.onAuthStateChanged(false);
            }
        });
    }

    /**
     * Handle authentication state changes
     * @param {boolean} isAuthenticated - Whether user is authenticated
     */
    onAuthStateChanged(isAuthenticated) {
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('cms-dashboard');
        
        if (isAuthenticated && this.currentUser && this.currentUserRole) {
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            this.setupDashboard();
        } else {
            loginScreen.classList.remove('hidden');
            dashboard.classList.add('hidden');
        }

        // Notify listeners
        this.authStateListeners.forEach(listener => {
            listener(isAuthenticated, this.currentUser, this.currentUserRole);
        });
    }

    /**
     * Add authentication state listener
     * @param {Function} listener - Callback function
     */
    addAuthStateListener(listener) {
        this.authStateListeners.push(listener);
    }

    /**
     * Remove authentication state listener
     * @param {Function} listener - Callback function to remove
     */
    removeAuthStateListener(listener) {
        const index = this.authStateListeners.indexOf(listener);
        if (index > -1) {
            this.authStateListeners.splice(index, 1);
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async signIn(email, password) {
        try {
            const { auth } = window.firebaseServices;
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Check if this is a first-time login and create profile if needed
            const userRole = await this.roleManager.getUserRole(userCredential.user.uid);
            
            return {
                success: true,
                user: userCredential.user,
                role: userRole
            };
        } catch (error) {
            console.error('Sign in error:', error);
            let errorMessage = 'Sign in failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Sign out current user
     */
    async signOut() {
        try {
            const { auth } = window.firebaseServices;
            await auth.signOut();
            this.clearError();
        } catch (error) {
            console.error('Sign out error:', error);
            throw new Error('Sign out failed. Please try again.');
        }
    }

    /**
     * Setup dashboard after successful authentication
     */
    setupDashboard() {
        this.setupLogoutButton();
    }

    /**
     * Setup logout button
     */
    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await this.signOut();
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }
    }



    /**
     * Check if current user has permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether user has permission
     */
    hasPermission(permission) {
        return this.roleManager.hasPermission(this.currentUserRole, permission);
    }

    /**
     * Get current user information
     * @returns {Object} - Current user and role info
     */
    getCurrentUser() {
        return {
            user: this.currentUser,
            role: this.currentUserRole
        };
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    }
}