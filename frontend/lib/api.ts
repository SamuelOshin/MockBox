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

// Mock API implementation
export const mockApi = {
  async createMock(data: CreateMockRequest): Promise<MockEndpoint> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      accessCount: 0,
      lastAccessed: new Date(),
      createdAt: new Date(),
    }
  },

  async testMock(data: CreateMockRequest): Promise<void> {
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  async getAllMocks(): Promise<MockEndpoint[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return []
  },

  async deleteMock(id: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  async deleteMocks(ids: string[]): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}