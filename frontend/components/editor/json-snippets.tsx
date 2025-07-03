"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useTheme } from "@/components/ui/theme-provider"
import { User, Package, AlertTriangle, Database, ShoppingCart, MessageSquare, Copy, Code, Download, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface JsonSnippetsProps {
  onSnippetSelect: (snippet: string) => void
}

const snippets = [
  {
    id: "user",
    title: "User Profile",
    description: "Complete user profile with all common fields",
    icon: User,
    category: "User",
    tags: ["user", "profile", "authentication"],
    data: {
      id: "usr_123",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://api.mockbox.dev/avatars/123",
      role: "user",
      createdAt: "2024-01-15T10:30:00Z",
      preferences: {
        theme: "dark",
        notifications: true
      }
    }
  },
  {
    id: "api-response",
    title: "API Response Wrapper",
    description: "Standard API response format with data, message, and status",
    icon: Code,
    category: "Response",
    tags: ["api", "response", "wrapper"],
    data: {
      success: true,
      data: {
        id: 1,
        name: "Sample Item"
      },
      message: "Request successful",
      timestamp: "2024-01-20T10:30:00Z"
    }
  },
  {
    id: "paginated-list",
    title: "Paginated List",
    description: "Paginated response with metadata",
    icon: Database,
    category: "List",
    tags: ["pagination", "list", "meta"],
    data: {
      data: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" }
      ],
      meta: {
        total: 100,
        page: 1,
        perPage: 10,
        totalPages: 10,
        hasNext: true,
        hasPrev: false
      }
    }
  },
  {
    id: "product",
    title: "Product Catalog",
    description: "E-commerce product with all details",
    icon: Package,
    category: "E-commerce",
    tags: ["product", "ecommerce", "catalog"],
    data: {
      id: "prod_456",
      name: "Wireless Headphones",
      price: 99.99,
      currency: "USD",
      category: "electronics",
      inStock: true,
      images: ["https://api.mockbox.dev/images/prod_456_1.jpg"],
      rating: 4.5,
      reviews: 128
    }
  },
  {
    id: "error",
    title: "Error Response",
    description: "Standardized error response format",
    icon: AlertTriangle,
    category: "Response",
    tags: ["error", "validation", "failure"],
    data: {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request parameters",
        details: [
          {
            field: "email",
            message: "Email is required"
          }
        ],
        timestamp: "2024-01-20T10:30:00Z"
      }
    }
  },
  {
    id: "order",
    title: "Order",
    description: "E-commerce order data",
    icon: ShoppingCart,
    category: "E-commerce",
    tags: ["order", "ecommerce", "purchase"],
    data: {
      id: "ord_789",
      status: "confirmed",
      total: 149.97,
      currency: "USD",
      items: [
        {
          id: "prod_456",
          name: "Wireless Headphones",
          quantity: 1,
          price: 99.99
        }
      ],
      customer: {
        id: "usr_123",
        name: "John Doe",
        email: "john@example.com"
      },
      createdAt: "2024-01-20T10:30:00Z"
    }
  },
  {
    id: "message",
    title: "Message",
    description: "Chat or notification message",
    icon: MessageSquare,
    category: "Communication",
    tags: ["message", "chat", "notification"],
    data: {
      id: "msg_321",
      content: "Hello! How can I help you today?",
      sender: {
        id: "usr_456",
        name: "Support Agent",
        avatar: "https://api.mockbox.dev/avatars/456"
      },
      timestamp: "2024-01-20T10:30:00Z",
      type: "text",
      read: false
    }
  }
]

