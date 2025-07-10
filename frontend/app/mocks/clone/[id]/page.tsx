"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useNavigation } from "@/components/ui/line-loader"
import { useTheme } from "@/components/ui/theme-provider"
import { toast } from "sonner"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { mockApi } from "@/lib/api"
import { MockEndpoint, CreateMockRequest } from "@/lib/types"
import { responseTemplates } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Copy,
  Save,
  Code,
  Globe,
  Lock,
  Loader2,
  AlertTriangle
} from "lucide-react"

// Method colors for badges
const methodColors = {
  GET: "bg-green-600 text-white",
  POST: "bg-blue-600 text-white",
  PUT: "bg-orange-600 text-white",
  DELETE: "bg-red-600 text-white",
  PATCH: "bg-purple-600 text-white",
  HEAD: "bg-gray-600 text-white",
  OPTIONS: "bg-indigo-600 text-white"
}

export default function CloneMockPage() {
  const params = useParams()
  const router = useRouter()
  const { navigateTo } = useNavigation()
  const { actualTheme } = useTheme()
  // use sonner's toast directly
  const mockId = params.id as string

  const [originalMock, setOriginalMock] = useState<MockEndpoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateMockRequest>>({
    name: "",
    description: "",
    endpoint: "",
    method: "GET",
    status_code: 200,
    response: {},
    delay_ms: 0,
    is_public: false
  })

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
    inputBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-[#2D2D2D] border-gray-700'
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
        setOriginalMock(mockData)
          // Prepare form data for cloning
        setFormData({
          name: `${mockData.name} (Copy)`,
          description: mockData.description || undefined,
          endpoint: `${mockData.endpoint}-copy`,
          method: mockData.method,
          status_code: mockData.status_code,
          response: mockData.response,
          delay_ms: mockData.delay_ms,
          is_public: mockData.is_public
        })
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
        setOriginalMock(sampleMock as MockEndpoint)
          // Prepare form data for cloning
        setFormData({
          name: `${sampleMock.name} (Copy)`,
          description: sampleMock.description,
          endpoint: `${sampleMock.endpoint}-copy`,
          method: sampleMock.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS",
          status_code: sampleMock.status_code,
          response: sampleMock.response,
          delay_ms: sampleMock.delay_ms,
          is_public: sampleMock.is_public
        })
        
        toast.error("Using sample data", {
          description: "Could not fetch mock from API. Using sample data instead."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMock()
  }, [mockId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_public: checked }))
  }
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      method: value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleBack = () => {
    navigateTo(`/mocks/${mockId}`)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Validate form data
      if (!formData.name || !formData.endpoint || !formData.method) {
        toast.error("Validation Error", {
          description: "Please fill in all required fields"
        })
        return
      }
      
      // Create the mock
      const newMock = await mockApi.createMock(formData as CreateMockRequest)
      
      toast.success("Mock Cloned", {
        description: "The mock has been successfully cloned"
      })
      
      // Navigate to the new mock
      navigateTo(`/mocks/${newMock.id}`)
    } catch (error) {
      console.error("Error cloning mock:", error)
      toast.error("Clone failed", {
        description: error instanceof Error ? error.message : "Failed to clone mock"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarLayout>
          <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
            <div className="hidden md:block">
              <Header />
            </div>
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
                
                {/* Form Skeleton */}
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
              </div>
            </main>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    )
  }

  if (!originalMock) {
    return (
      <ProtectedRoute>
        <SidebarLayout>
          <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
            <div className="hidden md:block">
              <Header />
            </div>
            <main className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mock not found. The mock you're trying to clone may have been deleted or doesn't exist.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={() => navigateTo("/mocks")} variant="outline" className="gap-2">
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
          <div className="hidden md:block">
            <Header />
          </div>
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
                    <h1 className={`text-2xl font-bold ${themeColors.text} mb-1`}>Clone Mock</h1>
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Create a copy of <span className="font-medium">{originalMock.name}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className={`${themeColors.buttonBg} ${themeColors.text} gap-2`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || !formData.name || !formData.endpoint}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Clone"}
                  </Button>
                </div>
              </div>
              
              {/* Clone Form */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={themeColors.cardBg}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-500" />
                        Basic Information
                      </CardTitle>
                      <CardDescription>
                        Customize the basic details of your cloned mock
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                            Mock Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter a descriptive name"
                            className={`${themeColors.inputBg} ${themeColors.text}`}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="endpoint" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                            Endpoint Path <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="endpoint"
                            name="endpoint"
                            value={formData.endpoint}
                            onChange={handleInputChange}
                            placeholder="/api/endpoint"
                            className={`${themeColors.inputBg} ${themeColors.text} font-mono`}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe what this mock endpoint does"
                          className={`${themeColors.inputBg} ${themeColors.text} min-h-[100px]`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="method" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                            HTTP Method <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.method}
                            onValueChange={handleSelectChange}
                          >
                            <SelectTrigger className={`${themeColors.inputBg} ${themeColors.text}`}>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(methodColors).map((method) => (
                                <SelectItem key={method} value={method}>
                                  <div className="flex items-center gap-2">
                                    <Badge className={methodColors[method as keyof typeof methodColors]}>
                                      {method}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="status_code" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                            Status Code
                          </Label>
                          <Input
                            id="status_code"
                            name="status_code"
                            type="number"
                            value={formData.status_code}
                            onChange={handleNumberChange}
                            min={100}
                            max={599}
                            className={`${themeColors.inputBg} ${themeColors.text}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="delay_ms" className={`text-sm font-medium ${themeColors.textSecondary}`}>
                            Response Delay (ms)
                          </Label>
                          <Input
                            id="delay_ms"
                            name="delay_ms"
                            type="number"
                            value={formData.delay_ms}
                            onChange={handleNumberChange}
                            min={0}
                            max={10000}
                            className={`${themeColors.inputBg} ${themeColors.text}`}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          id="is_public"
                          checked={formData.is_public}
                          onCheckedChange={handleSwitchChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="is_public" className={`text-sm font-medium ${themeColors.text}`}>
                            Public Endpoint
                          </Label>
                          <p className={`text-xs ${themeColors.textMuted}`}>
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
                </motion.div>
                
                {/* Response Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className={themeColors.cardBg}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-4 w-4 text-purple-500" />
                        Response Preview
                      </CardTitle>
                      <CardDescription>
                        This is the response that will be returned by your mock endpoint
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`rounded-lg border ${themeColors.codeBg} overflow-auto`}>
                        <pre className={`${themeColors.codeText} p-4 font-mono text-sm max-h-[300px]`}>
                          {JSON.stringify(formData.response, null, 2)}
                        </pre>
                      </div>
                      <p className={`text-xs ${themeColors.textMuted} mt-2`}>
                        To modify the response, save this clone and then edit it in the builder.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex justify-end"
                >
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || !formData.name || !formData.endpoint}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 px-8"
                    size="lg"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving Clone..." : "Save Clone"}
                  </Button>
                </motion.div>
              </div>
            </div>          </main>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}