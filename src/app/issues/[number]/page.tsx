'use client'

import { client } from '@/lib/sanity'
import { issueWithSectionsQuery, issuesListQuery } from '@/lib/queries'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PageProps {
  params: Promise<{ number: string }>
}

export default function IssuePage({ params }: PageProps) {
  const [issue, setIssue] = useState<any>(null)
  const [allIssues, setAllIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    params.then((resolvedParams) => {
      const issueNumber = parseInt(resolvedParams.number)
      
      Promise.all([
        client.fetch(issueWithSectionsQuery, { number: issueNumber }),
        client.fetch(issuesListQuery)
      ]).then(([issueData, issuesData]) => {
        setIssue(issueData)
        setAllIssues(issuesData)
        setLoading(false)
      })
    })
  }, [params])

  if (loading) {
    return (
      <img src="/img/logo2.gif" alt="글짜씨" className="min-h-screen flex items-center justify-center" />
      // <div className="min-h-screen flex items-center justify-center">
      //   로딩 중...
      // </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">호를 찾을 수 없습니다.</p>
          <Link href="/" className="text-blue-600 underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* 왼쪽: 메인 콘텐츠 */}
      <main className="flex-1 p-12 lg:p-20">
        {/* 상단 네비게이션 */}
        <div className="mb-12">
          <Link href="/" className=".본문폰트 text-gray-600 hover:text-black">
            ← 홈으로
          </Link>
        </div>

        {/* 호 제목 */}
        <div className="mb-16">
          <h1 className="text-sm font-bold mb-4">
            {issue.number}
          </h1>
          {issue.title && (
            <p className="text-sm text-gray-600">{issue.title}</p>
          )}
          <div className="w-12 h-1 bg-black mt-6"></div>
        </div>

        {/* 섹션별 아티클 */}
        <div className="max-w-3xl space-y-16">
          {Array.isArray(issue?.sections) && issue.sections.length > 0 ? (
            issue.sections.map((section: any) => (
              <section key={section._id}>
                <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">
                  {section.title}
                </h2>

                <div className="space-y-6">
                  {Array.isArray(section?.articles) && section.articles.length > 0 ? (
                    section.articles.map((article: any) => (
                      <Link
                        key={article._id}
                        href={`/articles/${article.slug.current}`}
                        className="block group"
                      >
                        <article className="border-l-4 border-gray-200 pl-6 py-2 hover:border-black transition-colors">
                          <h3 className="text-sm font-semibold mb-2 group-hover:text-blue-600">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {article.author}
                          </p>
                        </article>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">아티클이 없습니다.</p>
                  )}
                </div>
              </section>
            ))
          ) : (
            <p className="text-sm text-gray-500">섹션이 없습니다.</p>
          )}
        </div>
      </main>

      {/* 오른쪽: 사이드바 (데스크톱) */}
      <aside className="hidden lg:block w-80 p-12 sticky top-0 h-screen overflow-auto">

        {/* 호 목록 */}
        <div className="pt-6 border-t">
          {allIssues.map((item) => (
            <Link
              key={item._id}
              href={`/issues/${item.number}`}
              className={`block py-3 transition ${
                item.number === issue.number
                  ? 'font-bold text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <div className="text-sm">
                <div className="mb-1">{item.number}</div>
                <div className={item.number === issue.number ? 'text-black' : ''}>
                  {item.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* 모바일 햄버거 메뉴 */}
      <button
        className="lg:hidden fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="w-6 space-y-1.5">
          <div className="h-0.5 bg-black"></div>
          <div className="h-0.5 bg-black"></div>
          <div className="h-0.5 bg-black"></div>
        </div>
      </button>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 p-12 overflow-auto">
          <button
            className="absolute top-6 right-6 text-3xl font-light"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>

          <div className="mt-16">
            <div className="space-y-6">
              <div className="pt-6 border-t">
                {allIssues.map((item) => (
                  <Link
                    key={item._id}
                    href={`/issues/${item.number}`}
                    className="block py-3 border-b"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className={`font-bold mb-1 ${
                      item.number === issue.number ? 'text-black' : 'text-gray-600'
                    }`}>
                      {item.number}
                    </div>
                    <div className="text-gray-600 text-xs">{item.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}