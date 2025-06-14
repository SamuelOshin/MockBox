export interface CreateMockRequest {
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  statusCode: number
  response: any
  delay: number
  isPublic: boolean
}

export interface MockEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  statusCode: number
  response: any
  delay: number
  isPublic: boolean
  accessCount: number
  lastAccessed: Date
  createdAt: Date
}

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:8000';

// API helper function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

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