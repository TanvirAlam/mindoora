import {defineField, defineType} from 'sanity'
import {FaSlideshare as icon} from 'react-icons/fa'

export default defineType({
  name: 'mindooraHero',
  title: 'Hero Section',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Sub Title',
      type: 'string',
    }),
    defineField({
      name: 'bgImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    })
  ]
})
