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

export interface CreateMockRequest {
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  statusCode: number
  response: any
  delay: number
  isPublic: boolean
}