/**
 * Blog Post Form Component
 * Handles blog post creation and editing with rich text editor and SEO fields
 */

import { RichTextEditor } from './rich-text-editor.js';
import { BlogPost } from '../models/blog-post.js';
import { ValidationUtils } from '../utils/validation.js';

export class BlogPostForm {
    constructor(containerId, blogManager, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.blogManager = blogManager;
        this.richTextEditor = null;
        this.currentPost = null;
        this.isEditing = false;
        
        // Default options
        this.options = {
            autoSave: true,
            autoSaveInterval: 30000,
            showPreview: true,
            showSEO: true,
            showScheduling: true,
            ...options
        };

        this.init();
    }

    /**
     * Initialize the blog post form
     */
    init() {
        if (!this.container) {
            console.error('Blog post form container not found:', this.containerId);
            return;
        }

        this.createFormHTML();
        this.initializeRichTextEditor();
        this.setupEventListeners();
        this.loadCategories();
    }

    /**
     * Create the form HTML structure
     */
    createFormHTML() {
        this.container.innerHTML = `
            <div class="blog-post-form">
                <form id="${this.containerId}-form" class="space-y-6">
                    <!-- Basic Information -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Post Information</h3>
                        </div>
                        <div class="card-body space-y-4">
                            <div>
                                <label for="post-title" class="form-label">Title *</label>
                                <input type="text" id="post-title" name="title" class="form-input" 
                                       placeholder="Enter post title" required>
                                <div class="form-help">This will be the main heading of your blog post</div>
                            </div>
                            
                            <div>
                                <label for="post-slug" class="form-label">URL Slug</label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        /blog/
                                    </span>
                                    <input type="text" id="post-slug" name="slug" class="form-input rounded-l-none" 
                                           placeholder="auto-generated-from-title">
                                </div>
                                <div class="form-help">Leave empty to auto-generate from title</div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="post-category" class="form-label">Category</label>
                                    <select id="post-category" name="category" class="form-select">
                                        <option value="">Select category</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label for="post-status" class="form-label">Status</label>
                                    <select id="post-status" name="status" class="form-select">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="scheduling-section" class="hidden">
                                <label for="scheduled-date" class="form-label">Scheduled Publication Date</label>
                                <input type="datetime-local" id="scheduled-date" name="scheduledFor" class="form-input">
                                <div class="form-help">Post will be automatically published at this date and time</div>
                            </div>
                            
                            <div>
                                <label for="post-tags" class="form-label">Tags</label>
                                <input type="text" id="post-tags" name="tags" class="form-input" 
                                       placeholder="Enter tags separated by commas">
                                <div class="form-help">Separate multiple tags with commas (max 10 tags)</div>
                            </div>
                            
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="post-featured" name="featured" class="form-checkbox">
                                    <span class="ml-2">Featured Post</span>
                                </label>
                                <div class="form-help">Featured posts appear prominently on the blog homepage</div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Editor -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Content</h3>
                        </div>
                        <div class="card-body">
                            <div id="${this.containerId}-editor" class="min-h-96">
                                <!-- Rich text editor will be initialized here -->
                            </div>
                        </div>
                    </div>

                    <!-- Excerpt -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Excerpt</h3>
                        </div>
                        <div class="card-body">
                            <textarea id="post-excerpt" name="excerpt" rows="3" class="form-textarea" 
                                      placeholder="Brief description of the post (leave empty to auto-generate)"></textarea>
                            <div class="form-help">This appears in post previews and search results</div>
                        </div>
                    </div>

                    <!-- Featured Image -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Featured Image</h3>
                        </div>
                        <div class="card-body space-y-4">
                            <div>
                                <label for="featured-image-url" class="form-label">Image URL</label>
                                <input type="url" id="featured-image-url" name="featuredImageUrl" class="form-input" 
                                       placeholder="https://example.com/image.jpg">
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="featured-image-alt" class="form-label">Alt Text</label>
                                    <input type="text" id="featured-image-alt" name="featuredImageAlt" class="form-input" 
                                           placeholder="Describe the image">
                                </div>
                                
                                <div>
                                    <label for="featured-image-caption" class="form-label">Caption</label>
                                    <input type="text" id="featured-image-caption" name="featuredImageCaption" class="form-input" 
                                           placeholder="Optional image caption">
                                </div>
                            </div>
                            
                            <div id="featured-image-preview" class="hidden">
                                <img id="featured-image-preview-img" src="" alt="" class="max-w-xs rounded-lg shadow-md">
                            </div>
                        </div>
                    </div>

                    <!-- SEO Settings -->
                    <div class="card" id="seo-section">
                        <div class="card-header">
                            <h3 class="card-title">SEO Settings</h3>
                        </div>
                        <div class="card-body space-y-4">
                            <div>
                                <label for="seo-title" class="form-label">Meta Title</label>
                                <input type="text" id="seo-title" name="seoTitle" class="form-input" 
                                       placeholder="Leave empty to use post title" maxlength="60">
                                <div class="form-help">
                                    <span id="seo-title-count">0</span>/60 characters (optimal: 50-60)
                                </div>
                            </div>
                            
                            <div>
                                <label for="seo-description" class="form-label">Meta Description</label>
                                <textarea id="seo-description" name="seoDescription" rows="2" class="form-textarea" 
                                          placeholder="Brief description for search engines" maxlength="160"></textarea>
                                <div class="form-help">
                                    <span id="seo-description-count">0</span>/160 characters (optimal: 150-160)
                                </div>
                            </div>
                            
                            <div>
                                <label for="seo-keywords" class="form-label">SEO Keywords</label>
                                <input type="text" id="seo-keywords" name="seoKeywords" class="form-input" 
                                       placeholder="Enter keywords separated by commas">
                                <div class="form-help">Separate multiple keywords with commas (max 10 keywords)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3">
                            <button type="button" id="save-draft-btn" class="btn btn-secondary">
                                Save Draft
                            </button>
                            <button type="button" id="preview-btn" class="btn btn-outline">
                                Preview
                            </button>
                        </div>
                        
                        <div class="flex gap-3">
                            <button type="button" id="cancel-btn" class="btn btn-outline">
                                Cancel
                            </button>
                            <button type="submit" id="publish-btn" class="btn btn-primary">
                                Publish
                            </button>
                        </div>
                    </div>
                </form>
                
                <!-- Auto-save status -->
                <div id="autosave-status" class="mt-2 text-sm text-gray-500"></div>
            </div>
        `;
    }

