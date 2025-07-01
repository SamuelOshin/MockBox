import { supabase } from './supabase'
import { MockEndpoint, CreateMockRequest, PaginatedResponse, MockError, ApiErrorType, TemplateDetail } from './types'

// Create error helper function
function createMockError(message: string, status?: number, details?: any): MockError {
  let type: ApiErrorType = 'SERVER_ERROR'
  
  if (status) {
    if (status === 401) type = 'AUTH_ERROR'
    else if (status === 403) type = 'FORBIDDEN'
    else if (status === 404) type = 'NOT_FOUND'
    else if (status >= 400 && status < 500) type = 'VALIDATION_ERROR'
    else if (status >= 500) type = 'SERVER_ERROR'
  } else if (message.toLowerCase().includes('network')) {
    type = 'NETWORK_ERROR'
  }
  
  return {
    type,
    message,
    status,
    details
  }
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API helper function with enhanced error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    // Get the current session token from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw createMockError(`Authentication error: ${sessionError.message}`, 401, sessionError)
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
      let errorDetails: any = null
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorMessage
        errorDetails = errorData
      } catch (e) {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      }
      
      throw createMockError(errorMessage, response.status, errorDetails)
    }    const responseData = await response.json()
    return responseData
  } catch (error) {
    // If it's already a MockError, re-throw it
    if (error && typeof error === 'object' && 'type' in error) {
      throw error
    }
    
    // Handle network errors and other exceptions
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    throw createMockError(`Network error: ${message}`)
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

  async testMock(data: CreateMockRequest): Promise<any> {
    // Use the simulate endpoint for testing without creating a mock
    const endpointPath = data.endpoint.startsWith('/') ? data.endpoint.slice(1) : data.endpoint;
    const url = `${API_BASE_URL}/api/v1/simulate/${endpointPath}`;
    const fetchOptions: RequestInit = {
      method: data.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    // Only include body for methods that allow it
    if (data.method !== 'GET' && data.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(data.response);
    }
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Test failed: ${response.status} ${errorText}`);
    }
    return response.json();
  },
  async getAllMocks(): Promise<MockEndpoint[]> {
    const response = await apiRequest<PaginatedResponse<MockEndpoint>>('/api/v1/mocks/')
    return response.data
  },  
  async getMock(id: string): Promise<MockEndpoint> {
    if (!id || typeof id !== 'string') {
      throw createMockError('Invalid mock ID provided', 400)
    }

    try {
      const mock = await apiRequest<MockEndpoint>(`/api/v1/mocks/${id}`)
      
      // Validate the returned mock data
      if (!mock || typeof mock !== 'object') {
        throw createMockError('Invalid mock data received from server', 500)
      }

      // Ensure required fields are present
      const requiredFields = ['id', 'name', 'endpoint', 'method', 'response']
      const missingFields = requiredFields.filter(field => !(field in mock))
      
      if (missingFields.length > 0) {
        throw createMockError(
          `Mock data is missing required fields: ${missingFields.join(', ')}`, 
          500,
          { missingFields, receivedData: mock }
        )
      }

      return mock
    } catch (error) {
      // Re-throw MockError instances
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      // Handle unexpected errors
      const message = error instanceof Error ? error.message : 'Failed to fetch mock'
      throw createMockError(message)
    }
  },
  async deleteMock(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/mocks/${id}`, {
      method: 'DELETE',
    })
  },

  async updateMock(id: string, data: CreateMockRequest): Promise<MockEndpoint> {
    if (!id || typeof id !== 'string') {
      throw createMockError('Invalid mock ID provided', 400)
    }

    try {
      const updatedMock = await apiRequest<MockEndpoint>(`/api/v1/mocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      
      // Validate the returned mock data
      if (!updatedMock || typeof updatedMock !== 'object') {
        throw createMockError('Invalid mock data received from server', 500)
      }

      return updatedMock
    } catch (error) {
      // Re-throw MockError instances
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      // Handle unexpected errors
      const message = error instanceof Error ? error.message : 'Failed to update mock'
      throw createMockError(message)
    }
  },

  async deleteMocks(ids: string[]): Promise<void> {
    // Delete mocks one by one since bulk delete might not be implemented
    const promises = ids.map(id => this.deleteMock(id))
    await Promise.all(promises)
  },

  async simulateMock(data: CreateMockRequest): Promise<{ status: number, headers: Record<string, string>, body: any }> {
    const endpointPath = data.endpoint.startsWith('/') ? data.endpoint.slice(1) : data.endpoint;
    const url = `${API_BASE_URL}/api/v1/simulate/${endpointPath}`;
    const fetchOptions: RequestInit = {
      method: data.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    // Only include body for methods that allow it
    if (data.method !== 'GET' && data.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(data.response);
    }
    const response = await fetch(url, fetchOptions);
    const body = await response.json().catch(() => ({}));
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => { headers[key] = value });
    return { status: response.status, headers, body };
  },
}

// --- Mock Template API ---
export async function getTemplateById(id: string): Promise<TemplateDetail> {
  if (!id || typeof id !== "string") {
    throw createMockError("Invalid template ID provided", 400);
  }
  try {
    const { data } = await apiClient.get<TemplateDetail>(`/api/v1/mocks/templates/${id}`);
    return data;
  } catch (error: any) {
    // Re-throw MockError instances
    if (error && typeof error === "object" && "type" in error) {
      throw error;
    }
    throw createMockError(error?.message || "Failed to fetch template");
  }
}

export async function getAllTemplates(params?: { page?: number; limit?: number }) {
  try {
    const { data } = await apiClient.get<{ data: any[] }>(
      "/api/v1/mocks/templates",
      { params: { page: params?.page ?? 1, limit: params?.limit ?? 50 } }
    );
    return data.data || [];
  } catch (error: any) {
    if (error && typeof error === "object" && "type" in error) {
      throw error;
    }
    throw createMockError(error?.message || "Failed to fetch templates");
  }
}