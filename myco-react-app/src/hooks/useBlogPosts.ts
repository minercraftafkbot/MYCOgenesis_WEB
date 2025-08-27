import useSanityData from './useSanityData';

interface BlogPost {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt: string;
  featuredImage?: {
    _key: string;
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  // Add other fields you need here
}

interface UseBlogPostsOptions {
  limit?: number;
  featured?: boolean;
  category?: string;
  excludeId?: string;
  // Add other query options as needed
}

const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const { limit, featured, category, excludeId } = options;

  // Construct the GROQ query based on options
  // Note: This is a basic example. Complex queries might need more sophisticated construction.
  const query = `*[_type == "blogPost"${featured !== undefined ? ` && isFeatured == ${featured}` : ''}${category ? ` && "${category}" in categories[]->slug.current` : ''}${excludeId ? ` && _id != "${excludeId}"` : ''}] | order(publishedAt desc)${limit !== undefined ? `[0...${limit}]` : ''} {
    _id,
    _createdAt,
    title,
    slug,
    excerpt,
    publishedAt,
    featuredImage {
      asset->{
        _id,
        url
      }
    },
    // ... include other fields from your Sanity schema here
  }`;

  const { data, loading, error } = useSanityData<BlogPost[]>(query);

  // You might want to add data transformation or filtering here if needed
  // For example, filtering posts based on tags, or formatting dates.

  return {
    posts: data, // Rename data to posts for clarity
    loading,
    error,
  };
};

export default useBlogPosts;