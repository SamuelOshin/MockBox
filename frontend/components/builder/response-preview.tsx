"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"
import { 
  Zap, 
  Play, 
  Loader2, 
  Copy, 
  Monitor, 
  Tablet, 
  Smartphone,
  CheckCircle 
} from "lucide-react"
import { ResponsePreviewProps } from "./types"

export function ResponsePreview({
  formData,
  jsonString,
  testResult,
  isTesting,
  previewDevice,
  onTest,
  onCopy,
  onDeviceChange,
  themeColors,
  actualTheme
}: ResponsePreviewProps) {
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

  const generateCurlCommand = () => {
    return `curl -X ${formData.method} "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}"`
  }

  const generateFetchCode = () => {
    return `fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/simulate${formData.endpoint}", {
  method: "${formData.method}",
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`
  }

  return (
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
            onClick={() => onDeviceChange("desktop")}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
          >
            <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant={previewDevice === "tablet" ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange("tablet")}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
          >
            <Tablet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant={previewDevice === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange("mobile")}
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
              onClick={onTest}
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
                <TabsTrigger value="preview" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>
                  Preview
                </TabsTrigger>
                <TabsTrigger value="curl" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>
                  cURL
                </TabsTrigger>
                <TabsTrigger value="fetch" className={`${themeColors.text} data-[state=active]:${themeColors.tabsActive} text-xs sm:text-sm`}>
                  Fetch
                </TabsTrigger>
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
                      {generateCurlCommand()}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCopy(generateCurlCommand(), "cURL command")}
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
                      {generateFetchCode()}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCopy(generateFetchCode(), "Fetch code")}
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
  )
}
