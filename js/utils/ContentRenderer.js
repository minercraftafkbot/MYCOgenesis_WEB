/**
 * Content Renderer Utility
 * Renders Sanity rich text content blocks into HTML
 */

class ContentRenderer {
    constructor() {
        this.imageBuilder = sanityService ? sanityService.urlFor.bind(sanityService) : null;
    }

    /**
     * Render multiple content blocks
     * @param {Array} blocks - Array of content blocks
     * @returns {string} - Rendered HTML
     */
    renderBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) return '';
        
        return blocks.map(block => this.renderBlock(block)).join('');
    }

    /**
     * Render a single content block
     * @param {Object} block - Content block
     * @returns {string} - Rendered HTML
     */
    renderBlock(block) {
        if (!block || !block._type) return '';

        switch (block._type) {
            case 'block':
                return this.renderTextBlock(block);
            case 'image':
                return this.renderImage(block);
            case 'calloutBox':
                return this.renderCalloutBox(block);
            case 'statsGrid':
                return this.renderStatsGrid(block);
            case 'teamShowcase':
                return this.renderTeamShowcase(block);
            case 'twoColumnContent':
                return this.renderTwoColumnContent(block);
            case 'timeline':
                return this.renderTimeline(block);
            default:
                console.warn('Unknown block type:', block._type);
                return '';
        }
    }

    /**
     * Render text block (paragraphs, headings, lists)
     * @param {Object} block - Text block
     * @returns {string} - Rendered HTML
     */
    renderTextBlock(block) {
        if (!block.children || !Array.isArray(block.children)) return '';

        const style = block.style || 'normal';
        const listItem = block.listItem;
        
        // Handle list items
        if (listItem) {
            return `<li>${this.renderInlineContent(block.children)}</li>`;
        }

        // Handle different styles
        switch (style) {
            case 'h2':
                return `<h2 class="text-2xl font-bold mt-8 mb-4">${this.renderInlineContent(block.children)}</h2>`;
            case 'h3':
                return `<h3 class="text-xl font-semibold mt-6 mb-3">${this.renderInlineContent(block.children)}</h3>`;
            case 'h4':
                return `<h4 class="text-lg font-medium mt-4 mb-2">${this.renderInlineContent(block.children)}</h4>`;
            case 'blockquote':
                return `<blockquote class="border-l-4 border-teal-600 pl-4 italic text-slate-600 my-4">${this.renderInlineContent(block.children)}</blockquote>`;
            case 'normal':
            default:
                return `<p class="mb-4">${this.renderInlineContent(block.children)}</p>`;
        }
    }

    /**
     * Render inline content (spans with marks and annotations)
     * @param {Array} children - Array of inline elements
     * @returns {string} - Rendered HTML
     */
    renderInlineContent(children) {
        if (!children || !Array.isArray(children)) return '';

        return children.map(child => {
            if (child._type === 'span') {
                let text = child.text || '';
                
                // Apply marks (formatting)
                if (child.marks && child.marks.length > 0) {
                    child.marks.forEach(mark => {
                        text = this.applyMark(text, mark);
                    });
                }
                
                return text;
            }
            return '';
        }).join('');
    }

    /**
     * Apply formatting marks to text
     * @param {string} text - Text content
     * @param {string} mark - Mark to apply
     * @returns {string} - Formatted text
     */
    applyMark(text, mark) {
        switch (mark) {
            case 'strong':
                return `<strong class="font-semibold">${text}</strong>`;
            case 'em':
                return `<em class="italic">${text}</em>`;
            case 'code':
                return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${text}</code>`;
            case 'underline':
                return `<u>${text}</u>`;
            default:
                // Handle annotations (links, etc.)
                if (typeof mark === 'object') {
                    return this.applyAnnotation(text, mark);
                }
                return text;
        }
    }

    /**
     * Apply annotations (links, etc.) to text
     * @param {string} text - Text content
     * @param {Object} annotation - Annotation object
     * @returns {string} - Text with annotation
     */
    applyAnnotation(text, annotation) {
        switch (annotation._type) {
            case 'link':
                const target = annotation.blank ? 'target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${annotation.href}" class="text-teal-600 hover:text-teal-800 underline transition-colors" ${target}>${text}</a>`;
            case 'citation':
                return `<span class="citation" title="Citation: ${annotation.text}">${text}<sup class="text-xs">[${annotation.number}]</sup></span>`;
            default:
                return text;
        }
    }

    /**
     * Render image block
     * @param {Object} block - Image block
     * @returns {string} - Rendered HTML
     */
    renderImage(block) {
        if (!block.asset) return '';

        const imageUrl = this.imageBuilder 
            ? this.imageBuilder(block.asset).width(800).height(600).format('webp').url()
            : block.asset.url || '';

        const width = block.width || 'full';
        const widthClasses = {
            'full': 'w-full',
            'large': 'w-3/4 mx-auto',
            'medium': 'w-1/2 mx-auto',
            'small': 'w-1/4 mx-auto'
        };

        return `
            <figure class="my-8 ${widthClasses[width] || widthClasses.full}">
                <img src="${imageUrl}" 
                     alt="${block.alt || ''}"
                     class="w-full h-auto rounded-lg shadow-sm">
                ${block.caption ? `<figcaption class="text-sm text-slate-600 text-center mt-2">${block.caption}</figcaption>` : ''}
            </figure>
        `;
    }

    /**
     * Render callout box
     * @param {Object} block - Callout box block
     * @returns {string} - Rendered HTML
     */
    renderCalloutBox(block) {
        const typeStyles = {
            'info': 'bg-blue-50 border-blue-200 text-blue-800',
            'success': 'bg-green-50 border-green-200 text-green-800',
            'warning': 'bg-amber-50 border-amber-200 text-amber-800',
            'mission': 'bg-teal-50 border-teal-200 text-teal-800',
            'vision': 'bg-purple-50 border-purple-200 text-purple-800',
            'values': 'bg-orange-50 border-orange-200 text-orange-800',
            'stats': 'bg-slate-50 border-slate-200 text-slate-800'
        };

        const typeIcons = {
            'info': '💡',
            'success': '✅',
            'warning': '⚠️',
            'mission': '🎯',
            'vision': '🔮',
            'values': '💎',
            'stats': '📊'
        };

        const style = typeStyles[block.type] || typeStyles.info;
        const icon = block.icon || typeIcons[block.type] || typeIcons.info;

        return `
            <div class="my-6 p-4 border rounded-lg ${style}">
                <div class="flex items-start space-x-3">
                    <div class="text-xl">${icon}</div>
                    <div class="flex-1">
                        ${block.title ? `<h4 class="font-semibold mb-2">${block.title}</h4>` : ''}
                        <div class="text-sm leading-relaxed">${block.content || ''}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render statistics grid
     * @param {Object} block - Stats grid block
     * @returns {string} - Rendered HTML
     */
    renderStatsGrid(block) {
        if (!block.stats || !Array.isArray(block.stats) || block.stats.length === 0) return '';

        return `
            <div class="my-8">
                ${block.title ? `<h3 class="text-xl font-semibold mb-6 text-center">${block.title}</h3>` : ''}
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(block.stats.length, 4)} gap-6">
                    ${block.stats.map(stat => `
                        <div class="text-center p-4 bg-white rounded-lg shadow-sm border">
                            ${stat.icon ? `<div class="text-2xl mb-2">${stat.icon}</div>` : ''}
                            <div class="text-2xl font-bold text-teal-600 mb-1">${stat.number}</div>
                            <div class="text-sm font-medium text-slate-800 mb-1">${stat.label}</div>
                            ${stat.description ? `<div class="text-xs text-slate-600">${stat.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render team showcase
     * @param {Object} block - Team showcase block
     * @returns {string} - Rendered HTML
     */
    renderTeamShowcase(block) {
        const title = block.title || 'Meet Our Team';
        
        // For now, return placeholder since we'd need to fetch team members
        return `
            <div class="my-8">
                <h3 class="text-xl font-semibold mb-6 text-center">${title}</h3>
                <div class="bg-gray-50 p-6 rounded-lg text-center">
                    <p class="text-slate-600">Team member showcase will be loaded dynamically</p>
                    <div class="text-sm text-slate-500 mt-2">
                        ${block.showAll ? 'Showing all team members' : `Showing ${block.teamMembers?.length || 0} selected members`}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render two-column content
     * @param {Object} block - Two-column content block
     * @returns {string} - Rendered HTML
     */
    renderTwoColumnContent(block) {
        return `
            <div class="my-8 grid md:grid-cols-2 gap-8">
                <div class="prose prose-slate max-w-none">
                    ${this.renderBlocks(block.leftColumn)}
                </div>
                <div class="prose prose-slate max-w-none">
                    ${this.renderBlocks(block.rightColumn)}
                </div>
            </div>
        `;
    }

    /**
     * Render timeline/milestones
     * @param {Object} block - Timeline block
     * @returns {string} - Rendered HTML
     */
    renderTimeline(block) {
        if (!block.events || !Array.isArray(block.events) || block.events.length === 0) return '';

        return `
            <div class="my-8">
                ${block.title ? `<h3 class="text-xl font-semibold mb-8 text-center">${block.title}</h3>` : ''}
                
                <div class="relative">
                    <!-- Timeline line -->
                    <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-teal-200"></div>
                    
                    <div class="space-y-6">
                        ${block.events.map((event, index) => `
                            <div class="relative flex items-start">
                                <!-- Timeline dot -->
                                <div class="absolute left-0 w-8 h-8 bg-white border-4 ${event.isImportant ? 'border-teal-600' : 'border-teal-300'} rounded-full flex items-center justify-center">
                                    ${event.isImportant ? '<div class="w-2 h-2 bg-teal-600 rounded-full"></div>' : ''}
                                </div>
                                
                                <!-- Content -->
                                <div class="ml-12 pb-6">
                                    <div class="bg-white p-4 rounded-lg shadow-sm border">
                                        <div class="flex items-center justify-between mb-2">
                                            <h4 class="font-semibold ${event.isImportant ? 'text-teal-800' : 'text-slate-800'}">${event.title}</h4>
                                            <span class="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">${event.date}</span>
                                        </div>
                                        <p class="text-sm text-slate-600">${event.description || ''}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Export for use
window.ContentRenderer = ContentRenderer;
