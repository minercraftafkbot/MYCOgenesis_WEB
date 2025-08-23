# MYCOgenesis CMS

A comprehensive Content Management System for the MYCOgenesis website, built with vanilla JavaScript and Firebase.

## Features

- **Role-based Authentication**: Admin, Editor, and User roles with granular permissions
- **User Management**: Complete user profile and role management system
- **Security**: Firebase security rules and input validation
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Modular Architecture**: Clean separation of concerns with ES6 modules

## Setup Instructions

### Prerequisites

1. **Firebase Project**: Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. **Firebase Services**: Enable the following services:
   - Authentication (Email/Password provider)
   - Firestore Database
   - Storage

### Installation Steps

1. **Configure Firebase**:
   - Copy your Firebase configuration from the Firebase Console
   - Update `cms/js/config/firebase-config.js` with your actual Firebase config

2. **Deploy Security Rules**:
   - Deploy the Firestore rules from `cms/firebase/firestore.rules`
   - Deploy the Storage rules from `cms/firebase/storage.rules`

3. **Initial Setup**:
   - Open `cms/setup/setup.html` in your browser
   - Create your initial admin account
   - This will set up the database structure and create your first admin user

4. **Access CMS**:
   - Open `cms/index.html` in your browser
   - Sign in with your admin credentials

### Firebase Configuration

Update the `firebaseConfig` object in `cms/js/config/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### Security Rules Deployment

#### Firestore Rules
Copy the contents of `cms/firebase/firestore.rules` to your Firestore Rules in the Firebase Console.

#### Storage Rules
Copy the contents of `cms/firebase/storage.rules` to your Storage Rules in the Firebase Console.

## User Roles and Permissions

### Admin
- Full system access
- User management and role assignment
- All content creation, editing, and deletion
- System settings and analytics

### Editor
- Content creation and editing
- Blog post management
- Analytics viewing
- Cannot manage users or system settings

### User
- Basic profile management
- View dashboard
- Limited content interaction

## File Structure

```
cms/
├── index.html              # Main CMS interface
├── css/
│   └── cms.css            # Custom CMS styles
├── js/
│   ├── config/
│   │   └── firebase-config.js    # Firebase configuration
│   ├── auth/
│   │   ├── auth-manager.js       # Authentication management
│   │   └── role-manager.js       # Role-based access control
│   └── core/
│       └── app.js               # Main application logic
├── firebase/
│   ├── firestore.rules          # Firestore security rules
│   └── storage.rules            # Storage security rules
├── setup/
│   ├── setup.html              # Initial setup page
│   └── init-admin.js           # Admin setup script
└── README.md                   # This file
```

## Database Collections

### users
User profiles with roles and preferences

### blogs
Blog posts with content, metadata, and publishing status

### products
Product information and images

### categories
Content categories for blogs and products

### site-settings
General site configuration and settings

### contact-inquiries
Contact form submissions

### analytics
Usage analytics and metrics

### audit-logs
System activity logs

## Development

### Adding New Features
1. Create new modules in the appropriate `js/` subdirectory
2. Import and use in `js/core/app.js`
3. Update security rules if new database operations are needed
4. Test with different user roles

### Security Considerations
- All database operations are protected by Firestore security rules
- User roles are verified server-side
- Input validation is performed on both client and server
- File uploads are restricted by type and size

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Ensure your Firebase config is correct and all required services are enabled
2. **Permission denied**: Check that security rules are deployed and user has appropriate role
3. **Setup fails**: Verify that Authentication and Firestore are enabled in your Firebase project

### Support

For issues or questions, check the Firebase documentation or create an issue in the project repository.

## Next Steps

This foundation provides the authentication and role management system. The next tasks will implement:
- Blog management interface
- Product management system
- User management dashboard
- Analytics and reporting
- Content publishing workflow

Each feature will build upon this secure foundation with proper role-based access control.