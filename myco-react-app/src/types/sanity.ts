
// myco-react-app/src/types/sanity.ts

// Based on your Sanity schema

export interface SanityImage {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
    };
    alt?: string;
}

export interface BlockContent {
    _type: 'block';
    children: {
        _type: 'span';
        text: string;
        marks: string[];
    }[];
    markDefs: Record<string, unknown>[];
    style: string;
}

export interface SanityAuthor {
    _type: 'reference';
    _ref: string;
}

export interface ProductVariant {
    _type: 'productVariant';
    variantTitle?: string;
    price?: number;
    sku?: string;
    images?: SanityImage[];
}

export interface Product {
    _id: string;
    _type: 'product';
    title?: string;
    slug?: {
        current: string;
    };
    description?: BlockContent[]; // Sanity's block content
    defaultProductVariant?: ProductVariant;
    variants?: ProductVariant[];
    mainImage?: SanityImage;
    images?: SanityImage[];
    category?: {
        _ref: string;
        _type: string;
        name: string;
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

export interface Post {
    _id: string;
    _type: 'post';
    title: string;
    slug: { current: string };
    publishedAt: string;
    body: BlockContent[]; // Portable Text
    featuredImage?: SanityImage; // Sanity Image
    excerpt?: string; // Add this line
    author: {
        name: string;
        image?: SanityImage; // Sanity Image
    };
    categories?: {
        _id: string;
        title: string;
        slug: string;
    }[];
}

export interface TeamMember {
    _id: string;
    _type: 'teamMember';
    name?: string;
    role?: string;
    bio?: string;
    image?: SanityImage;
    order?: number;
}

export interface Career {
    _id: string;
    _type: 'career';
    title?: string;
    location?: string;
    description?: string;
}
