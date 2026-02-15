import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { getTextColor } from '@/lib/DarkModeUtils'
import { getHeadingClasses, getTypographyClasses, TYPOGRAPHY, getTypographyPresetClass } from '@/lib/typography'
import { toPortableValue } from '@/lib/sanityTypeGuards'
import {
  ARTICLE_CONTENT_MATRIX,
  type ArticleContentBlockType,
} from './articleContentMatrix'
import type { ArticleContentBlock, ConversationTurn, InterviewQAItem, QAListItem, ResponseItem, UrlForFn } from './types'
import {
  ConversationRenderer,
  InterviewQARenderer,
  QAListRenderer,
  getImageUrl,
} from './ContentRenderers'

type Props = {
  block: ArticleContentBlock
  blockIdx: number
  isDarkMode: boolean
  components: PortableTextComponents
  interviewQAComponents: PortableTextComponents
  answerComponents: PortableTextComponents
  urlFor: UrlForFn
}

export function ContentBlockRenderer({
  block,
  blockIdx,
  isDarkMode,
  components,
  interviewQAComponents,
  answerComponents,
  urlFor,
}: Props) {
  const blockType = block.blockType as ArticleContentBlockType
  const matrix = ARTICLE_CONTENT_MATRIX[blockType]

  if (!matrix) return null
  const presetClass = getTypographyPresetClass(matrix.contentPresetKey)
  const blockFieldValue = block[matrix.blockField]

  if (blockType === 'standard' && blockFieldValue) {
    return (
      <div key={blockIdx} className={presetClass}>
        <PortableText value={toPortableValue(blockFieldValue)} components={components} />
      </div>
    )
  }

  if (blockType === 'responses' && Array.isArray(blockFieldValue)) {
    const responses = blockFieldValue as ResponseItem[]
    return (
      <div key={blockIdx} className={`${matrix.containerClass} ${presetClass}`}>
        {responses.map((response, idx: number) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className={`${getTypographyClasses('h3', 'portable')} ${getTextColor(isDarkMode, 'muted')}`}>
                {response.year}
              </span>
              <div className={`${getHeadingClasses(3)} ${getTextColor(isDarkMode)}`}>
                {response.title}
              </div>
              {response.author && (
                <span className={`${getTypographyClasses('h3', 'portable')} ${getTextColor(isDarkMode, 'subtle')}`}>
                  {response.author}
                </span>
              )}
            </div>
            {response.content && Array.isArray(response.content) && response.content.length > 0 && (
              <div className={getTextColor(isDarkMode)}>
                <PortableText value={toPortableValue(response.content)} components={components} />
              </div>
            )}
            {response.image && getImageUrl(response.image, urlFor) && (
              <div className="my-6 w-full">
                <Image
                  src={getImageUrl(response.image, urlFor) || ''}
                  alt={response.image.alt || ''}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  sizes="100vw"
                  unoptimized
                />
              </div>
            )}
            {response.references && Array.isArray(response.references) && response.references.length > 0 && (
              <div className={`${TYPOGRAPHY.ui.referenceTitle} mt-4 ${getTextColor(isDarkMode, 'subtle')}`}>
                <div className=" mb-1">참고문헌</div>
                <PortableText value={toPortableValue(response.references)} components={components} />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (blockType === 'interviewQA' && Array.isArray(blockFieldValue)) {
    const questions = blockFieldValue as InterviewQAItem[]
    return (
      <div key={blockIdx} className={`${matrix.containerClass} ${presetClass}`}>
        {questions.map((qa, idx: number) => (
          <InterviewQARenderer
            key={idx}
            qa={qa}
            idx={idx}
            isDarkMode={isDarkMode}
            interviewQAComponents={interviewQAComponents}
            answerComponents={answerComponents}
          />
        ))}
      </div>
    )
  }

  if (blockType === 'conversation' && Array.isArray(blockFieldValue)) {
    const turns = blockFieldValue as ConversationTurn[]
    return (
      <div key={blockIdx} className={`${matrix.containerClass} ${presetClass}`}>
        {turns.map((turn, idx: number) => (
          <ConversationRenderer
            key={idx}
            turn={turn}
            idx={idx}
            isDarkMode={isDarkMode}
            components={components}
          />
        ))}
      </div>
    )
  }

  if (blockType === 'qaList' && Array.isArray(blockFieldValue)) {
    const qaList = blockFieldValue as QAListItem[]
    return (
      <div key={blockIdx} className={`${matrix.containerClass} ${presetClass}`}>
        {qaList.map((qa, idx: number) => (
          <QAListRenderer
            key={idx}
            qa={qa}
            idx={idx}
            isDarkMode={isDarkMode}
            components={components}
          />
        ))}
      </div>
    )
  }

  return null
}
