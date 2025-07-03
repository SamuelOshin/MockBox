"use client"

import { useState, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ui/theme-provider"
import {
  Copy,
  Check,
  Code,
  Maximize2,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Minimize2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MonacoJsonEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string
  showValidation?: boolean
  showToolbar?: boolean
  placeholder?: string
  readOnly?: boolean 
}

export default function MonacoJsonEditor({
  value,
  onChange,
  height = "400px",
  showValidation = false,
  showToolbar = false,
  placeholder = "Enter JSON...",
  readOnly = false // <-- added
}: MonacoJsonEditorProps) {
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)
  const { toast } = useToast()
  const { actualTheme } = useTheme()

  // Theme-aware colors
  const themeColors = {
    toolbarBg: actualTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#2D2D2D] border-gray-700',
    editorBg: actualTheme === 'light' ? 'bg-white border-slate-300' : 'bg-[#1E1E1E] border-gray-700',
    text: actualTheme === 'light' ? 'text-slate-900' : 'text-white',
    textSecondary: actualTheme === 'light' ? 'text-slate-600' : 'text-gray-400',
    textMuted: actualTheme === 'light' ? 'text-slate-500' : 'text-gray-500',
    buttonHover: actualTheme === 'light' ? 'hover:bg-slate-200 hover:text-slate-900' : 'hover:bg-[#3A3A3A] hover:text-white',
    separator: actualTheme === 'light' ? 'bg-slate-300' : 'bg-gray-600',
    validationValid: 'bg-green-500',
    validationInvalid: 'bg-red-500'
  }

  const monacoTheme = actualTheme === 'light' ? 'vs' : 'vs-dark'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "JSON content has been copied successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleEditorChange = (newValue: string | undefined) => {
    const val = newValue || ""
    onChange(val)

    // Validate JSON
    try {
      if (val.trim()) {
        JSON.parse(val)
        setIsValid(true)
      }
    } catch {
      setIsValid(false)
    }
  }

  const formatJson = async () => {
    setIsFormatting(true)
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
      toast({
        title: "JSON formatted",
        description: "Your JSON has been formatted successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Format failed",
        description: "Invalid JSON cannot be formatted",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsFormatting(false), 500)
    }
  }

  const downloadJson = async () => {
    setIsDownloading(true)
    try {
      const blob = new Blob([value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mock-response.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "JSON file is being downloaded",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download JSON file",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsDownloading(false), 1000)
    }
  }

  const uploadJson = async () => {
    setIsUploading(true)
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string
              JSON.parse(content) // Validate JSON
              onChange(content)
              toast({
                title: "File uploaded",
                description: "JSON file has been loaded successfully",
                variant: "default",
              })
            } catch (error) {
              toast({
                title: "Upload failed",
                description: "Invalid JSON file",
                variant: "destructive",
              })
            }
          }
          reader.readAsText(file)
        }
        setIsUploading(false)
      }
      input.click()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const resetEditor = () => {
    onChange("")
    toast({
      title: "Editor reset",
      description: "Content has been cleared",
      variant: "default",
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <motion.div
      className={cn(
        "rounded-lg border overflow-hidden",
        themeColors.editorBg,
        isFullscreen && "fixed inset-4 z-50 rounded-xl shadow-2xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced Toolbar */}
      {showToolbar && (
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-b",
          themeColors.toolbarBg
        )}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Code className="h-3 w-3 text-blue-400" />
              <span className={cn("text-xs font-medium", themeColors.text)}>JSON Response Editor</span>
            </div>

            {showValidation && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={cn("w-2 h-2 rounded-full", isValid ? themeColors.validationValid : themeColors.validationInvalid)} />
                <span className={cn("text-xs", themeColors.textSecondary)}>
                  {isValid ? 'Valid' : 'Invalid'}
                </span>
              </motion.div>
            )}
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={formatJson}
              disabled={isFormatting || !value.trim()}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Format JSON"
            >
              {isFormatting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Code className="h-3 w-3" />
                </motion.div>
              ) : (
                <Code className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!value.trim()}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Copy JSON"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-3 w-3 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Copy className="h-3 w-3" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={downloadJson}
              disabled={isDownloading || !value.trim()}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Download JSON"
            >
              {isDownloading ? (
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Download className="h-3 w-3" />
                </motion.div>
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={uploadJson}
              disabled={isUploading}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Upload JSON"
            >
              {isUploading ? (
                <motion.div
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Upload className="h-3 w-3" />
                </motion.div>
              ) : (
                <Upload className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetEditor}
              disabled={!value.trim()}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Reset"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>

            <div className={cn("w-px h-4 mx-1", themeColors.separator)} />

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn("h-6 w-6 p-0", themeColors.textSecondary, themeColors.buttonHover)}
              title="Settings"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <Editor
        height={isFullscreen ? "calc(100vh - 120px)" : height}
        defaultLanguage="json"
        value={value}
        onChange={handleEditorChange}
        theme={monacoTheme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineNumbers: "on",
          roundedSelection: false,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
          },
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          wordWrap: "on",
          lineHeight: 16,
          padding: { top: 8, bottom: 8 },
          folding: true,
          foldingHighlight: true,
          bracketPairColorization: {
            enabled: true
          },
          readOnly: readOnly,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          renderLineHighlight: "none"
        }}
      />
    </motion.div>
  )
}
