
// myco-react-app/src/components/ProductPreview.tsx
import React from 'react';
import Link from 'next/link';
import { Product } from '../types/sanity'; // Adjust with the correct path to your types

interface ProductPreviewProps {
  product: Product;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const { title, slug, defaultProductVariant } = product;

  return (
    <Link href={`/products/${slug?.current}`}>
      <div className="border p-4 rounded-lg shadow-sm bg-white flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
          {/* Placeholder for Sanity image - you'll need to implement this */}
          <span>Product Image</span>
        </div>

        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        
        {defaultProductVariant?.price && (
            <p className="text-md text-gray-600 mt-2">${defaultProductVariant.price}</p>
        )}

      </div>
    </Link>
  );
};

export default ProductPreview;
