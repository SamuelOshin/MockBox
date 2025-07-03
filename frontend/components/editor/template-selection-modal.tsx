"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useTheme } from "@/components/ui/theme-provider"
import MonacoJsonEditor from "@/components/editor/monaco-json-editor"
import { TemplateDetail } from "@/lib/types"
import { 
  Server, 
  Code, 
  Clock, 
  ArrowRight, 
  FileText, 
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Layers
} from "lucide-react"

interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  template: TemplateDetail
  onSelect: (endpointIndex: number, responseIndex: number) => void
}

interface EndpointWithResponses {
  endpoint: any
  responses: any[]
  index: number
}

export function TemplateSelectionModal({ 
  isOpen, 
  onClose, 
  template, 
  onSelect 
}: TemplateSelectionModalProps) {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0)
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0)
  const [previewJson, setPreviewJson] = useState("")
  const { actualTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isEndpointsExpanded, setIsEndpointsExpanded] = useState(true)
  const [isResponseVariantsExpanded, setIsResponseVariantsExpanded] = useState(false)

  // Process endpoints to normalize the response structure
  const processedEndpoints: EndpointWithResponses[] = template.template_data?.endpoints?.map((endpoint, index) => {
    let responses: any[] = []
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      // Use the responses array if available
      responses = endpoint.responses
    } else if (endpoint.response) {
      // Create a virtual response from the direct response property
      responses = [{
        response: endpoint.response,
        status_code: endpoint.status_code || 200,
        headers: endpoint.headers || {},
        delay_ms: endpoint.delay_ms || 0
      }]
    }
    
    return {
      endpoint,
      responses,
      index
    }
  }) || []

  // Method colors for badges
  const methodColors: Record<string, string> = {
    "GET": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    "POST": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "PUT": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "DELETE": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    "PATCH": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    "default": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }

  // Status code colors
  const getStatusCodeColor = (statusCode: number): string => {
    const firstDigit = Math.floor(statusCode / 100)
    switch (firstDigit) {
      case 2: return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      case 3: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case 4: return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case 5: return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Update preview when selection changes
  const handleEndpointSelect = (endpointIndex: number, responseIndex: number = 0) => {
    if (endpointIndex === selectedEndpointIndex && responseIndex === selectedResponseIndex) return;
    
    // Auto-close response variants when selecting a different endpoint
    if (endpointIndex !== selectedEndpointIndex) {
      setIsResponseVariantsExpanded(false);
    }
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setSelectedEndpointIndex(endpointIndex)
      setSelectedResponseIndex(responseIndex)
      
      const selectedEndpoint = processedEndpoints[endpointIndex]
      if (selectedEndpoint && selectedEndpoint.responses[responseIndex]) {
        const responseData = selectedEndpoint.responses[responseIndex].response
        setPreviewJson(JSON.stringify(responseData, null, 2))
      }
      
      setIsAnimating(false);
    }, 150);
  }

  // Initialize preview on first render
  useEffect(() => {
    if (processedEndpoints.length > 0) {
      handleEndpointSelect(0, 0)
    }
  }, [])

  const handleConfirmSelection = () => {
    onSelect(selectedEndpointIndex, selectedResponseIndex)
    onClose()
  }

  if (processedEndpoints.length === 0) {
    return null
  }

  const selectedEndpoint = processedEndpoints[selectedEndpointIndex]
  const selectedResponse = selectedEndpoint?.responses[selectedResponseIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 overflow-hidden rounded-xl border-0 shadow-2xl">
        <div className="flex flex-col h-full overflow-auto ">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 flex-shrink-0">
            <DialogHeader className="p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Template Configuration
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-blue-100 text-sm">
                    Select an endpoint and response configuration to use in your API builder
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Main Content Area with Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Column - Endpoint Selection (2/5 width) */}
              <div className="lg:w-2/5 border-r border-border dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col  lg:h-auto">
                {/* Fixed Header */}
                <div className="p-3 border-b bg-white dark:bg-gray-900 flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsEndpointsExpanded(!isEndpointsExpanded)
                      // Auto-close response variants when opening endpoints
                      if (!isEndpointsExpanded) {
                        setIsResponseVariantsExpanded(false)
                      }
                    }}
                    className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <h3 className="font-medium text-xs flex items-center gap-2">
                      <Server className="h-3 w-3 text-blue-600" />
                      AVAILABLE ENDPOINTS
                      <Badge variant="outline" className="ml-2 font-mono text-xs">
                        {processedEndpoints.length}
                      </Badge>
                    </h3>
                    <motion.div
                      animate={{ rotate: isEndpointsExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </motion.div>
                  </button>
                </div>
                
                {/* Scrollable Endpoints List */}
                <AnimatePresence>
                  {isEndpointsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-y-auto"
                    >
                      <div className="max-h-80 lg:max-h-96">
                        <div className="p-3">
                          <div className="space-y-2">
                            <AnimatePresence>
                              {processedEndpoints.map((item, endpointIndex) => {
                                const { endpoint, responses } = item
                                const methodColor = methodColors[endpoint.method || 'default'] || methodColors.default
                                const isSelected = endpointIndex === selectedEndpointIndex
                                
                                return (
                                  <motion.div
                                    key={endpointIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: endpointIndex * 0.05 }}
                                  >
                                    <Card 
                                      className={`cursor-pointer transition-all duration-200 border overflow-hidden ${
                                        isSelected 
                                          ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50' 
                                          : 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800/50 bg-white dark:bg-gray-800/30'
                                      }`}
                                      onClick={() => handleEndpointSelect(endpointIndex, 0)}
                                    >
                                      <CardHeader className="pb-1 pt-2 px-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Badge className={`${methodColor} font-medium text-xs`}>
                                              {endpoint.method || 'GET'}
                                            </Badge>
                                            <span className="font-mono text-xs truncate max-w-[160px]">
                                              {endpoint.endpoint || '/api/endpoint'}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                              <CheckCircle className="h-3 w-3 text-blue-500" />
                                            </motion.div>
                                          )}
                                        </div>
                                      </CardHeader>
                                      <CardContent className="pt-0 pb-2 px-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Code className="h-3 w-3" />
                                            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
                                          </div>
                                          {endpoint.delay_ms && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Clock className="h-3 w-3" />
                                              {endpoint.delay_ms}ms
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fixed Response Variants Section */}
                {selectedEndpoint && selectedEndpoint.responses.length > 1 && (
                  <div className="border-t bg-white dark:bg-gray-900 p-3 flex-shrink-0">
                    <button
                      onClick={() => {
                        setIsResponseVariantsExpanded(!isResponseVariantsExpanded)
                        // Auto-close endpoints when opening response variants
                        if (!isResponseVariantsExpanded) {
                          setIsEndpointsExpanded(false)
                        }
                      }}
                      className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors mb-2"
                    >
                      <h4 className="font-medium text-xs flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-500" />
                        RESPONSE VARIANTS
                        <Badge variant="outline" className="ml-2 font-mono text-xs">
                          {selectedEndpoint.responses.length}
                        </Badge>
                      </h4>
                      <motion.div
                        animate={{ rotate: isResponseVariantsExpanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isResponseVariantsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-y-auto"
                        >
                          <div className="max-h-64">
                            <div className="space-y-1">
                              <AnimatePresence>
                                {selectedEndpoint.responses.map((response, responseIndex) => {
                                  const isSelected = selectedResponseIndex === responseIndex
                                  
                                  return (
                                    <motion.div
                                      key={responseIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2, delay: responseIndex * 0.05 }}
                                    >
                                      <Card 
                                        className={`cursor-pointer transition-all duration-200 border overflow-hidden ${
                                          isSelected 
                                            ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50' 
                                            : 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800/50 bg-white dark:bg-gray-800/30'
                                        }`}
                                        onClick={() => handleEndpointSelect(selectedEndpointIndex, responseIndex)}
                                      >
                                        <CardContent className="py-2 px-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <Badge 
                                                className={`${getStatusCodeColor(response.status_code || 200)} font-medium text-xs`}
                                              >
                                                {response.status_code || 200}
                                              </Badge>
                                              <span className="text-xs font-medium">Response {responseIndex + 1}</span>
                                            </div>
                                            {isSelected && (
                                              <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                              >
                                                <CheckCircle className="h-3 w-3 text-blue-500" />
                                              </motion.div>
                                            )}
                                          </div>
                                          {(response.delay_ms > 0 || Object.keys(response.headers || {}).length > 0) && (
                                            <div className="flex items-center gap-3 mt-1">
                                              {response.delay_ms > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Clock className="h-3 w-3" />
                                                  {response.delay_ms}ms
                                                </div>
                                              )}
                                              {Object.keys(response.headers || {}).length > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Code className="h-3 w-3" />
                                                  {Object.keys(response.headers || {}).length} headers
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )
                                })}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Right Column - JSON Preview (3/5 width) */}
              <div className="lg:w-3/5 flex flex-col bg-white dark:bg-gray-900 min-h-0 h-full">
                <div className="p-3 border-b bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-xs flex items-center gap-2">
                      <Code className="h-3 w-3 text-green-600" />
                      RESPONSE PREVIEW
                    </h3>
                    {selectedResponse && (
                      <Badge className={`${getStatusCodeColor(selectedResponse.status_code || 200)} font-mono text-xs`}>
                        {selectedResponse.status_code || 200}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedEndpointIndex}-${selectedResponseIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isAnimating ? 0.3 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-full w-full overflow-y-auto"
                    >
                      <MonacoJsonEditor
                        value={previewJson}
                        onChange={setPreviewJson}
                        height="60vh"
                        readOnly={true}
                        showToolbar={false}
                        showValidation={true}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {selectedResponse && (selectedResponse.delay_ms > 0 || Object.keys(selectedResponse.headers || {}).length > 0) && (
                  <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                      {selectedResponse.delay_ms > 0 && (
                        <div className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>Delay: <span className="font-medium text-amber-700 dark:text-amber-300">{selectedResponse.delay_ms}ms</span></span>
                        </div>
                      )}
                      {Object.keys(selectedResponse.headers || {}).length > 0 && (
                        <div className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border">
                          <Code className="h-3 w-3 text-blue-600" />
                          <span><span className="font-medium text-blue-700 dark:text-blue-300">{Object.keys(selectedResponse.headers || {}).length}</span> custom headers</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-3 sm:px-4 py-3 border-t bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-3">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center flex-wrap gap-1">
                  <Badge className={methodColors[selectedEndpoint?.endpoint.method || 'default']} variant="secondary">
                    {selectedEndpoint?.endpoint.method || 'GET'}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                  <span className="font-mono text-xs truncate min-w-0">
                    {selectedEndpoint?.endpoint.endpoint || '/api/endpoint'}
                  </span>
                </div>
                {selectedEndpoint && selectedEndpoint.responses.length > 1 && (
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      Response {selectedResponseIndex + 1}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={onClose} size="sm" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSelection} 
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  size="sm"
                >
                  <span className="truncate">Use Config</span>
                  <ArrowRight className="h-3 w-3 flex-shrink-0" />
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center gap-2 min-w-0">
                <div className="flex items-center min-w-0">
                  <Badge className={methodColors[selectedEndpoint?.endpoint.method || 'default']} variant="secondary">
                    {selectedEndpoint?.endpoint.method || 'GET'}
                  </Badge>
                  <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />
                  <span className="font-mono text-xs truncate">
                    {selectedEndpoint?.endpoint.endpoint || '/api/endpoint'}
                  </span>
                </div>
                {selectedEndpoint && selectedEndpoint.responses.length > 1 && (
                  <div className="flex items-center">
                    <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />
                    <Badge variant="outline" className="font-mono text-xs">
                      Response {selectedResponseIndex + 1}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" onClick={onClose} size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSelection} 
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Use Configuration
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}