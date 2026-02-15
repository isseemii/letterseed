/**
 * 아티클 컨텐츠 렌더링 컴포넌트
 * 중복 코드를 제거하고 재사용 가능한 컴포넌트로 분리
 */

import React from 'react'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { PortableTextComponents } from '@portabletext/react'
import { getTextColor } from '@/lib/DarkModeUtils'
import { TYPOGRAPHY, getHeadingClasses, getFootnoteClasses } from '@/lib/typography'
import { toPortableValue } from '@/lib/sanityTypeGuards'
import type { ConversationTurn, InterviewQAItem, QAListItem, ResponseItem, SanityImage, UrlForFn } from './types'

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

/**
 * 응답 모음 렌더링 컴포넌트
 */
export const ResponseRenderer = ({
  response,
  idx,
  isDarkMode,
  urlFor,
  components,
  additionalSectionComponents,
}: {
  response: ResponseItem
  idx: number
  isDarkMode: boolean
  urlFor: UrlForFn
  components: PortableTextComponents
  additionalSectionComponents: PortableTextComponents
}) => {
  const imageUrl = response.image ? getImageUrl(response.image, urlFor) : null

  return (
    <div key={idx} className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
        <span className={`font-bold ${TYPOGRAPHY.ui.speaker} mb-1 md:mb-0 ${getTextColor(isDarkMode, 'muted')}`}>
          {response.year}
        </span>
        <div className={`flex items-center ${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode)}`}>
          <span>{response.title} · {response.author}</span>
        </div>
      </div>
      {response.content && Array.isArray(response.content) && response.content.length > 0 && (
        <div className={getTextColor(isDarkMode)}>
          <PortableText
            value={toPortableValue(response.content)}
            components={components}
          />
        </div>
      )}
      {imageUrl && (
        <div className="my-6 w-full">
          <Image
            src={imageUrl}
            alt={response.image?.alt || ''}
            width={1200}
            height={800}
            className="w-full h-auto"
            sizes="100vw"
            unoptimized
          />
        </div>
      )}
      {response.references && Array.isArray(response.references) && response.references.length > 0 && (
        <div className={`ml-[10%] mt-8 mb-16 md:ml-[40%] md:mt-12 md:mb-24 ${getTextColor(isDarkMode)}`}>
          <div className={`${getTextColor(isDarkMode)}`}>
            <div className={`mb-4 ${TYPOGRAPHY.ui.referenceTitle} ${getTextColor(isDarkMode)}`}>
              참고문헌
            </div>
            <div className={`${getFootnoteClasses('text')} ${getTextColor(isDarkMode, 'muted')}`}>
              <PortableText
                value={toPortableValue(response.references)}
                components={additionalSectionComponents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
        <div className={getTextColor(isDarkMode)}>
          <PortableText
            value={toPortableValue(qa.question)}
            components={interviewQAComponents}
          />
        </div>
      )}
      <div className="space-y-4 pl-4">
        {qa.answers && qa.answers.map((answer, ansIdx: number) => (
          <div key={ansIdx} className="space-y-2">
            <div className={`${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode, 'muted')}`}>
              {answer.person}
            </div>
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
      <div className={`${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode, 'muted')}`}>
        {turn.speaker}
      </div>
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
  components,
}: {
  qa: QAListItem
  idx: number
  isDarkMode: boolean
  components: PortableTextComponents
}) => {
  return (
    <div key={idx} className="space-y-4">
      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
        <div className={`ml-[40%] 본문폰트-민부리 ${getTextColor(isDarkMode)}`}>
          <PortableText
            value={toPortableValue(qa.question)}
            components={components}
          />
        </div>
      )}
      {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
        <div className={getTextColor(isDarkMode)}>
          <PortableText
            value={toPortableValue(qa.answer)}
            components={components}
          />
        </div>
      )}
    </div>
  )
}
