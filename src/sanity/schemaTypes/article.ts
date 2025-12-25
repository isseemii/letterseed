import {defineField, defineType} from 'sanity'

// ========================================
// 공통 스타일 및 마크 정의
// ========================================

// 제목 스타일 정의 (명확한 매핑)
const headingStyles = [
  {title: '제목 1 (H2)', value: 'h2'},
  {title: '제목 2 (H3)', value: 'h3'},
  {title: '제목 3 (H4)', value: 'h4'},
  {title: '제목 4 (H5)', value: 'h5'},
  {title: '질문 (H6)', value: 'h6'},
]

// 블록 스타일 정의
const blockStyles = {
  standard: [
    {title: '본문', value: 'normal'},
    ...headingStyles.slice(0, 4), // 제목 1~4
    {title: '인용', value: 'blockquote'},
  ],
  withQuestion: [
    {title: '본문', value: 'normal'},
    ...headingStyles.slice(0, 4), // 제목 1~4
    headingStyles[4], // 질문 (H6)
    {title: '인용', value: 'blockquote'},
  ],
  minimal: [
    {title: '본문', value: 'normal'},
    ...headingStyles.slice(0, 2), // 제목 1~2
  ],
  simple: [
    {title: '본문', value: 'normal'},
  ],
}

// 데코레이터 마크 정의
const decoratorMarks = {
  full: [
    {title: '굵게', value: 'strong'},
    {title: '기울임', value: 'em'},
    {title: '밑줄', value: 'underline'},
    {title: '위첨자', value: 'sup'},
    {title: '아래첨자', value: 'sub'},
    {title: '들여쓰기', value: 'indent'},
  ],
  basic: [
    {title: '굵게', value: 'strong'},
    {title: '기울임', value: 'em'},
    {title: '밑줄', value: 'underline'},
  ],
  minimal: [
    {title: '굵게', value: 'strong'},
    {title: '기울임', value: 'em'},
  ],
}

// 주석(annotation) 정의
const annotations = [
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
]

// 이미지 필드 정의
const imageFields = [
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
  {
    name: 'width',
    type: 'string',
    title: '너비',
    options: {
      list: [
        {title: '기본', value: 'default'},
        {title: '전체 너비', value: 'full'},
        {title: '작게', value: 'small'},
      ],
    },
    initialValue: 'default',
  },
]

// 재사용 가능한 블록 정의 함수
const createBlockDefinition = (
  styleType: keyof typeof blockStyles = 'standard',
  decoratorType: keyof typeof decoratorMarks = 'full',
  includeAnnotations: boolean = true
) => ({
  type: 'block',
  styles: blockStyles[styleType],
  marks: {
    decorators: decoratorMarks[decoratorType],
    ...(includeAnnotations && { annotations }),
  },
})

