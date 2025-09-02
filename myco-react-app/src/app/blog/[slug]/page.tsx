
import { sanityClient, urlFor } from '@/lib/sanity';
import { Post, SanityImage } from '@/types/sanity';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

// ... (generateMetadata and getPost functions remain the same)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post: Post = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
        title, excerpt, featuredImage
    }`,
    { slug }
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

async function getPost(slug: string): Promise<Post> {
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


const ptComponents = {
    types: {
        image: ({ value }: { value: SanityImage }) => {
            if (!value?.asset?._ref) {
                return null;
            }
            return (
                <div className="my-8 flex justify-center">
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Blog post image'}
                        width={800}
                        height={450}
                        className="rounded-lg shadow-md"
                    />
                </div>
            );
        },
    },
};

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <div className="bg-gray-50 py-16 sm:py-24">
            <article className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {post.featuredImage && (
                    <div className="relative h-64 sm:h-96 w-full">
                        <Image
                            src={urlFor(post.featuredImage).url()}
                            alt={post.title}
                            fill
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="px-6 py-12 sm:px-12 lg:px-16">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">{post.title}</h1>
                        <p className="mt-4 text-lg text-gray-600">Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
                        {post.author && (
                            <div className="mt-6 flex justify-center items-center">
                                {post.author.image &&
                                    <Image src={urlFor(post.author.image).width(40).height(40).url()} alt={post.author.name} className="rounded-full h-10 w-10 mr-4" width={40} height={40} />
                                }
                                <span className="font-medium text-gray-800">By {post.author.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="prose  text-gray-800 prose-lg max-w-none mx-auto prose-teal">
                        <PortableText value={post.body} components={ptComponents} />
                    </div>
                </div>
            </article>
        </div>
    );
}
