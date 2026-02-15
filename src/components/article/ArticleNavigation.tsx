import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { getBgColor, getBorderColor, getHoverTextColor, getTextColor } from '@/lib/DarkModeUtils'
import { getFootnoteClasses, TYPOGRAPHY } from '@/lib/typography'
import type { ArticleNavigationData, FootnoteItem } from './types'

type LeftProps = {
  isDarkMode: boolean
  article: ArticleNavigationData
}

export function ArticleLeftSidebar({ isDarkMode, article }: LeftProps) {
  return (
    <div className="sidebar-block fixed left-0 top-0 h-screen w-[365px] px-6 py-10 z-10">
      <div className="flex flex-col items-end justify-between h-full">
        <div className="flex justify-end">
          <Link
            href="/"
            className={`flex flex-col items-end gap-1 hover:opacity-80 transition-colors group ${getTextColor(isDarkMode, 'muted')} ${getHoverTextColor(isDarkMode)}`}
          >
            <div className="text-right">
              <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-1`}>돌아가기</div>
            </div>
          </Link>
        </div>

        <div className="flex justify-end">
          {article?.prevArticle ? (
            <Link
              href={`/articles/${article.prevArticle.slug}`}
              className={`group flex flex-col items-end gap-1 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
            >
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l-7 7 7 7" />
              </svg>
              <div className="text-right w-[300px]">
                <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-2 text-right`}>{article.prevArticle.title}</div>
              </div>
            </Link>
          ) : (
            <div className={`${TYPOGRAPHY.ui.navLink} text-right w-[300px] ${getTextColor(isDarkMode, 'subtle')}`}>
              <br /> 이전 글 없음
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type RightProps = {
  isDarkMode: boolean
  article: ArticleNavigationData
  hasFootnotesInContent: boolean
  footnotesList: FootnoteItem[]
  expandedFootnotes: { [key: number]: boolean }
  toggleFootnote: (number: number) => void
  renderTextWithLinks: (text: string) => React.ReactNode
}

export function ArticleRightSidebar({
  isDarkMode,
  article,
  hasFootnotesInContent,
  footnotesList,
  expandedFootnotes,
  toggleFootnote,
  renderTextWithLinks,
}: RightProps) {
  return (
    <div className="sidebar-block fixed right-0 top-0 h-screen w-[365px] px-6 py-10 z-10">
      <div className={`flex flex-col items-start h-full ${hasFootnotesInContent && footnotesList.length > 0 ? 'justify-between' : 'justify-end'}`}>
        {hasFootnotesInContent && footnotesList.length > 0 && (
          <div className="w-[300px] mb-auto overflow-y-auto pr-2 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
            <div className={`${getFootnoteClasses('text')} leading-relaxed text-left space-y-2 ${getTextColor(isDarkMode, 'muted')}`}>
              {footnotesList.map((footnote, idx) => {
                const isExpanded = expandedFootnotes[footnote.number] || false
                return (
                  <div key={idx} className="mb-4 overflow-hidden">
                    <button
                      onClick={() => toggleFootnote(footnote.number)}
                      className={`mr-2 mb-1 cursor-pointer hover:opacity-70 transition-opacity ${getTextColor(isDarkMode, 'muted')}`}
                    >
                      [{footnote.number}]
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.4, 0.0, 0.2, 1]
                          }}
                          style={{ overflow: 'hidden' }}
                        >
                          <span className="block mt-1">{renderTextWithLinks(footnote.text)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-start">
          {article?.nextArticle ? (
            <Link
              href={`/articles/${article.nextArticle.slug}`}
              className={`group flex flex-col items-start gap-1 transition-colors ${getTextColor(isDarkMode, 'subtle')} ${getHoverTextColor(isDarkMode)}`}
            >
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5l7 7-7 7" />
              </svg>
              <div className="text-left w-[150px]">
                <div className={`${TYPOGRAPHY.ui.navLink} line-clamp-2`}>{article.nextArticle.title}</div>
              </div>
            </Link>
          ) : (
            <div className={`${TYPOGRAPHY.ui.navLink} w-[300px] ${getTextColor(isDarkMode, 'subtle')}`}>
              <br /> 다음 글 없음
            </div>
          )}
        </div>
      </div>
    </div>
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
                  돌아가기
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
