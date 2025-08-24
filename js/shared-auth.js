/**
 * Shared Authentication Handler
 * Provides consistent authentication across all website pages
 */

import { initializeModularFirebase } from './firebase-init.js';
import { 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

class SharedAuthHandler {
    constructor(options = {}) {
        this.firebaseServices = null;
        this.currentUser = null;
        this.userProfile = null;
        this.options = {
            showDropdown: true,
            redirectAfterLogin: null,
            ...options
        };
        this.init();
    }

    /**
     * Initialize the authentication handler
     */
    async init() {
        try {
            // Initialize Firebase
            this.firebaseServices = await initializeModularFirebase();
            
            // Setup authentication state listener
            this.setupAuthStateListener();
            
            // Setup UI event listeners
            this.setupUIEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize shared auth handler:', error);
        }
    }

    /**
     * Setup authentication state listener
     */
    setupAuthStateListener() {
        const { auth } = this.firebaseServices;
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                
                // Load user profile from Firestore
                await this.loadUserProfile(user.uid);
                
                // Update UI to show logged in state
                this.showLoggedInState();
                
            } else {
                this.currentUser = null;
                this.userProfile = null;
                
                // Update UI to show logged out state
                this.showLoggedOutState();
            }
        });
    }

    /**
     * Load user profile from Firestore
     * @param {string} userId - User ID
     */
    async loadUserProfile(userId) {
        try {
            const { db } = this.firebaseServices;
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                this.userProfile = userDoc.data();
            } else {
                // Use basic info from Firebase Auth
                this.userProfile = {
                    displayName: this.currentUser.displayName || 'User',
                    email: this.currentUser.email,
                    photoURL: this.currentUser.photoURL || this.generateAvatarUrl(this.currentUser.displayName || this.currentUser.email)
                };
            }
        } catch (error) {
            console.error('Error loading user profile from database:', error);
            
            // Fallback to basic user info
            this.userProfile = {
                displayName: this.currentUser.displayName || 'User',
                email: this.currentUser.email,
                photoURL: this.currentUser.photoURL || this.generateAvatarUrl(this.currentUser.displayName || this.currentUser.email)
            };
        }
    }

    /**
     * Generate avatar URL for user
     * @param {string} name - User name or email
     * @returns {string} - Avatar URL
     */
    generateAvatarUrl(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d9488&color=fff&size=128`;
    }

    /**
     * Show logged in state in UI
     */
    showLoggedInState() {
        // Desktop navigation
        const notLoggedIn = document.getElementById('auth-not-logged-in');
        const loggedIn = document.getElementById('auth-logged-in');
        
        if (notLoggedIn) notLoggedIn.classList.add('hidden');
        if (loggedIn) loggedIn.classList.remove('hidden');
        
        // Tablet navigation
        const tabletNotLoggedIn = document.getElementById('tablet-auth-not-logged-in');
        const tabletLoggedIn = document.getElementById('tablet-auth-logged-in');
        
        if (tabletNotLoggedIn) tabletNotLoggedIn.classList.add('hidden');
        if (tabletLoggedIn) tabletLoggedIn.classList.remove('hidden');
        
        // Mobile navigation
        const mobileNotLoggedIn = document.getElementById('mobile-auth-not-logged-in');
        const mobileLoggedIn = document.getElementById('mobile-auth-logged-in');
        
        if (mobileNotLoggedIn) mobileNotLoggedIn.classList.add('hidden');
        if (mobileLoggedIn) mobileLoggedIn.classList.remove('hidden');
        
        // Update user information
        this.updateUserDisplay();
    }

    /**
     * Show logged out state in UI
     */
    showLoggedOutState() {
        // Desktop navigation
        const notLoggedIn = document.getElementById('auth-not-logged-in');
        const loggedIn = document.getElementById('auth-logged-in');
        
        if (notLoggedIn) notLoggedIn.classList.remove('hidden');
        if (loggedIn) loggedIn.classList.add('hidden');
        
        // Tablet navigation
        const tabletNotLoggedIn = document.getElementById('tablet-auth-not-logged-in');
        const tabletLoggedIn = document.getElementById('tablet-auth-logged-in');
        
        if (tabletNotLoggedIn) tabletNotLoggedIn.classList.remove('hidden');
        if (tabletLoggedIn) tabletLoggedIn.classList.add('hidden');
        
        // Mobile navigation
        const mobileNotLoggedIn = document.getElementById('mobile-auth-not-logged-in');
        const mobileLoggedIn = document.getElementById('mobile-auth-logged-in');
        
        if (mobileNotLoggedIn) mobileNotLoggedIn.classList.remove('hidden');
        if (mobileLoggedIn) mobileLoggedIn.classList.add('hidden');
        
        // Hide dropdown if open
        this.hideUserDropdown();
    }

    /**
     * Update user display information
     */
    updateUserDisplay() {
        if (!this.userProfile) return;
        
        const displayName = this.userProfile.displayName || 
                           `${this.userProfile.firstName || ''} ${this.userProfile.lastName || ''}`.trim() ||
                           this.currentUser.email.split('@')[0];
        
        const avatarUrl = this.userProfile.photoURL || 
                         this.userProfile.profile?.avatar ||
                         this.generateAvatarUrl(displayName);
        
        // Desktop elements
        const userAvatar = document.getElementById('user-avatar');
        const userAvatarBlog = document.getElementById('user-avatar-blog');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userAvatar) userAvatar.src = avatarUrl;
        if (userAvatarBlog) userAvatarBlog.src = avatarUrl;
        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = this.currentUser.email;
        
        // Tablet elements
        const tabletUserAvatar = document.getElementById('tablet-user-avatar');
        if (tabletUserAvatar) tabletUserAvatar.src = avatarUrl;
        
        // Mobile elements
        const mobileUserAvatar = document.getElementById('mobile-user-avatar');
        const mobileUserName = document.getElementById('mobile-user-name');
        const mobileUserEmail = document.getElementById('mobile-user-email');
        
        if (mobileUserAvatar) mobileUserAvatar.src = avatarUrl;
        if (mobileUserName) mobileUserName.textContent = displayName;
        if (mobileUserEmail) mobileUserEmail.textContent = this.currentUser.email;
    }

    /**
     * Setup UI event listeners
     */
    setupUIEventListeners() {
        // User menu dropdown toggle (if enabled)
        if (this.options.showDropdown) {
            const userMenuButton = document.getElementById('user-menu-button');
            if (userMenuButton) {
                userMenuButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleUserDropdown();
                });
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('user-dropdown');
                const button = document.getElementById('user-menu-button');
                
                if (dropdown && !dropdown.contains(e.target) && !button?.contains(e.target)) {
                    this.hideUserDropdown();
                }
            });
        }

        // Logout buttons
        const logoutButton = document.getElementById('logout-button');
        const mobileLogoutButton = document.getElementById('mobile-logout-button');
        
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        if (mobileLogoutButton) {
            mobileLogoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Profile blog links
        const profileBlogLinks = [
            'profile-blog-link', 
            'tablet-profile-blog-link', 
            'mobile-profile-blog-link'
        ];
        
        profileBlogLinks.forEach(linkId => {
            const link = document.getElementById(linkId);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateToBlog();
                });
            }
        });

        // Profile links (placeholder for now)
        const profileLinks = [
            'profile-link', 'orders-link', 'preferences-link',
            'mobile-profile-link', 'mobile-orders-link'
        ];
        
        profileLinks.forEach(linkId => {
            const link = document.getElementById(linkId);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleProfileAction(linkId);
                });
            }
        });
    }

    /**
     * Navigate to blog page or section
     */
    navigateToBlog() {
        // Check if we're on the main page with blog section
        const blogSection = document.getElementById('blog');
        if (blogSection) {
            // Scroll to blog section on same page
            blogSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            // Navigate to blog page
            const currentPath = window.location.pathname;
            if (currentPath.includes('/blog/')) {
                // Already on a blog page
                if (currentPath.includes('blog-post.html')) {
                    // Navigate from blog post to blog listing
                    window.location.href = 'blog.html';
                } else {
                    // Already on blog listing, scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                // Navigate to blog page from main website
                window.location.href = '/blog/blog.html';
            }
        }
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    }

    /**
     * Toggle user dropdown menu
     */
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    /**
     * Hide user dropdown menu
     */
    hideUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            const { auth } = this.firebaseServices;
            await signOut(auth);
            
            // Hide dropdown
            this.hideUserDropdown();
            
            // Optional: Show success message
            this.showMessage('You have been logged out successfully', 'success');
            
        } catch (error) {
            console.error('Error logging out:', error);
            this.showMessage('Error logging out. Please try again.', 'error');
        }
    }

    /**
     * Handle profile actions
     * @param {string} action - Action identifier
     */
    handleProfileAction(action) {
        this.hideUserDropdown();
        
        switch (action) {
            case 'profile-link':
            case 'mobile-profile-link':
                this.showMessage('Profile page coming soon!', 'info');
                break;
            case 'orders-link':
            case 'mobile-orders-link':
                this.showMessage('Orders page coming soon!', 'info');
                break;
            case 'preferences-link':
                this.showMessage('Preferences page coming soon!', 'info');
                break;
            default:
                console.log('Unknown profile action:', action);
        }
    }

    /**
     * Show temporary message to user
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${this.getMessageClasses(type)}`;
        messageDiv.textContent = message;
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
            messageDiv.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get CSS classes for message type
     * @param {string} type - Message type
     * @returns {string} - CSS classes
     */
    getMessageClasses(type) {
        const baseClasses = 'transform translate-x-full opacity-0';
        
        switch (type) {
            case 'success':
                return `${baseClasses} bg-green-500 text-white`;
            case 'error':
                return `${baseClasses} bg-red-500 text-white`;
            case 'info':
            default:
                return `${baseClasses} bg-blue-500 text-white`;
        }
    }

    /**
     * Get current user information
     * @returns {Object|null} - Current user and profile data
     */
    getCurrentUser() {
        return this.currentUser ? {
            user: this.currentUser,
            profile: this.userProfile
        } : null;
    }
}

// Export for use in other modules
export { SharedAuthHandler };