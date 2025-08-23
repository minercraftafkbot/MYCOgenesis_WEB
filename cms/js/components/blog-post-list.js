/**
 * Blog Post List Component
 * Handles blog post listing with search, filter, and pagination
 */

export class BlogPostList {
    constructor(containerId, blogManager, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.blogManager = blogManager;
        this.posts = [];
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.totalPosts = 0;
        this.hasMore = false;
        this.lastDoc = null;
        this.currentFilters = {};
        this.searchTerm = '';
        
        // Default options
        this.options = {
            showSearch: true,
            showFilters: true,
            showPagination: true,
            showActions: true,
            allowEdit: true,
            allowDelete: true,
            ...options
        };

        this.init();
    }

    /**
     * Initialize the blog post list
     */
    init() {
        if (!this.container) {
            console.error('Blog post list container not found:', this.containerId);
            return;
        }

        this.createListHTML();
        this.setupEventListeners();
        this.loadPosts();
    }

    /**
     * Create the list HTML structure
     */
    createListHTML() {
        this.container.innerHTML = `
            <div class="blog-post-list">
                <!-- Header with search and filters -->
                <div class="list-header">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div class="flex items-center gap-4">
                            <h2 class="text-xl font-semibold text-gray-900">Blog Posts</h2>
                            <span id="post-count" class="text-sm text-gray-500"></span>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <button id="refresh-btn" class="btn btn-outline btn-sm">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Refresh
                            </button>
                            <button id="new-post-btn" class="btn btn-primary btn-sm">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                New Post
                            </button>
                        </div>
                    </div>

                    <!-- Search and filters -->
                    <div class="search-filters-section" ${!this.options.showSearch && !this.options.showFilters ? 'style="display: none;"' : ''}>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <!-- Search -->
                            <div class="md:col-span-2" ${!this.options.showSearch ? 'style="display: none;"' : ''}>
                                <div class="relative">
                                    <input type="text" id="search-input" placeholder="Search posts..." 
                                           class="form-input pl-10 pr-4">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <button id="clear-search" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hidden">
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Status filter -->
                            <div ${!this.options.showFilters ? 'style="display: none;"' : ''}>
                                <select id="status-filter" class="form-select">
                                    <option value="">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <!-- Category filter -->
                            <div ${!this.options.showFilters ? 'style="display: none;"' : ''}>
                                <select id="category-filter" class="form-select">
                                    <option value="">All Categories</option>
                                </select>
                            </div>
                        </div>

                        <!-- Active filters -->
                        <div id="active-filters" class="flex flex-wrap gap-2 mb-4 hidden">
                            <!-- Active filter tags will be inserted here -->
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div id="loading-state" class="text-center py-8 hidden">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-gray-600">Loading posts...</p>
                </div>

                <!-- Empty state -->
                <div id="empty-state" class="text-center py-12 hidden">
                    <div class="text-6xl mb-4">📝</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p class="text-gray-600 mb-4">Get started by creating your first blog post.</p>
                    <button id="empty-new-post-btn" class="btn btn-primary">Create New Post</button>
                </div>

                <!-- Posts table -->
                <div id="posts-table-container" class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button id="sort-title" class="flex items-center hover:text-gray-700">
                                        Title
                                        <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                        </svg>
                                    </button>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Author
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button id="sort-date" class="flex items-center hover:text-gray-700">
                                        Date
                                        <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                        </svg>
                                    </button>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Views
                                </th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" ${!this.options.showActions ? 'style="display: none;"' : ''}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody id="posts-tbody" class="bg-white divide-y divide-gray-200">
                            <!-- Posts will be inserted here -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div id="pagination-container" class="flex items-center justify-between mt-6" ${!this.options.showPagination ? 'style="display: none;"' : ''}>
                    <div class="text-sm text-gray-700">
                        Showing <span id="showing-from">0</span> to <span id="showing-to">0</span> of <span id="total-count">0</span> posts
                    </div>
                    <div class="flex items-center space-x-2">
                        <button id="prev-page" class="btn btn-outline btn-sm" disabled>
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Previous
                        </button>
                        <span id="page-info" class="text-sm text-gray-600"></span>
                        <button id="next-page" class="btn btn-outline btn-sm" disabled>
                            Next
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search');
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const value = e.target.value.trim();
            
            if (value) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            
            searchTimeout = setTimeout(() => {
                this.searchTerm = value;
                this.currentPage = 1;
                this.loadPosts();
            }, 300);
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            this.searchTerm = '';
            this.currentPage = 1;
            this.loadPosts();
        });

        // Filter functionality
        const statusFilter = document.getElementById('status-filter');
        const categoryFilter = document.getElementById('category-filter');

        statusFilter.addEventListener('change', () => {
            this.currentFilters.status = statusFilter.value || null;
            this.currentPage = 1;
            this.updateActiveFilters();
            this.loadPosts();
        });

        categoryFilter.addEventListener('change', () => {
            this.currentFilters.category = categoryFilter.value || null;
            this.currentPage = 1;
            this.updateActiveFilters();
            this.loadPosts();
        });

        // Button handlers
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadPosts();
        });

        document.getElementById('new-post-btn').addEventListener('click', () => {
            this.handleNewPost();
        });

        document.getElementById('empty-new-post-btn').addEventListener('click', () => {
            this.handleNewPost();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadPosts();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (this.hasMore) {
                this.currentPage++;
                this.loadPosts();
            }
        });

        // Sorting (placeholder for now)
        document.getElementById('sort-title').addEventListener('click', () => {
            // TODO: Implement sorting
            console.log('Sort by title');
        });

        document.getElementById('sort-date').addEventListener('click', () => {
            // TODO: Implement sorting
            console.log('Sort by date');
        });

        // Load categories for filter
        this.loadCategories();
    }

    /**
     * Load categories for filter dropdown
     */
    async loadCategories() {
        try {
            const categories = await this.blogManager.getCategories();
            const categoryFilter = document.getElementById('category-filter');
            
            // Clear existing options (except the first one)
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
            
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    /**
     * Load posts with current filters and pagination
     */
    async loadPosts() {
        try {
            this.showLoading();

            const options = {
                limit: this.postsPerPage,
                startAfter: this.currentPage > 1 ? this.lastDoc : null,
                searchTerm: this.searchTerm || null,
                ...this.currentFilters
            };

            const result = await this.blogManager.getPosts(options);
            
            this.posts = result.posts;
            this.hasMore = result.hasMore;
            this.lastDoc = result.lastDoc;

            this.renderPosts();
            this.updatePagination();
            this.updatePostCount();

        } catch (error) {
            console.error('Failed to load posts:', error);
            this.showError('Failed to load posts: ' + error.message);
        }
    }

    /**
     * Render posts in the table
     */
    renderPosts() {
        const tbody = document.getElementById('posts-tbody');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');
        const tableContainer = document.getElementById('posts-table-container');

        loadingState.classList.add('hidden');

        if (this.posts.length === 0) {
            emptyState.classList.remove('hidden');
            tableContainer.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tableContainer.classList.remove('hidden');

        tbody.innerHTML = this.posts.map(post => this.renderPostRow(post)).join('');

        // Add event listeners to action buttons
        this.setupPostActionListeners();
    }

    /**
     * Render a single post row
     * @param {BlogPost} post - Post to render
     * @returns {string} - HTML for post row
     */
    renderPostRow(post) {
        const statusBadge = this.getStatusBadge(post.status);
        const formattedDate = this.formatDate(post.updatedAt || post.createdAt);
        const excerpt = post.excerpt || 'No excerpt available';
        
        return `
            <tr class="hover:bg-gray-50" data-post-id="${post.id}">
                <td class="px-6 py-4">
                    <div class="flex items-start">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center">
                                <h3 class="text-sm font-medium text-gray-900 truncate">
                                    ${post.title}
                                </h3>
                                ${post.featured ? '<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Featured</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-500 truncate mt-1" title="${excerpt}">
                                ${excerpt.length > 60 ? excerpt.substring(0, 60) + '...' : excerpt}
                            </p>
                            ${post.tags.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${post.tags.slice(0, 3).map(tag => `
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            ${tag}
                                        </span>
                                    `).join('')}
                                    ${post.tags.length > 3 ? `<span class="text-xs text-gray-500">+${post.tags.length - 3} more</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${post.category || 'Uncategorized'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${post.author.name || post.author.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                        <div>${formattedDate}</div>
                        ${post.status === 'scheduled' && post.scheduledFor ? `
                            <div class="text-xs text-blue-600">
                                Scheduled: ${this.formatDate(post.scheduledFor)}
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${post.viewCount || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" ${!this.options.showActions ? 'style="display: none;"' : ''}>
                    <div class="flex items-center justify-end space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-900 view-post-btn" data-post-id="${post.id}" title="View">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        ${this.options.allowEdit ? `
                            <button class="text-blue-600 hover:text-blue-900 edit-post-btn" data-post-id="${post.id}" title="Edit">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                        ` : ''}
                        <div class="relative">
                            <button class="text-gray-600 hover:text-gray-900 more-actions-btn" data-post-id="${post.id}" title="More actions">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Setup event listeners for post action buttons
     */
    setupPostActionListeners() {
        // View post buttons
        document.querySelectorAll('.view-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.handleViewPost(postId);
            });
        });

        // Edit post buttons
        document.querySelectorAll('.edit-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.handleEditPost(postId);
            });
        });

