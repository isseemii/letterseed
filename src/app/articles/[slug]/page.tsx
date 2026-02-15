'use client'

import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import { getTextColor, getBgColor, getBorderColor, getLinkColor } from '@/lib/DarkModeUtils'
import { LAYOUT, CAPTION_STYLES } from '@/lib/constants'
import { getTypographyClasses, getHeadingClasses, getBodyClasses, getCaptionClasses, TYPOGRAPHY, getFootnoteClasses } from '@/lib/typography'
import { createPortableTextComponents, createAdditionalSectionComponents } from '@/lib/portableTextComponents'
import { getElementTypeName, isSanityImageSource, toPortableValue } from '@/lib/sanityTypeGuards'
import Timeline from '@/components/timeline'
import {
  getImageUrl,
} from '@/components/article/ContentRenderers'
import { ContentBlockRenderer } from '@/components/article/ContentBlockRenderer'
import { ARTICLE_CONTENT_BLOCK_TYPES, ARTICLE_CONTENT_MATRIX, isContentBlockType } from '@/components/article/articleContentMatrix'
import { ArticleImageSlider } from '@/components/article/ArticleImageSlider'
import { ArticleLeftSidebar, ArticleMobileBottomNavigation, ArticleRightSidebar } from '@/components/article/ArticleNavigation'
import { MobileFootnotePopup } from '@/components/article/MobileFootnotePopup'
import type { ArticleAdditionalSection, ArticleContentBlock, ArticleInIssueRef, ArticlePageData, ArticleSectionPathRef, FootnoteItem } from '@/components/article/types'

const builder = imageUrlBuilder(client)
const urlFor = (source: unknown) => {
  if (!isSanityImageSource(source)) return builder.image({})
  return builder.image(source as Record<string, unknown>)
}

const articleWithNavigationQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    author,
    authorBio,
    articleType,
    introduction,
    contentBlocks,
    content,
    responses,
    interviewQA,
    conversation,
    qaList,
    additionalSections,
    order,
    "issue": issue->{
      _id,
      number,
      title,
      credits
    },
    "section": section->{
      _id,
      title,
      slug,
      order,
      "parentSection": parentSection->{
        _id,
        title,
        slug,
        order,
        "parentSection": parentSection->{
          _id,
          title,
          slug,
          order
        }
      }
    },
    // 같은 호의 모든 아티클을 가져와서 클라이언트에서 정렬
    "allArticlesInIssue": *[
      _type == "article" && 
      issue._ref == ^.issue._ref
    ] {
      _id,
      title,
      "slug": slug.current,
      order,
      "section": section->{
        _id,
        order,
        "parentSection": parentSection->{
          _id,
          order,
          "parentSection": parentSection->{
            _id,
            order
          }
        }
      }
    }
  }
