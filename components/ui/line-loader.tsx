"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface LineLoaderProps {
  color?: string
  height?: string
  duration?: number
}

export function LineLoader({ 
  color = "bg-gradient-to-r from-blue-500 to-purple-600", 
  height = "h-1",
  duration = 2000 
}: LineLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Simulate route change loading
    handleStart()
    const timer = setTimeout(handleComplete, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={`fixed top-0 left-0 right-0 z-[9999] ${height} ${color}`}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 1, transformOrigin: "right" }}
          transition={{ 
            duration: duration / 1000,
            ease: "easeInOut"
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Hook for manual loading control
export function useLineLoader() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, startLoading, stopLoading }
}