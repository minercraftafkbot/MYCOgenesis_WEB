// studio-mycogen/schemaTypes/productType.ts
import {defineField, defineType} from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'A brief description of the product.',
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array', // Using array for Portable Text
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}], // Reference the category schema
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Out of Stock', value: 'out-of-stock'},
          {title: 'Seasonal', value: 'seasonal'},
          {title: 'Discontinued', value: 'discontinued'},
        ],
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'healthBenefits',
      title: 'Health Benefits',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'cookingTips',
      title: 'Cooking Tips',
      type: 'array',
       of: [{type: 'block'}], // Using Portable Text for cooking tips
    }),
     defineField({
      name: 'nutritionalInfo',
      title: 'Nutritional Information',
      type: 'text', // Simple text field for nutritional info, or you could use an object type
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
    }),
     defineField({
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
})
