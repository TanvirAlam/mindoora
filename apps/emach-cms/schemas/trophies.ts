import {defineField, defineType} from 'sanity'
import {AiFillCodeSandboxSquare as icon} from 'react-icons/ai'

export default defineType({
  name: 'mindooraTrophies',
  title: 'Trophy Section',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'TrophyImage',
      title: 'Trophy Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'TrophyName',
      title: ' Trophy Name',
      type: 'string',
    }),
    defineField({
      name: 'ranks',
      title: 'Ranks',
      type: 'string', // Change type to string for dropdown
      options: {
        list: [
          { title: 'Quiz Master', value: 'Quiz Master' },
          { title: 'Knowledge Guru', value: 'Knowledge Guru' },
          { title: 'Trivia Champion', value: 'Trivia Champion' },
          { title: 'Brainiac', value: 'Brainiac' },
          { title: 'Quiz Whiz', value: 'Quiz Whiz' }
        ]
      }
    }),
    defineField({
      name: 'clasification',
      title: 'Clasification',
      type: 'string', // Change type to string for dropdown
      options: {
        list: [
          { title: 'Biological', value: 'Biological' },
          { title: 'Educational', value: 'Educational' },
          { title: 'Geographical', value: 'Geographical' },
          { title: 'Taxonomic', value: 'Taxonomic' },
          { title: 'Socioeconomic', value: 'Socioeconomic' }
        ]
      }
    }),
    defineField({
      name: 'pointsEarned',
      title: 'Points Earned',
      type: 'number',
    }),
    defineField({
      name: 'numberOfLoggedIn',
      title: 'Number of times logged in',
      type: 'number',
    }),
    defineField({
      name: 'numberOfGamesPlayed',
      title: 'Number of times Games played',
      type: 'number',
    }),
    defineField({
      name: 'numberGamesCreated',
      title: 'Number of games created',
      type: 'number',
    }),
  ]
})
