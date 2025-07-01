# FastAPI Router Shadowing: Issue and Solution

## Problem: Route Shadowing Due to Router Registration Order

When using FastAPI, if you have routers with overlapping prefixes (e.g., `/mocks` and `/mocks/templates`), the order in which you register these routers matters. If the general router (e.g., `/mocks`) is registered before the more specific router (e.g., `/mocks/templates`), FastAPI will match requests to `/mocks/templates` with the `/mocks` router first. This can cause:

- Public endpoints to be shadowed by protected ones
- Authentication or permission errors (e.g., 401/403)
- Endpoint functions never being reached

## Example Scenario
- `/mocks` router requires authentication
- `/mocks/templates` router is meant to be public
- If `/mocks` is registered first, requests to `/mocks/templates` are blocked by `/mocks`'s authentication

## Solution: Register Specific Routers First
**Always register routers with more specific prefixes before routers with more general prefixes.**

### Correct Order
```python
router.include_router(mock_template_router)  # /mocks/templates
router.include_router(mocks_router)          # /mocks
```

### Debugging Steps
1. Add debug prints to middleware and endpoints to trace request flow.
2. If an endpoint is not reached, check router registration order.
3. Move the specific router registration above the general one and retest.

## Reference
- [FastAPI Routing Order](https://fastapi.tiangolo.com/tutorial/bigger-applications/#include-router)

---

**Summary:**
> Register more specific routers before general ones to avoid route shadowing and ensure correct endpoint behavior in FastAPI.
