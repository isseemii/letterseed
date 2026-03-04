import type { ReactNode } from 'react'
import { getTextColor } from '@/lib/DarkModeUtils'

type ChronologyRow = {
  periodLabel?: string
  year?: string
  domestic?: string[]
  global?: string[]
}

type ChronologyTableValue = {
  title?: string
  version?: string
  note?: string
  yearHeader?: string
  domesticHeader?: string
  globalHeader?: string
  rows?: ChronologyRow[]
}

const renderLines = (lines: string[] | undefined): ReactNode => {
  const safeLines = Array.isArray(lines) ? lines.filter((line) => line && line.trim().length > 0) : []
  if (safeLines.length === 0) return null

  return (
    <ul className="space-y-1">
      {safeLines.map((line, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="mt-[0.45em] inline-block h-1 w-1 shrink-0 rounded-full bg-current" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

export function ChronologyTable({
  value,
  isDarkMode,
}: {
  value: ChronologyTableValue
  isDarkMode: boolean
}) {
  const rows = Array.isArray(value?.rows) ? value.rows : []
  if (rows.length === 0) return null

  const yearHeader = value?.yearHeader || '년도'
  const domesticHeader = value?.domesticHeader || '국내'
  const globalHeader = value?.globalHeader || '세계'
  const periodLinks = rows.reduce<{ label: string; anchorId: string }[]>((acc, row, idx) => {
    const label = (row.periodLabel || '').trim()
    if (!label) return acc
    if (acc.some((item) => item.label === label)) return acc
    acc.push({ label, anchorId: `chronology-period-${idx}` })
    return acc
  }, [])

  return (
    <section className={`my-10 md:my-16 ${getTextColor(isDarkMode)}`}>
      {periodLinks.length > 0 && (
        <nav className="mb-4 flex flex-wrap gap-x-3 gap-y-1 각주폰트-민부리" aria-label="연표 구간 바로가기">
          {periodLinks.map((period) => (
            <a key={period.anchorId} href={`#${period.anchorId}`} className="underline underline-offset-2">
              {period.label}
            </a>
          ))}
        </nav>
      )}

      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border-b border-current pb-2 각주폰트-민부리">{yearHeader}</div>
        <div className="border-b border-current pb-2 각주폰트-민부리">{domesticHeader}</div>
        <div className="border-b border-current pb-2 각주폰트-민부리">{globalHeader}</div>

        {rows.map((row, idx) => (
          <div key={idx} className="contents">
            <div
              id={row.periodLabel && row.periodLabel.trim() ? `chronology-period-${idx}` : undefined}
              className="border-t border-current px-2 py-1 align-top 각주폰트-민부리"
            >
              {row.year || ''}
            </div>
            <div className="border-t border-current px-2 py-1 align-top 각주폰트-민부리">
              {renderLines(row.domestic)}
            </div>
            <div className="border-t border-current px-2 py-1 align-top 각주폰트-민부리">
              {renderLines(row.global)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

