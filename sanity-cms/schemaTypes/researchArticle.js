import {defineField, defineType} from 'sanity'

export const researchArticle = defineType({
  name: 'researchArticle',
  title: 'Research Articles',
  type: 'document',
  icon: () => '🔬',
  fields: [
    defineField({
      name: 'title',
      title: 'Research Title',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(200),
      description: 'Clear, descriptive title for academic/professional audience'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'abstract',
      title: 'Abstract',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(100).max(500),
      description: 'Concise summary of research findings and methodology (100-500 words)'
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{type: 'string'}],
      validation: Rule => Rule.min(3).max(10),
      description: 'Research keywords for SEO and academic indexing'
    }),
    defineField({
      name: 'researchType',
      title: 'Research Type',
      type: 'string',
      options: {
        list: [
          {title: 'Original Research', value: 'original-research'},
          {title: 'Literature Review', value: 'literature-review'},
          {title: 'Case Study', value: 'case-study'},
          {title: 'Technical Analysis', value: 'technical-analysis'},
          {title: 'Market Research', value: 'market-research'},
          {title: 'Experimental Study', value: 'experimental-study'}
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Numbered', value: 'number'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
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
              title: 'Alternative Text'
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ]
        }
      ],
      description: 'Detailed research methodology and experimental procedures'
    }),
    defineField({
      name: 'content',
      title: 'Research Content',
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
              {title: 'Superscript', value: 'sup'},
              {title: 'Subscript', value: 'sub'}
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
                ]
              },
              {
                title: 'Citation',
                name: 'citation',
                type: 'object',
                fields: [
                  {
                    title: 'Citation Text',
                    name: 'text',
                    type: 'string',
                  },
                  {
                    title: 'Citation Number',
                    name: 'number',
                    type: 'number',
                  }
                ]
              }
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
              name: 'attribution',
              type: 'string',
              title: 'Image Attribution/Source'
            }
          ]
        },
        {
          type: 'object',
          name: 'dataTable',
          title: 'Data Table',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Table Title'
            },
            {
              name: 'headers',
              type: 'array',
              title: 'Table Headers',
              of: [{type: 'string'}]
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Table Rows',
              of: [
                {
                  type: 'object',
                  title: 'Table Row',
                  fields: [
                    {
                      name: 'cells',
                      type: 'array',
                      title: 'Row Cells',
                      of: [{type: 'string'}]
                    }
                  ]
                }
              ]
            },
            {
              name: 'csvData',
              type: 'text',
              title: 'CSV Data (Alternative)',
              description: 'Paste CSV data here as an alternative to manually entering rows',
              rows: 5
            },
            {
              name: 'caption',
              type: 'text',
              title: 'Table Caption'
            }
          ]
        },
        {
          type: 'object',
          name: 'chartVisualization',
          title: 'Chart/Graph',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Chart Title'
            },
            {
              name: 'chartType',
              type: 'string',
              title: 'Chart Type',
              options: {
                list: [
                  {title: 'Line Chart', value: 'line'},
                  {title: 'Bar Chart', value: 'bar'},
                  {title: 'Pie Chart', value: 'pie'},
                  {title: 'Scatter Plot', value: 'scatter'},
                  {title: 'Area Chart', value: 'area'}
                ]
              }
            },
            {
              name: 'data',
              type: 'text',
              title: 'Chart Data (JSON format)',
              description: 'Structured data for chart rendering'
            },
            {
              name: 'description',
              type: 'text',
              title: 'Chart Description'
            }
          ]
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'findings',
      title: 'Key Findings',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'finding',
              type: 'string',
              title: 'Finding Statement'
            },
            {
              name: 'significance',
              type: 'string',
              title: 'Significance Level',
              options: {
                list: [
                  {title: 'High', value: 'high'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'Low', value: 'low'}
                ]
              }
            },
            {
              name: 'evidence',
              type: 'text',
              title: 'Supporting Evidence'
            }
          ]
        }
      ],
      description: 'Summarize key research findings'
    }),
    defineField({
      name: 'citations',
      title: 'References & Citations',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'authors',
              type: 'string',
              title: 'Authors'
            },
            {
              name: 'title',
              type: 'string',
              title: 'Article/Paper Title'
            },
            {
              name: 'journal',
              type: 'string',
              title: 'Journal/Publication'
            },
            {
              name: 'year',
              type: 'number',
              title: 'Publication Year'
            },
            {
              name: 'doi',
              type: 'string',
              title: 'DOI'
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL'
            },
            {
              name: 'citationType',
              type: 'string',
              title: 'Citation Type',
              options: {
                list: [
                  {title: 'Journal Article', value: 'journal'},
                  {title: 'Book', value: 'book'},
                  {title: 'Website', value: 'website'},
                  {title: 'Conference Paper', value: 'conference'},
                  {title: 'Thesis', value: 'thesis'}
                ]
              }
            }
          ]
        }
      ],
      description: 'Academic references and citations'
    }),
    defineField({
      name: 'downloadableResources',
      title: 'Downloadable Resources',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Resource Title'
            },
            {
              name: 'description',
              type: 'text',
              title: 'Resource Description'
            },
            {
              name: 'fileType',
              type: 'string',
              title: 'File Type',
              options: {
                list: [
                  {title: 'PDF Document', value: 'pdf'},
                  {title: 'Excel Spreadsheet', value: 'excel'},
                  {title: 'CSV Data', value: 'csv'},
                  {title: 'Research Protocol', value: 'protocol'},
                  {title: 'Supplementary Material', value: 'supplementary'}
                ]
              }
            }
          ]
        }
      ],
      description: 'PDFs, data files, protocols for download'
    }),
    defineField({
      name: 'author',
      title: 'Lead Author',
      type: 'object',
      fields: [
        {name: 'name', type: 'string', title: 'Full Name', validation: Rule => Rule.required()},
        {name: 'credentials', type: 'string', title: 'Academic Credentials'},
        {name: 'affiliation', type: 'string', title: 'Institutional Affiliation'},
        {name: 'email', type: 'email', title: 'Email'},
        {name: 'bio', type: 'text', title: 'Bio', rows: 3},
        {name: 'image', type: 'image', title: 'Profile Image', options: {hotspot: true}}
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'coAuthors',
      title: 'Co-Authors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Full Name'},
            {name: 'credentials', type: 'string', title: 'Academic Credentials'},
            {name: 'affiliation', type: 'string', title: 'Institutional Affiliation'},
            {name: 'contribution', type: 'string', title: 'Contribution to Research'}
          ]
        }
      ]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publication Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Under Review', value: 'review'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'}
        ]
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Research',
      type: 'boolean',
      description: 'Highlight on homepage and research section',
      initialValue: false
    }),
    defineField({
      name: 'researchArea',
      title: 'Research Area',
      type: 'string',
      options: {
        list: [
          {title: 'Mushroom Cultivation', value: 'cultivation'},
          {title: 'Nutritional Analysis', value: 'nutrition'},
          {title: 'Sustainability', value: 'sustainability'},
          {title: 'IoT & Technology', value: 'technology'},
          {title: 'Market Analysis', value: 'market'},
          {title: 'Health Benefits', value: 'health'},
          {title: 'Food Safety', value: 'safety'},
          {title: 'Processing Methods', value: 'processing'}
        ]
      }
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Academic Researchers', value: 'academic'},
          {title: 'Industry Professionals', value: 'industry'},
          {title: 'Investors', value: 'investors'},
          {title: 'Policy Makers', value: 'policy'},
          {title: 'Other Farmers', value: 'farmers'},
          {title: 'General Public', value: 'general'}
        ]
      }
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
        },
        {
          name: 'focusKeyphrase',
          type: 'string',
          title: 'Focus Keyphrase',
          description: 'Primary SEO keyword for this research'
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
      status: 'status',
      publishedAt: 'publishedAt',
      featured: 'isFeatured',
      researchArea: 'researchArea'
    },
    prepare(selection) {
      const {title, status, publishedAt, featured, researchArea} = selection
      const statusEmoji = {
        'draft': '📝',
        'review': '🔍',
        'published': '✅',
        'archived': '🗄️'
      }
      
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      
      return {
        title: title,
        subtitle: `${statusEmoji[status]} ${status} • ${researchArea || 'General'} • ${date}${featured ? ' • Featured' : ''}`,
      }
    }
  },
  orderings: [
    {
      title: 'Publication Date (Newest)',
      name: 'publishedDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'isFeatured', direction: 'desc'},
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Research Area',
      name: 'researchArea',
      by: [
        {field: 'researchArea', direction: 'asc'},
        {field: 'publishedAt', direction: 'desc'}
      ]
    }
  ]
})
