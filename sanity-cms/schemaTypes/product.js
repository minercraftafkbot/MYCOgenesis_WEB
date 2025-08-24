import {defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Mushroom Products',
  type: 'document',
  icon: () => '🍄',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(100)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief description for product cards',
      validation: Rule => Rule.max(200)
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for accessibility and SEO',
              validation: Rule => Rule.required()
            },
            {
              name: 'isPrimary',
              type: 'boolean',
              title: 'Primary Image',
              description: 'Mark as primary image for product cards',
              initialValue: false
            }
          ]
        }
      ],
      validation: Rule => Rule.min(1).max(8)
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'availability',
      title: 'Availability Status',
      type: 'string',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Out of Stock', value: 'out-of-stock'},
          {title: 'Seasonal', value: 'seasonal'},
          {title: 'Discontinued', value: 'discontinued'}
        ]
      },
      initialValue: 'available',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'healthBenefits',
      title: 'Health Benefits',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of health benefits'
    }),
    defineField({
      name: 'cookingTips',
      title: 'Cooking Tips',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'nutritionalInfo',
      title: 'Nutritional Information',
      type: 'object',
      fields: [
        {name: 'calories', type: 'number', title: 'Calories (per 100g)'},
        {name: 'protein', type: 'number', title: 'Protein (g)'},
        {name: 'carbs', type: 'number', title: 'Carbohydrates (g)'},
        {name: 'fiber', type: 'number', title: 'Fiber (g)'},
        {name: 'fat', type: 'number', title: 'Fat (g)'}
      ]
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show on homepage featured products section',
      initialValue: false
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 100
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          validation: Rule => Rule.max(60)
        },
        {
          name: 'metaDescription',
          type: 'string',
          title: 'Meta Description',
          validation: Rule => Rule.max(160)
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      availability: 'availability',
      featured: 'isFeatured'
    },
    prepare(selection) {
      const {title, media, availability, featured} = selection
      const statusEmoji = {
        'available': '✅',
        'out-of-stock': '❌',
        'seasonal': '🌱',
        'discontinued': '⛔'
      }
      return {
        title: title,
        subtitle: `${statusEmoji[availability]} ${availability}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'isFeatured', direction: 'desc'},
        {field: 'sortOrder', direction: 'asc'}
      ]
    }
  ]
})
