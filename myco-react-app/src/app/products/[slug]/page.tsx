{/* myco-react-app/src/app/products/[slug]/page.tsx */}
"use client"; 
import Layout from '../../../../../components/Layout';
import useSingleProduct, { SingleProduct } from '../../../../../hooks/useSingleProduct'; // Import the hook and type
import imageUrlBuilder from '@sanity/image-url'; // Import image builder if you want to display images
import { SanityImageSource } from '@sanity/image-url/lib/types/types'; // For image type safety
import { client } from '../../../../../lib/sanity'; // Import the Sanity client for image builder


// Create an image URL builder instance
const builder = imageUrlBuilder(client);

// Helper function to generate image URLs
function urlFor(source: SanityImageSource) {
  return builder.image(source);
}


interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  // Use the hook to fetch the product data
  const { product, loading, error } = useSingleProduct(slug); // Correct destructuring


  // Conditional rendering based on loading, error, and data
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center">
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center text-red-500">
          <p>Error loading product: {error.message}</p>
        </div>
      </Layout>
    );
  }

  // If no product is found for the slug
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-4">The product with slug "{slug}" could not be found.</p>
        </div>
      </Layout>
    );
  }

  // If the product data is loaded, display it
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        {/* Display product images if available */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {product.images.map((image, index) => (
              <img
                key={index} // Use index as key for array map
                src={urlFor(image).url() || ''} // Use urlFor to get the image URL
                alt={`${product.name} Image ${index + 1}`} // Add descriptive alt text
                className="w-full h-auto rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="prose max-w-none">
          <p className="text-lg font-semibold mb-4">{product.shortDescription}</p>
          {/* Render full description if available - assuming it's rich text (Portable Text) */}
          {/* You'll need @portabletext/react here if description is Portable Text */}
          {product.description && <p>{product.description}</p>} {/* Placeholder for now */}

          {/* Display other product details */}
          {product.availability && <p>Availability: {product.availability}</p>}
          {/* Add sections for healthBenefits, cookingTips, nutritionalInfo as needed */}
        </div>
      </div>
    </Layout>
  );
}
