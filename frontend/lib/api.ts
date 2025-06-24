import { supabase } from './supabase'
import { MockEndpoint, CreateMockRequest, PaginatedResponse } from './types'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API helper function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    // Get the current session token from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`)
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if user is authenticated
    if (session?.access_token) {
      defaultHeaders['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorMessage
      } catch (e) {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      }
      throw new Error(`API Error: ${response.status} - ${errorMessage}`)
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    throw error
  }
}

// Generic API client for modern usage (used by AI hooks and other new features)
export const apiClient = {  async get<T>(endpoint: string, config?: { params?: Record<string, any> }): Promise<{ data: T; status: number }> {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays by appending multiple query parameters with the same key
            value.forEach(item => url.searchParams.append(key, String(item)))
          } else {
            url.searchParams.append(key, String(value))
          }
        }
      })
    }

    const data = await apiRequest<T>(url.pathname + url.search)
    return { data, status: 200 }
  },
  async post<T>(endpoint: string, body?: any, config?: { params?: Record<string, any> }): Promise<{ data: T; status: number }> {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays by appending multiple query parameters with the same key
            value.forEach(item => url.searchParams.append(key, String(item)))
          } else {
            url.searchParams.append(key, String(value))
          }
        }
      })
    }

    const data = await apiRequest<T>(url.pathname + url.search, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
    return { data, status: 201 }
  },

  async put<T>(endpoint: string, body?: any): Promise<{ data: T; status: number }> {
    const data = await apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
    return { data, status: 200 }
  },

  async delete<T>(endpoint: string): Promise<{ data: T; status: number }> {
    const data = await apiRequest<T>(endpoint, {
      method: 'DELETE',
    })
    return { data, status: 200 }
  }
}

// Mock API implementation (legacy, kept for backwards compatibility)
export const mockApi = {
  async createMock(data: CreateMockRequest): Promise<MockEndpoint> {
    return apiRequest<MockEndpoint>('/api/v1/mocks/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async testMock(data: CreateMockRequest): Promise<void> {
    // For testing, we'll create a temporary mock and then simulate it
    const tempMock = await this.createMock(data)
    const response = await fetch(`${API_BASE_URL}/simulate/${tempMock.id}`)

    if (!response.ok) {
      throw new Error(`Test failed: ${response.status}`)
    }
  },

  async getAllMocks(): Promise<MockEndpoint[]> {
    const response = await apiRequest<PaginatedResponse<MockEndpoint>>('/api/v1/mocks/')
    return response.data
  },

  async deleteMock(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/mocks/${id}`, {
      method: 'DELETE',
    })
  },

  async deleteMocks(ids: string[]): Promise<void> {
    // Delete mocks one by one since bulk delete might not be implemented
    const promises = ids.map(id => this.deleteMock(id))
    await Promise.all(promises)
  }
}
