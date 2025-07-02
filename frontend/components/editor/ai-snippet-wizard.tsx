'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sparkles,
  Loader2,
  Copy,
  Code2,
  Zap,
  Lightbulb,
  Wand2,
  ArrowRight,
  Database,
  User,
  ShoppingCart,
  BarChart3,
  Globe,
  Calendar,
  Settings,
  Heart,
  Star,
  TrendingUp,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Layers,
  Target,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { cn } from '@/lib/utils'

interface AISnippetWizardProps {
  onSnippetGenerated?: (snippet: string) => void
  onSnippetSelect?: (snippet: string) => void
  className?: string
}

const snippetCategories = [
  {
    id: 'user',
    title: 'User Data',
    icon: User,
    color: 'blue',
    templates: [
      { name: 'User Profile', prompt: 'Complete user profile with personal details, avatar, and preferences' },
      { name: 'User List', prompt: 'Array of users with basic information for user management' },
      { name: 'User Activity', prompt: 'User activity log with timestamps and action details' },
      { name: 'User Settings', prompt: 'User preferences and account configuration settings' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    icon: ShoppingCart,
    color: 'green',
    templates: [
      { name: 'Product Catalog', prompt: 'E-commerce product with variants, pricing, and inventory' },
      { name: 'Shopping Cart', prompt: 'Shopping cart with items, quantities, and total calculations' },
      { name: 'Order History', prompt: 'Order details with items, shipping, and payment information' },
      { name: 'Product Reviews', prompt: 'Product reviews with ratings, comments, and user details' }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    color: 'purple',
    templates: [
      { name: 'Dashboard Stats', prompt: 'Analytics dashboard with KPIs, metrics, and chart data' },
      { name: 'Time Series', prompt: 'Time series data for charts and graphs with timestamps' },
      { name: 'Report Data', prompt: 'Business report with summary statistics and breakdowns' },
      { name: 'Performance Metrics', prompt: 'Application performance metrics and monitoring data' }
    ]
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: MessageSquare,
    color: 'pink',
    templates: [
      { name: 'Social Post', prompt: 'Social media post with content, engagement, and metadata' },
      { name: 'Comment Thread', prompt: 'Nested comments with replies and user interactions' },
      { name: 'User Feed', prompt: 'Social media feed with posts, likes, and user activity' },
      { name: 'Notifications', prompt: 'User notifications with types, timestamps, and actions' }
    ]
  },
  {
    id: 'content',
    title: 'Content',
    icon: FileText,
    color: 'orange',
    templates: [
      { name: 'Blog Post', prompt: 'Blog post with content, metadata, tags, and SEO information' },
      { name: 'Article List', prompt: 'List of articles with summaries and publication details' },
      { name: 'Media Gallery', prompt: 'Image and media gallery with metadata and organization' },
      { name: 'CMS Content', prompt: 'Content management system data with fields and structure' }
    ]
  },
  {
    id: 'business',
    title: 'Business',
    icon: TrendingUp,
    color: 'indigo',
    templates: [
      { name: 'Company Data', prompt: 'Company profile with details, contacts, and business info' },
      { name: 'Employee Directory', prompt: 'Employee list with roles, departments, and contact info' },
      { name: 'Project Data', prompt: 'Project information with tasks, timelines, and team members' },
      { name: 'Financial Data', prompt: 'Financial records with transactions and account summaries' }
    ]
  }
]

const quickSnippets = [
  {
    name: 'Error Response',
    icon: '⚠️',
    snippet: JSON.stringify({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: [
          { field: 'email', message: 'Valid email address required' },
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]
      },
      timestamp: new Date().toISOString(),
      request_id: 'req_' + Math.random().toString(36).substr(2, 9)
    }, null, 2)
  },
  {
    name: 'Success Response',
    icon: '✅',
    snippet: JSON.stringify({
      success: true,
      message: 'Operation completed successfully',
      data: {
        id: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        status: 'active'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    }, null, 2)
  },
  {
    name: 'Pagination',
    icon: '📄',
    snippet: JSON.stringify({
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total_pages: 5,
        total_items: 100,
        has_next: true,
        has_prev: false
      },
      links: {
        first: '/api/items?page=1',
        last: '/api/items?page=5',
        next: '/api/items?page=2',
        prev: null
      }
    }, null, 2)
  },
  {
    name: 'Empty State',
    icon: '📭',
    snippet: JSON.stringify({
      data: [],
      message: 'No items found',
      suggestions: [
        'Try adjusting your search criteria',
        'Create your first item',
        'Check back later for updates'
      ],
      meta: {
        total_count: 0,
        search_performed: true
      }
    }, null, 2)
  }
]

export function AISnippetWizard({
  onSnippetGenerated,
  onSnippetSelect,
  className
}: AISnippetWizardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const { generateMockData } = useAIGeneration()

  const handleQuickSnippet = (snippet: string) => {
    onSnippetSelect?.(snippet)
    toast.success('Snippet applied!')
  }

  const handleTemplateGenerate = useCallback(async (prompt: string, categoryName: string) => {
    setIsGenerating(true)

    try {
      const result = await generateMockData({
        method: 'GET',
        endpoint: '/api/data',
        description: prompt,
        responseFormat: 'json',
        complexity: 'medium',
        realisticData: true
      })

      if (result) {
        const generatedSnippet = JSON.stringify(result.response_data, null, 2)
        onSnippetGenerated?.(generatedSnippet)
        onSnippetSelect?.(generatedSnippet)
        toast.success(`Generated ${categoryName} snippet!`)
        setIsOpen(false)
      }
    } catch (error) {
      toast.error('Failed to generate snippet')
    } finally {
      setIsGenerating(false)
    }
  }, [generateMockData, onSnippetGenerated, onSnippetSelect])

  const handleCustomGenerate = useCallback(async () => {
    if (!customPrompt.trim()) return

    setIsGenerating(true)

    try {
      const result = await generateMockData({
        method: 'GET',
        endpoint: '/api/data',
        description: customPrompt,
        responseFormat: 'json',
        complexity: 'medium',
        realisticData: true
      })

      if (result) {
        const generatedSnippet = JSON.stringify(result.response_data, null, 2)
        onSnippetGenerated?.(generatedSnippet)
        onSnippetSelect?.(generatedSnippet)
        toast.success('Custom snippet generated!')
        setIsOpen(false)
        setCustomPrompt('')
      }
    } catch (error) {
      toast.error('Failed to generate custom snippet')
    } finally {
      setIsGenerating(false)
    }
  }, [customPrompt, generateMockData, onSnippetGenerated, onSnippetSelect])

  return (
    <Card className={className}>
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex-shrink-0">
              <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-base">Smart Snippets</CardTitle>
              <CardDescription className="text-xs">
                Quick JSON templates and AI-generated data
              </CardDescription>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 h-7 sm:h-8 flex-shrink-0">
                <Sparkles className="h-3 w-3 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">AI Generate</span>
                <span className="xs:hidden">AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  AI Snippet Generator
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Generate realistic JSON data using AI or choose from predefined templates
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Custom Prompt */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-medium">Custom Generation</Label>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <Input
                      placeholder="Describe the data you need..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="flex-1 text-sm h-8 sm:h-10"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isGenerating) {
                          handleCustomGenerate()
                        }
                      }}
                    />
                    <Button
                      onClick={handleCustomGenerate}
                      disabled={!customPrompt.trim() || isGenerating}
                      className="px-3 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm"
                      size="sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">Generate</span>
                          <span className="xs:hidden">Gen</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Category Templates */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-xs sm:text-sm font-medium">Template Categories</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {snippetCategories.map((category) => (
                      <motion.div
                        key={category.id}
                        className={cn(
                          "p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all",
                          selectedCategory === category.id
                            ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                          <div className={cn(
                            "p-1.5 sm:p-2 rounded-lg",
                            `bg-${category.color}-100 dark:bg-${category.color}-900/30`
                          )}>
                            <category.icon className={cn(
                              "h-3.5 w-3.5 sm:h-4 sm:w-4",
                              `text-${category.color}-600 dark:text-${category.color}-400`
                            )} />
                          </div>
                          <span className="font-medium text-xs sm:text-sm">{category.title}</span>
                        </div>
                        <AnimatePresence>
                          {selectedCategory === category.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3"
                            >
                              {category.templates.map((template, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTemplateGenerate(template.prompt, template.name)}
                                  disabled={isGenerating}
                                  className="w-full justify-start text-xs h-6 sm:h-8"
                                >
                                  {isGenerating ? (
                                    <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 animate-spin" />
                                  ) : (
                                    <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2" />
                                  )}
                                  {template.name}
                                </Button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Quick Access Snippets */}
        <div>
          <Label className="text-xs font-medium mb-1.5 sm:mb-2 block">Quick Templates</Label>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2">
            {quickSnippets.map((snippet, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickSnippet(snippet.snippet)}
                className="p-2.5 sm:p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-lg flex-shrink-0">{snippet.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                      {snippet.name}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-2.5 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                Pro Tip
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
                Use AI generation for complex, realistic data. Quick templates for common patterns like errors and pagination.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}