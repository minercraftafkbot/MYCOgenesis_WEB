import React from 'react';
import { Product } from '../hooks/useProductCatalog'; // Assuming Product interface is exported here

interface ProductPreviewProps {
  product: Product;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white flex flex-col items-center text-center">
      {/* Placeholder for Image */}
      <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
        {product.images && product.images.length > 0 ? (
          // Replace with actual image rendering using @sanity/image-url
          <span>Product Image Placeholder</span>
        ) : (
          <span>No Image</span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      {product.shortDescription && (
        <p className="text-sm text-gray-600 flex-grow">{product.shortDescription}</p>
      )}

      {/* Add more product details or a link to the product page here */}
      {/* <button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded">
        View Product
      </button> */}
    </div>
  );
};

export default ProductPreview;