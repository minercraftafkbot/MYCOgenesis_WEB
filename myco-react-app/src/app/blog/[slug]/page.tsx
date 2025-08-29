
// myco-react-app/src/app/blog/[slug]/page.tsx
// This is now a Server Component. The "use client" directive has been removed.

import { Metadata } from 'next';
import { sanityClient } from '../../../lib/sanity';
import PostPage from './PostPage'; // Import the new Client Component

// --- Metadata Generation (Server-side) ---
interface BlogPostMetadata {
  title: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  excerpt?: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const post: BlogPostMetadata = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]{ title, seo, excerpt }`,
    { slug }
  );

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || 'Read this blog post from Myco.',
  };
}

// --- Page Component (Server-side) ---
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// This is the main component for the route. It's a Server Component.
export default function BlogPostPage({ params }: BlogPostPageProps) {
  // It receives params from the URL and passes the slug to the Client Component.
  return <PostPage slug={params.slug} />;
}
