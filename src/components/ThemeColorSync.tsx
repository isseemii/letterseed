'use client'

import { useEffect } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

/** 다크모드일 때 브라우저 주소창·상태바(theme-color)를 어둡게 맞춤 */
const THEME_COLOR_LIGHT = '#ffffff'
const THEME_COLOR_DARK = '#171717'

export function ThemeColorSync() {
  const { isDarkMode } = useDarkMode()

  useEffect(() => {
    const color = isDarkMode ? THEME_COLOR_DARK : THEME_COLOR_LIGHT

    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', color)

    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  return null
}
