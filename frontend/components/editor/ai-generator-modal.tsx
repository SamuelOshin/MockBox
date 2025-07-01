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

  // Theme-aware colors
  const themeColors = {
    modalBg: actualTheme === 'light'
      ? 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
      : 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950',
    headerBg: actualTheme === 'light'
      ? 'bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50'
      : 'bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20',
    borderColor: actualTheme === 'light' ? 'border-gray-200' : 'border-gray-700',
    text: actualTheme === 'light' ? 'text-gray-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-gray-600' : 'text-gray-400',
    titleGradient: actualTheme === 'light'
      ? 'bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent',
    buttonHover: actualTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
    scrollbarClasses: actualTheme === 'light'
      ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-purple-400'
      : '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-purple-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-purple-500'
  }

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
        className={`max-w-6xl w-full h-[90vh] p-0 overflow-hidden border-0 shadow-2xl flex flex-col [&>button]:hidden ai-modal-override ${actualTheme}`}
        style={{
          maxHeight: '90vh',
          background: actualTheme === 'dark'
            ? 'linear-gradient(135deg, #030712 0%, #111827 50%, #1e3a8a 100%) !important'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%) !important',
          backgroundColor: actualTheme === 'dark' ? '#030712 !important' : '#f8fafc !important'
        }}
        data-theme={actualTheme}
      >        <div
          className={`w-full h-full flex flex-col ${actualTheme}`}
        >{/* Header */}
          <DialogHeader
            className={`px-6 py-5 border-b ${themeColors.borderColor} shrink-0`}
            style={{
              background: actualTheme === 'dark'
                ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)'
                : 'linear-gradient(135deg, #fdf4ff 0%, #f0f9ff 50%, #eef2ff 100%)',
              backgroundColor: actualTheme === 'dark' ? '#1e1b4b !important' : '#fdf4ff !important'
            }}
          >
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className={`text-2xl font-bold ${themeColors.titleGradient}`}>
                    AI Mock Generator Studio
                  </DialogTitle>
                  <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                    Generate intelligent, realistic mock data with AI-powered assistance
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className={`rounded-full h-10 w-10 p-0 ${themeColors.buttonHover}`}
              >
                <X className={`h-5 w-5 ${themeColors.text}`} />
              </Button>          </div>
        </DialogHeader>        {/* Content - Scrollable */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${themeColors.scrollbarClasses}`}
        ><div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >              <AIEnhancedGenerator
                onMockGenerated={handleMockGenerated}
                onMockSaved={handleMockSaved}
                onResponseGenerated={onResponseGenerated}
                initialEndpoint={initialEndpoint}
                initialMethod={initialMethod}
                className="border-none shadow-none bg-transparent w-full"
                isMinimized={false}
                onClose={handleClose}
              /></motion.div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
