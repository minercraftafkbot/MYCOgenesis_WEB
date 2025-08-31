
// myco-react-app/src/app/blog/[slug]/PostPage.tsx
"use client";

import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { sanityClient } from '../../../lib/sanity';
import { SingleBlogPost } from '../../../types/sanity'; // Import the shared type

// --- Image URL Builder ---
const builder = imageUrlBuilder(sanityClient);
function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// --- Blog Post Page Component ---
// This is now a simple presentational component that receives the post data as a prop.
interface PostPageProps {
  post: SingleBlogPost;
}

export default function PostPage({ post }: PostPageProps) {
  // All the data is now passed in directly, so no more loading or error states are needed here.

  return (
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
                <Link href={`/category/${category.slug}`} key={category._id}>
                  <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm hover:bg-slate-300 transition-colors duration-200">
                    {category.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
  );
}
