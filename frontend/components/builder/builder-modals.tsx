"use client"

import { AIGeneratorModal } from "@/components/editor/ai-generator-modal"
import { TemplateSelectionModal } from "@/components/editor/template-selection-modal"
import { AIFloatingActionButton } from "@/components/editor/ai-floating-action-button"
import { useToast } from "@/hooks/use-toast"
import { BuilderModalsProps } from "./types"

export function BuilderModals({
  isAIModalOpen,
  showTemplateModal,
  loadedTemplate,
  formData,
  onCloseAI,
  onCloseTemplateModal,
  onMockGenerated,
  onMockSaved,
  onResponseGenerated,
  onTemplateSelection,
  onNavigateTo,
  onQuickGenerate,
  onOpenFullGenerator
}: BuilderModalsProps) {
  const { toast } = useToast()

  const handleQuickGenerate = (type: string) => {
    onQuickGenerate(type)
    toast({
      title: "AI Generation",
      description: `Quick generation for ${type} started`,
    })
  }

  return (
    <>
      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={onCloseAI}
        onMockGenerated={(data) => {
          // Update form data with generated mock
          onMockGenerated({
            ...formData,
            name: data.name || formData.name,
            description: data.description || formData.description,
            endpoint: data.endpoint || formData.endpoint,
            method: data.method || formData.method,
            response: data.response || formData.response,
            headers: data.headers || formData.headers,
            status_code: data.status_code || formData.status_code,
            delay_ms: data.delay_ms || formData.delay_ms,
            is_public: data.is_public !== undefined ? data.is_public : formData.is_public,
            tags: [...(data.tags || []), 'generated-by-ai']
          })
        }}
        onMockSaved={(mock) => {
          // Navigate to the saved mock
          onNavigateTo(`/mocks/${mock.id}`)
        }}
        onResponseGenerated={onResponseGenerated}
        initialEndpoint={formData.endpoint}
        initialMethod={formData.method}
      />
      
      {/* Template Selection Modal */}
      {loadedTemplate && (
        <TemplateSelectionModal
          isOpen={showTemplateModal}
          onClose={onCloseTemplateModal}
          template={loadedTemplate}
          onSelect={onTemplateSelection}
        />
      )}
      
      {/* AI Floating Action Button */}
      <AIFloatingActionButton
        onOpenFullGenerator={onOpenFullGenerator}
        onQuickGenerate={handleQuickGenerate}
      />
    </>
  )
}
