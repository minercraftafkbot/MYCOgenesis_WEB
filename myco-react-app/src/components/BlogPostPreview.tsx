
// myco-react-app/src/components/BlogPostPreview.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPost } from '../hooks/useBlogPosts';

interface BlogPostPreviewProps {
  post: BlogPost;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post }) => {
  const { title, slug, publishedAt } = post;
  
  // Format date consistently to avoid hydration issues
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const publishedDate = formatDate(publishedAt);

  return (
    <Link href={`/blog/${slug?.current}`}>
      <article className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:scale-105">
        <div className="relative h-48 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
          <div className="text-teal-600 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2">{title}</h3>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <time className="text-sm text-slate-500 font-medium">{publishedDate}</time>
            <svg className="w-5 h-5 text-teal-600 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogPostPreview;
