import type { TypographyPresetKey } from '@/lib/typography'
import { ARTICLE_BLOCK_SPACING_CLASSES } from '@/lib/articleStyleTokens'

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
    containerClass: ARTICLE_BLOCK_SPACING_CLASSES.responses,
    contentPresetKey: 'bodySerif',
  },
  interviewQA: {
    label: '인터뷰 Q&A',
    blockField: 'interviewQAContent',
    legacyField: 'interviewQA',
    containerClass: ARTICLE_BLOCK_SPACING_CLASSES.interviewQA,
    contentPresetKey: 'bodySans',
  },
  conversation: {
    label: '대화',
    blockField: 'conversationContent',
    legacyField: 'conversation',
    containerClass: ARTICLE_BLOCK_SPACING_CLASSES.conversation,
    contentPresetKey: 'bodySerif',
  },
  qaList: {
    label: 'Q&A',
    blockField: 'qaListContent',
    legacyField: 'qaList',
    containerClass: ARTICLE_BLOCK_SPACING_CLASSES.qaList,
    contentPresetKey: 'bodySans',
  },
}

export const isContentBlockType = (value: string): value is ArticleContentBlockType =>
  value in ARTICLE_CONTENT_MATRIX