    /**
     * Initialize the rich text editor
     */
    initializeRichTextEditor() {
        this.richTextEditor = new RichTextEditor(`${this.containerId}-editor`, {
            autoSave: this.options.autoSave,
            autoSaveInterval: this.options.autoSaveInterval,
            onAutoSave: (content) => {
                this.handleAutoSave(content);
            }
        });

        // Set up image upload handler if blog manager supports it
        if (this.blogManager && typeof this.blogManager.uploadImage === 'function') {
            this.richTextEditor.setImageUploadHandler((file) => {
                return this.blogManager.uploadImage(file);
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const form = document.getElementById(`${this.containerId}-form`);
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Title to slug generation
        const titleInput = document.getElementById('post-title');
        const slugInput = document.getElementById('post-slug');
        
        titleInput.addEventListener('input', () => {
            if (!slugInput.value || slugInput.dataset.autoGenerated === 'true') {
                const slug = BlogPost.generateSlug(titleInput.value);
                slugInput.value = slug;
                slugInput.dataset.autoGenerated = 'true';
            }
        });

        slugInput.addEventListener('input', () => {
            slugInput.dataset.autoGenerated = 'false';
        });

        // Status change handling
        const statusSelect = document.getElementById('post-status');
        const schedulingSection = document.getElementById('scheduling-section');
        
        statusSelect.addEventListener('change', () => {
            if (statusSelect.value === 'scheduled') {
                schedulingSection.classList.remove('hidden');
            } else {
                schedulingSection.classList.add('hidden');
            }
        });

        // Featured image preview
        const imageUrlInput = document.getElementById('featured-image-url');
        const imagePreview = document.getElementById('featured-image-preview');
        const imagePreviewImg = document.getElementById('featured-image-preview-img');
        
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            if (url && ValidationUtils.isValidURL(url)) {
                imagePreviewImg.src = url;
                imagePreview.classList.remove('hidden');
            } else {
                imagePreview.classList.add('hidden');
            }
        });

        // SEO character counters
        this.setupSEOCounters();

        // Button handlers
        document.getElementById('save-draft-btn').addEventListener('click', () => {
            this.saveDraft();
        });

        document.getElementById('preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.handleCancel();
        });
    }

    /**
     * Setup SEO character counters
     */
    setupSEOCounters() {
        const seoTitleInput = document.getElementById('seo-title');
        const seoTitleCount = document.getElementById('seo-title-count');
        const seoDescInput = document.getElementById('seo-description');
        const seoDescCount = document.getElementById('seo-description-count');

        seoTitleInput.addEventListener('input', () => {
            const count = seoTitleInput.value.length;
            seoTitleCount.textContent = count;
            seoTitleCount.className = count > 60 ? 'text-red-600' : count > 50 ? 'text-yellow-600' : 'text-green-600';
        });

        seoDescInput.addEventListener('input', () => {
            const count = seoDescInput.value.length;
            seoDescCount.textContent = count;
            seoDescCount.className = count > 160 ? 'text-red-600' : count > 150 ? 'text-yellow-600' : 'text-green-600';
        });
    }

