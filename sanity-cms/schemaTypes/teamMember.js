import {defineField, defineType} from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Members',
  type: 'document',
  icon: () => '👥',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(100)
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      }
    }),
    defineField({
      name: 'role',
      title: 'Role/Position',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Current position or title in the company'
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      options: {
        list: [
          {title: 'Executive Leadership', value: 'executive'},
          {title: 'Research & Development', value: 'research'},
          {title: 'Operations', value: 'operations'},
          {title: 'Technology', value: 'technology'},
          {title: 'Marketing & Sales', value: 'marketing'},
          {title: 'Finance', value: 'finance'},
          {title: 'Advisory Board', value: 'advisory'}
        ]
      }
    }),
    defineField({
      name: 'professionalPhoto',
      title: 'Professional Photo',
      type: 'image',
      options: {
        hotspot: true,
        accept: 'image/*'
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required(),
      description: 'High-quality professional headshot'
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(300),
      description: 'Brief professional summary (max 300 characters for cards)'
    }),
    defineField({
      name: 'fullBio',
      title: 'Full Biography',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ]
          }
        }
      ],
      description: 'Detailed professional biography'
    }),
    defineField({
      name: 'credentials',
      title: 'Academic Credentials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'degree',
              type: 'string',
              title: 'Degree/Certification'
            },
            {
              name: 'institution',
              type: 'string',
              title: 'Institution'
            },
            {
              name: 'year',
              type: 'number',
              title: 'Year Obtained'
            },
            {
              name: 'field',
              type: 'string',
              title: 'Field of Study'
            }
          ]
        }
      ],
      description: 'Educational background and certifications'
    }),
    defineField({
      name: 'experience',
      title: 'Professional Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'position',
              type: 'string',
              title: 'Position/Role'
            },
            {
              name: 'company',
              type: 'string',
              title: 'Company/Organization'
            },
            {
              name: 'startYear',
              type: 'number',
              title: 'Start Year'
            },
            {
              name: 'endYear',
              type: 'number',
              title: 'End Year (leave blank if current)'
            },
            {
              name: 'description',
              type: 'text',
              title: 'Role Description',
              rows: 3
            },
            {
              name: 'achievements',
              type: 'array',
              title: 'Key Achievements',
              of: [{type: 'string'}]
            }
          ]
        }
      ],
      description: 'Previous work experience and achievements'
    }),
    defineField({
      name: 'expertise',
      title: 'Areas of Expertise',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Mushroom Cultivation', value: 'cultivation'},
          {title: 'Biotechnology', value: 'biotech'},
          {title: 'IoT Systems', value: 'iot'},
          {title: 'Sustainable Agriculture', value: 'sustainability'},
          {title: 'Food Science', value: 'food-science'},
          {title: 'Business Development', value: 'business-dev'},
          {title: 'Marketing', value: 'marketing'},
          {title: 'Finance & Investment', value: 'finance'},
          {title: 'Operations Management', value: 'operations'},
          {title: 'Research & Development', value: 'research'},
          {title: 'Quality Assurance', value: 'quality'},
          {title: 'Supply Chain', value: 'supply-chain'}
        ]
      },
      description: 'Key areas of professional expertise'
    }),
    defineField({
      name: 'achievements',
      title: 'Notable Achievements',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Achievement Title'
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
              rows: 2
            },
            {
              name: 'year',
              type: 'number',
              title: 'Year'
            },
            {
              name: 'organization',
              type: 'string',
              title: 'Awarding Organization'
            }
          ]
        }
      ],
      description: 'Awards, recognitions, and notable achievements'
    }),
    defineField({
      name: 'publications',
      title: 'Publications & Research',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Publication Title'
            },
            {
              name: 'journal',
              type: 'string',
              title: 'Journal/Publisher'
            },
            {
              name: 'year',
              type: 'number',
              title: 'Publication Year'
            },
            {
              name: 'url',
              type: 'url',
              title: 'Link to Publication'
            },
            {
              name: 'coAuthors',
              type: 'array',
              title: 'Co-Authors',
              of: [{type: 'string'}]
            }
          ]
        }
      ],
      description: 'Published research papers and articles'
    }),
    defineField({
      name: 'socialLinks',
      title: 'Professional Social Links',
      type: 'object',
      fields: [
        {
          name: 'linkedin',
          type: 'url',
          title: 'LinkedIn Profile'
        },
        {
          name: 'twitter',
          type: 'url',
          title: 'Twitter/X Profile'
        },
        {
          name: 'researchGate',
          type: 'url',
          title: 'ResearchGate Profile'
        },
        {
          name: 'orcid',
          type: 'url',
          title: 'ORCID ID'
        },
        {
          name: 'googleScholar',
          type: 'url',
          title: 'Google Scholar'
        },
        {
          name: 'website',
          type: 'url',
          title: 'Personal Website'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          type: 'email',
          title: 'Professional Email'
        },
        {
          name: 'phone',
          type: 'string',
          title: 'Phone Number'
        },
        {
          name: 'showContact',
          type: 'boolean',
          title: 'Show Contact Info Publicly',
          initialValue: false,
          description: 'Whether to display contact information on the website'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'joinedDate',
      title: 'Joined MYCOgenesis',
      type: 'date',
      description: 'When this person joined the company'
    }),
    defineField({
      name: 'isActive',
      title: 'Active Team Member',
      type: 'boolean',
      initialValue: true,
      description: 'Whether to display this person on the website'
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 100,
      description: 'Order in which to display team members (lower numbers first)'
    }),
    defineField({
      name: 'isFounder',
      title: 'Company Founder',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as company founder for special highlighting'
    }),
    defineField({
      name: 'isExecutive',
      title: 'Executive Leadership',
      type: 'boolean',
      initialValue: false,
      description: 'Part of executive leadership team'
    }),
    defineField({
      name: 'quote',
      title: 'Personal Quote',
      type: 'object',
      fields: [
        {
          name: 'text',
          type: 'text',
          title: 'Quote Text',
          rows: 3
        },
        {
          name: 'context',
          type: 'string',
          title: 'Quote Context',
          description: 'Optional context for the quote'
        }
      ],
      description: 'Personal or professional quote to display'
    }),
    defineField({
      name: 'funFacts',
      title: 'Fun Facts',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Interesting personal or professional facts'
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
      role: 'role',
      department: 'department',
      media: 'professionalPhoto',
      active: 'isActive',
      founder: 'isFounder',
      executive: 'isExecutive'
    },
    prepare(selection) {
      const {title, role, department, media, active, founder, executive} = selection
      
      let badges = []
      if (founder) badges.push('Founder')
      if (executive) badges.push('Executive')
      if (!active) badges.push('Inactive')
      
      const badgeText = badges.length > 0 ? ` • ${badges.join(', ')}` : ''
      
      return {
        title: title,
        subtitle: `${role} • ${department || 'General'}${badgeText}`,
        media: media
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
      title: 'Leadership First',
      name: 'leadership',
      by: [
        {field: 'isFounder', direction: 'desc'},
        {field: 'isExecutive', direction: 'desc'},
        {field: 'displayOrder', direction: 'asc'}
      ]
    },
    {
      title: 'Department',
      name: 'department',
      by: [
        {field: 'department', direction: 'asc'},
        {field: 'displayOrder', direction: 'asc'}
      ]
    },
    {
      title: 'Join Date (Newest)',
      name: 'joinedDesc',
      by: [
        {field: 'joinedDate', direction: 'desc'}
      ]
    }
  ]
})
