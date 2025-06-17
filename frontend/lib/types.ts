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
  access_count: number
  last_accessed: string | null
  created_at: string
  updated_at: string | null
  user_id: string
  status: string
  headers: Record<string, string>
  tags: string[]
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

export interface PaginatedResponse<T> {
  success: boolean
  message?: string
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}