'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sparkles,
  Wand2,
  Zap,
  Lightbulb,
  RefreshCw,
  Settings,
  TrendingUp,
  Star,
  X,
  Plus,
  Code2,
  Database,
  Brain,
  Target,
  Shuffle,
  Wand
} from 'lucide-react'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { cn } from '@/lib/utils'

interface AIFloatingActionButtonProps {
  onGenerateRequest?: () => void
  onOpenFullGenerator?: () => void
  onQuickGenerate?: (type: string) => void
  className?: string
  disabled?: boolean
}

const quickActions = [
  {
    id: 'user',
    icon: Database,
    label: 'User Data',
    description: 'Generate user profiles',
    color: 'blue',
    prompt: 'Generate a realistic user profile with personal details'
  },
  {
    id: 'product',
    icon: Star,
    label: 'Product',
    description: 'E-commerce product data',
    color: 'green',
    prompt: 'Generate an e-commerce product with details and pricing'
  },
  {
    id: 'analytics',
    icon: TrendingUp,
    label: 'Analytics',
    description: 'Dashboard metrics',
    color: 'purple',
    prompt: 'Generate analytics dashboard data with metrics'
  },
  {
    id: 'random',
    icon: Shuffle,
    label: 'Surprise Me',
    description: 'Random useful data',
    color: 'pink',
    prompt: 'Generate interesting and useful mock data'
  }
]

export function AIFloatingActionButton({
  onGenerateRequest,
  onOpenFullGenerator,
  onQuickGenerate,
  className,
  disabled = false
}: AIFloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { usage, isGenerating } = useAIGeneration()
  // Icon rendering function with fallback
  const renderMainIcon = () => {
    if (isGenerating) {
      return <RefreshCw className="h-7 w-7 text-white animate-spin" />
    }

    if (isExpanded) {
      return <X className="h-7 w-7 text-white" />
    }

    // Use Wand2 as the primary icon
    return <Wand2 className="h-7 w-7 text-white" />
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (disabled || isGenerating) return

    if (isExpanded) {
      // If expanded, just close it
      setIsExpanded(false)
    } else {
      // If not expanded, open full generator directly
      if (onOpenFullGenerator) {
        onOpenFullGenerator()
      }
    }
  }
  const handleQuickAction = (action: typeof quickActions[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled || isGenerating) return

    onQuickGenerate?.(action.id)
    setIsExpanded(false)
  }

  const getRemainingGenerations = () => {
    return usage?.rateLimitRemaining || 0
  }
  const isLowOnGenerations = getRemainingGenerations() <= 2
    return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-72 shadow-2xl border-purple-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">AI Quick Actions</div>
                      <div className="text-xs text-muted-foreground">
                        {getRemainingGenerations()} generations left today
                      </div>
                    </div>
                  </div>                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsExpanded(false)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Usage Warning */}
                {isLowOnGenerations && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        Running low on AI generations
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Quick Actions */}                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Quick Generate</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.id}
                        onClick={(e) => handleQuickAction(action, e)}
                        disabled={disabled || isGenerating || getRemainingGenerations() === 0}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all group",
                          "hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                          "hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        )}
                        whileHover={{ scale: disabled ? 1 : 1.02 }}
                        whileTap={{ scale: disabled ? 1 : 0.98 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                            <action.icon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs">{action.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Separator />                {/* Advanced Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenFullGenerator}
                    disabled={disabled}
                    className="flex-1 text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Open AI Studio
                  </Button>
                </div>
              </CardContent>            </Card>
          </motion.div>
        )}
      </AnimatePresence>        {/* Main FAB */}
      <motion.div
        className="relative"
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggle}
              disabled={disabled}
              className={cn(
                "w-16 h-16 rounded-full shadow-2xl transition-all duration-200 border-2 border-white/20",
                "bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-700",
                "hover:from-purple-600 hover:via-blue-700 hover:to-indigo-800",
                "disabled:from-gray-400 disabled:to-gray-500",
                "hover:shadow-3xl active:scale-95",
                "flex items-center justify-center p-0",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
            {renderMainIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white border-gray-700">
            <p className="font-medium">AI Mock Generator</p>
            <p className="text-xs text-gray-300">Generate intelligent mock data</p>
          </TooltipContent>
        </Tooltip>

        {/* Usage Badge */}
        {!isExpanded && usage && (
          <Badge
            variant={isLowOnGenerations ? "destructive" : "secondary"}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
          >
            {getRemainingGenerations()}
          </Badge>
        )}
      </motion.div>
    </div>
  )
}
