"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/components/ui/theme-provider"
import {
  Play,
  Copy,
  Save,
  Eye,
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  Zap
} from "lucide-react"
import { responseTemplates } from "@/lib/mock-data"
import { mockApi } from "@/lib/api"
import type { CreateMockRequest } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BuilderPageSkeleton } from "@/components/ui/builder-skeleton"

// Dynamically import components to avoid SSR issues
const MonacoJsonEditor = dynamic(() => import("@/components/editor/monaco-json-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading Monaco Editor...
      </div>
    </div>
  ),
})

const JsonSnippets = dynamic(() => import("@/components/editor/json-snippets"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading Snippets...
      </div>
    </div>
  ),
})

// Dynamically import AI components
import { AIGeneratorModal } from "@/components/editor/ai-generator-modal"

const AISnippetWizard = dynamic(() => import("@/components/editor/ai-snippet-wizard").then(m => ({ default: m.AISnippetWizard })), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading AI Snippets...
      </div>
    </div>
  ),
})

const AIFloatingActionButton = dynamic(() => import("@/components/editor/ai-floating-action-button").then(m => ({ default: m.AIFloatingActionButton })), {
  ssr: false,
})

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
const statusCodes = [
  { value: "200", label: "200 - OK" },
  { value: "201", label: "201 - Created" },
  { value: "400", label: "400 - Bad Request" },
  { value: "401", label: "401 - Unauthorized" },
  { value: "404", label: "404 - Not Found" },
  { value: "500", label: "500 - Internal Server Error" },
]

