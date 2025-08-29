
import useSanityData from './useSanityData';

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
}

interface BlogPostsOptions {
    limit?: number;
}


export default function useBlogPosts(options: BlogPostsOptions = {}) {
  const { limit } = options;
  
  // Base query
  let query = `*[_type == "post" && defined(slug.current)]|order(publishedAt desc){\n    _id,\n    title,\n    slug,\n    publishedAt\n  }`;

  const params: { [key: string]: any } = {};

  // Apply limit if provided
  if (limit) {
    // GROQ slice is inclusive, so it's [0...limit]
    query += `[0...$limit]`;
    params.limit = limit;
  }
  
  // Use the generic data fetching hook
  const { data, loading, error } = useSanityData<BlogPost[]>(query, params);

  return { posts: data || [], loading, error };
}
