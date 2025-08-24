# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MYCOgenesis_WEB is a static website for a mushroom farming company that combines modern web technologies with Firebase backend services. The project showcases sustainable mushroom farming with IoT integration and provides a content management system for dynamic content.

## Architecture

### Frontend Architecture
- **Main Website**: Static HTML with vanilla JavaScript modules
- **CSS Framework**: TailwindCSS (loaded via CDN)
- **Font**: Inter from Google Fonts
- **JavaScript**: ES6 modules with dynamic imports
- **Build System**: No build step required - runs directly in browser

### Backend Services
- **Firebase v10.x**: Authentication, Firestore database, Storage, Analytics
- **Authentication**: Firebase Auth with social logins and email/password
- **Database**: Firestore for user profiles, blog posts, and product data
- **Real-time Updates**: Firestore real-time listeners for dynamic content
- **File Storage**: Firebase Storage for images and media

### Key Components
```
/
├── index.html              # Main homepage
├── firebase.json           # Firebase hosting configuration
├── auth/                   # Authentication pages
│   ├── login.html
│   └── signup.html
├── blog/                   # Blog section
│   ├── blog.html
│   └── blog-post.html
├── css/                    # Stylesheets
│   ├── index.css          # Main styles
│   └── auth/auth.css      # Authentication styles
├── js/                     # JavaScript modules
│   ├── shared-auth.js     # Authentication handler
│   ├── firebase-init.js   # Firebase initialization
│   ├── config/            # Configuration files
│   ├── services/          # Service layer for data
│   ├── dynamic-content/   # Content loaders
│   └── utils/             # Utility functions
├── images/                 # Static assets
└── cms/                    # Content Management System (empty)
```

## Development Commands

### Local Development
```bash
# Serve files locally (Python 3)
python -m http.server 8000

# Alternative with Node.js
npx http-server -p 8000

# Open in browser
start http://localhost:8000  # Windows
open http://localhost:8000   # macOS
```

### Firebase Commands
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy to Firebase Hosting
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Serve locally with Firebase emulators
firebase serve

# Start Firebase emulators (includes Firestore, Auth, Storage)
firebase emulators:start

# Start emulators with UI
firebase emulators:start --inspect-functions
```

### Content Management
```bash
# Access CMS (when implemented)
# Navigate to /cms/index.html

# Check Firebase rules
firebase firestore:rules:get

# Deploy security rules
firebase deploy --only firestore:rules
```

## Key Development Patterns

### JavaScript Module Structure
- **ES6 Modules**: All JavaScript uses ES6 import/export syntax
- **Dynamic Imports**: Firebase SDK loaded dynamically for better performance
- **Class-based Components**: Major functionality organized in classes
- **Event-driven Architecture**: Custom events for cross-component communication

### Authentication Flow
1. `SharedAuthHandler` manages authentication state across all pages
2. Firebase Auth integration with automatic UI updates
3. User profiles stored in Firestore with fallback to Auth data
4. Real-time authentication state synchronization

### Content Management
1. **Static Content**: Direct HTML/CSS for fixed content
2. **Dynamic Content**: Loaded from Firestore via service classes
3. **Real-time Updates**: Firestore listeners for live content updates
4. **Image Management**: Firebase Storage with CDN delivery

### Responsive Design
- **Mobile-first**: TailwindCSS with responsive breakpoints
- **Progressive Enhancement**: Works without JavaScript
- **Touch-friendly**: Mobile menu and touch interactions
- **Accessibility**: ARIA attributes and keyboard navigation

## Firebase Configuration

### Services Used
- **Authentication**: Email/password, social providers
- **Firestore**: Document-based NoSQL database
- **Storage**: File upload and CDN hosting
- **Hosting**: Static site deployment
- **Analytics**: User behavior tracking (optional)

### Database Structure (Firestore)
```
users/
  {userId}/             # User profiles and settings
    uid: string         # Firebase Auth UID
    email: string       # User email
    role: string        # 'user', 'editor', 'admin'
    status: string      # 'active', 'inactive'
    createdAt: timestamp
    updatedAt: timestamp

blogs/
  {blogId}/             # Blog posts
    title: string
    content: string
    status: string      # 'draft', 'published'
    author: object      # { id, name, email }
    createdAt: timestamp
    updatedAt: timestamp

products/
  {productId}/          # Mushroom varieties and products
    name: string
    description: string
    availability: string
    images: array
    createdAt: timestamp
    updatedAt: timestamp

categories/
  {categoryId}/         # Product categories

site-settings/
  {settingId}/          # Site configuration

contact-inquiries/
  {inquiryId}/          # Contact form submissions

analytics/
  {docId}/              # Page views and user analytics

audit-logs/
  {logId}/              # User action logs (immutable)

system-logs/
  {logId}/              # System operation logs (immutable)

setup-test/
  {testId}/             # Temporary test documents
```

### Storage Structure (Firebase Storage)
```
images/
  blog/
    {blogId}/
      {imageId}         # Blog post images (editors+ can upload)
  products/
    {productId}/
      {imageId}         # Product images (admin-only)
  users/
    {userId}/
      {imageId}         # User avatars (self-upload)

