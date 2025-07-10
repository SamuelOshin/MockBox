"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMockId, setEditingMockId] = useState<string | null>(null)

  // Use ref to track when we're loading mock data to prevent JSON overwrite
  const isLoadingMockData = useRef(false)

  // use sonner's toast directly
  const { navigateTo } = useNavigation()
  const searchParams = useSearchParams()

  // Update response object when JSON string changes (but not during mock loading)
  useEffect(() => {
    // Don't update form data from JSON when we're loading mock data
    if (isLoadingMockData.current) return
    
    try {
      const parsedJson = JSON.parse(jsonString)
      setFormData(prev => ({ ...prev, response: parsedJson }))
    } catch (e) {
      // Invalid JSON, don't update the response
    }
  }, [jsonString])

  // Load template data if templateId is provided, or load mock data if mockId is provided
  useEffect(() => {
    const mockId = searchParams.get('mockId')
    let templateId = searchParams.get('templateId')
    
    // Handle mock editing
    if (mockId) {
      setIsEditMode(true)
      setEditingMockId(mockId)
      loadMockForEditing(mockId)
      return
    }
    
    // Handle template loading
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

  const loadMockForEditing = async (mockId: string) => {
    setIsLoading(true)
    setTemplateLoadError(null)
    isLoadingMockData.current = true
    
    try {
      const mockData = await mockApi.getMock(mockId)
      
      // Load the mock data into the form
      const newFormData = {
        name: mockData.name || "",
        description: mockData.description || "",
        endpoint: mockData.endpoint || "",
        method: mockData.method || "GET",
        response: mockData.response || {},
        headers: mockData.headers || {},
        status_code: mockData.status_code || 200,
        delay_ms: mockData.delay_ms || 0,
        is_public: mockData.is_public || false,
        tags: mockData.tags || []
      }
      
      setFormData(newFormData)
      
      // Update the JSON string with the response data
      setJsonString(JSON.stringify(mockData.response || {}, null, 2))
      
      toast.success("Mock loaded", {
        description: "Mock data loaded successfully for editing"
      })
    } catch (error) {
      console.error("Error loading mock:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load mock for editing"
      
      setTemplateLoadError(errorMessage)
      
      toast.error("Loading failed", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
      isLoadingMockData.current = false
    }
  }

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
      
      toast.error("Template loading failed", {
        description: errorMessage
      })
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const applyTemplateConfiguration = (templateData: TemplateDetail, endpointIndex: number, responseIndex: number) => {
    const endpoints = templateData.template_data?.endpoints || []
    const selectedEndpoint = endpoints[endpointIndex]
    
    if (!selectedEndpoint) {
      toast.error("Invalid selection", {
        description: "Selected endpoint not found"
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
    
    toast.success("Template configuration applied", {
      description: `Using ${selectedEndpoint.endpoint || '/api/endpoint'} from ${templateData.name}`
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
      toast.error("Validation Error", {
        description: "Please fill in all required fields"
      })
      return
    }

    setIsSaving(true)

    try {
      let result
      
      if (isEditMode && editingMockId) {
        // Update existing mock
        result = await mockApi.updateMock(editingMockId, formData)
        
        toast.success("Mock Updated", {
          description: "Your mock has been updated successfully"
        })
      } else {
        // Create new mock
        result = await mockApi.createMock(formData)
        
        toast.success("Mock Created", {
          description: "Your mock has been created successfully"
        })
      }
      
      navigateTo(`/mocks/${result.id}`)
    } catch (error) {
      console.error("Error saving mock:", error)
      
      toast.error(isEditMode ? "Update Failed" : "Creation Failed", {
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} mock`
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!formData.endpoint || !formData.method) {
      toast.error("Validation Error", {
        description: "Please fill in endpoint and method"
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await mockApi.testMock(formData)
      setTestResult(result)
      
      toast.success("Test Successful", {
        description: "Your mock endpoint is working correctly"
      })
    } catch (error) {
      console.error("Error testing mock:", error)
      
      toast.error("Test Failed", {
        description: error instanceof Error ? error.message : "Failed to test mock"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      
      toast.success("Copied to clipboard", {
        description: `${type} has been copied to clipboard`
      })
    } catch (error) {
      toast.error("Copy failed", {
        description: "Failed to copy to clipboard"
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
    isEditMode,
    editingMockId,
    
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
