'use client'

import { useDarkMode } from '@/contexts/DarkModeContext'
import Link from 'next/link'
import { useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

const builder = imageUrlBuilder(client as any)
const urlFor = (source: any) => builder.image(source).url()

export default function HomeClient({ initialIssues }: { initialIssues: any[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [expandedCredits, setExpandedCredits] = useState<{ [key: string]: boolean }>({})
  // Subsection 토글 상태 추가
  const [expandedSubsections, setExpandedSubsections] = useState<{ [key: string]: boolean }>({})
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const issues = initialIssues

  // 후원/파트너 이미지 크기 클래스명
  const sponsorImageClassName = "w-36 lg:w-40"

  // 크레딧 토글 함수
  const toggleCredits = (issueId: string) => {
    setExpandedCredits(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }))
  }

  // Subsection 토글 함수
  const toggleSubsection = (sectionId: string) => {
    setExpandedSubsections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Portable Text Components for Credits
  const creditsComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
          {children}
        </p>
      ),
    },
  }

  // 아티클에서 미리보기용 이미지 URL 하나 무작위로 고르는 함수
  const pickRandomImageUrl = (article: any): string | null => {
    const urls: string[] = []

    // 1) article.images 배열
    if (Array.isArray(article?.images)) {
      for (const img of article.images) {
        const direct = img?.url || img?.asset?.url
        if (typeof direct === 'string') {
          urls.push(direct)
          continue
        }
        const ref = img?.asset?._ref || img?._ref
        if (typeof ref === 'string') {
          urls.push(urlFor({ _type: 'image', asset: { _ref: ref } }))
        }
      }
    }

    // 2) Portable Text body 안의 image 블록
    if (Array.isArray(article?.body)) {
      for (const block of article.body) {
        if (block?._type === 'image') {
          const direct = block?.asset?.url
          if (typeof direct === 'string') {
            urls.push(direct)
            continue
          }
          const ref = block?.asset?._ref || block?._ref
          if (typeof ref === 'string') {
            urls.push(urlFor({ _type: 'image', asset: { _ref: ref } }))
          }
        }
      }
    }

    // 2-1) Portable Text content 안의 image 블록
    if (Array.isArray(article?.content)) {
      for (const block of article.content) {
        if (block?._type === 'image') {
          const direct = block?.asset?.url
          if (typeof direct === 'string') {
            urls.push(direct)
            continue
          }
          const ref = block?.asset?._ref || block?._ref
          if (typeof ref === 'string') {
            urls.push(urlFor({ _type: 'image', asset: { _ref: ref } }))
          }
        }
      }
    }

    // 3) 썸네일 필드
    const thumbDirect = article?.thumbnail?.url || article?.thumbnail?.asset?.url
    if (typeof thumbDirect === 'string') {
      urls.push(thumbDirect)
    } else {
      const thumbRef = article?.thumbnail?.asset?._ref || article?.thumbnail?._ref
      if (typeof thumbRef === 'string') {
        urls.push(urlFor({ _type: 'image', asset: { _ref: thumbRef } }))
      }
    }

    if (urls.length === 0) {
      return null
    }

    const i = Math.floor(Math.random() * urls.length)
    return urls[i]
  }

  const toggleIssue = (issueId: string) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#171717]' : 'bg-white'}`}>
      <div className="w-full lg:w-5/6 mx-auto">

        {/* ========================================
            📱 모바일 레이아웃
        ======================================== */}
        <div className="lg:hidden px-4">
          {/* 로고 & 다크모드 버튼 */}
          <div className="pt-8 pb-6 flex justify-between items-top">
            <Link href="/">
              <img src={isDarkMode ? "/img/logo2-i.gif" : "/img/logo2.gif"} alt="글짜씨" className="w-32 cursor-pointer" />
            </Link>

            <button
              onClick={toggleDarkMode}
              className={`w-6 h-6 flex items-center justify-center gap-2 transition-colors`}
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* 상단 소개글 */}
          <div className={`space-y-4 본문폰트 pb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <p>
              2024년 임기를 시작한 제8대 한국타이포그래피학회는 디지털 환경에서의 타이포그래피를 둘러싼 현상과 실천 등을 살펴보며 디지털 타이포그래피의 정체성을 탐구한다. 이에 대한 연장선으로 제8대 한국타이포그래피학회는 글짜씨를 통해 디지털 환경 속의 타이포그래피를 실험하고 이를 웹을 통해 공유하는 프로젝트를 진행한다.
            </p>
            <p>
              『글짜씨』는 2009년에 창간해 지난 15년간 학회 구성원과 국내외 타이포그래피 연구자, 디자이너의 연구 성과를 기록한 학회 학술지다. 학술지는 연구 분야의 연구 및 활동을 공유하는 창으로 기능한다. 이러한 학회와 학술지의 가치는 웹의 기본정신인 공개와 공유와도 맞닿아 있다는 점에서도 『글짜씨』 웹 버전의 의미를 찾을 수 있다.
            </p>
            <p>
              글짜씨는 웹 브라우저 내에서의 읽기 환경을 고려해 『글짜씨』를 발췌 출판한 실험 사이트이다. 현존하는 디지털 읽기 환경의 아쉬운 점을 보완해 디지털 환경에서의 한글 읽기 경험을 실험하고자 했으며, 『글짜씨』의 일부 내용을 포함하지 않고 있다.
            </p>
          </div>

          <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

          {/* 호별 아코디언 목차 */}
          <div className="">
            {issues.map((issue, idx) => (
              <div key={issue._id}>
                <button
                  onClick={() => toggleIssue(issue._id)}
                  className={`w-full py-3 flex justify-between items-center text-left ${isDarkMode ? 'text-white' : 'text-black'}`}
                >
                  <div>
                    <span className="본문폰트-민부리 font-bold mr-2">{issue.number}호</span>
                    <span className="본문폰트">{issue.title}</span>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedIssue === issue._id
                      ? 'max-h-[5000px] opacity-100'
                      : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="pb-4 pl-11 space-y-6">
                    {issue.sections && issue.sections.length > 0 ? (
                      <div className="space-y-4">
                        {issue.sections.map((section: any, sectionIdx: number) => (
                          <div key={`${issue._id}-${section._id || sectionIdx}`} className="pt-2 space-y-2">
                            {/* 섹션 제목 */}
                            <p className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {section.title}
                            </p>

                            <div className="space-y-2">
                              {/* 26호는 아티클 먼저, 다른 호는 하위섹션 먼저 */}
                              {issue.number === 26 ? (
                                <>
                                  {/* ✨ 26호: Section의 직속 articles 먼저 */}
                                  {section.articles && section.articles.length > 0 && (
                                    <div className="space-y-1.5">
                                      {section.articles.map((article: any, idx: number) => (
                                        <div key={`${article._id || idx}`} className="group">
                                          <Link
                                            href={`/articles/${article.slug?.current || article._id}`}
                                            className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-300 lg:hover:text-white' : 'text-black lg:hover:text-gray-600'
                                              }`}
                                          >
                                            {article.title || '제목 없음'}
                                            {article.author && section.title !== '인터뷰' && (
                                              <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                <span className="md:hidden">· {article.author}</span>
                                                <span className="hidden md:inline">· {article.author}</span>
                                              </span>
                                            )}
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* ✨ 26호: Subsections 나중에 렌더링 (항상 펼침) */}
                                  {section.subsections && section.subsections.length > 0 && (
                                    <>
                                      {section.subsections.map((subsection: any, subIdx: number) => (
                                        <div key={`${section._id}-${subsection._id || subIdx}`} className="space-y-2">
                                          {/* Subsection 제목 (토글 없음, 항상 펼침) */}
                                          <p className={`본문폰트-민부리 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {/* <span className="text-lg mr-1.5">·</span> */}
                                            {subsection.title}
                                          </p>

                                          {/* Subsection 내용 (항상 표시) */}
                                          <div className="space-y-2 pl-4">
                                            {/* ✨ 하하위 섹션 (3단계) - 토글 가능 */}
                                            {subsection.subsections && subsection.subsections.length > 0 && (
                                              <>
                                                {subsection.subsections.map((subsubsection: any, subsubIdx: number) => (
                                                  <div
                                                    key={`${subsection._id}-${subsubsection._id || subsubIdx}`}
                                                  >
                                                    {/* 하하위 섹션 제목 + 토글 버튼 */}
                                                    <button
                                                      onClick={() => toggleSubsection(subsubsection._id)}
                                                      className={`w-full flex items-center justify-between text-left 각주폰트-민부리 font-bold transition-colors ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                        }`}
                                                    >
                                                      <span>{subsubsection.title}</span>
                                                      <svg
                                                        className={`w-3 h-3 transition-transform ${expandedSubsections[subsubsection._id] ? 'rotate-45' : ''
                                                          }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                      </svg>
                                                    </button>

                                                    {/* 하하위 섹션의 articles */}
                                                    {subsubsection.articles && subsubsection.articles.length > 0 && (
                                                      <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSubsections[subsubsection._id]
                                                            ? 'max-h-[1000px] opacity-100'
                                                            : 'max-h-0 opacity-0'
                                                          }`}
                                                      >
                                                        <div className="space-y-1.5 pl-4">
                                                          {subsubsection.articles.map((article: any, artIdx: number) => (
                                                            <div key={`${article._id || artIdx}`} className="group">
                                                              <Link
                                                                href={`/articles/${article.slug?.current || article._id}`}
                                                                className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                                  }`}
                                                              >
                                                                {article.title || '제목 없음'}
                                                                {article.author && (
                                                                  <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                    <span className="md:hidden">· {article.author}</span>
                                                                    <span className="hidden md:inline">· {article.author}</span>
                                                                  </span>
                                                                )}
                                                              </Link>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </>
                                            )}

                                            {/* Subsection의 직속 articles */}
                                            {subsection.articles && subsection.articles.length > 0 && (
                                              <div className="space-y-1.5">
                                                {subsection.articles.map((article: any, artIdx: number) => (
                                                  <div key={`${article._id || artIdx}`} className="group">
                                                    <Link
                                                      href={`/articles/${article.slug?.current || article._id}`}
                                                      className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                        }`}
                                                    >
                                                      {article.title || '제목 없음'}
                                                      {article.author && (
                                                        <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                          <span className="md:hidden">· {article.author}</span>
                                                          <span className="hidden md:inline">· {article.author}</span>
                                                        </span>
                                                      )}
                                                    </Link>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* ✨ 다른 호: Subsections 먼저 렌더링 (항상 펼침) */}
                                  {section.subsections && section.subsections.length > 0 && (
                                    <>
                                      {section.subsections.map((subsection: any, subIdx: number) => (
                                        <div key={`${section._id}-${subsection._id || subIdx}`} className="space-y-2">
                                          {/* Subsection 제목 (토글 없음, 항상 펼침) */}
                                          <p className={`본문폰트-민부리 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {/* <span className="mr-1.5">·</span> */}
                                            {subsection.title}
                                          </p>

                                          {/* Subsection 내용 (항상 표시) */}
                                          <div className="space-y-2 pl-4">
                                            {/* ✨ 하하위 섹션 (3단계) - 토글 가능 */}
                                            {subsection.subsections && subsection.subsections.length > 0 && (
                                              <>
                                                {subsection.subsections.map((subsubsection: any, subsubIdx: number) => (
                                                  <div
                                                    key={`${subsection._id}-${subsubsection._id || subsubIdx}`}
                                                  >
                                                    {/* 하하위 섹션 제목 + 토글 버튼 */}
                                                    <button
                                                      onClick={() => toggleSubsection(subsubsection._id)}
                                                      className={`w-full flex items-start justify-between text-left 본문폰트 transition-colors ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                        }`}
                                                    >
                                                      <span>{subsubsection.title}</span>
                                                      <svg
                                                        className={`w-4 h-4 mt-2 transition-transform ${expandedSubsections[subsubsection._id] ? 'rotate-45' : ''
                                                          }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                                      </svg>
                                                    </button>

                                                    {/* 하하위 섹션의 articles */}
                                                    {subsubsection.articles && subsubsection.articles.length > 0 && (
                                                      <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSubsections[subsubsection._id]
                                                            ? 'max-h-[1000px] opacity-100'
                                                            : 'max-h-0 opacity-0'
                                                          }`}
                                                      >
                                                        <div className="space-y-1.5 pl-4">
                                                          {subsubsection.articles.map((article: any, artIdx: number) => (
                                                            <div key={`${article._id || artIdx}`} className="group">
                                                              <Link
                                                                href={`/articles/${article.slug?.current || article._id}`}
                                                                className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                                  }`}
                                                              >
                                                                {article.title || '제목 없음'}
                                                                {article.author && (
                                                                  <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                    <span className="md:hidden">· {article.author}</span>
                                                                    <span className="hidden md:inline">· {article.author}</span>
                                                                  </span>
                                                                )}
                                                              </Link>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </>
                                            )}

                                            {/* Subsection의 직속 articles */}
                                            {subsection.articles && subsection.articles.length > 0 && (
                                              <div className="space-y-1.5">
                                                {subsection.articles.map((article: any, artIdx: number) => (
                                                  <div key={`${article._id || artIdx}`} className="group">
                                                    <Link
                                                      href={`/articles/${article.slug?.current || article._id}`}
                                                      className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-400 lg:hover:text-white' : 'text-black lg:text-gray-600 lg:hover:text-black'
                                                        }`}
                                                    >
                                                      {article.title || '제목 없음'}
                                                      {article.author && (
                                                        <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                          <span className="md:hidden">· {article.author}</span>
                                                          <span className="hidden md:inline">· {article.author}</span>
                                                        </span>
                                                      )}
                                                    </Link>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  )}

                                  {/* ✨ 다른 호: Section의 직속 articles (토글 없이 일반 링크) */}
                                  {section.articles && section.articles.length > 0 && (
                                    <div className="space-y-1.5">
                                      {section.articles.map((article: any, idx: number) => (
                                        <div key={`${article._id || idx}`} className="group">
                                          <Link
                                            href={`/articles/${article.slug?.current || article._id}`}
                                            className={`block 본문폰트 transition ${isDarkMode ? 'text-white lg:text-gray-300 lg:hover:text-white' : 'text-black lg:hover:text-gray-600'
                                              }`}
                                          >
                                            {article.title || '제목 없음'}
                                            {article.author && section.title !== '인터뷰' && (
                                              <span className={`각주폰트-민부리 ml-1.5 pb-0.5 md:ml-2 md:mb-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                <span className="md:hidden">· {article.author}</span>
                                                <span className="hidden md:inline">· {article.author}</span>
                                              </span>
                                            )}
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        업데이트 예정입니다.
                      </div>
                    )}

                    {/* ✨ 호별 크레딧 */}
                    {issue.credits && issue.credits.length > 0 && (
                      <div className={`space-y-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <button
                          onClick={() => toggleCredits(issue._id)}
                          className={`flex items-center gap-0 각주폰트-민부리 transition-colors ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
                        >
                          <span>크레딧</span>
                          <svg
                            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCredits[issue._id]
                              ? 'max-h-[1000px] opacity-100'
                              : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="각주폰트-민부리">
                            <PortableText value={issue.credits} components={creditsComponents} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {idx < issues.length - 1 && <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />}
              </div>
            ))}
          </div>

          <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

          {/* 크레딧 섹션 (기존 코드) */}
          <div className="pt-6 pb-8 space-y-8">
            {/* <div>
              <p className={`본문폰트 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                한국타이포그라피학회는 글자와 타이포그래피를 연구하기 위해 2008년 창립되었다. 『글짜씨』는 학회에서 2009년 12월부터 발간한 타이포그래피 학술지다.
              </p>
            </div> */}

            {/* <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} /> */}

            {/* 한국타이포그라피학회 */}
            <div>
              <h3 className={`font-bold mb-5 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                한국타이포그라피학회
              </h3>
              <div className={`space-y-5 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div className="space-y-[0.25em]">
                  <span className="block">회장: 심우진</span>
                  <span className="block">부회장: 김수은, 민구홍</span>
                  <span className="block">사무총장: 박혜지</span>
                  <span className="block">정책기획이사: 민본, 박고은</span>
                  <span className="block">학술출판이사: 박유선, 유도원</span>
                  <span className="block">대외전시이사: 김기창, 이재환</span>
                  <span className="block">감사: 노영권</span>
                  <span className="block">논문편집위원장: 이병학</span>
                  <span className="block">논문편집위원: 박수진, 석재원, 이지원, 정희숙, 하주현</span>
                  <span className="block">연구윤리위원장: 조주은</span>
                  <span className="block">연구윤리위원: 박재홍</span>
                  <span className="block">연구자문위원장: 크리스 하마모토</span>
                  <span className="block">연구자문위원: 박지훈</span>
                  <span className="block">국제교류위원장: 제임스 채</span>
                  <span className="block">국제교류위원: 김민영</span>
                </div>

                <div className="space-y-[0.25em]">
                  <span className="block">대외협력위원: 김은지, 김태룡, 윤율리, 이주현, 임혜은, 최규호, 함지은, 홍원태</span>
                  <span className="block">한글특별위원회위원장: 길형진</span>
                  <span className="block">다양성특별위원회위원장: 이지원</span>
                  <span className="block">타이포잔치특별위원회장: 심우진</span>
                  <span className="block">타이포잔치특별위원: 김경선, 박연주, 안병학, 유정미, 이재민, 최성민, 최슬기</span>
                  <span className="block">글꼴창작지원사업심의위원장: 심우진</span>
                  <span className="block">글꼴창작지원사업심의위원: 구모아, 노영권, 박부미, 장수영, 정태영</span>
                </div>

                <div className="space-y-[0.25em]">
                  <span className="block">사무국장: 이름, 홍유림</span>
                  <span className="block">홍보국장: 강인구</span>
                  <span className="block">출판국장: 문민주, 김도연, 황세미</span>
                </div>
              </div>
            </div>

            {/* 후원 & 파트너 */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  후원
                </h3>
                <div className="flex flex-col gap-8">
                  <img src="/img/sp/01_sp/sp-01-ahngraphics.gif" alt="안그라픽스" className="w-36" />
                  <img src="/img/sp/01_sp/sp-02-doosungpaper.gif" alt="두성종이" className="w-36" />
                  <img src="/img/sp/01_sp/sp-03-coloso.gif" alt="콜로소" className="w-36" />
                </div>
              </div>
              <div className="col-span-2">
                <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  파트너
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* 울트라블랙 */}
                  <img src="/img/sp/02_pt/1/pt-01-happybean.gif" alt="해피빈" className="w-36" />
                  <img src="/img/sp/02_pt/1/pt-06-woowa.gif" alt="우아한형제들" className="w-36" />
                  <img src="/img/sp/02_pt/1/pt-14-adobe.gif" alt="아도비" className="w-36" />
                  {/* 블랙 */}
                  <img src="/img/sp/02_pt/2/pt-12-visang.gif" alt="비상" className="w-36" />
                  {/* 볼드 */}
                  <img src="/img/sp/02_pt/3/pt-11-samwon.png" alt="삼원종이" className="w-36" />
                  <img src="/img/sp/02_pt/3/pt-15-morisawakorea.png" alt="모리사워코리아" className="w-36" />
                  {/* 레귤러 */}
                  <img src="/img/sp/02_pt/4/pt-10-innoiz.gif" alt="인노이즈" className="w-36" />
                  {/* 공익위반제보 */}
                  <img src="/img/sp/02_pt/5/link-01-munhwa.png" alt="문화체육관광부" className="w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            🖥️ 데스크톱 레이아웃
        ======================================== */}
        <div className="hidden lg:block">
          {/* 상단 소개 */}
          <div className="grid grid-cols-5 gap-8 ">
            <div className="grid grid-cols-1 col-span-1 pt-12 sticky top-0 self-start">
              <Link href="/">
                <img src={isDarkMode ? "/img/logo2-i.gif" : "/img/logo2.gif"} alt="글짜씨" className="w-36 lg:w-40 cursor-pointer" />
              </Link>
            </div>

            <div className="col-span-3 pt-12">
              <div className={`space-y-4 본문폰트 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <p>
                  2024년 임기를 시작한 제8대 한국타이포그래피학회는 디지털 환경에서의 타이포그래피를 둘러싼 현상과 실천 등을 살펴보며 디지털 타이포그래피의 정체성을 탐구한다. 이에 대한 연장선으로 제8대 한국타이포그래피학회는 글짜씨를 통해 디지털 환경 속의 타이포그래피를 실험하고 이를 웹을 통해 공유하는 프로젝트를 진행한다.
                </p>
                <p>
                  『글짜씨』는 2009년에 창간해 지난 15년간 학회 구성원과 국내외 타이포그래피 연구자, 디자이너의 연구 성과를 기록한 학회 학술지다. 학술지는 연구 분야의 연구 및 활동을 공유하는 창으로 기능한다. 이러한 학회와 학술지의 가치는 웹의 기본정신인 공개와 공유와도 맞닿아 있다는 점에서도 『글짜씨』 웹 버전의 의미를 찾을 수 있다.
                </p>
                <p>
                  &apos;글짜씨&apos;는 웹 브라우저 내에서의 읽기 환경을 고려해 『글짜씨』를 발췌 출판한 실험 사이트이다. 현존하는 디지털 읽기 환경의 아쉬운 점을 보완해 디지털 환경에서의 한글 읽기 경험을 실험하고자 했으며, 『글짜씨』의 일부 내용을 포함하지 않고 있다.
                </p>
              </div>
            </div>

            <div className="col-span-1 pt-12 flex justify-end">
              <button
                onClick={toggleDarkMode}
                className={`w-6 h-6 flex items-center justify-center gap-2 transition-colors`}
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 목차 */}
          <div className="grid grid-cols-5 gap-8 pb-12 lg:pt-12">
            <div className="col-span-1"></div>

            {issues.map((issue) => (
              <div key={issue._id} className="col-span-1 space-y-4">
                <div className="mb-6">
                  <p className={`각주폰트-민부리 font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {issue.number}
                  </p>
                  <p className={`본문폰트 mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {issue.title}
                  </p>
                </div>

                {issue.sections && issue.sections.length > 0 ? (
                  <div className="space-y-6">
                    {issue.sections.map((section: any, sectionIdx: number) => (
                      <div key={`${issue._id}-${section._id || sectionIdx}`} className="">
                        {/* 섹션 제목 */}
                        <p className={`각주폰트-민부리 font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {section.title}
                        </p>

                        <div className="space-y-3">
                          {/* 26호는 아티클 먼저, 다른 호는 하위섹션 먼저 */}
                          {issue.number === 26 ? (
                            <>
                              {/* ✨ 26호: Section의 직속 articles 먼저 */}
                              {section.articles && section.articles.length > 0 && (
                                <div className="space-y-1.5">
                                  {section.articles.map((article: any, idx: number) => (
                                    <div key={`${article._id || idx}`} className="group">
                                      {section.title === '인터뷰' ? (
                                        <Link
                                          href={`/articles/${article.slug?.current || article._id}`}
                                          className={`block 본문폰트 transition ${isDarkMode ? 'text-white' : 'text-black'}`}
                                          onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                          onMouseLeave={() => setPreviewUrl(null)}
                                        >
                                          {article.title || '제목 없음'}
                                        </Link>
                                      ) : (
                                        <Link
                                          href={`/articles/${article.slug?.current || article._id}`}
                                          className={`block 본문폰트 transition relative ${isDarkMode ? 'text-white' : 'text-black'}`}
                                          onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                          onMouseLeave={() => setPreviewUrl(null)}
                                        >
                                          <span className="group-hover:opacity-0 transition-opacity">
                                            {article.title || '제목 없음'}
                                          </span>
                                          {article.author && (
                                            <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                              {article.author}
                                            </span>
                                          )}
                                        </Link>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* ✨ 26호: Subsections 나중에 렌더링 (항상 펼침) */}
                              {section.subsections && section.subsections.length > 0 && (
                                <>
                                  {section.subsections.map((subsection: any, subIdx: number) => (
                                    <div key={`${section._id}-${subsection._id || subIdx}`} className="space-y-2">
                                      {/* Subsection 제목 (토글 없음, 항상 펼침) */}
                                      <p className={`본문폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        {subsection.title}
                                      </p>

                                      {/* Subsection 내용 (항상 표시) */}
                                      <div className="space-y-2 ml-8">
                                        {/* ✨ 하하위 섹션 (3단계) - 토글 가능 */}
                                        {subsection.subsections && subsection.subsections.length > 0 && (
                                          <>
                                            {subsection.subsections.map((subsubsection: any, subsubIdx: number) => (
                                              <div key={`${subsection._id}-${subsubsection._id || subsubIdx}`} className="space-y-2">
                                                {/* 하하위 섹션 제목 + 토글 버튼 */}
                                                <button
                                                  onClick={() => toggleSubsection(subsubsection._id)}
                                                  className={`w-full flex items-center justify-between text-left 각주폰트-민부리 font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-black'
                                                    }`}
                                                >
                                                  <span>{subsubsection.title}</span>
                                                  <svg
                                                    className={`w-3 h-3 transition-transform ${expandedSubsections[subsubsection._id] ? 'rotate-45' : ''
                                                      }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                  </svg>
                                                </button>

                                                {/* 하하위 섹션의 articles */}
                                                {subsubsection.articles && subsubsection.articles.length > 0 && (
                                                  <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSubsections[subsubsection._id]
                                                        ? 'max-h-[1000px] opacity-100'
                                                        : 'max-h-0 opacity-0'
                                                      }`}
                                                  >
                                                    <div className="space-y-1.5">
                                                      {subsubsection.articles.map((article: any, artIdx: number) => (
                                                        <div key={`${article._id || artIdx}`} className="group">
                                                          <Link
                                                            href={`/articles/${article.slug?.current || article._id}`}
                                                            className={`block 본문폰트 transition relative ${isDarkMode ? 'text-white' : 'text-black'}`}
                                                            onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                                            onMouseLeave={() => setPreviewUrl(null)}
                                                          >
                                                            <span className="group-hover:opacity-0 transition-opacity">
                                                              {article.title || '제목 없음'}
                                                            </span>
                                                            {article.author && (
                                                              <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {article.author}
                                                              </span>
                                                            )}
                                                          </Link>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </>
                                        )}

                                        {/* Subsection의 직속 articles */}
                                        {subsection.articles && subsection.articles.length > 0 && (
                                          <div className="space-y-1.5">
                                            {subsection.articles.map((article: any, artIdx: number) => (
                                              <div key={`${article._id || artIdx}`} className="group">
                                                <Link
                                                  href={`/articles/${article.slug?.current || article._id}`}
                                                  className={`block 본문폰트 transition relative ${isDarkMode ? 'text-white' : 'text-black'
                                                    }`}
                                                  onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                                  onMouseLeave={() => setPreviewUrl(null)}
                                                >
                                                  <span className="group-hover:opacity-0 transition-opacity">
                                                    {article.title || '제목 없음'}
                                                  </span>
                                                  {article.author && (
                                                    <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                      {article.author}
                                                    </span>
                                                  )}
                                                </Link>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {/* ✨ 다른 호: Subsections 먼저 렌더링 (항상 펼침) */}
                              {section.subsections && section.subsections.length > 0 && (
                                <>
                                  {section.subsections.map((subsection: any, subIdx: number) => (
                                    <div key={`${section._id}-${subsection._id || subIdx}`} className="space-y-2">
                                      {/* Subsection 제목 (토글 없음, 항상 펼침) */}
                                      <p className={`본문폰트-민부리 mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        {subsection.title}
                                      </p>

                                      {/* Subsection 내용 (항상 표시) */}
                                      <div className="space-y-2">
                                        {/* ✨ 하하위 섹션 (3단계) - 토글 가능 */}
                                        {subsection.subsections && subsection.subsections.length > 0 && (
                                          <>
                                            {subsection.subsections.map((subsubsection: any, subsubIdx: number) => (
                                              <div key={`${subsection._id}-${subsubsection._id || subsubIdx}`} className="space-y-2">
                                                {/* 하하위 섹션 제목 + 토글 버튼 */}
                                                <button
                                                  onClick={() => toggleSubsection(subsubsection._id)}
                                                  className={`w-full flex items-start justify-between text-left 본문폰트 transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}
                                                >
                                                  <span>{subsubsection.title}</span>
                                                  <svg
                                                    className={`w-6 h-6 mt-1 transition-transform ${expandedSubsections[subsubsection._id] ? 'rotate-45' : ''
                                                      }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                                  </svg>
                                                </button>

                                                {/* 하하위 섹션의 articles */}
                                                {expandedSubsections[subsubsection._id] && subsubsection.articles && subsubsection.articles.length > 0 && (
                                                  <div className="space-y-1.5">
                                                    {subsubsection.articles.map((article: any, artIdx: number) => (
                                                      <div key={`${article._id || artIdx}`} className="group">
                                                        <Link
                                                          href={`/articles/${article.slug?.current || article._id}`}
                                                          className={`block 본문폰트 transition relative ml-8 ${isDarkMode ? 'text-white' : 'text-black'
                                                            }`}
                                                          onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                                          onMouseLeave={() => setPreviewUrl(null)}
                                                        >
                                                          <span className="group-hover:opacity-0 transition-opacity">
                                                            {article.title || '제목 없음'}
                                                          </span>
                                                          {article.author && (
                                                            <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                              {article.author}
                                                            </span>
                                                          )}
                                                        </Link>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </>
                                        )}

                                        {/* Subsection의 직속 articles */}
                                        {subsection.articles && subsection.articles.length > 0 && (
                                          <div className="space-y-1.5 ml-8">
                                            {subsection.articles.map((article: any, artIdx: number) => (
                                              <div key={`${article._id || artIdx}`} className="group">
                                                <Link
                                                  href={`/articles/${article.slug?.current || article._id}`}
                                                  className={`block 본문폰트 transition relative ${isDarkMode ? 'text-white' : 'text-black'
                                                    }`}
                                                  onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                                  onMouseLeave={() => setPreviewUrl(null)}
                                                >
                                                  <span className="group-hover:opacity-0 transition-opacity">
                                                    {article.title || '제목 없음'}
                                                  </span>
                                                  {article.author && (
                                                    <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                      {article.author}
                                                    </span>
                                                  )}
                                                </Link>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}

                              {/* ✨ 다른 호: Section의 직속 articles (토글 없이 일반 링크) */}
                              {section.articles && section.articles.length > 0 && (
                                <div className="space-y-1.5">
                                  {section.articles.map((article: any, idx: number) => (
                                    <div key={`${article._id || idx}`} className="group">
                                      {section.title === '인터뷰' ? (
                                        <Link
                                          href={`/articles/${article.slug?.current || article._id}`}
                                          className={`block 본문폰트 transition ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-600'}`}
                                          onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                          onMouseLeave={() => setPreviewUrl(null)}
                                        >
                                          {article.title || '제목 없음'}
                                        </Link>
                                      ) : (
                                        <Link
                                          href={`/articles/${article.slug?.current || article._id}`}
                                          className={`block 본문폰트 transition relative ${isDarkMode ? 'text-white' : 'text-black'}`}
                                          onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                          onMouseLeave={() => setPreviewUrl(null)}
                                        >
                                          <span className="group-hover:opacity-0 transition-opacity">
                                            {article.title || '제목 없음'}
                                          </span>
                                          {article.author && (
                                            <span className={`absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                              {article.author}
                                            </span>
                                          )}
                                        </Link>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`각주폰트-민부리 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    업데이트 예정입니다.
                  </div>
                )}
              </div>
            ))}

            {/* ✨ 호별 크레딧 섹션 - 토글 형식 */}
            <div className="col-span-1"></div>
            {issues.map((issue) => (
              <div key={`desktop-credits-${issue._id}`} className="col-span-1 space-y-2 각주폰트-민부리">
                {issue.credits && issue.credits.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleCredits(issue._id)}
                      className={`flex items-center gap-0 각주폰트-민부리 transition-colors ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
                    >
                      <span>{issue.number}호 크레딧</span>
                      <svg
                        className="w-3.5 h-3.5 hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCredits[issue._id]
                          ? 'max-h-[1000px] opacity-100'
                          : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="space-y-1">
                        <PortableText value={issue.credits} components={creditsComponents} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className={`border-t mb-12 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        {/* 데스크톱 크레딧 섹션 */}
        <div className={`hidden lg:block 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {/* 학회 크레딧 섹션 */}
          <div className="grid grid-cols-5 gap-8 pb-12 ">
            <div className="col-span-1">
              <div className="space-y-1">
                <p>
                  한국타이포그라피학회는 글자와 타이포그래피를 연구하기 위해 2008년 창립되었다. 『글짜씨』는 학회에서 2009년 12월부터 발간한 타이포그래피 학술지다.
                </p>
                <p>
                  {/* <a href="mailto:info@koreantypography.org">info@koreantypography.org</a> <br />
                    <a href="https://k-s-t.org" target="_blank">k-s-t.org </a> */}
                </p>
              </div>
            </div>

            <div className="col-span-1"></div>

            <div className="col-span-1 space-y-[0.25em]">
              <span className="block">회장: 심우진</span>
              <span className="block">부회장: 김수은, 민구홍</span>
              <span className="block">사무총장: 박혜지</span>
              <span className="block">정책기획이사: 민본, 박고은</span>
              <span className="block">학술출판이사: 박유선, 유도원</span>
              <span className="block">대외전시이사: 김기창, 이재환</span>
              <span className="block">감사: 노영권</span>
            </div>

            <div className="col-span-1 space-y-[0.25em]">
              <span className="block">논문편집위원장: 이병학</span>
              <span className="block">논문편집위원: 박수진, 석재원, 이지원, 정희숙, 하주현</span>
              <span className="block">연구윤리위원장: 조주은</span>
              <span className="block">연구윤리위원: 박재홍</span>
              <span className="block">연구자문위원장: 크리스 하마모토</span>
              <span className="block">연구자문위원: 박지훈</span>
              <span className="block">국제교류위원장: 제임스 채</span>
              <span className="block">국제교류위원: 김민영</span>
              <span className="block">대외협력위원: 김은지, 김태룡, 윤율리, 이주현, 임혜은, 최규호, 함지은, 홍원태</span>
              <span className="block">한글특별위원회위원장: 길형진</span>
              <span className="block">다양성특별위원회위원장: 이지원</span>
              <span className="block">타이포잔치특별위원회장: 심우진</span>
              <span className="block">타이포잔치특별위원: 김경선, 박연주, 안병학, 유정미, 이재민, 최성민, 최슬기</span>
              <span className="block">글꼴창작지원사업심의위원장: 심우진</span>
              <span className="block">글꼴창작지원사업심의위원: 구모아, 노영권, 박부미, 장수영, 정태영</span>
            </div>

            <div className="col-span-1 space-y-[0.25em]">
              <span className="block">사무국장: 이름, 홍유림</span>
              <span className="block">홍보국장: 강인구</span>
              <span className="block">출판국장: 문민주, 김도연, 황세미</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-8 pb-12 font-bold">
            <div className="col-span-2"></div>
            <div className="col-span-1 space-y-4">
              <div className="space-y-4">
                <p>후원</p>
                <div className="flex flex-col gap-8">
                  <img src="/img/sp/01_sp/sp-01-ahngraphics.gif" alt="안그라픽스" className={sponsorImageClassName} />
                  <img src="/img/sp/01_sp/sp-02-doosungpaper.gif" alt="두성종이" className={sponsorImageClassName} />
                  <img src="/img/sp/01_sp/sp-03-coloso.gif" alt="콜로소" className={sponsorImageClassName} />
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="space-y-4">
                <p>파트너</p>
                <div className="grid grid-cols-2 gap-8">
                  {/* 울트라블랙 */}
                  <img src="/img/sp/02_pt/1/pt-01-happybean.gif" alt="해피빈" className={sponsorImageClassName} />
                  <img src="/img/sp/02_pt/1/pt-06-woowa.gif" alt="우아한형제들" className={sponsorImageClassName} />
                  <img src="/img/sp/02_pt/1/pt-14-adobe.gif" alt="아도비" className={sponsorImageClassName} />
                  {/* 블랙 */}
                  <img src="/img/sp/02_pt/2/pt-12-visang.gif" alt="비상" className={sponsorImageClassName} />
                  {/* 볼드 */}
                  <img src="/img/sp/02_pt/3/pt-11-samwon.png" alt="삼원종이" className={sponsorImageClassName} />
                  <img src="/img/sp/02_pt/3/pt-15-morisawakorea.png" alt="모리사워코리아" className={sponsorImageClassName} />
                  {/* 레귤러 */}
                  <img src="/img/sp/02_pt/4/pt-10-innoiz.gif" alt="인노이즈" className={sponsorImageClassName} />
                  {/* 공익위반제보 */}
                  <img src="/img/sp/02_pt/5/link-01-munhwa.png" alt="문화체육관광부" className={sponsorImageClassName} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}