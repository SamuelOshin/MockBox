'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sparkles,
  Loader2,
  Copy,
  Save,
  Info,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { HTTPMethod } from '@/lib/types'

interface AIGenerationPanelProps {
  onMockGenerated?: (mockData: any) => void
  onMockSaved?: (mock: any) => void
  initialEndpoint?: string
  initialMethod?: HTTPMethod
  className?: string
}

export function AIGenerationPanel({
  onMockGenerated,
  onMockSaved,
  initialEndpoint = '',
  initialMethod = 'GET',
  className = ''
}: AIGenerationPanelProps) {
  const [formData, setFormData] = useState({
    method: initialMethod,
    endpoint: initialEndpoint,
    description: '',
    responseFormat: 'json',
    schemaHint: '',
    complexity: 'medium',
    statusCode: 200,
    includeHeaders: true,
    realisticData: true,
    // Save options
    name: '',
    saveDescription: '',
    isPublic: false,
    tags: [] as string[],
    autoSave: false
  })

  const [generatedData, setGeneratedData] = useState<any>(null)
  const [showSaveOptions, setShowSaveOptions] = useState(false)

  const {
    generateMockData,
    generateAndSaveMock,
    isGenerating,
    error,
    usage,
    fetchUsage
  } = useAIGeneration()

  useEffect(() => {
    fetchUsage()
  }, [])

  useEffect(() => {
    if (initialEndpoint !== formData.endpoint) {
      setFormData(prev => ({ ...prev, endpoint: initialEndpoint }))
    }
    if (initialMethod !== formData.method) {
      setFormData(prev => ({ ...prev, method: initialMethod }))
    }
  }, [initialEndpoint, initialMethod])

  const handleGenerate = async () => {
    if (formData.autoSave) {
      await handleGenerateAndSave()
    } else {
      await handleGenerateOnly()
    }
  }

  const handleGenerateOnly = async () => {
    const result = await generateMockData({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: formData.responseFormat as any,
      schemaHint: formData.schemaHint,
      complexity: formData.complexity as any,
      statusCode: formData.statusCode,
      includeHeaders: formData.includeHeaders,
      realisticData: formData.realisticData
    })

    if (result) {
      setGeneratedData(result)
      onMockGenerated?.(result)
      setShowSaveOptions(true)
      await fetchUsage() // Refresh usage stats
    }
  }

  const handleGenerateAndSave = async () => {
    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.description,
      responseFormat: formData.responseFormat as any,
      schemaHint: formData.schemaHint,
      complexity: formData.complexity as any,
      statusCode: formData.statusCode,
      includeHeaders: formData.includeHeaders,
      realisticData: formData.realisticData,
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: formData.isPublic,
      tags: [...formData.tags, 'ai-generated']
    })

    if (result) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
      await fetchUsage() // Refresh usage stats
    }
  }

  const handleSaveGenerated = async () => {
    if (!generatedData) return

    const result = await generateAndSaveMock({
      method: formData.method,
      endpoint: formData.endpoint,
      description: formData.saveDescription || formData.description,
      responseFormat: formData.responseFormat as any,
      name: formData.name || `AI Generated - ${formData.endpoint}`,
      isPublic: formData.isPublic,
      tags: [...formData.tags, 'ai-generated']
    })

    if (result) {
      onMockSaved?.(result)
      setGeneratedData(null)
      setShowSaveOptions(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const isFormValid = formData.method && formData.endpoint

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">AI Mock Generator</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Brain className="h-3 w-3 mr-1" />
              Phase 2
            </Badge>
          </div>
          <CardDescription>
            Generate realistic mock data using AI. Describe your API and let AI create intelligent responses.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Usage Stats */}
      {usage && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
            {usage.planName && (
              <div className="text-xs text-muted-foreground mt-1">
                Plan: <span className="font-semibold">{usage.planName}</span>
                {usage.dailyRequestQuota && (
                  <> &bull; Daily Quota: <span className="font-semibold">{usage.dailyRequestQuota}</span></>
                )}
                {usage.monthlyTokenQuota && (
                  <> &bull; Monthly Token Quota: <span className="font-semibold">{usage.monthlyTokenQuota.toLocaleString()}</span></>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Requests (Today)</div>
                <div className="font-medium">
                  {usage.requestsToday}
                  {typeof usage.dailyRequestQuota === 'number' && (
                    <>/<span>{usage.dailyRequestQuota}</span></>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Tokens (This Month)</div>
                <div className="font-medium">
                  {usage.tokensUsedThisMonth.toLocaleString()}
                  {typeof usage.monthlyTokenQuota === 'number' && (
                    <>/<span>{usage.monthlyTokenQuota.toLocaleString()}</span></>
                  )}
                </div>
              </div>
            </div>
            <Progress
              value={usage.dailyRequestQuota ? (usage.requestsToday / usage.dailyRequestQuota) * 100 : 0}
              className="h-2"
            />
            {usage.rateLimitRemaining <= 2 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Only {usage.rateLimitRemaining} AI generations remaining today.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoint Configuration</CardTitle>
          <CardDescription>
            Provide basic information about your API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-code">Status Code</Label>
              <Input
                id="status-code"
                type="number"
                min="100"
                max="599"
                value={formData.statusCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  statusCode: parseInt(e.target.value) || 200
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint Path</Label>
            <Input
              id="endpoint"
              placeholder="/api/users/123"
              value={formData.endpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this endpoint should return..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Response Format</Label>
              <Select
                value={formData.responseFormat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, responseFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity</Label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schema-hint">Schema Hint (Optional)</Label>
            <Input
              id="schema-hint"
              placeholder="User object with id, name, email, avatar..."
              value={formData.schemaHint}
              onChange={(e) => setFormData(prev => ({ ...prev, schemaHint: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="realistic-data"
                checked={formData.realisticData}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, realisticData: checked }))}
              />
              <Label htmlFor="realistic-data">Realistic Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-headers"
                checked={formData.includeHeaders}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeHeaders: checked }))}
              />
              <Label htmlFor="include-headers">Include Headers</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={formData.autoSave}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSave: checked }))}
            />
            <Label htmlFor="auto-save">Generate and Save Automatically</Label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!isFormValid || isGenerating || (usage?.rateLimitRemaining === 0)}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {formData.autoSave ? 'Generate & Save Mock' : 'Generate Mock Data'}
          </>
        )}
      </Button>

      {/* Generated Data Display */}
      {generatedData && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">Generated Successfully</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {generatedData.generation_time.toFixed(2)}s
                <Zap className="h-4 w-4" />
                {generatedData.provider}
              </div>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              {generatedData.explanation}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Response Data</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(generatedData.response_data, null, 2))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-60">
                {JSON.stringify(generatedData.response_data, null, 2)}
              </pre>
            </div>

            {generatedData.headers && Object.keys(generatedData.headers).length > 0 && (
              <div className="space-y-2">
                <Label>Headers</Label>
                <pre className="bg-muted p-3 rounded-md text-sm">
                  {JSON.stringify(generatedData.headers, null, 2)}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Status Code</div>
                <div className="font-medium">{generatedData.status_code}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Model</div>
                <div className="font-medium">{generatedData.model}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tokens</div>
                <div className="font-medium">{generatedData.tokens_used || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Options */}
      {showSaveOptions && generatedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Save as Mock</CardTitle>
            <CardDescription>
              Save this AI-generated data as a reusable mock endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mock-name">Mock Name</Label>
              <Input
                id="mock-name"
                placeholder={`AI Generated - ${formData.endpoint}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="save-description">Description</Label>
              <Textarea
                id="save-description"
                placeholder="Description for this mock..."
                value={formData.saveDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, saveDescription: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="is-public">Make Public</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveGenerated} disabled={isGenerating}>
                <Save className="mr-2 h-4 w-4" />
                Save Mock
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveOptions(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