export default function BuilderPage() {
  const { actualTheme } = useTheme()
  const searchParams = useSearchParams()
  const editMockId = searchParams.get('mockId') // Get mockId from URL params
  
  const [method, setMethod] = useState("GET")
  const [path, setPath] = useState("/api/users")
  const [statusCode, setStatusCode] = useState("200")
  const [delay, setDelay] = useState([100])
  const [isPublic, setIsPublic] = useState(true)
  const [response, setResponse] = useState(JSON.stringify(responseTemplates.userList, null, 2))
  const [mockName, setMockName] = useState("User List API")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [showAIModal, setShowAIModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const { toast } = useToast()

  const generatedUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/mock${path}`

  // Load existing mock data if editing
  useEffect(() => {
    const loadMockForEditing = async () => {
      if (!editMockId) {
        setIsInitialLoading(false)
        return
      }

      try {
        setIsEditMode(true)
        setIsInitialLoading(true)
        setLoadingError(null)

        const mockData = await mockApi.getMock(editMockId)
        
        // Populate form with existing mock data
        setMockName(mockData.name)
        setDescription(mockData.description || "")
        setPath(mockData.endpoint)
        setMethod(mockData.method)
        setStatusCode(mockData.status_code.toString())
        setDelay([mockData.delay_ms])
        setIsPublic(mockData.is_public)
        setResponse(JSON.stringify(mockData.response, null, 2))

        toast({
          title: "Mock loaded successfully",
          description: `Editing "${mockData.name}"`,
          variant: "success",
        })
      } catch (error) {
        console.error("Error loading mock for editing:", error)
        setLoadingError("Failed to load mock data for editing")
        toast({
          title: "Error loading mock",
          description: "Failed to load mock data. You can still create a new mock.",
          variant: "destructive",
        })
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadMockForEditing()
  }, [editMockId, toast])

  // Simulate initial loading for new mocks
  useEffect(() => {
    if (editMockId) return // Skip if editing

    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1500) // Show skeleton for 1.5 seconds on initial load

    return () => clearTimeout(timer)
  }, [editMockId])

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light'
      ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      : 'bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    cardBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    inputBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-[#2D2D2D] border-gray-700 hover:bg-[#3A3A3A]',
    selectBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    tabsBg: actualTheme === 'light' ? 'bg-slate-100' : 'bg-[#2D2D2D]',
    tabsActive: actualTheme === 'light' ? 'bg-white' : 'bg-[#3A3A3A]'
  }

  // Enhanced JSON validation with better error messages
  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString)
      setJsonError(null)
      return true
    } catch (error) {
      let errorMessage = "Invalid JSON"
      if (error instanceof SyntaxError) {
        const match = error.message.match(/at position (\d+)/)
        if (match) {
          const position = parseInt(match[1])
          const lines = jsonString.substring(0, position).split('\n')
          const line = lines.length
          const column = lines[lines.length - 1].length + 1
          errorMessage = `Syntax error at line ${line}, column ${column}: ${error.message}`
        } else {
          errorMessage = `Syntax error: ${error.message}`
        }
      }
      setJsonError(errorMessage)
      return false
    }
  }

  const handleResponseChange = (newResponse: string) => {
    setResponse(newResponse)
    validateJson(newResponse)
  }

  const handleTemplateSelect = (template: string) => {
    const templateData = responseTemplates[template as keyof typeof responseTemplates]
    const formatted = JSON.stringify(templateData, null, 2)
    setResponse(formatted)
    setJsonError(null)
  }
  const handleSnippetSelect = (snippet: string) => {
    try {
      // Parse the snippet string to validate it's valid JSON
      const parsed = JSON.parse(snippet)
      const formatted = JSON.stringify(parsed, null, 2)
      setResponse(formatted)
      setJsonError(null)
    } catch (error) {
      // If parsing fails, treat it as a string snippet
      setResponse(snippet)
      validateJson(snippet)
    }
  }

  const handleTest = async () => {
    if (!validateJson(response)) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax errors before testing",
        variant: "destructive",
      })
      return
    }    setIsTesting(true)
    try {
      const mockData: CreateMockRequest = {
        name: mockName,
        method: method as any,
        endpoint: path,
        status_code: Number.parseInt(statusCode),
        response: JSON.parse(response),
        delay_ms: delay[0],
        is_public: isPublic,
      }

      await mockApi.testMock(mockData)
      toast({
        title: "✅ Test Successful",
        description: "Mock endpoint is working correctly",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: error instanceof Error ? error.message : "Failed to test mock",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }
  const handleSave = async () => {
    if (!validateJson(response)) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax errors before saving",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const mockData: CreateMockRequest = {
        name: mockName,
        description: description || undefined,
        method: method as any,
        endpoint: path,
        status_code: Number.parseInt(statusCode),
        response: JSON.parse(response),
        delay_ms: delay[0],
        is_public: isPublic,
      }

      if (isEditMode && editMockId) {
        // Update existing mock
        await mockApi.updateMock(editMockId, mockData)
        setLastSaved(new Date())
        toast({
          title: "✅ Mock Updated",
          description: "Mock endpoint has been updated successfully",
          variant: "success",
        })
      } else {
        // Create new mock
        await mockApi.createMock(mockData)
        setLastSaved(new Date())
        toast({
          title: "💾 Mock Saved",
          description: "Mock endpoint has been created successfully",
          variant: "success",
        })
      }
    } catch (error) {
      toast({
        title: isEditMode ? "❌ Update Failed" : "❌ Save Failed",
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'save'} mock`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!validateJson(response)) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax errors before publishing",
        variant: "destructive",
      })
      return
    }    setIsPublishing(true)
    try {
      const mockData: CreateMockRequest = {
        name: mockName,
        method: method as any,
        endpoint: path,
        status_code: Number.parseInt(statusCode),
        response: JSON.parse(response),
        delay_ms: delay[0],
        is_public: true, // Force public when publishing
      }

      await mockApi.createMock(mockData)
      setLastSaved(new Date())
      toast({
        title: "🚀 Mock Published",
        description: "Mock endpoint is now live and accessible to everyone",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "❌ Publish Failed",
        description: error instanceof Error ? error.message : "Failed to publish mock",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "📋 Copied",
        description: "Copied to clipboard",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "❌ Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const getDevicePreviewClass = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-sm mx-auto"
      case "tablet":
        return "max-w-2xl mx-auto"
      default:        return "w-full"
    }
  }

  // AI Handler Functions
  const handleAIMockGenerated = (mockData: any) => {
    if (mockData.response_data) {
      const formattedResponse = JSON.stringify(mockData.response_data, null, 2)
      setResponse(formattedResponse)
      setJsonError(null)

      // Update other fields if provided
      if (mockData.status_code) {
        setStatusCode(mockData.status_code.toString())
      }

      toast({
        title: "🤖 AI Generated Successfully",
        description: "Mock response has been generated and applied",
        variant: "default",
      })
    }
  }

  const handleAIMockSaved = (savedMock: any) => {
    if (savedMock) {
      setLastSaved(new Date())
      toast({
        title: "🎉 AI Mock Saved",
        description: `Mock "${savedMock.name}" has been saved to your collection`,
        variant: "default",
      })
    }
  }
  const handleAIResponseGenerated = (generatedResponse: string) => {
    setResponse(generatedResponse)
    setJsonError(null)
  }
  const handleAIFloatingActionGenerate = (type: string) => {
    // Quick AI generation based on type
    setShowAIModal(true)
  }

  const handleAIFloatingActionOpenFull = () => {
    setShowAIModal(true)
  }
    return (
    <ProtectedRoute>
      <TooltipProvider>        <SidebarLayout>
          {isInitialLoading ? (
            <BuilderPageSkeleton theme={actualTheme} />
          ) : loadingError ? (
            <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-all duration-200`}>
              <Header />
              <main className="p-4 flex items-center justify-center h-[calc(100vh-3.5rem)]">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Failed to Load Mock
                    </CardTitle>
                    <CardDescription>
                      {loadingError}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      You can still use the builder to create a new mock.
                    </p>
                    <Button 
                      onClick={() => {
                        setLoadingError(null)
                        setIsEditMode(false)
                        // Reset form to defaults
                        setMockName("User List API")
                        setDescription("")
                        setPath("/api/users")
                        setMethod("GET")
                        setStatusCode("200")
                        setDelay([100])
                        setIsPublic(true)
                        setResponse(JSON.stringify(responseTemplates.userList, null, 2))
                      }}
                      className="w-full"
                    >
                      Create New Mock Instead
                    </Button>
                  </CardContent>
                </Card>
              </main>
            </div>
          ) : (
            <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-all duration-200`}>
              <Header />
          <main className="p-1.5 lg:p-2.5 overflow-x-hidden h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {/* Enhanced Header with Premium Styling */}
              <motion.div
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >              <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600">
                      <Code className="h-4 w-4 text-white" />
                    </div>                    <h1 className={`text-lg lg:text-xl font-bold ${themeColors.text} compact-leading`}>
                      {isEditMode ? 'Edit Mock' : 'Mock Builder'}
                    </h1>
                </div>
                  <p className={`${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'} mt-0.5 text-xs`}>
                    {isEditMode ? 'Update your existing API mock endpoint' : 'Create and configure your API mock endpoint'}
                  </p>
                  {lastSaved && (
                    <motion.div
                      className={`flex items-center gap-2 mt-2 text-xs ${actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Last saved {lastSaved.toLocaleTimeString()}
                    </motion.div>
                  )}
                </div>              {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full lg:w-auto">                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTest}
                      disabled={isTesting || !!jsonError}
                      className={`w-full sm:w-auto ${themeColors.buttonBg} ${themeColors.text} text-xs h-7 px-3`}
                    >
                      {isTesting ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Play className="h-3 w-3 mr-1.5" />}
                      {isTesting ? "Testing..." : "Test"}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading || !!jsonError}
                      className={`w-full sm:w-auto ${themeColors.buttonBg} ${themeColors.text} text-xs h-7 px-3`}
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Save className="h-3 w-3 mr-1.5" />}
                      {isLoading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Mock" : "Save Draft")}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !!jsonError}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg text-xs h-7 px-3"
                      size="sm"
                    >
                      {isPublishing ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <Globe className="h-3 w-3 mr-1.5" />
                      )}
                      {isPublishing ? "Publishing..." : "Publish Live"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>            {/* Enhanced JSON Error Alert */}
              {jsonError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-3 border-red-500/20 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>JSON Syntax Error:</strong> {jsonError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {/* Enhanced Responsive Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Left Panel - Configuration */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {/* Configure Endpoint Section */}
                  <div>                  <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-600">
                        <Settings className="h-3 w-3 text-white" />
                      </div>
                      <h2 className={`text-sm font-semibold ${themeColors.text}`}>Configure Endpoint</h2>
                    </div>

                    <Card className={themeColors.cardBg}>                    <CardHeader className="pb-1.5 pt-3 px-3">
                        <CardTitle className={`flex items-center gap-1.5 ${themeColors.text} text-xs`}>
                          <Sparkles className="h-3 w-3 text-blue-400" />
                          Basic Configuration
                        </CardTitle>
                        <CardDescription className={`${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'} text-2xs`}>Set up the fundamental properties of your mock endpoint</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">                        <div>
                          <Label htmlFor="mock-name" className={`${themeColors.text} text-xs`}>Mock Name</Label>
                          <Input
                            id="mock-name"
                            value={mockName}
                            onChange={(e) => setMockName(e.target.value)}
                            placeholder="Enter a descriptive name"
                            className={`mt-1 ${themeColors.inputBg} ${themeColors.text} text-xs h-8`}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mock-description" className={`${themeColors.text} text-xs`}>Description (Optional)</Label>
                          <Textarea
                            id="mock-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this mock endpoint does"
                            className={`mt-1 ${themeColors.inputBg} ${themeColors.text} text-xs resize-none`}
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="method" className={`${themeColors.text} text-xs`}>HTTP Method</Label>
                            <Select value={method} onValueChange={setMethod}>
                              <SelectTrigger className={`mt-1 ${themeColors.selectBg} ${themeColors.text} h-8 text-xs`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={themeColors.selectBg}>                              {httpMethods.map((m) => (
                                  <SelectItem key={m} value={m} className={`${themeColors.text} ${actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'} text-xs`}>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-2xs px-1.5 py-0",
                                          m === "GET" && "bg-green-600 text-white",
                                          m === "POST" && "bg-blue-600 text-white",
                                          m === "PUT" && "bg-orange-600 text-white",
                                          m === "DELETE" && "bg-red-600 text-white",
                                          m === "PATCH" && "bg-purple-600 text-white",
                                        )}
                                      >
                                        {m}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status-code" className={`${themeColors.text} text-xs`}>Status Code</Label>
                            <Select value={statusCode} onValueChange={setStatusCode}>
                              <SelectTrigger className={`mt-1 ${themeColors.selectBg} ${themeColors.text} h-8 text-xs`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={themeColors.selectBg}>
                                {statusCodes.map((code) => (
                                  <SelectItem key={code.value} value={code.value} className={`${themeColors.text} ${actualTheme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[#3A3A3A]'} text-xs`}>
                                    {code.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>                      <div>
                          <Label htmlFor="path" className={`${themeColors.text} text-xs`}>Endpoint Path</Label>
                          <Input
                            id="path"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            placeholder="/api/endpoint"
                            className={`mt-1 font-mono ${themeColors.inputBg} ${themeColors.text} text-xs h-8`}
                          />
                        </div>

                        <div>
                          <Label className={`${themeColors.text} text-xs`}>Response Delay: {delay[0]}ms</Label>
                          <Slider value={delay} onValueChange={setDelay} max={5000} step={50} className="mt-2" />
                          <div className={`flex justify-between text-2xs ${actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400'} mt-1`}>
                            <span>0ms</span>
                            <span>5000ms</span>
                          </div>
                        </div>

                        <div className={`flex items-center justify-between p-2 ${actualTheme === 'light' ? 'border-slate-300 bg-slate-50' : 'border-gray-700 bg-[#2D2D2D]'} rounded-lg`}>
                          <div>
                            <Label htmlFor="public-toggle" className={`font-medium ${themeColors.text} text-xs`}>
                              Public Endpoint
                            </Label>
                            <p className={`text-2xs ${actualTheme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>Allow anyone to access this mock</p>
                          </div>
                          <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>                {/* AI-Enhanced JSON Snippets */}
                  <div>
                    <AISnippetWizard
                      onSnippetGenerated={handleAIResponseGenerated}
                      onSnippetSelect={handleSnippetSelect}
                    />
                  </div>{/* Advanced Options */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="advanced" className={actualTheme === 'light' ? 'border-slate-200' : 'border-gray-800'}>
                      <AccordionTrigger className={`text-sm font-medium ${themeColors.text}`}>Advanced Options</AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-3">
                        <div>
                          <Label htmlFor="headers" className={`${themeColors.text} text-xs`}>Custom Headers</Label>
                          <Textarea
                            id="headers"
                            placeholder="Content-Type: application/json&#10;X-Custom-Header: value"
                            rows={3}
                            className={`mt-1 font-mono text-xs ${themeColors.inputBg} ${themeColors.text}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cors" className={`${themeColors.text} text-xs`}>CORS Settings</Label>
                          <Input id="cors" placeholder="https://example.com, https://app.example.com" className={`mt-1 ${themeColors.inputBg} ${themeColors.text} text-xs h-8`} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>                  {/* AI Enhanced Generator - Now Modal Triggered */}
                </motion.div>
                {/* Right Panel - Response Editor & Preview */}
                <motion.div
                  className="space-y-2.5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Mock Response Section */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-600">
                        <Code className="h-3 w-3 text-white" />
                      </div>
                      <h2 className={`text-sm font-semibold ${themeColors.text}`}>Mock Response</h2>
                    </div>

                    <MonacoJsonEditor
                      value={response}
                      onChange={handleResponseChange}
                      height="350px"
                      showValidation={true}
                      showToolbar={true}
                      placeholder="Enter your JSON response..."
                    />
                  </div>{/* Enhanced Preview Output Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                          <Eye className="h-3 w-3 text-white" />
                        </div>
                        <h2 className={`text-lg font-semibold ${themeColors.text}`}>Preview Output</h2>
                      </div>

                      {/* Device Preview Toggle */}
                      <div className={`flex items-center gap-1 ${actualTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-gray-700 bg-[#2D2D2D]'} rounded-lg p-1`}>
                        <Button
                          variant={previewDevice === "desktop" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("desktop")}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={previewDevice === "tablet" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("tablet")}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          <Tablet className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={previewDevice === "mobile" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("mobile")}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          <Smartphone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className={getDevicePreviewClass()}>
                      <Card className={themeColors.cardBg}>
                        <CardHeader className="pb-3">
                          <CardTitle className={`flex items-center gap-2 ${themeColors.text} text-sm`}>
                            <Eye className="h-4 w-4 text-blue-400" />
                            Live Preview
                          </CardTitle>
                          <CardDescription className={`${actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400'} text-xs`}>Preview your mock endpoint and integration examples</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="endpoint" className="w-full">
                            <TabsList className={`grid w-full grid-cols-3 ${themeColors.tabsBg} h-8`}>
                              <TabsTrigger value="endpoint" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>Endpoint</TabsTrigger>
                              <TabsTrigger value="curl" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>cURL</TabsTrigger>
                              <TabsTrigger value="javascript" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>JavaScript</TabsTrigger>
                            </TabsList>

                            <TabsContent value="endpoint" className="space-y-3 mt-3">
                              <div>
                                <Label className={`${themeColors.text} text-xs`}>Generated URL</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input value={generatedUrl} readOnly className={`font-mono text-xs ${themeColors.inputBg} ${themeColors.text} h-8`} />
                                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedUrl)} className={`${themeColors.buttonBg} ${themeColors.text} h-8 w-8 p-0`}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <Separator className={actualTheme === 'light' ? 'bg-slate-200' : 'bg-gray-700'} />                            <div>
                                <Label className={`${themeColors.text} text-xs`}>Response Preview</Label>
                                <div className={`mt-1 p-2 ${actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700'} rounded-lg font-mono text-xs max-h-32 overflow-auto border`}>
                                  <pre className={`whitespace-pre-wrap break-words ${actualTheme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>{response}</pre>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="curl" className="mt-3">
                              <div>
                                <Label className={`${themeColors.text} text-xs`}>cURL Command</Label>
                                <div className={`mt-1 p-2 ${actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700'} rounded-lg font-mono text-xs overflow-x-auto border`}>
                                  <pre className={`whitespace-pre-wrap break-all ${actualTheme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>{`curl -X ${method} "${generatedUrl}" \\-H "Content-Type: application/json"`}</pre>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`mt-2 ${themeColors.buttonBg} ${themeColors.text} text-xs h-7`}
                                  onClick={() =>
                                    copyToClipboard(
                                      `curl -X ${method} "${generatedUrl}" -H "Content-Type: application/json"`,
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="javascript" className="mt-3">
                              <div>
                                <Label className={`${themeColors.text} text-xs`}>JavaScript Fetch</Label>
                                <div className={`mt-1 p-2 ${actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700'} rounded-lg font-mono text-xs overflow-x-auto border`}>
                                    <pre className={`whitespace-pre-wrap break-words ${actualTheme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>{`fetch('${generatedUrl}', {
                                      method: '${method}',
                                      headers: {
                                      'Content-Type': 'application/json'
                                      }
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                      // Handle response data here
                                    });`}
                                  </pre>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`mt-2 ${themeColors.buttonBg} ${themeColors.text} text-xs h-7`}
                                  onClick={() =>
                                    copyToClipboard(
                                      `fetch('${generatedUrl}', {\n  method: '${method}',\n  headers: {\n    'Content-Type': 'application/json'\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data));`,
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
                 </div>              {/* AI Floating Action Button */}
              <AIFloatingActionButton
                onQuickGenerate={handleAIFloatingActionGenerate}
                onOpenFullGenerator={handleAIFloatingActionOpenFull}
              />

              {/* AI Generator Modal */}
              <AIGeneratorModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                onMockGenerated={handleAIMockGenerated}
                onMockSaved={handleAIMockSaved}
                onResponseGenerated={handleAIResponseGenerated}
                initialEndpoint={path}
                initialMethod={method}
              />
            </div>
          </main>
            </div>
          )}
        </SidebarLayout>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
