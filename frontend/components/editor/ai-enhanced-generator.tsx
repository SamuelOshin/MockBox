'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Sparkles,
  Loader2,
  Copy,
  Save,
  Info,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Clock,
  Wand2,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Target,
  Layers,
  Code2,
  Eye,
  Star,
  TrendingUp,
  Shuffle,
  RefreshCw,
  Settings2,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { cn } from '@/lib/utils'
import { HTTPMethod } from '@/lib/types'
import { AIUsageDisplay } from '@/components/ui/ai-usage-display'

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
}

const complexityLevels = [
  {
    value: 'simple',
    label: 'Simple',
    description: 'Basic structure with minimal fields',
    icon: '🚀',
    color: 'green'
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced complexity with realistic data',
    icon: '⚡',
    color: 'blue'
  },
  {
    value: 'complex',
    label: 'Complex',
    description: 'Rich structure with nested objects',
    icon: '🧠',
    color: 'purple'
  }
]

const predefinedPrompts = [
  {
    icon: '👤',
    title: 'User Profile',
    description: 'Complete user profile with avatar, settings',
    prompt: 'User profile with id, name, email, avatar, bio, preferences, and social links'
  },
  {
    icon: '📊',
    title: 'Analytics Data',
    description: 'Dashboard metrics and charts data',
    prompt: 'Analytics dashboard with metrics, charts, time series data, and KPIs'
  },
  {
    icon: '🛍️',
    title: 'E-commerce Product',
    description: 'Product catalog with variants and pricing',
    prompt: 'E-commerce product with details, variants, pricing, inventory, and reviews'
  },
  {
    icon: '📱',
    title: 'Social Post',
    description: 'Social media post with engagement',
    prompt: 'Social media post with content, author, timestamps, likes, comments, and shares'
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
  onClose
}: AIEnhancedGeneratorProps) {
  const [formData, setFormData] = useState({
    method: initialMethod,
    endpoint: initialEndpoint,
    description: '',
    responseFormat: 'json',
    schemaHint: '',
    complexity: 'medium',
    statusCode: 200,
    includeHeaders: true,
    realisticData: true,
    // Save options
    name: '',
    saveDescription: '',
    isPublic: false,
    tags: [] as string[],
    autoSave: false
  })

  const [generatedData, setGeneratedData] = useState<any>(null)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [isExpanded, setIsExpanded] = useState(!isMinimized)
  const promptRef = useRef<HTMLTextAreaElement>(null)

  const {
    generateMockData,
    generateAndSaveMock,
    isGenerating,
    error,
    usage,
    fetchUsage
  } = useAIGeneration()

  useEffect(() => {
    fetchUsage()
  }, [])

  useEffect(() => {
    if (initialEndpoint !== formData.endpoint) {
      setFormData(prev => ({ ...prev, endpoint: initialEndpoint }))
    }
    if (initialMethod !== formData.method) {
      setFormData(prev => ({ ...prev, method: initialMethod }))
    }
  }, [initialEndpoint, initialMethod])

  useEffect(() => {
    setIsExpanded(!isMinimized)
  }, [isMinimized])

  const steps = [
    { title: 'Configure', icon: Settings2, description: 'Set up endpoint details' },
    { title: 'Describe', icon: Lightbulb, description: 'Describe your data needs' },
    { title: 'Generate', icon: Sparkles, description: 'AI creates your mock' },
    { title: 'Review', icon: Eye, description: 'Review and save' }
  ]

  const handleGenerate = async () => {
    if (formData.autoSave) {
      await handleGenerateAndSave()
    } else {
      await handleGenerateOnly()
    }
  }

  const handleGenerateOnly = async () => {
    setActiveStep(2)

    const result = await generateMockData({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: formData.responseFormat as any,
      schemaHint: formData.schemaHint,
      complexity: formData.complexity as any,
      statusCode: formData.statusCode,
      includeHeaders: formData.includeHeaders,
      realisticData: formData.realisticData
    })

    if (result) {
      setGeneratedData(result)
      onMockGenerated?.(result)
      onResponseGenerated?.(JSON.stringify(result.response_data, null, 2))
      setShowSaveOptions(true)
      setActiveStep(3)
      await fetchUsage()
    }
  }

  const handleGenerateAndSave = async () => {
    setActiveStep(2)

    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: formData.responseFormat as any,
      schemaHint: formData.schemaHint,
      complexity: formData.complexity as any,
      statusCode: formData.statusCode,
      includeHeaders: formData.includeHeaders,
      realisticData: formData.realisticData,
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: formData.isPublic,
      tags: [...formData.tags, 'ai-generated']
    })

    if (result) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
      setActiveStep(0)
      await fetchUsage()
    }
  }

  const handleSaveGenerated = async () => {
    if (!generatedData) return

    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.saveDescription || formData.description,
      responseFormat: formData.responseFormat as any,
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: formData.isPublic,
      tags: [...formData.tags, 'ai-generated']
    })

    if (result) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
      setActiveStep(0)
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

  const isFormValid = formData.method && formData.endpoint

  // Add a utility to check if the generation result is an error
  function isGenerationError(data: any) {
    if (!data) return false;
    // If explanation is an object with error/message, or response_data is null and explanation is error-like
    if (typeof data.explanation === 'object' && (data.explanation.error || data.explanation.message)) return true;
    if (typeof data.explanation === 'string' && data.explanation.toLowerCase().includes('error')) return true;
    if (data.response_data === null && data.status_code && data.status_code >= 400) return true;
    return false;
  }

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
        <Card className="w-80 shadow-2xl border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={cn("space-y-4", className)}
        >
          {/* Enhanced Header with Progress */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wand2 className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">AI Mock Generator</CardTitle>
                      <Badge variant="secondary" className="bg-white/50">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        Pro
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Generate intelligent, realistic mock data with AI
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMinimize}
                    className="h-8 w-8 p-0"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                          index <= activeStep
                            ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg"
                            : "bg-white/50 text-gray-400"
                        )}
                        animate={index === activeStep ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <step.icon className="h-4 w-4" />
                      </motion.div>
                      <div className="text-xs">
                        <div className={cn(
                          "font-medium",
                          index <= activeStep ? "text-purple-700" : "text-gray-400"
                        )}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-blue-200 mx-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Usage Stats with Enhanced Visualization */}
          {usage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AIUsageDisplay usage={usage} variant="detailed" />
            </motion.div>
          )}

          {/* Quick Start Templates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm">Quick Start Templates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedPrompts.map((template, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handlePromptSelect(template.prompt)}
                      className="p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-gray-900 dark:text-gray-100 mb-1">
                            {template.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Configuration Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">Endpoint Configuration</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs"
                  >
                    {showAdvanced ? 'Simple' : 'Advanced'}
                    <ChevronRight className={cn(
                      "h-3 w-3 ml-1 transition-transform",
                      showAdvanced && "rotate-90"
                    )} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-xs font-medium">HTTP Method</Label>
                    <Select
                      value={formData.method}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as HTTPMethod }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="POST">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">POST</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PUT">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">PUT</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PATCH">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">PATCH</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="DELETE">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">DELETE</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-code" className="text-xs font-medium">Status Code</Label>
                    <Input
                      id="status-code"
                      type="number"
                      min="100"
                      max="599"
                      value={formData.statusCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        statusCode: parseInt(e.target.value) || 200
                      }))}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-xs font-medium">Endpoint Path</Label>
                  <Input
                    id="endpoint"
                    placeholder="/api/users/123"
                    value={formData.endpoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-medium">
                    AI Prompt
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 ml-1 inline-block" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Describe what data you want the AI to generate</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Textarea
                    ref={promptRef}
                    id="description"
                    placeholder="Describe what this endpoint should return... e.g., 'User profile with personal details, preferences, and activity history'"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Complexity Selector with Visual Cards */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Data Complexity</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {complexityLevels.map((level) => (
                      <motion.button
                        key={level.value}
                        onClick={() => setFormData(prev => ({ ...prev, complexity: level.value }))}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-left",
                          formData.complexity === level.value
                            ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-lg mb-1">{level.icon}</div>
                        <div className="text-xs font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {level.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pt-4 border-t"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="format" className="text-xs font-medium">Response Format</Label>
                          <Select
                            value={formData.responseFormat}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, responseFormat: value }))}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">
                                <div className="flex items-center gap-2">
                                  <Code2 className="h-3 w-3" />
                                  JSON
                                </div>
                              </SelectItem>
                              <SelectItem value="xml">XML</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schema-hint" className="text-xs font-medium">Schema Hint</Label>
                          <Input
                            id="schema-hint"
                            placeholder="e.g., User, Product, Order..."
                            value={formData.schemaHint}
                            onChange={(e) => setFormData(prev => ({ ...prev, schemaHint: e.target.value }))}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="realistic-data"
                            checked={formData.realisticData}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, realisticData: checked }))}
                          />
                          <Label htmlFor="realistic-data" className="text-xs">Realistic Data</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="include-headers"
                            checked={formData.includeHeaders}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeHeaders: checked }))}
                          />
                          <Label htmlFor="include-headers" className="text-xs">Include Headers</Label>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-save"
                          checked={formData.autoSave}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSave: checked }))}
                        />
                        <Label htmlFor="auto-save" className="text-xs">Generate and Save Automatically</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Automatically save the generated mock to your collection</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {typeof error === 'string'
                      ? error
                      : error && typeof error === 'object'
                        ? ('message' in error
                          ? (error as any).message
                          : 'error' in error
                            ? (error as any).error
                            : JSON.stringify(error, null, 2))
                        : String(error)}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid || isGenerating || (usage?.rateLimitRemaining === 0)}
              className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isGenerating ? (
                <motion.div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Magic...</span>
                </motion.div>
              ) : usage?.rateLimitRemaining === 0 ? (
                <motion.div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Daily Limit Reached ({usage.requestsToday}/{usage.dailyRequestQuota || 10})</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="h-5 w-5" />
                  <span>
                    {formData.autoSave ? 'Generate & Save Mock' : 'Generate Mock Data'}
                    {usage && ` (${usage.rateLimitRemaining} left)`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              )}
            </Button>
          </motion.div>

          {/* Generated Data Display with Enhanced UI */}
          <AnimatePresence>
            {generatedData && !isGenerationError(generatedData) && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-2 rounded-full bg-green-100 dark:bg-green-900/40"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </motion.div>
                        <div>
                          <CardTitle className="text-base text-green-800 dark:text-green-200">
                            Generation Successful! 🎉
                          </CardTitle>
                          <CardDescription className="text-green-700 dark:text-green-300">
                            {typeof generatedData.explanation === 'string'
                              ? generatedData.explanation
                              : generatedData.explanation && typeof generatedData.explanation === 'object'
                                ? ('message' in generatedData.explanation
                                  ? generatedData.explanation.message
                                  : 'error' in generatedData.explanation
                                    ? generatedData.explanation.error
                                    : JSON.stringify(generatedData.explanation, null, 2))
                              : String(generatedData.explanation)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {generatedData.generation_time && generatedData.generation_time.toFixed ? generatedData.generation_time.toFixed(2) : generatedData.generation_time}s
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {generatedData.provider}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Generated Response</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(generatedData.response_data, null, 2))}
                            className="h-8"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onResponseGenerated?.(JSON.stringify(generatedData.response_data, null, 2))}
                            className="h-8"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                      <div className="relative">
                        <pre className="bg-white dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto max-h-60 border shadow-inner">
                          {JSON.stringify(generatedData.response_data, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {generatedData.headers && Object.keys(generatedData.headers).length > 0 && (
                      <div className="space-y-2">
                        <Label className="font-medium">Headers</Label>
                        <pre className="bg-white dark:bg-gray-900 p-3 rounded-lg text-sm border shadow-inner">
                          {JSON.stringify(generatedData.headers, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{generatedData.status_code}</div>
                        <div className="text-xs text-muted-foreground">Status Code</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{generatedData.model}</div>
                        <div className="text-xs text-muted-foreground">Model</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{generatedData.tokens_used || 0}</div>
                        <div className="text-xs text-muted-foreground">Tokens Used</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Generation Display */}
          {generatedData && isGenerationError(generatedData) && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-2 rounded-full bg-red-100 dark:bg-red-900/40"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-base text-red-800 dark:text-red-200">
                        Generation Failed
                      </CardTitle>
                      <CardDescription className="text-red-700 dark:text-red-300">
                        {typeof generatedData.explanation === 'string'
                          ? generatedData.explanation
                          : generatedData.explanation && typeof generatedData.explanation === 'object'
                            ? ('message' in generatedData.explanation
                              ? generatedData.explanation.message
                              : 'error' in generatedData.explanation
                                ? generatedData.explanation.error
                                : JSON.stringify(generatedData.explanation, null, 2))
                            : String(generatedData.explanation)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )}
          {/* Enhanced Save Options */}
          <AnimatePresence>
            {showSaveOptions && generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-base">Save as Reusable Mock</CardTitle>
                    </div>
                    <CardDescription>
                      Save this AI-generated data to your mock collection for future use
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mock-name" className="text-xs font-medium">Mock Name</Label>
                      <Input
                        id="mock-name"
                        placeholder={`AI Generated - ${formData.endpoint}`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="save-description" className="text-xs font-medium">Description</Label>
                      <Textarea
                        id="save-description"
                        placeholder="Describe this mock endpoint..."
                        value={formData.saveDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, saveDescription: e.target.value }))}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-public"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                      />
                      <Label htmlFor="is-public" className="text-xs">Make Public</Label>
                    </div>

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
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  )
}
