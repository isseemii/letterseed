'use client'

import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function ArticleClient({ article }: { article: any }) {
  const [activeFootnote, setActiveFootnote] = useState<string | null>(null)
  const [showNavigation, setShowNavigation] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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

  // article 데이터 검증
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">아티클을 찾을 수 없습니다.</p>
      </div>
    )
  }

  // PortableText 컴포넌트 설정
  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?.url) return null
        return (
          <div className="my-8">
            <img
              src={value.asset.url}
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
            {value.images.map((image: any, index: number) => (
              <div key={index}>
                {image.asset?.url && (
                  <img
                    src={image.asset.url}
                    alt={image.alt || ''}
                    className="w-full h-auto"
                  />
                )}
                {image.caption && (
                  <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      }
    },
    block: {
      h2: ({ children }: any) => (
        <h2
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className={`text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em] ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          {children}
        </h6>
      ),
      normal: ({ children }: any) => (
        <p
          className={`text-[0.7em] my-0 md:text-[1em] md:my-[1.2em] ${isDarkMode ? 'text-white' : 'text-black'}`}
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
      footnote: ({ children, value }: any) => (
        <span
          onClick={() => setActiveFootnote(value?.text || '')}
          style={{
            cursor: 'help',
            borderBottom: '1px dotted #0066cc',
            color: '#0066cc',
          }}
          className={isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'}
        >
          {children}
        </span>
      ),
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
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#171717]' : 'bg-white'}`}>
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 md:gap-8">

          {/* 왼쪽: 돌아가기 버튼 + 이전 아티클 */}
          <div className="hidden md:flex flex-col items-start sticky top-16 h-fit space-y-6">
            {showNavigation && (
              <Link
                href="/"
                className={`hidden md:flex items-center gap-1.5 hover:opacity-80 transition-colors group ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="각주폰트-민부리">돌아가기</span>
              </Link>
            )}

            {showNavigation && (
              <div className="flex flex-col items-end gap-1" style={{ marginTop: 'calc(100vh - 12rem)' }}>
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug}`}
                    className={`group flex flex-col items-end gap-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
                    <div className="text-sm text-right">
                      <div className="각주폰트-민부리 line-clamp-1">{article.prevArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}>이전 글 없음</div>
                )}
              </div>
            )}
          </div>

          {/* 중앙: 아티클 본문 */}
          <article className="max-w-[800px]">
            {/* 호수, 섹션 */}
            <div className={`text-center md:text-left 각주폰트-민부리 md:mb-1 각주폰트-민부리 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {article.issue.number} · {article.section.title}
            </div>

            {/* 제목 */}
            <h1 className={`text-center md:text-left col-span-1 text-[1em] md:text-[1.8em] font-bold leading-[1.5] md:mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {article.title}
            </h1>

            {/* 저자 */}
            <div className={`text-center md:text-left 각주폰트-민부리 mb-8 md:mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {article.author}
            </div>

            {/* 본문 */}
            <div className={`mb-16 md:mb-20 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {article.content ? (
                <PortableText value={article.content} components={components} />
              ) : (
                <p className="text-gray-500">콘텐츠를 불러올 수 없습니다.</p>
              )}
            </div>

            {/* 참고문헌 */}
            {article.references && article.references.length > 0 && (
              <section className="mb-16 md:mb-20">
                <h2 className={`각주폰트-민부리 font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  참고문헌
                </h2>
                <div className={`각주폰트-민부리 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {article.references.map((ref: string, index: number) => (
                    <p key={index} className="mb-2">
                      {ref}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* 각주 모달 */}
            {activeFootnote && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`max-w-md mx-4 p-6 rounded-lg ${isDarkMode ? 'bg-[#171717] text-white' : 'bg-white text-black'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="각주폰트-민부리 font-bold">각주</h3>
                    <button
                      onClick={() => setActiveFootnote(null)}
                      className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="각주폰트-민부리 text-sm leading-relaxed">
                    {activeFootnote}
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* 오른쪽: 다음 아티클 */}
          <aside className="hidden md:block sticky top-16 h-fit">
            <div className="">
              <div></div>
            </div>

            {/* 다음 아티클 */}
            {showNavigation && (
              <div className="flex flex-col items-end gap-1" style={{ marginTop: 'calc(100vh - 9.3rem)' }}>
                {article?.nextArticle ? (
                  <Link
                    href={`/articles/${article.nextArticle.slug}`}
                    className={`group flex flex-col items-end gap-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
                  <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`}>다음 글 없음</div>
                )}
              </div>
            )}
          </aside>

        </div>
      </div>

      {/* 하단 고정 네비게이션 - 모바일만 */}
      {showNavigation && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg z-50 transition-colors duration-300 ${isDarkMode ? 'bg-[#171717] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-[1400px] mx-auto px-3 py-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 이전 아티클 */}
              <div className="col-span-1">
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug}`}
                    className={`group flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <svg
                      className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
                    className={`group flex items-center justify-end gap-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <span className="각주폰트-민부리 text-xs">다음</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                ) : (
                  <div className={`각주폰트-민부리 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>다음 글 없음</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}