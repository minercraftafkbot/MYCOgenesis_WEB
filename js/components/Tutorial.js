/**
 * Tutorial Component
 * Displays tutorials and guides with step-by-step navigation and progress tracking
 */

class TutorialComponent {
    constructor() {
        this.currentTutorial = null;
        this.currentStepIndex = 0;
        this.completedSteps = new Set();
        this.contentRenderer = new ContentRenderer();
        this.progressData = null;
        this.isFullscreen = false;
    }

    /**
     * Initialize tutorial
     * @param {string} slug - Tutorial slug
     */
    async init(slug) {
        try {
            this.showLoading();
            this.currentTutorial = await sanityService.getTutorial(slug);
            
            if (!this.currentTutorial) {
                this.showNotFound();
                return;
            }

            this.loadProgress();
            this.render();
            this.setupInteractivity();
            this.updateSEO();
        } catch (error) {
            console.error('Error loading tutorial:', error);
            this.showError();
        }
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        if (!this.currentTutorial) return;
        
        const key = `tutorial_progress_${this.currentTutorial._id}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                this.progressData = JSON.parse(saved);
                this.currentStepIndex = this.progressData.currentStep || 0;
                this.completedSteps = new Set(this.progressData.completedSteps || []);
            } catch (e) {
                console.warn('Failed to parse tutorial progress:', e);
            }
        }
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        if (!this.currentTutorial) return;
        
        const key = `tutorial_progress_${this.currentTutorial._id}`;
        const data = {
            currentStep: this.currentStepIndex,
            completedSteps: Array.from(this.completedSteps),
            lastAccessed: new Date().toISOString()
        };
        
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Show loading state
     */
    showLoading() {
        const container = document.getElementById('tutorial-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p class="text-slate-600">Loading tutorial...</p>
                </div>
            </div>
        `;
    }

