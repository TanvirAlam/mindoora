import {defineField, defineType} from 'sanity'
import {BiCarousel as icon} from 'react-icons/bi'

export default defineType({
  name: 'mindooraCarousel',
  title: 'Carousel Cards',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'gameName',
      title: 'Game Name',
      type: 'string',
    }),
    defineField({
      name: 'gameDescription',
      title: ' Game Description',
      type: 'string',
    }),
    defineField({
      name: 'cardImageColor',
      title: 'Card Image color',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'cardImageWhite',
      title: 'Card Image White',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'carousalAnimation',
      title: 'Animation',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
    }),
  ],
})
