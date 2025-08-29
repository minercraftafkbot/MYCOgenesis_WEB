
// myco-react-app/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient } from '../../../lib/sanity';
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
  const { slug } = params; // Explicitly destructure slug
  const post = await fetchBlogPost(slug);
  return {
    title: post.title,
    description: `Read the blog post: ${post.title}`,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params; // Explicitly destructure slug
  const post = await fetchBlogPost(slug);
  return <PostPage post={post} />;
}
