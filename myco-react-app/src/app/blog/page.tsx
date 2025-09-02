
import { sanityClient } from '../../lib/sanity';
import { Post } from '../../types/sanity';
import BlogPostPreview from '../../components/BlogPostPreview';
import { isValidPostForPreview } from '../../utils/postUtils'; // Assuming you have a utility like this

async function getPosts(): Promise<Post[]> {
    const posts = await sanityClient.fetch(
        `*[_type == "post"] | order(publishedAt desc){
            _id,
            title,
            slug,
            publishedAt,
            featuredImage,
            excerpt,
            author->{name, image},
            "category": categories[0]->{title, slug}
        }`
    );
    return posts;
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

                <div className="mt-20 grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:max-w-none">
                    {posts.map((post) => (
                        <BlogPostPreview key={post._id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
