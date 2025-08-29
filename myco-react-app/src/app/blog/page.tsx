
import { sanityClient } from '@/lib/sanity';
import { Post } from '@/types/sanity';
import BlogPostPreview from '@/components/BlogPostPreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | MYCOgenesis',
    description: 'Explore the latest news, research, and insights from the world of mycology.',
};

// Re-using the Post interface from sanity.ts, assuming it fits the needs for blog listing.
async function getPosts(): Promise<Post[]> {
    const posts = await sanityClient.fetch(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc){
        _id, title, slug, publishedAt, excerpt
    }`);
    return posts;
}

// Type guard to ensure post has all required fields for preview
function isValidPostForPreview(post: Post): post is Post & { _id: string; title: string; slug: { current: string }; publishedAt: string } {
    return !!(post._id && post.title && post.slug && post.slug.current && post.publishedAt);
}


export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">From the Blog</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                        Stay updated with our latest research, discoveries, and industry insights.
                    </p>
                </div>

                <div className="mt-20 max-w-4xl mx-auto grid gap-8 lg:max-w-none">
                    {posts.filter(isValidPostForPreview).map((post) => (
                        <BlogPostPreview key={post._id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
