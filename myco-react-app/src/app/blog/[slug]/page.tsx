{/* myco-react-app/src/app/blog/[slug]/page.tsx */}
"use client"; // Add this at the very top
import { Metadata } from 'next';
import { client } from '../../../lib/sanity'; // Import Sanity client
import Layout from '../../../components/Layout';
import useSingleBlogPost from '../../../hooks/useSingleBlogPost'; // Import the hook
// You'll also need to import the type definition for a single blog post if you create one in the hook file

import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types'; // For type safety

import { PortableText } from '@portabletext/react';




// Define a type for the metadata we need
interface BlogPostMetadata {
  title: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  // Add other fields you might need for metadata generation (e.g., excerpt for description fallback)
}
 // Function to generate dynamic metadata
 export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  // Fetch the blog post data to get title and SEO fields
  const post: BlogPostMetadata = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{ title, seo }`,
    { slug }
  );

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: post.seo?.metaTitle || post.title || 'Blog Post',
    description: post.seo?.metaDescription || `Read about ${post.title}`,
  };
}
////////////////////////////////////////////////////////--image builder--////////////////////////////////////////////////////////////////

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}




///////////////////////////////////////////////////////--Blog Post Page--///////////////////////////////////////////////////////////////

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;

  // Use the hook to fetch the blog post data
  const { post, loading, error } = useSingleBlogPost(slug);

  // Conditional rendering based on loading, error, and data
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center">
          <p>Loading blog post...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center text-red-500">
          <p>Error loading blog post: {error.message}</p>
        </div>
      </Layout>
    );
  }

  // If no post is found for the slug
  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold">Blog Post Not Found</h1>
          <p className="mt-4">The blog post with slug "{slug}" could not be found.</p>
        </div>
      </Layout>
    );
  }

  // If the post data is loaded, display it
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-slate-600 text-sm mb-6">
            Published on {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}
        {/* Display featured image if available */}
        {/* You'll need to use the @sanity/image-url library here later */}
        {post.featuredImage && (
            <div className="mb-8">
             <img
                src={urlFor(post.featuredImage).url() || ''} // Use urlFor to get the image URL
                alt={post.title || 'Blog post featured image'} // Add a fallback alt text
                className="w-full h-auto rounded-lg"
                />
            </div>
           )}
           
            {/* AdSense Ad Unit (Example Placement) */}
            <div className="my-8"> {/* Add some margin around the ad unit */}
              <ins className="adsbygoogle"
                   style={{ display: 'block' }} // Or use Tailwind classes
                   data-ad-client="ca-pub-YOUR_ADSENSE_PUBLISHER_ID"
                   data-ad-slot="YOUR_AD_UNIT_SLOT_ID"></ins>
              <script>
                   (adsbygoogle = window.adsbygoogle || []).push({});
              </script>
            </div>

      <div className="prose max-w-none">
          {/* Render Portable Text body */}
          {post.body && <PortableText value={post.body} />}
      </div>

      </div>
    </Layout>
  );
}
