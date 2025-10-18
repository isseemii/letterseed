import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'article',
  title: '아티클',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
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
      name: 'author',
      title: '글쓴이',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorBio',
      title: '글쓴이 소개',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'content',
      title: '본문',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: '본문', value: 'normal'},
            {title: '제목 1', value: 'h2'},
            {title: '제목 2', value: 'h3'},
            {title: '제목 3', value: 'h4'},
            {title: '제목 4', value: 'h5'},
            {title: '질문', value: 'h6'},
            {title: '인용', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: '굵게', value: 'strong'},
              {title: '기울임', value: 'em'},
              {title: '밑줄', value: 'underline'},
              {title: '위첨자', value: 'sup'},
              {title: '아래첨자', value: 'sub'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
              {
                name: 'footnote',
                type: 'object',
                title: '주석',
                fields: [
                  {
                    name: 'text',
                    type: 'text',
                    title: '주석 내용',
                    rows: 2,
                  },
                ],
                icon: () => '📝',
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: '캡션',
            },
            {
              name: 'alt',
              type: 'string',
              title: '대체 텍스트',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'issue',
      title: '소속 호',
      type: 'reference',
      to: [{type: 'issue'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: '소속 섹션',
      type: 'reference',
      to: [{type: 'section'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'references',
      title: '참고문헌',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: '본문', value: 'normal'}],
          lists: [
            {title: '불릿', value: 'bullet'},
            {title: '번호', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: '기울임', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
      description: '참고문헌 목록',
    }),
    defineField({
      name: 'imageSources',
      title: '이미지 출처',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: '본문', value: 'normal'}],
          lists: [
            {title: '불릿', value: 'bullet'},
            {title: '번호', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: '기울임', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
      description: '이미지 출처 목록',
    }),
    defineField({
      name: 'order',
      title: '순서',
      type: 'number',
      description: '섹션 내 표시 순서',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      issue: 'issue.number',
    },
    prepare(selection) {
      const {title, author, issue} = selection
      return {
        title: title,
        subtitle: `${author} | ${issue}호`,
      }
    },
  },
  orderings: [
    {
      title: '순서',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
})