export default function JsonSnippets({ onSnippetSelect }: JsonSnippetsProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const { actualTheme } = useTheme()

  // Theme-aware colors
  const themeColors = {
    cardBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#1E1E1E]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400',
    buttonHover: actualTheme === 'light' ? 'hover:bg-slate-100 hover:text-slate-900' : 'hover:bg-[#2D2D2D] hover:text-white',
    badgeBg: actualTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-[#2D2D2D] text-gray-300',
    codeBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    codeText: actualTheme === 'light' ? 'text-slate-700' : 'text-gray-300'
  }
  const scrollbarTheme = "auto"
  const categories = Array.from(new Set(snippets.map(s => s.category)))

  const copySnippet = async (snippet: object, snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(JSON.stringify(snippet, null, 2))
      setCopiedStates(prev => ({ ...prev, [snippetId]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [snippetId]: false }))
      }, 2000)

      toast({
        title: "Copied to clipboard",
        description: "JSON snippet has been copied successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy snippet to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadSnippet = async (snippet: object, title: string, snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloadingStates(prev => ({ ...prev, [snippetId]: true }))

    try {
      const jsonContent = JSON.stringify(snippet, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `${title} JSON file is being downloaded`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download JSON file",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setDownloadingStates(prev => ({ ...prev, [snippetId]: false }))
      }, 1000)
    }
  }
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex-shrink-0">
          <Code className="h-3 w-3 sm:h-3 sm:w-3 text-white" />
        </div>
        <h3 className={cn("text-sm sm:text-base font-semibold", themeColors.text)}>JSON Snippets</h3>
      </div>
      <p className={cn("text-xs mb-3 sm:mb-4", themeColors.textMuted)}>Quick start templates for common API response patterns</p>

      {/* Scrollable container with native scrolling */}
      <div className="max-h-[320px] overflow-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4">
        {categories.map(category => (
          <div key={category}>
            <h4 className={cn("text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 uppercase tracking-wide", themeColors.textMuted)}>{category}</h4>
            <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
              {snippets
                .filter(snippet => snippet.category === category)
                .map(snippet => (
                  <motion.div
                    key={snippet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200 group",
                        themeColors.cardBg,
                        themeColors.cardHover,
                        actualTheme === 'light' ? 'hover:border-slate-300' : 'hover:border-gray-600'
                      )}
                      onClick={() => onSnippetSelect(JSON.stringify(snippet.data, null, 2))}
                    >
                      <CardHeader className="pb-1.5 sm:pb-2 px-2 sm:px-3 pt-2 sm:pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                            <div className="p-0.5 sm:p-1 rounded-md bg-blue-500/20 flex-shrink-0">
                              <snippet.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                            </div>                            <div className="flex-1 min-w-0">
                              <CardTitle className={cn("text-xs font-medium truncate", themeColors.text)}>{snippet.title}</CardTitle>
                              <CardDescription className={cn("text-xs line-clamp-1 leading-tight", themeColors.textSecondary)}>
                                {snippet.description}
                              </CardDescription>
                            </div>
                          </div>

                          {/* Enhanced Action buttons */}
                          <div className="flex items-center gap-0.5 sm:gap-1 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn("h-5 w-5 sm:h-6 sm:w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
                              onClick={(e) => copySnippet(snippet.data, snippet.id, e)}
                              title="Copy JSON"
                            >
                              <AnimatePresence mode="wait">
                                {copiedStates[snippet.id] ? (
                                  <motion.div
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn("h-5 w-5 sm:h-6 sm:w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
                              onClick={(e) => downloadSnippet(snippet.data, snippet.title, snippet.id, e)}
                              title="Download JSON"
                              disabled={downloadingStates[snippet.id]}
                            >
                              {downloadingStates[snippet.id] ? (
                                <motion.div
                                  animate={{ y: [0, -2, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity }}
                                >
                                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </motion.div>
                              ) : (
                                <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
                          {snippet.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={cn("text-xs px-1 sm:px-1.5 py-0 h-3.5 sm:h-4", themeColors.badgeBg)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                          <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full text-xs h-5 sm:h-6",
                            actualTheme === 'light'
                              ? "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400"
                              : "bg-[#1A1A1A] border-gray-600 text-white hover:bg-[#2D2D2D] hover:border-gray-500"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSnippetSelect(JSON.stringify(snippet.data, null, 2))
                            toast({
                              title: "Template applied",
                              description: `${snippet.title} template has been loaded`,
                              variant: "default",
                            })
                          }}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}