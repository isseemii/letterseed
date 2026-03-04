/**
 * PortableText Components 팩토리
 * 모든 스키마 타입의 타이포그래피를 한 곳에서 관리
 */

import React from 'react'
import { PortableTextComponents } from '@portabletext/react'
import { getBodyClasses, TYPOGRAPHY, getPortableBodyClassesByPreset, QUESTION_TEXT_CLASSES, getTypographyPresetClass } from './typography'
import { getTextColor, getLinkColor } from './DarkModeUtils'
import { ARTICLE_RICH_TEXT_LAYOUT_CLASSES, ARTICLE_TEXT_SPACING } from './articleStyleTokens'

const SIDEBAR_BREAKPOINT_PX = 1200

const getPlainTextFromNode = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (React.isValidElement(child)) {
        return getPlainTextFromNode((child.props as { children?: React.ReactNode })?.children)
      }
      return ''
    })
    .join('')

const isFootnoteReferenceText = (text: string): boolean => {
  const normalized = text.replace(/\s+/g, '')
  return /^\[?\d+\]?$/.test(normalized)
}

/**
 * 스키마 타입별 타이포그래피 설정
 * 여기서 모든 스타일을 한 번에 관리할 수 있습니다
 */
export const TYPOGRAPHY_CONFIG = {
  // 일반 본문 (standard)
  standard: {
    normal: getPortableBodyClassesByPreset('bodySerif'),
    h2: TYPOGRAPHY.h2.portable,
    h3: TYPOGRAPHY.h3.portable,
    h4: TYPOGRAPHY.h4.portable,
    h5: TYPOGRAPHY.h5.portable,
    h6: TYPOGRAPHY.h6.portable,
    blockquote: TYPOGRAPHY.blockquote.base, 
  },
  // 인터뷰 Q&A 질문
  interviewQAQuestion: {
    // h6 질문과 동일한 본문 톤/간격을 공유
    normal: QUESTION_TEXT_CLASSES,
    h2: TYPOGRAPHY.h2.portable,
    h3: TYPOGRAPHY.h3.portable,
    h4: TYPOGRAPHY.h4.portable,
    h5: TYPOGRAPHY.h5.portable,
    h6: TYPOGRAPHY.h6.portable,
    blockquote: TYPOGRAPHY.blockquote.base,
  },
  // 인터뷰 Q&A 답변
  interviewQAAnswer: {
    // 인터뷰 답변 문단 간격은 별도 레이아웃에서 제어하기 위해 본문 마진 제거
    normal: `${getTypographyPresetClass('bodySerif')} my-0`,
    h2: TYPOGRAPHY.h2.portable,
    h3: TYPOGRAPHY.h3.portable,
    h4: TYPOGRAPHY.h4.portable,
    h5: TYPOGRAPHY.h5.portable,
    h6: TYPOGRAPHY.h6.portable,
    blockquote: TYPOGRAPHY.blockquote.base,
  },
  // 추가 섹션 (각주 스타일)
  additionalSection: {
    normal: `${getPortableBodyClassesByPreset('footnoteSans')} ${ARTICLE_TEXT_SPACING.additionalSectionParagraphGap}`,
    h2: TYPOGRAPHY.h2.portable,
    h3: TYPOGRAPHY.h3.portable,
    h4: TYPOGRAPHY.h4.portable,
    h5: TYPOGRAPHY.h5.portable,
    h6: TYPOGRAPHY.h6.portable,
    blockquote: TYPOGRAPHY.blockquote.base,
  },
  // 테이블 내용
  tableContent: {
    normal: getBodyClasses('normal'),
    h2: TYPOGRAPHY.h2.portable,
    h3: TYPOGRAPHY.h3.portable,
    h4: TYPOGRAPHY.h4.portable,
    h5: TYPOGRAPHY.h5.portable,
    h6: TYPOGRAPHY.h6.portable,
    blockquote: TYPOGRAPHY.blockquote.base,
  },
} as const

export type TypographyConfigType = keyof typeof TYPOGRAPHY_CONFIG

/**
 * 공통 marks 컴포넌트 생성 함수
 */
