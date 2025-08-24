import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Product Categories',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(50)
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'color',
      title: 'Category Color',
      type: 'string',
      description: 'Hex color code for category styling',
      validation: Rule => Rule.regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid hex color')
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 100
    }),
    defineField({
      name: 'isActive',
      title: 'Active Category',
      type: 'boolean',
      description: 'Show this category on the website',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      active: 'isActive'
    },
    prepare(selection) {
      const {title, media, active} = selection
      return {
        title: title,
        subtitle: active ? '✅ Active' : '❌ Inactive',
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [
        {field: 'sortOrder', direction: 'asc'}
      ]
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [
        {field: 'name', direction: 'asc'}
      ]
    }
  ]
})
