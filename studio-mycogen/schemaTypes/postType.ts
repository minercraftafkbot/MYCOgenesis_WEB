import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title', // Added title for clarity
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug', // Added title for clarity
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At', // Added title for clarity
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'A short summary of the blog post.',
      rows: 4, // Give it a few rows for easier editing
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}], // Assuming you will have an 'author' schema type later
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}], // Reference the category schema
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}], // Tags as an array of strings
      options: {
        layout: 'tags' // Display as tags in the Studio
      }
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true // Allows selecting the hotspot for image cropping
      },
      fields: [ // Add alt text field for accessibility
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body', // Added title for clarity
      type: 'array',
      of: [{type: 'block'}],
    }),
     defineField({ // Add SEO field
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
         defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        }),
         defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
        }),
         defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
        }),
      ]
    }),
  ],
   preview: { // Optional: Customize how posts are displayed in the list
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      media: 'featuredImage',
    },
     prepare(selection) {
      const {title, publishedAt, media} = selection
      return {
        title: title,
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No publish date',
        media: media,
      }
    },
  },
})
