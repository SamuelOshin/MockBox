"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Copy, Download } from "lucide-react"
import MonacoJsonEditor from "@/components/editor/monaco-json-editor"
import { ResponseEditorProps } from "./types"

export function ResponseEditor({
  jsonString,
  onChange,
  onCopy,
  themeColors
}: ResponseEditorProps) {
  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mock-response.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
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
                onClick={() => onCopy(jsonString, "JSON")}
                className={`h-7 sm:h-8 ${themeColors.buttonBg} px-2 sm:px-3`}
              >
                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                <span className="hidden sm:inline ml-1">Copy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
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
            onChange={onChange}
            height="250px"
            showValidation={true}
            showToolbar={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
