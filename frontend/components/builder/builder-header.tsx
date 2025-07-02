"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Play, Sparkles, Loader2 } from "lucide-react"
import { BuilderHeaderProps } from "./types"

export function BuilderHeader({
  onNavigateBack,
  onTest,
  onSave,
  onOpenAI,
  isTesting,
  isSaving,
  formData,
  themeColors
}: BuilderHeaderProps) {
  const isFormValid = formData.name && formData.endpoint && formData.method

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNavigateBack}
          className={`${themeColors.buttonBg} ${themeColors.text} h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0`}
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${themeColors.text} mb-0.5 sm:mb-1 truncate`}>
            Create New Mock
          </h1>
          <p className={`text-xs sm:text-sm ${themeColors.textSecondary} line-clamp-2 leading-tight sm:leading-normal`}>
            Design your API mock endpoint with custom responses
          </p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
        <Button
          variant="outline"
          onClick={onTest}
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
          onClick={onSave}
          disabled={isSaving || !isFormValid}
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
          onClick={onOpenAI}
          className="gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/30 text-xs sm:text-sm h-8 sm:h-9"
          size="sm"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          <span className="hidden sm:inline">AI Generate</span>
          <span className="sm:hidden">AI</span>
        </Button>
      </div>
    </div>
  )
}
