"use client";

import useSanityData from './useSanityData';
import { SanityImageSource } from '@sanity/image-url/lib/types/types'; // Assuming you might need this for image types
import { PortableTextBlock } from '@portabletext/types'; // Assuming your description is rich text

export interface SingleProduct {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description?: PortableTextBlock[]; // Assuming description is Portable Text
  shortDescription?: string;
  images?: {
    asset: {
      _ref: string;
      _type: string;
    };
    // Add other image properties if needed (e.g., alt text)
    alt?: string;
  }[];
  category?: {
    _ref: string;
    _type: string;
    name: string; // Include category name
    slug: {
      current: string;
    };
  };
  availability?: 'available' | 'out-of-stock' | 'seasonal' | 'discontinued';
  healthBenefits?: string[]; // Assuming an array of strings
  cookingTips?: string; // Assuming simple text
  nutritionalInfo?: {
    [key: string]: any; // Define a more specific type if structure is known
  };
  isFeatured?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  // Add other relevant product fields as needed
}

interface UseSingleProductData {
  product: SingleProduct | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom React hook to fetch a single product from Sanity by slug.
 *
 * @param slug - The slug of the product to fetch.
 * @returns An object containing the product data, loading state, and error.
 */
function useSingleProduct(slug: string | null): UseSingleProductData {
  // GROQ query to fetch a single product by slug
  // Note: $slug is passed as a parameter
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    description,
    shortDescription,
    images[]{
      asset->{
        _ref,
        _type,
        // Add other asset fields if needed (e.g., url)
        url
      },
      alt
    },
    category->{
      _ref,
      _type,
      name,
      slug
    },
    availability,
    healthBenefits,
    cookingTips,
    nutritionalInfo,
    isFeatured,
    sortOrder,
    seo
  }`;

  // Fetch data using the generic useSanityData hook
  // Pass the slug as a parameter to the query
  const { data, loading, error } = useSanityData<SingleProduct | null>(slug ? query : '', slug ? { slug } : {});

  return { product: data, loading, error };
}

export default useSingleProduct;