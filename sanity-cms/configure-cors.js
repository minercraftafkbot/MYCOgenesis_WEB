/**
 * Sanity CORS Configuration Script
 * Run this to configure CORS settings for your Sanity project
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gae98lpg',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN // You'll need to set this
});

async function configureCORS() {
  try {
    const corsOrigins = [
      'http://localhost:3000',
      'http://localhost:8080', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'https://myc-ogenesis-web.vercel.app',
      'https://mycogenesis.vercel.app',
      // Add any other domains you need
    ];

    console.log('🔧 Configuring CORS for Sanity project...');
    console.log('📍 Allowed origins:', corsOrigins);

    // Note: This requires a management token with proper permissions
    // For now, this is a template. You'll need to configure CORS through:
    // 1. Sanity CLI: `sanity cors add https://myc-ogenesis-web.vercel.app`
    // 2. Sanity Dashboard: manage.sanity.io

    console.log('✅ CORS configuration template ready');
    console.log('');
    console.log('🚀 To configure CORS, run these commands:');
    console.log('');
    console.log('cd sanity-cms');
    console.log('npx sanity cors add https://myc-ogenesis-web.vercel.app');
    console.log('npx sanity cors add http://localhost:3000');
    console.log('npx sanity cors add http://localhost:8080');
    console.log('');
    console.log('Or visit: https://manage.sanity.io/projects/gae98lpg');

  } catch (error) {
    console.error('❌ Error configuring CORS:', error);
  }
}

configureCORS();
