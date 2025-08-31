
import useSanityData from './useSanityData';

export interface Product {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  shortDescription?: string;
  images?: {
    asset: {
      _ref: string;
      _type: string;
    };
  }[];
  category?: {
    _ref: string;
    _type: string;
  };
  availability?: 'available' | 'out-of-stock' | 'seasonal' | 'discontinued';
  isFeatured?: boolean;
  sortOrder?: number;
  // Add other relevant product fields as needed
}

interface ProductCatalogOptions {
  category?: string;
  isFeatured?: boolean;
  limit?: number;
  filterByAvailability?: boolean;
}

interface ProductCatalogData {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

/**
 * Custom React hook to fetch a list of products from Sanity.
 * Allows filtering by category and featured status.
 *
 * @param options - Optional filtering options.
 * @returns An object containing the product data, loading state, and error.
 */
export function useProductCatalog(options: ProductCatalogOptions = {}): ProductCatalogData {
  const { category, isFeatured, limit, filterByAvailability } = options;

  let query = `*[_type == "product"`;
  const params: { [key: string]: any } = {};

  if (category) {
    query += ` && category._ref in *[_type=="category" && slug.current == $category]._id`;
    params.category = category;
  }

  if (isFeatured !== undefined) {
    query += ` && isFeatured == $isFeatured`;
    params.isFeatured = isFeatured;
  }

  if (filterByAvailability !== undefined) {
    query += ` && availability == 'available'`;
  }

  query += `] | order(sortOrder asc) {
    _id,
    name,
    slug,
    shortDescription,
    images,
    category->{
      _ref,
      _type,
      name,
      slug
    },
    availability,
    isFeatured,
    sortOrder
  }`;

  if (limit) {
    query += `[0...$limit]`;
    params.limit = limit;
  }


  const { data, loading, error } = useSanityData<Product[]>(query, params);

  return { products: data || [], loading, error };
}
