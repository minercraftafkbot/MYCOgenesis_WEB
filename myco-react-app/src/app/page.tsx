
import Link from 'next/link';
import { sanityClient } from '../lib/sanity';
import { Product, Post } from '../types/sanity';
import ProductPreview from '../components/ProductPreview';
import BlogPostPreview from '../components/BlogPostPreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'MYCOgenesis | Revolutionizing Mycology',
    description: 'Pioneering the future of mycology through innovative research, sustainable cultivation, and cutting-edge technology.',
};

// Re-introducing the simplified interface for blog posts on the home page
interface HomePageBlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
}

// Fetch both featured products and recent blog posts on the server
async function getHomePageData() {
    const featuredProductsQuery = `*[_type == "product" && isFeatured == true][0...3]{
        _id, title, slug, defaultProductVariant, mainImage
    }`;
    const recentPostsQuery = `*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...4]{
        _id, title, slug, publishedAt, excerpt
    }`;

    const products: Product[] = await sanityClient.fetch(featuredProductsQuery);
    const posts: HomePageBlogPost[] = await sanityClient.fetch(recentPostsQuery);

    return { products, posts };
}

export default async function Home() {
    const { products, posts } = await getHomePageData();

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-teal-700 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-extrabold">Pioneering the Future of Mycology</h1>
                    <p className="mt-4 text-xl">Sustainable, innovative, and world-changing solutions grown from the ground up.</p>
                    <Link href="/about">
                        <span className="mt-8 inline-block bg-white text-teal-700 font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 shadow-lg">Learn More</span>
                    </Link>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800">Sustainable Cultivation</h3>
                        <p className="mt-2 text-slate-600">Our smart farms use 95% less water and produce zero agricultural runoff.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800">Cutting-Edge Research</h3>
                        <p className="mt-2 text-slate-600">We are at the forefront of genetic research to unlock the full potential of fungi.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800">Global Impact</h3>
                        <p className="mt-2 text-slate-600">From new medicines to biodegradable materials, our work is changing the world.</p>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section id="featured-products" className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-slate-800">Featured Products</h2>
                    <p className="mt-4 text-lg text-slate-600">Explore our latest innovations in mycelial technology.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
                        {products.map((product: Product) => (
                            <ProductPreview key={product._id} product={product} />
                        ))}
                    </div>
                    <div className="mt-12">
                        <Link href="/shop">
                            <span className="text-teal-600 hover:text-teal-700 font-semibold">Shop All Products &rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* From the Blog Section */}
            <section id="blog" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-slate-800">From the Blog</h2>
                        <p className="mt-4 text-lg text-slate-600">Stay updated with our latest research and discoveries.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 max-w-4xl mx-auto">
                         {posts.map((post: any) => (
                            <BlogPostPreview key={post._id} post={post} />
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link href="/blog">
                           <span className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg">View All Articles</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

