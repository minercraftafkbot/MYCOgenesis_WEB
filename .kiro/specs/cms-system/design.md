# Design Document

## Overview

The MYCOgenesis CMS will be a modern, web-based content management system built on top of the existing Firebase infrastructure. It will provide a clean, intuitive interface for managing all dynamic content while maintaining the current website's design language and performance characteristics. The system will be implemented as a Single Page Application (SPA) using vanilla JavaScript and Firebase services for backend functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public Site   │    │   CMS Admin     │    │   Firebase      │
│   (Frontend)    │◄──►│   Dashboard     │◄──►│   Backend       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static HTML   │    │   Admin SPA     │    │   Firestore     │
│   + Dynamic     │    │   (JavaScript)  │    │   Storage       │
│   Content       │    │                 │    │   Auth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3 (Tailwind CSS)
- **Backend**: Firebase (Firestore, Authentication, Storage, Functions)
- **Rich Text Editor**: Quill.js or TinyMCE
- **Image Processing**: Firebase Storage with client-side optimization
- **State Management**: Custom lightweight state manager
- **Build Tools**: None (keeping it simple with ES6 modules)

## Components and Interfaces

### 1. Authentication & Authorization System

**Role-Based Access Control (RBAC)**
```javascript
// User roles hierarchy
const USER_ROLES = {
  ADMIN: 'admin',        // Full system access
  EDITOR: 'editor',      // Content creation/editing
  USER: 'user'           // Basic user features
};

// Permission matrix
const PERMISSIONS = {
  'blog.create': ['admin', 'editor'],
  'blog.edit': ['admin', 'editor'],
  'blog.delete': ['admin'],
  'products.manage': ['admin'],
  'users.manage': ['admin'],
  'analytics.view': ['admin', 'editor']
};
```

### 2. CMS Dashboard Interface

**Main Dashboard Components:**
- **Sidebar Navigation**: Role-based menu items
- **Content Overview**: Quick stats and recent activity
- **Quick Actions**: Common tasks like "New Post", "Upload Image"
- **Notifications**: System alerts and pending approvals

**Dashboard Layout:**
```html
<div class="cms-dashboard">
  <aside class="sidebar">
    <nav class="cms-nav">
      <!-- Role-based navigation items -->
    </nav>
  </aside>
  <main class="main-content">
    <header class="dashboard-header">
      <!-- User info, notifications, search -->
    </header>
    <section class="content-area">
      <!-- Dynamic content based on current view -->
    </section>
  </main>
</div>
```

### 3. Blog Management System

**Blog Post Data Structure:**
```javascript
const BlogPost = {
  id: 'string',
  title: 'string',
  slug: 'string',
  content: 'string', // Rich HTML content
  excerpt: 'string',
  author: {
    id: 'string',
    name: 'string',
    email: 'string'
  },
  category: 'string',
  tags: ['string'],
  featuredImage: {
    url: 'string',
    alt: 'string',
    caption: 'string'
  },
  seo: {
    metaTitle: 'string',
    metaDescription: 'string',
    keywords: ['string']
  },
  status: 'draft|published|archived',
  publishedAt: 'timestamp',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  viewCount: 'number',
  featured: 'boolean'
};
```

**Rich Text Editor Integration:**
- Quill.js for WYSIWYG editing
- Custom toolbar with brand-appropriate styling
- Image upload with drag-and-drop
- Code syntax highlighting for technical posts
- Auto-save functionality

### 4. Product Management System

**Product Data Structure:**
```javascript
const Product = {
  id: 'string',
  name: 'string',
  slug: 'string',
  description: 'string',
  shortDescription: 'string',
  images: [{
    url: 'string',
    alt: 'string',
    isPrimary: 'boolean'
  }],
  category: 'string',
  nutritionalInfo: {
    calories: 'number',
    protein: 'number',
    fiber: 'number',
    // ... other nutritional data
  },
  healthBenefits: ['string'],
  cookingTips: 'string',
  availability: 'available|out-of-stock|seasonal',
  featured: 'boolean',
  order: 'number', // For display ordering
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};
```

### 5. User Management System

