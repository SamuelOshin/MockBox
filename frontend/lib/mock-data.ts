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
    accessCount: 42,
    lastAccessed: new Date("2024-01-20"),
    createdAt: new Date("2024-01-15")
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
    accessCount: 18,
    lastAccessed: new Date("2024-01-19"),
    createdAt: new Date("2024-01-10")
  }
]