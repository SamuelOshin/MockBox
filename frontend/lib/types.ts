export interface MockEndpoint {
  id: string
  user_id: string
  name: string
  description?: string | null
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
  response: any
  headers: Record<string, string>
  status_code: number
  delay_ms: number
  status: "active" | "inactive" | "draft"
  is_public: boolean
  tags: string[]
  access_count: number
  last_accessed: string | null
  created_at: string
  updated_at: string | null
}

// API Response types to match backend
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  timestamp: string
}

export interface ApiError {
  success: false
  message: string
  error_code?: string
  details?: Record<string, any>
  timestamp: string
}

// Error types for better error handling
export type ApiErrorType = 'NETWORK_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'FORBIDDEN' | 'SERVER_ERROR' | 'VALIDATION_ERROR'

export interface MockError {
  type: ApiErrorType
  message: string
  status?: number
  details?: any
}

// Update CreateMockRequest to match backend exactly
export interface CreateMockRequest {
  name: string
  description?: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
  response: any
  headers?: Record<string, string>
  status_code: number
  delay_ms: number
  is_public: boolean
  tags?: string[]
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

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  created_at: string;
  usage_count: number;
}

// Enhanced TemplateDetail interface with better typing for template_data
export interface TemplateDetail extends Template {
  template_data: {
    endpoints?: Array<{
      endpoint?: string;
      method?: string;
      response?: any;
      headers?: Record<string, string>;
      status_code?: number;
      delay_ms?: number;
      description?: string;
    }>;
    [key: string]: any;
  };
  is_public: boolean;
  created_by?: string;
  updated_at?: string;
}