    /**
     * Load categories from blog manager
     */
    async loadCategories() {
        try {
            const categories = await this.blogManager.getCategories();
            const categorySelect = document.getElementById('post-category');
            
            // Clear existing options (except the first one)
            categorySelect.innerHTML = '<option value="">Select category</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    /**
     * Load post data for editing
     * @param {string} postId - Post ID to load
     */
    async loadPost(postId) {
        try {
            this.currentPost = await this.blogManager.getPost(postId);
            if (!this.currentPost) {
                throw new Error('Post not found');
            }

            this.isEditing = true;
            this.populateForm(this.currentPost);
            
        } catch (error) {
            console.error('Failed to load post:', error);
            this.showError('Failed to load post: ' + error.message);
        }
    }

    /**
     * Populate form with post data
     * @param {BlogPost} post - Post data
     */
    populateForm(post) {
        // Basic information
        document.getElementById('post-title').value = post.title || '';
        document.getElementById('post-slug').value = post.slug || '';
        document.getElementById('post-category').value = post.category || '';
        document.getElementById('post-status').value = post.status || 'draft';
        document.getElementById('post-tags').value = post.tags.join(', ');
        document.getElementById('post-featured').checked = post.featured || false;

        // Scheduling
        if (post.scheduledFor) {
            const date = new Date(post.scheduledFor);
            document.getElementById('scheduled-date').value = date.toISOString().slice(0, 16);
            document.getElementById('scheduling-section').classList.remove('hidden');
        }

        // Content
        if (post.content) {
            this.richTextEditor.setContent(post.content);
        }

        // Excerpt
        document.getElementById('post-excerpt').value = post.excerpt || '';

        // Featured image
        if (post.featuredImage) {
            document.getElementById('featured-image-url').value = post.featuredImage.url || '';
            document.getElementById('featured-image-alt').value = post.featuredImage.alt || '';
            document.getElementById('featured-image-caption').value = post.featuredImage.caption || '';
            
            if (post.featuredImage.url) {
                document.getElementById('featured-image-preview-img').src = post.featuredImage.url;
                document.getElementById('featured-image-preview').classList.remove('hidden');
            }
        }

        // SEO
        if (post.seo) {
            document.getElementById('seo-title').value = post.seo.metaTitle || '';
            document.getElementById('seo-description').value = post.seo.metaDescription || '';
            document.getElementById('seo-keywords').value = post.seo.keywords.join(', ');
        }

        // Update character counters
        this.updateSEOCounters();
    }

    /**
     * Update SEO character counters
     */
    updateSEOCounters() {
        const seoTitleInput = document.getElementById('seo-title');
        const seoDescInput = document.getElementById('seo-description');
        
        seoTitleInput.dispatchEvent(new Event('input'));
        seoDescInput.dispatchEvent(new Event('input'));
    }

    /**
     * Get form data as BlogPost object
     * @returns {Object} - Form data
     */
    getFormData() {
        const formData = new FormData(document.getElementById(`${this.containerId}-form`));
        
        // Parse tags
        const tagsString = formData.get('tags') || '';
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

        // Parse SEO keywords
        const keywordsString = formData.get('seoKeywords') || '';
        const keywords = keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);

        return {
            title: formData.get('title'),
            slug: formData.get('slug'),
            content: this.richTextEditor.getContent(),
            excerpt: formData.get('excerpt'),
            category: formData.get('category'),
            tags: tags,
            status: formData.get('status'),
            scheduledFor: formData.get('scheduledFor') ? new Date(formData.get('scheduledFor')) : null,
            featured: formData.has('featured'),
            featuredImage: {
                url: formData.get('featuredImageUrl') || '',
                alt: formData.get('featuredImageAlt') || '',
                caption: formData.get('featuredImageCaption') || ''
            },
            seo: {
                metaTitle: formData.get('seoTitle') || '',
                metaDescription: formData.get('seoDescription') || '',
                keywords: keywords
            }
        };
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        try {
            const formData = this.getFormData();
            
            // Validate form data
            const validation = this.validateFormData(formData);
            if (!validation.isValid) {
                this.showError('Please fix the following errors:\n' + validation.errors.join('\n'));
                return;
            }

            this.showLoading('Saving post...');

            if (this.isEditing && this.currentPost) {
                await this.blogManager.updatePost(this.currentPost.id, formData);
                this.showSuccess('Post updated successfully!');
            } else {
                const postId = await this.blogManager.createPost(formData);
                this.showSuccess('Post created successfully!');
                
                // Optionally redirect to edit mode
                if (this.options.redirectAfterCreate) {
                    this.loadPost(postId);
                }
            }

        } catch (error) {
            console.error('Failed to save post:', error);
            this.showError('Failed to save post: ' + error.message);
        }
    }

    /**
     * Save as draft
     */
    async saveDraft() {
        try {
            const formData = this.getFormData();
            formData.status = 'draft';

            this.showLoading('Saving draft...');

            if (this.isEditing && this.currentPost) {
                await this.blogManager.updatePost(this.currentPost.id, formData);
            } else {
                const postId = await this.blogManager.createPost(formData);
                this.currentPost = { id: postId };
                this.isEditing = true;
            }

            this.showSuccess('Draft saved successfully!');

        } catch (error) {
            console.error('Failed to save draft:', error);
            this.showError('Failed to save draft: ' + error.message);
        }
    }

    /**
     * Handle auto-save
     * @param {string} content - Editor content
     */
    async handleAutoSave(content) {
        if (!this.options.autoSave || !this.isEditing || !this.currentPost) {
            return;
        }

        try {
            const formData = this.getFormData();
            formData.status = 'draft'; // Auto-save always saves as draft
            
            await this.blogManager.updatePost(this.currentPost.id, formData);
            this.showAutoSaveStatus('Auto-saved');

        } catch (error) {
            console.error('Auto-save failed:', error);
            this.showAutoSaveStatus('Auto-save failed');
        }
    }

    /**
     * Show preview
     */
    showPreview() {
        const formData = this.getFormData();
        
        // Create preview window or modal
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview: ${formData.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                    .featured-image { max-width: 100%; height: auto; margin-bottom: 20px; }
                    .content { line-height: 1.6; }
                </style>
            </head>
            <body>
                <h1>${formData.title}</h1>
                <div class="meta">
                    Category: ${formData.category || 'Uncategorized'} | 
                    Status: ${formData.status} | 
                    Tags: ${formData.tags.join(', ') || 'None'}
                </div>
                ${formData.featuredImage.url ? `<img src="${formData.featuredImage.url}" alt="${formData.featuredImage.alt}" class="featured-image">` : ''}
                ${formData.excerpt ? `<p><strong>Excerpt:</strong> ${formData.excerpt}</p>` : ''}
                <div class="content">${formData.content}</div>
            </body>
            </html>
        `);
    }

    /**
     * Handle cancel
     */
    handleCancel() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            this.clearForm();
            if (this.options.onCancel && typeof this.options.onCancel === 'function') {
                this.options.onCancel();
            }
        }
    }

    /**
     * Validate form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} - Validation result
     */
    validateFormData(formData) {
        const errors = [];

        if (!formData.title || formData.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (!formData.content || formData.content.trim().length === 0) {
            errors.push('Content is required');
        }

        if (formData.status === 'scheduled' && !formData.scheduledFor) {
            errors.push('Scheduled date is required for scheduled posts');
        }

        if (formData.scheduledFor && formData.scheduledFor <= new Date()) {
            errors.push('Scheduled date must be in the future');
        }

        if (formData.tags.length > 10) {
            errors.push('Maximum 10 tags allowed');
        }

        if (formData.seo.keywords.length > 10) {
            errors.push('Maximum 10 SEO keywords allowed');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Clear form
     */
    clearForm() {
        document.getElementById(`${this.containerId}-form`).reset();
        this.richTextEditor.clear();
        this.currentPost = null;
        this.isEditing = false;
        document.getElementById('featured-image-preview').classList.add('hidden');
        document.getElementById('scheduling-section').classList.add('hidden');
    }

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message) {
        // Implementation depends on your UI framework
        console.log('Loading:', message);
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Implementation depends on your UI framework
        console.log('Success:', message);
        alert(message); // Temporary implementation
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Implementation depends on your UI framework
        console.error('Error:', message);
        alert(message); // Temporary implementation
    }

    /**
     * Show auto-save status
     * @param {string} message - Status message
     */
    showAutoSaveStatus(message) {
        const statusElement = document.getElementById('autosave-status');
        if (statusElement) {
            statusElement.textContent = message;
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    }

    /**
     * Destroy the form
     */
    destroy() {
        if (this.richTextEditor) {
            this.richTextEditor.destroy();
        }
        this.container.innerHTML = '';
    }
}