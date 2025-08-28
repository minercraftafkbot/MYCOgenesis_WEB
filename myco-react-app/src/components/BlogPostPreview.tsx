import React from 'react';
import Link from 'next/link'; // Import the Link component

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
    <Link href={`/blog/${post.slug.current}`} passHref>
      <div className="border p-4 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h3 className="text-xl font-semibold">{post.title}</h3>
        {post.excerpt && <p className="mt-2 text-slate-600">{post.excerpt}</p>}
        {post.publishedAt && (
          <p className="mt-2 text-sm text-slate-500">
            Published: {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}
        <div className="mt-4 text-teal-600 hover:text-teal-700 font-semibold">Read More &rarr;</div>
      </div>
    </Link>
  );
};

export default BlogPostPreview;
