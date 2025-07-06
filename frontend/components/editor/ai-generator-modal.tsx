'use client'

import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import {
  Sparkles,
  X
} from 'lucide-react'
import { AIEnhancedGenerator } from './ai-enhanced-generator'
import { HTTPMethod } from '@/lib/types'

interface AIGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onMockGenerated?: (mockData: any) => void
  onMockSaved?: (mock: any) => void
  onResponseGenerated?: (response: string) => void
  initialEndpoint?: string
  initialMethod?: HTTPMethod
  className?: string
}

export function AIGeneratorModal({
  isOpen,
  onClose,
  onMockGenerated,
  onMockSaved,
  onResponseGenerated,
  initialEndpoint = '',
  initialMethod = 'GET',
  className = ''
}: AIGeneratorModalProps) {
  const { theme, resolvedTheme } = useTheme()
  const actualTheme = resolvedTheme || theme || 'light'

  const handleClose = () => {
    onClose()
  }
  
  const handleMockGenerated = (mockData: any) => {
    onMockGenerated?.(mockData)
  }

  const handleMockSaved = (mock: any) => {
    onMockSaved?.(mock)
    // Close modal after successful save
    handleClose()
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-6xl w-full h-[90vh] p-0 overflow-hidden border-0 shadow-2xl flex flex-col [&>button]:hidden bg-background`}
        style={{
          maxHeight: '90vh'
        }}
        data-theme={actualTheme}
      >        <div
          className="w-full h-full flex flex-col bg-background"
        >        {/* Header */}
          <div className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-foreground">AI Mock Generator</h1>
              <p className="text-muted-foreground text-sm">
                Generate realistic mock data with AI-powered assistance. Describe what you need below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>        {/* Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-theme">
          <div className="p-6 bg-background">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <AIEnhancedGenerator
                onMockGenerated={handleMockGenerated}
                onMockSaved={handleMockSaved}
                onResponseGenerated={onResponseGenerated}
                initialEndpoint={initialEndpoint}
                initialMethod={initialMethod}
                className="w-full"
                isMinimized={false}
                onClose={handleClose}
                hideHeader={true}
              />
            </motion.div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
