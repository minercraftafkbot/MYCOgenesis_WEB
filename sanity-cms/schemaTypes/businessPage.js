import {defineField, defineType} from 'sanity'

export const businessPage = defineType({
  name: 'businessPage',
  title: 'Business Information Pages',
  type: 'document',
  icon: () => '🏢',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required().min(5).max(100),
      description: 'The main title for the page'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'URL path for the page (e.g., about-us, sustainability)'
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          {title: 'About Us', value: 'about-us'},
          {title: 'Mission & Vision', value: 'mission-vision'},
          {title: 'Our Story', value: 'our-story'},
          {title: 'Sustainability Practices', value: 'sustainability'},
          {title: 'Technology Overview', value: 'technology'},
          {title: 'Farm Locations', value: 'locations'},
          {title: 'Quality Assurance', value: 'quality'},
          {title: 'Certifications', value: 'certifications'},
          {title: 'Investment Information', value: 'investment'},
          {title: 'Partnership Opportunities', value: 'partnerships'},
          {title: 'Wholesale Information', value: 'wholesale'},
          {title: 'Privacy Policy', value: 'privacy-policy'},
          {title: 'Terms of Service', value: 'terms-of-service'},
          {title: 'Company Culture', value: 'culture'},
          {title: 'Careers', value: 'careers'},
          {title: 'Press & Media', value: 'press-media'}
        ]
      },
      validation: Rule => Rule.required(),
      description: 'Select the type of business page this represents'
    }),
    defineField({
      name: 'subtitle',
      title: 'Page Subtitle',
      type: 'string',
      validation: Rule => Rule.max(200),
      description: 'Optional subtitle or tagline for the page'
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
          title: 'Image Caption'
        }
      ],
      description: 'Large banner image for the top of the page'
    }),
    defineField({
      name: 'excerpt',
      title: 'Page Excerpt',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(300),
      description: 'Brief summary of the page content for SEO and previews'
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
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
                    type: 'boolean'
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
            },
            {
              name: 'width',
              type: 'string',
              title: 'Image Width',
              options: {
                list: [
                  {title: 'Full Width', value: 'full'},
                  {title: 'Large (75%)', value: 'large'},
                  {title: 'Medium (50%)', value: 'medium'},
                  {title: 'Small (25%)', value: 'small'}
                ]
              },
              initialValue: 'full'
            }
          ]
        },
        {
          type: 'object',
          name: 'calloutBox',
          title: 'Callout Box',
          fields: [
            {
              name: 'type',
              title: 'Callout Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Information', value: 'info'},
                  {title: 'Success/Achievement', value: 'success'},
                  {title: 'Warning/Important', value: 'warning'},
                  {title: 'Mission Statement', value: 'mission'},
                  {title: 'Vision Statement', value: 'vision'},
                  {title: 'Values', value: 'values'},
                  {title: 'Statistics', value: 'stats'}
                ]
              }
            },
            {
              name: 'title',
              title: 'Callout Title',
              type: 'string'
            },
            {
              name: 'content',
              title: 'Content',
              type: 'text',
              rows: 4
            },
            {
              name: 'icon',
              title: 'Icon (Emoji or Unicode)',
              type: 'string',
              description: 'Single emoji or unicode character to display'
            }
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              subtitle: 'content'
            },
            prepare(selection) {
              const {title, type, subtitle} = selection
              return {
                title: title || `${type} callout`,
                subtitle: subtitle?.substring(0, 60) + '...'
              }
            }
          }
        },
        {
          type: 'object',
          name: 'statsGrid',
          title: 'Statistics Grid',
          fields: [
            {
              name: 'title',
              title: 'Section Title',
              type: 'string'
            },
            {
              name: 'stats',
              title: 'Statistics',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'number',
                      type: 'string',
                      title: 'Statistic Number'
                    },
                    {
                      name: 'label',
                      type: 'string',
                      title: 'Statistic Label'
                    },
                    {
                      name: 'description',
                      type: 'string',
                      title: 'Description'
                    },
                    {
                      name: 'icon',
                      type: 'string',
                      title: 'Icon (Emoji)'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'object',
          name: 'teamShowcase',
          title: 'Team Member Showcase',
          fields: [
            {
              name: 'title',
              title: 'Section Title',
              type: 'string',
              initialValue: 'Meet Our Team'
            },
            {
              name: 'teamMembers',
              title: 'Featured Team Members',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{type: 'teamMember'}]
                }
              ],
              description: 'Select specific team members to showcase on this page'
            },
            {
              name: 'showAll',
              title: 'Show All Active Team Members',
              type: 'boolean',
              initialValue: false,
              description: 'If checked, will show all active team members regardless of selection above'
            }
          ]
        },
        {
          type: 'object',
          name: 'twoColumnContent',
          title: 'Two Column Content',
          fields: [
            {
              name: 'leftColumn',
              title: 'Left Column',
              type: 'array',
              of: [{type: 'block'}]
            },
            {
              name: 'rightColumn',
              title: 'Right Column',
              type: 'array',
              of: [{type: 'block'}]
            }
          ]
        },
        {
          type: 'object',
          name: 'timeline',
          title: 'Timeline/Milestones',
          fields: [
            {
              name: 'title',
              title: 'Timeline Title',
              type: 'string',
              initialValue: 'Our Journey'
            },
            {
              name: 'events',
              title: 'Timeline Events',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'date',
                      type: 'string',
                      title: 'Date/Year'
                    },
                    {
                      name: 'title',
                      type: 'string',
                      title: 'Event Title'
                    },
                    {
                      name: 'description',
                      type: 'text',
                      title: 'Event Description',
                      rows: 2
                    },
                    {
                      name: 'isImportant',
                      type: 'boolean',
                      title: 'Major Milestone',
                      initialValue: false
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      validation: Rule => Rule.required(),
      description: 'Main content of the page using rich text and custom components'
    }),
    defineField({
      name: 'sidebar',
      title: 'Sidebar Content',
      type: 'object',
      fields: [
        {
          name: 'showSidebar',
          title: 'Show Sidebar',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'title',
          title: 'Sidebar Title',
          type: 'string'
        },
        {
          name: 'content',
          title: 'Sidebar Content',
          type: 'array',
          of: [{type: 'block'}]
        },
        {
          name: 'quickLinks',
          title: 'Quick Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', type: 'string', title: 'Link Title'},
                {name: 'url', type: 'url', title: 'URL'},
                {name: 'isExternal', type: 'boolean', title: 'External Link', initialValue: false}
              ]
            }
          ]
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'relatedPages',
      title: 'Related Pages',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'businessPage'}, {type: 'blogPost'}, {type: 'researchArticle'}]
        }
      ],
      description: 'Pages to suggest at the bottom of this page'
    }),
    defineField({
      name: 'ctaSection',
      title: 'Call-to-Action Section',
      type: 'object',
      fields: [
        {
          name: 'showCta',
          title: 'Show CTA Section',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'title',
          title: 'CTA Title',
          type: 'string'
        },
        {
          name: 'description',
          title: 'CTA Description',
          type: 'text',
          rows: 2
        },
        {
          name: 'primaryButton',
          title: 'Primary Button',
          type: 'object',
          fields: [
            {name: 'text', type: 'string', title: 'Button Text'},
            {name: 'url', type: 'url', title: 'Button URL'},
            {name: 'isExternal', type: 'boolean', title: 'External Link', initialValue: false}
          ]
        },
        {
          name: 'secondaryButton',
          title: 'Secondary Button (Optional)',
          type: 'object',
          fields: [
            {name: 'text', type: 'string', title: 'Button Text'},
            {name: 'url', type: 'url', title: 'Button URL'},
            {name: 'isExternal', type: 'boolean', title: 'External Link', initialValue: false}
          ]
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: Rule => Rule.required(),
      initialValue: new Date().toISOString()
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When this page was last significantly updated'
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'}
        ]
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'showInNavigation',
      title: 'Show in Main Navigation',
      type: 'boolean',
      initialValue: false,
      description: 'Whether to include this page in the main website navigation'
    }),
    defineField({
      name: 'navigationOrder',
      title: 'Navigation Order',
      type: 'number',
      initialValue: 100,
      description: 'Order in navigation menu (lower numbers first)'
    }),
    defineField({
      name: 'requiresAuth',
      title: 'Requires Authentication',
      type: 'boolean',
      initialValue: false,
      description: 'Whether users need to be logged in to view this page'
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
          description: 'Title that appears in search results and browser tabs'
        },
        {
          name: 'metaDescription',
          type: 'string',
          title: 'Meta Description',
          validation: Rule => Rule.max(160),
          description: 'Description that appears in search results'
        },
        {
          name: 'keywords',
          type: 'array',
          title: 'SEO Keywords',
          of: [{type: 'string'}],
          options: {layout: 'tags'},
          description: 'Keywords for search engine optimization'
        },
        {
          name: 'ogImage',
          type: 'image',
          title: 'Social Media Image',
          description: 'Image that appears when sharing on social media'
        },
        {
          name: 'noIndex',
          type: 'boolean',
          title: 'No Index',
          initialValue: false,
          description: 'Prevent search engines from indexing this page'
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
      title: 'title',
      pageType: 'pageType',
      status: 'status',
      media: 'heroImage',
      publishedAt: 'publishedAt',
      inNav: 'showInNavigation'
    },
    prepare(selection) {
      const {title, pageType, status, media, publishedAt, inNav} = selection
      const statusEmoji = {
        'draft': '📝',
        'published': '✅',
        'archived': '🗄️'
      }
      
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      
      return {
        title: title,
        subtitle: `${statusEmoji[status]} ${pageType} • ${date}${inNav ? ' • In Navigation' : ''}`,
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Page Type',
      name: 'pageType',
      by: [
        {field: 'pageType', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Navigation Order',
      name: 'navigationOrder',
      by: [
        {field: 'showInNavigation', direction: 'desc'},
        {field: 'navigationOrder', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Last Updated (Newest)',
      name: 'lastUpdatedDesc',
      by: [
        {field: 'lastUpdated', direction: 'desc'}
      ]
    },
    {
      title: 'Published Date (Newest)',
      name: 'publishedDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    }
  ]
})
