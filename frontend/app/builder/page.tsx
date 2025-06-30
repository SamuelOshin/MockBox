"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle
} from "lucide-react"

export default function BuilderPage() {
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

  // Load template data if templateId is provided in URL
  useEffect(() => {
    const templateId = searchParams.get('templateId')
    
    if (templateId) {
      const loadTemplate = async () => {
        setIsLoadingTemplate(true)
        setTemplateLoadError(null)
        
        try {
          const templateData = await getTemplateById(templateId)
          
          if (templateData && templateData.template_data) {
            // Extract endpoints from template data
            const endpoints = templateData.template_data.endpoints || []
            
            if (endpoints.length > 0) {
              // Use the first endpoint as the default
              const firstEndpoint = endpoints[0]
              
              // Update form data with template values
              setFormData({
                name: `${templateData.name} - ${firstEndpoint.endpoint || '/api/endpoint'}`,
                description: templateData.description || '',
                endpoint: firstEndpoint.endpoint || '/api/endpoint',
                method: firstEndpoint.method || 'GET',
                response: firstEndpoint.response || {},
                headers: firstEndpoint.headers || {},
                status_code: firstEndpoint.status_code || 200,
                delay_ms: firstEndpoint.delay_ms || 0,
                is_public: false,
                tags: [...(templateData.tags || []), 'from-template']
              })
              
              // Update JSON string for the editor
              setJsonString(JSON.stringify(firstEndpoint.response || {}, null, 2))
              
              toast({
                title: "Template loaded",
                description: `${templateData.name} template has been loaded successfully`,
                variant: "default",
              })
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

  if (isLoading || isLoadingTemplate) {
    return (
      <ProtectedRoute>
        <SidebarLayout>
          <BuilderPageSkeleton theme={actualTheme} />
        </SidebarLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
          <Header />
          <main className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {/* Header with Back Button */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigateTo("/mocks")}
                    className={`${themeColors.buttonBg} ${themeColors.text} h-9 w-9 p-0`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className={`text-2xl font-bold ${themeColors.text} mb-1`}>Create New Mock</h1>
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Design your API mock endpoint with custom responses
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting || !formData.endpoint || !formData.method}
                    className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isTesting ? "Testing..." : "Test Mock"}
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !formData.name || !formData.endpoint || !formData.method}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Mock"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsAIModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/30"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Generate
                  </Button>
                </div>
              </div>

              {/* Template Load Error */}
              {templateLoadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-red-800 dark:text-red-300">Template Loading Error</h3>
                        <p className="text-sm text-red-600 dark:text-red-200">{templateLoadError}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Configuration */}
                <div className="space-y-6">
                  {/* Configure Endpoint Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <h2 className={`text-xl font-bold ${themeColors.text}`}>Configure Endpoint</h2>
                    </div>

                    <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                        <CardDescription>
                          Configure the basic details of your mock API endpoint
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Mock Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name">Mock Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter a descriptive name"
                          />
                        </div>

                        {/* Method and Path */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="method">HTTP Method</Label>
                            <Select
                              value={formData.method}
                              onValueChange={(value) => handleSelectChange("method", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-600 text-white">GET</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="POST">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-600 text-white">POST</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="PUT">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-orange-600 text-white">PUT</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="DELETE">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-red-600 text-white">DELETE</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="PATCH">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-600 text-white">PATCH</Badge>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endpoint">Endpoint Path</Label>
                            <Input
                              id="endpoint"
                              name="endpoint"
                              value={formData.endpoint}
                              onChange={handleInputChange}
                              placeholder="/api/endpoint"
                            />
                          </div>
                        </div>

                        {/* Status Code and Delay */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status_code">Status Code</Label>
                            <Input
                              id="status_code"
                              name="status_code"
                              type="number"
                              value={formData.status_code}
                              onChange={handleNumberChange}
                              min={100}
                              max={599}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="delay_ms">Response Delay (ms)</Label>
                            <Input
                              id="delay_ms"
                              name="delay_ms"
                              type="number"
                              value={formData.delay_ms}
                              onChange={handleNumberChange}
                              min={0}
                              max={10000}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description || ""}
                            onChange={handleInputChange}
                            placeholder="Describe what this mock endpoint does"
                            rows={3}
                          />
                        </div>

                        {/* Public Toggle */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="is_public"
                            checked={formData.is_public}
                            onCheckedChange={handleSwitchChange}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="is_public">Public Endpoint</Label>
                            <p className="text-sm text-muted-foreground">
                              Make this mock accessible without authentication
                            </p>
                          </div>
                          {formData.is_public ? (
                            <Globe className="ml-auto h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="ml-auto h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* JSON Snippets */}
                  <JsonSnippets onSnippetSelect={handleSnippetSelect} />

                  {/* AI Generation Panel */}
                  <AISnippetWizard onSnippetGenerated={handleResponseGeneration} onSnippetSelect={handleSnippetSelect} />
                </div>

                {/* Right Column - Response Editor & Preview */}
                <div className="space-y-6">
                  {/* Mock Response Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="h-5 w-5 text-purple-500" />
                      <h2 className={`text-xl font-bold ${themeColors.text}`}>Mock Response</h2>
                    </div>

                    <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Response Body</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(jsonString, "JSON")}
                              className={`h-8 ${themeColors.buttonBg}`}
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
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
                              className={`h-8 ${themeColors.buttonBg}`}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Edit the JSON response that will be returned by your mock API
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MonacoJsonEditor
                          value={jsonString}
                          onChange={setJsonString}
                          height="400px"
                          showValidation={true}
                          showToolbar={true}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Output Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <h2 className={`text-xl font-bold ${themeColors.text}`}>Preview & Test</h2>
                      </div>

                      {/* Device Preview Toggle */}
                      <div className={`flex items-center gap-1 ${actualTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-gray-700 bg-[#2D2D2D]'} rounded-lg p-1`}>
                        <Button
                          variant={previewDevice === "desktop" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("desktop")}
                          className="h-7 w-7 p-0"
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant={previewDevice === "tablet" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("tablet")}
                          className="h-7 w-7 p-0"
                        >
                          <Tablet className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant={previewDevice === "mobile" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPreviewDevice("mobile")}
                          className="h-7 w-7 p-0"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Response Preview</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTest}
                            disabled={isTesting || !formData.endpoint || !formData.method}
                            className={`${themeColors.buttonBg} gap-2`}
                          >
                            {isTesting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            {isTesting ? "Testing..." : "Test Endpoint"}
                          </Button>
                        </div>
                        <CardDescription>
                          Preview how your mock API will respond to requests
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={getDevicePreviewClass()}>
                          <Tabs defaultValue="preview" className="w-full">
                            <TabsList className={`grid w-full grid-cols-3 ${themeColors.tabsBg}`}>
                              <TabsTrigger value="preview" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive}`}>Preview</TabsTrigger>
                              <TabsTrigger value="curl" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive}`}>cURL</TabsTrigger>
                              <TabsTrigger value="fetch" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive}`}>Fetch</TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview" className="mt-4">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">Response Preview</Label>
                                  <div className={`rounded-lg border ${themeColors.codeBg} overflow-hidden`}>
                                    <ScrollbarContainer
                                      maxHeight="300px"
                                      className="p-4 font-mono text-sm"
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
                                    <Label className="text-sm font-medium mb-2 block">Test Result</Label>
                                    <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <CheckCircle className="h-5 w-5 text-green-600" />
                                          <span className="font-medium text-green-800 dark:text-green-300">
                                            Test Successful
                                          </span>
                                        </div>
                                        <div className={`rounded-lg border ${themeColors.codeBg} overflow-hidden mt-2`}>
                                          <ScrollbarContainer
                                            maxHeight="200px"
                                            className="p-3 font-mono text-xs"
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

                            <TabsContent value="curl" className="mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium mb-2 block">cURL Command</Label>
                                <div className={`p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto`}>
                                  <pre className={themeColors.codeText}>
                                    {`curl -X ${formData.method} "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}"`}
                                  </pre>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(`curl -X ${formData.method} "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}"`, "cURL command")}
                                  className={`${themeColors.buttonBg} gap-2 mt-2`}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Command
                                </Button>
                              </div>
                            </TabsContent>

                            <TabsContent value="fetch" className="mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium mb-2 block">Fetch API</Label>
                                <div className={`p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto`}>
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
                                  className={`${themeColors.buttonBg} gap-2 mt-2`}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Code
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* AI Generator Modal */}
        <AIGeneratorModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onMockGenerated={(data) => {
            // Handle generated data
            console.log("AI Generated:", data)
          }}
          onMockSaved={(mock) => {
            // Navigate to the saved mock
            navigateTo(`/mocks/${mock.id}`)
          }}
          onResponseGenerated={handleResponseGeneration}
          initialEndpoint={formData.endpoint}
          initialMethod={formData.method}
        />

        {/* AI Floating Action Button */}
        <AIFloatingActionButton
          onOpenFullGenerator={() => setIsAIModalOpen(true)}
          onQuickGenerate={(type) => {
            toast({
              title: "AI Generation",
              description: `Quick generation for ${type} started`,
            })
          }}
        />
      </SidebarLayout>
    </ProtectedRoute>
  )
}