'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  // 초기값을 localStorage에서 읽어오되, SSR을 고려해 false로 시작
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // localStorage에서 저장된 다크모드 상태 읽기
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      try {
        const savedValue = JSON.parse(saved)
        setIsDarkMode(savedValue)
      } catch (e) {
        // 파싱 에러 시 기본값 사용
        setIsDarkMode(false)
      }
    } else {
      // 저장된 값이 없으면 기본값(라이트모드)
      setIsDarkMode(false)
    }
  }, [])

  // 다크모드 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    }
  }, [isDarkMode, mounted])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  // hydration mismatch 방지: 클라이언트에서만 렌더링
  if (!mounted) {
    return (
      <DarkModeContext.Provider value={{ isDarkMode: false, toggleDarkMode }}>
        {children}
      </DarkModeContext.Provider>
    )
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}