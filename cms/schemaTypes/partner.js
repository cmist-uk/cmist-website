import { defineField, defineType } from 'sanity'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Description',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Photos',
      description: 'Drag to reorder. All photos are shown on the partners page.',
      options: { layout: 'grid' },
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
  ],
})
