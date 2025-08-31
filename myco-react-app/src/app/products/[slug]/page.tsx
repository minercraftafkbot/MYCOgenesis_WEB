
// myco-react-app/src/app/products/[slug]/page.tsx
import { sanityClient, urlFor } from '../../../lib/sanity';
import { Product } from '../../../types/sanity';
import { PortableText } from '@portabletext/react';
import { Metadata } from 'next';
import Image from 'next/image';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  const product = await sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      defaultProductVariant,
      "mainImage": defaultProductVariant.images[0]
    }`,
    { slug }
  );
  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const product = await getProduct(params.slug);
    return {
        title: `${product?.title || 'Product'} | MYCOgenesis`,
        description: `Details for ${product?.title || 'Product'}`
    }
}


export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          
          <div>
            {product.mainImage && (
                 <Image
                    src={urlFor(product.mainImage).width(600).height(600).url()}
                    alt={product.title || 'Product image'}
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                />
            )}
          </div>

          <div className="mt-8 md:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{product.title}</h1>
            
            {product.defaultProductVariant?.price && (
                <p className="text-2xl text-gray-900 mt-2">${product.defaultProductVariant.price}</p>
            )}

            <div className="mt-6 prose prose-lg text-gray-700">
                {product.description && <PortableText value={product.description} />}
            </div>

            <div className="mt-10">
                <button 
                    type="submit"
                    className="w-full bg-teal-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    Add to Cart
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
