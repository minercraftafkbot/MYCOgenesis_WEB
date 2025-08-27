"use client";

import Layout from '../components/Layout';
import {useProductCatalog} from '../hooks/useProductCatalog';
// import  Product  from '../hooks/useProductCatalog';



export default function Home() {
  const { products, loading, error } = useProductCatalog({ isFeatured: true, limit: 3 });

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
        {loading && <p>Loading featured products...</p>}
        {error && <p className="text-red-500">Error loading featured products: {error.message}</p>}
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {products.map(product => (
              // Replace with your actual ProductPreview component
              <div key={product._id} className="border p-4 rounded shadow">
                <h3>{product.name}</h3>
                <p>{product.shortDescription}</p>
              </div>
            ))}
          </div>
        )}
        {products && products.length === 0 && !loading && !error && (
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

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Blog Placeholder</h2>
          <p className="mt-4">Content for the blog section will go here.</p>
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