const createMarksComponents = (
  isDarkMode: boolean,
  footnotesList: Array<{ number: number; text: string; markKey?: string }>,
  setMobileFootnotePopup: React.Dispatch<React.SetStateAction<{ number: number; text: string } | null>>,
  setActiveDesktopFootnoteNumber: React.Dispatch<React.SetStateAction<number | null>>,
  renderTextWithLinks?: (text: string) => React.ReactNode
) => ({
  link: ({ children, value }: any) => {
    const rel = value?.href && !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
    const borderColor = isDarkMode ? 'border-blue-300' : 'border-blue-600'
    return (
      <a
        href={value?.href || '#'}
        rel={rel}
        target={value?.href?.startsWith('/') ? '_self' : '_blank'}
        className={`${getLinkColor(isDarkMode)} border-b border-dotted ${borderColor} hover:opacity-80`}
      >
        {children}
      </a>
    )
  },
  footnote: ({ children, value, markKey }: any) => {
    const footnote = footnotesList.find(f => 
      (value?._key && f.markKey === value._key) ||
      (markKey && f.markKey === markKey) || 
      (value?.text && f.text === value.text)
    )
    const footnoteNumber = footnote?.number || 0

    const handleFootnoteClick = (e: React.MouseEvent) => {
      e.preventDefault()

      if (typeof window !== 'undefined' && footnoteNumber > 0) {
        const isMobile = window.innerWidth < SIDEBAR_BREAKPOINT_PX
        if (isMobile && footnote) {
          setMobileFootnotePopup((prev) => (
            prev?.number === footnoteNumber ? null : { number: footnoteNumber, text: footnote.text }
          ))
        } else {
          setActiveDesktopFootnoteNumber((prev) => (prev === footnoteNumber ? null : footnoteNumber))
        }
      }
    }

    if (footnoteNumber === 0) {
      return <span className="text-red-500">{children}</span>
    }

    const childText = getPlainTextFromNode(children).trim()
    const hideOriginalMarkedText = isFootnoteReferenceText(childText)
    const badgeColorClasses = isDarkMode
      ? 'text-blue-200 border-blue-300 hover:bg-blue-300/20'
      : 'text-blue-700 border-blue-600 hover:bg-blue-100'

    return (
      <span data-footnote-number={footnoteNumber} className="inline">
        {!hideOriginalMarkedText && children}
        <button
          type="button"
          onClick={handleFootnoteClick}
          aria-label={`각주 ${footnoteNumber} 열기`}
          className={`ml-1 inline-flex h-[1.3em] min-w-[1.3em] items-center justify-center rounded-full border px-[0.24em] text-[0.72em] leading-none align-super transition-colors ${badgeColorClasses}`}
        >
          {footnoteNumber}
        </button>
      </span>
    )
  },
  strong: ({ children }: any) => <strong className={getTextColor(isDarkMode)}>{children}</strong>,
  em: ({ children }: any) => <em className={getTextColor(isDarkMode)}>{children}</em>,
  underline: ({ children }: any) => <u className={`underline decoration-dotted underline-offset-[6px] ${getTextColor(isDarkMode)}`}>{children}</u>,
  sup: ({ children }: any) => <sup className={getTextColor(isDarkMode)}>{children}</sup>,
  sub: ({ children }: any) => <sub className={getTextColor(isDarkMode)}>{children}</sub>,
  indent: ({ children }: any) => (
    <span className={`inline-block pl-[2em] md:pl-[2em] ${getTextColor(isDarkMode)}`}>
      {children}
    </span>
  ),
})

/**
 * 공통 list 컴포넌트 생성 함수
 */
const createListComponents = (isDarkMode: boolean) => ({
  bullet: ({ children }: any) => (
    <ul
      style={{
        marginLeft: ARTICLE_TEXT_SPACING.list.marginLeft,
        marginTop: ARTICLE_TEXT_SPACING.list.marginTop,
        marginBottom: ARTICLE_TEXT_SPACING.list.marginBottom,
      }}
      className={getTextColor(isDarkMode)}
    >
      {children}
    </ul>
  ),
  number: ({ children }: any) => (
    <ol
      style={{
        marginLeft: ARTICLE_TEXT_SPACING.list.marginLeft,
        marginTop: ARTICLE_TEXT_SPACING.list.marginTop,
        marginBottom: ARTICLE_TEXT_SPACING.list.marginBottom,
      }}
      className={getTextColor(isDarkMode)}
    >
      {children}
    </ol>
  )
})

/**
 * PortableText Components 생성 함수
 * @param configType - 타이포그래피 설정 타입 (TYPOGRAPHY_CONFIG의 키)
 * @param isDarkMode - 다크모드 여부
 * @param footnotesList - 각주 리스트
 * @param setMobileFootnotePopup - 모바일 각주 팝업 설정 함수
 * @param setActiveDesktopFootnoteNumber - 데스크탑 활성 각주 번호 설정 함수
 * @param renderTextWithLinks - 텍스트 내 URL 링크 변환 함수 (선택)
 */
