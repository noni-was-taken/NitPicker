import { useEffect, useState } from 'react'

const THEME_EVENT = 'themechange'

export function useTheme() {
  // index.html already applied the saved or OS theme before React loaded.
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch {
      // Storage blocked: the theme still works for this visit.
    }
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { isDark } }))
  }, [isDark])

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const nextIsDark = (event as CustomEvent<{ isDark?: boolean }>).detail?.isDark
      if (typeof nextIsDark === 'boolean') {
        setIsDark(nextIsDark)
      }
    }

    window.addEventListener(THEME_EVENT, handleThemeChange)
    return () => window.removeEventListener(THEME_EVENT, handleThemeChange)
  }, [])
  const toggle = () => setIsDark((prev) => !prev)

  return { isDark, toggle }
}
