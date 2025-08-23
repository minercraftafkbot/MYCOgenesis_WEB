/**
 * Rich Text Editor Component
 * Integrates Quill.js with custom toolbar and image upload functionality
 */

export class RichTextEditor {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.quill = null;
        this.autoSaveTimer = null;
        this.imageUploadHandler = null;
        
        // Default options
        this.options = {
            theme: 'snow',
            placeholder: 'Start writing your content...',
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            imageUpload: true,
            maxImageSize: 5 * 1024 * 1024, // 5MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            ...options
        };

        this.init();
    }

    /**
     * Initialize the rich text editor
     */
    init() {
        if (!this.container) {
            console.error('Rich text editor container not found:', this.containerId);
            return;
        }

        this.createEditorHTML();
        this.initializeQuill();
        this.setupImageUpload();
        this.setupAutoSave();
        this.setupEventListeners();
    }

    /**
     * Create the editor HTML structure
     */
    createEditorHTML() {
        this.container.innerHTML = `
            <div class="rich-text-editor">
                <div id="${this.containerId}-toolbar" class="ql-toolbar-custom">
                    <!-- Custom toolbar will be created by Quill -->
                </div>
                <div id="${this.containerId}-editor" class="ql-editor-container">
                    <!-- Editor content area -->
                </div>
                <div class="editor-status">
                    <span id="${this.containerId}-status" class="text-sm text-gray-500"></span>
                    <span id="${this.containerId}-word-count" class="text-sm text-gray-500 ml-4"></span>
                </div>
            </div>
        `;
    }

    /**
     * Initialize Quill editor
     */
    initializeQuill() {
        // Custom toolbar configuration
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ];

        // Initialize Quill
        this.quill = new Quill(`#${this.containerId}-editor`, {
            theme: this.options.theme,
            placeholder: this.options.placeholder,
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        'image': this.handleImageClick.bind(this)
                    }
                },
                history: {
                    delay: 1000,
                    maxStack: 50,
                    userOnly: true
                }
            }
        });

        // Set initial content if provided
        if (this.options.initialContent) {
            this.setContent(this.options.initialContent);
        }
    }

    /**
     * Setup image upload functionality
     */
    setupImageUpload() {
        if (!this.options.imageUpload) return;

        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = this.options.allowedImageTypes.join(',');
        fileInput.style.display = 'none';
        fileInput.id = `${this.containerId}-image-input`;
        
        this.container.appendChild(fileInput);

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
            // Reset input
            fileInput.value = '';
        });

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const editorElement = this.container.querySelector('.ql-editor');
        
        editorElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            editorElement.classList.add('drag-over');
        });

        editorElement.addEventListener('dragleave', (e) => {
            e.preventDefault();
            editorElement.classList.remove('drag-over');
        });

        editorElement.addEventListener('drop', (e) => {
            e.preventDefault();
            editorElement.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => 
                this.options.allowedImageTypes.includes(file.type)
            );

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => this.handleImageUpload(file));
            }
        });
    }

    /**
     * Handle image button click
     */
    handleImageClick() {
        const fileInput = document.getElementById(`${this.containerId}-image-input`);
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Handle image upload
     * @param {File} file - Image file to upload
     */
    async handleImageUpload(file) {
        try {
            // Validate file
            const validation = this.validateImageFile(file);
            if (!validation.isValid) {
                this.showStatus(validation.error, 'error');
                return;
            }

            this.showStatus('Uploading image...', 'loading');

            // If custom upload handler is provided, use it
            if (this.imageUploadHandler) {
                const imageUrl = await this.imageUploadHandler(file);
                this.insertImage(imageUrl, file.name);
                this.showStatus('Image uploaded successfully', 'success');
                return;
            }

            // Default: convert to base64 (for demo purposes)
            const base64Url = await this.fileToBase64(file);
            this.insertImage(base64Url, file.name);
            this.showStatus('Image inserted', 'success');

        } catch (error) {
            console.error('Image upload failed:', error);
            this.showStatus('Image upload failed', 'error');
        }
    }

    /**
     * Validate image file
     * @param {File} file - File to validate
     * @returns {Object} - Validation result
     */
    validateImageFile(file) {
        if (!file) {
            return { isValid: false, error: 'No file selected' };
        }

        if (!this.options.allowedImageTypes.includes(file.type)) {
            return { isValid: false, error: 'Invalid file type. Please select an image.' };
        }

        if (file.size > this.options.maxImageSize) {
            const maxSizeMB = Math.round(this.options.maxImageSize / 1024 / 1024);
            return { isValid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
        }

        return { isValid: true };
    }

    /**
     * Convert file to base64
     * @param {File} file - File to convert
     * @returns {Promise<string>} - Base64 URL
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Insert image into editor
     * @param {string} imageUrl - Image URL
     * @param {string} altText - Alt text for image
     */
    insertImage(imageUrl, altText = '') {
        const range = this.quill.getSelection();
        const index = range ? range.index : this.quill.getLength();
        
        this.quill.insertEmbed(index, 'image', imageUrl);
        
        // Set alt text if provided
        if (altText) {
            const img = this.quill.root.querySelector(`img[src="${imageUrl}"]`);
            if (img) {
                img.alt = altText;
            }
        }
        
        // Move cursor after image
        this.quill.setSelection(index + 1);
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (!this.options.autoSave) return;

        this.quill.on('text-change', () => {
            this.clearAutoSaveTimer();
            this.autoSaveTimer = setTimeout(() => {
                this.triggerAutoSave();
            }, this.options.autoSaveInterval);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Update word count on text change
        this.quill.on('text-change', () => {
            this.updateWordCount();
        });

        // Update status on selection change
        this.quill.on('selection-change', (range) => {
            if (range) {
                this.showStatus('Ready', 'ready');
            }
        });

        // Initial word count
        this.updateWordCount();
    }

    /**
     * Update word count display
     */
    updateWordCount() {
        const text = this.quill.getText().trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        const charCount = text.length;
        
        const wordCountElement = document.getElementById(`${this.containerId}-word-count`);
        if (wordCountElement) {
            wordCountElement.textContent = `${wordCount} words, ${charCount} characters`;
        }
    }

    /**
     * Show status message
     * @param {string} message - Status message
     * @param {string} type - Status type (loading, success, error, ready)
     */
    showStatus(message, type = 'ready') {
        const statusElement = document.getElementById(`${this.containerId}-status`);
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `text-sm ${this.getStatusClass(type)}`;

        // Auto-clear status after 3 seconds (except for ready state)
        if (type !== 'ready') {
            setTimeout(() => {
                this.showStatus('Ready', 'ready');
            }, 3000);
        }
    }

    /**
     * Get CSS class for status type
     * @param {string} type - Status type
     * @returns {string} - CSS class
     */
    getStatusClass(type) {
        switch (type) {
            case 'loading':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'ready':
            default:
                return 'text-gray-500';
        }
    }

    /**
     * Trigger auto-save
     */
    triggerAutoSave() {
        if (this.options.onAutoSave && typeof this.options.onAutoSave === 'function') {
            const content = this.getContent();
            this.options.onAutoSave(content);
            this.showStatus('Auto-saved', 'success');
        }
    }

    /**
     * Clear auto-save timer
     */
    clearAutoSaveTimer() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Set image upload handler
     * @param {Function} handler - Upload handler function
     */
    setImageUploadHandler(handler) {
        this.imageUploadHandler = handler;
    }

    /**
     * Get editor content as HTML
     * @returns {string} - HTML content
     */
    getContent() {
        return this.quill.root.innerHTML;
    }

    /**
     * Get editor content as plain text
     * @returns {string} - Plain text content
     */
    getText() {
        return this.quill.getText();
    }

    /**
     * Set editor content
     * @param {string} html - HTML content to set
     */
    setContent(html) {
        this.quill.root.innerHTML = html;
    }

    /**
     * Clear editor content
     */
    clear() {
        this.quill.setText('');
    }

    /**
     * Focus the editor
     */
    focus() {
        this.quill.focus();
    }

    /**
     * Enable/disable the editor
     * @param {boolean} enabled - Whether to enable the editor
     */
    setEnabled(enabled) {
        this.quill.enable(enabled);
    }

    /**
     * Get editor length
     * @returns {number} - Content length
     */
    getLength() {
        return this.quill.getLength();
    }

    /**
     * Insert text at current cursor position
     * @param {string} text - Text to insert
     */
    insertText(text) {
        const range = this.quill.getSelection();
        const index = range ? range.index : this.quill.getLength();
        this.quill.insertText(index, text);
    }

    /**
     * Format text selection
     * @param {string} format - Format name
     * @param {*} value - Format value
     */
    format(format, value) {
        this.quill.format(format, value);
    }

    /**
     * Destroy the editor
     */
    destroy() {
        this.clearAutoSaveTimer();
        if (this.quill) {
            // Remove event listeners
            this.quill.off('text-change');
            this.quill.off('selection-change');
            
            // Clear container
            this.container.innerHTML = '';
            this.quill = null;
        }
    }

    /**
     * Get Quill instance (for advanced usage)
     * @returns {Quill} - Quill instance
     */
    getQuillInstance() {
        return this.quill;
    }
}