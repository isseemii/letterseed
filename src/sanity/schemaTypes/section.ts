import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'section',
  title: '섹션',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '섹션명',
      type: 'string',
      description: '예: 기고, 인터뷰, 제안, 응답',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: '순서',
      type: 'number',
      description: '섹션 표시 순서',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
    },
    prepare(selection) {
      const {title, order} = selection
      return {
        title: title,
        subtitle: order ? `순서: ${order}` : '',
      }
    },
  },
})