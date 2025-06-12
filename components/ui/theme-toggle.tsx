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
      description: "Always use light theme",
      emoji: "☀️"
    },
    { 
      value: "dark", 
      label: "Dark", 
      icon: Moon,
      description: "Always use dark theme",
      emoji: "🌙"
    },
    { 
      value: "system", 
      label: "System", 
      icon: Monitor,
      description: "Use system preference",
      emoji: "🖥️"
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

  // Button variants with enhanced styling
  const buttonVariants = {
    default: "bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transition-all duration-200",
    minimal: "text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200",
    button: "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-white hover:from-blue-500/20 hover:to-purple-600/20 hover:border-blue-500/30 transition-all duration-200"
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
          className="w-56 bg-black/90 backdrop-blur-xl border-white/10 shadow-2xl"
          sideOffset={8}
        >
          <div className="p-1">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 py-1">
              Theme Preference
            </div>
            <AnimatePresence>
              {themeOptions.map((option, index) => {
                const Icon = option.icon
                const isSelected = theme === option.value
                
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <DropdownMenuItem
                      onClick={() => setTheme(option.value as any)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg mx-1 my-1",
                        "text-white/80 hover:text-white hover:bg-white/10",
                        "transition-all duration-200 relative group",
                        isSelected && "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-base">{option.emoji}</span>
                        <motion.div
                          animate={{ 
                            rotate: isSelected ? 360 : 0,
                            scale: isSelected ? 1.1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <Icon className={cn(
                            "h-4 w-4 transition-colors duration-200",
                            isSelected ? "text-blue-400" : "text-white/60"
                          )} />
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors duration-200">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="flex-shrink-0"
                          >
                            <Check className="h-4 w-4 text-blue-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </DropdownMenuItem>
                  </motion.div>
                )
              })}
            </AnimatePresence>
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
        className="w-64 bg-black/95 backdrop-blur-xl border-white/10 shadow-2xl"
        sideOffset={8}
      >
        <div className="p-2">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3 py-1 border-b border-white/10">
            Theme Preference
          </div>
          
          <AnimatePresence>
            {themeOptions.map((option, index) => {
              const Icon = option.icon
              const isSelected = theme === option.value
              
              return (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.07,
                    type: "spring",
                    stiffness: 300
                  }}
                >
                  <DropdownMenuItem
                    onClick={() => setTheme(option.value as any)}
                    className={cn(
                      "flex items-center gap-4 px-3 py-4 cursor-pointer rounded-xl m-1",
                      "text-white/80 hover:text-white hover:bg-white/10",
                      "transition-all duration-200 relative group border border-transparent",
                      isSelected && "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border-blue-500/30 shadow-lg shadow-blue-500/10"
                    )}
                  >
                    {/* Selection indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ scaleX: 0 }}
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                        />
                      )}
                    </AnimatePresence>
                    
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xl">{option.emoji}</span>
                      <motion.div
                        animate={{ 
                          rotate: isSelected ? 360 : 0,
                          scale: isSelected ? 1.1 : 1
                        }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="flex-shrink-0"
                      >
                        <Icon className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          isSelected ? "text-blue-400 drop-shadow-sm" : "text-white/60"
                        )} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{option.label}</div>
                        <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors duration-200">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-400/20 border border-blue-400/50 flex items-center justify-center">
                            <Check className="h-3 w-3 text-blue-400" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DropdownMenuItem>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {/* Footer info */}
          <motion.div 
            className="mt-3 pt-3 px-3 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-xs text-white/40 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span>Preference saved automatically</span>
            </div>
          </motion.div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
