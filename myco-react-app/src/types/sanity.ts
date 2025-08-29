
// myco-react-app/src/types/sanity.ts
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// This file contains the TypeScript interfaces for the data we fetch from Sanity.

export interface SingleBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  body: any[]; // Portable Text content
  featuredImage?: SanityImageSource;
  author: {
    name: string;
    image?: SanityImageSource;
  };
  categories: {
    _id: string;
    title: string;
    slug: { current: string };
  }[];
}

// You can add other interfaces here as your project grows, for example:
// export interface Author {
//   ...
// }
