import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { ARTICLE_META_LAYOUT_CLASSES } from '@/lib/articleStyleTokens'
import { getTextColor } from '@/lib/DarkModeUtils'
import { TYPOGRAPHY } from '@/lib/typography'
import { toPortableValue } from '@/lib/sanityTypeGuards'
import {
  ARTICLE_CONTENT_MATRIX,
  type ArticleContentBlockType,
} from './articleContentMatrix'
import type { ArticleContentBlock, ConversationTurn, InterviewQAItem, QAListItem, ResponseItem, UrlForFn } from './types'
import {
  ConversationBlockRenderer,
  InterviewQARenderer,
  QAListRenderer,
  getImageUrl,
} from './ContentRenderers'

type Props = {
  block: ArticleContentBlock
  blockIdx: number
  isDarkMode: boolean
  components: PortableTextComponents
  additionalSectionComponents: PortableTextComponents
  interviewQAComponents: PortableTextComponents
  answerComponents: PortableTextComponents
  urlFor: UrlForFn
}

export function ContentBlockRenderer({
  block,
  blockIdx,
  isDarkMode,
  components,
  additionalSectionComponents,
  interviewQAComponents,
  answerComponents,
  urlFor,
}: Props) {
  const blockType = block.blockType as ArticleContentBlockType
  const matrix = ARTICLE_CONTENT_MATRIX[blockType]

  if (!matrix) return null
  const blockFieldValue = block[matrix.blockField]

  if (blockType === 'standard' && blockFieldValue) {
    return (
      <div key={blockIdx}>
        <PortableText value={toPortableValue(blockFieldValue)} components={components} />
      </div>
    )
  }

  if (blockType === 'responses' && Array.isArray(blockFieldValue)) {
    const responses = blockFieldValue as ResponseItem[]
    return (
      <div key={blockIdx} className={matrix.containerClass}>
        {responses.map((response, idx: number) => (
          <div key={idx} className="space-y-1">
            <div className={ARTICLE_META_LAYOUT_CLASSES.responseRow}>
              <span
                className={`${ARTICLE_META_LAYOUT_CLASSES.labelTopAlign} justify-self-start text-left whitespace-nowrap 본문폰트 font-bold ${getTextColor(isDarkMode)}`}
              >
                {response.year}
              </span>
              <div className={`${ARTICLE_META_LAYOUT_CLASSES.labelTopAlign} ${getTextColor(isDarkMode)}`}>
                <span className="본문폰트 font-bold">{response.title}</span>
                {response.author && (
                  <span className="본문폰트">
                    {' '}· {response.author}
                  </span>
                )}
              </div>
            </div>
            {response.content && Array.isArray(response.content) && response.content.length > 0 && (
              <div className={ARTICLE_META_LAYOUT_CLASSES.responseRow}>
                <span aria-hidden="true" />
                <div className={getTextColor(isDarkMode)}>
                  <PortableText value={toPortableValue(response.content)} components={components} />
                </div>
              </div>
            )}
            {response.image && getImageUrl(response.image, urlFor) && (
              <div className="my-8 w-full">
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
              <div className={`ml-[10%] mt-4 mb-8 md:ml-[40%] md:mt-4 md:mb-8 ${getTextColor(isDarkMode)}`}>
                <div className={`mb-2 ${TYPOGRAPHY.footnote.text} ${getTextColor(isDarkMode)}`}>
                  참고문헌
                </div>
                <div className={getTextColor(isDarkMode, 'subtle')}>
                  <PortableText
                    value={toPortableValue(response.references)}
                    components={additionalSectionComponents}
                  />
                </div>
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
      <div key={blockIdx} className={matrix.containerClass}>
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
      <div key={blockIdx} className={matrix.containerClass}>
        <ConversationBlockRenderer
          turns={turns}
          isDarkMode={isDarkMode}
          components={components}
        />
      </div>
    )
  }

  if (blockType === 'qaList' && Array.isArray(blockFieldValue)) {
    const qaList = blockFieldValue as QAListItem[]
    return (
      <div key={blockIdx} className={matrix.containerClass}>
        {qaList.map((qa, idx: number) => (
          <QAListRenderer
            key={idx}
            qa={qa}
            idx={idx}
            isDarkMode={isDarkMode}
            questionComponents={interviewQAComponents}
            answerComponents={components}
          />
        ))}
      </div>
    )
  }

  return null
}
