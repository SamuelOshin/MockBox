"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"
import { useNavigation } from "@/components/ui/line-loader"
import { useTheme } from "@/components/ui/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { mockApi } from "@/lib/api"
import { MockEndpoint } from "@/lib/types"
import { responseTemplates } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Copy,
  Edit,
  Eye,
  Globe,
  Code,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Share2,
  Trash2,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertTriangle,
  Lock,
  Loader2
} from "lucide-react"

// Method colors for badges
const methodColors = {
  GET: "bg-green-600 text-white",
  POST: "bg-blue-600 text-white",
  PUT: "bg-orange-600 text-white",
  DELETE: "bg-red-600 text-white",
  PATCH: "bg-purple-600 text-white"
}

export default function ViewMockPage() {
  const params = useParams()
  const router = useRouter()
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()
  const { toast } = useToast()
  const mockId = params.id as string

  const [mock, setMock] = useState<MockEndpoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // Theme-aware colors
  const themeColors = {
    background: actualTheme === 'light' ? 'bg-slate-50' : 'bg-[#0A0A0A]',
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

  useEffect(() => {
    const fetchMock = async () => {
      try {
        setIsLoading(true)
        // In a real implementation, this would fetch from the API
        // For now, we'll simulate a delay and use sample data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to get the mock from the API
        const mockData = await mockApi.getMock(mockId)
        setMock(mockData)
      } catch (error) {
        console.error("Error fetching mock:", error)
        // Fallback to sample data for demo
        const sampleMock = {
          id: mockId,
          name: "User Profile API",
          description: "Returns detailed user profile information including preferences and settings",
          endpoint: "/api/users/profile",
          method: "GET",
          status_code: 200,
          response: responseTemplates.userList,
          delay_ms: 150,
          is_public: true,
          access_count: 128,
          last_accessed: new Date().toISOString(),
          created_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-20T14:30:00Z",
          user_id: "f5027369-23af-4440-9cb4-7ba889e48dfc",
          status: "active",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-API-Version": "1.0"
          },
          tags: ["users", "profile", "api"]
        }
        setMock(sampleMock as MockEndpoint)
        
        toast({
          title: "Using sample data",
          description: "Could not fetch mock from API. Using sample data instead.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMock()
  }, [mockId, toast])

  const handleEdit = () => {
    navigateTo(`/builder?mockId=${mockId}`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await mockApi.deleteMock(mockId)
      toast({
        title: "Mock deleted",
        description: "The mock has been successfully deleted",
      })
      navigateTo("/mocks")
    } catch (error) {
      console.error("Error deleting mock:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete mock",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    navigateTo("/mocks")
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
      toast({
        title: "Copied to clipboard",
        description: `${type} has been copied to clipboard`,
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch (e) {
      return dateString
    }
  }

  const generateUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return `${baseUrl}/simulate/${mockId}`
  }

  const generateCurlCommand = () => {
    if (!mock) return ""
    const url = generateUrl()
    return `curl -X ${mock.method} "${url}" \\
-H "Content-Type: application/json"`
  }

  const generateFetchCode = () => {
    if (!mock) return ""
    const url = generateUrl()
    return `fetch('${url}', {
  method: '${mock.method}',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`
  }

  const generateAxiosCode = () => {
    if (!mock) return ""
    const url = generateUrl()
    return `axios.${mock.method.toLowerCase()}('${url}', {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarLayout>
          <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
            <Header />
            <main className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
                
                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    )
  }

  if (!mock) {
    return (
      <ProtectedRoute>
        <SidebarLayout>
          <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
            <Header />
            <main className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mock not found. The mock you're looking for may have been deleted or doesn't exist.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handleBack} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Mocks
                </Button>
              </div>
            </main>
          </div>
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
              {/* Enhanced Header with Back Button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBack}
                    className={`${themeColors.buttonBg} ${themeColors.text} h-9 w-9 p-0`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className={`text-2xl font-bold ${themeColors.text} mb-1`}>{mock.name}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={methodColors[mock.method as keyof typeof methodColors]}>
                        {mock.method}
                      </Badge>
                      <span className={`text-sm font-mono ${themeColors.textSecondary}`}>
                        {mock.endpoint}
                      </span>
                      {mock.is_public ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleEdit}
                    className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
              
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details & Stats */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Mock Details Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className={themeColors.cardBg}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-500" />
                          Mock Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mock.description && (
                          <div>
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Description</h3>
                            <p className={`text-sm ${themeColors.text}`}>{mock.description}</p>
                          </div>
                        )}
                        
                        <div>
                          <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Status Code</h3>
                          <Badge 
                            variant={mock.status_code >= 400 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {mock.status_code}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Response Delay</h3>
                          <p className={`text-sm ${themeColors.text}`}>{mock.delay_ms}ms</p>
                        </div>
                        
                        <div>
                          <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Headers</h3>
                          <div className={`rounded-md p-3 ${themeColors.codeBg} font-mono text-xs overflow-auto max-h-32`}>
                            {Object.entries(mock.headers || {}).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="text-blue-500 dark:text-blue-400">{key}</span>
                                <span className={themeColors.codeText}>: {value}</span>
                              </div>
                            ))}
                            {Object.keys(mock.headers || {}).length === 0 && (
                              <span className={themeColors.textMuted}>No custom headers</span>
                            )}
                          </div>
                        </div>
                        
                        {mock.tags && mock.tags.length > 0 && (
                          <div>
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Tags</h3>
                            <div className="flex flex-wrap gap-1">
                              {mock.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Usage Statistics Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Card className={themeColors.cardBg}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-500" />
                          Usage Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary}`}>Total Requests</h3>
                            <p className={`text-2xl font-bold ${themeColors.text}`}>{mock.access_count}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary}`}>Status</h3>
                            <Badge 
                              variant={mock.status === "active" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {mock.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary}`}>Created</h3>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className={`h-3 w-3 ${themeColors.textMuted}`} />
                              <span className={themeColors.textMuted}>{formatDate(mock.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary}`}>Last Updated</h3>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className={`h-3 w-3 ${themeColors.textMuted}`} />
                              <span className={themeColors.textMuted}>{mock.updated_at ? formatDate(mock.updated_at) : 'Never'}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <h3 className={`text-sm font-medium ${themeColors.textSecondary}`}>Last Accessed</h3>
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className={`h-3 w-3 ${themeColors.textMuted}`} />
                              <span className={themeColors.textMuted}>{mock.last_accessed ? formatDate(mock.last_accessed) : 'Never'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`w-full ${themeColors.buttonBg} gap-2`}
                            onClick={() => navigateTo(`/analytics?mockId=${mockId}`)}
                          >
                            <BarChart3 className="h-3 w-3" />
                            View Detailed Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                
                {/* Right Column - Response & Usage */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Response Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className={themeColors.cardBg}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Response Preview
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(mock.response, null, 2), "Response")}
                              className={`h-8 ${themeColors.buttonBg} gap-2`}
                            >
                              {copySuccess === "Response" ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copySuccess === "Response" ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`rounded-lg border ${themeColors.codeBg} overflow-hidden`}>
                          <ScrollbarContainer
                            maxHeight="400px"
                            className="p-4 font-mono text-sm"
                            theme={actualTheme === "light" ? "light" : "dark"}
                          >
                            <pre className={themeColors.codeText}>
                              {JSON.stringify(mock.response, null, 2)}
                            </pre>
                          </ScrollbarContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Integration Examples Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card className={themeColors.cardBg}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="h-4 w-4 text-blue-500" />
                            Integration Examples
                          </CardTitle>
                          
                          {/* Device Preview Toggle */}
                          <div className={`flex items-center gap-1 ${actualTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-gray-700 bg-[#2D2D2D]'} rounded-lg p-1`}>
                            <Button
                              variant={previewDevice === "desktop" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPreviewDevice("desktop")}
                              className="h-7 w-7 p-0"
                            >
                              <Monitor className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={previewDevice === "tablet" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPreviewDevice("tablet")}
                              className="h-7 w-7 p-0"
                            >
                              <Tablet className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={previewDevice === "mobile" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPreviewDevice("mobile")}
                              className="h-7 w-7 p-0"
                            >
                              <Smartphone className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={getDevicePreviewClass()}>
                          <Tabs defaultValue="endpoint" className="w-full">
                            <TabsList className={`grid w-full grid-cols-3 ${themeColors.tabsBg} h-9`}>
                              <TabsTrigger value="endpoint" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>Endpoint</TabsTrigger>
                              <TabsTrigger value="curl" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>cURL</TabsTrigger>
                              <TabsTrigger value="javascript" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs`}>JavaScript</TabsTrigger>
                            </TabsList>

                            <TabsContent value="endpoint" className="space-y-4 mt-4">
                              <div>
                                <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-2`}>Mock URL</h3>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    value={generateUrl()} 
                                    readOnly 
                                    className={`font-mono text-xs ${themeColors.codeBg} ${themeColors.text}`} 
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => copyToClipboard(generateUrl(), "URL")}
                                    className={`${themeColors.buttonBg} ${themeColors.text} h-9 w-9 p-0`}
                                  >
                                    {copySuccess === "URL" ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-2`}>Test Endpoint</h3>
                                <Button 
                                  variant="outline" 
                                  className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                                  onClick={() => window.open(generateUrl(), '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Open in New Tab
                                </Button>
                              </div>
                            </TabsContent>

                            <TabsContent value="curl" className="mt-4">
                              <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-2`}>cURL Command</h3>
                              <div className={`p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto mb-3`}>
                                <pre className={themeColors.codeText}>{generateCurlCommand()}</pre>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(generateCurlCommand(), "cURL")}
                                className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                              >
                                {copySuccess === "cURL" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                {copySuccess === "cURL" ? "Copied!" : "Copy Command"}
                              </Button>
                            </TabsContent>

                            <TabsContent value="javascript" className="space-y-6 mt-4">
                              <div>
                                <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-2`}>Fetch API</h3>
                                <div className={`p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto mb-3`}>
                                  <pre className={themeColors.codeText}>{generateFetchCode()}</pre>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(generateFetchCode(), "Fetch")}
                                  className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                                >
                                  {copySuccess === "Fetch" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                  {copySuccess === "Fetch" ? "Copied!" : "Copy Code"}
                                </Button>
                              </div>
                              
                              <div>
                                <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-2`}>Axios</h3>
                                <div className={`p-4 rounded-lg ${themeColors.codeBg} font-mono text-xs overflow-x-auto mb-3`}>
                                  <pre className={themeColors.codeText}>{generateAxiosCode()}</pre>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(generateAxiosCode(), "Axios")}
                                  className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                                >
                                  {copySuccess === "Axios" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                  {copySuccess === "Axios" ? "Copied!" : "Copy Code"}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Quick Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Card className={themeColors.cardBg}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3`}
                            onClick={handleEdit}
                          >
                            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Edit Mock</div>
                              <div className="text-xs text-muted-foreground">Modify configuration</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3`}
                            onClick={() => window.open(generateUrl(), '_blank')}
                          >
                            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                              <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Test Endpoint</div>
                              <div className="text-xs text-muted-foreground">Open in new tab</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3`}
                            onClick={() => navigateTo(`/mocks/clone/${mockId}`)}
                          >
                            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                              <Copy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Clone Mock</div>
                              <div className="text-xs text-muted-foreground">Create a copy</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3`}
                            onClick={() => navigateTo(`/analytics?mockId=${mockId}`)}
                          >
                            <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Analytics</div>
                              <div className="text-xs text-muted-foreground">View usage stats</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3`}
                            onClick={() => {
                              // Share functionality would be implemented here
                              toast({
                                title: "Share feature",
                                description: "Sharing functionality will be available soon!",
                              })
                            }}
                          >
                            <div className="p-2 rounded-md bg-pink-100 dark:bg-pink-900/30">
                              <Share2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">Share Mock</div>
                              <div className="text-xs text-muted-foreground">With your team</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className={`${themeColors.buttonBg} ${themeColors.text} h-auto py-3 justify-start gap-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400`}
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{isDeleting ? "Deleting..." : "Delete"}</div>
                              <div className="text-xs text-muted-foreground">Remove permanently</div>
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </main>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    )
}