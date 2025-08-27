import { createClient } from '@sanity/client';

    console.log('Sanity Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID); // Add this line

    export const sanityClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
      apiVersion: 'v2024-01-01', // use a UTC date in YYYY-MM-DD format
      useCdn: true, // use a CDN to fetch data wherever possible
    });