        // More actions buttons
        document.querySelectorAll('.more-actions-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.showMoreActionsMenu(e.currentTarget, postId);
            });
        });
    }

    /**
     * Get status badge HTML
     * @param {string} status - Post status
     * @returns {string} - Status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            published: '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>',
            draft: '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>',
            scheduled: '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>',
            archived: '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Archived</span>'
        };
        
        return badges[status] || badges.draft;
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Update active filters display
     */
    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        const filters = [];

        if (this.searchTerm) {
            filters.push({ type: 'search', label: `Search: "${this.searchTerm}"`, value: this.searchTerm });
        }

        if (this.currentFilters.status) {
            filters.push({ type: 'status', label: `Status: ${this.currentFilters.status}`, value: this.currentFilters.status });
        }

        if (this.currentFilters.category) {
            filters.push({ type: 'category', label: `Category: ${this.currentFilters.category}`, value: this.currentFilters.category });
        }

        if (filters.length === 0) {
            activeFiltersContainer.classList.add('hidden');
            return;
        }

        activeFiltersContainer.classList.remove('hidden');
        activeFiltersContainer.innerHTML = filters.map(filter => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                ${filter.label}
                <button class="ml-2 text-blue-600 hover:text-blue-800 remove-filter-btn" 
                        data-filter-type="${filter.type}" data-filter-value="${filter.value}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </span>
        `).join('');

        // Add event listeners to remove filter buttons
        document.querySelectorAll('.remove-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.currentTarget.dataset.filterType;
                this.removeFilter(filterType);
            });
        });
    }

    /**
     * Remove a filter
     * @param {string} filterType - Type of filter to remove
     */
    removeFilter(filterType) {
        switch (filterType) {
            case 'search':
                document.getElementById('search-input').value = '';
                document.getElementById('clear-search').classList.add('hidden');
                this.searchTerm = '';
                break;
            case 'status':
                document.getElementById('status-filter').value = '';
                delete this.currentFilters.status;
                break;
            case 'category':
                document.getElementById('category-filter').value = '';
                delete this.currentFilters.category;
                break;
        }

        this.currentPage = 1;
        this.updateActiveFilters();
        this.loadPosts();
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = !this.hasMore;

        pageInfo.textContent = `Page ${this.currentPage}`;

        // Update showing counts
        const showingFrom = (this.currentPage - 1) * this.postsPerPage + 1;
        const showingTo = Math.min(this.currentPage * this.postsPerPage, showingFrom + this.posts.length - 1);

        document.getElementById('showing-from').textContent = this.posts.length > 0 ? showingFrom : 0;
        document.getElementById('showing-to').textContent = this.posts.length > 0 ? showingTo : 0;
    }

    /**
     * Update post count display
     */
    updatePostCount() {
        const postCount = document.getElementById('post-count');
        const totalCount = document.getElementById('total-count');
        
        const count = this.posts.length;
        postCount.textContent = `${count} post${count !== 1 ? 's' : ''}`;
        totalCount.textContent = count; // This would need to be actual total from server
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('posts-table-container').classList.add('hidden');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error(message);
        // TODO: Implement proper error display
        alert(message);
    }

    /**
     * Handle new post action
     */
    handleNewPost() {
        if (this.options.onNewPost && typeof this.options.onNewPost === 'function') {
            this.options.onNewPost();
        } else {
            console.log('New post action - to be implemented');
        }
    }

    /**
     * Handle view post action
     * @param {string} postId - Post ID
     */
    handleViewPost(postId) {
        if (this.options.onViewPost && typeof this.options.onViewPost === 'function') {
            this.options.onViewPost(postId);
        } else {
            console.log('View post:', postId);
        }
    }

    /**
     * Handle edit post action
     * @param {string} postId - Post ID
     */
    handleEditPost(postId) {
        if (this.options.onEditPost && typeof this.options.onEditPost === 'function') {
            this.options.onEditPost(postId);
        } else {
            console.log('Edit post:', postId);
        }
    }

    /**
     * Show more actions menu
     * @param {HTMLElement} button - Button that triggered the menu
     * @param {string} postId - Post ID
     */
    showMoreActionsMenu(button, postId) {
        // Remove any existing menus
        document.querySelectorAll('.more-actions-menu').forEach(menu => menu.remove());

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const menu = document.createElement('div');
        menu.className = 'more-actions-menu absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10';
        
        const actions = [];

        // Status actions
        if (post.status === 'draft') {
            actions.push({ label: 'Publish', action: 'publish', icon: '🚀' });
        }
        
        if (post.status === 'published') {
            actions.push({ label: 'Unpublish', action: 'unpublish', icon: '📝' });
        }

        actions.push({ label: 'Duplicate', action: 'duplicate', icon: '📋' });
        actions.push({ label: 'Archive', action: 'archive', icon: '📦' });
        
        if (this.options.allowDelete) {
            actions.push({ label: 'Delete', action: 'delete', icon: '🗑️', danger: true });
        }

        menu.innerHTML = actions.map(action => `
            <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${action.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}"
                    data-action="${action.action}" data-post-id="${postId}">
                <span class="mr-2">${action.icon}</span>
                ${action.label}
            </button>
        `).join('');

        button.parentElement.appendChild(menu);

        // Add event listeners
        menu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const postId = e.currentTarget.dataset.postId;
                this.handlePostAction(action, postId);
                menu.remove();
            });
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !button.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * Handle post actions from more actions menu
     * @param {string} action - Action to perform
     * @param {string} postId - Post ID
     */
    async handlePostAction(action, postId) {
        try {
            switch (action) {
                case 'publish':
                    await this.blogManager.publishPost(postId);
                    this.loadPosts();
                    break;
                case 'unpublish':
                    // Convert to draft
                    const post = await this.blogManager.getPost(postId);
                    post.status = 'draft';
                    await this.blogManager.updatePost(postId, post);
                    this.loadPosts();
                    break;
                case 'archive':
                    await this.blogManager.archivePost(postId);
                    this.loadPosts();
                    break;
                case 'duplicate':
                    // TODO: Implement duplicate functionality
                    console.log('Duplicate post:', postId);
                    break;
                case 'delete':
                    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                        await this.blogManager.deletePost(postId);
                        this.loadPosts();
                    }
                    break;
            }
        } catch (error) {
            console.error('Action failed:', error);
            this.showError('Action failed: ' + error.message);
        }
    }

    /**
     * Refresh the post list
     */
    refresh() {
        this.currentPage = 1;
        this.loadPosts();
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.container.innerHTML = '';
    }
}