uploads/
  {userId}/
    {fileName}          # General file uploads (editors+)

temp/
  {userId}/
    {fileName}          # Temporary uploads (auto-deleted after 24h)
```

### Security Rules (Firebase v10.13.2)

#### User Permissions
- **Users**: Can read/create/update their own profile only
- **Editors**: Can create and edit blog posts, read analytics
- **Admins**: Full access to all collections, can manage user roles

#### Collection-Specific Rules
- **users/**: Self-registration allowed, role changes restricted to admins
- **blogs/**: Public read for published posts, editors+ can write
- **products/**: Public read access, admin-only write access
- **categories/**: Public read access, admin-only write access  
- **site-settings/**: Public read access, admin-only write access
- **contact-inquiries/**: Anyone can create, admin-only read/manage
- **analytics/**: System can write with rate limiting, editors+ can read
- **audit-logs/**: Auto-created for authenticated users, immutable, admin-only read
- **system-logs/**: System-generated, immutable, admin-only read
- **setup-test/**: Full access for testing purposes

#### Storage Security Rules
- **images/blog/**: Public read, editors+ can upload blog images
- **images/products/**: Public read, admin-only write access
- **images/users/**: Public read, users can upload their own avatars
- **uploads/{userId}/**: Authenticated read, editors+ can upload files
- **temp/{userId}/**: User-specific temporary uploads (24h auto-cleanup)

#### File Upload Validation
- **Image Files**: JPEG, PNG, GIF, WebP, SVG (10MB limit)
- **Document Files**: PDF, TXT, MD, DOC, DOCX (50MB limit)
- **Filename Validation**: Alphanumeric, dots, dashes, underscores only (100 char max)
- **Content-Type Checking**: Strict MIME type validation
- **Size Limits**: Different limits for images vs documents

#### Key Security Features
- **Role-based Access**: Hierarchical permission system (user < editor < admin)
- **User Status Checking**: Only 'active' users can perform operations
- **Timestamp Validation**: Required createdAt/updatedAt fields
- **Circular Dependency Fix**: Special handling for user profile creation
- **Rate Limiting**: Document size limits for analytics
- **Immutable Logs**: Audit and system logs cannot be modified/deleted
- **File Type Validation**: Strict content-type and size checking for uploads
- **Path-based Security**: Role-based access control for different storage paths

## Content Updates

### Adding New Pages
1. Create HTML file with consistent header/footer structure
2. Include `shared-auth.js` for authentication
3. Add navigation links to all existing pages
4. Update Firebase hosting configuration if needed

### Managing Dynamic Content
1. **Products**: Use `ProductLoader` class to fetch from Firestore
2. **Blog Posts**: Use `BlogLoader` class for article management
3. **Real-time Updates**: Content updates automatically via Firestore listeners
4. **Image Uploads**: Use Firebase Storage with proper naming conventions

### Styling Guidelines
- Use TailwindCSS utility classes consistently
- Follow existing color scheme (teal primary, stone secondary)
- Maintain responsive design patterns
- Use consistent spacing and typography scales

## Performance Considerations

### Loading Strategy
- TailwindCSS loaded from CDN for fast initial load
- Firebase SDK loaded asynchronously to avoid blocking
- Images optimized and served from Firebase Storage CDN
- Minimal custom CSS to reduce bundle size

### Caching Strategy
- Static assets cached by Firebase Hosting
- Firestore offline persistence enabled
- Service worker implementation recommended for PWA features

## Security Considerations

### Client-side Security
- Firebase security rules protect database access
- No sensitive API keys exposed in client code
- Input validation on all user-generated content
- XSS prevention through proper escaping

### Authentication Security
- Strong password requirements enforced
- Rate limiting on authentication attempts
- Secure session management via Firebase
- Proper logout and session cleanup

## Troubleshooting

### Common Issues
1. **Firebase Connection**: Check network connectivity and project configuration
2. **Authentication Errors**: Verify Firebase Auth setup and domain configuration
3. **CORS Issues**: Ensure proper Firebase hosting setup for static files
4. **Module Loading**: Check ES6 module syntax and import paths
5. **Permission Denied**: Check Firestore security rules and user authentication state
6. **Circular Dependency**: User profile creation requires special handling in rules
7. **Rate Limiting**: Analytics writes may fail if document size exceeds limits
8. **File Upload Failures**: Check file type, size limits, and Storage security rules
9. **Storage Permission Denied**: Verify user authentication and role-based access
10. **Invalid File Types**: Ensure uploaded files match allowed MIME types

### Debug Commands
```javascript
// Check Firebase connection
window.firebaseHealthCheck()

// Test authentication
window.mainAuthHandler.getCurrentUser()

// Reload dynamic content
window.productLoader.loadFeaturedProducts()
```

### Development Tools
- Browser DevTools for debugging JavaScript modules
- Firebase Console for backend data management
- Network tab for monitoring API calls and performance
- Lighthouse for performance and accessibility audits
