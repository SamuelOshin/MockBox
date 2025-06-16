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