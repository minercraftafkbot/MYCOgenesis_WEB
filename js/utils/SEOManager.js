/**
 * SEOManager - Utility class for managing SEO meta tags, Open Graph tags, and structured data
 */
class SEOManager {
  constructor() {
    this.defaultTitle = 'MYCOgenesis';
    this.defaultDescription = 'Your guide to mushroom cultivation, mycology research, and sustainable growing practices.';
    this.defaultImage = '/images/og-default.jpg';
    this.defaultUrl = window.location.origin;
    this.siteName = 'MYCOgenesis';
  }

  /**
   * Set page title and meta tags for business pages
   */
  setBusinessPageSEO(businessPage) {
    const title = businessPage.seoTitle || businessPage.title || this.defaultTitle;
    const description = businessPage.seoDescription || businessPage.excerpt || this.defaultDescription;
    const image = businessPage.heroImage?.asset?.url || this.defaultImage;
    const url = `${this.defaultUrl}/pages/business.html?slug=${businessPage.slug.current}`;

    this.setBasicSEO({
      title: `${title} | ${this.siteName}`,
      description,
      image,
      url,
      type: 'article'
    });

    // Business-specific structured data
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: image,
      url: url,
      datePublished: businessPage._createdAt,
      dateModified: businessPage._updatedAt,
      author: {
        '@type': 'Organization',
        name: this.siteName
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.defaultUrl}/images/logo.png`
        }
      }
    });

    // Add business-specific keywords
    if (businessPage.tags && businessPage.tags.length > 0) {
      this.setMetaTag('keywords', businessPage.tags.join(', '));
    }
  }

  /**
   * Set SEO for tutorial pages
   */
  setTutorialSEO(tutorial) {
    const title = tutorial.seoTitle || tutorial.title || this.defaultTitle;
    const description = tutorial.seoDescription || tutorial.description || this.defaultDescription;
    const image = tutorial.featuredImage?.asset?.url || this.defaultImage;
    const url = `${this.defaultUrl}/pages/tutorial.html?slug=${tutorial.slug.current}`;

    this.setBasicSEO({
      title: `${title} | ${this.siteName}`,
      description,
      image,
      url,
      type: 'article'
    });

    // Tutorial-specific structured data (HowTo schema)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      description,
      image: image,
      url: url,
      datePublished: tutorial._createdAt,
      dateModified: tutorial._updatedAt,
      author: {
        '@type': 'Organization',
        name: this.siteName
      },
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: tutorial.estimatedCost || '0'
      },
      totalTime: tutorial.estimatedTime || 'PT1H',
      difficulty: tutorial.difficulty || 'Beginner'
    };

    // Add steps if available
    if (tutorial.steps && tutorial.steps.length > 0) {
      structuredData.step = tutorial.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
        url: `${url}#step-${index + 1}`,
        image: step.image?.asset?.url
      }));
    }

    // Add materials if available
    if (tutorial.materials && tutorial.materials.length > 0) {
      structuredData.supply = tutorial.materials.map(material => ({
        '@type': 'HowToSupply',
        name: material.name,
        requiredQuantity: material.quantity
      }));
    }

    this.setStructuredData(structuredData);

    // Tutorial-specific meta tags
    if (tutorial.difficulty) {
      this.setMetaTag('tutorial:difficulty', tutorial.difficulty);
    }
    if (tutorial.estimatedTime) {
      this.setMetaTag('tutorial:duration', tutorial.estimatedTime);
    }
    if (tutorial.category) {
      this.setMetaTag('tutorial:category', tutorial.category);
    }
  }

  /**
   * Set SEO for FAQ pages
   */
  setFAQSEO(faqs, searchTerm = null, category = null) {
    let title = 'Frequently Asked Questions';
    let description = 'Find answers to common questions about mushroom cultivation, mycology, and growing practices.';

    if (searchTerm) {
      title = `FAQ: ${searchTerm}`;
      description = `Find answers about ${searchTerm} and mushroom cultivation practices.`;
    } else if (category) {
      title = `FAQ: ${category}`;
      description = `Frequently asked questions about ${category} in mushroom cultivation.`;
    }

    const url = `${this.defaultUrl}/pages/faq.html${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}${category ? `?category=${encodeURIComponent(category)}` : ''}`;

    this.setBasicSEO({
      title: `${title} | ${this.siteName}`,
      description,
      image: this.defaultImage,
      url,
      type: 'website'
    });

    // FAQ structured data
    if (faqs && faqs.length > 0) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };

      this.setStructuredData(structuredData);
    }
  }

  /**
   * Set basic SEO meta tags
   */
  setBasicSEO({ title, description, image, url, type = 'website' }) {
    // Basic meta tags
    document.title = title;
    this.setMetaTag('description', description);
    
    // Open Graph tags
    this.setMetaProperty('og:title', title);
    this.setMetaProperty('og:description', description);
    this.setMetaProperty('og:image', image);
    this.setMetaProperty('og:url', url);
    this.setMetaProperty('og:type', type);
    this.setMetaProperty('og:site_name', this.siteName);

    // Twitter Card tags
    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', title);
    this.setMetaTag('twitter:description', description);
    this.setMetaTag('twitter:image', image);

    // Canonical URL
    this.setCanonicalUrl(url);

    // Additional meta tags
    this.setMetaTag('robots', 'index, follow');
    this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  /**
   * Set meta tag with name attribute
   */
  setMetaTag(name, content) {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  }

  /**
   * Set meta tag with property attribute (for Open Graph)
   */
  setMetaProperty(property, content) {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  }

  /**
   * Set canonical URL
   */
  setCanonicalUrl(url) {
    let linkTag = document.querySelector('link[rel="canonical"]');
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.setAttribute('rel', 'canonical');
      document.head.appendChild(linkTag);
    }
    linkTag.setAttribute('href', url);
  }

  /**
   * Set structured data (JSON-LD)
   */
  setStructuredData(data) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Set breadcrumb structured data
   */
  setBreadcrumbs(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    this.setStructuredData(structuredData);
  }

  /**
   * Update page meta tags dynamically (useful for SPAs)
   */
  updateSEO(data) {
    if (data.title) {
      document.title = data.title;
      this.setMetaProperty('og:title', data.title);
      this.setMetaTag('twitter:title', data.title);
    }

    if (data.description) {
      this.setMetaTag('description', data.description);
      this.setMetaProperty('og:description', data.description);
      this.setMetaTag('twitter:description', data.description);
    }

    if (data.image) {
      this.setMetaProperty('og:image', data.image);
      this.setMetaTag('twitter:image', data.image);
    }

    if (data.url) {
      this.setMetaProperty('og:url', data.url);
      this.setCanonicalUrl(data.url);
    }
  }

  /**
   * Set loading state meta (useful for showing loading in search results)
   */
  setLoadingState() {
    this.setMetaTag('robots', 'noindex, nofollow');
    document.title = 'Loading... | MYCOgenesis';
  }

  /**
   * Set error state meta
   */
  setErrorState(errorType = '404') {
    this.setMetaTag('robots', 'noindex, nofollow');
    
    if (errorType === '404') {
      document.title = 'Page Not Found | MYCOgenesis';
      this.setMetaTag('description', 'The requested page could not be found.');
    } else {
      document.title = 'Error | MYCOgenesis';
      this.setMetaTag('description', 'An error occurred while loading this page.');
    }
  }

  /**
   * Clear all SEO data (useful for cleanup)
   */
  clearSEO() {
    // Remove dynamic meta tags
    const dynamicTags = [
      'meta[name="description"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'meta[name="keywords"]',
      'link[rel="canonical"]',
      'script[type="application/ld+json"]'
    ];

    dynamicTags.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Reset title
    document.title = this.defaultTitle;
  }

  /**
   * Validate current SEO setup
   */
  validateSEO() {
    const issues = [];

    if (!document.title || document.title === this.defaultTitle) {
      issues.push('Missing or default page title');
    }

    if (!document.querySelector('meta[name="description"]')) {
      issues.push('Missing meta description');
    }

    if (!document.querySelector('meta[property="og:title"]')) {
      issues.push('Missing Open Graph title');
    }

    if (!document.querySelector('link[rel="canonical"]')) {
      issues.push('Missing canonical URL');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Export the class
window.SEOManager = SEOManager;

// Create a global instance
window.seoManager = new SEOManager();
