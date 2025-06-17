import { supabase } from './supabase'
import { MockEndpoint, CreateMockRequest, PaginatedResponse } from './types'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API helper function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Get the current session token from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if user is authenticated
    if (session?.access_token) {
      defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
      console.log('Making authenticated request to:', url);
    } else {
      console.log('Making unauthenticated request to:', url);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        console.error('API Error Response:', errorData);
      } catch (e) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
        console.error('API Error Text:', errorText);
      }
      throw new Error(`API Error: ${response.status} - ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log('API Response Data:', responseData);
    return responseData;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
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
    const response = await apiRequest<PaginatedResponse<MockEndpoint>>('/api/v1/mocks/');
    return response.data;
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