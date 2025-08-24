/**
 * UIStateManager - Utility class for managing loading, error, and empty states
 */
class UIStateManager {
  constructor() {
    this.loadingClass = 'loading-state';
    this.errorClass = 'error-state';
    this.emptyClass = 'empty-state';
  }

  /**
   * Show loading state
   */
  showLoading(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    const {
      message = 'Loading...',
      spinner = true,
      overlay = false,
      size = 'medium' // small, medium, large
    } = options;

    const loadingHtml = this.createLoadingHTML(message, spinner, size);
    
    if (overlay) {
      this.showOverlay(container, loadingHtml);
    } else {
      container.innerHTML = loadingHtml;
    }

    container.classList.add(this.loadingClass);
  }

  /**
   * Show error state
   */
  showError(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    const {
      title = 'Oops! Something went wrong',
      message = 'We encountered an error while loading this content.',
      icon = '⚠️',
      retry = true,
      onRetry = null,
      showSupport = true
    } = options;

    const errorHtml = this.createErrorHTML(title, message, icon, retry, onRetry, showSupport);
    container.innerHTML = errorHtml;
    container.classList.add(this.errorClass);

    // Add retry functionality
    if (retry && onRetry) {
      const retryBtn = container.querySelector('[data-retry-btn]');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.clearState(container);
          onRetry();
        });
      }
    }
  }

  /**
   * Show empty state
   */
  showEmpty(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    const {
      title = 'No content found',
      message = 'There\'s nothing to display here yet.',
      icon = '🔍',
      action = null, // { text: 'Browse All', onClick: function }
      suggestions = [] // Array of suggestion objects with text and onClick
    } = options;

    const emptyHtml = this.createEmptyHTML(title, message, icon, action, suggestions);
    container.innerHTML = emptyHtml;
    container.classList.add(this.emptyClass);

    // Add action functionality
    if (action && action.onClick) {
      const actionBtn = container.querySelector('[data-action-btn]');
      if (actionBtn) {
        actionBtn.addEventListener('click', action.onClick);
      }
    }

    // Add suggestions functionality
    if (suggestions && suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        const suggestionBtn = container.querySelector(`[data-suggestion-${index}]`);
        if (suggestionBtn && suggestion.onClick) {
          suggestionBtn.addEventListener('click', suggestion.onClick);
        }
      });
    }
  }

  /**
   * Show network error specifically
   */
  showNetworkError(container, onRetry = null) {
    this.showError(container, {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      icon: '📡',
      retry: true,
      onRetry
    });
  }

  /**
   * Show 404 error
   */
  show404Error(container, resourceType = 'page') {
    this.showError(container, {
      title: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Not Found`,
      message: `The ${resourceType} you're looking for doesn't exist or has been moved.`,
      icon: '🔍',
      retry: false,
      showSupport: false
    });
  }

  /**
   * Show search empty state
   */
  showSearchEmpty(container, searchTerm) {
    this.showEmpty(container, {
      title: 'No results found',
      message: `No results found for "${searchTerm}". Try different keywords or browse our content.`,
      icon: '🔍',
      action: {
        text: 'Clear Search',
        onClick: () => {
          // This should be handled by the calling component
          const event = new CustomEvent('clearSearch');
          container.dispatchEvent(event);
        }
      },
      suggestions: [
        {
          text: 'Try broader keywords',
          onClick: () => console.log('Show search tips')
        },
        {
          text: 'Browse categories',
          onClick: () => console.log('Show categories')
        }
      ]
    });
  }

  /**
   * Show loading skeleton for content
   */
  showSkeleton(container, type = 'default') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    let skeletonHtml = '';

    switch (type) {
      case 'business-page':
        skeletonHtml = this.createBusinessPageSkeleton();
        break;
      case 'tutorial':
        skeletonHtml = this.createTutorialSkeleton();
        break;
      case 'faq-list':
        skeletonHtml = this.createFAQListSkeleton();
        break;
      case 'card-grid':
        skeletonHtml = this.createCardGridSkeleton();
        break;
      default:
        skeletonHtml = this.createDefaultSkeleton();
    }

    container.innerHTML = skeletonHtml;
    container.classList.add(this.loadingClass, 'skeleton-loading');
  }

  /**
   * Clear all states
   */
  clearState(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    container.classList.remove(this.loadingClass, this.errorClass, this.emptyClass, 'skeleton-loading');
    
    // Remove overlay if exists
    const overlay = container.querySelector('.ui-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Show overlay with content
   */
  showOverlay(container, content) {
    let overlay = container.querySelector('.ui-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'ui-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      container.style.position = 'relative';
      container.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
        ${content}
      </div>
    `;
  }

  /**
   * Create loading HTML
   */
  createLoadingHTML(message, spinner, size) {
    const sizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };

    const spinnerSizes = {
      small: 'w-6 h-6',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };

    return `
      <div class="flex flex-col items-center justify-center py-12 ${sizeClasses[size]}">
        ${spinner ? `
          <div class="animate-spin rounded-full ${spinnerSizes[size]} border-2 border-teal-200 border-t-teal-600 mb-4"></div>
        ` : ''}
        <p class="text-slate-600 font-medium">${message}</p>
      </div>
    `;
  }

  /**
   * Create error HTML
   */
  createErrorHTML(title, message, icon, retry, onRetry, showSupport) {
    return `
      <div class="text-center py-12 px-4">
        <div class="text-6xl mb-4">${icon}</div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">${title}</h2>
        <p class="text-slate-600 mb-6 max-w-md mx-auto">${message}</p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          ${retry ? `
            <button 
              data-retry-btn
              class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          ` : ''}
          
          <button 
            onclick="history.back()"
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>

        ${showSupport ? `
          <p class="text-sm text-slate-500 mt-6">
            Still having issues? 
            <a href="/contact" class="text-teal-600 hover:text-teal-700 underline">
              Contact Support
            </a>
          </p>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create empty state HTML
   */
  createEmptyHTML(title, message, icon, action, suggestions) {
    return `
      <div class="text-center py-12 px-4">
        <div class="text-6xl mb-4">${icon}</div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">${title}</h2>
        <p class="text-slate-600 mb-6 max-w-md mx-auto">${message}</p>
        
        ${action ? `
          <button 
            data-action-btn
            class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-4"
          >
            ${action.text}
          </button>
        ` : ''}

        ${suggestions && suggestions.length > 0 ? `
          <div class="flex flex-wrap gap-2 justify-center">
            ${suggestions.map((suggestion, index) => `
              <button 
                data-suggestion-${index}
                class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full transition-colors"
              >
                ${suggestion.text}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create business page skeleton
   */
  createBusinessPageSkeleton() {
    return `
      <div class="animate-pulse">
        <!-- Hero skeleton -->
        <div class="bg-slate-200 h-64 mb-8"></div>
        
        <div class="max-w-4xl mx-auto px-4">
          <!-- Title skeleton -->
          <div class="h-8 bg-slate-200 rounded mb-4 w-3/4"></div>
          
          <!-- Content blocks skeleton -->
          <div class="space-y-6">
            <div class="h-4 bg-slate-200 rounded w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-5/6"></div>
            <div class="h-4 bg-slate-200 rounded w-4/6"></div>
            <div class="h-32 bg-slate-200 rounded"></div>
            <div class="h-4 bg-slate-200 rounded w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create tutorial skeleton
   */
  createTutorialSkeleton() {
    return `
      <div class="animate-pulse">
        <div class="flex">
          <!-- Sidebar skeleton -->
          <div class="w-1/4 p-4 border-r">
            <div class="h-6 bg-slate-200 rounded mb-4"></div>
            <div class="space-y-2">
              ${Array(5).fill().map(() => `
                <div class="h-4 bg-slate-200 rounded"></div>
              `).join('')}
            </div>
          </div>
          
          <!-- Main content skeleton -->
          <div class="flex-1 p-6">
            <div class="h-8 bg-slate-200 rounded mb-6 w-3/4"></div>
            <div class="h-48 bg-slate-200 rounded mb-6"></div>
            <div class="space-y-4">
              <div class="h-4 bg-slate-200 rounded"></div>
              <div class="h-4 bg-slate-200 rounded w-5/6"></div>
              <div class="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create FAQ list skeleton
   */
  createFAQListSkeleton() {
    return `
      <div class="animate-pulse space-y-4">
        <!-- Search skeleton -->
        <div class="h-12 bg-slate-200 rounded mb-8"></div>
        
        <!-- FAQ items skeleton -->
        ${Array(6).fill().map(() => `
          <div class="border rounded-lg p-4">
            <div class="h-6 bg-slate-200 rounded mb-2 w-3/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create card grid skeleton
   */
  createCardGridSkeleton() {
    return `
      <div class="animate-pulse flex flex-wrap justify-center gap-6">
        ${Array(3).fill().map(() => `
          <div class="border rounded-lg overflow-hidden w-full max-w-sm">
            <div class="h-48 bg-slate-200"></div>
            <div class="p-4">
              <div class="h-6 bg-slate-200 rounded mb-2"></div>
              <div class="h-4 bg-slate-200 rounded mb-2 w-5/6"></div>
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create default skeleton
   */
  createDefaultSkeleton() {
    return `
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2"></div>
        <div class="h-4 bg-slate-200 rounded w-5/6"></div>
        <div class="h-32 bg-slate-200 rounded"></div>
        <div class="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    `;
  }

  /**
   * Show progressive loading with steps
   */
  showProgressiveLoading(container, steps = []) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container || steps.length === 0) return;

    const progressHtml = `
      <div class="text-center py-12">
        <div class="animate-spin rounded-full w-8 h-8 border-2 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
        <div id="loading-steps" class="space-y-2">
          ${steps.map((step, index) => `
            <div class="flex items-center justify-center text-sm text-slate-600" data-step="${index}">
              <span class="loading-step-icon mr-2">⏳</span>
              <span>${step}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = progressHtml;
    container.classList.add(this.loadingClass);

    return {
      completeStep: (index) => {
        const step = container.querySelector(`[data-step="${index}"]`);
        if (step) {
          const icon = step.querySelector('.loading-step-icon');
          icon.textContent = '✅';
          step.classList.add('text-green-600');
        }
      }
    };
  }

  /**
   * Utility to handle common async operations with states
   */
  async handleAsyncOperation(container, asyncFunction, options = {}) {
    const {
      loadingMessage = 'Loading...',
      errorTitle = 'Error',
      errorMessage = 'Something went wrong',
      emptyTitle = 'No data',
      emptyMessage = 'No data available',
      onRetry = null,
      skeleton = false,
      skeletonType = 'default'
    } = options;

    try {
      // Show loading state
      if (skeleton) {
        this.showSkeleton(container, skeletonType);
      } else {
        this.showLoading(container, { message: loadingMessage });
      }

      // Execute async operation
      const result = await asyncFunction();

      // Clear loading state
      this.clearState(container);

      // Handle empty result
      if (!result || (Array.isArray(result) && result.length === 0)) {
        this.showEmpty(container, {
          title: emptyTitle,
          message: emptyMessage
        });
        return null;
      }

      return result;

    } catch (error) {
      console.error('Async operation failed:', error);
      
      // Show error state
      this.showError(container, {
        title: errorTitle,
        message: error.message || errorMessage,
        onRetry: onRetry ? () => this.handleAsyncOperation(container, asyncFunction, options) : null
      });

      return null;
    }
  }
}

// Export the class
window.UIStateManager = UIStateManager;

// Create a global instance
window.uiStateManager = new UIStateManager();
