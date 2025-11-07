import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'issue',
  title: 'Issue (호)',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: '호수',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '발행일',
      type: 'date',
    }),
    // ✨ 크레딧 필드 추가
    defineField({
      name: 'credits',
      title: '크레딧',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' }
          ],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' }
            ]
          }
        }
      ],
      description: '해당 호의 크레딧 정보 (기고편집부, 논문편집부, 글, 번역, 편집, 디자인 등)'
    }),
  ],
  preview: {
    select: {
      title: 'title',
      number: 'number',
    },
    prepare(selection) {
      const { title, number } = selection
      return {
        title: `${number}호: ${title}`,
      }
    },
  },
})