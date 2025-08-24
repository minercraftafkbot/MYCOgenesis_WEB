# MYCOgenesis CMS Setup Guide

## 🎉 Congratulations! Your Sanity CMS is Ready!

Your Sanity Studio is now running at: **http://localhost:3333/**

## 📋 Next Steps

### 1. Get Your Project Information
Run this command to get your project details:
```bash
npx sanity manage
```

This will open your project in the browser where you can find:
- **Project ID** (you'll need this for integration)
- **Dataset name** (usually 'production')

### 2. Update Integration File
1. Open `../js/services/sanity-service.js`
2. Replace `'YOUR_PROJECT_ID'` with your actual Sanity project ID
3. The file is already configured to connect to your website!

### 3. Deploy Your Studio (Optional)
To make your CMS available online:
```bash
npx sanity deploy
```
Choose a studio hostname like: `mycogenesis-cms`

## 🍄 Content Types Available

### Products (Mushroom Varieties)
Perfect for managing your mushroom products:
- ✅ Product name, description, images
- ✅ Availability status (Available, Out of Stock, Seasonal)
- ✅ Health benefits and cooking tips
- ✅ Nutritional information
- ✅ Featured products for homepage
- ✅ SEO settings

### Categories
Organize your mushroom types:
- ✅ Category names and descriptions
- ✅ Category images and colors
- ✅ Sort order management

### Blog Posts
Share your mushroom expertise:
- ✅ Rich text editor with images
- ✅ Author information
- ✅ Categories and tags
- ✅ Featured posts
- ✅ SEO optimization
- ✅ Publishing workflow

## 🔧 Integration with Your Website

### Using the Sanity Service
Your website can now fetch content from Sanity:

```javascript
import sanityService from './js/services/sanity-service.js';

// Get featured products for homepage
const featuredProducts = await sanityService.getFeaturedProducts(6);

// Get all products
const allProducts = await sanityService.getAvailableProducts();

// Get blog posts
const blogPosts = await sanityService.getBlogPosts({ limit: 10, featured: true });
```

### Real-time Updates
Content updates in Sanity will automatically reflect on your website!

## 🎯 Content Strategy

### Start with These Content Types:

1. **Create Categories First**
   - Gourmet Mushrooms
   - Medicinal Mushrooms  
   - Seasonal Varieties
   - Mushroom Kits

2. **Add Your Products**
   - Oyster Mushrooms
   - Shiitake Mushrooms
   - Lion's Mane
   - Button/Cremini/Portobello

3. **Write Blog Posts**
   - Growing tips
   - Health benefits
   - Recipes
   - Sustainability stories

## 🚀 Advanced Features

### Image Optimization
- Images are automatically optimized and served as WebP
- Responsive image sizes for different screen sizes
- CDN delivery for fast loading

### SEO Ready
- Meta titles and descriptions
- Structured data support
- Search engine friendly URLs

### User Roles (Future)
- Admin: Full access to all content
- Editor: Can create and edit content
- Viewer: Read-only access

## 🔒 Security

Your Sanity project is secure by default:
- Only authenticated users can edit content
- API tokens for production integration
- Role-based access control

## 📞 Support

If you need help:
1. Check Sanity documentation: https://www.sanity.io/docs
2. Join the Sanity Community: https://www.sanity.io/community
3. Contact support: support@sanity.io

## 🎊 You're All Set!

Your MYCOgenesis CMS is ready to power your mushroom business website. Start by:
1. Opening http://localhost:3333/ in your browser
2. Creating your first category
3. Adding your first mushroom product
4. Writing your first blog post

Happy content managing! 🍄✨
