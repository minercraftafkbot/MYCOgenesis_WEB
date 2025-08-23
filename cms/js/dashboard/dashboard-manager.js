import { DashboardOverview } from './dashboard-overview.js';

/**
 * Dashboard Manager - Handles main dashboard layout, navigation, and content routing
 * Requirements: 1.1, 3.2
 */
export class DashboardManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentPage = 'dashboard';
        this.mobileMenuOpen = false;
        this.dashboardOverview = null;
        this.blogPage = null;
        
        this.init();
    }

    /**
     * Initialize dashboard manager
     */
    init() {
        this.setupMobileNavigation();
        this.setupKeyboardNavigation();
        this.setupResponsiveHandling();
        
        // Listen for auth state changes
        this.authManager.addAuthStateListener((isAuthenticated, user, role) => {
            if (isAuthenticated) {
                this.setupEnhancedNavigation(role);
                this.setupUserInfoDisplay(user, role);
                
                // Initialize dashboard overview
                this.dashboardOverview = new DashboardOverview(this.authManager);
                
                this.navigateToPage('dashboard'); // Default to dashboard
            }
        });
    }

    /**
     * Setup enhanced navigation with role-based menu items
     * @param {string} userRole - Current user's role
     */
    setupEnhancedNavigation(userRole) {
        const navElement = document.getElementById('cms-nav');
        const navigationItems = this.authManager.roleManager.getNavigationItems(userRole);
        
        navElement.innerHTML = '';
        
        // Group navigation items by category
        const groupedItems = this.groupNavigationItems(navigationItems);
        
        Object.entries(groupedItems).forEach(([category, items]) => {
            // Add category header if there are multiple categories
            if (Object.keys(groupedItems).length > 1) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'cms-nav-section';
                categoryHeader.textContent = category;
                navElement.appendChild(categoryHeader);
            }
            
            // Add navigation items
            items.forEach(item => {
                const navItem = this.createNavigationItem(item);
                navElement.appendChild(navItem);
            });
        });
        
        // Add mobile menu toggle
        this.addMobileMenuToggle();
    }

    /**
     * Group navigation items by category
     * @param {Array} items - Navigation items
     * @returns {Object} - Grouped items
     */
    groupNavigationItems(items) {
        const groups = {
            'Main': [],
            'Content': [],
            'Management': [],
            'Settings': []
        };
        
        items.forEach(item => {
            switch (item.id) {
                case 'dashboard':
                    groups.Main.push(item);
                    break;
                case 'blog':
                case 'products':
                    groups.Content.push(item);
                    break;
                case 'users':
                case 'analytics':
                    groups.Management.push(item);
                    break;
                case 'settings':
                case 'profile':
                    groups.Settings.push(item);
                    break;
                default:
                    groups.Main.push(item);
            }
        });
        
        // Remove empty groups
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });
        
        return groups;
    }

    /**
     * Create a navigation item element
     * @param {Object} item - Navigation item data
     * @returns {HTMLElement} - Navigation item element
     */
    createNavigationItem(item) {
        const navItem = document.createElement('a');
        navItem.href = '#';
        navItem.className = 'cms-nav-item';
        navItem.dataset.page = item.id;
        navItem.setAttribute('role', 'menuitem');
        navItem.setAttribute('tabindex', '0');
        
        // Create item content with icon and label
        navItem.innerHTML = `
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
            <span class="nav-indicator" style="display: none;">→</span>
        `;
        
        // Add click handler
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToPage(item.id);
            this.closeMobileMenu();
        });
        
        // Add keyboard handler
        navItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToPage(item.id);
                this.closeMobileMenu();
            }
        });
        
        return navItem;
    }

    /**
     * Setup enhanced user info display with notifications
     * @param {Object} user - Firebase user object
     * @param {string} role - User role
     */
    setupUserInfoDisplay(user, role) {
        const userInfoElement = document.getElementById('user-info');
        const headerElement = document.querySelector('.dashboard-header');
        
        if (!userInfoElement || !headerElement) return;
        
        const displayName = user.displayName || user.email.split('@')[0];
        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
        
        // Enhanced user info with avatar and dropdown
        userInfoElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="user-avatar">
                    <img src="${user.photoURL || this.generateAvatarUrl(displayName)}" 
                         alt="${displayName}" 
                         class="w-8 h-8 rounded-full">
                </div>
                <div class="user-details">
                    <div class="text-sm font-medium text-gray-900">${displayName}</div>
                    <div class="text-xs text-gray-500">${roleDisplay}</div>
                </div>
                <div class="notification-bell">
                    <button id="notification-btn" class="relative p-2 text-gray-400 hover:text-gray-600">
                        <span class="sr-only">View notifications</span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        <span id="notification-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                    </button>
                </div>
            </div>
        `;
        
        this.setupNotificationSystem();
    }

    /**
     * Generate avatar URL for user
     * @param {string} name - User name
     * @returns {string} - Avatar URL
     */
    generateAvatarUrl(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=32`;
    }

    /**
     * Setup notification system
     */
    setupNotificationSystem() {
        const notificationBtn = document.getElementById('notification-btn');
        if (!notificationBtn) return;
        
        notificationBtn.addEventListener('click', () => {
            this.toggleNotificationPanel();
        });
        
        // Initialize notification count (placeholder for now)
        this.updateNotificationCount(0);
    }

    /**
     * Update notification count
     * @param {number} count - Number of notifications
     */
    updateNotificationCount(count) {
        const countElement = document.getElementById('notification-count');
        if (!countElement) return;
        
        if (count > 0) {
            countElement.textContent = count > 99 ? '99+' : count.toString();
            countElement.classList.remove('hidden');
        } else {
            countElement.classList.add('hidden');
        }
    }

    /**
     * Toggle notification panel
     */
    toggleNotificationPanel() {
        if (!this.dashboardOverview) return;
        
        const notifications = this.dashboardOverview.getNotifications();
        
        // Create or toggle notification dropdown
        let dropdown = document.getElementById('notification-dropdown');
        
        if (dropdown) {
            dropdown.remove();
            return;
        }
        
        dropdown = document.createElement('div');
        dropdown.id = 'notification-dropdown';
        dropdown.className = 'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50';
        
        if (notifications.length === 0) {
            dropdown.innerHTML = `
                <div class="p-4 text-center">
                    <div class="text-2xl mb-2">🔔</div>
                    <p class="text-gray-500 text-sm">No notifications</p>
                </div>
            `;
        } else {
            dropdown.innerHTML = `
                <div class="p-3 border-b border-gray-200">
                    <h3 class="font-medium text-gray-900">Notifications</h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                    ${notifications.map(notification => `
                        <div class="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <div class="flex items-start space-x-2">
                                <div class="text-sm">
                                    ${notification.type === 'warning' ? '⚠️' : notification.type === 'error' ? '❌' : 'ℹ️'}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-gray-900">${notification.title}</div>
                                    <div class="text-xs text-gray-500">${notification.message}</div>
                                    <div class="text-xs text-gray-400 mt-1">
                                        ${this.dashboardOverview.formatTimestamp(notification.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-3 border-t border-gray-200">
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="text-xs text-blue-600 hover:text-blue-800">
                        Clear all notifications
                    </button>
                </div>
            `;
        }
        
        // Position dropdown relative to notification button
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.parentElement.style.position = 'relative';
            notificationBtn.parentElement.appendChild(dropdown);
            
            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 100);
        }
    }

    /**
     * Navigate to a specific page with enhanced routing
     * @param {string} pageId - Page identifier
     */
    navigateToPage(pageId) {
        // Update URL hash for browser navigation
        window.location.hash = pageId;
        
        // Remove active class from all nav items
        document.querySelectorAll('.cms-nav-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.nav-indicator').style.display = 'none';
        });
        
        // Add active class to current nav item
        const currentNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
            currentNavItem.querySelector('.nav-indicator').style.display = 'inline';
        }
        
        // Update page title and breadcrumb
        this.updatePageHeader(pageId);
        
        // Load page content
        this.loadPageContent(pageId);
        
        // Update current page
        this.currentPage = pageId;
        
        // Close mobile menu if open
        this.closeMobileMenu();
    }

    /**
     * Update page header with title and breadcrumb
     * @param {string} pageId - Page identifier
     */
    updatePageHeader(pageId) {
        const pageTitle = document.getElementById('page-title');
        const userRole = this.authManager.getCurrentUser().role;
        const navItem = this.authManager.roleManager.getNavigationItems(userRole)
            .find(item => item.id === pageId);
        
        if (pageTitle && navItem) {
            pageTitle.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span>${navItem.icon}</span>
                    <span>${navItem.label}</span>
                </div>
            `;
        }
        
        // Add breadcrumb if not on dashboard
        if (pageId !== 'dashboard') {
            const breadcrumb = document.createElement('nav');
            breadcrumb.className = 'text-sm text-gray-500 mt-1';
            breadcrumb.innerHTML = `
                <a href="#" onclick="window.cmsApp.dashboardManager.navigateToPage('dashboard')" class="hover:text-gray-700">Dashboard</a>
                <span class="mx-2">›</span>
                <span class="text-gray-900">${navItem ? navItem.label : pageId}</span>
            `;
            
            // Remove existing breadcrumb
            const existingBreadcrumb = document.querySelector('.dashboard-breadcrumb');
            if (existingBreadcrumb) {
                existingBreadcrumb.remove();
            }
            
            breadcrumb.className += ' dashboard-breadcrumb';
            pageTitle.parentNode.appendChild(breadcrumb);
        } else {
            // Remove breadcrumb on dashboard
            const existingBreadcrumb = document.querySelector('.dashboard-breadcrumb');
            if (existingBreadcrumb) {
                existingBreadcrumb.remove();
            }
        }
    }

    /**
     * Load content for a specific page
     * @param {string} pageId - Page identifier
     */
    loadPageContent(pageId) {
        const mainContent = document.getElementById('main-content');
        
        // Show loading state
        mainContent.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="spinner"></div>
                <span class="ml-2 text-gray-600">Loading...</span>
            </div>
        `;
        
        // Simulate loading delay and load content
        setTimeout(() => {
            let content = this.getPageContent(pageId);
            mainContent.innerHTML = content;
            
            // Initialize page-specific functionality
            this.initializePageFeatures(pageId);
        }, 300);
    }

    /**
     * Get content for a specific page
     * @param {string} pageId - Page identifier
     * @returns {string} - HTML content
     */
    getPageContent(pageId) {
        switch (pageId) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'blog':
                return this.getBlogContent();
            default:
                return `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h3>
                        </div>
                        <div class="text-center py-12">
                            <div class="text-6xl mb-4">🚧</div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                            <p class="text-gray-600">This section will be implemented in upcoming tasks.</p>
                        </div>
                    </div>
                `;
        }
    }

    /**
     * Get dashboard content with overview widgets and quick actions
     * @returns {string} - Dashboard HTML content
     */
    getDashboardContent() {
        if (this.dashboardOverview) {
            return this.dashboardOverview.generateDashboardHTML();
        }
        
        // Fallback content if dashboard overview isn't ready
        return `
            <div class="space-y-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Loading Dashboard...</h3>
                    </div>
                    <div class="flex items-center justify-center py-12">
                        <div class="spinner"></div>
                        <span class="ml-2 text-gray-600">Loading dashboard data...</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get blog content
     * @returns {string} - Blog page HTML content
     */
    getBlogContent() {
        return `
            <div id="blog-page-container">
                <!-- Blog page will be initialized here -->
            </div>
        `;
    }

    /**
     * Initialize blog page
     */
    async initializeBlogPage() {
        try {
            // Dynamically import the BlogPage class
            const { BlogPage } = await import('../pages/blog-page.js');
            
            // Get blog manager from the main app
            const blogManager = window.cmsApp.getBlogManager();
            
            // Initialize blog page
            this.blogPage = new BlogPage('blog-page-container', blogManager, this.authManager);
            
        } catch (error) {
            console.error('Failed to initialize blog page:', error);
            document.getElementById('blog-page-container').innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Error Loading Blog Page</h3>
                    </div>
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">❌</div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to Load</h3>
                        <p class="text-gray-600 mb-4">There was an error loading the blog management page.</p>
                        <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Initialize page-specific features
     * @param {string} pageId - Page identifier
     */
    initializePageFeatures(pageId) {
        switch (pageId) {
            case 'dashboard':
                // Refresh dashboard data when navigating to dashboard
                if (this.dashboardOverview) {
                    this.dashboardOverview.refresh();
                }
                break;
            case 'blog':
                this.initializeBlogPage();
                break;
            default:
                // Other page features will be implemented in their respective tasks
                break;
        }
    }

    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        // Add mobile menu toggle button to header
        const header = document.querySelector('.dashboard-header .flex');
        if (!header) return;
        
        const mobileToggle = document.createElement('button');
        mobileToggle.id = 'mobile-menu-toggle';
        mobileToggle.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900';
        mobileToggle.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
        
        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        header.insertBefore(mobileToggle, header.firstChild);
    }

    /**
     * Add mobile menu toggle functionality
     */
    addMobileMenuToggle() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Add overlay for mobile
        const overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden';
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (!sidebar || !overlay) return;
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            sidebar.classList.add('open');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('open');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.mobileMenuOpen) return;
        
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
        
        document.body.style.overflow = '';
        this.mobileMenuOpen = false;
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC to close mobile menu
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Ctrl/Cmd + K for quick navigation (future feature)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Quick navigation will be implemented in future tasks
                console.log('Quick navigation shortcut - to be implemented');
            }
        });
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Handle browser back/forward navigation
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash && hash !== this.currentPage) {
                this.navigateToPage(hash);
            }
        });
        
        // Initialize from URL hash
        const initialHash = window.location.hash.slice(1);
        if (initialHash) {
            this.navigateToPage(initialHash);
        }
    }

    /**
     * Get current page
     * @returns {string} - Current page ID
     */
    getCurrentPage() {
        return this.currentPage;
    }
}