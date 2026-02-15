/**
 * Article typography/layout tokens
 * Keep spacing rhythm in one place and consume from renderers.
 */

export const ARTICLE_TEXT_SPACING = {
  portableParagraph: 'my-[0.6em] md:mt-[0.4em] md:mb-6',
  additionalSectionParagraphGap: 'space-y-4',
  pageContentBlockGap: 'space-y-12',
  additionalSectionGroupGap: 'space-y-8',
  list: {
    marginLeft: '24px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  blockquote: {
    paddingLeft: '1em',
    marginLeft: '2em',
    marginBottom: '1em',
  },
} as const

export const ARTICLE_BLOCK_SPACING_CLASSES = {
  responses: 'space-y-12',
  interviewQA: 'space-y-12',
  conversation: 'space-y-6',
  qaList: 'space-y-8',
} as const
