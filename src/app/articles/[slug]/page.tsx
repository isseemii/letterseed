'use client'

import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Sanity Query
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
      title
    },
    "section": section->{
      _id,
      title,
      slug
    },
    "prevArticle": *[
      _type == "article" && 
      section._ref == ^.section._ref && 
      order < ^.order
    ] | order(order desc)[0]{
      title,
      slug
    },
    "nextArticle": *[
      _type == "article" && 
      section._ref == ^.section._ref && 
      order > ^.order
    ] | order(order asc)[0]{
      title,
      slug
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
  const [activeFootnote, setActiveFootnote] = useState<string | null>(null)
  const [showBottomNav, setShowBottomNav] = useState(false)
  const [lastScrollTime, setLastScrollTime] = useState(Date.now())

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
      client.fetch(articleWithNavigationQuery, { slug: resolvedParams.slug }).then((data) => {
        setArticle(data)
        setLoading(false)
      })
    })
  }, [params])

  // 스크롤 감지 및 하단 네비게이션 표시/숨김
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout

    const handleScroll = () => {
      setLastScrollTime(Date.now())
      setShowBottomNav(false)

      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        if (Date.now() - lastScrollTime >= 1000) {
          setShowBottomNav(true)
        }
      }, 1000)
    }

    window.addEventListener('scroll', handleScroll)

    // 초기 3초 후 표시
    const initialTimer = setTimeout(() => {
      setShowBottomNav(true)
    }, 1000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer)
      clearTimeout(initialTimer)
    }
  }, [lastScrollTime])

  // Portable Text Components
  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) return null
        return (
          <figure className="my-1 md:my-12 flex flex-col items-center md:mx-4">
            <img
              src={urlFor(value).width(800).url()}
              alt={value.alt || ''}
              className="max-h-[50vh] md:max-h-[60vh] w-auto"
            />
            {value.caption && (
              <figcaption
                className="text-[0.5em] mb-3 mt-2 md:text-sm text-gray-600 text-center md:mt-4"
                style={{ fontFamily: 'AGCJHMS' }}
              >
                {value.caption}
              </figcaption>
            )}
          </figure>
        )
      },

      imageGrid: ({ value }: any) => {
        const columns = value.columns || 2
        const gridClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns]
        return (
          <figure className="my-8 md:my-12">
            <div className={`grid ${gridClass} gap-4`}>
              {value.images?.map((img: any, idx: number) => (
                <div key={idx}>
                  <img src={urlFor(img).width(600).url()} alt={img.alt || ''} className="w-full rounded-lg" />
                  {img.caption && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1" style={{ fontFamily: 'AGCJHMS' }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {value.gridCaption && (
              <figcaption className="text-sm text-gray-600 text-center mt-4" style={{ fontFamily: 'AGCJHMS' }}>
                {value.gridCaption}
              </figcaption>
            )}
          </figure>
        )
      },

      imageSlider: ({ value }: any) => {
        return (
          <figure className="my-8 md:my-12">
            <div className="overflow-x-auto flex gap-4 snap-x snap-mandatory">
              {value.images?.map((img: any, idx: number) => (
                <div key={idx} className="flex-shrink-0 w-full snap-center">
                  <img src={urlFor(img).width(800).url()} alt={img.alt || ''} className="w-full rounded-lg" />
                  {img.caption && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1" style={{ fontFamily: 'AGCJHMS' }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {value.sliderCaption && (
              <figcaption className="text-sm text-gray-600 text-center mt-4" style={{ fontFamily: 'AGCJHMS' }}>
                {value.sliderCaption}
              </figcaption>
            )}
          </figure>
        )
      },
    },

    block: {
      h2: ({ children }: any) => (
        <h2
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className="text-[0.7em] indent-[2em] py-[0.2em] md:text-[1em] md:indent-[2em] md:py-[0.5em]"
        >
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3
          style={{ fontFamily: 'AGCJHS', fontWeight: '600' }}
          className="text-[0.7em] py-[0.2em] md:text-[1em] md:py-[0.5em]"
        >
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4
          style={{ fontFamily: 'AGCJHMS' }}
          className="text-[0.7em] py-[0.2em] md:text-[1em] md:py-[0.5em]"
        >
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5
          style={{ fontFamily: 'AGCJHMS' }}
          className="text-[0.7em] indent-[2em] pt-[0.2em] pb-[0em] md:text-[1em] md:indent-[3em] md:py-[0.5em]"
        >
          {children}
        </h5>
      ),
      h6: ({ children }: any) => (
        <h6
          style={{
            fontFamily: 'AGCJHMS',
            fontSize: '0.95em',
            lineHeight: '1.68',
            paddingTop: '2em',
            paddingBottom: '0.5em',
          }}
          className="pl-[10%] px-0 md:pl-[34%] md:px-4"
        >
          {children}
        </h6>
      ),
      normal: ({ children }: any) => (
        <p
          className="text-[0.7em] my-0 md:text-[1em] md:my-[1.2em]"
          style={{ lineHeight: '1.68', color: '#333' }}
        >
          {children}
        </p>
      ),
      blockquote: ({ children }: any) => (
        <blockquote
          style={{
            lineHeight: '1.68',
            borderLeft: '0.4em solid black',
            paddingLeft: '1.5em',
            margin: '32px 0',
          }}
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
            style={{ color: '#0066cc', textDecoration: 'underline' }}
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
        >
          {children}
        </span>
      ),

      strong: ({ children }: any) => <strong>{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
      underline: ({ children }: any) => <u>{children}</u>,
      sup: ({ children }: any) => <sup>{children}</sup>,
      sub: ({ children }: any) => <sub>{children}</sub>,

      indent: ({ children }: any) => (
        <span className="inline-block pl-[2em] md:pl-[2em]">
          {children}
        </span>
      ),
    },

    list: {
      bullet: ({ children }: any) => (
        <ul style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }}>
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol style={{ marginLeft: '24px', marginTop: '16px', marginBottom: '16px' }}>
          {children}
        </ol>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src="/img/logo2.gif" alt="글짜씨" className="w-36 lg:w-40" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-5">
        <p>아티클을 찾을 수 없습니다.</p>
        <Link href="/" style={{ color: '#0066cc' }}>
          돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 md:gap-8">

          {/* 왼쪽: 돌아가기 버튼 + 이전 아티클 */}
          <div className="hidden md:flex flex-col items-end sticky top-16 h-fit space-y-6">

            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-800 hidden hover:text-black transition-colors group"
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

            {showBottomNav && (
              <div className="flex flex-col items-end gap-1" style={{ marginTop: 'calc(100vh - 9.3rem)' }}>
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug.current}`}
                    className="group flex flex-col items-end gap-1 text-gray-600 hover:text-gray-900"
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
                      {/* <div className="text-xs text-gray-400">이전 글</div> */}
                      <div className="각주폰트-민부리 line-clamp-1">{article.prevArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-gray-300 각주폰트-민부리">이전 글 없음</div>
                )}
              </div>
            )}
          </div>

          {/* 중앙: 아티클 본문 */}
          <article className="max-w-[800px]">

            {/* 모바일 돌아가기 */}
            <div className="md:hidden mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-800 hover:text-black"
              >
                <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="각주폰트-민부리">돌아가기</span>
              </Link>
            </div>


            {/* 호수, 섹션 */}
            <div className="text-center md:text-left 각주폰트-민부리 md:mb-1 각주폰트-민부리">
              {article.issue.number} · {article.section.title}
            </div>

            {/* 헤더 */}
            <header className="mb-8 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 items-start">
              <h1 className="text-center md:text-left col-span-1 text-[1em] md:text-[1.8em] font-bold leading-[1.5] md:mb-6">
                {article.title}
              </h1>
              {/* ✨ author가 있을 때만 표시 */}
              {article.author && (
                <div className="col-span-1 md:self-start">
                  <p className="text-center md:text-left text-[1em] md:text-[1.8em] font-bold md:mb-6">
                    {article.author}
                  </p>
                </div>
              )}
            </header>

            {/* 본문 */}
            <div className="mb-16 md:mb-20">
              {article.content && article.content.length > 0 && (
                <PortableText value={article.content} components={components} />
              )}
            </div>

            {/* 참고문헌 */}
            {article?.references && Array.isArray(article.references) && article.references.length > 0 && (
              <section className="mt-16 md:mt-20 pl-[10%] md:pl-[30%]">
                <h2 className="mb-1 각주폰트-민부리">참고문헌</h2>
                <div className="각주폰트-민부리">
                  <PortableText value={article.references} components={components} />
                </div>
              </section>
            )}

            {/* 이미지 출처 */}
            {article?.imageSources && Array.isArray(article.imageSources) && article.imageSources.length > 0 && (
              <section className="mt-10 md:mt-10 pl-[10%] md:pl-[30%]">
                <h2 className="mb-1 각주폰트-민부리">이미지 출처</h2>
                <div className="각주폰트-민부리">
                  <PortableText value={article.imageSources} components={components} />
                </div>
              </section>
            )}

          </article>

          {/* 오른쪽: 주석 + 다음 아티클 */}
          <aside className="hidden md:block sticky top-16 h-fit">
            <div className="">
              {/* 주석 */}
              <div>
                {activeFootnote && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {/* <h3 className="text-sm font-bold text-gray-900">주석</h3> */}
                      <button
                        onClick={() => setActiveFootnote(null)}
                        className=""
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="각주폰트-민부리 leading-relaxed">
                      {activeFootnote}
                    </p>
                  </div>
                )}
              </div>

              {/* 다음 아티클 */}
              {showBottomNav && (
                <div className="flex flex-col items-start gap-1" style={{ marginTop: 'calc(100vh - 9.3rem)' }}>
                  {article?.nextArticle ? (
                    <Link
                      href={`/articles/${article.nextArticle.slug.current}`}
                      className="group flex flex-col items-start gap-1 text-gray-600 hover:text-gray-900"
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
                        {/* <div className="text-xs text-gray-400">다음 글</div> */}
                        <div className="각주폰트-민부리 line-clamp-1">{article.nextArticle.title}</div>
                      </div>
                    </Link>
                  ) : (
                    <div className="text-gray-300 각주폰트-민부리">다음 글 없음</div>
                  )}
                </div>
              )}

            </div>
          </aside>

        </div>
      </div>

      {/* 하단 고정 네비게이션 - 모바일만 */}
      {showBottomNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-[1400px] mx-auto px-3 py-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 이전 아티클 */}
              <div className="col-span-1">
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug.current}`}
                    className="group flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg
                      className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <div className="각주폰트-민부리">
                      <div className="각주폰트-민부리 text-gray-400">이전 글</div>
                      <div className="각주폰트-민부리 line-clamp-1">{article.prevArticle.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="각주폰트-민부리 text-gray-300">이전 글 없음</div>
                )}
              </div>

              {/* 돌아가기 */}
              <div className="col-span-1 flex justify-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span className="각주폰트-민부리 font-medium">돌아가기</span>
                </Link>
              </div>

              {/* 다음 아티클 */}
              <div className="col-span-1 flex justify-end">
                {article?.nextArticle ? (
                  <Link
                    href={`/articles/${article.nextArticle.slug.current}`}
                    className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 text-right"
                  >
                    <div className="text-sm">
                      <div className="각주폰트-민부리 text-gray-400">다음 글</div>
                      <div className="각주폰트-민부리 line-clamp-1">{article.nextArticle.title}</div>
                    </div>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="각주폰트-민부리 text-gray-300">다음 글 없음</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 주석 오버레이 */}
      {activeFootnote && (
        <div className="md:hidden fixed inset-0 bg-white/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setActiveFootnote(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="각주폰트-민부리 text-gray-700 leading-relaxed">
              {activeFootnote}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}