"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useNavigation } from "@/components/ui/line-loader"
import { mockApi, getTemplateById } from "@/lib/api"
import { CreateMockRequest, TemplateDetail, HTTPMethod } from "@/lib/types"
import { BuilderFormData } from "../builder/types"

export function useBuilderState() {
  // Form state
  const [formData, setFormData] = useState<BuilderFormData>({
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

  // UI state
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
  const searchParams = useSearchParams()

  // Update response object when JSON string changes
  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonString)
      setFormData(prev => ({ ...prev, response: parsedJson }))
    } catch (e) {
      // Invalid JSON, don't update the response
    }
  }, [jsonString])

  // Load template data if templateId is provided
  useEffect(() => {
    let templateId = searchParams.get('templateId')
    
    if (!templateId) {
      templateId = localStorage.getItem('pendingTemplateId')
      if (templateId) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('templateId', templateId)
        window.history.replaceState({}, '', newUrl.toString())
        localStorage.removeItem('pendingTemplateId')
      }
    } else {
      localStorage.removeItem('pendingTemplateId')
    }
    
    if (templateId) {
      loadTemplate(templateId)
    }
  }, [searchParams])

  const loadTemplate = async (templateId: string) => {
    setIsLoadingTemplate(true)
    setTemplateLoadError(null)
    
    try {
      const templateData = await getTemplateById(templateId)
      
      if (templateData && templateData.template_data) {
        setLoadedTemplate(templateData)
        
        const endpoints = templateData.template_data.endpoints || []
        const hasMultipleOptions = endpoints.length > 1 || 
          endpoints.some(endpoint => 
            endpoint.responses && endpoint.responses.length > 1
          )
        
        if (hasMultipleOptions) {
          setShowTemplateModal(true)
        } else if (endpoints.length === 1) {
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
        : "Failed to load template"
      
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
    
    let responseData = {}
    let statusCode = 200
    let headers = {}
    let delayMs = 0
    
    if (selectedEndpoint.responses && selectedEndpoint.responses[responseIndex]) {
      const selectedResponse = selectedEndpoint.responses[responseIndex]
      responseData = selectedResponse.response || {}
      statusCode = selectedResponse.status_code || 200
      headers = selectedResponse.headers || {}
      delayMs = selectedResponse.delay_ms || 0
    } else if (selectedEndpoint.response) {
      responseData = selectedEndpoint.response
      statusCode = selectedEndpoint.status_code || 200
      headers = selectedEndpoint.headers || {}
      delayMs = selectedEndpoint.delay_ms || 0
    }
    
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
    
    setJsonString(JSON.stringify(responseData, null, 2))
    
    toast({
      title: "Template configuration applied",
      description: `Using ${selectedEndpoint.endpoint || '/api/endpoint'} from ${templateData.name}`,
      variant: "default",
    })
  }

  // Event handlers
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
      setFormData(prev => ({ ...prev, [name]: value as HTTPMethod }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_public: checked }))
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

  const handleSnippetSelect = (snippet: string) => {
    setJsonString(snippet)
  }

  const handleResponseGeneration = (response: string) => {
    setJsonString(response)
  }

  const handleTemplateSelection = (endpointIndex: number, responseIndex: number) => {
    if (loadedTemplate) {
      applyTemplateConfiguration(loadedTemplate, endpointIndex, responseIndex)
    }
    setShowTemplateModal(false)
  }

  const clearTemplate = () => {
    setLoadedTemplate(null)
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('templateId')
    window.history.replaceState({}, '', newUrl.toString())
  }

  return {
    // State
    formData,
    jsonString,
    isLoading,
    isSaving,
    isTesting,
    testResult,
    previewDevice,
    isAIModalOpen,
    isLoadingTemplate,
    templateLoadError,
    loadedTemplate,
    showTemplateModal,
    
    // Setters
    setFormData,
    setJsonString,
    setPreviewDevice,
    setIsAIModalOpen,
    setShowTemplateModal,
    
    // Event handlers
    handleInputChange,
    handleNumberChange,
    handleSelectChange,
    handleSwitchChange,
    handleSave,
    handleTest,
    copyToClipboard,
    handleSnippetSelect,
    handleResponseGeneration,
    handleTemplateSelection,
    clearTemplate,
    
    // Navigation
    navigateTo
  }
}
