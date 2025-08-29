
// myco-react-app/src/components/BlogPostPreview.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPost } from '../hooks/useBlogPosts';

interface BlogPostPreviewProps {
  post: BlogPost;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post }) => {
  const { title, slug, publishedAt } = post;
  const publishedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    (<Link href={`/blog/${slug?.current}`}>
      <div className="border p-4 rounded-lg shadow-sm bg-white flex flex-col items-start text-left cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mt-auto">{publishedDate}</p>
      </div>
    </Link>)
  );
};

export default BlogPostPreview;
