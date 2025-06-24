"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface LineLoaderProps {
  color?: string
  height?: string
  duration?: number
}

interface NavigationContextType {
  isNavigating: boolean
  startNavigation: () => void
  completeNavigation: () => void
  navigateTo: (href: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentPathRef = useRef(pathname)

  const startNavigation = () => {
    setIsNavigating(true)
  }

  const completeNavigation = () => {
    setIsNavigating(false)
  }

  const navigateTo = (href: string) => {
    // Only start navigation if we're actually changing pages
    if (href !== pathname && href !== currentPathRef.current) {
      setIsNavigating(true)
      router.push(href)
    }
  }

  // Complete navigation when pathname actually changes
  useEffect(() => {
    // If pathname changed and we were navigating, complete the navigation
    if (pathname !== currentPathRef.current && isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false)
        currentPathRef.current = pathname
      }, 200) // Small delay for smooth animation
      return () => clearTimeout(timer)
    }
    currentPathRef.current = pathname
  }, [pathname, isNavigating])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, completeNavigation, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function LineLoader({
  color = "bg-gradient-to-r from-blue-500 to-purple-600",
  height = "h-1",
  duration = 800
}: LineLoaderProps) {
  const { isNavigating } = useNavigation()

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className={`fixed top-0 left-0 right-0 z-[9999] ${height} ${color}`}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 1, transformOrigin: "right" }}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Enhanced hook for manual loading control with navigation context
export function useLineLoader() {
  const { isNavigating, startNavigation, completeNavigation, navigateTo } = useNavigation()

  return {
    isLoading: isNavigating,
    startLoading: startNavigation,
    stopLoading: completeNavigation,
    navigateTo
  }
}
