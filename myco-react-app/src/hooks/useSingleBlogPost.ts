"use client";

import useSanityData from './useSanityData';

interface SingleBlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  featuredImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  body?: any[]; // Use 'any[]' for Portable Text or define a more specific type later
  // Add other relevant blog post fields as needed
}

interface UseSingleBlogPostData {
  post: SingleBlogPost | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom React hook to fetch a single blog post from Sanity by slug.
 *
 * @param slug - The slug of the blog post.
 * @returns An object containing the blog post data, loading state, and error.
 */
function useSingleBlogPost(slug: string | null): UseSingleBlogPostData {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    featuredImage,
    body
    // Add other fields here
  }`;

  const params = { slug };

  const { data, loading, error } = useSanityData<SingleBlogPost | null>(query, params);

  return { post: data, loading, error };
}

export default useSingleBlogPost;