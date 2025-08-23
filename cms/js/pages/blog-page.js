/**
 * Blog Management Page
 * Combines blog post list and form for complete blog management
 */

import { BlogPostList } from '../components/blog-post-list.js';
import { BlogPostForm } from '../components/blog-post-form.js';

export class BlogPage {
    constructor(containerId, blogManager, authManager) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.blogManager = blogManager;
        this.authManager = authManager;
        this.blogPostList = null;
        this.blogPostForm = null;
        this.currentView = 'list'; // 'list' or 'form'
        this.editingPostId = null;

        this.init();
    }

    /**
     * Initialize the blog page
     */
    init() {
        if (!this.container) {
            console.error('Blog page container not found:', this.containerId);
            return;
        }

        this.createPageHTML();
        this.initializeComponents();
    }

    /**
     * Create the page HTML structure
     */
    createPageHTML() {
        this.container.innerHTML = `
            <div class="blog-page">
                <!-- Page Header -->
                <div class="page-header mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Blog Management</h1>
                            <p class="text-gray-600 mt-1">Create, edit, and manage your blog posts</p>
                        </div>
                        
                        <!-- View Toggle -->
                        <div class="flex items-center space-x-2">
                            <button id="back-to-list-btn" class="btn btn-outline hidden">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Blog Statistics -->
                <div id="blog-stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <!-- Stats will be loaded here -->
                </div>

                <!-- List View -->
                <div id="list-view" class="blog-list-container">
                    <!-- Blog post list will be initialized here -->
                </div>

                <!-- Form View -->
                <div id="form-view" class="blog-form-container hidden">
                    <!-- Blog post form will be initialized here -->
                </div>
            </div>
        `;
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        this.setupEventListeners();
        this.loadBlogStatistics();
        this.initializeBlogList();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Back to list button
        document.getElementById('back-to-list-btn').addEventListener('click', () => {
            this.showListView();
        });
    }

    /**
     * Load blog statistics
     */
    async loadBlogStatistics() {
        try {
            const stats = await this.blogManager.getStatistics();
            this.renderBlogStatistics(stats);
        } catch (error) {
            console.error('Failed to load blog statistics:', error);
        }
    }

    /**
     * Render blog statistics
     * @param {Object} stats - Blog statistics
     */
    renderBlogStatistics(stats) {
        const statsContainer = document.getElementById('blog-stats');
        
        const statCards = [
            {
                title: 'Total Posts',
                value: stats.total || 0,
                icon: '📝',
                color: 'blue'
            },
            {
                title: 'Published',
                value: stats.published || 0,
                icon: '🚀',
                color: 'green'
            },
            {
                title: 'Drafts',
                value: stats.drafts || 0,
                icon: '📄',
                color: 'yellow'
            },
            {
                title: 'Total Views',
                value: stats.totalViews || 0,
                icon: '👁️',
                color: 'purple'
            }
        ];

        statsContainer.innerHTML = statCards.map(stat => `
            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-${stat.color}-500">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <span class="text-2xl">${stat.icon}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-500">${stat.title}</div>
                        <div class="text-2xl font-bold text-gray-900">${stat.value.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize blog post list
     */
    initializeBlogList() {
        this.blogPostList = new BlogPostList('list-view', this.blogManager, {
            onNewPost: () => this.showFormView(),
            onEditPost: (postId) => this.showFormView(postId),
            onViewPost: (postId) => this.handleViewPost(postId),
            allowEdit: this.authManager.hasPermission('blog.edit'),
            allowDelete: this.authManager.hasPermission('blog.delete')
        });
    }

    /**
     * Initialize blog post form
     * @param {string} postId - Optional post ID for editing
     */
    initializeBlogForm(postId = null) {
        // Destroy existing form if it exists
        if (this.blogPostForm) {
            this.blogPostForm.destroy();
        }

        this.blogPostForm = new BlogPostForm('form-view', this.blogManager, {
            autoSave: true,
            redirectAfterCreate: false,
            onCancel: () => this.showListView()
        });

        // Load post for editing if postId is provided
        if (postId) {
            this.editingPostId = postId;
            this.blogPostForm.loadPost(postId);
        } else {
            this.editingPostId = null;
        }
    }

    /**
     * Show list view
     */
    showListView() {
        this.currentView = 'list';
        this.editingPostId = null;

        // Show/hide views
        document.getElementById('list-view').classList.remove('hidden');
        document.getElementById('form-view').classList.add('hidden');
        document.getElementById('back-to-list-btn').classList.add('hidden');

        // Update page title
        const pageTitle = document.querySelector('.page-header h1');
        if (pageTitle) {
            pageTitle.textContent = 'Blog Management';
        }

        // Refresh list and stats
        if (this.blogPostList) {
            this.blogPostList.refresh();
        }
        this.loadBlogStatistics();

        // Destroy form to free memory
        if (this.blogPostForm) {
            this.blogPostForm.destroy();
            this.blogPostForm = null;
        }
    }

    /**
     * Show form view
     * @param {string} postId - Optional post ID for editing
     */
    showFormView(postId = null) {
        this.currentView = 'form';

        // Show/hide views
        document.getElementById('list-view').classList.add('hidden');
        document.getElementById('form-view').classList.remove('hidden');
        document.getElementById('back-to-list-btn').classList.remove('hidden');

        // Update page title
        const pageTitle = document.querySelector('.page-header h1');
        if (pageTitle) {
            pageTitle.textContent = postId ? 'Edit Blog Post' : 'Create New Blog Post';
        }

        // Initialize form
        this.initializeBlogForm(postId);
    }

    /**
     * Handle view post action
     * @param {string} postId - Post ID to view
     */
    async handleViewPost(postId) {
        try {
            const post = await this.blogManager.getPost(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Create preview modal or new window
            this.showPostPreview(post);

        } catch (error) {
            console.error('Failed to view post:', error);
            alert('Failed to load post: ' + error.message);
        }
    }

    /**
     * Show post preview in a modal or new window
     * @param {BlogPost} post - Post to preview
     */
    showPostPreview(post) {
        // Create preview window
        const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
        
        if (!previewWindow) {
            alert('Please allow popups to view the post preview');
            return;
        }

        const previewHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview: ${post.title}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 2rem;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 2rem;
                        margin-bottom: 2rem;
                    }
                    .title {
                        font-size: 2.5rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        color: #1f2937;
                    }
                    .meta {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 1rem;
                        color: #6b7280;
                        font-size: 0.875rem;
                        margin-bottom: 1rem;
                    }
                    .meta-item {
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    }
                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 0.25rem 0.75rem;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 500;
                        text-transform: uppercase;
                    }
                    .status-published { background: #d1fae5; color: #065f46; }
                    .status-draft { background: #f3f4f6; color: #374151; }
                    .status-scheduled { background: #dbeafe; color: #1e40af; }
                    .featured-image {
                        width: 100%;
                        max-width: 100%;
                        height: auto;
                        border-radius: 0.5rem;
                        margin: 2rem 0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .excerpt {
                        font-size: 1.125rem;
                        color: #4b5563;
                        font-style: italic;
                        margin-bottom: 2rem;
                        padding: 1rem;
                        background: #f9fafb;
                        border-left: 4px solid #6366f1;
                        border-radius: 0.25rem;
                    }
                    .content {
                        font-size: 1rem;
                        line-height: 1.7;
                    }
                    .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        font-weight: 600;
                    }
                    .content h1 { font-size: 2rem; }
                    .content h2 { font-size: 1.5rem; }
                    .content h3 { font-size: 1.25rem; }
                    .content p { margin-bottom: 1rem; }
                    .content ul, .content ol { margin-bottom: 1rem; padding-left: 2rem; }
                    .content blockquote {
                        border-left: 4px solid #6366f1;
                        padding-left: 1rem;
                        margin: 1.5rem 0;
                        font-style: italic;
                        color: #4b5563;
                    }
                    .content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 0.375rem;
                        margin: 1rem 0;
                    }
                    .tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-top: 2rem;
                        padding-top: 2rem;
                        border-top: 1px solid #e5e7eb;
                    }
                    .tag {
                        display: inline-flex;
                        align-items: center;
                        padding: 0.25rem 0.75rem;
                        background: #f3f4f6;
                        color: #374151;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 500;
                    }
                    .preview-notice {
                        background: #fef3c7;
                        color: #92400e;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        margin-bottom: 2rem;
                        text-align: center;
                        font-weight: 500;
                    }
                </style>
            </head>
            <body>
                <div class="preview-notice">
                    📋 This is a preview of your blog post
                </div>
                
                <article>
                    <header class="header">
                        <h1 class="title">${post.title}</h1>
                        
                        <div class="meta">
                            <div class="meta-item">
                                <span>📅</span>
                                <span>${this.formatDate(post.updatedAt || post.createdAt)}</span>
                            </div>
                            <div class="meta-item">
                                <span>👤</span>
                                <span>${post.author.name || post.author.email}</span>
                            </div>
                            ${post.category ? `
                                <div class="meta-item">
                                    <span>📂</span>
                                    <span>${post.category}</span>
                                </div>
                            ` : ''}
                            <div class="meta-item">
                                <span>👁️</span>
                                <span>${post.viewCount || 0} views</span>
                            </div>
                            <div class="meta-item">
                                <span class="status-badge status-${post.status}">${post.getDisplayStatus()}</span>
                            </div>
                        </div>
                    </header>

                    ${post.featuredImage && post.featuredImage.url ? `
                        <img src="${post.featuredImage.url}" 
                             alt="${post.featuredImage.alt || post.title}" 
                             class="featured-image">
                        ${post.featuredImage.caption ? `<p class="text-center text-sm text-gray-600 -mt-4 mb-4">${post.featuredImage.caption}</p>` : ''}
                    ` : ''}

                    ${post.excerpt ? `
                        <div class="excerpt">
                            ${post.excerpt}
                        </div>
                    ` : ''}

                    <div class="content">
                        ${post.content}
                    </div>

                    ${post.tags && post.tags.length > 0 ? `
                        <div class="tags">
                            ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </article>
            </body>
            </html>
        `;

        previewWindow.document.write(previewHTML);
        previewWindow.document.close();
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get current view
     * @returns {string} - Current view ('list' or 'form')
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Get editing post ID
     * @returns {string|null} - Currently editing post ID
     */
    getEditingPostId() {
        return this.editingPostId;
    }

    /**
     * Refresh the page data
     */
    refresh() {
        if (this.currentView === 'list') {
            this.loadBlogStatistics();
            if (this.blogPostList) {
                this.blogPostList.refresh();
            }
        }
    }

    /**
     * Destroy the page
     */
    destroy() {
        if (this.blogPostList) {
            this.blogPostList.destroy();
        }
        if (this.blogPostForm) {
            this.blogPostForm.destroy();
        }
        this.container.innerHTML = '';
    }
}