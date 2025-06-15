"use client"

import { useState, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
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

interface MonacoJsonEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string
  showValidation?: boolean
  showToolbar?: boolean
  placeholder?: string
}

export default function MonacoJsonEditor({
  value,
  onChange,
  height = "400px",
  showValidation = false,
  showToolbar = false,
  placeholder = "Enter JSON..."
}: MonacoJsonEditorProps) {
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)
  const { toast } = useToast()

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
      className={`border border-gray-700 rounded-lg overflow-hidden bg-[#1A1A1A] ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
      layout
      transition={{ duration: 0.3 }}
    >
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-[#2D2D2D]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Code className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium text-white">JSON Response Editor</span>
          </div>
          
          {showValidation && (
            <motion.div 
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-400">
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
            title="Reset"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          <div className="w-px h-4 bg-gray-600 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
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
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3A3A3A]"
            title="Settings"
          >
            <Settings className="h-3 w-3" />
          </Button>

          {/* Theme Selector */}
          <select 
            className="text-xs bg-[#1A1A1A] border border-gray-600 text-white rounded px-2 py-1 h-6"
            defaultValue="dark"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      <Editor
        height={isFullscreen ? "calc(100vh - 120px)" : height}
        defaultLanguage="json"
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
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
            horizontalScrollbarSize: 8
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
          }
        }}
      />
    </motion.div>
  )
}