'use client'

import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useMemo } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import { getTextColor, getBgColor, getBorderColor, getHoverTextColor, getLinkColor } from '@/lib/DarkModeUtils'
import { LAYOUT, CAPTION_STYLES } from '@/lib/constants'
import { getTypographyClasses, getHeadingClasses, getBodyClasses, getCaptionClasses, TYPOGRAPHY, getFootnoteClasses } from '@/lib/typography'

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

// 이미지 슬라이더 컴포넌트
const ImageSlider = ({ value, isDarkMode, urlFor, renderTextWithLinks }: { value: any; isDarkMode: boolean; urlFor: any; renderTextWithLinks: (text: string) => React.ReactNode }) => {
  // Hooks는 항상 같은 순서로 호출되어야 하므로 조건부 return 전에 호출
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 이미지 URL 배열 생성
  const imageUrls = useMemo(() => {
    if (!value?.images || !Array.isArray(value.images)) return []
    return value.images
      .map((image: any) => {
        if (image?.asset?._ref) {
          return urlFor(image).url() || null
        } else if (image?.asset?.url) {
          return image.asset.url
        }
        return null
      })
      .filter((url: string | null) => url !== null)
  }, [value?.images, urlFor])

  // 자동 재생
  useEffect(() => {
    if (!value.autoplay || imageUrls.length < 2) return
    
    const interval = setInterval(() => {
      setDirection('right')
      setIsTransitioning(true)
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % imageUrls.length
        setTimeout(() => setIsTransitioning(false), 500)
        return newIndex
      })
    }, 3000) // 3초마다
    
    return () => {
      clearInterval(interval)
    }
  }, [value.autoplay, imageUrls.length])

  // 키보드 네비게이션
  useEffect(() => {
    if (imageUrls.length < 2) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return
      if (e.key === 'ArrowLeft') {
        setDirection('left')
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
          const newIndex = (prev - 1 + imageUrls.length) % imageUrls.length
          setTimeout(() => setIsTransitioning(false), 500)
          return newIndex
        })
      } else if (e.key === 'ArrowRight') {
        setDirection('right')
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % imageUrls.length
          setTimeout(() => setIsTransitioning(false), 500)
          return newIndex
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [imageUrls.length, isTransitioning])

  // 조건부 return은 모든 hooks 호출 후에
  if (!value?.images || !Array.isArray(value.images) || imageUrls.length < 2) return null

  const goToNext = () => {
    if (isTransitioning) return
    setDirection('right')
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    if (isTransitioning) return
    setDirection('left')
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    setDirection(index > currentIndex ? 'right' : 'left')
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  return (
    <div className="my-16 md:my-24">
      {/* 메인 이미지 */}
      <div className="relative group w-full">
        <div className="relative overflow-hidden w-[80%] mx-auto">
          {/* 슬라이드 컨테이너 */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {imageUrls.map((url: string, index: number) => (
              <div
                key={index}
                className="w-full flex-shrink-0"
              >
                <Image
                  src={url}
                  alt={value.images[index]?.alt || `이미지 ${index + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  sizes="80vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* 이전/다음 버튼 - 이미지 바깥 양옆 여백에 위치 */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center z-10 ${getTextColor(isDarkMode)}`}
              aria-label="이전 이미지"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center z-10 ${getTextColor(isDarkMode)}`}
              aria-label="다음 이미지"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 인디케이터 - 이미지 슬라이더 버튼과 동일한 스타일 */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {imageUrls.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-2 md:h-2 rounded-full border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? isDarkMode
                      ? 'border-white'
                      : 'border-black'
                    : isDarkMode
                    ? 'border-white/40 hover:border-white/80'
                    : 'border-black/40 hover:border-black/80'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        {/* 이미지 카운터 (데스크톱에서 표시) */}
        {imageUrls.length > 1 && (
          <div className={`hidden md:block absolute top-[-1] right-1 px-3 ${TYPOGRAPHY.ui.imageCounter} ${getTextColor(isDarkMode)}`}>
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </div>

      {/* 현재 이미지 캡션 */}
      {value.images[currentIndex]?.caption && (
        <p className={`${CAPTION_STYLES.DEFAULT} ${getTextColor(isDarkMode, 'subtle')}`}>
          {renderTextWithLinks(value.images[currentIndex].caption)}
        </p>
      )}

      {/* 슬라이더 전체 캡션 */}
      {value.sliderCaption && (
        <p className={`${CAPTION_STYLES.DEFAULT} ${getTextColor(isDarkMode, 'subtle')}`}>
          {renderTextWithLinks(value.sliderCaption)}
        </p>
      )}

      {/* 썸네일 (showThumbnails가 true일 때) - 고정 크기로 통일 */}
      {value.showThumbnails && imageUrls.length > 1 && (
        <div className="mt-2 md:mt-4 flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {imageUrls.map((url: string, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-all hover:scale-105 relative ${
                index === currentIndex
                  ? isDarkMode
                    ? 'scale-105'
                    : 'scale-105'
                  : isDarkMode
                  ? 'opacity-60 hover:opacity-80'
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <Image
                src={url}
                alt={`썸네일 ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
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

export default function ArticlePage({ params }: PageProps) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [showNavigation, setShowNavigation] = useState(false)
  const [expandedFootnotes, setExpandedFootnotes] = useState<{ [key: number]: boolean }>({})
  const [mobileFootnotePopup, setMobileFootnotePopup] = useState<{ number: number; text: string } | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // 본문에 각주가 있는지 확인하는 함수
  const hasFootnotes = (content: any): boolean => {
    if (!content || !Array.isArray(content)) return false

    // markDefs에 footnote 타입이 있는지 확인
    const hasFootnoteDefs = content.some((block: any) =>
      block._type === 'block' &&
      block.markDefs &&
      Array.isArray(block.markDefs) &&
      block.markDefs.some((def: any) => def._type === 'footnote')
    )

    return hasFootnoteDefs
  }

  // 본문에서 모든 각주 텍스트를 추출하는 함수
  const extractFootnotes = (content: any): Array<{ number: number; text: string; markKey?: string }> => {
    if (!content || !Array.isArray(content)) return []

    const footnotes: Array<{ number: number; text: string; markKey?: string }> = []
    const usedKeys = new Set<string>()
    let footnoteNumber = 1

    // 모든 블록에서 markDefs 수집
    const allMarkDefs: Array<{ _key: string; _type: string; text?: string }> = []
    content.forEach((block: any) => {
      if (block._type === 'block' && block.markDefs && Array.isArray(block.markDefs)) {
        block.markDefs.forEach((def: any) => {
          if (def._type === 'footnote' && def.text) {
            allMarkDefs.push(def)
          }
        })
      }
    })

    // 각 블록의 children에서 각주 마크 찾기
    content.forEach((block: any) => {
      if (block._type === 'block' && block.children) {
        block.children.forEach((child: any) => {
          if (child.marks && Array.isArray(child.marks)) {
            child.marks.forEach((markKey: string) => {
              if (markKey && typeof markKey === 'string' && !usedKeys.has(markKey)) {
                const footnoteDef = allMarkDefs.find((def: any) => def._key === markKey)
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

  // 각주 추출 (introduction, content, responses, interviewQA, conversation, qaList, additionalSections에서)
  const allContentForFootnotes = [
    ...(article?.introduction || []),
    ...(article?.content || []),
    ...(article?.responses?.flatMap((r: any) => r.content || []) || []),
    ...(article?.responses?.flatMap((r: any) => r.references || []) || []),
    ...(article?.interviewQA?.flatMap((qa: any) => [
      ...(qa.question || []),
      ...(qa.answers?.flatMap((a: any) => a.answer || []) || [])
    ]) || []),
    ...(article?.conversation?.flatMap((c: any) => c.text || []) || []),
    ...(article?.qaList?.flatMap((qa: any) => [
      ...(qa.question || []),
      ...(qa.answer || [])
    ]) || []),
    ...(article?.additionalSections?.flatMap((s: any) => s.content || []) || [])
  ]
  const hasFootnotesInContent = allContentForFootnotes.length > 0 ? hasFootnotes(allContentForFootnotes) : false
  const footnotesList = allContentForFootnotes.length > 0 ? extractFootnotes(allContentForFootnotes) : []

  // 각주 토글 함수
  const toggleFootnote = (number: number) => {
    setExpandedFootnotes(prev => ({
      ...prev,
      [number]: !prev[number]
    }))

    // 각주 원텍스트 위치로 스크롤
    const footnoteElement = document.querySelector(`[data-footnote-number="${number}"]`)
    if (footnoteElement) {
      footnoteElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // 텍스트에서 URL을 하이퍼링크로 변환하는 함수 (각주, 캡션 등에 사용)
  const renderTextWithLinks = useMemo(() => {
    return (text: string) => {
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
  }, [isDarkMode])

  // React children에서 텍스트 노드를 찾아 URL을 링크로 변환하는 함수
  const processChildrenWithLinks = useMemo(() => {
    return (children: React.ReactNode): React.ReactNode => {
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
        
        // React 요소인 경우 children을 재귀적으로 처리
        if (React.isValidElement(child)) {
          const props = child.props as any
          if (props?.children) {
            return React.cloneElement(child, {
              ...props,
              children: processChildrenWithLinks(props.children),
              key: child.key || index
            } as any)
          }
        }
        
        return child
      })
    }
  }, [isDarkMode])

  // Intersection Observer로 각주 텍스트가 화면에 들어오는지 감지
  useEffect(() => {
    if (!article?.content || !hasFootnotesInContent) return

    const observers: IntersectionObserver[] = []
    const footnoteElements = document.querySelectorAll('[data-footnote-number]')

    footnoteElements.forEach((element) => {
      const footnoteNumber = parseInt(element.getAttribute('data-footnote-number') || '0')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 화면에 들어오면 자동으로 펼치기
              setExpandedFootnotes(prev => ({
                ...prev,
                [footnoteNumber]: true
              }))
            }
          })
        },
        {
          threshold: 0.1, // 10% 이상 보이면 감지
          rootMargin: '0px'
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [article?.content, hasFootnotesInContent])

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
  const getSectionPath = (section: any): number[] => {
    if (!section) return [999999, 999999, 999999] // 섹션이 없으면 맨 뒤로
    
    const getOrder = (s: any) => s?.order ?? 999999
    
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
  const sortArticles = (articles: any[]): any[] => {
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
  }

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
      client.fetch(articleWithNavigationQuery, { slug: resolvedParams.slug }).then((data) => {
        if (data && data.allArticlesInIssue) {
          // 같은 호의 모든 아티클을 섹션 계층 구조로 정렬
          const sortedArticles = sortArticles(data.allArticlesInIssue)
          
          // 디버깅: 정렬된 아티클 목록 확인
          console.log('정렬된 아티클:', sortedArticles.map((a: any) => ({
            title: a.title,
            path: getSectionPath(a.section),
            order: a.order
          })))
          
          // 현재 아티클의 인덱스 찾기
          const currentIndex = sortedArticles.findIndex((a: any) => a._id === data._id)
          
          console.log('현재 아티클 인덱스:', currentIndex, '제목:', data.title)
          
          // 이전/다음 아티클 찾기
          if (currentIndex > 0) {
            data.prevArticle = {
              title: sortedArticles[currentIndex - 1].title,
              slug: sortedArticles[currentIndex - 1].slug
            }
            console.log('이전 글:', data.prevArticle.title)
          } else {
            data.prevArticle = null
          }
          
          if (currentIndex < sortedArticles.length - 1) {
            data.nextArticle = {
              title: sortedArticles[currentIndex + 1].title,
              slug: sortedArticles[currentIndex + 1].slug
            }
            console.log('다음 글:', data.nextArticle.title)
          } else {
            data.nextArticle = null
          }
        }
        
        setArticle(data)
        setLoading(false)
      })
    })
  }, [params])

  // 아티클 바깥 스크롤을 아티클 스크롤로 전달
  useEffect(() => {
    if (typeof window === 'undefined') return

    const articleElement = document.querySelector('article')
    if (!articleElement) return

    const handleWheel = (e: WheelEvent) => {
      // 아티클 영역 내부에서 발생한 스크롤은 기본 동작 유지
      const target = e.target as HTMLElement
      if (articleElement.contains(target)) {
        return
      }

      // 아티클이 스크롤 가능한 상태인지 확인
      const isScrollable = articleElement.scrollHeight > articleElement.clientHeight
      if (!isScrollable) return

      // 스크롤 가능 범위 확인
      const isAtTop = articleElement.scrollTop <= 0
      const isAtBottom = articleElement.scrollTop >= articleElement.scrollHeight - articleElement.clientHeight - 1

      // 위로 스크롤하려는데 이미 맨 위에 있으면 기본 동작 허용
      if (e.deltaY < 0 && isAtTop) {
        return
      }

      // 아래로 스크롤하려는데 이미 맨 아래에 있으면 기본 동작 허용
      if (e.deltaY > 0 && isAtBottom) {
        return
      }

      // 아티클 스크롤로 전달
      e.preventDefault()
      articleElement.scrollTop += e.deltaY
    }

    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [article])

  // Portable Text Components
  const components = useMemo(() => ({
    types: {
      image: ({ value }: any) => {
        if (!value || !value.asset) {
          return null
        }

        // asset이 _ref 형태인 경우 이미지 URL 생성
        let imageUrl: string
        if (value.asset._ref) {
          imageUrl = urlFor(value).url() || ''
        } else if (value.asset.url) {
          imageUrl = value.asset.url
        } else {
          return null
        }

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
      imageGrid: ({ value }: any) => {
        if (!value?.images || !Array.isArray(value.images)) return null

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {value.images.map((image: any, index: number) => {
              let imageUrl: string | null = null

              if (image?.asset?._ref) {
                imageUrl = urlFor(image).url() || null
              } else if (image?.asset?.url) {
                imageUrl = image.asset.url
              }

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
      imageSlider: ({ value }: any) => {
        return <ImageSlider value={value} isDarkMode={isDarkMode} urlFor={urlFor} renderTextWithLinks={renderTextWithLinks} />
      }
    },
    block: {
      h2: ({ children }: any) => (
        <h2
          className={`${getTypographyClasses('h2', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 
          className={`${getTypographyClasses('h3', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4
          className={`${getTypographyClasses('h4', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5
          className={`${getTypographyClasses('h5', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6
          className={`${getTypographyClasses('h6', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </h6>
      ),
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
            className={`${getBodyClasses('normal')} ${getTextColor(isDarkMode)}`}
          >
            {children}
          </Tag>
        )
      },
      blockquote: ({ children }: any) => (
        <blockquote
          style={{
            lineHeight: '1.68',
            borderLeft: isDarkMode ? '0.4em solid white' : '0.4em solid black',
            paddingLeft: '1.5em',
            margin: '32px 0',
          }}
          className={`${getTypographyClasses('blockquote', 'portable')} ${getTextColor(isDarkMode)}`}
        >
          {children}
        </blockquote>
      )
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
      footnote: ({ children, value }: any) => {
        // 각주 번호 찾기 (footnotesList에서 텍스트로 매칭)
        const footnote = footnotesList.find(f => f.text === value?.text)
        const footnoteNumber = footnote?.number || 0

        const handleFootnoteClick = (e: React.MouseEvent) => {
          e.preventDefault()

          // 모바일에서는 팝업 표시, 데스크톱에서는 사이드바 각주 토글
          if (typeof window !== 'undefined') {
            const isMobile = window.innerWidth < 768
            if (isMobile && footnoteNumber > 0 && footnote) {
              setMobileFootnotePopup({ number: footnoteNumber, text: footnote.text })
            } else if (!isMobile && footnoteNumber > 0) {
              setExpandedFootnotes(prev => ({
                ...prev,
                [footnoteNumber]: !prev[footnoteNumber]
              }))
            }
          }
        }

        return (
          <span
            data-footnote-number={footnoteNumber || undefined}
            onClick={handleFootnoteClick}
            className={`cursor-pointer border-b border-dotted ${isDarkMode ? 'text-blue-300 border-blue-300 hover:text-blue-200' : 'text-blue-600 border-blue-600 hover:text-blue-700'}`}
          >
            {children}
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
    },
    list: {
      bullet: ({ children }: any) => (
        <ul style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }} className={getTextColor(isDarkMode)}>
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }} className={getTextColor(isDarkMode)}>
          {children}
        </ol>
      )
    }
  }), [footnotesList, isDarkMode])

  // 추가섹션 전용 components (각주 스타일 사용, 텍스트 내 URL 자동 링크 변환)
  const additionalSectionComponents = useMemo(() => ({
    types: {
      image: ({ value }: any) => {
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
    },
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
        // 각주 스타일 사용 (본문 스타일 제거)
        const Tag = hasBlockElements ? 'div' : 'p'
        return (
          <Tag
            className={`space-y-4 ${getTextColor(isDarkMode, 'muted')}`}
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
      bullet: ({ children }: any) => {
        const processedChildren = processChildrenWithLinks(children)
        return (
          <ul className={`space-y-2 ${getTextColor(isDarkMode, 'muted')}`}>
            {processedChildren}
          </ul>
        )
      },
      number: ({ children }: any) => {
        const processedChildren = processChildrenWithLinks(children)
        const childrenArray = React.Children.toArray(processedChildren)
        return (
          <ol className={`space-y-2 list-none ${getTextColor(isDarkMode, 'muted')}`}>
            {childrenArray.map((child: any, index: number) => {
              // child가 이미 <li>인 경우 클론해서 className 추가
              if (React.isValidElement(child) && child.type === 'li') {
                const props = child.props as any
                return React.cloneElement(child, {
                  ...props,
                  key: child.key || index,
                  className: `flex ${props.className || ''}`,
                  children: (
                    <>
                      <span className="mr-2">{index + 1}.</span>
                      <span className="flex-1">{props.children}</span>
                    </>
                  )
                } as any)
              }
              // child가 <li>가 아닌 경우 (예외 처리)
              return (
                <li key={index} className="flex">
                  <span className="mr-2">{index + 1}.</span>
                  <span className="flex-1">{child}</span>
                </li>
              )
            })}
          </ol>
        )
      }
    }
  }), [isDarkMode, processChildrenWithLinks, urlFor])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-start md:items-center justify-center pt-[40vh] md:pt-0 ${getBgColor(isDarkMode)}`}>
        <img src={isDarkMode ? "/img/logo2-i.gif" : "/img/logo2.gif"} alt="글짜씨" className="w-32 lg:w-48" />
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
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${getBgColor(isDarkMode)}`}>
      <div className="h-full max-w-[1400px] mx-auto px-4 pt-2 pb-8 md:px-6 md:pt-5 md:pb-6">
        <div className="h-full grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 md:gap-16">

          {/* 왼쪽: 돌아가기 버튼 + 이전 아티클 */}
          <div className="hidden md:flex md:flex-col md:items-end md:justify-between md:h-full md:py-6">
            {/* 돌아가기 - 왼쪽 상단 고정 */}
            <div className="flex justify-end">
              <Link
                href="/"
                className={`flex flex-col items-end gap-1 hover:opacity-80 transition-colors group ${getTextColor(isDarkMode, 'muted')} ${getHoverTextColor(isDarkMode)}`}
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <div className="text-right">
                  <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-1`}>돌아가기</div>
                </div>
              </Link>
            </div>

            {/* 이전 아티클 - 왼쪽 하단 고정 */}
            <div className="flex justify-end">
              {article?.prevArticle ? (
                <Link
                  href={`/articles/${article.prevArticle.slug}`}
                  className={`flex flex-col items-end gap-1 hover:opacity-80 transition-colors group ${getTextColor(isDarkMode, 'muted')} ${getHoverTextColor(isDarkMode)}`}
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l-7 7 7 7" />
                  </svg>
                  <div className="text-right w-[180px]">
                    <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-2 text-right`}>{article.prevArticle.title}</div>
                  </div>
                </Link>
              ) : (
                <div className={`${TYPOGRAPHY.ui.navLink} text-right w-[180px] ${getTextColor(isDarkMode, 'subtle')}`}>
                  <br /> 이전 글 없음
                </div>
              )}
            </div>
          </div>

          {/* 중앙: 아티클 본문 */}
          <article className="max-w-[800px] mx-auto mt-6 w-full overflow-y-auto h-full scrollbar-hide">
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

            {/* 본문 - contentBlocks 우선, 없으면 기존 필드들 렌더링 */}
            <div className={`mb-8 md:mb-16 space-y-12 ${getTextColor(isDarkMode)}`}>
              {/* ✨ 통합 컨텐츠 블록 (순서 자유 배치) */}
              {article.contentBlocks && Array.isArray(article.contentBlocks) && article.contentBlocks.length > 0 ? (
                article.contentBlocks.map((block: any, blockIdx: number) => {
                  if (block.blockType === 'standard' && block.standardContent) {
                    return (
                      <div key={blockIdx}>
                        <PortableText
                          value={block.standardContent}
                          components={components}
                        />
                      </div>
                    )
                  } else if (block.blockType === 'responses' && block.responsesContent) {
                    return (
                      <div key={blockIdx} className="space-y-12">
                        {block.responsesContent.map((response: any, idx: number) => (
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
                                <PortableText
                                  value={response.content}
                                  components={components}
                                />
                              </div>
                            )}
                            {response.image && (
                              <div className="my-6 w-full">
                                <Image
                                  src={urlFor(response.image).url() || ''}
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
                                <PortableText
                                  value={response.references}
                                  components={components}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  } else if (block.blockType === 'interviewQA' && block.interviewQAContent) {
                    return (
                      <div key={blockIdx} className="space-y-12">
                        {block.interviewQAContent.map((qa: any, idx: number) => (
                          <div key={idx} className="space-y-6">
                            {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
                              <div className={getTextColor(isDarkMode)}>
                                <PortableText
                                  value={qa.question}
                                  components={components}
                                />
                              </div>
                            )}
                            <div className="space-y-4 pl-4">
                              {qa.answers && qa.answers.map((answer: any, ansIdx: number) => (
                                <div key={ansIdx} className="space-y-2">
                                  <div className={`${TYPOGRAPHY.ui.speaker}  ${getTextColor(isDarkMode, 'muted')}`}>
                                    {answer.person}
                                  </div>
                                  {answer.answer && Array.isArray(answer.answer) && answer.answer.length > 0 && (
                                    <div className={getTextColor(isDarkMode)}>
                                      <PortableText
                                        value={answer.answer}
                                        components={components}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  } else if (block.blockType === 'conversation' && block.conversationContent) {
                    return (
                      <div key={blockIdx} className="space-y-6">
                        {block.conversationContent.map((turn: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <div className={`${TYPOGRAPHY.ui.speaker}  ${getTextColor(isDarkMode, 'muted')}`}>
                              {turn.speaker}
                            </div>
                            {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
                              <div className={getTextColor(isDarkMode)}>
                                <PortableText
                                  value={turn.text}
                                  components={components}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  } else if (block.blockType === 'qaList' && block.qaListContent) {
                    return (
                      <div key={blockIdx} className="space-y-8">
                        {block.qaListContent.map((qa: any, idx: number) => (
                          <div key={idx} className="space-y-4">
                            {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
                              <div className={getTextColor(isDarkMode)}>
                                <PortableText
                                  value={qa.question}
                                  components={components}
                                />
                              </div>
                            )}
                            {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
                              <div className={getTextColor(isDarkMode)}>
                                <PortableText
                                  value={qa.answer}
                                  components={components}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                })
              ) : (
                <>
                  {/* 기존 필드들 (하위 호환성) */}
                  {/* 일반 본문 */}
                  {article.content && Array.isArray(article.content) && article.content.length > 0 && (
                    <div>
                      <PortableText
                        value={article.content}
                        components={components}
                      />
                    </div>
                  )}

                  {/* 응답 모음 */}
                  {article.responses && Array.isArray(article.responses) && article.responses.length > 0 && (
                <div className="space-y-12">
                  {article.responses.map((response: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
                        <span className={`font-bold ${TYPOGRAPHY.ui.speaker} mb-1 md:mb-0 ${getTextColor(isDarkMode, 'muted')}`}>
                          {response.year}
                        </span>
                        <div className={`flex items-center ${TYPOGRAPHY.ui.speaker} ${getTextColor(isDarkMode)}`}>
                          <span>{response.title} · {response.author }</span>
                        </div>
                      </div>
                      {response.content && Array.isArray(response.content) && response.content.length > 0 && (
                        <div className={getTextColor(isDarkMode)}>
                          <PortableText
                            value={response.content}
                            components={components}
                          />
                        </div>
                      )}
                      {response.image && (
                        <div className="my-6 w-full">
                          <Image
                            src={urlFor(response.image).url() || ''}
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
                        <div className={`ml-[10%] mt-8 mb-16 md:ml-[40%] md:mt-12 md:mb-24 ${getTextColor(isDarkMode)}`}>
                          <div className={`${getTextColor(isDarkMode)}`}>
                            {/* 섹션 제목 */}
                            <div className={`mb-4 ${TYPOGRAPHY.ui.referenceTitle} ${getTextColor(isDarkMode)}`}>
                              참고문헌
                            </div>
                            {/* 섹션 내용 */}
                            <div className={` ${getFootnoteClasses('text')} ${getTextColor(isDarkMode, 'muted')}`}>
                              <PortableText
                                value={response.references}
                                components={additionalSectionComponents}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 인터뷰 Q&A */}
              {article.interviewQA && Array.isArray(article.interviewQA) && article.interviewQA.length > 0 && (
                <div className="space-y-12">
                  {article.interviewQA.map((qa: any, idx: number) => (
                    <div key={idx} className="space-y-6">
                      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
                        <div className={getTextColor(isDarkMode)}>
                          <PortableText
                            value={qa.question}
                            components={components}
                          />
                        </div>
                      )}
                      <div className="space-y-4 pl-4">
                        {qa.answers && qa.answers.map((answer: any, ansIdx: number) => (
                          <div key={ansIdx} className="space-y-2">
                            <div className={`${TYPOGRAPHY.ui.speaker}  ${getTextColor(isDarkMode, 'muted')}`}>
                              {answer.person}
                            </div>
                            {answer.answer && Array.isArray(answer.answer) && answer.answer.length > 0 && (
                              <div className={getTextColor(isDarkMode)}>
                                <PortableText
                                  value={answer.answer}
                                  components={components}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 대화 */}
              {article.conversation && Array.isArray(article.conversation) && article.conversation.length > 0 && (
                <div className="space-y-6">
                  {article.conversation.map((turn: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className={`${TYPOGRAPHY.ui.speaker}  ${getTextColor(isDarkMode, 'muted')}`}>
                        {turn.speaker}
                      </div>
                      {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
                        <div className={getTextColor(isDarkMode)}>
                          <PortableText
                            value={turn.text}
                            components={components}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Q&A */}
              {article.qaList && Array.isArray(article.qaList) && article.qaList.length > 0 && (
                <div className="space-y-8">
                  {article.qaList.map((qa: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      {qa.question && Array.isArray(qa.question) && qa.question.length > 0 && (
                        <div className={`ml-[40%] 본문폰트-민부리 ${getTextColor(isDarkMode)}`}>
                          <PortableText
                            value={qa.question}
                            components={components}
                          />
                        </div>
                      )}
                      {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
                        <div className={`${getTextColor(isDarkMode)}`}>
                          <PortableText
                            value={qa.answer}
                            components={components}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* 추가 섹션 (참고문헌, 이미지 출처 등) */}
            {article.additionalSections && article.additionalSections.length > 0 && (
              <div className={`ml-[10%] mt-8 mb-16 md:ml-[40%] md:mt-12 md:mb-24 space-y-8 ${getTextColor(isDarkMode)}`}>
                {article.additionalSections.map((section: any, idx: number) => (
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

          {/* 오른쪽: 각주 세부 텍스트 (각주가 있을 때) + 다음 아티클 */}
          <aside className="hidden md:flex md:flex-col md:items-start md:h-full md:py-6">
            {/* 각주 세부 텍스트 - 오른쪽 상단 고정 (스크롤 가능) */}
            {hasFootnotesInContent && footnotesList.length > 0 && (
              <div className="w-[180px] mb-auto" style={{ maxHeight: 'calc(100vh - 20rem)', overflowY: 'auto' }}>
                <div className={`${getFootnoteClasses('text')} leading-relaxed text-left space-y-2 ${getTextColor(isDarkMode, 'muted')}`}>
                  {footnotesList.map((footnote, idx) => (
                    <div key={idx} className="mb-4">
                      <button
                        onClick={() => toggleFootnote(footnote.number)}
                        className={`mr-2 mb-1 cursor-pointer hover:opacity-70 transition-opacity ${getTextColor(isDarkMode, 'muted')}`}
                      >
                        [{footnote.number}]
                      </button>
                      {expandedFootnotes[footnote.number] && (
                        <>
                          <br />
                          <span>{renderTextWithLinks(footnote.text)}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 다음 아티클 - 오른쪽 하단 고정 (항상 하단에 위치) */}
            <div className="flex justify-start mt-auto">
              {article?.nextArticle ? (
                <Link
                  href={`/articles/${article.nextArticle.slug}`}
                  className={`group flex flex-col items-start gap-1 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5l7 7-7 7" />
                  </svg>
                  <div className="text-left w-[180px]">
                    <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-2`}>{article.nextArticle.title}</div>
                  </div>
                </Link>
              ) : (
                <div className={`${TYPOGRAPHY.ui.navLink} w-[180px] ${getTextColor(isDarkMode, 'subtle')}`}>
                  <br /> 다음 글 없음
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* 하단 고정 네비게이션 - 모바일만 */}
      {showNavigation && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg z-50 transition-colors duration-300 pb-1 ${getBgColor(isDarkMode)} ${getBorderColor(isDarkMode, 'light')}`}>
          <div className="max-w-[1400px] mx-auto px-5 py-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 이전 아티클 */}
              <div className="col-span-1">
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug}`}
                    className={`group flex items-center gap-1.5 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                  >
                    <svg
                      className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className={TYPOGRAPHY.ui.navLink}>이전</span>
                  </Link>
                ) : (
                  <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>이전 글 없음</div>
                )}
              </div>

              {/* 돌아가기 */}
              <div className="col-span-1 flex justify-center">
                <Link
                  href="/"
                  className={`flex items-center ${TYPOGRAPHY.ui.navLink} transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                >
                  돌아가기
                </Link>
              </div>

              {/* 다음 아티클 */}
              <div className="col-span-1 text-right">
                {article?.nextArticle ? (
                  <Link
                    href={`/articles/${article.nextArticle.slug}`}
                    className={`group flex items-center justify-end gap-1.5 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                  >
                    <span className={TYPOGRAPHY.ui.navLink}>다음</span>
                    <svg
                      className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                ) : (
                  <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>다음 글 없음</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 각주 팝업 */}
      {mobileFootnotePopup && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setMobileFootnotePopup(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-[90%] max-h-[80%] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X 버튼 - 왼쪽 상단 */}
            <button
              onClick={() => setMobileFootnotePopup(null)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity z-10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 각주 내용 */}
            <div className="p-6 pt-8">
              <div className={`${getFootnoteClasses('text')}`}>
                <span className="">[{mobileFootnotePopup.number}]</span>
                <div className="mt-2">
                  {renderTextWithLinks(mobileFootnotePopup.text)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}