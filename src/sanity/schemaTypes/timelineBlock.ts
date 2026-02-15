const timelineBlock = {
  name: 'timelineBlock',
  type: 'object',
  title: '타이포그래피 연표',
  fields: [
    {
      name: 'caption',
      type: 'string',
      title: '캡션 (선택)',
      description: '연표 하단에 표시될 설명 (선택사항)'
    }
  ],
  preview: {
    select: {
      caption: 'caption'
    },
    prepare({caption}: any) {
      return {
        title: '📅 타이포그래피 연표 1.0',
        subtitle: caption || '1884-2024 디지털 타이포그래피 역사'
      }
    }
  }
}

export default timelineBlock






