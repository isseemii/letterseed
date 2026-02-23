import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getBgColor, getBorderColor, getHoverTextColor, getTextColor } from '@/lib/DarkModeUtils'
import { getFootnoteClasses, TYPOGRAPHY } from '@/lib/typography'
import type { ArticleNavigationData, FootnoteItem } from './types'

const LEADING_SPECIAL_PATTERN = /^[\p{P}\p{S}]/u

const hasLeadingSpecialChar = (text: string): boolean => {
  const trimmed = text.replace(/^\s+/u, '')
  if (!trimmed) return false
  return LEADING_SPECIAL_PATTERN.test(trimmed[0])
}

type DesktopSidebarProps = {
  isDarkMode: boolean
  article: ArticleNavigationData
  hasFootnotesInContent: boolean
  footnotesList: FootnoteItem[]
  activeFootnoteNumber: number | null
  setActiveFootnoteNumber: (number: number | null) => void
  renderTextWithLinks: (text: string) => React.ReactNode
}

export function ArticleDesktopSidebar({
  isDarkMode,
  article,
  hasFootnotesInContent,
  footnotesList,
  activeFootnoteNumber,
  setActiveFootnoteNumber,
  renderTextWithLinks,
}: DesktopSidebarProps) {
  const showBottomBars = true
  const [showAllFootnotes, setShowAllFootnotes] = useState(false)
  const [showArticleNavigation, setShowArticleNavigation] = useState(false)
  const [showSingleFootnoteView, setShowSingleFootnoteView] = useState(false)
  const [lastSelectedFootnoteNumber, setLastSelectedFootnoteNumber] = useState<number | null>(null)

  const selectedFootnotes = useMemo(() => {
    if (!showSingleFootnoteView) return footnotesList
    const targetNumber = activeFootnoteNumber ?? lastSelectedFootnoteNumber
    if (targetNumber === null) return footnotesList
    const selected = footnotesList.find((footnote) => footnote.number === targetNumber)
    return selected ? [selected] : footnotesList
  }, [activeFootnoteNumber, footnotesList, lastSelectedFootnoteNumber, showSingleFootnoteView])
  const currentSelectedFootnote = selectedFootnotes[0] ?? null

  useEffect(() => {
    if (activeFootnoteNumber !== null) {
      setLastSelectedFootnoteNumber(activeFootnoteNumber)
      setShowSingleFootnoteView(true)
      setShowAllFootnotes(true)
      return
    }
    if (showSingleFootnoteView && showAllFootnotes) {
      setShowAllFootnotes(false)
    }
  }, [activeFootnoteNumber, showAllFootnotes, showSingleFootnoteView])

  useEffect(() => {
    if (!showAllFootnotes) {
      setShowSingleFootnoteView(false)
      setLastSelectedFootnoteNumber(null)
    }
  }, [showAllFootnotes])

  const dividerClass = 'border-t border-black'

  return (
    <aside className="sidebar-block h-full overflow-y-auto px-6 py-10">
      <div className="flex h-full min-h-0 flex-col">
        <div className="w-full">
          <div className="flex w-full items-end justify-between">

            <Link
              href="/"
              className={`inline-flex items-center justify-center ${getTextColor(isDarkMode)}`}
              aria-label="홈으로 이동"
            >
              <p className={`text-s 각주폰트-민부리`}>글짜씨</p>
              {/* <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.79 14.77a.75.75 0 0 1-1.06.02L7.25 10.5l4.48-4.29a.75.75 0 1 1 1.04 1.08L9.38 10.5l3.39 3.21a.75.75 0 0 1 .02 1.06Z" />
              </svg> */}
            </Link>
          </div>

          <AnimatePresence initial={false}>
            {showBottomBars && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
                className="text-left"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowAllFootnotes((prev) => {
                      const next = !prev
                      if (!next) {
                        setActiveFootnoteNumber(null)
                      } else {
                        setShowSingleFootnoteView(false)
                        setLastSelectedFootnoteNumber(null)
                      }
                      return next
                    })
                  }
                  className="w-full py-2 text-left"
                  aria-label="모든 각주 보기 토글"
                >
                  <span className={`block ${dividerClass}`} />
                </button>
                <AnimatePresence initial={false}>
                  {showAllFootnotes && hasFootnotesInContent && footnotesList.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}
                      className={`${getFootnoteClasses('text')} px-1 ${getTextColor(isDarkMode, 'muted')}`}
                    >
                      <div className="px-1">
                        <div className="max-h-[60vh] overflow-y-auto space-y-2">
                          {showSingleFootnoteView && currentSelectedFootnote ? (
                            <div className="block w-full text-left">
                              <span className={`block ${getTextColor(isDarkMode)}`}>{currentSelectedFootnote.number}</span>
                              <span className={`block ${hasLeadingSpecialChar(currentSelectedFootnote.text) ? 'ls-leading-special ls-leading-special-safe' : ''}`}>
                                {renderTextWithLinks(currentSelectedFootnote.text)}
                              </span>
                            </div>
                          ) : (
                            selectedFootnotes.map((footnote) => (
                              <div key={footnote.number} className="block w-full text-left">
                                <span className={`block ${getTextColor(isDarkMode)}`}>{footnote.number}</span>
                                <span className={`block ${hasLeadingSpecialChar(footnote.text) ? 'ls-leading-special ls-leading-special-safe' : ''}`}>
                                  {renderTextWithLinks(footnote.text)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowArticleNavigation((prev) => !prev)}
                    className="w-full py-2 text-left"
                    aria-label="이전 글 토글"
                  >
                    <span className={`block ${dividerClass}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {showArticleNavigation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                        className=""
                      >
                        {article?.prevArticle ? (
                          <Link
                            href={`/articles/${article.prevArticle.slug}`}
                            className={`group block ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                          >
                            <div className={`${TYPOGRAPHY.ui.navLink} mb-1 font-bold`}>이전 글</div>
                            <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-3 overflow-hidden ${hasLeadingSpecialChar(article.prevArticle.title) ? 'ls-leading-special ls-leading-special-safe' : ''}`}>
                              {article.prevArticle.title}
                            </div>
                          </Link>
                        ) : (
                          <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>이전 글 없음</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowArticleNavigation((prev) => !prev)}
                    className="w-full py-2 text-left"
                    aria-label="다음 글 토글"
                  >
                    <span className={`block ${dividerClass}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {showArticleNavigation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                        className="pb-2"
                      >
                        {article?.nextArticle ? (
                          <Link
                            href={`/articles/${article.nextArticle.slug}`}
                            className={`group block ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                          >
                            <div className={`${TYPOGRAPHY.ui.navLink} mb-1 font-bold`}>다음 글</div>
                            <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-3 overflow-hidden ${hasLeadingSpecialChar(article.nextArticle.title) ? 'ls-leading-special ls-leading-special-safe' : ''}`}>
                              {article.nextArticle.title}
                            </div>
                          </Link>
                        ) : (
                          <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>다음 글 없음</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}

type MobileNavProps = {
  showNavigation: boolean
  isDarkMode: boolean
  article: ArticleNavigationData
}

export function ArticleMobileBottomNavigation({ showNavigation, isDarkMode, article }: MobileNavProps) {
  return (
    <AnimatePresence>
      {showNavigation && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          className={`sidebar-hidden fixed bottom-0 left-0 right-0 border-t shadow-lg z-50 transition-colors duration-300 pb-1 h-[53px] ${getBgColor(isDarkMode)} ${getBorderColor(isDarkMode, 'light')}`}
        >
          <div className="max-w-[1400px] mx-auto px-5 py-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="col-span-1">
                {article?.prevArticle ? (
                  <Link
                    href={`/articles/${article.prevArticle.slug}`}
                    className={`group flex items-center gap-1.5 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                  >
                    <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className={TYPOGRAPHY.ui.navLink}>이전</span>
                  </Link>
                ) : (
                  <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>이전 글 없음</div>
                )}
              </div>

              <div className="col-span-1 flex justify-center">
                <Link
                  href="/"
                  className={`flex items-center ${TYPOGRAPHY.ui.navLink} transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                >
                  글짜씨
                </Link>
              </div>

              <div className="col-span-1 text-right">
                {article?.nextArticle ? (
                  <Link
                    href={`/articles/${article.nextArticle.slug}`}
                    className={`group flex items-center justify-end gap-1.5 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
                  >
                    <span className={TYPOGRAPHY.ui.navLink}>다음</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                ) : (
                  <div className={`${TYPOGRAPHY.ui.navLink} ${getTextColor(isDarkMode, 'subtle')}`}>다음 글 없음</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
