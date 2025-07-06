'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Sparkles,
  Loader2,
  Copy,
  Save,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Target,
  ArrowRight,
  X,
  BarChart3,
  User,
  ShoppingCart,
  Minimize2,
  Maximize2,
  TrendingUp,
  Clock,
  Send
} from 'lucide-react'
import { toast } from 'sonner'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { cn } from '@/lib/utils'
import { HTTPMethod } from '@/lib/types'

interface AIEnhancedGeneratorProps {
  onMockGenerated?: (mockData: any) => void
  onMockSaved?: (mock: any) => void
  onResponseGenerated?: (response: string) => void
  initialEndpoint?: string
  initialMethod?: HTTPMethod
  className?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
  hideHeader?: boolean
}

const predefinedPrompts = [
  {
    icon: BarChart3,
    title: 'Quick Stat Template',
    description: 'Analytics dashboard with KPIs',
    prompt: 'Analytics dashboard with metrics, charts, time series data, and KPIs'
  },
  {
    icon: User,
    title: 'User Profile Sample', 
    description: 'Complete user profile data',
    prompt: 'User profile with id, name, email, avatar, bio, preferences, and social links'
  },
  {
    icon: ShoppingCart,
    title: 'Product List Mock',
    description: 'E-commerce product catalog', 
    prompt: 'E-commerce product with details, variants, pricing, inventory, and reviews'
  },
  {
    icon: Target,
    title: 'Authentication Response',
    description: 'Login/auth API response',
    prompt: 'Authentication API response with access token, refresh token, user info, and expiration'
  },
  {
    icon: Zap,
    title: 'Error Message Example',
    description: 'API error response',
    prompt: 'API error response with code, message, details, and timestamp'
  },
  {
    icon: TrendingUp,
    title: 'Financial Report',
    description: 'Finance data with transactions',
    prompt: 'Financial report with transactions, balances, categories, and summary statistics'
  },
  {
    icon: Clock,
    title: 'Event Schedule',
    description: 'Calendar events with times',
    prompt: 'Event schedule with event name, start time, end time, location, and participants'
  }
]

