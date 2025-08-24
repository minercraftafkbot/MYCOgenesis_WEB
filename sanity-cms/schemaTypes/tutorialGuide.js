import {defineField, defineType} from 'sanity'

export const tutorialGuide = defineType({
  name: 'tutorialGuide',
  title: 'Tutorials & Guides',
  type: 'document',
  icon: () => '📚',
  fields: [
    defineField({
      name: 'title',
      title: 'Tutorial Title',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(120),
      description: 'Clear, descriptive title for the tutorial'
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
      name: 'subtitle',
      title: 'Tutorial Subtitle',
      type: 'string',
      validation: Rule => Rule.max(200),
      description: 'Brief subtitle that explains what readers will learn'
    }),
    defineField({
      name: 'tutorialType',
      title: 'Tutorial Type',
      type: 'string',
      options: {
        list: [
          {title: 'Step-by-Step Guide', value: 'step-by-step'},
          {title: 'How-to Tutorial', value: 'how-to'},
          {title: 'Beginner Guide', value: 'beginner'},
          {title: 'Advanced Tutorial', value: 'advanced'},
          {title: 'Cooking Guide', value: 'cooking'},
          {title: 'Cultivation Guide', value: 'cultivation'},
          {title: 'Equipment Guide', value: 'equipment'},
          {title: 'Troubleshooting Guide', value: 'troubleshooting'},
          {title: 'Maintenance Guide', value: 'maintenance'},
          {title: 'Recipe Collection', value: 'recipes'},
          {title: 'Best Practices', value: 'best-practices'},
          {title: 'Quick Reference', value: 'quick-reference'}
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
          {title: 'Expert', value: 'expert'}
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'estimatedTime',
      title: 'Estimated Time to Complete',
      type: 'object',
      fields: [
        {name: 'value', type: 'number', title: 'Time Value', validation: Rule => Rule.required()},
        {
          name: 'unit', 
          type: 'string', 
          title: 'Time Unit',
          options: {
            list: [
              {title: 'Minutes', value: 'minutes'},
              {title: 'Hours', value: 'hours'},
              {title: 'Days', value: 'days'},
              {title: 'Weeks', value: 'weeks'}
            ]
          },
          validation: Rule => Rule.required()
        }
      ],
      description: 'How long it typically takes to complete this tutorial'
    }),
    defineField({
      name: 'category',
      title: 'Tutorial Category',
      type: 'string',
      options: {
        list: [
          {title: 'Mushroom Cultivation', value: 'cultivation'},
          {title: 'Cooking & Recipes', value: 'cooking'},
          {title: 'Farm Equipment', value: 'equipment'},
          {title: 'IoT & Technology', value: 'technology'},
          {title: 'Food Preparation', value: 'food-prep'},
          {title: 'Storage & Preservation', value: 'storage'},
          {title: 'Business Operations', value: 'business'},
          {title: 'Health & Nutrition', value: 'health'},
          {title: 'Sustainability', value: 'sustainability'},
          {title: 'Quality Control', value: 'quality'},
          {title: 'Troubleshooting', value: 'troubleshooting'},
          {title: 'General Knowledge', value: 'general'}
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'overview',
      title: 'Tutorial Overview',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(100).max(500),
      description: 'What will readers learn and why is this tutorial useful?'
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
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
          title: 'Image Caption'
        }
      ],
      validation: Rule => Rule.required(),
      description: 'Main image that represents this tutorial'
    }),
    defineField({
      name: 'learningOutcomes',
      title: 'Learning Outcomes',
      type: 'array',
      of: [{type: 'string'}],
      validation: Rule => Rule.min(3).max(8),
      description: 'What will readers be able to do after completing this tutorial?'
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'object',
      fields: [
        {
          name: 'hasPrerequisites',
          title: 'Has Prerequisites',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'knowledge',
          title: 'Required Knowledge',
          type: 'array',
          of: [{type: 'string'}],
          description: 'What should readers already know?'
        },
        {
          name: 'priorTutorials',
          title: 'Recommended Prior Tutorials',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{type: 'tutorialGuide'}]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'materials',
      title: 'Materials & Equipment Needed',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'item',
              type: 'string',
              title: 'Item Name',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              type: 'string',
              title: 'Description',
              description: 'Additional details about the item'
            },
            {
              name: 'quantity',
              type: 'string',
              title: 'Quantity',
              description: 'How much is needed (e.g., "2 cups", "1 piece")'
            },
            {
              name: 'isOptional',
              type: 'boolean',
              title: 'Optional Item',
              initialValue: false
            },
            {
              name: 'estimatedCost',
              type: 'string',
              title: 'Estimated Cost',
              description: 'Approximate cost (e.g., "$5-10", "Free")'
            },
            {
              name: 'whereToFind',
              type: 'string',
              title: 'Where to Find/Buy',
              description: 'Tips on where to source this item'
            },
            {
              name: 'productLink',
              type: 'reference',
              title: 'Related Product',
              to: [{type: 'product'}],
              description: 'If this is one of our products, link it here'
            }
          ]
        }
      ],
      description: 'List all materials, tools, and ingredients needed'
    }),
    defineField({
      name: 'steps',
      title: 'Tutorial Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Tutorial Step',
          fields: [
            {
              name: 'stepNumber',
              type: 'number',
              title: 'Step Number',
              validation: Rule => Rule.required().positive(),
              description: 'Order of this step in the tutorial'
            },
            {
              name: 'title',
              type: 'string',
              title: 'Step Title',
              validation: Rule => Rule.required(),
              description: 'Brief title describing what this step accomplishes'
            },
            {
              name: 'instructions',
              type: 'array',
              title: 'Step Instructions',
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
                    ]
                  }
                }
              ],
              validation: Rule => Rule.required()
            },
            {
              name: 'images',
              title: 'Step Images',
              type: 'array',
              of: [
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
                      title: 'Image Caption'
                    }
                  ]
                }
              ],
              description: 'Visual aids for this step'
            },
            {
              name: 'video',
              title: 'Step Video',
              type: 'object',
              fields: [
                {
                  name: 'url',
                  type: 'url',
                  title: 'Video URL',
                  description: 'YouTube, Vimeo, or other video platform URL'
                },
                {
                  name: 'thumbnail',
                  type: 'image',
                  title: 'Video Thumbnail',
                  options: {hotspot: true}
                },
                {
                  name: 'duration',
                  type: 'string',
                  title: 'Video Duration',
                  description: 'e.g., "2:30" for 2 minutes 30 seconds'
                }
              ]
            },
            {
              name: 'tips',
              title: 'Pro Tips & Notes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'type',
                      type: 'string',
                      title: 'Tip Type',
                      options: {
                        list: [
                          {title: 'Pro Tip', value: 'tip'},
                          {title: 'Warning', value: 'warning'},
                          {title: 'Note', value: 'note'},
                          {title: 'Troubleshooting', value: 'troubleshooting'}
                        ]
                      }
                    },
                    {
                      name: 'content',
                      type: 'text',
                      title: 'Tip Content',
                      rows: 2
                    }
                  ]
                }
              ]
            },
            {
              name: 'estimatedTime',
              title: 'Time for This Step',
              type: 'string',
              description: 'How long this step typically takes (e.g., "5 minutes")'
            },
            {
              name: 'difficulty',
              title: 'Step Difficulty',
              type: 'string',
              options: {
                list: [
                  {title: 'Easy', value: 'easy'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'Hard', value: 'hard'},
                  {title: 'Critical', value: 'critical'}
                ]
              }
            }
          ],
          preview: {
            select: {
              title: 'title',
              stepNumber: 'stepNumber',
              difficulty: 'difficulty',
              media: 'images.0'
            },
            prepare(selection) {
              const {title, stepNumber, difficulty, media} = selection
              return {
                title: `Step ${stepNumber}: ${title}`,
                subtitle: difficulty ? `${difficulty} difficulty` : '',
                media: media
              }
            }
          }
        }
      ],
      validation: Rule => Rule.min(3).max(50),
      description: 'Break down the tutorial into clear, actionable steps'
    }),
    defineField({
      name: 'troubleshooting',
      title: 'Common Issues & Solutions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'problem',
              type: 'string',
              title: 'Common Problem',
              validation: Rule => Rule.required()
            },
            {
              name: 'symptoms',
              type: 'array',
              title: 'Symptoms/Signs',
              of: [{type: 'string'}],
              description: 'How to identify this problem'
            },
            {
              name: 'causes',
              type: 'array',
              title: 'Possible Causes',
              of: [{type: 'string'}]
            },
            {
              name: 'solutions',
              type: 'array',
              title: 'Solutions',
              of: [{type: 'string'}],
              validation: Rule => Rule.min(1)
            },
            {
              name: 'prevention',
              type: 'text',
              title: 'How to Prevent This Issue',
              rows: 2
            }
          ]
        }
      ],
      description: 'Help readers solve common problems they might encounter'
    }),
    defineField({
      name: 'results',
      title: 'Expected Results',
      type: 'object',
      fields: [
        {
          name: 'description',
          type: 'text',
          title: 'What Should the Final Result Look Like?',
          rows: 3,
          validation: Rule => Rule.required()
        },
        {
          name: 'successIndicators',
          type: 'array',
          title: 'Signs of Success',
          of: [{type: 'string'}],
          description: 'How readers know they\'ve completed the tutorial successfully'
        },
        {
          name: 'resultImages',
          type: 'array',
          title: 'Result Images',
          of: [
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
                  title: 'Image Caption'
                }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'nextSteps',
      title: 'What\'s Next?',
      type: 'object',
      fields: [
        {
          name: 'suggestions',
          type: 'array',
          title: 'Suggested Next Steps',
          of: [{type: 'string'}],
          description: 'What readers can do after completing this tutorial'
        },
        {
          name: 'relatedTutorials',
          type: 'array',
          title: 'Related Tutorials',
          of: [
            {
              type: 'reference',
              to: [{type: 'tutorialGuide'}]
            }
          ]
        },
        {
          name: 'advancedTopics',
          type: 'array',
          title: 'Advanced Topics to Explore',
          of: [{type: 'string'}]
        }
      ]
    }),
    defineField({
      name: 'author',
      title: 'Tutorial Author',
      type: 'object',
      fields: [
        {name: 'name', type: 'string', title: 'Author Name', validation: Rule => Rule.required()},
        {name: 'credentials', type: 'string', title: 'Credentials/Expertise'},
        {name: 'bio', type: 'text', title: 'Author Bio', rows: 2},
        {name: 'image', type: 'image', title: 'Author Photo', options: {hotspot: true}}
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed/Approved By',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'teamMember'}]
        }
      ],
      description: 'Team members who have reviewed this tutorial for accuracy'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When this tutorial was last revised or updated'
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'In Review', value: 'review'},
          {title: 'Published', value: 'published'},
          {title: 'Needs Update', value: 'needs-update'},
          {title: 'Archived', value: 'archived'}
        ]
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Tutorial',
      type: 'boolean',
      description: 'Highlight this tutorial on homepage and category pages',
      initialValue: false
    }),
    defineField({
      name: 'isPremium',
      title: 'Premium Content',
      type: 'boolean',
      description: 'Requires premium membership or purchase to access',
      initialValue: false
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      description: 'Tags for better searchability and organization'
    }),
    defineField({
      name: 'ratings',
      title: 'User Ratings & Reviews',
      type: 'object',
      fields: [
        {
          name: 'allowRatings',
          type: 'boolean',
          title: 'Allow User Ratings',
          initialValue: true
        },
        {
          name: 'averageRating',
          type: 'number',
          title: 'Average Rating',
          validation: Rule => Rule.min(0).max(5),
          readOnly: true
        },
        {
          name: 'totalRatings',
          type: 'number',
          title: 'Total Ratings Count',
          readOnly: true
        }
      ]
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
          description: 'Primary SEO keyword for this tutorial'
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
      category: 'category',
      difficulty: 'difficulty',
      status: 'status',
      media: 'featuredImage',
      featured: 'isFeatured'
    },
    prepare(selection) {
      const {title, category, difficulty, status, media, featured} = selection
      const statusEmoji = {
        'draft': '📝',
        'review': '👀',
        'published': '✅',
        'needs-update': '⚠️',
        'archived': '🗄️'
      }
      
      const difficultyEmoji = {
        'beginner': '🟢',
        'intermediate': '🟡',
        'advanced': '🟠',
        'expert': '🔴'
      }
      
      return {
        title: title,
        subtitle: `${statusEmoji[status]} ${category} • ${difficultyEmoji[difficulty]} ${difficulty}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Category',
      name: 'category',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'difficulty', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Difficulty Level',
      name: 'difficulty',
      by: [
        {field: 'difficulty', direction: 'asc'},
        {field: 'category', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [
        {field: 'isFeatured', direction: 'desc'},
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Recently Updated',
      name: 'lastUpdated',
      by: [
        {field: 'lastUpdated', direction: 'desc'}
      ]
    },
    {
      title: 'Publication Date (Newest)',
      name: 'publishedDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    }
  ]
})
