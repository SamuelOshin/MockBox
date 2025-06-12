"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  // Extract transition logic into a reusable function
  const applyThemeTransition = (callback: () => void) => {
    const root = window.document.documentElement
    root.classList.add('theme-transitioning')
    
    callback()
    
    // Single place to remove transition class
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 200)
  }

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Save theme to localStorage
    localStorage.setItem("theme", theme)

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      setActualTheme(systemTheme)
      
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        const newSystemTheme = e.matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(newSystemTheme)
        setActualTheme(newSystemTheme)
      }
      
      mediaQuery.addEventListener("change", handleChange)
      
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    } else {
      root.classList.add(theme)
      setActualTheme(theme)
    }
  }, [theme, mounted])
  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      <div className={mounted ? '' : 'no-transition'}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}