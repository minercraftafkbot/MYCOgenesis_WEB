import React from 'react';
import  useBlogPosts  from '../hooks/useBlogPosts';

interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  publishedAt?: string;
  // Add other relevant blog post fields as needed
}

// Placeholder component for a single blog post preview
const BlogPostPreview: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      {post.excerpt && <p className="text-slate-600">{post.excerpt}</p>}
      {/* Add link to the full post */}
      {post.slug?.current && (
        <a href={`/blog/${post.slug.current}`} className="text-teal-600 hover:underline mt-2 inline-block">
          Read More
        </a>
      )}
    </div>
  );
};

const BlogPostList: React.FC = () => {
  const { posts, loading, error } = useBlogPosts();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="text-slate-600 mt-2">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading blog posts: {error.message}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        <p>No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="blog-post-list space-y-6">
      {posts.map((post) => (
        <BlogPostPreview key={post._id} post={post} />
      ))}
    </div>
  );
};

export default BlogPostList;