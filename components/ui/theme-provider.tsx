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

    // Apply theme with smooth transitions
    const root = window.document.documentElement
    
    // Add transition class for smooth theme switching
    root.classList.add('theme-transitioning')
    
    // Remove existing theme classes
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      setActualTheme(systemTheme)
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        const newSystemTheme = e.matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(newSystemTheme)
        setActualTheme(newSystemTheme)
      }
      
      mediaQuery.addEventListener("change", handleChange)
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning')
      }, 200)
      
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
        root.classList.remove('theme-transitioning')
      }
    } else {
      root.classList.add(theme)
      setActualTheme(theme)
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning')
      }, 200)
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