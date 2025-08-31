
// myco-react-app/src/app/shop/page.tsx
import { sanityClient } from '../../lib/sanity';
import { Product } from '../../types/sanity';
import ProductPreview from '../../components/ProductPreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop | MYCOgenesis',
  description: 'Browse our selection of gourmet mushrooms and cultivation kits.',
};

async function getProducts(): Promise<Product[]> {
  const products = await sanityClient.fetch(
    `*[_type == "product" && defined(slug.current)]{
      _id,
      title,
      slug,
      defaultProductVariant
    }`
  );
  return products;
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            Our Products
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            From gourmet mushrooms to advanced cultivation kits, explore the world of mycology.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6">
          {products.map((product) => (
            <ProductPreview key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
