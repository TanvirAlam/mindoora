import {defineField, defineType} from 'sanity'
import {FaIcons as icon} from 'react-icons/fa'

export default defineType({
  name: 'mindooraSocialMediaIcons',
  title: 'Social media Icons',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'SocialIcon',
      title: 'Social Icon Name',
      type: 'string',
    }),
    defineField({
      name: 'socialIconColor',
      title: 'Social Icon color',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'socialIconDark',
      title: 'Social Icon Dark',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})
