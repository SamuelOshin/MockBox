"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"
import { useNavigation } from "@/components/ui/line-loader"
import { useTheme } from "@/components/ui/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BuilderPageSkeleton } from "@/components/ui/builder-skeleton"
import MonacoJsonEditor from "@/components/editor/monaco-json-editor"
import JsonSnippets from "@/components/editor/json-snippets"
import { AISnippetWizard } from "@/components/editor/ai-snippet-wizard"
import { AIGenerationPanel } from "@/components/editor/ai-generation-panel"
import { AIGeneratorModal } from "@/components/editor/ai-generator-modal"
import { AIFloatingActionButton } from "@/components/editor/ai-floating-action-button"
import { TemplateSelectionModal } from "@/components/editor/template-selection-modal"
import { mockApi } from "@/lib/api"
import { getTemplateById } from "@/lib/api"
import { CreateMockRequest, TemplateDetail, HTTPMethod } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Save,
  Play,
  Code,
  Settings,
  Zap,
  Globe,
  Lock,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react"

function BuilderPageContent() {
  const [formData, setFormData] = useState<CreateMockRequest>({
    name: "",
    description: "",
    endpoint: "",
    method: "GET" as HTTPMethod,
    response: {},
    headers: {},
    status_code: 200,
    delay_ms: 0,
    is_public: false,
    tags: []
  })
  const [jsonString, setJsonString] = useState<string>("{}")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)
  const [templateLoadError, setTemplateLoadError] = useState<string | null>(null)
  const [loadedTemplate, setLoadedTemplate] = useState<TemplateDetail | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  
  const { toast } = useToast()
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()
  const searchParams = useSearchParams()
  
  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100' : 'bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-300',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-500',
    cardBg: actualTheme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-gray-800',
    cardHover: actualTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#1F1F1F]',
    buttonBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-[#2D2D2D] border-gray-700 hover:bg-[#3A3A3A]',
    codeBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    codeText: actualTheme === 'light' ? 'text-slate-800' : 'text-gray-200',
    tabsBg: actualTheme === 'light' ? 'bg-slate-100' : 'bg-[#2D2D2D]',
    tabsActive: actualTheme === 'light' ? 'bg-white' : 'bg-[#3A3A3A]'
  }

  // Load template data if templateId is provided in URL or localStorage
  useEffect(() => {
    let templateId = searchParams.get('templateId')
    
    // Check localStorage if templateId is not in URL
    if (!templateId) {
      templateId = localStorage.getItem('pendingTemplateId')
      if (templateId) {
        // Update URL with template ID
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('templateId', templateId)
        window.history.replaceState({}, '', newUrl.toString())
        
        // Clear the stored template ID
        localStorage.removeItem('pendingTemplateId')
      }
    } else {
      // Clear any pending template ID if we have one in URL
      localStorage.removeItem('pendingTemplateId')
    }
    
    if (templateId) {
      const loadTemplate = async () => {
        setIsLoadingTemplate(true)
        setTemplateLoadError(null)
        
        try {
          const templateData = await getTemplateById(templateId)
          
          if (templateData && templateData.template_data) {
            setLoadedTemplate(templateData)
            
            // Check if template has multiple endpoints or responses
            const endpoints = templateData.template_data.endpoints || []
            const hasMultipleOptions = endpoints.length > 1 || 
              endpoints.some(endpoint => 
                endpoint.responses && endpoint.responses.length > 1
              )
            
            console.log('Template loading:', {
              templateName: templateData.name,
              endpointsCount: endpoints.length,
              hasMultipleOptions,
              endpoints: endpoints.map((ep, i) => ({
                index: i,
                endpoint: ep.endpoint,
                method: ep.method,
                responsesCount: ep.responses?.length || 0,
                hasDirectResponse: !!ep.response
              }))
            })
            
            if (hasMultipleOptions) {
              // Show selection modal for complex templates
              setShowTemplateModal(true)
            } else if (endpoints.length === 1) {
              // Auto-select single endpoint/response
              applyTemplateConfiguration(templateData, 0, 0)
            } else {
              throw new Error("Template has no endpoints defined")
            }
          } else {
            throw new Error("Invalid template data structure")
          }
        } catch (error) {
          console.error("Error loading template:", error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'object' && error !== null && 'message' in error 
              ? String((error as any).message) 
              : "Failed to load template";
          
          setTemplateLoadError(errorMessage)
          
          toast({
            title: "Template loading failed",
            description: errorMessage,
            variant: "destructive",
          })
        } finally {
          setIsLoadingTemplate(false)
        }
      }
      
      loadTemplate()
    }
  }, [searchParams, toast])

  // Update response object when JSON string changes
  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonString)
      setFormData(prev => ({ ...prev, response: parsedJson }))
    } catch (e) {
      // Invalid JSON, don't update the response
    }
  }, [jsonString])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "method") {
      // Ensure method is properly typed as HTTPMethod
      setFormData(prev => ({ ...prev, [name]: value as HTTPMethod }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_public: checked }))
  }

  const handleSnippetSelect = (snippet: string) => {
    setJsonString(snippet)
  }

  const handleResponseGeneration = (response: string) => {
    setJsonString(response)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.endpoint || !formData.method) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const result = await mockApi.createMock(formData)
      
      toast({
        title: "Mock Created",
        description: "Your mock has been created successfully",
        variant: "default",
      })
      
      // Navigate to the mock detail page
      navigateTo(`/mocks/${result.id}`)
    } catch (error) {
      console.error("Error creating mock:", error)
      
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create mock",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!formData.endpoint || !formData.method) {
      toast({
        title: "Validation Error",
        description: "Please fill in endpoint and method",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await mockApi.testMock(formData)
      setTestResult(result)
      
      toast({
        title: "Test Successful",
        description: "Your mock endpoint is working correctly",
        variant: "default",
      })
    } catch (error) {
      console.error("Error testing mock:", error)
      
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test mock",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      
      toast({
        title: "Copied to clipboard",
        description: `${type} has been copied to clipboard`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
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
      default:
        return "w-full"
    }
  }

  // Apply selected template configuration to the form
  const applyTemplateConfiguration = (templateData: TemplateDetail, endpointIndex: number, responseIndex: number) => {
    const endpoints = templateData.template_data?.endpoints || []
    const selectedEndpoint = endpoints[endpointIndex]
    
    if (!selectedEndpoint) {
      toast({
        title: "Invalid selection",
        description: "Selected endpoint not found",
        variant: "destructive",
      })
      return
    }
    
    // Get the response data
    let responseData = {}
    let statusCode = 200
    let headers = {}
    let delayMs = 0
    
    if (selectedEndpoint.responses && selectedEndpoint.responses[responseIndex]) {
      // Use selected response from responses array
      const selectedResponse = selectedEndpoint.responses[responseIndex]
      responseData = selectedResponse.response || {}
      statusCode = selectedResponse.status_code || 200
      headers = selectedResponse.headers || {}
      delayMs = selectedResponse.delay_ms || 0
    } else if (selectedEndpoint.response) {
      // Use direct response property
      responseData = selectedEndpoint.response
      statusCode = selectedEndpoint.status_code || 200
      headers = selectedEndpoint.headers || {}
      delayMs = selectedEndpoint.delay_ms || 0
    }
    
    // Update form data with selected configuration
    setFormData({
      name: `${templateData.name} - ${selectedEndpoint.endpoint || '/api/endpoint'}`,
      description: templateData.description || '',
      endpoint: selectedEndpoint.endpoint || '/api/endpoint',
      method: selectedEndpoint.method || 'GET',
      response: responseData,
      headers: headers,
      status_code: statusCode,
      delay_ms: delayMs,
      is_public: false,
      tags: [...(templateData.tags || []), 'from-template']
    })
    
    // Update JSON string for the editor
    setJsonString(JSON.stringify(responseData, null, 2))
    
    toast({
      title: "Template configuration applied",
      description: `Using ${selectedEndpoint.endpoint || '/api/endpoint'} from ${templateData.name}`,
      variant: "default",
    })
  }

  // Handle template selection from modal
  const handleTemplateSelection = (endpointIndex: number, responseIndex: number) => {
    console.log('handleTemplateSelection called:', { endpointIndex, responseIndex, loadedTemplate: !!loadedTemplate })
    if (loadedTemplate) {
      applyTemplateConfiguration(loadedTemplate, endpointIndex, responseIndex)
    }
    setShowTemplateModal(false)
  }

  // if (isLoading || isLoadingTemplate) {
  //   return (
  //     <ProtectedRoute>
  //       <SidebarLayout>
  //         <BuilderPageSkeleton theme={actualTheme} />
  //       </SidebarLayout>
  //     </ProtectedRoute>
  //   )
  // }

  return (
    <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
      <Header />
      <main className="p-2 sm:p-3 md:p-6 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">{/* Header with Back Button */}
          {/* Header with Back Button */}
          <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateTo("/mocks")}
                className={`${themeColors.buttonBg} ${themeColors.text} h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0`}
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${themeColors.text} mb-0.5 sm:mb-1 truncate`}>Create New Mock</h1>
                <p className={`text-xs sm:text-sm ${themeColors.textSecondary} line-clamp-2 leading-tight sm:leading-normal`}>
                  Design your API mock endpoint with custom responses
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || !formData.endpoint || !formData.method}
                className={`${themeColors.buttonBg} ${themeColors.text} gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9`}
                size="sm"
              >
                {isTesting ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="hidden xs:inline">{isTesting ? "Testing..." : "Test Mock"}</span>
                <span className="xs:hidden">{isTesting ? "Test..." : "Test"}</span>
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.endpoint || !formData.method}
                className="gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="hidden xs:inline">{isSaving ? "Saving..." : "Save Mock"}</span>
                <span className="xs:hidden">{isSaving ? "Save..." : "Save"}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsAIModalOpen(true)}
                className="gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/30 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                <span className="hidden sm:inline">AI Generate</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </div>
          </div>

          {/* Template Status Indicator */}
          {loadedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6"
            >
              <Card className={`${themeColors.cardBg} border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base truncate">
                          Template Applied: {loadedTemplate.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 truncate">
                          Using endpoint: <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-xs">{formData.endpoint}</code>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplateModal(true)}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50 text-xs sm:text-sm h-7 sm:h-8"
                      >
                        <span className="hidden xs:inline">Switch Configuration</span>
                        <span className="xs:hidden">Switch</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLoadedTemplate(null)
                          // Reset URL to remove templateId
                          const newUrl = new URL(window.location.href)
                          newUrl.searchParams.delete('templateId')
                          window.history.replaceState({}, '', newUrl.toString())
                        }}
                        className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm h-7 sm:h-8"
                      >
                        <span className="hidden xs:inline">Clear Template</span>
                        <span className="xs:hidden">Clear</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Template Load Error */}
          {templateLoadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 sm:mb-4"
            >
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <CardContent className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-red-800 dark:text-red-300 text-sm sm:text-base">Template Loading Error</h3>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-200 mt-1 break-words">{templateLoadError}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-4 sm:space-y-6">
              {/* Configure Endpoint Section */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <h2 className={`text-lg sm:text-xl font-bold ${themeColors.text}`}>Configure Endpoint</h2>
                </div>

                <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure the basic details of your mock API endpoint
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                    {/* Mock Name */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm">Mock Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter a descriptive name"
                        className="text-sm h-8 sm:h-10"
                      />
                    </div>

                    {/* Method and Path */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="method" className="text-xs sm:text-sm">HTTP Method</Label>
                        <Select
                          value={formData.method}
                          onValueChange={(value) => handleSelectChange("method", value)}
                        >
                          <SelectTrigger className="h-8 sm:h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600 text-white text-xs">GET</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="POST">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white text-xs">POST</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="PUT">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-orange-600 text-white text-xs">PUT</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="DELETE">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-600 text-white text-xs">DELETE</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="PATCH">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-purple-600 text-white text-xs">PATCH</Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="endpoint" className="text-xs sm:text-sm">Endpoint Path</Label>
                        <Input
                          id="endpoint"
                          name="endpoint"
                          value={formData.endpoint}
                          onChange={handleInputChange}
                          placeholder="/api/endpoint"
                          className="text-sm h-8 sm:h-10 font-mono"
                        />
                      </div>
                    </div>

                    {/* Status Code and Delay */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="status_code" className="text-xs sm:text-sm">Status Code</Label>
                        <Input
                          id="status_code"
                          name="status_code"
                          type="number"
                          value={formData.status_code}
                          onChange={handleNumberChange}
                          min={100}
                          max={599}
                          className="text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="delay_ms" className="text-xs sm:text-sm">Response Delay (ms)</Label>
                        <Input
                          id="delay_ms"
                          name="delay_ms"
                          type="number"
                          value={formData.delay_ms}
                          onChange={handleNumberChange}
                          min={0}
                          max={10000}
                          className="text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="description" className="text-xs sm:text-sm">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Describe what this mock endpoint does"
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>

                    {/* Public Toggle */}
                    <div className="flex items-center space-x-2 pt-1 sm:pt-2">
                      <Switch
                        id="is_public"
                        checked={formData.is_public}
                        onCheckedChange={handleSwitchChange}
                        className="scale-90 sm:scale-100"
                      />
                      <div className="grid gap-1 leading-none flex-1 min-w-0">
                        <Label htmlFor="is_public" className="text-xs sm:text-sm">Public Endpoint</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this mock accessible without authentication
                        </p>
                      </div>
                      {formData.is_public ? (
                        <Globe className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Lock className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* JSON Snippets */}
              <JsonSnippets onSnippetSelect={handleSnippetSelect} />

              
            </div>

            {/* Right Column - Response Editor & Preview */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mock Response Section */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <h2 className={`text-lg sm:text-xl font-bold ${themeColors.text}`}>Mock Response</h2>
                </div>

                <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Response Body</CardTitle>
                      <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(jsonString, "JSON")}
                          className={`h-7 sm:h-8 ${themeColors.buttonBg} px-2 sm:px-3`}
                        >
                          <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                          <span className="hidden sm:inline ml-1">Copy</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([jsonString], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'mock-response.json'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }}
                          className={`h-7 sm:h-8 ${themeColors.buttonBg} px-2 sm:px-3`}
                        >
                          <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                          <span className="hidden sm:inline ml-1">Download</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">
                      Edit the JSON response that will be returned by your mock API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <MonacoJsonEditor
                      value={jsonString}
                      onChange={setJsonString}
                      height="250px"
                      showValidation={true}
                      showToolbar={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Preview Output Section */}
              <div>
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                    <h2 className={`text-lg sm:text-xl font-bold ${themeColors.text}`}>Preview & Test</h2>
                  </div>

                  {/* Device Preview Toggle */}
                  <div className={`flex items-center gap-1 ${actualTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-gray-700 bg-[#2D2D2D]'} rounded-lg p-1 flex-shrink-0`}>
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    >
                      <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                    <Button
                      variant={previewDevice === "tablet" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("tablet")}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    >
                      <Tablet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                    >
                      <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </div>
                </div>

                <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Response Preview</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTest}
                        disabled={isTesting || !formData.endpoint || !formData.method}
                        className={`${themeColors.buttonBg} gap-1.5 sm:gap-2 h-7 sm:h-8 flex-shrink-0`}
                      >
                        {isTesting ? (
                          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                        <span className="text-xs sm:text-sm">{isTesting ? "Testing..." : "Test Endpoint"}</span>
                      </Button>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">
                      Preview how your mock API will respond to requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className={getDevicePreviewClass()}>
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList className={`grid w-full grid-cols-3 ${themeColors.tabsBg} h-8 sm:h-10`}>
                          <TabsTrigger value="preview" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>Preview</TabsTrigger>
                          <TabsTrigger value="curl" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>cURL</TabsTrigger>
                          <TabsTrigger value="fetch" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>Fetch</TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="mt-3 sm:mt-4">
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <Label className="text-xs sm:text-sm font-medium mb-2 block">Response Preview</Label>
                              <div className={`rounded-lg border ${themeColors.codeBg} overflow-hidden`}>
                                <ScrollbarContainer
                                  maxHeight="250px"
                                  className="p-3 sm:p-4 font-mono text-xs sm:text-sm"
                                  theme={actualTheme === "light" ? "light" : "dark"}
                                >
                                  <pre className={themeColors.codeText}>
                                    {JSON.stringify(formData.response, null, 2)}
                                  </pre>
                                </ScrollbarContainer>
                              </div>
                            </div>

                            {testResult && (
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium mb-2 block">Test Result</Label>
                                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                  <CardContent className="p-3 sm:p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                      <span className="font-medium text-green-800 dark:text-green-300 text-sm">
                                        Test Successful
                                      </span>
                                    </div>
                                    <div className={`rounded-lg border ${themeColors.codeBg} overflow-hidden mt-2`}>
                                      <ScrollbarContainer
                                        maxHeight="150px"
                                        className="p-2 sm:p-3 font-mono text-xs"
                                        theme={actualTheme === "light" ? "light" : "dark"}
                                      >
                                        <pre className={themeColors.codeText}>
                                          {JSON.stringify(testResult, null, 2)}
                                        </pre>
                                      </ScrollbarContainer>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="curl" className="mt-3 sm:mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium mb-2 block">cURL Command</Label>
                            <div className={`p-3 sm:p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto`}>
                              <pre className={themeColors.codeText}>
                                {`curl -X ${formData.method} "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}"`}
                              </pre>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(`curl -X ${formData.method} "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}"`, "cURL command")}
                              className={`${themeColors.buttonBg} gap-1.5 sm:gap-2 mt-2 h-7 sm:h-8`}
                            >
                              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="text-xs sm:text-sm">Copy Command</span>
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="fetch" className="mt-3 sm:mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium mb-2 block">Fetch API</Label>
                            <div className={`p-3 sm:p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto`}>
                              <pre className={themeColors.codeText}>
                                {`fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}", {
  method: "${formData.method}",
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                              </pre>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(`fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}", {
  method: "${formData.method}",
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`, "Fetch code")}
                              className={`${themeColors.buttonBg} gap-1.5 sm:gap-2 mt-2 h-7 sm:h-8`}
                            >
                              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="text-xs sm:text-sm">Copy Code</span>
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* AI Generation Panel */}
              <AISnippetWizard onSnippetGenerated={handleResponseGeneration} onSnippetSelect={handleSnippetSelect} />
            </div>
          </div>
        </div>
      </main>
      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onMockGenerated={(data) => {
          // Update form data with generated mock
          setFormData({
            ...formData,
            name: data.name || formData.name,
            description: data.description || formData.description,
            endpoint: data.endpoint || formData.endpoint,
            method: data.method || formData.method,
            response: data.response || formData.response,
            headers: data.headers || formData.headers,
            status_code: data.status_code || formData.status_code,
            delay_ms: data.delay_ms || formData.delay_ms,
            is_public: data.is_public !== undefined ? data.is_public : formData.is_public,
            tags: [...(data.tags || []), 'generated-by-ai']
          })
          setJsonString(JSON.stringify(data.response, null, 2))
        }}
        onMockSaved={(mock) => {
          // Navigate to the saved mock
          navigateTo(`/mocks/${mock.id}`)
        }}
        onResponseGenerated={handleResponseGeneration}
        initialEndpoint={formData.endpoint}
        initialMethod={formData.method}
      />
      
      {/* Template Selection Modal */}
      {loadedTemplate && (
        <TemplateSelectionModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          template={loadedTemplate}
          onSelect={handleTemplateSelection}
        />
      )}
      
      {/* AI Floating Action Button */}
      <AIFloatingActionButton
        onOpenFullGenerator={() => setIsAIModalOpen(true)}
        onQuickGenerate={(type: string) => {
          toast({
            title: "AI Generation",
            description: `Quick generation for ${type} started`,
          })
        }}
      />
    </div>
  )
}

export default function BuilderPage() {
  const { actualTheme } = useTheme();
  return (
    <ProtectedRoute>
      <SidebarLayout>
        <Suspense fallback={<BuilderPageSkeleton theme={actualTheme} />}>
          <BuilderPageContent />
        </Suspense>
      </SidebarLayout>
    </ProtectedRoute>
  )
}