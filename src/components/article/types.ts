import type { ArticleContentBlockType } from './articleContentMatrix'

export type ArticleNavLink = {
  slug: string
  title: string
}

export type UrlForResult = {
  url: () => string
  width: (value: number) => UrlForResult
  height: (value: number) => UrlForResult
}

export type UrlForFn = (source: unknown) => UrlForResult

export type SanityImageAsset = {
  _ref?: string
  url?: string
}

export type SanityImage = {
  asset?: SanityImageAsset
  alt?: string
  caption?: string
}

export type ArticleNavigationData = {
  prevArticle?: ArticleNavLink | null
  nextArticle?: ArticleNavLink | null
}

export type FootnoteItem = {
  number: number
  text: string
  markKey?: string
}

export type ArticleContentBlock = {
  blockType: ArticleContentBlockType
} & Record<string, unknown>

export type ArticleSectionPathRef = {
  order?: number
  parentSection?: ArticleSectionPathRef
}

export type ArticleInIssueRef = {
  _id: string
  title: string
  slug: string
  order?: number
  section?: ArticleSectionPathRef
}

export type ArticleAdditionalSection = {
  title: string
  content: any[]
}

export type ResponseItem = {
  year?: string | number
  title?: string
  author?: string
  content?: unknown[]
  references?: unknown[]
  image?: SanityImage
}

export type InterviewAnswer = {
  person?: string
  answer?: unknown[]
}

export type InterviewQAItem = {
  question?: unknown[]
  answers?: InterviewAnswer[]
}

export type ConversationTurn = {
  speaker?: string
  text?: unknown[]
}

export type QAListItem = {
  question?: unknown[]
  answer?: unknown[]
}

export type ArticlePageData = ArticleNavigationData & {
  _id: string
  title: string
  author?: string
  issue: { number: number; title?: string }
  section: { title: string }
  introduction?: any[]
  contentBlocks?: ArticleContentBlock[]
  content?: any[]
  responses?: any[]
  interviewQA?: any[]
  conversation?: any[]
  qaList?: any[]
  additionalSections?: ArticleAdditionalSection[]
  allArticlesInIssue?: ArticleInIssueRef[]
}
