# MYCOgenesis Website & CMS Setup Guide

## 🏗️ Project Structure

```
root/
├── index.html                    # Main website homepage
├── auth/                         # User authentication pages
│   ├── login.html               # Customer login
│   └── signup.html              # Customer registration
├── blog/                         # Blog section
│   ├── blog.html               # Blog listing page
│   └── blog-post.html          # Individual blog posts
├── js/
│   ├── config/
│   │   └── firebase-config.js   # 🔥 Unified Firebase config
│   └── auth/                    # Main website auth logic
├── css/                         # Website styles
├── images/                      # Website assets
└── cms/                         # 🎛️ Content Management System
    ├── index.html               # CMS admin interface
    ├── setup/setup.html         # Initial CMS setup
    └── js/auth/                 # CMS-specific auth logic
```

## 🔥 Firebase Configuration

### Single Configuration File

Both the main website and CMS use the same Firebase project configuration located at:
**`js/config/firebase-config.js`**

### Setup Steps

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage

2. **Update Configuration**
   - Copy your Firebase config from the console
   - Replace the placeholder values in `js/config/firebase-config.js`

3. **Deploy Security Rules**
   - Copy `cms/firebase/firestore.rules` to your Firestore Rules
   - Copy `cms/firebase/storage.rules` to your Storage Rules

4. **Initialize CMS**
   - Open `cms/setup/setup.html` in your browser
   - Create your first admin account
   - This sets up the database structure

## 🎯 User Flow

### Customer Journey (Main Website)

1. **Browse** → `index.html` (homepage)
2. **Register** → `auth/signup.html` (customer registration)
3. **Login** → `auth/login.html` (customer login)
4. **Read Blog** → `blog/blog.html` (blog posts)

### Admin Journey (CMS)

1. **Access CMS** → `cms/index.html` (admin login)
2. **Manage Content** → CMS dashboard (role-based access)
3. **Create Posts** → Blog management interface
4. **Manage Users** → User administration (admin only)

## 🔐 Authentication Systems

### Two Separate Auth Systems

#### 1. Main Website Auth (`js/auth/`)

- **Purpose**: Customer registration and login
- **SDK**: Firebase v10.3.1 (modular)
- **Users**: Regular customers
- **Features**: Basic auth, profile management

#### 2. CMS Auth (`cms/js/auth/`)

- **Purpose**: Admin and content management
- **SDK**: Firebase v9.0.0 (compat)
- **Users**: Admin, Editor, User roles
- **Features**: Role-based access, permission system

### User Roles (CMS Only)

- **Admin**: Full system access, user management
- **Editor**: Content creation and editing
- **User**: Basic profile access

## 🚀 Deployment

### Development

1. Serve files from a local web server (not file://)
2. Update Firebase config with your project details
3. Run CMS setup to create admin account

### Production

1. Deploy to web hosting (Netlify, Vercel, etc.)
2. Ensure Firebase rules are deployed
3. Test both customer and admin flows

## 🔧 Integration Points

### CMS Access from Main Website

- Small admin icon (⚙️) in the main navigation
- Only visible to logged-in users with admin roles
- Direct link to `cms/index.html`

### Shared Firebase Project

- Same authentication database
- Shared user profiles
- Consistent security rules

## 📝 Content Management

### Blog Posts

- Created in CMS by Editors/Admins
- Displayed on main website blog section
- Real-time updates from Firestore

### Products

- Managed in CMS by Admins
- Featured on main website homepage
- Image storage in Firebase Storage

### User Management

- Customer accounts created via main website
- Admin accounts created via CMS setup
- Role assignment through CMS admin panel

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check that config file has correct values
   - Ensure Firebase services are enabled

2. **Permission denied**
   - Verify security rules are deployed
   - Check user has appropriate role

3. **CMS setup fails**
   - Ensure Authentication is enabled
   - Check browser console for errors

### Support

- Check Firebase console for errors
- Review browser developer tools
- Verify security rules syntax

## 🎨 Customization

### Styling

- Main website: `css/index.css`
- CMS: `cms/css/cms.css`
- Both use Tailwind CSS

### Adding Features

- Main website: Add to appropriate section
- CMS: Follow modular structure in `cms/js/`
- Update security rules as needed

This setup provides a complete website with integrated content management, suitable for the MYCOgenesis mushroom business.
