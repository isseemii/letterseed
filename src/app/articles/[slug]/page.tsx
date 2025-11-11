'use client'

import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
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
    content,
    references,
    imageSources,
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

  const hasFootnotesInContent = article?.content ? hasFootnotes(article.content) : false
  const footnotesList = article?.content ? extractFootnotes(article.content) : []

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
      normal: ({ children }: any) => (
        <p
          className={`본문폰트 my-0 md:본문폰트 md:my-[1.2em] ${isDarkMode ? 'text-white' : 'text-black'}`}
          style={{ lineHeight: '1.68' }}
        >
          {children}
        </p>
      ),
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#171717]' : 'bg-white'}`}>
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 md:gap-16">

          {/* 왼쪽: 돌아가기 버튼 + 이전 아티클 */}
          <div className="hidden md:block relative">
            {/* 돌아가기 - 고정 위치 */}
            {showNavigation && (
              <div className="sticky top-16">
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
            )}

            {/* 이전 아티클 - 고정 위치 (다음 아티클과 같은 높이) */}
            {showNavigation && (
              <div className="sticky flex justify-end" style={{ top: 'calc(100vh - 7rem)' }}>
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
                    <div className="text-sm text-right w-full">
                      <div className="각주폰트-민부리 line-clamp-1 text-right">{article.prevArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className={`각주폰트-민부리 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}><br /> 이전 글 없음</div>
                )}
              </div>
            )}
          </div>

          {/* 중앙: 아티클 본문 */}
          <article className="max-w-[800px] mx-auto w-full">
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

            {/* 본문 */}
            <div className={`mb-16 md:mb-20 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {article.content && Array.isArray(article.content) && article.content.length > 0 ? (
                <PortableText
                  value={article.content}
                  components={components}
                />
              ) : article.content && !Array.isArray(article.content) ? (
                <PortableText
                  value={[article.content]}
                  components={components}
                />
              ) : (
                <p className="text-gray-500">콘텐츠를 불러올 수 없습니다.</p>
              )}
            </div>

            {/* 참고문헌 - 데스크톱: 각주가 없을 때만 본문에 표시 */}
            {article.references && article.references.length > 0 && !hasFootnotesInContent && (
              <section className="mb-16 md:mb-20">
                <h2 className={`각주폰트-민부리 font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  참고문헌
                </h2>
                <div className={`각주폰트-민부리 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <PortableText value={article.references} components={components} />
                </div>
              </section>
            )}


          </article>

          {/* 오른쪽: 각주 세부 텍스트 (각주가 있을 때) + 다음 아티클 */}
          <aside className="hidden md:block relative">
            {/* 각주 세부 텍스트 - 데스크톱: 각주가 있을 때만 사이드바에 표시 (고정 위치) */}
            {hasFootnotesInContent && footnotesList.length > 0 && (
              <div className="sticky top-16" style={{ maxHeight: 'calc(100vh - 20rem)', overflowY: 'auto' }}>
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

            {/* 다음 아티클 - 고정 위치 (이전 아티클과 같은 높이) */}
            {showNavigation && (
              <div className="sticky" style={{ top: 'calc(100vh - 7rem)' }}>
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
                    <div className="text-sm text-left">
                      <div className="각주폰트-민부리 line-clamp-1">{article.nextArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}><br /> 다음 글 없음</div>
                )}
              </div>
            )}
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