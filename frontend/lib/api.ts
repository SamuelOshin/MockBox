import { supabase } from './supabase'

export interface CreateMockRequest {
  name: string
  description?: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  status_code: number
  response: any
  delay_ms: number
  is_public: boolean
}

export interface MockEndpoint {
  id: string
  name: string
  description?: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  status_code: number
  response: any
  delay_ms: number
  is_public: boolean
  accessCount: number
  lastAccessed: Date
  createdAt: Date
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API helper function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the current session token from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if user is authenticated
  if (session?.access_token) {
    defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Mock API implementation
export const mockApi = {
  async createMock(data: CreateMockRequest): Promise<MockEndpoint> {
    return apiRequest<MockEndpoint>('/api/v1/mocks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async testMock(data: CreateMockRequest): Promise<void> {
    // For testing, we'll create a temporary mock and then simulate it
    const tempMock = await this.createMock(data);
    const response = await fetch(`${API_BASE_URL}/simulate/${tempMock.id}`);
    
    if (!response.ok) {
      throw new Error(`Test failed: ${response.status}`);
    }
  },

  async getAllMocks(): Promise<MockEndpoint[]> {
    return apiRequest<MockEndpoint[]>('/api/v1/mocks/');
  },
  async deleteMock(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/mocks/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteMocks(ids: string[]): Promise<void> {
    // Delete mocks one by one since bulk delete might not be implemented
    const promises = ids.map(id => this.deleteMock(id));
    await Promise.all(promises);
  }
}