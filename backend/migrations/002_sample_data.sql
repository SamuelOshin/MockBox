-- Sample data for testing MockBox
-- Run this after the initial schema setup

-- Insert sample mock templates
INSERT INTO mock_templates (name, description, category, template_data, is_public, tags) VALUES
(
    'REST User API',
    'Complete REST API for user management',
    'REST API',
    '{
        "endpoints": [
            {
                "endpoint": "/users",
                "method": "GET",
                "response": {"users": [{"id": 1, "name": "John Doe", "email": "john@example.com"}]},
                "status_code": 200
            },
            {
                "endpoint": "/users/{id}",
                "method": "GET",
                "response": {"id": 1, "name": "John Doe", "email": "john@example.com"},
                "status_code": 200
            },
            {
                "endpoint": "/users",
                "method": "POST",
                "response": {"id": 2, "message": "User created successfully"},
                "status_code": 201
            }
        ]
    }',
    true,
    ARRAY['rest', 'api', 'users', 'crud']
),
(
    'E-commerce Product API',
    'Product catalog API for e-commerce applications',
    'E-commerce',
    '{
        "endpoints": [
            {
                "endpoint": "/products",
                "method": "GET",
                "response": {
                    "products": [
                        {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics"},
                        {"id": 2, "name": "Book", "price": 19.99, "category": "Books"}
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/products/{id}",
                "method": "GET",
                "response": {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics", "stock": 50},
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['ecommerce', 'products', 'catalog']
),
(
    'Error Responses',
    'Common error response templates',
    'Error Handling',
    '{
        "endpoints": [
            {
                "endpoint": "/error/404",
                "method": "GET",
                "response": {"error": "Not Found", "message": "The requested resource was not found"},
                "status_code": 404
            },
            {
                "endpoint": "/error/500",
                "method": "GET",
                "response": {"error": "Internal Server Error", "message": "Something went wrong"},
                "status_code": 500
            },
            {
                "endpoint": "/error/unauthorized",
                "method": "GET",
                "response": {"error": "Unauthorized", "message": "Authentication required"},
                "status_code": 401
            }
        ]
    }',
    true,
    ARRAY['errors', 'http', 'responses']
);

-- Note: Sample mocks and collections should be created by users through the application
-- This ensures proper user association and RLS compliance
