'use client'

import { client, urlFor } from '@/lib/sanity'
import { articleQuery } from '@/lib/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Portable Text 컴포넌트 (본문 렌더링)
const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <figure style={{ margin: '3em 1em', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            style={{ maxHeight: '60vh', width: 'auto', borderRadius: '4px', }}
          />
          {value.caption && (
            <figcaption style={{
              fontFamily: 'AGCJHMS',
              marginTop: '12px',
              fontSize: '14px',
              color: '#666',
              textAlign: 'center'
            }}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    }
  },
  block: {
    h2: ({ children }: any) => (
      <h2 style={{
        fontFamily: 'AGCJHS',
        fontWeight: '600',
        fontSize: '1em',
        padding: '0 0',
        textIndent: '3em'
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{
        fontFamily: 'AGCJHS',
        fontWeight: '600',
        fontSize: '1em',
        padding: '1em 0',
      }}>
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 style={{
        fontFamily: 'AGCJHMS',
        fontSize: '0.95em',
        paddingTop: '1em',
      }}>
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 style={{
        fontFamily: 'AGCJHMS',
        fontSize: '.95em',
        margin: '2em 0',
        textIndent: '3em',
      }}>
        {children}
      </h5>
    ),
    h6: ({ children }: any) => (
      <h6 style={{
        fontFamily: 'AGCJHMS',
        fontSize: '.95em',
        // fontWeight: 'bold',
        lineHeight: '1.68',
        paddingTop: '2em',
        paddingBottom: '.5em',
        paddingLeft: '34%',
      }}>
        {children}
      </h6>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{
        lineHeight: '1.68',
        borderLeft: '0.4em solid black',
        paddingLeft: '1.5em',
        margin: '32px 0',
      }}>
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p style={{
        fontSize: '1em',
        lineHeight: '1.68',
        margin: '1.2em 0',
        color: '#333'
      }}>
        {children}
      </p>
    )
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a
          href={value.href}
          rel={rel}
          target={!value.href.startsWith('/') ? '_blank' : undefined}
          style={{ color: '#0066cc', textDecoration: 'underline' }}
        >
          {children}
        </a>
      )
    },
    footnote: ({ children, value }: any) => (
      <span
        title={value.text}
        style={{
          cursor: 'help',
          borderBottom: '1px dotted #0066cc',
          color: '#0066cc'
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

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ArticlePage({ params }: PageProps) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
      client.fetch(articleQuery, { slug: resolvedParams.slug }).then((data) => {
        setArticle(data)
        setLoading(false)
      })
    })
  }, [params])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src="/img/logo2.gif" alt="글짜씨" className="w-36 lg:w-40" />
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <p>아티클을 찾을 수 없습니다.</p>
        <Link href="./" style={{ color: '#0066cc' }}>
          돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <article style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px'
      }}>

        {/* 글짜씨 호수, 섹션 정보 */}

        <div
          style={{
            textAlign: 'left',
            fontSize: '14px',
            marginBottom: '.5em',
          }}
          className="각주폰트-민부리">
          {article.issue.number} · {article.section.title}
        </div>

        {/* 아티클 헤더 */}
        <header
          style={{ marginBottom: '3em' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">


          {/* 아티클 제목 */}
          <h1 style={{
            textAlign: 'left',
            fontSize: '1.8em',
            fontWeight: 'bold',
            lineHeight: '1.5',
            marginBottom: '24px',
          }}
            className="col-span-1">
            {article.title}
          </h1>

          {/* 저자 정보 */}
          <div
            className="col-span-1 md:self-start"
            style={{
              // paddingTop: '24px',
              // borderTop: '1px solid #000'
            }}>
            <p style={{
              textAlign: 'left',
              fontSize: '1.8em',
              fontWeight: 'bold',
              marginBottom: '1.5em'
            }}
              className="md:text-right">
              {article.author}
            </p>
          </div>

        </header>

        {/* 본문 */}
        <div style={{ marginBottom: '80px' }}>
          {article.content && article.content.length > 0 && (
            <PortableText
              value={article.content}
              components={components}
            />
          )}
        </div>

        {/* 참고문헌 */}
        {article?.references && Array.isArray(article.references) && article.references.length > 0 && (
          <section style={{
            marginTop: '80px',
            paddingLeft: '30%',
          }}>
            <h2
              style={{
                marginBottom: '4px'
              }}
              className="각주폰트-민부리">
              참고문헌
            </h2>
            <div style={{}} className="각주폰트-민부리">
              <PortableText
                value={article.references}
                components={components}
              />
            </div>
          </section>
        )}

        {/* 이미지 출처 */}
        {article?.imageSources && Array.isArray(article.imageSources) && article.imageSources.length > 0 && (
          <section style={{
            marginTop: '40px',
            paddingLeft: '30%',
          }}>
            <h2
              style={{
                marginBottom: '4px'
              }}
              className="각주폰트-민부리">
              이미지 출처
            </h2>
            <div style={{}} className="각주폰트-민부리">
              <PortableText
                value={article.imageSources}
                components={components}
              />
            </div>
          </section>
        )}
      </article>
    </div>
  )
}