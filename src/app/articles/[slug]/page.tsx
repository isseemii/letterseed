'use client'

import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import React, { useState, useEffect, useMemo } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

const articleWithNavigationQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    author,
    authorBio,
    articleType,
    introduction,
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
      slug
    },
    "prevArticle": *[
      _type == "article" && 
      issue._ref == ^.issue._ref && 
      order < ^.order
    ] | order(order desc)[0]{
      title,
      "slug": slug.current
    },
    "nextArticle": *[
      _type == "article" && 
      issue._ref == ^.issue._ref && 
      order > ^.order
    ] | order(order asc)[0]{
      title,
      "slug": slug.current
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

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
      client.fetch(articleWithNavigationQuery, { slug: resolvedParams.slug }).then((data) => {
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
            <img
              src={imageUrl}
              alt={value.alt || ''}
              className="w-full h-auto"
            />
            {value.caption && (
              <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {value.caption}
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
                  <img
                    src={imageUrl}
                    alt={image.alt || ''}
                    className="w-full h-auto"
                  />
                  {image.caption && (
                    <p className={`각주폰트-민부리 mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {image.caption}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    },
    block: {
      h2: ({ children }: any) => (
        <h2
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`본문폰트 indent-[2em] py-[0.2em] md:본문폰트 md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`본문폰트 indent-[2em] py-[0.2em] md:본문폰트 md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`본문폰트 indent-[2em] py-[0.2em] md:본문폰트 md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5
          className={`본문폰트-민부리 indent-[2em] py-[0.2em] md:본문폰트 md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6
          className={`본문폰트-민부리 py-[0.5em] md:본문폰트 md:py-[0.5em] pl-[40%] ${isDarkMode ? 'text-white' : 'text-black'}`}
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
            className={`본문폰트 my-0 md:본문폰트 md:my-[1.2em] ${isDarkMode ? 'text-white' : 'text-black'}`}
            style={{ lineHeight: '1.68' }}
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
          className={isDarkMode ? 'text-white' : 'text-black'}
        >
          {children}
        </blockquote>
      )
    },
    marks: {
      link: ({ children, value }: any) => {
        const rel = value?.href && !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
        return (
          <a
            href={value?.href || '#'}
            rel={rel}
            target={value?.href?.startsWith('/') ? '_self' : '_blank'}
            className={`${isDarkMode ? 'text-[#7CFC00]' : 'text-[#0066cc]'} underline`}
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
            style={{
              cursor: 'pointer',
              borderBottom: '1px dotted #0066cc',
              color: '#0066cc',
            }}
            className={isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'}
          >
            {children}
          </span>
        )
      },
      strong: ({ children }: any) => <strong className={isDarkMode ? 'text-white' : 'text-black'}>{children}</strong>,
      em: ({ children }: any) => <em className={isDarkMode ? 'text-white' : 'text-black'}>{children}</em>,
      underline: ({ children }: any) => <u className={isDarkMode ? 'text-white' : 'text-black'}>{children}</u>,
      sup: ({ children }: any) => <sup className={isDarkMode ? 'text-white' : 'text-black'}>{children}</sup>,
      sub: ({ children }: any) => <sub className={isDarkMode ? 'text-white' : 'text-black'}>{children}</sub>,
      indent: ({ children }: any) => (
        <span className={`inline-block pl-[2em] md:pl-[2em] ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {children}
        </span>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }} className={isDarkMode ? 'text-white' : 'text-black'}>
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }} className={isDarkMode ? 'text-white' : 'text-black'}>
          {children}
        </ol>
      )
    }
  }), [footnotesList, isDarkMode])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#171717]' : 'bg-white'}`}>
        <img src={isDarkMode ? "/img/logo2-i.gif" : "/img/logo2.gif"} alt="글짜씨" className="w-32 lg:w-40" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">아티클을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#171717]' : 'bg-white'}`}>
      <div className="h-full max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-16">
        <div className="h-full grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 md:gap-16">

          {/* 왼쪽: 돌아가기 버튼 + 이전 아티클 */}
          <div className="hidden md:flex md:flex-col md:items-end md:justify-between md:h-full md:py-6">
            {/* 돌아가기 - 왼쪽 상단 고정 */}
            <div className="flex justify-end">
              <Link
                href="/"
                className={`flex flex-col items-end gap-1 hover:opacity-80 transition-colors group ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <div className="text-sm text-right">
                  <div className="각주폰트-민부리 line-clamp-1">돌아가기</div>
                </div>
              </Link>
            </div>

            {/* 이전 아티클 - 왼쪽 하단 고정 */}
            <div className="flex justify-end">
              {article?.prevArticle ? (
                <Link
                  href={`/articles/${article.prevArticle.slug}`}
                  className={`flex flex-col items-end gap-1 hover:opacity-80 transition-colors group ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}
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
                  <div className="text-sm text-right w-[180px]">
                    <div className="각주폰트-민부리 line-clamp-2 text-right">{article.prevArticle.title}</div>
                  </div>
                </Link>
              ) : (
                <div className={`각주폰트-민부리 text-right w-[180px] ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <br /> 이전 글 없음
                </div>
              )}
            </div>
          </div>

          {/* 중앙: 아티클 본문 */}
          <article className="max-w-[800px] mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            {/* 호수, 섹션 */}
            <div className={`text-center md:text-left mb-1 각주폰트-민부리 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {article.issue.number} · {article.section.title}
            </div>

            {/* 제목과 저자 - 데스크톱에서 두 단으로 */}
            <div className="mb-6 md:mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                {/* 제목 - 왼쪽 */}
                <h1 className={`text-center mb-4 md:text-left text-[1em] md:text-[1.8em] 본문폰트 font-bold leading-[1.5] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {article.title}
                </h1>

                {/* 저자 - 오른쪽 */}
                <div className={`text-center md:text-right text-[1em] md:text-[1.8em] 본문폰트 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {article.author}
                </div>
              </div>
            </div>

            {/* 개괄글/서론 (모든 타입 공통) */}
            {article.introduction && Array.isArray(article.introduction) && article.introduction.length > 0 && (
              <div className={`mb-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <PortableText
                  value={article.introduction}
                  components={components}
                />
              </div>
            )}

            {/* 본문 - 모든 타입 렌더링 (값이 있으면 표시) */}
            <div className={`mb-16 md:mb-20 space-y-12 ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                      <div className="flex items-baseline gap-4">
                        <span className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {response.year}
                        </span>
                        <h3 className={`본문폰트 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {response.title}
                        </h3>
                        {response.author && (
                          <span className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {response.author}
                          </span>
                        )}
                      </div>
                      {response.content && Array.isArray(response.content) && response.content.length > 0 && (
                        <div className={isDarkMode ? 'text-white' : 'text-black'}>
                          <PortableText
                            value={response.content}
                            components={components}
                          />
                        </div>
                      )}
                      {response.image && (
                        <div className="my-6">
                          <img
                            src={urlFor(response.image).url() || ''}
                            alt={response.image.alt || ''}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      {response.references && Array.isArray(response.references) && response.references.length > 0 && (
                        <div className={`각주폰트-민부리 text-sm mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="font-bold mb-2">참고문헌</div>
                          <PortableText
                            value={response.references}
                            components={components}
                          />
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
                        <div className={isDarkMode ? 'text-white' : 'text-black'}>
                          <PortableText
                            value={qa.question}
                            components={components}
                          />
                        </div>
                      )}
                      <div className="space-y-4 pl-4">
                        {qa.answers && qa.answers.map((answer: any, ansIdx: number) => (
                          <div key={ansIdx} className="space-y-2">
                            <div className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {answer.person}
                            </div>
                            {answer.answer && Array.isArray(answer.answer) && answer.answer.length > 0 && (
                              <div className={isDarkMode ? 'text-white' : 'text-black'}>
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
                      <div className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {turn.speaker}
                      </div>
                      {turn.text && Array.isArray(turn.text) && turn.text.length > 0 && (
                        <div className={isDarkMode ? 'text-white' : 'text-black'}>
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
                        <div className={isDarkMode ? 'text-white' : 'text-black'}>
                          <PortableText
                            value={qa.question}
                            components={components}
                          />
                        </div>
                      )}
                      {qa.answer && Array.isArray(qa.answer) && qa.answer.length > 0 && (
                        <div className={isDarkMode ? 'text-white' : 'text-black'}>
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
            </div>

            {/* 추가 섹션 (참고문헌, 이미지 출처 등) */}
            {article.additionalSections && article.additionalSections.length > 0 && (
              <div className={`mt-12 space-y-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {article.additionalSections.map((section: any, idx: number) => (
                  <div key={idx} className={`pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    {/* 섹션 제목 */}
                    <h3 className={`text-lg font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {section.title}
                    </h3>

                    {/* 섹션 내용 */}
                    <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <PortableText value={section.content} components={components} />
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
                <div className={`각주폰트-민부리 leading-relaxed text-left space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {footnotesList.map((footnote, idx) => (
                    <div key={idx} className="mb-3">
                      <button
                        onClick={() => toggleFootnote(footnote.number)}
                        className={`mr-2 cursor-pointer hover:opacity-70 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        [{footnote.number}]
                      </button>
                      {expandedFootnotes[footnote.number] && (
                        <>
                          <br />
                          <span>{footnote.text}</span>
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
                  className={`group flex flex-col items-start gap-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
                  <div className="text-sm text-left w-[180px]">
                    <div className="각주폰트-민부리 line-clamp-2">{article.nextArticle.title}</div>
                  </div>
                </Link>
              ) : (
                <div className={`각주폰트-민부리 w-[180px] ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <br /> 다음 글 없음
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* 하단 고정 네비게이션 - 모바일만 */}
      {showNavigation && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg z-50 transition-colors duration-300 pb-1 ${isDarkMode ? 'bg-[#171717] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-[1400px] mx-auto px-5 py-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 이전 아티클 */}
              <div className="col-span-1">
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug}`}
                    className={`group flex items-center gap-1.5 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <svg
                      className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="각주폰트-민부리 text-xs">이전</span>
                  </Link>
                ) : (
                  <div className={`각주폰트-민부리 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>이전 글 없음</div>
                )}
              </div>

              {/* 돌아가기 */}
              <div className="col-span-1 flex justify-center">
                <Link
                  href="/"
                  className={`flex items-center 각주폰트-민부리 text-xs transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  돌아가기
                </Link>
              </div>

              {/* 다음 아티클 */}
              <div className="col-span-1 text-right">
                {article?.nextArticle ? (
                  <Link
                    href={`/articles/${article.nextArticle.slug}`}
                    className={`group flex items-center justify-end gap-1.5 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <span className="각주폰트-민부리 text-xs">다음</span>
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
                  <div className={`각주폰트-민부리 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>다음 글 없음</div>
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
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-black hover:opacity-70 transition-opacity z-10"
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
              <div className="각주폰트-민부리 text-black">
                <span className="font-bold">[{mobileFootnotePopup.number}]</span>
                <div className="mt-1 leading-relaxed">
                  {mobileFootnotePopup.text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}