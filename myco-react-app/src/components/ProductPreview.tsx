
// myco-react-app/src/components/ProductPreview.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../hooks/useProductCatalog';
import { urlFor } from '../lib/sanity';

interface ProductPreviewProps {
  product: Product;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const { name, slug, images, availability } = product;

  return (
    <Link href={`/products/${slug?.current}`}>
      <div className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:scale-105">
        <div className="relative w-full h-56 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
          {images && images.length > 0 ? (
            <Image
              src={urlFor(images[0]).width(400).height(400).url() ?? ''}
              alt={name ?? 'Product image'}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors duration-200">{name}</h3>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            {availability && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  availability === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                    {availability.charAt(0).toUpperCase() + availability.slice(1)}
                </span>
            )}
            <svg className="w-5 h-5 text-teal-600 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductPreview;
