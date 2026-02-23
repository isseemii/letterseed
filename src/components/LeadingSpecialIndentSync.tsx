'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const BODY_TYPOGRAPHY_CLASSES = [
  '본문폰트',
  '본문폰트-민부리',
  '본문폰트-볼드',
  '각주폰트-민부리',
]
const BODY_CONTENT_ROOT_SELECTOR = 'main, article'
const LEADING_SPECIAL_TARGET_SELECTOR = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '.본문폰트',
  '.본문폰트-민부리',
  '.본문폰트-볼드',
  '.각주폰트-민부리',
].join(', ')

const LEADING_SPECIAL_CLASS = 'ls-leading-special'
const LEADING_SPECIAL_PATTERN = /^[\p{P}\p{S}]/u

const isBodyTextElement = (element: HTMLElement): boolean => {
  for (const className of BODY_TYPOGRAPHY_CLASSES) {
    if (element.classList.contains(className)) return true
    if (element.closest(`.${className}`)) return true
  }
  if (element.closest(BODY_CONTENT_ROOT_SELECTOR)) return true
  return false
}

const syncLeadingSpecialIndent = (): void => {
  const textElements = document.querySelectorAll<HTMLElement>(LEADING_SPECIAL_TARGET_SELECTOR)

  textElements.forEach((element) => {
    if (!isBodyTextElement(element)) {
      element.classList.remove(LEADING_SPECIAL_CLASS)
      return
    }

    const text = (element.textContent || '').replace(/^\s+/u, '')
    if (text.length === 0) {
      element.classList.remove(LEADING_SPECIAL_CLASS)
      return
    }

    if (LEADING_SPECIAL_PATTERN.test(text[0])) {
      element.classList.add(LEADING_SPECIAL_CLASS)
      return
    }

    element.classList.remove(LEADING_SPECIAL_CLASS)
  })
}

export function LeadingSpecialIndentSync() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    let frameId = 0
    const scheduleSync = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(syncLeadingSpecialIndent)
    }

    scheduleSync()

    const observer = new MutationObserver(() => {
      scheduleSync()
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
