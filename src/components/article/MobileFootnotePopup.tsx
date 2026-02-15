import { getFootnoteClasses } from '@/lib/typography'
import type { FootnoteItem } from './types'

type Props = {
  popup: Pick<FootnoteItem, 'number' | 'text'> | null
  onClose: () => void
  renderTextWithLinks: (text: string) => React.ReactNode
}

export function MobileFootnotePopup({ popup, onClose, renderTextWithLinks }: Props) {
  if (!popup) return null

  return (
    <div
      className="md:hidden fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-[90%] max-h-[80%] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-8">
          <div className={getFootnoteClasses('text')}>
            <span>[{popup.number}]</span>
            <div className="mt-2">
              {renderTextWithLinks(popup.text)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
