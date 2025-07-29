import {defineField, defineType} from 'sanity'
import {AiFillCodeSandboxSquare as icon} from 'react-icons/ai'

export default defineType({
  name: 'mindooraFeature',
  title: 'Feature Section',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'featureSummary'}],
    }),
  ]
})
