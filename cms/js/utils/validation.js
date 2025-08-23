/**
 * Validation and Sanitization Utilities
 * Provides comprehensive input validation and content sanitization
 */

export class ValidationUtils {
    /**
     * Sanitize HTML content to prevent XSS attacks
     * @param {string} html - HTML content to sanitize
     * @returns {string} - Sanitized HTML
     */
    static sanitizeHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Define allowed tags and attributes
        const allowedTags = [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'span', 'div',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ];

        const allowedAttributes = {
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'blockquote': ['cite'],
            'code': ['class'],
            'pre': ['class'],
            'span': ['class', 'style'],
            'div': ['class', 'style'],
            'table': ['class'],
            'th': ['colspan', 'rowspan'],
            'td': ['colspan', 'rowspan']
        };

        // Recursively clean elements
        this.cleanElement(tempDiv, allowedTags, allowedAttributes);

        return tempDiv.innerHTML;
    }

    /**
     * Clean HTML element recursively
     * @param {Element} element - Element to clean
     * @param {Array} allowedTags - Allowed HTML tags
     * @param {Object} allowedAttributes - Allowed attributes per tag
     */
    static cleanElement(element, allowedTags, allowedAttributes) {
        const children = Array.from(element.children);

        children.forEach(child => {
            const tagName = child.tagName.toLowerCase();

            // Remove disallowed tags
            if (!allowedTags.includes(tagName)) {
                // Keep text content but remove the tag
                const textContent = child.textContent;
                const textNode = document.createTextNode(textContent);
                child.parentNode.replaceChild(textNode, child);
                return;
            }

            // Clean attributes
            const allowedAttrs = allowedAttributes[tagName] || [];
            const attributes = Array.from(child.attributes);

            attributes.forEach(attr => {
                if (!allowedAttrs.includes(attr.name)) {
                    child.removeAttribute(attr.name);
                } else {
                    // Sanitize attribute values
                    child.setAttribute(attr.name, this.sanitizeAttributeValue(attr.name, attr.value));
                }
            });

            // Recursively clean child elements
            this.cleanElement(child, allowedTags, allowedAttributes);
        });
    }

    /**
     * Sanitize attribute values
     * @param {string} attrName - Attribute name
     * @param {string} attrValue - Attribute value
     * @returns {string} - Sanitized attribute value
     */
    static sanitizeAttributeValue(attrName, attrValue) {
        if (!attrValue) return '';

        // Remove javascript: and data: URLs
        if (attrName === 'href' || attrName === 'src') {
            const value = attrValue.toLowerCase().trim();
            if (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('vbscript:')) {
                return '#';
            }
        }

        // Basic XSS prevention
        return attrValue
            .replace(/[<>'"]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether email is valid
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} - Whether URL is valid
     */
    static isValidURL(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate slug format
     * @param {string} slug - Slug to validate
     * @returns {boolean} - Whether slug is valid
     */
    static isValidSlug(slug) {
        if (!slug || typeof slug !== 'string') {
            return false;
        }

        // Slug should only contain lowercase letters, numbers, and hyphens
        const slugRegex = /^[a-z0-9-]+$/;
        return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
    }

    /**
     * Sanitize text input
     * @param {string} text - Text to sanitize
     * @param {number} maxLength - Maximum length
     * @returns {string} - Sanitized text
     */
    static sanitizeText(text, maxLength = null) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let sanitized = text
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/\s+/g, ' '); // Normalize whitespace

        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Validate and sanitize tags array
     * @param {Array} tags - Tags array to validate
     * @param {number} maxTags - Maximum number of tags
     * @param {number} maxTagLength - Maximum length per tag
     * @returns {Array} - Sanitized tags array
     */
    static sanitizeTags(tags, maxTags = 10, maxTagLength = 30) {
        if (!Array.isArray(tags)) {
            return [];
        }

        return tags
            .map(tag => this.sanitizeText(tag, maxTagLength))
            .filter(tag => tag.length > 0)
            .map(tag => tag.toLowerCase())
            .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
            .slice(0, maxTags);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result with strength score
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return {
                isValid: false,
                strength: 0,
                errors: ['Password is required']
            };
        }

        const errors = [];
        let strength = 0;

        // Length check
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else {
            strength += 1;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else {
            strength += 1;
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else {
            strength += 1;
        }

        // Number check
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        } else {
            strength += 1;
        }

        // Special character check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else {
            strength += 1;
        }

        return {
            isValid: errors.length === 0,
            strength,
            errors
        };
    }

    /**
     * Validate file upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} - Validation result
     */
    static validateFile(file, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        } = options;

        const errors = [];

        if (!file) {
            errors.push('File is required');
            return { isValid: false, errors };
        }

        // Size check
        if (file.size > maxSize) {
            errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        }

        // Type check
        if (!allowedTypes.includes(file.type)) {
            errors.push(`File type ${file.type} is not allowed`);
        }

        // Extension check
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            errors.push(`File extension ${extension} is not allowed`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                extension
            }
        };
    }

    /**
     * Escape HTML entities
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    static escapeHTML(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Unescape HTML entities
     * @param {string} html - HTML to unescape
     * @returns {string} - Unescaped text
     */
    static unescapeHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Validate date
     * @param {string|Date} date - Date to validate
     * @param {boolean} allowFuture - Whether future dates are allowed
     * @returns {Object} - Validation result
     */
    static validateDate(date, allowFuture = true) {
        const errors = [];
        let parsedDate;

        try {
            parsedDate = new Date(date);
            
            if (isNaN(parsedDate.getTime())) {
                errors.push('Invalid date format');
                return { isValid: false, errors };
            }

            if (!allowFuture && parsedDate > new Date()) {
                errors.push('Date cannot be in the future');
            }

        } catch (error) {
            errors.push('Invalid date');
        }

        return {
            isValid: errors.length === 0,
            errors,
            date: parsedDate
        };
    }

    /**
     * Validate required fields
     * @param {Object} data - Data object to validate
     * @param {Array} requiredFields - Array of required field names
     * @returns {Object} - Validation result
     */
    static validateRequired(data, requiredFields) {
        const errors = [];

        requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors.push(`${field} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}