`

interface PageProps {
  params: Promise<{ slug: string }>
}

type PortableMarkDef = { _key?: string; _type?: string; text?: string }
type PortableChild = { marks?: string[] }
type PortableBlock = { _type?: string; markDefs?: PortableMarkDef[]; children?: PortableChild[] }

const hasFootnotes = (content: unknown[]): boolean => {
  if (!content || !Array.isArray(content)) return false

  return content.some((block) => {
    const b = block as PortableBlock
    return (
      b._type === 'block' &&
      b.markDefs &&
      Array.isArray(b.markDefs) &&
      b.markDefs.some((def) => def._type === 'footnote')
    )
  }
  )
}

const extractFootnotes = (content: unknown[]): FootnoteItem[] => {
  if (!content || !Array.isArray(content)) return []

  const footnotes: FootnoteItem[] = []
  const usedKeys = new Set<string>()
  let footnoteNumber = 1

  const allMarkDefs: PortableMarkDef[] = []
  content.forEach((block) => {
    const b = block as PortableBlock
    if (b._type === 'block' && b.markDefs && Array.isArray(b.markDefs)) {
      b.markDefs.forEach((def) => {
        if (def._type === 'footnote' && def.text) {
          allMarkDefs.push(def)
        }
      })
    }
  })

  content.forEach((block) => {
    const b = block as PortableBlock
    if (b._type === 'block' && b.children) {
      b.children.forEach((child) => {
        if (child.marks && Array.isArray(child.marks)) {
          child.marks.forEach((markKey: string) => {
            if (markKey && typeof markKey === 'string' && !usedKeys.has(markKey)) {
              const footnoteDef = allMarkDefs.find((def) => def._key === markKey)
              if (footnoteDef && footnoteDef.text) {
                footnotes.push({ number: footnoteNumber++, text: footnoteDef.text, markKey })
                usedKeys.add(markKey)
              }
            }
          })
        }
      })
    }
  })

  return footnotes
}

export default function ArticlePage({ params }: PageProps) {
  const [article, setArticle] = useState<ArticlePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [showNavigation, setShowNavigation] = useState(false)
  const [expandedFootnotes, setExpandedFootnotes] = useState<{ [key: number]: boolean }>({})
  const [mobileFootnotePopup, setMobileFootnotePopup] = useState<Pick<FootnoteItem, 'number' | 'text'> | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // 각주 추출 (introduction, content, responses, interviewQA, conversation, qaList, additionalSections에서)
  const allContentForFootnotes = useMemo<unknown[]>(
    () => [
      ...(article?.introduction || []),
      ...(article?.content || []),
      ...(article?.responses?.flatMap((r: { content?: unknown[] }) => r.content || []) || []),
      ...(article?.responses?.flatMap((r: { references?: unknown[] }) => r.references || []) || []),
      ...(article?.interviewQA?.flatMap((qa: { question?: unknown[]; answers?: Array<{ answer?: unknown[] }> }) => [
        ...(qa.question || []),
        ...(qa.answers?.flatMap((a) => a.answer || []) || [])
      ]) || []),
      ...(article?.conversation?.flatMap((c: { text?: unknown[] }) => c.text || []) || []),
      ...(article?.qaList?.flatMap((qa: { question?: unknown[]; answer?: unknown[] }) => [
        ...(qa.question || []),
        ...(qa.answer || [])
      ]) || []),
      ...(article?.additionalSections?.flatMap((s: ArticleAdditionalSection) => s.content || []) || []),
    ],
    [article]
  )
  const hasFootnotesInContent = useMemo(
    () => (allContentForFootnotes.length > 0 ? hasFootnotes(allContentForFootnotes) : false),
    [allContentForFootnotes]
  )
  const footnotesList = useMemo(
    () => (allContentForFootnotes.length > 0 ? extractFootnotes(allContentForFootnotes) : []),
    [allContentForFootnotes]
  )

  // 각주 토글 함수
  const toggleFootnote = (number: number) => {
    // 펼침/접힘 토글
    setExpandedFootnotes(prev => ({
      ...prev,
      [number]: !prev[number]
    }))

    // 각주 원텍스트 위치로 스크롤
    const footnoteElement = document.querySelector(`[data-footnote-number="${number}"]`)
    if (footnoteElement) {
      const rect = footnoteElement.getBoundingClientRect()
      const absoluteTop = window.pageYOffset + rect.top
      const offset = window.innerHeight / 2 - rect.height / 2 // 화면 중앙
      
      window.scrollTo({
        top: absoluteTop - offset,
        behavior: 'smooth'
      })
    }
  }
  

  // 텍스트에서 URL을 하이퍼링크로 변환하는 함수 (각주, 캡션 등에 사용)
  const renderTextWithLinks = useMemo(() => {
    const renderText = (text: string) => {
      if (!text) return text

      // URL 패턴 매칭 (http://, https://, www.로 시작하는 URL)
      const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
      const parts: Array<React.ReactElement | string> = []
      let lastIndex = 0
      let match
      let key = 0

      while ((match = urlPattern.exec(text)) !== null) {
        // URL 이전의 텍스트 추가
        if (match.index > lastIndex) {
          parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>)
        }
        
        // URL을 링크로 변환
        const url = match[0]
        const href = url.startsWith('http') ? url : `https://${url}`
        const borderColor = isDarkMode ? 'border-blue-300' : 'border-blue-600'
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={`${getTextColor(isDarkMode, 'link')} border-b border-dotted ${borderColor} hover:opacity-80`}
          >
            {url}
          </a>
        )
        
        lastIndex = urlPattern.lastIndex
      }
      
      // 마지막 남은 텍스트 추가
      if (lastIndex < text.length) {
        parts.push(<span key={key++}>{text.substring(lastIndex)}</span>)
      }
      
      return parts.length > 0 ? <>{parts}</> : text
    }
    renderText.displayName = 'RenderTextWithLinks'
    return renderText
  }, [isDarkMode])

  // React children에서 텍스트 노드를 찾아 URL을 링크로 변환하는 함수
  const processChildrenWithLinks = useMemo(() => {
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child, index) => {
        // 텍스트 노드인 경우
        if (typeof child === 'string') {
          const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
          const parts: Array<React.ReactElement | string> = []
          let lastIndex = 0
          let match
          let key = 0

          while ((match = urlPattern.exec(child)) !== null) {
            // URL 이전의 텍스트 추가
            if (match.index > lastIndex) {
              parts.push(child.substring(lastIndex, match.index))
            }
            
            // URL을 링크로 변환
            const url = match[0]
            const href = url.startsWith('http') ? url : `https://${url}`
            const borderColor = isDarkMode ? 'border-blue-300' : 'border-blue-600'
            parts.push(
              <a
                key={key++}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className={`${getTextColor(isDarkMode, 'link')} border-b border-dotted ${borderColor} hover:opacity-80`}
              >
                {url}
              </a>
            )
            
            lastIndex = urlPattern.lastIndex
          }
          
          // 마지막 남은 텍스트 추가
          if (lastIndex < child.length) {
            parts.push(child.substring(lastIndex))
          }
          
          return parts.length > 1 ? <>{parts}</> : child
        }
        
        // React 요소인 경우 - list 관련 요소는 건드리지 않음
        if (React.isValidElement(child)) {
          const typeName = getElementTypeName(child.type)
          
          // ul, ol, li 태그는 복제하지 않고 그대로 반환
          if (typeName === 'ul' || typeName === 'ol' || typeName === 'li') {
            return child
          }
          
          const props = child.props as { children?: React.ReactNode; className?: string }
          if (props?.children) {
            return React.cloneElement(child as React.ReactElement<{ children?: React.ReactNode; className?: string }>, {
              ...props,
              children: processChildrenWithLinks(props.children),
              key: child.key || index
            })
          }
        }
        
        return child
      })
    }
    processChildren.displayName = 'ProcessChildrenWithLinks'
    return processChildren
  }, [isDarkMode])


  // 스크롤 이벤트 핸들러 - 1초 이상 멈춰있을 때 네비게이션 표시
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout | null = null

    const handleScroll = () => {
      setShowNavigation(false)

      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }

      scrollTimer = setTimeout(() => {
        setShowNavigation(true)
      }, 1000)
    }

    window.addEventListener('scroll', handleScroll)

    // 초기 로드 시 네비게이션 표시
    setShowNavigation(true)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
    }
  }, [])

  // 섹션 계층 구조를 고려한 정렬 함수
  // 반환값: [최상위 섹션 order, 하위 섹션 order, 하하위 섹션 order]
  const getSectionPath = (section?: ArticleSectionPathRef): number[] => {
    if (!section) return [999999, 999999, 999999] // 섹션이 없으면 맨 뒤로
    
    const getOrder = (s?: ArticleSectionPathRef) => s?.order ?? 999999
    
    // 섹션 계층 구조 파악
    if (section.parentSection?.parentSection) {
      // 하하위 섹션 (3단계): 최상위 -> 하위 -> 하하위
      return [
        getOrder(section.parentSection.parentSection), // 최상위 섹션 order
        getOrder(section.parentSection), // 하위 섹션 order
        getOrder(section) // 하하위 섹션 order
      ]
    } else if (section.parentSection) {
      // 하위 섹션 (2단계): 최상위 -> 하위
      return [
        getOrder(section.parentSection), // 최상위 섹션 order
        getOrder(section), // 하위 섹션 order
        0 // 하하위 섹션 없음 (직속 article)
      ]
    } else {
      // 최상위 섹션 (1단계) - 직속 article
      return [
        getOrder(section), // 최상위 섹션 order
        0, // 하위 섹션 없음 (직속 article)
        0 // 하하위 섹션 없음
      ]
    }
  }

  // 아티클 정렬 함수
  const sortArticles = useCallback((articles: ArticleInIssueRef[]): ArticleInIssueRef[] => {
    return [...articles].sort((a, b) => {
      const pathA = getSectionPath(a.section)
      const pathB = getSectionPath(b.section)
      
      // 섹션 경로 비교 (최상위 -> 하위 -> 하하위)
      for (let i = 0; i < 3; i++) {
        if (pathA[i] !== pathB[i]) {
          return pathA[i] - pathB[i]
        }
      }
      
      // 같은 섹션 내에서는 order로 정렬 (null/undefined는 0으로 처리)
      const orderA = a.order ?? 0
      const orderB = b.order ?? 0
      return orderA - orderB
    })
  }, [])

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
      fetch(`/api/articles/${resolvedParams.slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch article data')
          return res.json()
        })
        .then(({ article: data }: { article: ArticlePageData }) => {
        if (data && data.allArticlesInIssue) {
          // 같은 호의 모든 아티클을 섹션 계층 구조로 정렬
          const sortedArticles = sortArticles(data.allArticlesInIssue)
        
          
          // 현재 아티클의 인덱스 찾기
          const currentIndex = sortedArticles.findIndex((a) => a._id === data._id)
          
          // 이전/다음 아티클 찾기
          if (currentIndex > 0) {
            data.prevArticle = {
              title: sortedArticles[currentIndex - 1].title,
              slug: sortedArticles[currentIndex - 1].slug
            }
          } else {
            data.prevArticle = null
          }
          
          if (currentIndex < sortedArticles.length - 1) {
            data.nextArticle = {
              title: sortedArticles[currentIndex + 1].title,
              slug: sortedArticles[currentIndex + 1].slug
            }
          } else {
            data.nextArticle = null
          }
        }
        
        setArticle(data)
        setLoading(false)
      })
      .catch(() => {
        setArticle(null)
        setLoading(false)
      })
    })
  }, [params, sortArticles])

  // 인터뷰 Q&A 전용 components (질문: 본문폰트-민부리, 답변: 본문폰트-부리)
  const interviewQAComponents = useMemo(() => {
    return createPortableTextComponents(
      'interviewQAQuestion',
      isDarkMode,
      footnotesList,
      setMobileFootnotePopup,
      setExpandedFootnotes,
      renderTextWithLinks
    )
  }, [isDarkMode, footnotesList, renderTextWithLinks])

  // 답변 전용 components (본문폰트-부리)
  const answerComponents = useMemo(() => {
    return createPortableTextComponents(
      'interviewQAAnswer',
      isDarkMode,
      footnotesList,
      setMobileFootnotePopup,
      setExpandedFootnotes,
      renderTextWithLinks
    )
  }, [isDarkMode, footnotesList, renderTextWithLinks])

  // Portable Text Components
  const components = useMemo(() => {
    // 기본 components 생성
    const baseComponents = createPortableTextComponents(
      'standard',
      isDarkMode,
      footnotesList,
      setMobileFootnotePopup,
      setExpandedFootnotes,
      renderTextWithLinks
    )

    // Table 컴포넌트를 별도로 정의 (재귀 참조 방지를 위해)
    const TableComponent = ({ value }: { value: { rows?: Array<{ label?: string; content?: unknown[] }> } }) => {
      if (!value?.rows || !Array.isArray(value.rows)) return null

      // 테이블 내용용 components 생성
      const tableContentComponents = createPortableTextComponents(
        'tableContent',
        isDarkMode,
        footnotesList,
        setMobileFootnotePopup,
        setExpandedFootnotes,
        renderTextWithLinks
      )

      return (
        <div className="my-8 border-t border-b border-gray-300 dark:border-gray-700">
          {value.rows.map((row, index: number) => (
            <div
              key={index}
              className="grid grid-cols-[200px_1fr] gap-4 py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
            >
              <div className={`font-semibold ${getTextColor(isDarkMode)}`}>
                {row.label}
              </div>
              <div className={getTextColor(isDarkMode)}>
                <PortableText
                  value={toPortableValue(row.content)}
                  components={tableContentComponents}
                />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return {
      types: {
        timelineBlock: ({ value }: { value: { caption?: string } }) => {
          return (
            <div className="my-16">
              <Timeline />
              {value?.caption && (
                <p className={`${CAPTION_STYLES.DEFAULT} ${getTextColor(isDarkMode, 'subtle')} text-center mt-4`}>
                  {renderTextWithLinks(value.caption)}
                </p>
              )}
            </div>
          )
        },
        tableBlock: ({ value }: { value: { rows?: Array<{ cells?: string[] }> } }) => {
          if (!value?.rows || !Array.isArray(value.rows)) return null

          return (
            <div className="my-8 border-t border-b border-gray-300 dark:border-gray-700">
              {value.rows.map((row, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-[200px_1fr] gap-4 py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                >
                  <div className={`font-semibold ${getTextColor(isDarkMode)}`}>
                    {row.cells?.[0] || ''}
                  </div>
                  <div className={getTextColor(isDarkMode)}>
                    {row.cells?.[1] || ''}
                  </div>
                </div>
              ))}
            </div>
          )
        },
        image: ({ value }: { value: { asset?: unknown; alt?: string; caption?: string } }) => {
        if (!value || !value.asset) {
          return null
        }

        const imageUrl = getImageUrl(value, urlFor)
        if (!imageUrl) {
          return null
        }

        return (
          <div className="my-8">
            <div className="w-[80%] mx-auto">
              <Image
                src={imageUrl}
                alt={value.alt || ''}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[70vh] object-contain"
                sizes="80vw"
                unoptimized
              />
            </div>
            {value.caption && (
              <p className={`w-[75%] mx-auto ${CAPTION_STYLES.IMAGE} ${getTextColor(isDarkMode, 'subtle')}`}>
                {renderTextWithLinks(value.caption)}
              </p>
            )}
          </div>
        )
      },
      imageGrid: ({ value }: { value: { images?: Array<{ asset?: unknown; alt?: string; caption?: string }> } }) => {
        if (!value?.images || !Array.isArray(value.images)) return null

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {value.images.map((image, index: number) => {
              const imageUrl = getImageUrl(image, urlFor)
              if (!imageUrl) {
                return null
              }

              return (
                <div key={index}>
                  <Image
                    src={imageUrl}
                    alt={image.alt || ''}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                  {image.caption && (
                    <p className={`${CAPTION_STYLES.GRID} ${getTextColor(isDarkMode, 'subtle')}`}>
                      {renderTextWithLinks(image.caption)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )
      },
      imageSlider: ({ value }: { value: unknown }) => {
        return <ArticleImageSlider value={value} isDarkMode={isDarkMode} urlFor={urlFor} renderTextWithLinks={renderTextWithLinks} />
      },
      table: TableComponent,
    },
    // baseComponents의 block, marks, list를 사용
    ...baseComponents,
    }
  }, [isDarkMode, renderTextWithLinks, footnotesList])

  // 추가섹션 전용 components (각주 스타일 사용, 텍스트 내 URL 자동 링크 변환)
  const additionalSectionComponents = useMemo(() => {
    const base = createAdditionalSectionComponents(isDarkMode, processChildrenWithLinks)
    return {
      ...base,
      types: {
        image: ({ value }: { value: { asset?: unknown; alt?: string } }) => {
          if (!value || !value.asset) {
            return null
          }
          const imageUrl = urlFor(value).width(800).height(600).url()
          return (
            <div className="my-8">
              <Image
                src={imageUrl}
                alt={value.alt || ''}
                width={800}
                height={600}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          )
        }
      }
    }
  }, [isDarkMode, processChildrenWithLinks])

  const normalizedContentBlocks = useMemo(() => {
    if (!article) return []

    if (Array.isArray(article.contentBlocks) && article.contentBlocks.length > 0) {
      return article.contentBlocks
    }

    const blocks: ArticleContentBlock[] = []
    ARTICLE_CONTENT_BLOCK_TYPES.forEach((type) => {
      const matrix = ARTICLE_CONTENT_MATRIX[type]
      const legacyFieldData = article?.[matrix.legacyField]
      if (Array.isArray(legacyFieldData) && legacyFieldData.length > 0) {
        blocks.push({
          blockType: type,
          [matrix.blockField]: legacyFieldData,
        })
      }
    })
    return blocks
  }, [article])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-start md:items-center justify-center pt-[40vh] md:pt-0 ${getBgColor(isDarkMode)}`}>
        <Image
          src={isDarkMode ? "/img/logo2-i.gif" : "/img/logo2.gif"}
          alt="글짜씨"
          width={192}
          height={72}
          className="w-32 lg:w-48 h-auto"
          unoptimized
          priority
        />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`${TYPOGRAPHY.ui.error} text-gray-500`}>아티클을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getBgColor(isDarkMode)}`}>
      <ArticleLeftSidebar isDarkMode={isDarkMode} article={article} />

      {/* 중앙: 아티클 본문 */}
        <article className="max-w-[720px] mx-auto px-4 xl:px-0 pt-6 pb-6 md:pt-10 md:pb-10">
            {/* 호수, 섹션 */}
            <div className={`text-center mb-1 md:text-left md:indent-[0.2em] ${TYPOGRAPHY.meta.issueSection} ${getTextColor(isDarkMode)}`}>
              {article.issue.number} · {article.section.title}
            </div>

            {/* 제목과 저자 - 데스크톱에서 두 단으로 */}
            <div className="mb-6 md:mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                {/* 제목 - 왼쪽 */}
                <div className={`${getHeadingClasses(1)} text-center md:text-left ${getTextColor(isDarkMode)}`}>
                  {article.title}
                </div>

                {/* 저자 - 오른쪽 */}
                <div className={`${getHeadingClasses(1)} text-center md:text-left ${getTextColor(isDarkMode)}`}>
                  {article.author}
                </div>
              </div>
            </div>

            {/* 개괄글/서론 (모든 타입 공통) */}
            {article.introduction && Array.isArray(article.introduction) && article.introduction.length > 0 && (
              <div className={`mb-8 italic ${getTextColor(isDarkMode)}`}>
                <PortableText
                  value={article.introduction}
                  components={components}
                />
              </div>
            )}

            {/* 본문 블록 렌더링 (contentBlocks + legacy 통합) */}
            <div className={`mb-8 md:mb-16 space-y-12 ${getTextColor(isDarkMode)}`}>
              {normalizedContentBlocks.map((block: ArticleContentBlock, blockIdx: number) => {
                if (isContentBlockType(block.blockType)) {
                  return (
                    <ContentBlockRenderer
                      key={blockIdx}
                      block={block}
                      blockIdx={blockIdx}
                      isDarkMode={isDarkMode}
                      components={components}
                      interviewQAComponents={interviewQAComponents}
                      answerComponents={answerComponents}
                      urlFor={urlFor}
                    />
                  )
                }
                console.warn(`Unknown content block type: ${block.blockType}`)
                return null
              })}
            </div>

            {/* 추가 섹션 (참고문헌, 이미지 출처 등) */}
            {article.additionalSections && article.additionalSections.length > 0 && (
              <div className={`ml-[10%] mt-8 mb-16 md:ml-[40%] md:mt-12 md:mb-24 space-y-8 ${getTextColor(isDarkMode)}`}>
                {article.additionalSections.map((section: ArticleAdditionalSection, idx: number) => (
                  <div key={idx} className={`${getBorderColor(isDarkMode)}`}>
                    {/* 섹션 제목 */}
                    <div className={`mb-4 ${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode)}`}>
                      {section.title}
                    </div>

                    {/* 섹션 내용 */}
                    <div className={` ${getFootnoteClasses('text')} ${getTextColor(isDarkMode, 'muted')}`}>
                      <PortableText value={section.content} components={additionalSectionComponents} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

      <ArticleRightSidebar
        isDarkMode={isDarkMode}
        article={article}
        hasFootnotesInContent={hasFootnotesInContent}
        footnotesList={footnotesList}
        expandedFootnotes={expandedFootnotes}
        toggleFootnote={toggleFootnote}
        renderTextWithLinks={renderTextWithLinks}
      />
      <ArticleMobileBottomNavigation showNavigation={showNavigation} isDarkMode={isDarkMode} article={article} />
      <MobileFootnotePopup
        popup={mobileFootnotePopup}
        onClose={() => setMobileFootnotePopup(null)}
        renderTextWithLinks={renderTextWithLinks}
      />
    </div>
  )
}