    /**
     * Show not found state
     */
    showNotFound() {
        const container = document.getElementById('tutorial-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center max-w-md mx-auto px-4">
                    <div class="text-6xl mb-4">📚</div>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Tutorial Not Found</h1>
                    <p class="text-slate-600 mb-6">The tutorial you're looking for doesn't exist or has been removed.</p>
                    <a href="/tutorials" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors">
                        Browse Tutorials
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError() {
        const container = document.getElementById('tutorial-container') || document.body;
        container.innerHTML = `
            <div class="min-h-screen bg-stone-50 flex items-center justify-center">
                <div class="text-center max-w-md mx-auto px-4">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Error Loading Tutorial</h1>
                    <p class="text-slate-600 mb-6">We're having trouble loading this tutorial. Please try again later.</p>
                    <button onclick="location.reload()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render the tutorial
     */
    render() {
        const container = document.getElementById('tutorial-container') || document.body;
        const tutorial = this.currentTutorial;
        
        container.innerHTML = `
            <div class="tutorial-page">
                ${this.renderHeader(tutorial)}
                ${this.renderProgressBar()}
                
                <div class="container mx-auto px-4 sm:px-6 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Tutorial Navigation -->
                        <div class="lg:col-span-1">
                            ${this.renderSidebar(tutorial)}
                        </div>
                        
                        <!-- Main Content -->
                        <div class="lg:col-span-3">
                            ${this.renderMainContent(tutorial)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render tutorial header
     */
    renderHeader(tutorial) {
        const difficultyColors = {
            'beginner': 'bg-green-100 text-green-800',
            'intermediate': 'bg-yellow-100 text-yellow-800',
            'advanced': 'bg-orange-100 text-orange-800',
            'expert': 'bg-red-100 text-red-800'
        };

        return `
            <section class="bg-white border-b">
                <div class="container mx-auto px-4 sm:px-6 py-8">
                    <div class="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            ${this.renderBreadcrumbs(tutorial)}
                            
                            <h1 class="text-3xl font-bold mb-2">${tutorial.title}</h1>
                            
                            ${tutorial.subtitle ? `
                                <p class="text-lg text-slate-600 mb-4">${tutorial.subtitle}</p>
                            ` : ''}
                            
                            <div class="flex flex-wrap items-center gap-3 mb-4">
                                <span class="px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[tutorial.difficulty] || difficultyColors.beginner}">
                                    ${tutorial.difficulty?.charAt(0).toUpperCase() + tutorial.difficulty?.slice(1) || 'Beginner'}
                                </span>
                                
                                ${tutorial.estimatedTime ? `
                                    <span class="flex items-center text-sm text-slate-600">
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        ${tutorial.estimatedTime.value} ${tutorial.estimatedTime.unit}
                                    </span>
                                ` : ''}
                                
                                <span class="flex items-center text-sm text-slate-600">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    ${tutorial.steps?.length || 0} steps
                                </span>
                            </div>
                            
                            ${tutorial.isPremium ? `
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                        <span class="text-amber-800 font-medium">Premium Tutorial</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${tutorial.featuredImage ? `
                            <div>
                                <img src="${tutorial.featuredImage.url}" 
                                     alt="${tutorial.featuredImage.alt || tutorial.title}"
                                     class="w-full h-64 object-cover rounded-lg shadow-sm">
                            </div>
                        ` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render breadcrumbs
     */
    renderBreadcrumbs(tutorial) {
        return `
            <nav class="mb-4">
                <div class="flex items-center space-x-2 text-sm text-slate-500">
                    <a href="/" class="hover:text-slate-700 transition-colors">Home</a>
                    <span>/</span>
                    <a href="/tutorials" class="hover:text-slate-700 transition-colors">Tutorials</a>
                    <span>/</span>
                    <span class="text-slate-800">${tutorial.title}</span>
                </div>
            </nav>
        `;
    }

    /**
     * Render progress bar
     */
    renderProgressBar() {
        const totalSteps = this.currentTutorial?.steps?.length || 0;
        const completedCount = this.completedSteps.size;
        const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

        return `
            <div class="bg-white border-b sticky top-0 z-40">
                <div class="container mx-auto px-4 sm:px-6 py-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700">
                            Progress: ${completedCount}/${totalSteps} steps
                        </span>
                        <span class="text-sm text-slate-500">${Math.round(progressPercent)}% complete</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                             style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render sidebar with navigation
     */
    renderSidebar(tutorial) {
        return `
            <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <h3 class="font-semibold mb-4">Tutorial Contents</h3>
                
                <!-- Overview section -->
                <div class="mb-6">
                    <button onclick="tutorialComponent.showOverview()" 
                            class="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors ${this.currentStepIndex === -1 ? 'bg-teal-50 text-teal-700' : ''}">
                        📖 Overview
                    </button>
                </div>
                
                <!-- Steps navigation -->
                <div class="space-y-1 max-h-96 overflow-y-auto">
                    ${tutorial.steps?.map((step, index) => `
                        <button onclick="tutorialComponent.goToStep(${index})" 
                                class="w-full text-left p-2 rounded text-sm transition-colors
                                       ${index === this.currentStepIndex ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}
                                       ${this.completedSteps.has(index) ? 'border-l-2 border-green-500' : ''}">
                            <div class="flex items-center justify-between">
                                <span class="truncate">
                                    ${index + 1}. ${step.title || `Step ${index + 1}`}
                                </span>
                                ${this.completedSteps.has(index) ? '<span class="text-green-600 ml-1">✓</span>' : ''}
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Action buttons -->
                <div class="mt-6 space-y-2">
                    <button onclick="tutorialComponent.toggleFullscreen()" 
                            class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm transition-colors">
                        📱 ${this.isFullscreen ? 'Exit' : 'Enter'} Focus Mode
                    </button>
                    
                    <button onclick="tutorialComponent.resetProgress()" 
                            class="w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded text-sm transition-colors">
                        🔄 Reset Progress
                    </button>
                </div>
                
                <!-- Quick stats -->
                <div class="mt-6 pt-4 border-t text-sm text-slate-600">
                    <div class="space-y-1">
                        <div>Category: <span class="font-medium">${tutorial.category}</span></div>
                        <div>Type: <span class="font-medium">${tutorial.tutorialType}</span></div>
                        ${tutorial.author ? `<div>Author: <span class="font-medium">${tutorial.author.name}</span></div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render main content
     */
    renderMainContent(tutorial) {
        if (this.currentStepIndex === -1) {
            return this.renderOverview(tutorial);
        } else if (this.currentStepIndex < (tutorial.steps?.length || 0)) {
            return this.renderStep(tutorial.steps[this.currentStepIndex], this.currentStepIndex);
        } else {
            return this.renderCompletion(tutorial);
        }
    }

    /**
     * Render tutorial overview
     */
    renderOverview(tutorial) {
        return `
            <div class="tutorial-overview bg-white rounded-lg shadow-sm border p-8">
                <h2 class="text-2xl font-bold mb-6">Tutorial Overview</h2>
                
                ${tutorial.overview ? `
                    <div class="prose prose-slate max-w-none mb-8">
                        <p class="text-lg text-slate-700 leading-relaxed">${tutorial.overview}</p>
                    </div>
                ` : ''}
                
                ${tutorial.learningOutcomes && tutorial.learningOutcomes.length > 0 ? `
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold mb-4">What You'll Learn</h3>
                        <ul class="space-y-2">
                            ${tutorial.learningOutcomes.map(outcome => `
                                <li class="flex items-start">
                                    <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span>${outcome}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${this.renderPrerequisites(tutorial.prerequisites)}
                ${this.renderMaterials(tutorial.materials)}
                
                <div class="flex items-center justify-between pt-6 border-t">
                    <div class="text-sm text-slate-600">
                        Ready to get started?
                    </div>
                    <button onclick="tutorialComponent.startTutorial()" 
                            class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        Start Tutorial
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render prerequisites section
     */
    renderPrerequisites(prerequisites) {
        if (!prerequisites?.hasPrerequisites || 
            (!prerequisites.knowledge?.length && !prerequisites.priorTutorials?.length)) {
            return '';
        }

        return `
            <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-3">Prerequisites</h4>
                
                ${prerequisites.knowledge?.length > 0 ? `
                    <div class="mb-4">
                        <h5 class="font-medium text-blue-700 mb-2">Required Knowledge:</h5>
                        <ul class="space-y-1 text-sm text-blue-700">
                            ${prerequisites.knowledge.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${prerequisites.priorTutorials?.length > 0 ? `
                    <div>
                        <h5 class="font-medium text-blue-700 mb-2">Recommended Prior Tutorials:</h5>
                        <div class="space-y-2">
                            ${prerequisites.priorTutorials.map(tutorial => `
                                <a href="/tutorial/${tutorial.slug}" 
                                   class="block text-sm text-blue-600 hover:text-blue-800 underline">
                                    ${tutorial.title}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render materials section
     */
    renderMaterials(materials) {
        if (!materials || materials.length === 0) return '';

        return `
            <div class="mb-8">
                <h3 class="text-lg font-semibold mb-4">Materials & Equipment Needed</h3>
                <div class="grid gap-4">
                    ${materials.map(material => `
                        <div class="p-4 border rounded-lg ${material.isOptional ? 'border-dashed border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'}">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h4 class="font-medium ${material.isOptional ? 'text-slate-600' : 'text-slate-900'}">
                                        ${material.item}
                                        ${material.isOptional ? '<span class="text-xs text-slate-500 ml-1">(Optional)</span>' : ''}
                                    </h4>
                                    
                                    ${material.description ? `
                                        <p class="text-sm text-slate-600 mt-1">${material.description}</p>
                                    ` : ''}
                                    
                                    <div class="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                                        ${material.quantity ? `<span>Qty: ${material.quantity}</span>` : ''}
                                        ${material.estimatedCost ? `<span>Cost: ${material.estimatedCost}</span>` : ''}
                                        ${material.whereToFind ? `<span>Where: ${material.whereToFind}</span>` : ''}
                                    </div>
                                </div>
                                
                                ${material.productLink ? `
                                    <a href="/product/${material.productLink.slug}" 
                                       class="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                        View Product
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual step
     */
    renderStep(step, index) {
        if (!step) return '';

        return `
            <div class="tutorial-step bg-white rounded-lg shadow-sm border p-8">
                <!-- Step header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <div class="text-sm text-slate-500 mb-1">Step ${index + 1} of ${this.currentTutorial.steps.length}</div>
                        <h2 class="text-2xl font-bold">${step.title}</h2>
                        ${step.estimatedTime ? `
                            <div class="text-sm text-slate-600 mt-1">⏱️ Estimated time: ${step.estimatedTime}</div>
                        ` : ''}
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        ${step.difficulty ? `
                            <span class="px-2 py-1 text-xs rounded-full ${this.getDifficultyStyle(step.difficulty)}">
                                ${step.difficulty}
                            </span>
                        ` : ''}
                        
                        <button onclick="tutorialComponent.toggleStepComplete(${index})" 
                                class="p-2 rounded-full transition-colors ${this.completedSteps.has(index) 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Step instructions -->
                <div class="prose prose-slate max-w-none mb-8">
                    ${this.contentRenderer.renderBlocks(step.instructions)}
                </div>

                <!-- Step images -->
                ${this.renderStepImages(step.images)}

                <!-- Step video -->
                ${this.renderStepVideo(step.video)}

                <!-- Step tips -->
                ${this.renderStepTips(step.tips)}

                <!-- Navigation buttons -->
                <div class="flex items-center justify-between pt-8 border-t">
                    <button onclick="tutorialComponent.previousStep()" 
                            ${index === 0 ? 'disabled' : ''}
                            class="flex items-center px-4 py-2 rounded-lg border transition-colors
                                   ${index === 0 
                                     ? 'text-slate-400 border-slate-200 cursor-not-allowed' 
                                     : 'text-slate-700 border-slate-300 hover:bg-slate-50'}">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Previous
                    </button>

                    <button onclick="tutorialComponent.nextStep()" 
                            class="flex items-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                        ${index === this.currentTutorial.steps.length - 1 ? 'Complete Tutorial' : 'Next Step'}
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get difficulty styling
     */
    getDifficultyStyle(difficulty) {
        const styles = {
            'easy': 'bg-green-100 text-green-700',
            'medium': 'bg-yellow-100 text-yellow-700',
            'hard': 'bg-orange-100 text-orange-700',
            'critical': 'bg-red-100 text-red-700'
        };
        return styles[difficulty] || styles.medium;
    }

    /**
     * Render step images
     */
    renderStepImages(images) {
        if (!images || images.length === 0) return '';

        return `
            <div class="mb-8">
                <div class="grid gap-4 ${images.length === 1 ? '' : 'sm:grid-cols-2'}">
                    ${images.map(image => `
                        <figure class="group cursor-pointer" onclick="tutorialComponent.openImageModal('${image.url}', '${image.alt || ''}')">
                            <img src="${image.url}" 
                                 alt="${image.alt || ''}"
                                 class="w-full h-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                            ${image.caption ? `
                                <figcaption class="text-sm text-slate-600 text-center mt-2">${image.caption}</figcaption>
                            ` : ''}
                        </figure>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render step video
     */
    renderStepVideo(video) {
        if (!video?.url) return '';

        return `
            <div class="mb-8">
                <div class="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    ${video.thumbnail ? `
                        <div class="relative w-full h-full group cursor-pointer" onclick="tutorialComponent.playVideo('${video.url}')">
                            <img src="${video.thumbnail.url}" alt="Video thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div class="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
                                    <svg class="w-8 h-8 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                                    </svg>
                                </div>
                            </div>
                            ${video.duration ? `
                                <div class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    ${video.duration}
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <iframe src="${video.url}" 
                                class="w-full h-full" 
                                frameborder="0" 
                                allowfullscreen>
                        </iframe>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Render step tips
     */
    renderStepTips(tips) {
        if (!tips || tips.length === 0) return '';

        const tipStyles = {
            'tip': 'bg-blue-50 border-blue-200 text-blue-800',
            'warning': 'bg-amber-50 border-amber-200 text-amber-800',
            'note': 'bg-slate-50 border-slate-200 text-slate-800',
            'troubleshooting': 'bg-red-50 border-red-200 text-red-800'
        };

        const tipIcons = {
            'tip': '💡',
            'warning': '⚠️',
            'note': '📝',
            'troubleshooting': '🔧'
        };

        return `
            <div class="mb-8 space-y-4">
                ${tips.map(tip => `
                    <div class="p-4 border rounded-lg ${tipStyles[tip.type] || tipStyles.tip}">
                        <div class="flex items-start space-x-3">
                            <div class="text-lg">${tipIcons[tip.type] || tipIcons.tip}</div>
                            <div>
                                <div class="font-medium capitalize mb-1">${tip.type || 'Tip'}</div>
                                <div class="text-sm">${tip.content}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Tutorial interaction methods
     */
    showOverview() {
        this.currentStepIndex = -1;
        this.render();
    }

    startTutorial() {
        this.currentStepIndex = 0;
        this.render();
    }

    goToStep(index) {
        if (index >= 0 && index < (this.currentTutorial?.steps?.length || 0)) {
            this.currentStepIndex = index;
            this.saveProgress();
            this.render();
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.saveProgress();
            this.render();
        }
    }

    nextStep() {
        const totalSteps = this.currentTutorial?.steps?.length || 0;
        if (this.currentStepIndex < totalSteps - 1) {
            this.currentStepIndex++;
            this.saveProgress();
            this.render();
        } else {
            // Tutorial completed
            this.currentStepIndex = totalSteps;
            this.render();
        }
    }

    toggleStepComplete(index) {
        if (this.completedSteps.has(index)) {
            this.completedSteps.delete(index);
        } else {
            this.completedSteps.add(index);
        }
        this.saveProgress();
        this.render();
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
            this.completedSteps.clear();
            this.currentStepIndex = 0;
            const key = `tutorial_progress_${this.currentTutorial._id}`;
            localStorage.removeItem(key);
            this.render();
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        document.body.classList.toggle('tutorial-fullscreen', this.isFullscreen);
        this.render();
    }

    /**
     * Setup interactivity
     */
    setupInteractivity() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case ' ':
                    if (this.currentStepIndex >= 0) {
                        e.preventDefault();
                        this.toggleStepComplete(this.currentStepIndex);
                    }
                    break;
                case 'Escape':
                    if (this.isFullscreen) {
                        this.toggleFullscreen();
                    }
                    break;
            }
        });
    }

    /**
     * Update SEO meta tags
     */
    updateSEO() {
        if (!this.currentTutorial) return;

        const tutorial = this.currentTutorial;
        
        document.title = tutorial.seo?.metaTitle || `${tutorial.title} | MYCOgenesis Tutorials`;
        
        // Update meta tags using the same methods as BusinessPage
        this.updateMetaTag('description', tutorial.seo?.metaDescription || tutorial.overview || '');
        this.updateMetaTag('og:title', tutorial.seo?.metaTitle || tutorial.title);
        this.updateMetaTag('og:description', tutorial.seo?.metaDescription || tutorial.overview || '');
        this.updateMetaTag('og:type', 'article');
        this.updateMetaTag('og:url', window.location.href);
        
        if (tutorial.featuredImage?.url) {
            this.updateMetaTag('og:image', tutorial.featuredImage.url);
        }
    }

    updateMetaTag(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }
}

// Export for use
window.TutorialComponent = TutorialComponent;
