import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'issue',
  title: '호',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: '호수',
      type: 'number',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'title',
      title: '호 제목',
      type: 'string',
      description: '예: 지금까지의 타이포그래피',
    }),
    defineField({
      name: 'publishDate',
      title: '발행일',
      type: 'date',
    }),
    defineField({
      name: 'coverImage',
      title: '커버 이미지',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'number',
      subtitle: 'title',
      media: 'coverImage',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: `글짜씨 ${title}호`,
        subtitle: subtitle,
      }
    },
  },
})