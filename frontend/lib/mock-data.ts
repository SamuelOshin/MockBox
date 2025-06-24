export const responseTemplates = {
  userList: {
    users: [
      {
        id: "usr_1234",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        avatar: "https://api.mockbox.dev/avatars/1234",
        lastActive: "2024-01-20T10:30:00Z"
      }
    ],
    meta: {
      total: 1,
      page: 1,
      hasMore: false
    }
  },
  productList: {
    products: [
      {
        id: "prod_5678",
        name: "Sample Product",
        price: 29.99,
        category: "electronics",
        inStock: true
      }
    ]
  },
  errorResponse: {
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid request parameters",
      details: []
    }
  }
}

export const sampleMocks = [
  {
    id: "mock_1",
    name: "User List API",
    method: "GET" as const,
    endpoint: "/api/users",
    status_code: 200,
    response: responseTemplates.userList,
    delay_ms: 100,
    is_public: true,
    access_count: 42,
    last_accessed: "2024-01-20T10:30:00Z",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: null,
    user_id: "f5027369-23af-4440-9cb4-7ba889e48dfc",
    status: "ACTIVE",
    headers: {},
    tags: ["users", "api"],
    description: "Mock API for user list"
  },
  {
    id: "mock_2",
    name: "Product API",
    method: "POST" as const,
    endpoint: "/api/products",
    status_code: 201,
    response: responseTemplates.productList,
    delay_ms: 200,
    is_public: false,
    access_count: 18,
    last_accessed: "2024-01-19T14:20:00Z",
    created_at: "2024-01-10T11:00:00Z",
    updated_at: null,
    user_id: "f5027369-23af-4440-9cb4-7ba889e48dfc",
    status: "ACTIVE",
    headers: {},
    tags: ["products", "api"],
    description: "Mock API for product creation"
  }
]
