
// myco-react-app/src/components/ProductPreview.tsx
import React from 'react';
import Link from 'next/link';
import { Product } from '../hooks/useProductCatalog';
import { urlFor } from '../lib/sanity';

interface ProductPreviewProps {
  product: Product;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const { name, slug, images, availability } = product;

  return (
    (<Link href={`/products/${slug?.current}`}>
      <div className="border p-4 rounded-lg shadow-sm bg-white flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
          {images && images.length > 0 ? (
            <img
              src={urlFor(images[0]).width(300).height(300).url() ?? ''}
              alt={name ?? 'Product image'}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
        
        {availability && (
            <p className={`text-sm mt-2 font-semibold ${availability === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                {availability.charAt(0).toUpperCase() + availability.slice(1)}
            </p>
        )}

      </div>
    </Link>)
  );
};

export default ProductPreview;
