/**
 * Article typography/layout tokens
 * Keep spacing rhythm in one place and consume from renderers.
 */

export const ARTICLE_TEXT_SPACING = {
  portableParagraph: 'my-[0.6em] md:mt-[0.4em] md:mb-[0.4em]',
  additionalSectionParagraphGap: 'space-y-4',
  pageContentBlockGap: 'space-y-12',
  additionalSectionGroupGap: 'space-y-8',
  list: {
    marginLeft: '24px',
    marginTop: '16px',
    marginBottom: '16px',
  },
} as const

export const ARTICLE_BLOCK_SPACING_CLASSES = {
  responses: 'space-y-12',
  interviewQA: 'space-y-12',
  conversation: 'space-y-6',
  qaList: 'space-y-8',
} as const

export const ARTICLE_META_LAYOUT_CLASSES = {
  labelRow: 'grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-3',
  responseRow: 'grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-x-3',
  labelTopAlign: 'pt-[0.1em]',
} as const

export const ARTICLE_RICH_TEXT_LAYOUT_CLASSES = {
  trimOuterParagraphMargin: '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  blockquoteCard: 'ls-blockquote-card border px-4 py-6 md:px-6 md:py-8',
} as const
