/**
 * Dashboard Overview Manager - Handles dashboard widgets, stats, and quick actions
 * Requirements: 6.1, 6.2
 */
export class DashboardOverview {
    constructor(authManager) {
        this.authManager = authManager;
        this.stats = {
            totalPosts: 0,
            publishedPosts: 0,
            draftPosts: 0,
            totalProducts: 0,
            totalUsers: 0,
            recentActivity: []
        };
        this.notifications = [];
        
        this.init();
    }

    /**
     * Initialize dashboard overview
     */
    init() {
        this.loadDashboardData();
        this.setupNotificationSystem();
    }

    /**
     * Load dashboard data and statistics
     */
    async loadDashboardData() {
        try {
            const { db } = window.firebaseServices;
            const userRole = this.authManager.getCurrentUser().role;
            
            // Load stats based on user permissions
            if (this.authManager.hasPermission('blog.view') || this.authManager.hasPermission('blog.edit')) {
                await this.loadBlogStats(db);
            }
            
            if (this.authManager.hasPermission('products.view') || this.authManager.hasPermission('products.manage')) {
                await this.loadProductStats(db);
            }
            
            if (this.authManager.hasPermission('users.view')) {
                await this.loadUserStats(db);
            }
            
            await this.loadRecentActivity(db, userRole);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    /**
     * Load blog statistics
     * @param {Object} db - Firestore database instance
     */
    async loadBlogStats(db) {
        try {
            const blogsSnapshot = await db.collection('blogs').get();
            this.stats.totalPosts = blogsSnapshot.size;
            
            let publishedCount = 0;
            let draftCount = 0;
            
            blogsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'published') {
                    publishedCount++;
                } else if (data.status === 'draft') {
                    draftCount++;
                }
            });
            
            this.stats.publishedPosts = publishedCount;
            this.stats.draftPosts = draftCount;
            
        } catch (error) {
            console.error('Error loading blog stats:', error);
        }
    }

    /**
     * Load product statistics
     * @param {Object} db - Firestore database instance
     */
    async loadProductStats(db) {
        try {
            const productsSnapshot = await db.collection('products').get();
            this.stats.totalProducts = productsSnapshot.size;
        } catch (error) {
            console.error('Error loading product stats:', error);
        }
    }

    /**
     * Load user statistics
     * @param {Object} db - Firestore database instance
     */
    async loadUserStats(db) {
        try {
            const usersSnapshot = await db.collection('users').get();
            this.stats.totalUsers = usersSnapshot.size;
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    /**
     * Load recent activity
     * @param {Object} db - Firestore database instance
     * @param {string} userRole - Current user role
     */
    async loadRecentActivity(db, userRole) {
        try {
            const activities = [];
            
            // Load recent blog posts
            if (this.authManager.hasPermission('blog.view')) {
                const recentBlogs = await db.collection('blogs')
                    .orderBy('updatedAt', 'desc')
                    .limit(5)
                    .get();
                
                recentBlogs.forEach(doc => {
                    const data = doc.data();
                    activities.push({
                        type: 'blog',
                        action: data.status === 'published' ? 'published' : 'updated',
                        title: data.title,
                        timestamp: data.updatedAt,
                        author: data.author?.name || 'Unknown'
                    });
                });
            }
            
            // Load recent user registrations (admin only)
            if (this.authManager.hasPermission('users.view')) {
                const recentUsers = await db.collection('users')
                    .orderBy('createdAt', 'desc')
                    .limit(3)
                    .get();
                
                recentUsers.forEach(doc => {
                    const data = doc.data();
                    activities.push({
                        type: 'user',
                        action: 'registered',
                        title: data.displayName || data.email,
                        timestamp: data.createdAt,
                        author: 'System'
                    });
                });
            }
            
            // Sort activities by timestamp
            activities.sort((a, b) => {
                const aTime = a.timestamp?.toDate?.() || new Date(0);
                const bTime = b.timestamp?.toDate?.() || new Date(0);
                return bTime - aTime;
            });
            
            this.stats.recentActivity = activities.slice(0, 10);
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    /**
     * Generate dashboard overview HTML
     * @returns {string} - Dashboard overview HTML
     */
    generateDashboardHTML() {
        const userRole = this.authManager.getCurrentUser().role;
        const user = this.authManager.getCurrentUser().user;
        const displayName = user.displayName || user.email.split('@')[0];
        
        return `
            <div class="space-y-6">
                <!-- Welcome Section -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <h1 class="text-2xl font-bold mb-2">Welcome back, ${displayName}!</h1>
                    <p class="text-blue-100">Here's what's happening with your content today.</p>
                </div>

                <!-- Stats Overview -->
                ${this.generateStatsSection(userRole)}

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Quick Actions -->
                    <div class="lg:col-span-1">
                        ${this.generateQuickActionsSection(userRole)}
                    </div>

                    <!-- Recent Activity -->
                    <div class="lg:col-span-2">
                        ${this.generateRecentActivitySection()}
                    </div>
                </div>

                <!-- Notifications Panel -->
                ${this.generateNotificationsSection()}
            </div>
        `;
    }

    /**
     * Generate stats section
     * @param {string} userRole - Current user role
     * @returns {string} - Stats section HTML
     */
    generateStatsSection(userRole) {
        const stats = [];
        
        if (this.authManager.hasPermission('blog.view')) {
            stats.push({
                title: 'Total Posts',
                value: this.stats.totalPosts,
                icon: '📝',
                color: 'blue',
                subtitle: `${this.stats.publishedPosts} published, ${this.stats.draftPosts} drafts`
            });
        }
        
        if (this.authManager.hasPermission('products.view')) {
            stats.push({
                title: 'Products',
                value: this.stats.totalProducts,
                icon: '🍄',
                color: 'green',
                subtitle: 'Mushroom varieties'
            });
        }
        
        if (this.authManager.hasPermission('users.view')) {
            stats.push({
                title: 'Users',
                value: this.stats.totalUsers,
                icon: '👥',
                color: 'purple',
                subtitle: 'Registered accounts'
            });
        }
        
        if (this.authManager.hasPermission('analytics.view')) {
            stats.push({
                title: 'This Month',
                value: this.stats.recentActivity.length,
                icon: '📈',
                color: 'orange',
                subtitle: 'Recent activities'
            });
        }
        
        if (stats.length === 0) {
            return '';
        }
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-4">
                ${stats.map(stat => `
                    <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div class="flex items-center">
                            <div class="text-2xl mr-4">${stat.icon}</div>
                            <div class="flex-1">
                                <div class="text-2xl font-bold text-gray-900">${stat.value}</div>
                                <div class="text-sm font-medium text-${stat.color}-600">${stat.title}</div>
                                <div class="text-xs text-gray-500 mt-1">${stat.subtitle}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate quick actions section
     * @param {string} userRole - Current user role
     * @returns {string} - Quick actions HTML
     */
    generateQuickActionsSection(userRole) {
        const actions = [];
        
        if (this.authManager.hasPermission('blog.create')) {
            actions.push({
                title: 'New Blog Post',
                description: 'Create a new article',
                icon: '✏️',
                action: 'create-blog',
                color: 'blue'
            });
        }
        
        if (this.authManager.hasPermission('products.create')) {
            actions.push({
                title: 'Add Product',
                description: 'Add new mushroom variety',
                icon: '🍄',
                action: 'create-product',
                color: 'green'
            });
        }
        
        if (this.authManager.hasPermission('users.manage')) {
            actions.push({
                title: 'Manage Users',
                description: 'View and edit user accounts',
                icon: '👥',
                action: 'manage-users',
                color: 'purple'
            });
        }
        
        if (this.authManager.hasPermission('analytics.view')) {
            actions.push({
                title: 'View Analytics',
                description: 'Check performance metrics',
                icon: '📊',
                action: 'view-analytics',
                color: 'orange'
            });
        }
        
        // Always show profile action
        actions.push({
            title: 'My Profile',
            description: 'Update your profile',
            icon: '👤',
            action: 'edit-profile',
            color: 'gray'
        });
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Quick Actions</h3>
                </div>
                <div class="space-y-3">
                    ${actions.map(action => `
                        <button onclick="window.cmsApp.dashboardManager.dashboardOverview.handleQuickAction('${action.action}')"
                                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors group">
                            <div class="flex items-center">
                                <div class="text-xl mr-3">${action.icon}</div>
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900 group-hover:text-${action.color}-700">${action.title}</div>
                                    <div class="text-sm text-gray-500">${action.description}</div>
                                </div>
                                <div class="text-gray-400 group-hover:text-${action.color}-500">→</div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate recent activity section
     * @returns {string} - Recent activity HTML
     */
    generateRecentActivitySection() {
        if (this.stats.recentActivity.length === 0) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Activity</h3>
                    </div>
                    <div class="text-center py-8">
                        <div class="text-4xl mb-2">📭</div>
                        <p class="text-gray-500">No recent activity to display</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Activity</h3>
                </div>
                <div class="space-y-4">
                    ${this.stats.recentActivity.map(activity => `
                        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <div class="text-lg">
                                ${activity.type === 'blog' ? '📝' : activity.type === 'user' ? '👤' : '📄'}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-gray-900">
                                    ${activity.title}
                                </div>
                                <div class="text-sm text-gray-500">
                                    ${activity.action} by ${activity.author}
                                </div>
                                <div class="text-xs text-gray-400 mt-1">
                                    ${this.formatTimestamp(activity.timestamp)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <button onclick="window.cmsApp.dashboardManager.navigateToPage('analytics')"
                            class="text-sm text-blue-600 hover:text-blue-800">
                        View all activity →
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generate notifications section
     * @returns {string} - Notifications HTML
     */
    generateNotificationsSection() {
        if (this.notifications.length === 0) {
            return '';
        }
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Notifications</h3>
                </div>
                <div class="space-y-3">
                    ${this.notifications.map(notification => `
                        <div class="flex items-start space-x-3 p-3 rounded-lg bg-${notification.type === 'warning' ? 'yellow' : notification.type === 'error' ? 'red' : 'blue'}-50 border border-${notification.type === 'warning' ? 'yellow' : notification.type === 'error' ? 'red' : 'blue'}-200">
                            <div class="text-lg">
                                ${notification.type === 'warning' ? '⚠️' : notification.type === 'error' ? '❌' : 'ℹ️'}
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">${notification.title}</div>
                                <div class="text-sm text-gray-600">${notification.message}</div>
                            </div>
                            <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Handle quick action clicks
     * @param {string} action - Action identifier
     */
    handleQuickAction(action) {
        switch (action) {
            case 'create-blog':
                window.cmsApp.dashboardManager.navigateToPage('blog');
                // Future: Open blog creation modal/form
                break;
            case 'create-product':
                window.cmsApp.dashboardManager.navigateToPage('products');
                // Future: Open product creation modal/form
                break;
            case 'manage-users':
                window.cmsApp.dashboardManager.navigateToPage('users');
                break;
            case 'view-analytics':
                window.cmsApp.dashboardManager.navigateToPage('analytics');
                break;
            case 'edit-profile':
                window.cmsApp.dashboardManager.navigateToPage('profile');
                break;
            default:
                console.log(`Quick action not implemented: ${action}`);
        }
    }

    /**
     * Setup notification system
     */
    setupNotificationSystem() {
        // Check for system notifications
        this.checkSystemHealth();
        this.checkPendingItems();
    }

    /**
     * Check system health and add notifications
     */
    checkSystemHealth() {
        // Placeholder for system health checks
        // This would check for things like:
        // - Failed uploads
        // - Database connection issues
        // - Pending approvals
        
        // Example notification (remove in production)
        if (this.authManager.hasPermission('settings.view')) {
            this.addNotification({
                type: 'info',
                title: 'System Status',
                message: 'All systems are running normally.'
            });
        }
    }

    /**
     * Check for pending items that need attention
     */
    checkPendingItems() {
        // This would check for:
        // - Draft posts that haven't been updated in a while
        // - Pending user approvals
        // - Comments awaiting moderation
        
        if (this.stats.draftPosts > 0 && this.authManager.hasPermission('blog.edit')) {
            this.addNotification({
                type: 'warning',
                title: 'Draft Posts',
                message: `You have ${this.stats.draftPosts} draft posts that could be published.`
            });
        }
    }

    /**
     * Add a notification
     * @param {Object} notification - Notification object
     */
    addNotification(notification) {
        this.notifications.push({
            id: Date.now(),
            timestamp: new Date(),
            ...notification
        });
        
        // Update notification count in header
        this.updateNotificationCount();
    }

    /**
     * Update notification count in header
     */
    updateNotificationCount() {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            const count = this.notifications.length;
            if (count > 0) {
                countElement.textContent = count > 99 ? '99+' : count.toString();
                countElement.classList.remove('hidden');
            } else {
                countElement.classList.add('hidden');
            }
        }
    }

    /**
     * Format timestamp for display
     * @param {Object} timestamp - Firestore timestamp
     * @returns {string} - Formatted timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        await this.loadDashboardData();
        
        // Re-render dashboard if currently visible
        const currentPage = window.cmsApp.dashboardManager.getCurrentPage();
        if (currentPage === 'dashboard') {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = this.generateDashboardHTML();
            }
        }
    }

    /**
     * Get current statistics
     * @returns {Object} - Current stats
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Get current notifications
     * @returns {Array} - Current notifications
     */
    getNotifications() {
        return [...this.notifications];
    }
}