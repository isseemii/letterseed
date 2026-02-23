/**
 * 아티클 컨텐츠 렌더링 컴포넌트
 * 중복 코드를 제거하고 재사용 가능한 컴포넌트로 분리
 */

import { PortableText } from '@portabletext/react'
import { PortableTextComponents } from '@portabletext/react'
import type { ReactNode } from 'react'
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
      <div className="space-y-4 pl-4">
        {qa.answers && qa.answers.map((answer, ansIdx: number) => (
          <div key={ansIdx} className="space-y-2">
            <SpeakerLabel isDarkMode={isDarkMode}>
              {answer.person}
            </SpeakerLabel>
            {answer.answer && Array.isArray(answer.answer) && answer.answer.length > 0 && (
              <div className={getTextColor(isDarkMode)}>
                <PortableText
                  value={toPortableValue(answer.answer)}
                  components={answerComponents}
                />
              </div>
            )}
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
    <div key={idx} className="space-y-2">
      <SpeakerLabel isDarkMode={isDarkMode}>
        {turn.speaker}
      </SpeakerLabel>
      {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
        <div className={getTextColor(isDarkMode)}>
          <PortableText
            value={toPortableValue(turn.text)}
            components={components}
          />
        </div>
      )}
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
    <div key={idx} className="space-y-4">
      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
        <QuestionBody isDarkMode={isDarkMode}>
          <PortableText
            value={toPortableValue(qa.question)}
            components={questionComponents}
          />
        </QuestionBody>
      )}
      {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
        <div className={getTextColor(isDarkMode)}>
          <PortableText
            value={toPortableValue(qa.answer)}
            components={answerComponents}
          />
        </div>
      )}
    </div>
  )
}
