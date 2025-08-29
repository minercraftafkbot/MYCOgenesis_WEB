
// myco-react-app/src/app/blog/page.tsx
import { sanityClient } from '../../lib/sanity';
import { Post } from '../../types/sanity';
import BlogPostPreview from '../../components/BlogPostPreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | MYCOgenesis',
    description: 'Explore the world of mycology, from gourmet mushrooms to cultivation techniques.',
};

async function getPosts(): Promise<Post[]> {
  const posts = await sanityClient.fetch(
    `*[_type == "post" && defined(slug.current)]|order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      "excerpt": body[0].children[0].text
    }`
  );
  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="bg-white">
        <div className="max-w-3xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
                    From the Myco-Verse
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                    Your source for all things mycology. Tips, tricks, and fungal findings.
                </p>
            </div>

            <div className="space-y-8">
                {posts.map((post) => (
                    <BlogPostPreview key={post._id} post={post} />
                ))}
            </div>
        </div>
    </div>
  );
}
