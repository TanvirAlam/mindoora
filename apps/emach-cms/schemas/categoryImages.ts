import {defineField, defineType} from 'sanity'
import {AiFillCodeSandboxSquare as icon} from 'react-icons/ai'

export default defineType({
  name: 'categoryImages',
  title: 'Category Section',
  type: 'document',
  icon,
  fields: [
    defineField({
        name: 'CategoryName',
        title: 'Category Name',
        type: 'string',
    }),
    defineField({
        name: 'CategoryImage',
        title: 'Category Image',
        type: 'image',
        options: {
            hotspot: true,
        },
    })
  ]
})
