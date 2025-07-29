import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'callToAction',
  title: 'Call To Action',
  type: 'object',
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'text',
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
    }),
    defineField({
      title: 'Button Text',
      name: 'buttonText',
      type: 'string',
    }),
    defineField({
        title: 'Button Text Link',
        name: 'buttonUrl',
        type: 'string',
    }),
  ],
})