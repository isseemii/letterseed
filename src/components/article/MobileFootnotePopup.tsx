import { AnimatePresence, motion } from 'framer-motion'
import { getBgColor, getBorderColor, getTextColor } from '@/lib/DarkModeUtils'
import { getFootnoteClasses } from '@/lib/typography'
import type { FootnoteItem } from './types'

const LEADING_SPECIAL_PATTERN = /^[\p{P}\p{S}]/u

const hasLeadingSpecialChar = (text: string): boolean => {
  const trimmed = text.replace(/^\s+/u, '')
  if (!trimmed) return false
  return LEADING_SPECIAL_PATTERN.test(trimmed[0])
}

type Props = {
  popup: Pick<FootnoteItem, 'number' | 'text'> | null
  isDarkMode: boolean
  onClose: () => void
  renderTextWithLinks: (text: string) => React.ReactNode
}

export function MobileFootnotePopup({ popup, isDarkMode, onClose, renderTextWithLinks }: Props) {
  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }}
          className="sidebar-hidden fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(53px+env(safe-area-inset-bottom)+10px)]"
        >
          <div
            className={`${getBgColor(isDarkMode)} ${getBorderColor(isDarkMode, 'light')} border rounded-xl shadow-xl max-h-[42vh] overflow-y-auto relative`}
          >
            <button
              onClick={onClose}
              className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity z-10 ${getTextColor(isDarkMode, 'subtle')}`}
              aria-label="각주 닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={`p-5 pr-11 ${getTextColor(isDarkMode, 'muted')}`}>
              <div className={getFootnoteClasses('text')}>
                <span className={getTextColor(isDarkMode)}>[{popup.number}]</span>
                <div className={`mt-2 leading-relaxed ${hasLeadingSpecialChar(popup.text) ? 'ls-leading-special ls-leading-special-safe' : ''}`}>
                  {renderTextWithLinks(popup.text)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
