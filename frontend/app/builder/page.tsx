"use client"

import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { useTheme } from "@/components/ui/theme-provider"
import { SidebarLayout } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BuilderPageSkeleton } from "@/components/ui/builder-skeleton"
import JsonSnippets from "@/components/editor/json-snippets"
import { AISnippetWizard } from "@/components/editor/ai-snippet-wizard"
import {
  BuilderHeader,
  TemplateStatusCard,
  TemplateErrorCard,
  BasicInformationForm,
  ResponseEditor,
  ResponsePreview,
  BuilderModals,
  useBuilderState,
  getThemeColors
} from "@/components/builder"

function BuilderPageContent() {
  const { actualTheme } = useTheme()
  const themeColors = getThemeColors(actualTheme)
  
  const {
    // State
    formData,
    jsonString,
    isSaving,
    isTesting,
    testResult,
    previewDevice,
    isAIModalOpen,
    templateLoadError,
    loadedTemplate,
    showTemplateModal,
    
    // Setters
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
  } = useBuilderState()

  return (
    <div className={`flex-1 ${themeColors.background} ${themeColors.text} overflow-hidden transition-colors duration-200`}>
      <Header />
      <main className="p-2 sm:p-3 md:p-6 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <BuilderHeader
            onNavigateBack={() => navigateTo("/mocks")}
            onTest={handleTest}
            onSave={handleSave}
            onOpenAI={() => setIsAIModalOpen(true)}
            isTesting={isTesting}
            isSaving={isSaving}
            formData={formData}
            themeColors={themeColors}
          />

          {/* Template Status Indicator */}
          {loadedTemplate && (
            <TemplateStatusCard
              loadedTemplate={loadedTemplate}
              formData={formData}
              onSwitchConfiguration={() => setShowTemplateModal(true)}
              onClearTemplate={clearTemplate}
              themeColors={themeColors}
            />
          )}

          {/* Template Load Error */}
          {templateLoadError && (
            <TemplateErrorCard
              error={templateLoadError}
              themeColors={themeColors}
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-4 sm:space-y-6">
              {/* Configure Endpoint Section */}
              <BasicInformationForm
                formData={formData}
                onInputChange={handleInputChange}
                onNumberChange={handleNumberChange}
                onSelectChange={handleSelectChange}
                onSwitchChange={handleSwitchChange}
                themeColors={themeColors}
              />

              {/* JSON Snippets */}
              <JsonSnippets onSnippetSelect={handleSnippetSelect} />
            </div>

            {/* Right Column - Response Editor & Preview */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mock Response Section */}
              <ResponseEditor
                jsonString={jsonString}
                onChange={setJsonString}
                onCopy={copyToClipboard}
                themeColors={themeColors}
              />

              {/* Preview Output Section */}
              <ResponsePreview
                formData={formData}
                jsonString={jsonString}
                testResult={testResult}
                isTesting={isTesting}
                previewDevice={previewDevice}
                onTest={handleTest}
                onCopy={copyToClipboard}
                onDeviceChange={setPreviewDevice}
                themeColors={themeColors}
                actualTheme={actualTheme}
              />

              {/* AI Generation Panel */}
              <AISnippetWizard 
                onSnippetGenerated={handleResponseGeneration} 
                onSnippetSelect={handleSnippetSelect} 
              />
            </div>
          </div>
        </div>
      </main>

      {/* All Modals */}
      <BuilderModals
        isAIModalOpen={isAIModalOpen}
        showTemplateModal={showTemplateModal}
        loadedTemplate={loadedTemplate}
        formData={formData}
        onCloseAI={() => setIsAIModalOpen(false)}
        onCloseTemplateModal={() => setShowTemplateModal(false)}
        onMockGenerated={(data) => {
          // Update form data with generated mock and set JSON string
          setJsonString(JSON.stringify(data.response, null, 2))
        }}
        onMockSaved={(mock) => navigateTo(`/mocks/${mock.id}`)}
        onResponseGenerated={handleResponseGeneration}
        onTemplateSelection={handleTemplateSelection}
        onNavigateTo={navigateTo}
        onQuickGenerate={(type: string) => {}}
        onOpenFullGenerator={() => setIsAIModalOpen(true)}
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