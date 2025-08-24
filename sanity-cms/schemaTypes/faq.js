import {defineField, defineType} from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ (Frequently Asked Questions)',
  type: 'document',
  icon: () => '❓',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(200),
      description: 'The frequently asked question'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'question',
        maxLength: 96,
      },
      description: 'Auto-generated from the question for direct linking'
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Numbered', value: 'number'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: false
                  }
                ]
              },
            ]
          }
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: Rule => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ]
        }
      ],
      validation: Rule => Rule.required(),
      description: 'Detailed answer to the question'
    }),
    defineField({
      name: 'category',
      title: 'FAQ Category',
      type: 'string',
      options: {
        list: [
          {title: 'General Information', value: 'general'},
          {title: 'Products & Availability', value: 'products'},
          {title: 'Ordering & Shipping', value: 'ordering'},
          {title: 'Pricing & Payment', value: 'pricing'},
          {title: 'Mushroom Cultivation', value: 'cultivation'},
          {title: 'Cooking & Preparation', value: 'cooking'},
          {title: 'Health & Nutrition', value: 'health'},
          {title: 'Storage & Preservation', value: 'storage'},
          {title: 'Farm Tours & Visits', value: 'tours'},
          {title: 'Wholesale & Business', value: 'wholesale'},
          {title: 'Technology & IoT', value: 'technology'},
          {title: 'Sustainability', value: 'sustainability'},
          {title: 'Quality & Safety', value: 'quality'},
          {title: 'Account & Profile', value: 'account'},
          {title: 'Technical Support', value: 'support'},
          {title: 'Partnerships', value: 'partnerships'},
          {title: 'Careers', value: 'careers'},
          {title: 'Research & Studies', value: 'research'}
        ]
      },
      validation: Rule => Rule.required(),
      description: 'Category this FAQ belongs to'
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: 'Optional subcategory for more specific organization'
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'string',
      options: {
        list: [
          {title: 'High (Show First)', value: 'high'},
          {title: 'Medium (Standard)', value: 'medium'},
          {title: 'Low (Show Last)', value: 'low'}
        ]
      },
      initialValue: 'medium',
      description: 'Questions with higher priority appear first in their category'
    }),
    defineField({
      name: 'keywords',
      title: 'Search Keywords',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      description: 'Keywords to help users find this FAQ through search'
    }),
    defineField({
      name: 'relatedQuestions',
      title: 'Related Questions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'faq'}]
        }
      ],
      description: 'Other FAQs that might be relevant to users asking this question'
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'blogPost'}, {type: 'tutorialGuide'}, {type: 'researchArticle'}, {type: 'businessPage'}, {type: 'product'}]
        }
      ],
      description: 'Articles, tutorials, or products related to this question'
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'showContactInfo',
          title: 'Show Contact Info',
          type: 'boolean',
          initialValue: false,
          description: 'Display contact information with this FAQ'
        },
        {
          name: 'contactTitle',
          title: 'Contact Title',
          type: 'string',
          description: 'e.g., "Still have questions? Contact our support team."'
        },
        {
          name: 'contactEmail',
          title: 'Contact Email',
          type: 'email'
        },
        {
          name: 'contactPhone',
          title: 'Contact Phone',
          type: 'string'
        },
        {
          name: 'contactHours',
          title: 'Contact Hours',
          type: 'string',
          description: 'e.g., "Monday-Friday, 9 AM - 5 PM EST"'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When this FAQ was last reviewed and updated'
    }),
    defineField({
      name: 'updatedBy',
      title: 'Updated By',
      type: 'reference',
      to: [{type: 'teamMember'}],
      description: 'Team member who last updated this FAQ'
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this FAQ should be visible on the website'
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Display this FAQ in the homepage FAQ section'
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Number of times this FAQ has been viewed'
    }),
    defineField({
      name: 'helpfulnessRating',
      title: 'Helpfulness Rating',
      type: 'object',
      fields: [
        {
          name: 'helpful',
          title: 'Marked as Helpful',
          type: 'number',
          initialValue: 0,
          readOnly: true
        },
        {
          name: 'notHelpful',
          title: 'Marked as Not Helpful',
          type: 'number',
          initialValue: 0,
          readOnly: true
        }
      ],
      readOnly: true,
      description: 'User feedback on this FAQ\'s helpfulness'
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 3,
      description: 'Internal notes for team members (not visible to public)'
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
          validation: Rule => Rule.max(60),
          description: 'SEO title for this FAQ page'
        },
        {
          name: 'metaDescription',
          type: 'string',
          title: 'Meta Description',
          validation: Rule => Rule.max(160),
          description: 'SEO description for this FAQ page'
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
      title: 'question',
      category: 'category',
      priority: 'priority',
      published: 'isPublished',
      homepage: 'showOnHomepage',
      viewCount: 'viewCount'
    },
    prepare(selection) {
      const {title, category, priority, published, homepage, viewCount} = selection
      
      const priorityEmoji = {
        'high': '🔝',
        'medium': '➡️',
        'low': '⬇️'
      }
      
      const categoryEmoji = {
        'general': '🏢',
        'products': '🍄',
        'ordering': '🛒',
        'pricing': '💰',
        'cultivation': '🌱',
        'cooking': '👨‍🍳',
        'health': '🏥',
        'storage': '📦',
        'tours': '🚶‍♂️',
        'wholesale': '🏭',
        'technology': '💻',
        'sustainability': '♻️',
        'quality': '✅',
        'account': '👤',
        'support': '🛠️',
        'partnerships': '🤝',
        'careers': '💼',
        'research': '🔬'
      }
      
      let badges = []
      if (!published) badges.push('Unpublished')
      if (homepage) badges.push('Homepage')
      if (viewCount > 100) badges.push(`${viewCount} views`)
      
      const badgeText = badges.length > 0 ? ` • ${badges.join(', ')}` : ''
      
      return {
        title: title,
        subtitle: `${categoryEmoji[category] || '❓'} ${category} • ${priorityEmoji[priority]} ${priority}${badgeText}`
      }
    }
  },
  orderings: [
    {
      title: 'Category & Priority',
      name: 'categoryPriority',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'priority', direction: 'desc'}, // High priority first
        {field: 'question', direction: 'asc'}
      ]
    },
    {
      title: 'Priority (High First)',
      name: 'priority',
      by: [
        {field: 'priority', direction: 'desc'},
        {field: 'category', direction: 'asc'},
        {field: 'question', direction: 'asc'}
      ]
    },
    {
      title: 'Homepage FAQs',
      name: 'homepage',
      by: [
        {field: 'showOnHomepage', direction: 'desc'},
        {field: 'priority', direction: 'desc'}
      ]
    },
    {
      title: 'Most Viewed',
      name: 'mostViewed',
      by: [
        {field: 'viewCount', direction: 'desc'}
      ]
    },
    {
      title: 'Recently Updated',
      name: 'recentlyUpdated',
      by: [
        {field: 'lastUpdated', direction: 'desc'}
      ]
    },
    {
      title: 'Question A-Z',
      name: 'questionAsc',
      by: [
        {field: 'question', direction: 'asc'}
      ]
    }
  ]
})