export function AIEnhancedGenerator({
  onMockGenerated,
  onMockSaved,
  onResponseGenerated,
  initialEndpoint = '',
  initialMethod = 'GET',
  className = '',
  isMinimized = false,
  onToggleMinimize,
  onClose,
  hideHeader = false
}: AIEnhancedGeneratorProps) {
  const [formData, setFormData] = useState({
    method: initialMethod,
    endpoint: initialEndpoint,
    description: '',
    statusCode: 200,
    name: '',
    autoSave: false
  })

  const [generatedData, setGeneratedData] = useState<any>(null)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const lastFetchTime = useRef<number>(0)

  const {
    generateMockData,
    generateAndSaveMock,
    isGenerating,
    error,
    usage,
    fetchUsage
  } = useAIGeneration()

  // Debounced version of fetchUsage to prevent rapid calls
  const debouncedFetchUsage = useCallback(async () => {
    const now = Date.now()
    // Prevent calls more frequent than every 2 seconds
    if (now - lastFetchTime.current < 2000) {
      return
    }
    lastFetchTime.current = now
    await fetchUsage()
  }, [fetchUsage])

  useEffect(() => {
    debouncedFetchUsage()
  }, [])  // Remove fetchUsage dependency to prevent infinite loop

  useEffect(() => {
    if (initialEndpoint !== formData.endpoint) {
      setFormData(prev => ({ ...prev, endpoint: initialEndpoint }))
    }
    if (initialMethod !== formData.method) {
      setFormData(prev => ({ ...prev, method: initialMethod }))
    }
  }, [initialEndpoint, initialMethod])

  // Clear generated data when there's an error
  useEffect(() => {
    if (error) {
      setGeneratedData(null)
      setShowSaveOptions(false)
    }
  }, [error])

  const handleGenerate = async () => {
    if (formData.autoSave) {
      await handleGenerateAndSave()
    } else {
      await handleGenerateOnly()
    }
  }

  const handleGenerateOnly = async () => {
    // Clear previous results and errors
    setGeneratedData(null)
    setShowSaveOptions(false)
    
    const result = await generateMockData({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: 'json',
      complexity: 'medium',
      statusCode: formData.statusCode,
      includeHeaders: true,
      realisticData: true
    })

    if (result && result.response_data) {
      setGeneratedData(result)
      onMockGenerated?.(result)
      setShowSaveOptions(true)
      // Only fetch usage after successful generation, with debouncing
      await debouncedFetchUsage()
    }
  }

  const handleGenerateAndSave = async () => {
    // Clear previous results and errors
    setGeneratedData(null)
    setShowSaveOptions(false)
    
    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: 'json',
      complexity: 'medium',
      statusCode: formData.statusCode,
      includeHeaders: true,
      realisticData: true,
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: false,
      tags: ['ai-generated']
    })

    if (result && result.response_data) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
      await debouncedFetchUsage()
    }
  }

  const handleSaveGenerated = async () => {
    if (!generatedData) return

    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: 'json',
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: false,
      tags: ['ai-generated']
    })

    if (result) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handlePromptSelect = (prompt: string) => {
    setFormData(prev => ({ ...prev, description: prompt }))
    if (promptRef.current) {
      promptRef.current.focus()
    }
  }

  const handleUseGenerated = () => {
    if (generatedData && generatedData.response_data) {
      const jsonString = JSON.stringify(generatedData.response_data, null, 2)
      onResponseGenerated?.(jsonString)
      toast.success('Generated data applied!')
    }
  }

  const isFormValid = formData.method && formData.endpoint && formData.description

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          className
        )}
      >
        <Card className="w-80 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-grey-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">AI Generator</CardTitle>
                  <CardDescription className="text-xs">
                    {usage?.rateLimitRemaining || 0} generations left
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="h-6 w-6 p-0"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn("max-w-4xl mx-auto", className)}
      >
        {/* Modern Header - conditionally rendered */}
        {!hideHeader && (
          <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-white rounded-t-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">AI Mock Generator</h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Generate realistic mock data with AI-powered assistance. Describe what you need below.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onToggleMinimize && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMinimize}
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <Card className={cn("shadow-2xl", hideHeader ? "rounded-2xl" : "rounded-t-none border-t-0")}>
          <CardContent className="p-8 space-y-6">
            {/* Usage Stats */}
            {usage && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TOKENS USED</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400">
                    {usage.planName || 'Pro'} Plan
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {usage.tokensUsedToday?.toLocaleString() || 0}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 self-end">
                      / {usage.monthlyTokenQuota?.toLocaleString() || 20000}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage.tokensUsedToday || 0) / (usage.monthlyTokenQuota || 20000) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Form Controls Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method" className="text-sm font-medium">Method</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as HTTPMethod }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        GET
                      </Badge>
                    </SelectItem>
                    <SelectItem value="POST">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        POST
                      </Badge>
                    </SelectItem>
                    <SelectItem value="PUT">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        PUT
                      </Badge>
                    </SelectItem>
                    <SelectItem value="DELETE">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        DELETE
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint" className="text-sm font-medium">Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="/api/v1/users"
                  value={formData.endpoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="h-11 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-code" className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.statusCode.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, statusCode: parseInt(value) }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        200
                      </Badge>
                    </SelectItem>
                    <SelectItem value="201">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        201
                      </Badge>
                    </SelectItem>
                    <SelectItem value="400">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        400
                      </Badge>
                    </SelectItem>
                    <SelectItem value="404">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        404
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prompt Section */}
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
              <div className="relative">
                <Textarea
                  ref={promptRef}
                  id="prompt"
                  placeholder="e.g. Generate 50 user profiles with name, email, and avatar"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="h-28 text-base resize-none pr-16"
                />
                <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleGenerate}
                        disabled={!isFormValid || isGenerating || (usage?.rateLimitRemaining === 0)}
                        size="sm"
                        className="h-10 w-10 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        ) : usage?.rateLimitRemaining === 0 ? (
                          <AlertCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Send className="h-5 w-5 text-white" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate Mock Data</p>
                    </TooltipContent>
                  </Tooltip>
                  {usage && (
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400">
                      {usage.requestsToday || 0}/{usage.dailyRequestQuota || 10}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap gap-2">
              {predefinedPrompts.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptSelect(template.prompt)}
                  className="flex items-center gap-2 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <template.icon className="h-3 w-3" />
                  {template.title}
                </Button>
              ))}
            </div>

            

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {typeof error === 'string' ? error : JSON.stringify(error)}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Data Display */}
            <AnimatePresence>
              {generatedData && generatedData.response_data && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Generation Successful!
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(generatedData.response_data, null, 2))}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUseGenerated}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                      <pre className="text-sm overflow-auto max-h-60">
                        {JSON.stringify(generatedData.response_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Options */}
            <AnimatePresence>
              {showSaveOptions && generatedData && generatedData.response_data && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Save as Reusable Mock</span>
                  </div>
                  
                  <Input
                    placeholder={`AI Generated - ${formData.endpoint}`}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-10"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveGenerated}
                      disabled={isGenerating}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Mock
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveOptions(false)}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
