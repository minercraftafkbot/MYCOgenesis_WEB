
import { sanityClient, urlFor } from '@/lib/sanity'; // Corrected import
import { SingleBlogPost } from '@/types/sanity'; 
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post: SingleBlogPost = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
        title, excerpt, featuredImage
    }`,
    { slug: params.slug }
  );

  const previousImages = (await parent).openGraph?.images || [];

  const imageUrl = post.featuredImage ? urlFor(post.featuredImage).width(1200).height(630).url() : '';

  return {
    title: `${post.title} | MYCOgenesis Blog`,
    description: post.excerpt || (await parent).description,
    openGraph: {
        images: [imageUrl, ...previousImages],
    },
  };
}

async function getPost(slug: string): Promise<SingleBlogPost> {
    const post = await sanityClient.fetch(
        `*[_type == "post" && slug.current == $slug][0]{
            _id, title, slug, publishedAt, body, featuredImage, excerpt,
            author->{name, image},
            categories[]->{title}
        }`,
        { slug }
    );
    return post;
}

// Components for rendering Portable Text
const ptComponents = {
    types: {
        image: ({ value }: { value: any }) => {
            if (!value?.asset?._ref) {
                return null;
            }
            return (
                <div className="my-8">
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Blog post image'}
                        width={800}
                        height={450}
                        className="rounded-lg"
                    />
                </div>
            );
        },
    },
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <article className="bg-white py-16 sm:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">{post.title}</h1>
                    <p className="mt-4 text-lg text-gray-600">Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
                     {post.author && (
                        <div className="mt-6 flex justify-center items-center">
                            {post.author.image && 
                                <Image src={urlFor(post.author.image).width(40).height(40).url()} alt={post.author.name} className="rounded-full h-10 w-10 mr-4" width={40} height={40}/>
                            }
                            <span>By {post.author.name}</span>
                        </div>
                    )}
                </div>
                
                {post.featuredImage && (
                    <div className="mb-12">
                        <Image 
                            src={urlFor(post.featuredImage).url()} 
                            alt={post.title} 
                            width={1200} 
                            height={675} 
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                )}

                <div className="prose prose-lg max-w-none prose-teal">
                    <PortableText value={post.body} components={ptComponents} />
                </div>
            </div>
        </article>
    );
}
