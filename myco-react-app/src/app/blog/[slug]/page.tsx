
// myco-react-app/src/app/blog/[slug]/page.tsx
"use client";

import { Metadata } from 'next';
import { sanityClient } from '../../../lib/sanity'; 
import Layout from '../../../components/Layout';
import useSingleBlogPost, { SingleBlogPost } from '../../../hooks/useSingleBlogPost';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

// --- Metadata Generation ---
// This part runs on the server to generate metadata for the page head.
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

// --- Image URL Builder ---
const builder = imageUrlBuilder(sanityClient);

function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// --- Blog Post Page Component ---
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const { post, loading, error } = useSingleBlogPost(slug);

  if (loading) {
    return <Layout><div className="container mx-auto px-6 py-8 text-center"><p>Loading...</p></div></Layout>;
  }

  if (error) {
    return <Layout><div className="container mx-auto px-6 py-8 text-center text-red-500"><p>Error: {error.message}</p></div></Layout>;
  }

  if (!post) {
    return <Layout><div className="container mx-auto px-6 py-8 text-center"><p>Post not found.</p></div></Layout>;
  }

  return (
    <Layout>
      <article className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">{post.title}</h1>
        <div className="text-center mb-8 text-slate-500">
          <span>Published on {new Date(post.publishedAt).toLocaleDateString()}</span>
          {post.author && <span> by {post.author.name}</span>}
        </div>

        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={urlFor(post.featuredImage).width(1200).url()}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="prose lg:prose-xl max-w-none mx-auto">
          {post.body && <PortableText value={post.body} />}
        </div>

        {post.categories && post.categories.length > 0 && (
          <div className="mt-12 text-center">
            <h4 className="font-semibold">Categories:</h4>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {post.categories.map((category) => (
                <Link href={`/category/${category.slug.current}`} key={category.slug.current}>
                  <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm hover:bg-slate-300 transition-colors duration-200">
                    {category.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}
