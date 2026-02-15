import type { TypographyPresetKey } from '@/lib/typography'

export const ARTICLE_CONTENT_BLOCK_TYPES = [
  'standard',
  'responses',
  'interviewQA',
  'conversation',
  'qaList',
] as const

export type ArticleContentBlockType = typeof ARTICLE_CONTENT_BLOCK_TYPES[number]

type ArticleContentMatrixItem = {
  label: string
  blockField: string
  legacyField: string
  containerClass: string
  contentPresetKey: TypographyPresetKey
}

export const ARTICLE_CONTENT_MATRIX: Record<ArticleContentBlockType, ArticleContentMatrixItem> = {
  standard: {
    label: '일반 본문',
    blockField: 'standardContent',
    legacyField: 'content',
    containerClass: '',
    contentPresetKey: 'bodySerif',
  },
  responses: {
    label: '응답 모음',
    blockField: 'responsesContent',
    legacyField: 'responses',
    containerClass: 'space-y-12',
    contentPresetKey: 'bodySerif',
  },
  interviewQA: {
    label: '인터뷰 Q&A',
    blockField: 'interviewQAContent',
    legacyField: 'interviewQA',
    containerClass: 'space-y-12',
    contentPresetKey: 'bodySans',
  },
  conversation: {
    label: '대화',
    blockField: 'conversationContent',
    legacyField: 'conversation',
    containerClass: 'space-y-6',
    contentPresetKey: 'bodySerif',
  },
  qaList: {
    label: 'Q&A',
    blockField: 'qaListContent',
    legacyField: 'qaList',
    containerClass: 'space-y-8',
    contentPresetKey: 'bodySans',
  },
}

export const isContentBlockType = (value: string): value is ArticleContentBlockType =>
  value in ARTICLE_CONTENT_MATRIX
