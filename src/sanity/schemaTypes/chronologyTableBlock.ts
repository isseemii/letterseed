const chronologyTableBlock = {
  name: 'chronologyTableBlock',
  type: 'object',
  title: '디지털 타이포그래피 연표 표',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: '제목',
      initialValue: '디지털 타이포그래피 연표',
    },
    {
      name: 'version',
      type: 'string',
      title: '버전',
      initialValue: '1.0',
    },
    {
      name: 'note',
      type: 'text',
      title: '우측 상단 설명',
      rows: 2,
      description: '예: 연표의 기고자 및 응답자 이름은 대괄호 안에 명시했다.',
    },
    {
      name: 'yearHeader',
      type: 'string',
      title: '연도 열 제목',
      initialValue: '년도',
    },
    {
      name: 'domesticHeader',
      type: 'string',
      title: '국내 열 제목',
      initialValue: '국내',
    },
    {
      name: 'globalHeader',
      type: 'string',
      title: '세계 열 제목',
      initialValue: '세계',
    },
    {
      name: 'rows',
      type: 'array',
      title: '연표 행',
      of: [
        {
          type: 'object',
          title: '행',
          fields: [
            {
              name: 'periodLabel',
              type: 'string',
              title: '시기 레이블(좌측)',
              description: '예: 1870, 1880, 1990, 2000',
            },
            {
              name: 'year',
              type: 'string',
              title: '연도',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'domestic',
              type: 'array',
              title: '국내',
              of: [{type: 'string'}],
            },
            {
              name: 'global',
              type: 'array',
              title: '세계',
              of: [{type: 'string'}],
            },
          ],
          preview: {
            select: {
              year: 'year',
              domestic: 'domestic',
              global: 'global',
              periodLabel: 'periodLabel',
            },
            prepare({year, domestic, global, periodLabel}: any) {
              const d = Array.isArray(domestic) ? domestic[0] : ''
              const g = Array.isArray(global) ? global[0] : ''
              return {
                title: `${year || '연도 없음'}${periodLabel ? ` (${periodLabel})` : ''}`,
                subtitle: d || g || '내용 없음',
              }
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'title',
      rows: 'rows',
      version: 'version',
    },
    prepare({title, rows, version}: any) {
      return {
        title: `📊 ${title || '디지털 타이포그래피 연표'}${version ? ` ${version}` : ''}`,
        subtitle: `${rows?.length || 0}개 행`,
      }
    },
  },
}

export default chronologyTableBlock

