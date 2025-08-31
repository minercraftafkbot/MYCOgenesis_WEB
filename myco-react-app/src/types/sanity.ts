
// myco-react-app/src/types/sanity.ts

// Based on your Sanity schema

export interface ProductVariant {
    _type: 'productVariant';
    variantTitle?: string;
    price?: number;
    sku?: string;
    images?: any[];
}

export interface Product {
    _id: string;
    _type: 'product';
    title?: string;
    slug?: {
        current: string;
    };
    description?: any; // Sanity's block content
    defaultProductVariant?: ProductVariant;
    variants?: ProductVariant[];
    mainImage?: any;
}

export interface Post {
    _id: string;
    _type: 'post';
    title?: string;
    slug?: {
        current: string;
    };
    body?: any; // Sanity's block content
    author?: any; // Reference to author
    publishedAt?: string;
    excerpt?: string;
}

export interface SingleBlogPost {
    _id: string;
    title: string;
    slug: { current: string };
    publishedAt: string;
    body: any; // Portable Text
    featuredImage?: any; // Sanity Image
    excerpt?: string; // Add this line
    author: {
        name: string;
        image?: any; // Sanity Image
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
    image?: any;
    order?: number;
}

export interface Career {
    _id: string;
    _type: 'career';
    title?: string;
    location?: string;
    description?: string;
}
