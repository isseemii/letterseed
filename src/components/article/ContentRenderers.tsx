/**
 * 아티클 컨텐츠 렌더링 컴포넌트
 * 중복 코드를 제거하고 재사용 가능한 컴포넌트로 분리
 */

import { PortableText } from '@portabletext/react'
import { PortableTextComponents } from '@portabletext/react'
import type { ReactNode } from 'react'
import { ARTICLE_META_LAYOUT_CLASSES, ARTICLE_RICH_TEXT_LAYOUT_CLASSES } from '@/lib/articleStyleTokens'
import { getTextColor } from '@/lib/DarkModeUtils'
import { getQuestionOffsetClasses, TYPOGRAPHY } from '@/lib/typography'
import { toPortableValue } from '@/lib/sanityTypeGuards'
import type { ConversationTurn, InterviewQAItem, QAListItem, SanityImage, UrlForFn } from './types'

/**
 * 이미지 URL 생성 헬퍼 함수
 */
export const getImageUrl = (image: SanityImage | undefined, urlFor: UrlForFn): string | null => {
  if (!image || !image.asset) return null
  
  if (image.asset._ref) {
    return urlFor(image).url() || null
  } else if (image.asset.url) {
    return image.asset.url
  }
  return null
}

const QuestionBody = ({
  children,
  isDarkMode,
}: {
  children: ReactNode
  isDarkMode: boolean
}) => (
  <div className={`${getQuestionOffsetClasses()} ${getTextColor(isDarkMode)}`}>
    {children}
  </div>
)

const SpeakerLabel = ({
  children,
  isDarkMode,
}: {
  children: ReactNode
  isDarkMode: boolean
}) => (
  <div className={`${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode, 'muted')}`}>
    {children}
  </div>
)

/**
 * 인터뷰 Q&A 렌더링 컴포넌트
 */
