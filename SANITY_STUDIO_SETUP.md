# 🎨 Sanity Studio Integration Guide

Complete setup guide for MYCOgenesis Sanity Studio integration.

## 📋 Current Status

✅ **Backend Integration**: Sanity CMS fully integrated with frontend  
✅ **Content Schemas**: All content types defined (Products, Blog, Categories, etc.)  
✅ **Frontend Connection**: Dynamic content loading from Sanity  
✅ **CMS Access System**: Smart authentication and role-based access  
❓ **Studio Deployment**: Needs deployment to hosted Sanity Studio

## 🚀 Quick Start

### Option 1: Local Development (Immediate Use)

```bash
# Start Sanity Studio locally
cd sanity-cms
npm install
npm run dev

# Studio will be available at http://localhost:3333
```

### Option 2: Deploy to Sanity Cloud (Recommended)

```bash
# Deploy your studio to Sanity's hosted service
cd sanity-cms
npm run deploy
```

When prompted, choose a studio hostname (e.g., `mycogenesis`).  
Your studio will be available at: `https://mycogenesis.sanity.studio`

## 🔧 CMS Access Flow

The homepage footer now includes a smart "CMS Studio" link that:

### 1. **Authentication Check**
- Verifies user is logged in
- Redirects to login if not authenticated
- Passes return URL for seamless access

### 2. **Role Verification**
- Checks user role (`editor` or `admin` required)
- Shows access denied message for regular users
- Provides instructions to request access

### 3. **Studio Selection**
- **Option A**: Deployed Sanity Studio (Professional)
- **Option B**: Local Development Studio
- Automatically provides setup instructions if needed

## 📊 Content Management Capabilities

Your integrated Sanity Studio provides:

### **Content Types Available:**
- 🍄 **Products**: Mushroom varieties with images, descriptions, availability
- 📝 **Blog Posts**: Rich text articles with media and SEO settings
- 🏷️ **Categories**: Product and content categorization
- ❓ **FAQs**: Frequently asked questions
- 🏢 **Business Pages**: Static page content management
- 📚 **Research Articles**: Scientific and educational content

### **Key Features:**
- ✨ **Rich Text Editor**: Advanced formatting and media embedding
- 📸 **Media Management**: Image upload, optimization, and CDN delivery
- 🔍 **SEO Tools**: Meta tags, descriptions, and structured data
- 👥 **Collaboration**: Real-time editing and version history
- 📱 **Mobile Friendly**: Responsive admin interface
- 🔐 **Role-Based Access**: Editor and admin permission levels

## 🛠️ Setup Instructions

### **For First-Time Setup:**

1. **Install Dependencies:**
   ```bash
   cd sanity-cms
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Access Studio:**
   - Local: http://localhost:3333
   - Or click "CMS Studio" in website footer

### **For Production Deployment:**

1. **Deploy Studio:**
   ```bash
   cd sanity-cms
   npm run deploy
   ```

2. **Choose Hostname:**
   - Enter desired subdomain (e.g., `mycogenesis`)
   - Studio will be: `https://mycogenesis.sanity.studio`

3. **Update Frontend:**
   - The CMS access function will automatically try the deployed URL first
   - Falls back to local development if deployed version unavailable

## 🔐 User Roles & Permissions

### **User Role Setup:**
Your Firebase user profiles need a `role` field with these values:

- **`user`**: Regular website users (no CMS access)
- **`editor`**: Content creators (CMS access, can create/edit content)
- **`admin`**: Full access (CMS access, user management, settings)

### **Setting User Roles:**
```javascript
// In Firebase Console or via admin script
await db.collection('users').doc(userId).update({
  role: 'editor' // or 'admin'
});
```

## 📝 Content Management Workflow

### **Adding Products:**
1. Open Sanity Studio
2. Navigate to "Products"
3. Click "Create new Product"
4. Fill in product details:
   - Name and description
   - Featured image
   - Availability status
   - Health benefits
   - SEO settings
5. Publish to make live on website

### **Creating Blog Posts:**
1. Go to "Blog Posts" in studio
2. Create new blog post
3. Use rich text editor for content
4. Add featured image
5. Set category and tags
6. Configure SEO settings
7. Publish when ready

### **Managing Media:**
- All images automatically optimized
- CDN delivery for fast loading
- Built-in image editing tools
- Automatic alt text management

## 🔗 Integration Status

### **Currently Integrated:**
- ✅ Homepage featured products section
- ✅ Homepage shop products section  
- ✅ Homepage blog preview section
- ✅ Real-time content updates
- ✅ SEO optimization
- ✅ Image optimization and CDN

### **Next Integration Targets:**
- 📄 Individual product pages
- 📝 Blog listing and detail pages
- ❓ FAQ page
- 🏢 Business/about pages

## 🚨 Troubleshooting

### **Studio Won't Load:**
1. Check if development server is running: `npm run dev`
2. Verify port 3333 is available
3. Check network connectivity
4. Review browser console for errors

### **Deployment Issues:**
1. Ensure you're logged into Sanity CLI: `sanity login`
2. Verify project ID in `sanity.config.js`
3. Check network connectivity
4. Try clearing deployment cache: `sanity deploy --force`

### **Content Not Appearing:**
1. Verify content is published in Sanity Studio
2. Check browser console for API errors
3. Confirm Sanity project ID in configuration
4. Test API connection with `sanity console`

## 📞 Support Resources

- **Sanity Documentation**: https://www.sanity.io/docs
- **Project Configuration**: `sanity-cms/sanity.config.js`
- **Content Schemas**: `sanity-cms/schemaTypes/`
- **CMS Access**: Click footer link or visit studio URL directly

---

**Your Sanity Studio integration is ready!** 🎉

Click the "CMS Studio" link in your website footer to start managing content.
