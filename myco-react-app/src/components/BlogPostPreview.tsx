import React from 'react';

interface BlogPostPreviewProps {
  post: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    excerpt?: string;
    publishedAt: string;
  };
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post }) => {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="text-xl font-semibold">{post.title}</h3>
      {post.excerpt && <p className="mt-2 text-slate-600">{post.excerpt}</p>}
      {post.publishedAt && (
        <p className="mt-2 text-sm text-slate-500">
          Published: {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}
      {/* Link to full post page will be added later */}
      {/* <a href={`/blog/${post.slug.current}`}>Read More</a> */}
    </div>
  );
};

export default BlogPostPreview;