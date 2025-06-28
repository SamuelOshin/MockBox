import { useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface AIGenerationRequest {
  method: string
  endpoint: string
  description?: string
  responseFormat?: 'json' | 'xml' | 'text' | 'html'
  schemaHint?: string
  complexity?: 'simple' | 'medium' | 'complex'
  statusCode?: number
  includeHeaders?: boolean
  realisticData?: boolean
}

interface AIGenerationResponse {
  response_data: any
  status_code: number
  headers: Record<string, string>
  explanation: string
  provider: string
  model: string
  generation_time: number
  tokens_used?: number
}

interface MockSaveRequest extends AIGenerationRequest {
  name?: string
  description?: string
  isPublic?: boolean
  tags?: string[]
}

interface SavedMockResponse {
  id: string
  name: string
  description: string
  endpoint: string
  method: string
  response: any
  headers: Record<string, string>
  status_code: number
  delay_ms: number
  is_public: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

interface AIUsageResponse {
  user_id: string
  requests_today: number
  requests_this_month: number
  tokens_used_today: number
  tokens_used_this_month: number
  rate_limit_remaining: number
  rate_limit_reset: string
  last_request: string
}

interface UseAIGenerationReturn {
  generateMockData: (request: AIGenerationRequest) => Promise<AIGenerationResponse | null>
  generateAndSaveMock: (request: MockSaveRequest) => Promise<any | null>
  isGenerating: boolean
  error: string | null
  usage: {
    requestsToday: number
    requestsThisMonth: number
    tokensUsedToday: number
    tokensUsedThisMonth: number
    rateLimitRemaining: number
  } | null
  fetchUsage: () => Promise<void>
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UseAIGenerationReturn['usage']>(null)
  const { user } = useAuth() // Get user from auth context

  const generateMockData = async (request: AIGenerationRequest): Promise<AIGenerationResponse | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Validate required fields
      if (!request.method || !request.endpoint) {
        throw new Error('Method and endpoint are required')
      }

      // Make API call to generate mock data
      const response = await apiClient.post('/api/v1/ai/generate', {
        method: request.method.toUpperCase(),
        endpoint: request.endpoint,
        description: request.description || '',
        response_format: request.responseFormat || 'json',
        schema_hint: request.schemaHint || '',
        complexity: request.complexity || 'medium',
        status_code: request.statusCode || 200,
        include_headers: request.includeHeaders ?? true,
        realistic_data: request.realisticData ?? true
      })

      if (response.status === 200 || response.status === 201) {
        const result = response.data as AIGenerationResponse

        toast.success('Mock data generated successfully!', {
          description: `Generated with ${result.provider} in ${result.generation_time.toFixed(2)}s`
        })

        return result
      } else {
        throw new Error('Failed to generate mock data')
      }
    } catch (err: any) {
      let errorMessage = 'Failed to generate mock data'

      if (err.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a minute.'
      } else if (err.response?.status === 503) {
        errorMessage = 'AI service temporarily unavailable. Please try again later.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error('Generation Failed', {
        description: errorMessage
      })
      return { response_data: null, status_code: err.response?.status || 500, headers: {}, explanation: errorMessage, provider: '', model: '', generation_time: 0 } as AIGenerationResponse
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAndSaveMock = async (request: MockSaveRequest): Promise<any | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Validate required fields
      if (!request.method || !request.endpoint) {
        throw new Error('Method and endpoint are required')
      }

      // Make API call to generate and save mock
      const queryParams: any = {}
      if (request.name) queryParams.name = request.name
      if (request.description) queryParams.description = request.description
      queryParams.is_public = request.isPublic || false      // Handle tags as array - FastAPI expects multiple query params for lists
      const tagsToUse = request.tags && request.tags.length > 0 ? request.tags : ['ai-generated']
      queryParams.tags = tagsToUse

      const response = await apiClient.post<SavedMockResponse>('/api/v1/ai/generate-and-save', {
        method: request.method.toUpperCase(),
        endpoint: request.endpoint,
        description: request.description || '',
        response_format: request.responseFormat || 'json',
        schema_hint: request.schemaHint || '',
        complexity: request.complexity || 'medium',
        status_code: request.statusCode || 200,
        include_headers: request.includeHeaders ?? true,
        realistic_data: request.realisticData ?? true
      }, {
        params: queryParams
      })

      if (response.status === 200 || response.status === 201) {
        const result = response.data

        toast.success('AI mock created successfully!', {
          description: `Created "${result.name}" and saved to your mocks`
        })

        return result
      } else {
        throw new Error('Failed to create AI mock')
      }
    } catch (err: any) {
      let errorMessage = 'Failed to create AI mock'

      if (err.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a minute.'
      } else if (err.response?.status === 503) {
        errorMessage = 'AI service temporarily unavailable. Please try again later.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error('Creation Failed', {
        description: errorMessage
      })
      return { error: errorMessage }
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchUsage = async () => {
    try {
      // Get current user from auth context
      if (!user) {
        throw new Error('User not found')
      }

      const userId = user.id

      if (!userId) {
        throw new Error('User ID not found')
      }

      const response = await apiClient.get<AIUsageResponse>(`/api/v1/ai/usage/${userId}`)

      if (response.status === 200) {
        const data = response.data
        setUsage({
          requestsToday: data.requests_today,
          requestsThisMonth: data.requests_this_month,
          tokensUsedToday: data.tokens_used_today,
          tokensUsedThisMonth: data.tokens_used_this_month,
          rateLimitRemaining: data.rate_limit_remaining
        })
      }
    } catch (err: any) {
      console.error('Failed to fetch AI usage:', err)
      // Don't show error to user for usage fetch failures
    }
  }

  return {
    generateMockData,
    generateAndSaveMock,
    isGenerating,
    error,
    usage,
    fetchUsage
  }
}
