import { CreateMockRequest, TemplateDetail, HTTPMethod } from "@/lib/types"

export interface BuilderFormData extends CreateMockRequest {}

export interface ThemeColors {
  background: string
  text: string
  textSecondary: string
  textMuted: string
  cardBg: string
  cardHover: string
  buttonBg: string
  codeBg: string
  codeText: string
  tabsBg: string
  tabsActive: string
}

export interface BuilderHeaderProps {
  onNavigateBack: () => void
  onTest: () => void
  onSave: () => void
  onOpenAI: () => void
  isTesting: boolean
  isSaving: boolean
  formData: BuilderFormData
  themeColors: ThemeColors
}

export interface TemplateStatusCardProps {
  loadedTemplate: TemplateDetail
  formData: BuilderFormData
  onSwitchConfiguration: () => void
  onClearTemplate: () => void
  themeColors: ThemeColors
}

export interface TemplateErrorCardProps {
  error: string
  themeColors: ThemeColors
}

export interface BasicInformationFormProps {
  formData: BuilderFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: string, value: string) => void
  onSwitchChange: (checked: boolean) => void
  themeColors: ThemeColors
}

export interface ResponseEditorProps {
  jsonString: string
  onChange: (value: string) => void
  onCopy: (text: string, type: string) => void
  themeColors: ThemeColors
}

export interface ResponsePreviewProps {
  formData: BuilderFormData
  jsonString: string
  testResult: any
  isTesting: boolean
  previewDevice: "desktop" | "tablet" | "mobile"
  onTest: () => void
  onCopy: (text: string, type: string) => void
  onDeviceChange: (device: "desktop" | "tablet" | "mobile") => void
  themeColors: ThemeColors
  actualTheme: string
}

export interface BuilderModalsProps {
  isAIModalOpen: boolean
  showTemplateModal: boolean
  loadedTemplate: TemplateDetail | null
  formData: BuilderFormData
  onCloseAI: () => void
  onCloseTemplateModal: () => void
  onMockGenerated: (data: Partial<BuilderFormData>) => void
  onMockSaved: (mock: any) => void
  onResponseGenerated: (response: string) => void
  onTemplateSelection: (endpointIndex: number, responseIndex: number) => void
  onNavigateTo: (path: string) => void
  onQuickGenerate: (type: string) => void
  onOpenFullGenerator: () => void
}
