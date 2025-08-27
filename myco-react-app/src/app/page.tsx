 "use client"; // This page needs client-side features (useProductCatalog)

import Layout from '../components/Layout';
import { useProductCatalog, Product } from '../hooks/useProductCatalog';
import  { client }  from '../lib/sanity';
import { useEffect, useState } from 'react'; // Import useEffect and useState for client-side data fetching
import ProductPreview from '../components/ProductPreview';
import BlogPostPreview from '../components/BlogPostPreview';


// Define the GROQ query for fetching posts
const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;


// Define a simple interface for blog posts fetched for the home page
interface HomePageBlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
}


export default function Home() {
  // Fetch featured products using the client-side hook
  const { products, loading: productsLoading, error: productsError } = useProductCatalog({ isFeatured: true, limit: 3 });

  // Fetch blog posts on the client side
  const [blogPosts, setBlogPosts] = useState<HomePageBlogPost[]>([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);
  const [blogPostsError, setBlogPostsError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBlogPosts() {
      setBlogPostsLoading(true);
      setBlogPostsError(null);
      try {
        const fetchedPosts: HomePageBlogPost[] = await client.fetch(POSTS_QUERY);
        setBlogPosts(fetchedPosts);
      } catch (err: any) {
        console.error('Error fetching blog posts:', err);
        setBlogPostsError(err);
      } finally {
        setBlogPostsLoading(false);
      }
    }

    fetchBlogPosts();
  }, []); // Empty dependency array means this effect runs once on mount


  return (
    <Layout>
      {/* Hero Section */}
      <section id="home" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Hero Section Placeholder</h2>
          <p className="mt-4">Content for the hero section will go here.</p>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="value-proposition" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Value Proposition Placeholder</h2>
          <p className="mt-4">Content for the value proposition section will go here.</p>
        </div>
      </section>

     {/* Featured Products Section */}
    <section id="featured-products" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold">Featured Products</h2>
        {productsLoading && <p>Loading featured products...</p>}
        {productsError && <p className="text-red-500">Error loading featured products: {productsError.message}</p>}
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {products.map((product: Product) => (
              <ProductPreview key={product._id} product={product} />
              ))}
          </div>
        )}
        {products && products.length === 0 && !productsLoading && !productsError && (
          <p>No featured products available at the moment.</p>
        )}
      </div>
    </section>



      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">About Us Placeholder</h2>
          <p className="mt-4">Content for the about us section will go here.</p>
        </div>
      </section>

      {/* Our Mushrooms Section */}
      <section id="mushrooms" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Our Mushrooms Placeholder</h2>
          <p className="mt-4">Content for our mushrooms section will go here.</p>
        </div>
      </section>

      {/* Our Smart Farm Section */}
      <section id="smart-farm" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Our Smart Farm Placeholder</h2>
          <p className="mt-4">Content for the smart farm section will go here.</p>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Shop Placeholder</h2>
          <p className="mt-4">Content for the shop section will go here.</p>
        </div>
      </section>

      {/* Blog Section - Now fetches and displays posts */}
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">From the Blog</h2>
          {blogPostsLoading && <p>Loading blog posts...</p>}
          {blogPostsError && <p className="text-red-500">Error loading blog posts: {blogPostsError.message}</p>}
          {blogPosts && blogPosts.length > 0 ? (
            <ul className="flex flex-col gap-y-4">
              {blogPosts.map((post: HomePageBlogPost) => (
              <BlogPostPreview key={post._id} post={post} />
                ))}

            </ul>
          ) : (!blogPostsLoading && !blogPostsError && <p>No blog posts found.</p>
          )}
        </div>
        <div className="text-center">
          {/* Link to full blog page - we'll set this up later */}
          <a href="/blog"
            className="mt-12 inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg">View All Articles</a>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Contact Placeholder</h2>
          <p className="mt-4">Content for the contact section will go here.</p>
        </div>
      </section>
    </Layout>
  );
}