export const InterviewQARenderer = ({
  qa,
  idx,
  isDarkMode,
  interviewQAComponents,
  answerComponents,
}: {
  qa: InterviewQAItem
  idx: number
  isDarkMode: boolean
  interviewQAComponents: PortableTextComponents
  answerComponents: PortableTextComponents
}) => {
  return (
    <div key={idx} className="space-y-6">
      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
        <QuestionBody isDarkMode={isDarkMode}>
          <PortableText
            value={toPortableValue(qa.question)}
            components={interviewQAComponents}
          />
        </QuestionBody>
      )}
      <div className="space-y-4">
        {qa.answers && qa.answers.map((answer, ansIdx: number) => (
          <div key={ansIdx} className={ARTICLE_META_LAYOUT_CLASSES.labelRow}>
            <div className={ARTICLE_META_LAYOUT_CLASSES.labelTopAlign}>
              <SpeakerLabel isDarkMode={isDarkMode}>
                {answer.person}
              </SpeakerLabel>
            </div>
            <div>
              {answer.answer && Array.isArray(answer.answer) && answer.answer.length > 0 && (
                <div className={getTextColor(isDarkMode)}>
                  <PortableText
                    value={toPortableValue(answer.answer)}
                    components={answerComponents}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 대화 렌더링 컴포넌트
 */
export const ConversationRenderer = ({
  turn,
  idx,
  isDarkMode,
  components,
}: {
  turn: ConversationTurn
  idx: number
  isDarkMode: boolean
  components: PortableTextComponents
}) => {
  return (
    <div key={idx} className={ARTICLE_META_LAYOUT_CLASSES.labelRow}>
      <div className={ARTICLE_META_LAYOUT_CLASSES.labelTopAlign}>
        <SpeakerLabel isDarkMode={isDarkMode}>
          {turn.speaker}
        </SpeakerLabel>
      </div>
      {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
        <div className={`${ARTICLE_RICH_TEXT_LAYOUT_CLASSES.trimOuterParagraphMargin} ${getTextColor(isDarkMode)}`}>
          <PortableText
            value={toPortableValue(turn.text)}
            components={components}
          />
        </div>
      )}
    </div>
  )
}

const getSpeakerName = (turn: ConversationTurn): string => (turn.speaker || '').trim()

const getConversationTurnSide = (
  speaker: string,
  primarySpeaker: string | null,
  secondarySpeaker: string | null
): 'left' | 'right' | 'center' => {
  if (!speaker) return 'center'
  if (primarySpeaker && speaker === primarySpeaker) return 'left'
  if (secondarySpeaker && speaker === secondarySpeaker) return 'right'
  return 'left'
}

/**
 * 대화 블록 렌더링 컴포넌트
 * 상단에 두 발화자를 배치하고, 각 발화를 좌/우 흐름으로 렌더링
 */
export const ConversationBlockRenderer = ({
  turns,
  isDarkMode,
  components,
}: {
  turns: ConversationTurn[]
  isDarkMode: boolean
  components: PortableTextComponents
}) => {
  const speakers = Array.from(new Set(
    turns
      .map(getSpeakerName)
      .filter((speaker) => speaker.length > 0)
  ))
  const primarySpeaker = speakers[0] || null
  const secondarySpeaker = speakers[1] || null

  return (
    <div
      className={`rounded-none border px-4 py-6 md:px-6 md:py-8 ${
        isDarkMode ? 'border-neutral-600 bg-neutral-900' : 'border-neutral-300 bg-neutral-100'
      }`}
    >
      {(primarySpeaker || secondarySpeaker) && (
        <div className="mb-8 grid grid-cols-2 items-start">
          <div className={`${TYPOGRAPHY.ui.speaker} text-left ${getTextColor(isDarkMode)}`}>
            {primarySpeaker}
          </div>
          <div className={`${TYPOGRAPHY.ui.speaker} text-right ${getTextColor(isDarkMode)}`}>
            {secondarySpeaker}
          </div>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {turns.map((turn, idx) => {
          const speaker = getSpeakerName(turn)
          const side = getConversationTurnSide(speaker, primarySpeaker, secondarySpeaker)
          const rowClasses =
            side === 'right'
              ? 'ml-auto w-[72%]'
              : side === 'center'
                ? 'mx-auto w-fit max-w-[84%] text-center'
                : 'mr-auto w-[72%]'

          return (
            <div key={idx} className={rowClasses}>
              {speaker && speaker !== primarySpeaker && speaker !== secondarySpeaker && (
                <div className={`mb-1 ${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode, 'muted')}`}>
                  {speaker}
                </div>
              )}
              {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
                <div className={`${ARTICLE_RICH_TEXT_LAYOUT_CLASSES.trimOuterParagraphMargin} text-left ${getTextColor(isDarkMode)}`}>
                  <PortableText
                    value={toPortableValue(turn.text)}
                    components={components}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Q&A 리스트 렌더링 컴포넌트
 */
export const QAListRenderer = ({
  qa,
  idx,
  isDarkMode,
  questionComponents,
  answerComponents,
}: {
  qa: QAListItem
  idx: number
  isDarkMode: boolean
  questionComponents: PortableTextComponents
  answerComponents: PortableTextComponents
}) => {
  return (
    <div key={idx} className="space-y-2 md:space-y-3">
      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
        <QuestionBody isDarkMode={isDarkMode}>
          <div className={ARTICLE_RICH_TEXT_LAYOUT_CLASSES.trimOuterParagraphMargin}>
            <PortableText
              value={toPortableValue(qa.question)}
              components={questionComponents}
            />
          </div>
        </QuestionBody>
      )}
      {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
        <div className={getTextColor(isDarkMode)}>
          <div className={ARTICLE_RICH_TEXT_LAYOUT_CLASSES.trimOuterParagraphMargin}>
            <PortableText
              value={toPortableValue(qa.answer)}
              components={answerComponents}
            />
          </div>
        </div>
      )}
    </div>
  )
}