// 재사용 가능한 이미지 정의 함수
const createImageDefinition = () => ({
  type: 'image',
  title: '이미지',
  options: {hotspot: true},
  fields: imageFields,
})

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
    }),
    // defineField({
    //   name: 'authorBio',
    //   title: '글쓴이 소개',
    //   type: 'text',
    //   rows: 2,
    // }),
    
    // ✨ 아티클 타입 선택 (선택 사항 - 여러 타입을 조합할 수 있음)
    defineField({
      name: 'articleType',
      title: '아티클 타입 (참고용)',
      type: 'string',
      options: {
        list: [
          {title: '일반 아티클', value: 'standard'},
          {title: '응답 모음', value: 'responses'},
          {title: '인터뷰 Q&A', value: 'interview'},
          {title: '대화', value: 'conversation'},
          {title: 'Q&A', value: 'qa'},
          {title: '혼합', value: 'mixed'}
        ],
        layout: 'radio'
      },
      description: '주로 사용하는 타입을 선택하세요 (여러 타입을 함께 사용할 수 있습니다)'
    }),

    // 개괄글/서론 (모든 타입 공통)
    defineField({
      name: 'introduction',
      title: '개괄글 / 서론',
      type: 'array',
      of: [
        createBlockDefinition('standard', 'full', true),
        createImageDefinition(),
      ],
      description: '아티클 시작 부분의 개괄글이나 서론을 작성하세요 (모든 타입 공통)'
    }),
    
    // ========================================
    // 타입별 메인 컨텐츠
    // ========================================
    
    // 통합 컨텐츠 블록 (순서 자유롭게 배치 가능)
    defineField({
      name: 'contentBlocks',
      title: '컨텐츠 블록 (순서 자유 배치)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contentBlock',
          title: '컨텐츠 블록',
          fields: [
            {
              name: 'blockType',
              title: '블록 타입',
              type: 'string',
              options: {
                list: [
                  {title: '일반 본문', value: 'standard'},
                  {title: '응답 모음', value: 'responses'},
                  {title: '인터뷰 Q&A', value: 'interviewQA'},
                  {title: '대화', value: 'conversation'},
                  {title: 'Q&A', value: 'qaList'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            },
            // 일반 본문
            {
              name: 'standardContent',
              title: '일반 본문 내용',
              type: 'array',
              of: [
                createBlockDefinition('withQuestion', 'full', true),
                {
                  type: 'image',
                  title: '이미지',
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
                    {
                      name: 'width',
                      type: 'string',
                      title: '너비',
                      options: {
                        list: [
                          {title: '기본', value: 'default'},
                          {title: '전체 너비', value: 'full'},
                          {title: '작게', value: 'small'},
                        ],
                      },
                      initialValue: 'default',
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'imageGrid',
                  title: '이미지 그리드',
                  fields: [
                    {
                      name: 'images',
                      type: 'array',
                      title: '이미지들',
                      validation: (Rule) => Rule.required().min(2),
                      of: [
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
                    },
                    {
                      name: 'columns',
                      type: 'number',
                      title: '열 개수',
                      options: {
                        list: [
                          {title: '2열', value: 2},
                          {title: '3열', value: 3},
                          {title: '4열', value: 4},
                        ],
                      },
                      initialValue: 2,
                    },
                    {
                      name: 'gridCaption',
                      type: 'string',
                      title: '그리드 전체 캡션',
                    },
                  ],
                  preview: {
                    select: {
                      images: 'images',
                      columns: 'columns',
                    },
                    prepare(selection) {
                      const {images, columns} = selection
                      return {
                        title: `이미지 그리드 (${images?.length || 0}개, ${columns}열)`,
                        media: images?.[0],
                      }
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'imageSlider',
                  title: '이미지 슬라이더',
                  fields: [
                    {
                      name: 'images',
                      type: 'array',
                      title: '이미지들',
                      validation: (Rule) => Rule.required().min(2),
                      of: [
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
                    },
                    {
                      name: 'sliderCaption',
                      type: 'string',
                      title: '슬라이더 전체 캡션',
                    },
                    {
                      name: 'autoplay',
                      type: 'boolean',
                      title: '자동 재생',
                      initialValue: false,
                    },
                    {
                      name: 'showThumbnails',
                      type: 'boolean',
                      title: '썸네일 표시',
                      initialValue: true,
                    },
                  ],
                  preview: {
                    select: {
                      images: 'images',
                      autoplay: 'autoplay',
                    },
                    prepare(selection) {
                      const {images, autoplay} = selection
                      return {
                        title: `이미지 슬라이더 (${images?.length || 0}개)${autoplay ? ' 🔄' : ''}`,
                        media: images?.[0],
                      }
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'table',
                  title: '표',
                  fields: [
                    {
                      name: 'rows',
                      type: 'array',
                      title: '행',
                      of: [
                        {
                          type: 'object',
                          name: 'tableRow',
                          title: '행',
                          fields: [
                            {
                              name: 'label',
                              type: 'string',
                              title: '라벨',
                              validation: (Rule) => Rule.required(),
                            },
                            {
                              name: 'content',
                              type: 'array',
                              title: '내용',
                              of: [
                                createBlockDefinition('standard', 'full', true),
                              ],
                              validation: (Rule) => Rule.required(),
                            },
                          ],
                          preview: {
                            select: {
                              label: 'label',
                              content: 'content',
                            },
                            prepare({ label, content }: any) {
                              const firstBlock = content?.[0]
                              const preview = firstBlock?.children?.[0]?.text || ''
                              return {
                                title: label || '(라벨 없음)',
                                subtitle: preview.substring(0, 50) + (preview.length > 50 ? '...' : ''),
                              }
                            },
                          },
                        },
                      ],
                      validation: (Rule) => Rule.min(1),
                    },
                  ],
                  preview: {
                    select: {
                      rows: 'rows',
                    },
                    prepare({ rows }: any) {
                      return {
                        title: `표 (${rows?.length || 0}행)`,
                        subtitle: rows?.[0]?.label || '',
                      }
                    },
                  },
                },
              ],
              hidden: ({parent}: any) => parent?.blockType !== 'standard',
            },
            // 응답 모음
            {
              name: 'responsesContent',
              title: '응답 모음 내용',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: '응답',
                  fields: [
                    {
                      name: 'year',
                      title: '년도',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'title',
                      title: '제목',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'author',
                      title: '글쓴이',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'content',
                      title: '본문',
                      type: 'array',
                      of: [
                        createBlockDefinition('standard', 'full', true),
                        {
                          type: 'image',
                          title: '이미지',
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
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'references',
                      title: '참고문헌',
                      type: 'array',
                      of: [
                        createBlockDefinition('simple', 'minimal', false),
                      ],
                    },
                    {
                      name: 'image',
                      title: '사진 첨부',
                      type: 'image',
                      options: {hotspot: true},
                      fields: [
                        {
                          name: 'alt',
                          type: 'string',
                          title: '대체 텍스트',
                        },
                      ],
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      author: 'author',
                      year: 'year',
                      media: 'image',
                    },
                    prepare(selection) {
                      const {title, author, year, media} = selection
                      return {
                        title: `${year} - ${title}`,
                        subtitle: author,
                        media: media,
                      }
                    },
                  },
                },
              ],
              hidden: ({parent}: any) => parent?.blockType !== 'responses',
            },
            // 인터뷰 Q&A
            {
              name: 'interviewQAContent',
              title: '인터뷰 Q&A 내용',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: 'Q&A',
                  fields: [
                    {
                      name: 'question',
                      title: '질문',
                      type: 'array',
                      of: [
                        createBlockDefinition('minimal', 'basic', true),
                      ],
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'answers',
                      title: '응답',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          title: '답변',
                          fields: [
                            {
                              name: 'person',
                              title: '응답자',
                              type: 'string',
                              validation: (Rule) => Rule.required(),
                            },
                            {
                              name: 'answer',
                              title: '답변',
                              type: 'array',
                              of: [
                                createBlockDefinition('standard', 'full', true),
                                {
                                  type: 'image',
                                  title: '이미지',
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
                              validation: (Rule) => Rule.required(),
                            },
                          ],
                          preview: {
                            select: {
                              title: 'person',
                              answer: 'answer',
                            },
                            prepare(selection) {
                              const {title, answer} = selection
                              const text = Array.isArray(answer) 
                                ? answer
                                    .filter((block: any) => block._type === 'block' && block.children)
                                    .map((block: any) => 
                                      block.children
                                        .filter((child: any) => child._type === 'span')
                                        .map((child: any) => child.text)
                                        .join('')
                                    )
                                    .join(' ')
                                : ''
                              return {
                                title: title,
                                subtitle: text?.substring(0, 100) + (text?.length > 100 ? '...' : ''),
                              }
                            },
                          },
                        },
                      ],
                      validation: (Rule) => Rule.required().min(1),
                    },
                  ],
                  preview: {
                    select: {
                      question: 'question',
                      answers: 'answers',
                    },
                    prepare(selection) {
                      const {question, answers} = selection
                      const questionText = Array.isArray(question)
                        ? question
                            .filter((block: any) => block._type === 'block' && block.children)
                            .map((block: any) =>
                              block.children
                                .filter((child: any) => child._type === 'span')
                                .map((child: any) => child.text)
                                .join('')
                            )
                            .join(' ')
                        : question || '질문'
                      return {
                        title: questionText,
                        subtitle: `${answers?.length || 0}명의 응답`,
                      }
                    },
                  },
                },
              ],
              hidden: ({parent}: any) => parent?.blockType !== 'interviewQA',
            },
            // 대화
            {
              name: 'conversationContent',
              title: '대화 내용',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: '발언',
                  fields: [
                    {
                      name: 'speaker',
                      title: '발언자',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'text',
                      title: '발언 내용',
                      type: 'array',
                      of: [
                        createBlockDefinition('standard', 'full', true),
                        {
                          type: 'image',
                          title: '이미지',
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
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: {
                    select: {
                      speaker: 'speaker',
                      text: 'text',
                    },
                    prepare(selection) {
                      const {speaker, text} = selection
                      const textContent = Array.isArray(text)
                        ? text
                            .filter((block: any) => block._type === 'block' && block.children)
                            .map((block: any) =>
                              block.children
                                .filter((child: any) => child._type === 'span')
                                .map((child: any) => child.text)
                                .join('')
                            )
                            .join(' ')
                        : ''
                      return {
                        title: speaker,
                        subtitle: textContent?.substring(0, 100) + (textContent?.length > 100 ? '...' : ''),
                      }
                    },
                  },
                },
              ],
              hidden: ({parent}: any) => parent?.blockType !== 'conversation',
            },
            // Q&A
            {
              name: 'qaListContent',
              title: 'Q&A 내용',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: 'Q&A',
                  fields: [
                    {
                      name: 'question',
                      title: '질문 (Q)',
                      type: 'array',
                      of: [
                        createBlockDefinition('minimal', 'basic', true),
                      ],
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'answer',
                      title: '답변 (A)',
                      type: 'array',
                      of: [
                        createBlockDefinition('standard', 'full', true),
                        {
                          type: 'image',
                          title: '이미지',
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
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: {
                    select: {
                      question: 'question',
                      answer: 'answer',
                    },
                    prepare(selection) {
                      const {question, answer} = selection
                      const questionText = Array.isArray(question)
                        ? question
                            .filter((block: any) => block._type === 'block' && block.children)
                            .map((block: any) =>
                              block.children
                                .filter((child: any) => child._type === 'span')
                                .map((child: any) => child.text)
                                .join('')
                            )
                            .join(' ')
                        : question || '질문'
                      const answerText = Array.isArray(answer)
                        ? answer
                            .filter((block: any) => block._type === 'block' && block.children)
                            .map((block: any) =>
                              block.children
                                .filter((child: any) => child._type === 'span')
                                .map((child: any) => child.text)
                                .join('')
                            )
                            .join(' ')
                        : ''
                      return {
                        title: questionText,
                        subtitle: answerText?.substring(0, 100) + (answerText?.length > 100 ? '...' : ''),
                      }
                    },
                  },
                },
              ],
              hidden: ({parent}: any) => parent?.blockType !== 'qaList',
            },
          ],
          preview: {
            select: {
              blockType: 'blockType',
              standardContent: 'standardContent',
              responsesContent: 'responsesContent',
              interviewQAContent: 'interviewQAContent',
              conversationContent: 'conversationContent',
              qaListContent: 'qaListContent',
            },
            prepare(selection) {
              const {blockType, standardContent, responsesContent, interviewQAContent, conversationContent, qaListContent} = selection
              const typeLabels: any = {
                standard: '일반 본문',
                responses: '응답 모음',
                interviewQA: '인터뷰 Q&A',
                conversation: '대화',
                qaList: 'Q&A',
              }
              
              let content = null
              if (blockType === 'standard') content = standardContent
              else if (blockType === 'responses') content = responsesContent
              else if (blockType === 'interviewQA') content = interviewQAContent
              else if (blockType === 'conversation') content = conversationContent
              else if (blockType === 'qaList') content = qaListContent
              
              return {
                title: typeLabels[blockType] || '컨텐츠 블록',
                subtitle: content ? `${Array.isArray(content) ? content.length : 0}개 항목` : '',
              }
            },
          },
        },
      ],
      description: '컨텐츠 블록을 원하는 순서대로 배치하세요 (본문-Q&A-인터뷰Q&A-Q&A-대화 등 자유롭게)'
    }),
    
    // 일반 아티클 (하위 호환성 유지)
    defineField({
      name: 'content',
      title: '본문',
      type: 'array',
      of: [
        createBlockDefinition('withQuestion', 'full', true),
        // 타이포그래피 연표
        {type: 'timelineBlock'},
        // 표
        {type: 'tableBlock'},
        // 단일 이미지
        {
          type: 'image',
          title: '이미지',
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
            {
              name: 'width',
              type: 'string',
              title: '너비',
              options: {
                list: [
                  {title: '기본', value: 'default'},
                  {title: '전체 너비', value: 'full'},
                  {title: '작게', value: 'small'},
                ],
              },
              initialValue: 'default',
            },
          ],
        },
        // 이미지 그리드
        {
          type: 'object',
          name: 'imageGrid',
          title: '이미지 그리드',
          fields: [
            {
              name: 'images',
              type: 'array',
              title: '이미지들',
              validation: (Rule) => Rule.required().min(2),
              of: [
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
            },
            {
              name: 'columns',
              type: 'number',
              title: '열 개수',
              options: {
                list: [
                  {title: '2열', value: 2},
                  {title: '3열', value: 3},
                  {title: '4열', value: 4},
                ],
              },
              initialValue: 2,
            },
            {
              name: 'gridCaption',
              type: 'string',
              title: '그리드 전체 캡션',
            },
          ],
          preview: {
            select: {
              images: 'images',
              columns: 'columns',
            },
            prepare(selection) {
              const {images, columns} = selection
              return {
                title: `이미지 그리드 (${images?.length || 0}개, ${columns}열)`,
                media: images?.[0],
              }
            },
          },
        },
        // 이미지 슬라이더
        {
          type: 'object',
          name: 'imageSlider',
          title: '이미지 슬라이더',
          fields: [
            {
              name: 'images',
              type: 'array',
              title: '이미지들',
              validation: (Rule) => Rule.required().min(2),
              of: [
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
            },
            {
              name: 'sliderCaption',
              type: 'string',
              title: '슬라이더 전체 캡션',
            },
            {
              name: 'autoplay',
              type: 'boolean',
              title: '자동 재생',
              initialValue: false,
            },
            {
              name: 'showThumbnails',
              type: 'boolean',
              title: '썸네일 표시',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              images: 'images',
              autoplay: 'autoplay',
            },
            prepare(selection) {
              const {images, autoplay} = selection
              return {
                title: `이미지 슬라이더 (${images?.length || 0}개)${autoplay ? ' 🔄' : ''}`,
                media: images?.[0],
              }
            },
          },
        },
      ],
      description: '일반 아티클 본문 (다른 타입과 함께 사용 가능)'
    }),

    // ✨ 응답 모음
    defineField({
      name: 'responses',
      title: '응답 목록',
      type: 'array',
      of: [
        {
          type: 'object',
          title: '응답',
          fields: [
            {
              name: 'year',
              title: '년도',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              title: '제목',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'author',
              title: '글쓴이',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: '본문',
              type: 'array',
              of: [
                createBlockDefinition('standard', 'full', true),
                {
                  type: 'image',
                  title: '이미지',
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
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'references',
              title: '참고문헌',
              type: 'array',
              of: [
                createBlockDefinition('simple', 'minimal', false),
              ],
            },
            {
              name: 'image',
              title: '사진 첨부',
              type: 'image',
              options: {hotspot: true},
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: '대체 텍스트',
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              author: 'author',
              year: 'year',
              media: 'image',
            },
            prepare(selection) {
              const {title, author, year, media} = selection
              return {
                title: `${year} - ${title}`,
                subtitle: author,
                media: media,
              }
            },
          },
        },
      ],
      description: '응답 모음 (다른 타입과 함께 사용 가능)'
    }),

    // ✨ 인터뷰 Q&A (여러 질문, 각 질문마다 여러 응답자)
    defineField({
      name: 'interviewQA',
      title: '인터뷰 Q&A',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Q&A',
          fields: [
            {
              name: 'question',
              title: '질문',
              type: 'array',
              of: [
                createBlockDefinition('minimal', 'basic', true),
              ],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answers',
              title: '응답',
              type: 'array',
              of: [
                {
                  type: 'object',
                  title: '답변',
                  fields: [
                    {
                      name: 'person',
                      title: '응답자',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'answer',
                      title: '답변',
                      type: 'array',
                      of: [
                        createBlockDefinition('standard', 'full', true),
                        {
                          type: 'image',
                          title: '이미지',
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
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: {
                    select: {
                      title: 'person',
                      answer: 'answer',
                    },
                    prepare(selection) {
                      const {title, answer} = selection
                      // PortableText 배열에서 텍스트 추출
                      const text = Array.isArray(answer) 
                        ? answer
                            .filter((block: any) => block._type === 'block' && block.children)
                            .map((block: any) => 
                              block.children
                                .filter((child: any) => child._type === 'span')
                                .map((child: any) => child.text)
                                .join('')
                            )
                            .join(' ')
                        : ''
                      return {
                        title: title,
                        subtitle: text?.substring(0, 100) + (text?.length > 100 ? '...' : ''),
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              question: 'question',
              answers: 'answers',
            },
            prepare(selection) {
              const {question, answers} = selection
              // PortableText 배열에서 텍스트 추출
              const questionText = Array.isArray(question)
                ? question
                    .filter((block: any) => block._type === 'block' && block.children)
                    .map((block: any) =>
                      block.children
                        .filter((child: any) => child._type === 'span')
                        .map((child: any) => child.text)
                        .join('')
                    )
                    .join(' ')
                : question || '질문'
              return {
                title: questionText,
                subtitle: `${answers?.length || 0}명의 응답`,
              }
            },
          },
        },
      ],
      description: '인터뷰 Q&A (다른 타입과 함께 사용 가능)'
    }),

    // ✨ 대화
    defineField({
      name: 'conversation',
      title: '대화',
      type: 'array',
      of: [
        {
          type: 'object',
          title: '발언',
          fields: [
            {
              name: 'speaker',
              title: '발언자',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'text',
              title: '발언 내용',
              type: 'array',
              of: [
                createBlockDefinition('standard', 'full', true),
                {
                  type: 'image',
                  title: '이미지',
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
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              speaker: 'speaker',
              text: 'text',
            },
            prepare(selection) {
              const {speaker, text} = selection
              // PortableText 배열에서 텍스트 추출
              const textContent = Array.isArray(text)
                ? text
                    .filter((block: any) => block._type === 'block' && block.children)
                    .map((block: any) =>
                      block.children
                        .filter((child: any) => child._type === 'span')
                        .map((child: any) => child.text)
                        .join('')
                    )
                    .join(' ')
                : ''
              return {
                title: speaker,
                subtitle: textContent?.substring(0, 100) + (textContent?.length > 100 ? '...' : ''),
              }
            },
          },
        },
      ],
      description: '대화 (다른 타입과 함께 사용 가능)'
    }),

    // ✨ Q&A (단순 질문-답변 반복)
    defineField({
      name: 'qaList',
      title: 'Q&A 목록',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Q&A',
          fields: [
            {
              name: 'question',
              title: '질문 (Q)',
              type: 'array',
              of: [
                createBlockDefinition('minimal', 'basic', true),
              ],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              title: '답변 (A)',
              type: 'array',
              of: [
                createBlockDefinition('standard', 'full', true),
                {
                  type: 'image',
                  title: '이미지',
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
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              question: 'question',
              answer: 'answer',
            },
            prepare(selection) {
              const {question, answer} = selection
              // PortableText 배열에서 텍스트 추출
              const questionText = Array.isArray(question)
                ? question
                    .filter((block: any) => block._type === 'block' && block.children)
                    .map((block: any) =>
                      block.children
                        .filter((child: any) => child._type === 'span')
                        .map((child: any) => child.text)
                        .join('')
                    )
                    .join(' ')
                : question || '질문'
              const answerText = Array.isArray(answer)
                ? answer
                    .filter((block: any) => block._type === 'block' && block.children)
                    .map((block: any) =>
                      block.children
                        .filter((child: any) => child._type === 'span')
                        .map((child: any) => child.text)
                        .join('')
                    )
                    .join(' ')
                : ''
              return {
                title: questionText,
                subtitle: answerText?.substring(0, 100) + (answerText?.length > 100 ? '...' : ''),
              }
            },
          },
        },
      ],
      description: 'Q&A (다른 타입과 함께 사용 가능)'
    }),

    // ========================================
    // 공통 필드
    // ========================================

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
    
    // ✨ 추가 섹션 (모든 타입 공통)
    defineField({
      name: 'additionalSections',
      title: '추가 섹션 (후미)',
      type: 'array',
      of: [
        {
          type: 'object',
          title: '섹션',
          fields: [
            {
              name: 'title',
              title: '섹션 제목',
              type: 'string',
              placeholder: '예: 참고문헌, 이미지 출처, 일러두기, 첨부사항 등',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: '내용',
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
                      {title: '굵게', value: 'strong'},
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
            },
          ],
          preview: {
            select: {
              title: 'title',
              content: 'content',
            },
            prepare(selection) {
              const {title, content} = selection
              return {
                title: title || '제목 없음',
                subtitle: `${content?.length || 0}개 블록`,
              }
            },
          },
        },
      ],
      description: '아티클 끝부분의 참고문헌, 이미지 출처, 일러두기 등 (모든 타입 공통)'
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
      slug: 'slug.current',
      issueNumber: 'issue.number',
      sectionSlug: 'section.slug.current',
      parentSectionSlug: 'section.parentSection.slug.current',
      articleType: 'articleType',
    },
    prepare(selection) {
      const {title, author, slug, issueNumber, sectionSlug, parentSectionSlug, articleType} = selection
      
      const urlPath = parentSectionSlug
        ? `${issueNumber}/${parentSectionSlug}/${sectionSlug}/${slug}`
        : `${issueNumber}/${sectionSlug}/${slug}`
      
      const typeLabels: any = {
        standard: '일반',
        responses: '응답',
        interview: '인터뷰',
        conversation: '대화',
        qa: 'Q&A',
      }
      
      return {
        title: title,
        subtitle: `${typeLabels[articleType] || '일반'} | ${author || '-'} | ${urlPath}`,
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