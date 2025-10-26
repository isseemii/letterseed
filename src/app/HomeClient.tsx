'use client'

import { useDarkMode } from '@/contexts/DarkModeContext'
import Link from 'next/link'
import { useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'

const builder = imageUrlBuilder(client as any)
const urlFor = (source: any) => builder.image(source).url()

export default function HomeClient({ initialIssues }: { initialIssues: any[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const issues = initialIssues

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
      console.log('no images', JSON.parse(JSON.stringify(article)))
      return null
    }

    const i = Math.floor(Math.random() * urls.length)
    return urls[i]
  }

  // ✨ 아코디언 토글
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
          <div className="pt-8 pb-6 flex justify-between items-center">
            <Link href="/">
              <img src="/img/logo2.gif" alt="글짜씨" className="w-32 cursor-pointer" />
            </Link>

            {/* ✨ 다크모드 토글 버튼 */}
            <button
              onClick={toggleDarkMode}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* 상단 소개글 */}
          <div className={`space-y-4 본문폰트 text-sm leading-relaxed pb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <p>
              2024년 임기를 시작한 제8대 한국타이포그래피학회는 디지털 환경에서의 타이포그래피를 둘러싼 현상과 실천 등을 살펴보며 디지털 타이포그래피의 정체성을 탐구한다. 이에 대한 연장선으로 제8대 한국타이포그래피학회는 글짜씨를 통해 디지털 환경 속의 타이포그래피를 실험하고 이를 웹을 통해 공유하는 프로젝트를 진행한다.
            </p>
            <p className="indent-p">
              『글짜씨』는 2009년에 창간해 지난 15년간 학회 구성원과 국내외 타이포그래피 연구자, 디자이너의 연구 성과를 기록한 학회 학술지다. 학술지는 연구 분야의 연구 및 활동을 공유하는 창으로 기능한다. 이러한 학회와 학술지의 가치는 웹의 기본정신인 공개와 공유와도 맞닿아 있다는 점에서도 『글짜씨』 웹 버전의 의미를 찾을 수 있다.
            </p>
            <p className="indent-p">
              글짜씨는 웹 브라우저 내에서의 읽기 환경을 고려해 『글짜씨』를 발췌 출판한 실험 사이트이다. 현존하는 디지털 읽기 환경의 아쉬운 점을 보완해 디지털 환경에서의 한글 읽기 경험을 실험하고자 했으며, 『글짜씨』의 일부 내용을 포함하지 않고 있다.
            </p>
          </div>

          {/* 구분선 */}
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
                    <span className="각주폰트-민부리 font-bold mr-2">{issue.number}호</span>
                    <span className="본문폰트">{issue.title}</span>
                  </div>
                  {/* <svg
                    className={`w-5 h-5 transition-transform ${expandedIssue === issue._id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg> */}
                </button>

                {expandedIssue === issue._id && (
                  <div className="pb-4 pl-8">
                    {issue.sections && issue.sections.length > 0 ? (
                      <div className="space-y-4">
                        {issue.sections.map((section: any, sectionIdx: number) => (
                          <div key={`${issue._id}-${section._id || sectionIdx}`} className="space-y-2">
                            <p className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {section.title}
                            </p>

                            {section.articles && section.articles.length > 0 && (
                              <div className="space-y-1.5">
                                {section.articles.map((article: any, idx: number) => (
                                  <div key={`${article._id || idx}`} className="group">
                                    <Link
                                      href={`/articles/${article.slug?.current || article._id}`}
                                      className={`block 본문폰트 transition ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-600'
                                        }`}
                                    >
                                      {article.title || '제목 없음'}
                                      {article.author && section.title !== '인터뷰' && (
                                        <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                          · {article.author}
                                        </span>
                                      )}
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`본문폰트 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        업데이트 예정입니다.
                      </div>
                    )}
                  </div>
                )}

                {idx < issues.length - 1 && <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />}
              </div>
            ))}
          </div>

          {/* 크레딧 섹션 */}
          <div className="py-8 space-y-8">
            {/* 크레딧 목록 */}
            <div>
              <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                크레딧 목록
              </h3>
              <div className={`space-y-6 본문폰트 text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div>
                  <p className="mb-2">
                    발행인: 심우진, 안미르, 안마노 <br />
                    발행처: 한국타이포그라피학회, 안그라픽스
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    한국타이포그라피학회 <br />
                    (03035) 서울특별시 종로구 자하문로19길 25 <br />
                    info@koreantypography.org
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    안그라픽스 <br />
                    (10881) 경기도 파주시 회동길 125-15 <br />
                    T. 031-955-7766 <br />
                    F. 031-955-7744
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    기고편집부: 박유선, 유도원 <br />
                    논문편집부: 이병학(편집위원장), 박수진, 석재원, 이지원, 정희숙, 하주현
                  </p>
                  <p className="mb-2">
                    글: 강인구, 권지운, 김민경, 김주경, 더블디, 더퍼스트펭귄, 리모트, 마이크 털리(Mike Tully), 민본, 박유선, 박재형, 브렌든, 서유경, 석재원, 스튜디오 둠바, 스튜디오 베르크, 시멘트, 시청 양(Xicheng Yang), 심우진, 에이지에이, 요한 프라그(Johan Prag), 워크스, 유도원, 이용제, 일상의실천, 전우성, 제임스 고긴(James Goggin), 조주은, 최성민, 캣 웬트워스(Cat Wentworth), 크리스 하마모토(Chris Hamamoto), 포마 오피스, 허민재, 허스키폭스
                  </p>
                  <p className="mb-2">
                    번역: 박유선, 유도원 <br />
                    편집: 김한아 <br />
                    디자인: 문민주, 김도연 <br />
                    제작 진행: 박현선 <br />
                    마케팅: 김채린 <br />
                    매니저: 박미영 <br />
                    인쇄·제책: 금강인쇄
                  </p>
                </div>

                <div>
                  <p>
                    이 학술지에 게재된 논고는 한국타이포그라피학회 웹사이트에서 보실 수 있습니다. <br />
                    <a href="http://k-s-t.org/" target="_blank" className="text-[#7CFC00] underline">
                      http://k-s-t.org/
                    </a>
                  </p>
                  <p className="mt-2">
                    이 학술지는 크리에이티브 커먼즈 저작자 표시-비영리-변경 금지 4.0 국제 저작권이 적용되어 있습니다. 이 저작권의 자세한 설명은{' '}
                    <a href="http://creativecommons.org/licenses/by-nc/4.0/" target="_blank" className="text-[#7CFC00] underline">
                      http://creativecommons.org/licenses/by-nc/4.0/
                    </a>
                    에서 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

            {/* 한국타이포그라피학회 */}
            <div>
              <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                한국타이포그라피학회
              </h3>
              <div className={`space-y-6 본문폰트 text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div>
                  <p className="mb-2">
                    회장: 심우진 <br />
                    부회장: 김수은, 민구홍 <br />
                    사무총장: 박혜지 <br />
                    정책기획이사: 민본, 박고은 <br />
                    학술출판이사: 박유선, 유도원 <br />
                    대외전시이사: 김기창, 이재환 <br />
                    감사: 노영권
                  </p>
                  <p className="mb-2">
                    논문편집위원장: 이병학 <br />
                    논문편집위원: 박수진, 석재원, 이지원, 정희숙, 하주현 <br />
                    연구윤리위원장: 조주은 <br />
                    연구윤리위원: 박재홍 <br />
                    연구자문위원장: 크리스 하마모토 <br />
                    연구자문위원: 박지훈 <br />
                    국제교류위원장: 제임스 채 <br />
                    국제교류위원: 김민영
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    대외협력위원: 김은지, 김태룡, 윤율리, 이주현, 임혜은, 최규호, 함지은, 홍원태 <br />
                    한글특별위원회위원장: 길형진 <br />
                    다양성특별위원회위원장: 이지원 <br />
                    타이포잔치특별위원회장: 심우진 <br />
                    타이포잔치특별위원: 김경선, 박연주, 안병학, 유정미, 이재민, 최성민, 최슬기 <br />
                    글꼴창작지원사업심의위원장: 심우진 <br />
                    글꼴창작지원사업심의위원: 구모아, 노영권, 박부미, 장수영, 정태영
                  </p>
                  <p className="mb-2">
                    사무국장: 이름, 홍유림 <br />
                    홍보국장: 강인구 <br />
                    출판국장: 문민주, 김도연, 황세미
                  </p>
                </div>

                <div>
                  <p>
                    한국타이포그라피학회는 글자와 타이포그래피를 연구하기 위해 2008년 창립되었다. 『글짜씨』는 학회에서 2009년 12월부터 발간한 타이포그래피 학술지다.
                  </p>
                  <p className="mt-2">
                    <a href="mailto:info@koreantypography.org" className="text-[#7CFC00] underline">
                      info@koreantypography.org
                    </a>
                    <br />
                    <a href="https://k-s-t.org" target="_blank" className="text-[#7CFC00] underline">
                      k-s-t.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <hr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

            {/* 후원 & 파트너 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  후원
                </h3>
                <p className={`본문폰트 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  (후원사 로고)
                </p>
              </div>
              <div>
                <h3 className={`font-bold mb-4 각주폰트-민부리 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  파트너
                </h3>
                <p className={`본문폰트 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  (파트너사 로고)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            🖥️ 데스크톱 레이아웃
        ======================================== */}
        <div className="hidden lg:block">
          {/* 상단 소개 */}
          <div className="grid grid-cols-5 gap-0">
            {/* 왼쪽 로고 */}
            <div className="grid grid-cols-1 col-span-1 pt-12 sticky top-0 self-start">
              <Link href="/">
                <img src="/img/logo2.gif" alt="글짜씨" className="w-36 lg:w-40 cursor-pointer" />
              </Link>

              {/* ✨ 다크모드 토글 버튼 (데스크톱) */}
              <button
                onClick={toggleDarkMode}
                className={`w-6 h-6 flex items-end justify-start transition-colors 본문폰트 mt-4`}
              >
                {isDarkMode ? <span className="text-white underline">밝게</span> : <span className="text-black underline">어둡게</span>}
              </button>
            </div>

            <div className="col-span-3 pt-12">
              <div className={`space-y-4 본문폰트 lg:text-base leading-relaxed ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <p>
                  2024년 임기를 시작한 제8대 한국타이포그래피학회는 디지털 환경에서의 타이포그래피를 둘러싼 현상과 실천 등을 살펴보며 디지털 타이포그래피의 정체성을 탐구한다. 이에 대한 연장선으로 제8대 한국타이포그래피학회는 글짜씨를 통해 디지털 환경 속의 타이포그래피를 실험하고 이를 웹을 통해 공유하는 프로젝트를 진행한다.
                </p>
                <p className="indent-p">
                  『글짜씨』는 2009년에 창간해 지난 15년간 학회 구성원과 국내외 타이포그래피 연구자, 디자이너의 연구 성과를 기록한 학회 학술지다. 학술지는 연구 분야의 연구 및 활동을 공유하는 창으로 기능한다. 이러한 학회와 학술지의 가치는 웹의 기본정신인 공개와 공유와도 맞닿아 있다는 점에서도 『글짜씨』 웹 버전의 의미를 찾을 수 있다.
                </p>
                <p className="indent-p">
                  글짜씨는 웹 브라우저 내에서의 읽기 환경을 고려해 『글짜씨』를 발췌 출판한 실험 사이트이다. 현존하는 디지털 읽기 환경의 아쉬운 점을 보완해 디지털 환경에서의 한글 읽기 경험을 실험하고자 했으며, 『글짜씨』의 일부 내용을 포함하지 않고 있다.
                </p>
              </div>
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* 목차 */}
          <div className="grid grid-cols-5 gap-0 pb-12 lg:pt-12">
            <div className="col-span-1"></div>
            {issues.map((issue) => (
              <div key={issue._id} className="col-span-1 pr-8 space-y-4">
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
                      <div key={`${issue._id}-${section._id || sectionIdx}`} className="space-y-2">
                        <p className={`각주폰트-민부리 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {section.title}
                        </p>

                        {section.articles && section.articles.length > 0 && (
                          <div className="space-y-1.5">
                            {section.articles.map((article: any, idx: number) => (
                              <div key={`${article._id || idx}`} className="group">
                                {section.title === '인터뷰' ? (
                                  <Link
                                    href={`/articles/${article.slug?.current || article._id}`}
                                    className={`block 본문폰트 transition ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-600'
                                      }`}
                                    onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                    onMouseLeave={() => setPreviewUrl(null)}
                                  >
                                    {article.title || '제목 없음'}
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/articles/${article.slug?.current || article._id}`}
                                    className={`block 본문폰트 transition relative ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-600'
                                      }`}
                                    onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                    onMouseLeave={() => setPreviewUrl(null)}
                                  >
                                    <span className="group-hover:opacity-0 transition-opacity">
                                      {article.title || '제목 없음'}
                                    </span>
                                    {article.author && (
                                      <span className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#7CFC00]">
                                        {article.author}
                                      </span>
                                    )}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`본문폰트 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    업데이트 예정입니다.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 데스크톱 크레딧 섹션 */}
          <div className={`space-y-4 본문폰트 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <div className="grid grid-cols-5 gap-0 pb-12">
              <div className="col-span-1"></div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>크레딧 목록</p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    발행인: 심우진, 안미르, 안마노 <br />
                    발행처: 한국타이포그라피학회, 안그라픽스 <br />

                    한국타이포그라피학회 <br />
                    (03035) 서울특별시 종로구 자하문로19길 25 <br />
                    info@koreantypography.org <br />

                    안그라픽스 <br />
                    (10881) 경기도 파주시 회동길 125-15 <br />
                    T. 031-955-7766 <br />
                    F. 031-955-7744 <br />
                  </p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    기고편집부: 박유선, 유도원
                    논문편집부: 이병학(편집위원장), 박수진, 석재원, 이지원, 정희숙, 하주현 <br />
                    글: 강인구, 권지운, 김민경, 김주경, 더블디, 더퍼스트펭귄, 리모트, 마이크 털리(Mike Tully), 민본, 박유선, 박재형, 브렌든, 서유경, 석재원, 스튜디오 둠바, 스튜디오 베르크, 시멘트, 시청 양(Xicheng Yang), 심우진, 에이지에이, 요한 프라그(Johan Prag), 워크스, 유도원, 이용제, 일상의실천, 전우성, 제임스 고긴(James Goggin), 조주은, 최성민, 캣 웬트워스(Cat Wentworth), 크리스 하마모토(Chris Hamamoto), 포마 오피스, 허민재, 허스키폭스
                    번역: 박유선, 유도원 <br />
                    편집: 김한아 <br />
                    디자인: 문민주, 김도연 <br />
                    제작 진행: 박현선 <br />
                    마케팅: 김채린 <br />
                    매니저: 박미영 <br />
                    인쇄·제책: 금강인쇄 <br />
                  </p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    이 학술지에 게재된 논고는 한국타이포그라피학회 웹사이트에서 보실 수 있습니다. <br />
                    <a href="http://k-s-t.org/" target="_blank" className="text-[#7CFC00]">http://k-s-t.org/</a> <br /><br />

                    이 학술지는 크리에이티브 커먼즈 저작자 표시-비영리-변경 금지 4.0 국제 저작권이 적용되어 있습니다. 이 저작권의 자세한 설명은 <a href="http://creativecommons.org/ licenses/by-nc/4.0/" target="_blank" className="text-[#7CFC00]">http://creativecommons.org/ licenses/by-nc/4.0/</a>에서 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-0 pb-12">
              <div className="col-span-1"></div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>한국타이포그라피학회</p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    회장: 심우진 <br />
                    부회장: 김수은, 민구홍 <br />
                    사무총장: 박혜지 <br />
                    정책기획이사: 민본, 박고은 <br />
                    학술출판이사: 박유선, 유도원 <br />
                    대외전시이사: 김기창, 이재환 <br />
                    감사: 노영권 <br />
                    논문편집위원장: 이병학 <br />
                    논문편집위원: 박수진, 석재원, 이지원, 정희숙, 하주현 <br />
                    연구윤리위원장: 조주은 <br />
                    연구윤리위원: 박재홍 <br />
                    연구자문위원장: 크리스 하마모토 <br />
                    연구자문위원: 박지훈 <br />
                    국제교류위원장: 제임스 채 <br />
                    국제교류위원: 김민영 <br />
                  </p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    대외협력위원: 김은지, 김태룡, 윤율리, 이주현, 임혜은, 최규호, 함지은, 홍원태
                    한글특별위원회위원장: 길형진 <br />
                    다양성특별위원회위원장: 이지원 <br />
                    타이포잔치특별위원회장: 심우진 <br />
                    타이포잔치특별위원: 김경선, 박연주, 안병학, 유정미, 이재민, 최성민, 최슬기 <br />
                    글꼴창작지원사업심의위원장: 심우진 <br />
                    글꼴창작지원사업심의위원: 구모아, 노영권, 박부미, 장수영, 정태영 <br />

                    사무국장: 이름, 홍유림	<br />
                    홍보국장: 강인구 <br />
                    출판국장: 문민주, 김도연, 황세미 <br />
                  </p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    한국타이포그라피학회는 글자와 타이포그래피를 연구하기 위해 2008년 창립되었다. 『글짜씨』는 학회에서 2009년 12월부터 발간한 타이포그래피 학술지다. <br /> <a href="mailto:info@koreantypography.org" className="text-[#7CFC00]">info@koreantypography.org</a> <br /> <a href="https://k-s-t.org" target="_blank" className="text-[#7CFC00]">k-s-t.org </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-0 pb-12 ">
              <div className="col-span-1"></div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>후원</p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    (후원사 로고)
                  </p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>파트너</p>
                </div>
              </div>
              <div className="col-span-1 pr-8 space-y-4">
                <div className="space-y-4 본문폰트">
                  <p>
                    (파트너사 로고)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 호버시 중앙 프리뷰 이미지 */}
      {previewUrl && (
        <div className="w-full flex justify-center items-center py-10">
          <img
            src={previewUrl}
            alt="미리보기"
            className="max-h-[50vh] max-w-[80vw] object-contain shadow-sm"
          />
        </div>
      )}
    </div>
  )
}