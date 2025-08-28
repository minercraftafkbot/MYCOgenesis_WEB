// myco-react-app/src/app/blog/page.tsx

"use client"; // This page will use client-side hooks/fetching

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout'; // Adjust path as needed
import BlogPostPreview from '../../components/BlogPostPreview'; // Adjust path as needed
import { sanityClient } from '../../lib/sanity'; // Adjust path as needed


// Define the GROQ query for fetching all posts
const ALL_POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){_id, title, slug, publishedAt, excerpt}`; // Include excerpt for the preview


interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt?: string; // Add excerpt to the type
}


export default function BlogListPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAllBlogPosts() {
      setLoading(true);
      setError(null);
      try {
        const fetchedPosts: BlogPost[] = await sanityClient.fetch(ALL_POSTS_QUERY);
        setBlogPosts(fetchedPosts);
      } catch (err: unknown) {
        console.error('Error fetching all blog posts:', err);
        const fetchError = err as Error;
        console.error('Error details:', fetchError.message);
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    }

    fetchAllBlogPosts();
  }, []); // Empty dependency array means this effect runs once on mount


  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-3xl font-bold mb-12">All Blog Articles</h1>

        {loading && <p>Loading blog posts...</p>}
        {error && <p className="text-red-500">Error loading blog posts: {error.message}</p>}

        {blogPosts && blogPosts.length > 0 ? (
          <ul className="flex flex-col gap-y-6">
            {blogPosts.map((post: BlogPost) => (
              <BlogPostPreview key={post._id} post={post} />
            ))}
          </ul>
        ) : (
          !loading && !error && <p>No blog posts found.</p>
        )}
      </div>
    </Layout>
  );
}