**User Profile Extension:**
```javascript
const UserProfile = {
  uid: 'string', // Firebase Auth UID
  email: 'string',
  displayName: 'string',
  role: 'admin|editor|user',
  profile: {
    firstName: 'string',
    lastName: 'string',
    bio: 'string',
    avatar: 'string'
  },
  preferences: {
    favoriteArticles: ['string'],
    favoriteProducts: ['string'],
    emailNotifications: 'boolean'
  },
  activity: {
    lastLogin: 'timestamp',
    postsCreated: 'number',
    postsEdited: 'number'
  },
  status: 'active|inactive|suspended',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};
```

## Data Models

### Firestore Collections Structure

```
/blogs
  /{blogId}
    - title, content, author, status, etc.
    /comments (subcollection)
      /{commentId}
        - author, content, timestamp, approved

/products
  /{productId}
    - name, description, images, availability, etc.

/users
  /{userId}
    - profile, preferences, activity, role

/categories
  /{categoryId}
    - name, description, type (blog|product)

/site-settings
  /general
    - siteName, description, contact info
  /seo
    - default meta tags, analytics IDs
  /features
    - enabled features, maintenance mode
```

### Firebase Storage Structure

```
/images
  /blog
    /{blogId}
      - featured.jpg
      - content-images/
  /products
    /{productId}
      - primary.jpg
      - gallery/
  /users
    /{userId}
      - avatar.jpg
```

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Retry mechanism with exponential backoff
- **Authentication Errors**: Automatic redirect to login
- **Permission Errors**: User-friendly messages with suggested actions
- **Validation Errors**: Real-time form validation with clear feedback

### Server-Side Error Handling (Firebase Functions)
- **Data Validation**: Comprehensive input sanitization
- **Rate Limiting**: Prevent abuse and spam
- **Error Logging**: Structured logging for debugging
- **Graceful Degradation**: Fallback mechanisms for service failures

## Testing Strategy

### Unit Testing
- **Utility Functions**: Data validation, formatting, calculations
- **State Management**: CRUD operations, state transitions
- **Authentication**: Role checking, permission validation

### Integration Testing
- **Firebase Integration**: Database operations, file uploads
- **Authentication Flow**: Login, logout, role assignment
- **Content Publishing**: Draft to published workflow

### End-to-End Testing
- **User Workflows**: Complete content creation and publishing process
- **Admin Tasks**: User management, system configuration
- **Public Site Integration**: Verify CMS changes appear on public site

### Performance Testing
- **Load Testing**: Multiple concurrent users in CMS
- **Database Performance**: Query optimization and indexing
- **Image Upload**: Large file handling and optimization

## Security Considerations

### Authentication & Authorization
- **Firebase Security Rules**: Strict database access controls
- **Role-Based Permissions**: Granular access control
- **Session Management**: Secure token handling
- **Password Policies**: Strong password requirements

### Data Protection
- **Input Sanitization**: XSS and injection prevention
- **Content Validation**: Malicious content detection
- **File Upload Security**: Type validation and virus scanning
- **Audit Logging**: Track all administrative actions

### Infrastructure Security
- **HTTPS Enforcement**: All communications encrypted
- **CORS Configuration**: Restrict cross-origin requests
- **Rate Limiting**: Prevent brute force attacks
- **Backup Strategy**: Regular automated backups

## Performance Optimization

### Frontend Performance
- **Lazy Loading**: Load content as needed
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Separate bundles for different features
- **Caching Strategy**: Aggressive caching for static assets

### Backend Performance
- **Database Indexing**: Optimize query performance
- **Connection Pooling**: Efficient database connections
- **CDN Integration**: Global content delivery
- **Compression**: Gzip/Brotli compression for all assets

## Deployment Strategy

### Development Environment
- **Local Development**: Firebase emulators for testing
- **Version Control**: Git with feature branch workflow
- **Code Review**: Pull request process with automated checks

### Production Deployment
- **Staging Environment**: Pre-production testing
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Strategy**: Quick reversion capability
- **Monitoring**: Real-time performance and error tracking

## Maintenance and Updates

### Content Backup
- **Automated Backups**: Daily Firestore exports
- **Version Control**: Content change history
- **Recovery Procedures**: Documented restoration process

### System Updates
- **Dependency Management**: Regular security updates
- **Feature Rollouts**: Gradual feature deployment
- **User Training**: Documentation and tutorials
- **Support System**: Help desk and user guides