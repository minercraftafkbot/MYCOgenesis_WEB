
// myco-react-app/src/hooks/useSingleBlogPost.ts
import { useState, useEffect } from 'react';
import { sanityClient } from '../lib/sanity';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Define the shape of a single blog post
export interface SingleBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  body: any[]; // Portable Text content
  featuredImage?: SanityImageSource;
  author: {
    name: string;
    image?: SanityImageSource;
  };
  categories: {
    title: string;
    slug: { current: string };
  }[];
}

const SINGLE_POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  body,
  featuredImage,
  "author": author->{name, image},
  "categories": categories[]->{title, "slug": slug.current}
}`;

export default function useSingleBlogPost(slug: string) {
  const [post, setPost] = useState<SingleBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await sanityClient.fetch<SingleBlogPost>(SINGLE_POST_QUERY, { slug });
        setPost(data);
      } catch (err: any) {
        console.error("Failed to fetch blog post:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}
