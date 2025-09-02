"use client";

import useSanityData from './useSanityData';
import { BlockContent, SanityImage } from '../types/sanity';

export interface SingleProduct {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description?: BlockContent[];
  shortDescription?: string;
  images?: SanityImage[];
  category?: {
    _ref: string;
    _type: string;
    name: string; // Include category name
    slug: {
      current: string;
    };
  };
  availability?: 'available' | 'out-of-stock' | 'seasonal' | 'discontinued';
  healthBenefits?: string[];
  cookingTips?: string;
  nutritionalInfo?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface UseSingleProductData {
  product: SingleProduct | null;
  loading: boolean;
  error: Error | null;
}

function useSingleProduct(slug: string | null): UseSingleProductData {
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

  const { data, loading, error } = useSanityData<SingleProduct | null>(slug ? query : '', slug ? { slug } : {});

  return { product: data, loading, error };
}

export default useSingleProduct;
