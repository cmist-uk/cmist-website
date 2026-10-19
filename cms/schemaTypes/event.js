import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Headline',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL Slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startsAt',
      type: 'datetime',
      title: 'Date and time',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Body Content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Photos',
      description: 'Drag to reorder. The first image is used as the cover on the events list.',
      options: { layout: 'grid' },
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startsAt: 'startsAt',
    },
    prepare({ title, startsAt }) {
      return {
        title,
        subtitle: startsAt
          ? new Date(startsAt).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Europe/London',
            })
          : 'No date set',
      }
    },
  },
})
