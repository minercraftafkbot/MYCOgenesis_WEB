// Role-based access control system
export class RoleManager {
    constructor() {
        this.USER_ROLES = {
            ADMIN: 'admin',
            EDITOR: 'editor', 
            USER: 'user'
        };

        this.PERMISSIONS = {
            'blog.create': ['admin', 'editor'],
            'blog.edit': ['admin', 'editor'],
            'blog.delete': ['admin'],
            'blog.publish': ['admin', 'editor'],
            'products.create': ['admin'],
            'products.edit': ['admin'],
            'products.delete': ['admin'],
            'products.manage': ['admin'],
            'users.view': ['admin'],
            'users.manage': ['admin'],
            'users.roles': ['admin'],
            'analytics.view': ['admin', 'editor'],
            'settings.view': ['admin'],
            'settings.edit': ['admin']
        };

        this.NAVIGATION_ITEMS = {
            admin: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'blog', label: 'Blog Posts', icon: '📝' },
                { id: 'products', label: 'Products', icon: '🍄' },
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
            ],
            editor: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'blog', label: 'Blog Posts', icon: '📝' },
                { id: 'analytics', label: 'Analytics', icon: '📈' }
            ],
            user: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'profile', label: 'My Profile', icon: '👤' }
            ]
        };
    }

    /**
     * Check if user has permission for a specific action
     * @param {string} userRole - User's role
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether user has permission
     */
    hasPermission(userRole, permission) {
        if (!userRole || !permission) return false;
        
        const allowedRoles = this.PERMISSIONS[permission];
        return allowedRoles && allowedRoles.includes(userRole);
    }

    /**
     * Get navigation items for user role
     * @param {string} userRole - User's role
     * @returns {Array} - Navigation items for the role
     */
    getNavigationItems(userRole) {
        return this.NAVIGATION_ITEMS[userRole] || this.NAVIGATION_ITEMS.user;
    }

    /**
     * Get user role from Firebase user document
     * @param {string} userId - Firebase user ID
     * @returns {Promise<string>} - User role
     */
    async getUserRole(userId) {
        try {
            const { db } = window.firebaseServices;
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.role || this.USER_ROLES.USER;
            }
            
            // If user document doesn't exist, create it with default role
            await this.createUserProfile(userId);
            return this.USER_ROLES.USER;
        } catch (error) {
            console.error('Error getting user role:', error);
            return this.USER_ROLES.USER;
        }
    }

    /**
     * Create user profile with default role
     * @param {string} userId - Firebase user ID
     * @param {Object} additionalData - Additional user data
     */
    async createUserProfile(userId, additionalData = {}) {
        try {
            const { db, auth } = window.firebaseServices;
            const user = auth.currentUser;
            
            const userProfile = {
                uid: userId,
                email: user?.email || '',
                displayName: user?.displayName || '',
                role: this.USER_ROLES.USER,
                profile: {
                    firstName: '',
                    lastName: '',
                    bio: '',
                    avatar: ''
                },
                preferences: {
                    favoriteArticles: [],
                    favoriteProducts: [],
                    emailNotifications: true
                },
                activity: {
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    postsCreated: 0,
                    postsEdited: 0
                },
                status: 'active',
                createdAt: window.firebaseServices.utils.serverTimestamp(),
                updatedAt: window.firebaseServices.utils.serverTimestamp(),
                ...additionalData
            };

            await db.collection('users').doc(userId).set(userProfile);
            console.log('User profile created successfully');
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    /**
     * Update user role (admin only)
     * @param {string} userId - User ID to update
     * @param {string} newRole - New role to assign
     * @param {string} currentUserRole - Current user's role
     */
    async updateUserRole(userId, newRole, currentUserRole) {
        if (!this.hasPermission(currentUserRole, 'users.roles')) {
            throw new Error('Insufficient permissions to update user roles');
        }

        if (!Object.values(this.USER_ROLES).includes(newRole)) {
            throw new Error('Invalid role specified');
        }

        try {
            const { db } = window.firebaseServices;
            await db.collection('users').doc(userId).update({
                role: newRole,
                updatedAt: window.firebaseServices.utils.serverTimestamp()
            });
            
            console.log(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    /**
     * Update user last login timestamp
     * @param {string} userId - User ID
     */
    async updateLastLogin(userId) {
        try {
            const { db } = window.firebaseServices;
            await db.collection('users').doc(userId).update({
                'activity.lastLogin': window.firebaseServices.utils.serverTimestamp(),
                updatedAt: window.firebaseServices.utils.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    /**
     * Check if user account is active
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} - Whether account is active
     */
    async isUserActive(userId) {
        try {
            const { db } = window.firebaseServices;
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.status === 'active';
            }
            
            return false;
        } catch (error) {
            console.error('Error checking user status:', error);
            return false;
        }
    }

    /**
     * Validate user permissions and account status
     * @param {string} userId - User ID
     * @param {string} permission - Permission to check
     * @returns {Promise<boolean>} - Whether user can perform action
     */
    async validateUserAccess(userId, permission) {
        try {
            const isActive = await this.isUserActive(userId);
            if (!isActive) {
                throw new Error('User account is not active');
            }

            const userRole = await this.getUserRole(userId);
            const hasPermission = this.hasPermission(userRole, permission);
            
            if (!hasPermission) {
                throw new Error('Insufficient permissions for this action');
            }

            return true;
        } catch (error) {
            console.error('Access validation failed:', error);
            throw error;
        }
    }
}