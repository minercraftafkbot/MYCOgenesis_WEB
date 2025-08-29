
// myco-react-app/src/hooks/useBlogPosts.ts
import { useState, useEffect } from 'react';
import { sanityClient } from '../lib/sanity'; 

// Define the shape of the data for a blog post preview
export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
}

// Define the GROQ query to fetch a list of posts
const BLOG_POSTS_QUERY = `*[_type == "post" && defined(slug.current)]|order(publishedAt desc){
    _id,
    title,
    slug,
    publishedAt
  }`;

export default function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        // CORRECTED: from 'client' to 'sanityClient'
        const data = await sanityClient.fetch<BlogPost[]>(BLOG_POSTS_QUERY);
        setPosts(data);
      } catch (err: any) {
        console.error("Failed to fetch blog posts:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount

  return { posts, loading, error };
}
