import {
  ARTICLE_CONTENT_BLOCK_TYPES,
  ARTICLE_CONTENT_MATRIX,
  isContentBlockType,
  type ArticleContentBlockType,
} from './articleContentMatrix'
import type {
  ArticleAdditionalSection,
  ArticleContentBlock,
  ArticlePageData,
  ConversationTurn,
  InterviewQAItem,
  QAListItem,
  ResponseItem,
} from './types'

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

export const normalizeArticleContentBlocks = (article: ArticlePageData | null): ArticleContentBlock[] => {
  if (!article) return []

  const blocks: ArticleContentBlock[] = Array.isArray(article.contentBlocks)
    ? [...article.contentBlocks]
    : []

  // contentBlocks가 일부 타입만 채워진 문서를 위해 legacy 필드를 타입 단위로 보완한다.
  ARTICLE_CONTENT_BLOCK_TYPES.forEach((type) => {
    const matrix = ARTICLE_CONTENT_MATRIX[type]
    const legacyFieldData = article[matrix.legacyField]

    if (!Array.isArray(legacyFieldData) || legacyFieldData.length === 0) return

    const existingIndex = blocks.findIndex((block) => block.blockType === type)

    if (existingIndex < 0) {
      blocks.push({
        blockType: type,
        [matrix.blockField]: legacyFieldData,
      })
      return
    }

    const existingBlock = blocks[existingIndex]
    const existingContent = existingBlock?.[matrix.blockField]
    if (!Array.isArray(existingContent) || existingContent.length === 0) {
      blocks[existingIndex] = {
        ...existingBlock,
        [matrix.blockField]: legacyFieldData,
      }
    }
  })

  return blocks
}

const collectPortableContentFromBlock = (
  blockType: ArticleContentBlockType,
  blockFieldValue: unknown
): unknown[] => {
  if (blockType === 'standard') {
    return asArray(blockFieldValue)
  }

  if (blockType === 'responses') {
    const responses = asArray(blockFieldValue) as ResponseItem[]
    return responses.flatMap((response) => [
      ...asArray(response.content),
      ...asArray(response.references),
    ])
  }

  if (blockType === 'interviewQA') {
    const questions = asArray(blockFieldValue) as InterviewQAItem[]
    return questions.flatMap((qa) => [
      ...asArray(qa.question),
      ...(qa.answers?.flatMap((answer) => asArray(answer.answer)) || []),
    ])
  }

  if (blockType === 'conversation') {
    const turns = asArray(blockFieldValue) as ConversationTurn[]
    return turns.flatMap((turn) => asArray(turn.text))
  }

  if (blockType === 'qaList') {
    const qaList = asArray(blockFieldValue) as QAListItem[]
    return qaList.flatMap((qa) => [
      ...asArray(qa.question),
      ...asArray(qa.answer),
    ])
  }

  return []
}

export const collectFootnoteSourceContent = (
  article: ArticlePageData | null,
  normalizedBlocks: ArticleContentBlock[]
): unknown[] => {
  if (!article) return []

  const result: unknown[] = [...asArray(article.introduction)]

  normalizedBlocks.forEach((block) => {
    if (!isContentBlockType(block.blockType)) return
    const matrix = ARTICLE_CONTENT_MATRIX[block.blockType]
    result.push(...collectPortableContentFromBlock(block.blockType, block[matrix.blockField]))
  })

  const additionalSections = asArray(article.additionalSections) as ArticleAdditionalSection[]
  result.push(...additionalSections.flatMap((section) => asArray(section.content)))

  return result
}