// FAQ Category schema for organizing FAQ sections
export const faqCategory = defineType({
  name: 'faqCategory',
  title: 'FAQ Categories',
  type: 'document',
  icon: () => '📂',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Name of the FAQ category'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Category Description',
      type: 'text',
      rows: 2,
      description: 'Brief description of what this category covers'
    }),
    defineField({
      name: 'icon',
      title: 'Category Icon',
      type: 'string',
      description: 'Emoji or icon to represent this category'
    }),
    defineField({
      name: 'color',
      title: 'Category Color',
      type: 'string',
      description: 'Hex color code for category styling',
      validation: Rule => Rule.regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid hex color')
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 100,
      description: 'Order in which this category appears (lower numbers first)'
    }),
    defineField({
      name: 'isActive',
      title: 'Active Category',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this category is currently active'
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Display this category in the homepage FAQ section'
    })
  ],
  preview: {
    select: {
      title: 'name',
      description: 'description',
      active: 'isActive',
      homepage: 'showOnHomepage',
      order: 'displayOrder'
    },
    prepare(selection) {
      const {title, description, active, homepage, order} = selection
      
      let badges = []
      if (!active) badges.push('Inactive')
      if (homepage) badges.push('Homepage')
      badges.push(`Order: ${order}`)
      
      return {
        title: title,
        subtitle: `${description || 'No description'} • ${badges.join(' • ')}`
      }
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrder',
      by: [
        {field: 'displayOrder', direction: 'asc'},
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Active First',
      name: 'activeFirst',
      by: [
        {field: 'isActive', direction: 'desc'},
        {field: 'displayOrder', direction: 'asc'}
      ]
    }
  ]
})
