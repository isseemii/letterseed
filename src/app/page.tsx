'use client'

import '@/css/globals.css'
import { client } from '@/lib/sanity'
import { issuesListQuery } from '@/lib/queries'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client as any)
const urlFor = (source: any) => builder.image(source).url()

export default function HomePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 아티클에서 미리보기용 이미지 URL 하나 무작위로 고르는 함수
  const pickRandomImageUrl = (article: any): string | null => {
    const urls: string[] = []

    // 1) article.images 배열 (url 또는 asset.url / asset._ref)
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

    // 2) Portable Text body 안의 image 블록 (asset.url / asset._ref)
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

    // 2-1) Portable Text content 안의 image 블록도 지원
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

  useEffect(() => {
    client.fetch(issuesListQuery).then((data) => {
      const sortedData = data.sort((a: any, b: any) => a.number - b.number)
      setIssues(sortedData)
    })
  }, [])

  return (
    <div className="bg-white">


      {/* 오른쪽 콘텐츠 영역 */}
      <div className="w-full lg:w-5/6 mx-auto">

        {/* 상단 소개 */}
        <div className="grid grid-cols-5 gap-0">
          {/* 왼쪽 로고 */}
          <div className="grid grid-cols-1 col-span-1 pt-12 sticky top-0 self-start">
            <Link href="/">
              <img src="/img/logo2.gif" alt="글짜씨" className="w-36 lg:w-40 cursor-pointer" />
            </Link>
          </div>
          <div className="col-span-3 pt-12">
            <div className="space-y-4 본문폰트 lg:text-base leading-relaxed">
              <p>
                2024년 임기를 시작한 제8대 한국타이포그래피학회는 디지털 환경에서의 타이포그래피를 둘러싼 현상과 실천 등을 살펴보며 디지털 타이포그래피의 정체성을 탐구한다. 이에 대한 연장선으로 제8대 한국타이포그래피학회는 ‘글짜씨’를 통해 디지털 환경 속의 타이포그래피를 실험하고 이를 웹을 통해 공유하는 프로젝트를 진행한다.
              </p>
              <p className="indent-p">
                『글짜씨』는 2009년에 창간해 지난 15년간 학회 구성원과 국내외 타이포그래피 연구자, 디자이너의 연구 성과를 기록한 학회 학술지다. 학술지는 연구 분야의 연구 및 활동을 공유하는 창으로 기능한다. 이러한 학회와 학술지의 가치는 웹의 기본정신인 ‘공개’와 ‘공유’와도 맞닿아 있다는 점에서도 『글짜씨』 웹 버전의 의미를 찾을 수 있다.
              </p>
              <p className="indent-p">
                ‘글짜씨’는 웹 브라우저 내에서의 읽기 환경을 고려해 『글짜씨』를 발췌 출판한 실험 사이트이다. 현존하는 디지털 읽기 환경의 아쉬운 점을 보완해 디지털 환경에서의 한글 읽기 경험을 실험하고자 했으며, 『글짜씨』의 일부 내용을 포함하지 않고 있다.
              </p>
            </div>
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* 목차 */}
        <div className="grid grid-cols-5 gap-0 lg:pt-12">
          <div className="col-span-1"></div>
          {issues.map((issue) => (
            <div key={issue._id} className="col-span-1 pr-2 space-y-4">
              <div className="mb-6">
                <p className="각주폰트-민부리 font-bold mb-1">{issue.number}</p>
                <p className="본문폰트 mb-4">{issue.title}</p>
              </div>

              {issue.sections && issue.sections.length > 0 ? (
                <div className="space-y-6">
                  {issue.sections.map((section: any, sectionIdx: number) => (
                    <div key={`${issue._id}-${section._id || sectionIdx}`} className="space-y-2">
                      <p className="각주폰트-민부리 font-bold">{section.title}</p>

                      {section.articles && section.articles.length > 0 && (
                        <div className="space-y-1.5">
                          {section.articles.map((article: any, idx: number) => (
                            <div key={`${article._id || idx}`} className="group">
                              {section.title === '인터뷰' ? (
                                <Link
                                  href={`/articles/${article.slug?.current || article._id}`}
                                  className="block 본문폰트 hover:text-black transition"
                                  onMouseEnter={() => setPreviewUrl(pickRandomImageUrl(article))}
                                  onMouseLeave={() => setPreviewUrl(null)}
                                >
                                  {article.title || '제목 없음'}
                                </Link>
                              ) : (
                                <Link
                                  href={`/articles/${article.slug?.current || article._id}`}
                                  className="block 본문폰트 hover:text-black transition relative"
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
                <div className="본문폰트 text-gray-400">업데이트 예정입니다.</div>
              )}
            </div>
          ))}
        </div>

        {/* ▼ 호버시 중앙 프리뷰 이미지 */}
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
    </div>
  )
}