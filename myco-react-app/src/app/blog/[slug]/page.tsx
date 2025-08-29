
// myco-react-app/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient, urlFor } from '../../../lib/sanity';
import PostPage from './PostPage';
import { SingleBlogPost } from '../../../types/sanity';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const posts: { slug: { current: string } }[] = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)]{ "slug": slug }`
  );
  return posts.map((post) => ({ slug: post.slug.current }));
}

async function fetchBlogPost(slug: string): Promise<SingleBlogPost> {
  const post = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      _id, title, slug, publishedAt, body, featuredImage,
      "author": author->{name, image},
      "categories": categories[]->{_id, title, "slug": slug.current}
    }`,
    { slug }
  );
  if (!post) {
    notFound();
  }
  return post;
}

interface PageProps { 
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await fetchBlogPost(slug);

  const imageUrl = post.featuredImage ? urlFor(post.featuredImage).width(1200).height(630).url() : '/placeholder.jpg';
  const postUrl = `https://your-website.com/blog/${slug}`; // Replace with your actual domain

  return {
    title: post.title,
    description: `Read the blog post: ${post.title}`,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: `Read the blog post: ${post.title}`,
      url: postUrl,
      siteName: 'Your Site Name', // Replace with your site name
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: `Read the blog post: ${post.title}`,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params;
  const post = await fetchBlogPost(slug);
  const postUrl = `https://your-website.com/blog/${slug}`; // Replace with your actual domain
  const imageUrl = post.featuredImage ? urlFor(post.featuredImage).url() : '/placeholder.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'name': post.title,
    'image': imageUrl,
    'author': {
      '@type': 'Person',
      'name': post.author.name,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Your Site Name', // Replace with your site name
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://your-website.com/logo.png', // Replace with your logo URL
      },
    },
    'url': postUrl,
    'datePublished': post.publishedAt,
    'dateCreated': post.publishedAt,
    'dateModified': post.publishedAt, // Or a separate 'updatedAt' field if you have one
    'description': `Read the blog post: ${post.title}`,
    'articleBody': 'The main content of the article.', // You could potentially serialize the 'body' for this
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostPage post={post} />
    </>
  );
}