export function createPortableTextComponents(
  configType: TypographyConfigType,
  isDarkMode: boolean,
  footnotesList: Array<{ number: number; text: string; markKey?: string }>,
  setMobileFootnotePopup: React.Dispatch<React.SetStateAction<{ number: number; text: string } | null>>,
  setActiveDesktopFootnoteNumber: React.Dispatch<React.SetStateAction<number | null>>,
  renderTextWithLinks?: (text: string) => React.ReactNode
): PortableTextComponents {
  const config = TYPOGRAPHY_CONFIG[configType]

  return {
    block: {
      normal: ({ children }: any) => {
        // children이 React 요소인지 확인하고, block 요소가 포함되어 있는지 체크
        const hasBlockElements = React.Children.toArray(children).some((child: any) => {
          if (React.isValidElement(child)) {
            const type = child.type
            if (typeof type === 'string' && (type === 'div' || type === 'img')) {
              return true
            }
            const props = child.props as any
            if (props?.className?.includes('my-8')) {
              return true
            }
          }
          return false
        })

        // block 요소가 있으면 div로, 없으면 p로 렌더링
        const Tag = hasBlockElements ? 'div' : 'p'
        return (
          <Tag
            className={`${config.normal} ${getTextColor(isDarkMode)}`}
          >
            {children}
          </Tag>
        )
      },
      h2: ({ children }: any) => (
        <h2 className={`${config.h2} ${getTextColor(isDarkMode)}`}>
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className={`${config.h3} ${getTextColor(isDarkMode)}`}>
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 className={`${config.h4} ${getTextColor(isDarkMode)}`}>
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 className={`${config.h5} ${getTextColor(isDarkMode)}`}>
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6 className={`${config.h6} ${getTextColor(isDarkMode)}`}>
          {children}
        </h6>
      ),
      blockquote: ({ children, value }: any) => {
        const mergedQuoteCount =
          typeof value?.__lsMergedQuoteCount === 'number' ? value.__lsMergedQuoteCount : 1
        const alignClass = mergedQuoteCount > 1 ? 'text-left whitespace-pre-line' : 'text-center'

        return (
          <blockquote
            className={`${config.blockquote} ${ARTICLE_RICH_TEXT_LAYOUT_CLASSES.blockquoteCard} ${alignClass} ${isDarkMode ? 'border-neutral-600 bg-neutral-900' : 'border-neutral-300 bg-neutral-100'} ${getTextColor(isDarkMode)}`}
          >
            {children}
          </blockquote>
        )
      },
    },
    marks: createMarksComponents(
      isDarkMode,
      footnotesList,
      setMobileFootnotePopup,
      setActiveDesktopFootnoteNumber,
      renderTextWithLinks
    ),
    list: createListComponents(isDarkMode),
  }
}

/**
 * 추가 섹션 전용 components (각주 스타일, 텍스트 내 URL 자동 링크 변환)
 */
export function createAdditionalSectionComponents(
  isDarkMode: boolean,
  processChildrenWithLinks: (children: React.ReactNode) => React.ReactNode
): PortableTextComponents {
  const config = TYPOGRAPHY_CONFIG.additionalSection
  // 추가 섹션의 제목-본문 시작 열을 맞추기 위한 공통 들여쓰기
  const contentIndentClass = 'pl-[-2em]'

  return {
    block: {
      normal: ({ children }: any) => {
        // children에서 텍스트 내 URL을 링크로 변환
        const processedChildren = processChildrenWithLinks(children)
        
        // children이 React 요소인지 확인하고, block 요소가 포함되어 있는지 체크
        const hasBlockElements = React.Children.toArray(processedChildren).some((child: any) => {
          if (React.isValidElement(child)) {
            const type = child.type
            if (typeof type === 'string' && (type === 'div' || type === 'img')) {
              return true
            }
            const props = child.props as any
            if (props?.className?.includes('my-8')) {
              return true
            }
          }
          return false
        })

        // block 요소가 있으면 div로, 없으면 p로 렌더링
        const Tag = hasBlockElements ? 'div' : 'p'
        return (
          <Tag
            className={`${config.normal} ${contentIndentClass} ${getTextColor(isDarkMode, 'muted')}`}
          >
            {processedChildren}
          </Tag>
        )
      },
    },
    marks: {
      link: ({ children, value }: any) => {
        const rel = value?.href && !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
        const borderColor = isDarkMode ? 'border-blue-300' : 'border-blue-600'
        return (
          <a
            href={value?.href || '#'}
            rel={rel}
            target={value?.href?.startsWith('/') ? '_self' : '_blank'}
            className={`${getLinkColor(isDarkMode)} border-b border-dotted ${borderColor}`}
          >
            {children}
          </a>
        )
      },
      strong: ({ children }: any) => <strong className={getTextColor(isDarkMode, 'muted')}>{children}</strong>,
      em: ({ children }: any) => <em className={getTextColor(isDarkMode, 'muted')}>{children}</em>,
      underline: ({ children }: any) => <u className={`underline decoration-dotted underline-offset-[2px] ${getTextColor(isDarkMode, 'muted')}`}>{children}</u>,
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className={`space-y-2 list-disc ml-0 ${contentIndentClass} ${TYPOGRAPHY.footnote.text} ${getTextColor(isDarkMode, 'muted')}`}>
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol className={`space-y-2 list-decimal ml-0 ${contentIndentClass} ${TYPOGRAPHY.footnote.text} ${getTextColor(isDarkMode, 'muted')}`}>
          {children}
        </ol>
      )
    },
    listItem: {
      bullet: ({ children }: any) => (
        <li className={getTextColor(isDarkMode, 'muted')}>{children}</li>
      ),
      number: ({ children }: any) => (
        <li className={getTextColor(isDarkMode, 'muted')}>{children}</li>
      )
    }
  }
}
