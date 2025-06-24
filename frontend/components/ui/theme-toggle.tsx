"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ui/theme-provider"
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  variant?: "default" | "minimal" | "button"
  size?: "sm" | "default" | "lg"
  className?: string
  showLabel?: boolean
  align?: "start" | "center" | "end"
}

export function ThemeToggle({
  variant = "default",
  size = "default",
  className,
  showLabel = false,
  align = "end"
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Light mode"
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Dark mode"
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "System preference"
    }
  ]

  const currentThemeOption = themeOptions.find(option => option.value === theme)
  const CurrentIcon = currentThemeOption?.icon || Monitor

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative p-2 rounded-full opacity-50",
          className
        )}
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }  // Enhanced icon animations based on theme
  const iconAnimations = {
    light: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    dark: {
      rotate: [0, -360],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    system: {
      scale: [1, 0.9, 1],
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }
  // Button variants with enhanced styling - theme-aware
  const buttonVariants = {
    default: actualTheme === 'light'
      ? "bg-slate-100/80 backdrop-blur-md border border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 shadow-lg hover:shadow-xl transition-all duration-200"
      : "bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transition-all duration-200",
    minimal: actualTheme === 'light'
      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
      : "text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200",
    button: actualTheme === 'light'
      ? "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-slate-700 hover:from-blue-500/20 hover:to-purple-600/20 hover:border-blue-500/30 transition-all duration-200"
      : "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-white hover:from-blue-500/20 hover:to-purple-600/20 hover:border-blue-500/30 transition-all duration-200"
  }

  const sizeVariants = {
    sm: "h-8 px-2 text-sm",
    default: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base"
  }
  if (variant === "minimal") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "relative p-2 rounded-full transition-all duration-200 group",
              buttonVariants.minimal,
              className
            )}
          >            <motion.div
              key={`${actualTheme}-${theme}`}
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{
                rotate: 0,
                opacity: 1,
                scale: 1
              }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <CurrentIcon className="h-4 w-4 drop-shadow-sm" />
            </motion.div>

            {/* Subtle glow effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 -z-10"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent
          align={align}
          className={cn(
            "w-48 border shadow-lg",
            actualTheme === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-gray-900 border-gray-700'
          )}
          sideOffset={8}
        >
          <div className="p-1">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-md mx-1 my-0.5",
                    "transition-all duration-150",
                    actualTheme === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800',
                    isSelected && (actualTheme === 'light' ? 'bg-gray-100' : 'bg-gray-800')
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{option.label}</span>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-blue-500"
                    />
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "relative transition-all duration-200 group overflow-hidden",
            buttonVariants[variant],
            sizeVariants[size],
            className
          )}
        >
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100"
            animate={{ opacity: isOpen ? 0.3 : 0 }}
            transition={{ duration: 0.2 }}
          />
            <motion.div
            key={`${actualTheme}-${theme}`}
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{
              rotate: 0,
              opacity: 1,
              scale: 1
            }}
            exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="flex items-center gap-2 relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CurrentIcon className="h-4 w-4 drop-shadow-sm" />
            {showLabel && (
              <motion.span
                className="text-sm font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentThemeOption?.label}
              </motion.span>
            )}
          </motion.div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            className="relative z-10"
          >
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
        <DropdownMenuContent
        align={align}
        className={cn(
          "w-48 border shadow-lg",
          actualTheme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-gray-900 border-gray-700'
        )}
        sideOffset={8}
      >
        <div className="p-1">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value as any)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-md mx-1 my-0.5",
                  "transition-all duration-150",
                  actualTheme === 'light'
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-gray-800',
                  isSelected && (actualTheme === 'light' ? 'bg-gray-100' : 'bg-gray-800')
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{option.label}</span>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-blue-500"
                  />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
