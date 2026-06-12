# Quickstart: Product CRUD API

**Date**: 2026-06-12 | **Feature**: [spec.md](spec.md)

## Prerequisites

- Node.js (LTS)
- Docker and Docker Compose (for MySQL)
- npm

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the MySQL database**:

   ```bash
   docker compose up -d
   ```

3. **Create the `.env` file** (if not already present):

   ```bash
   cp .env.example .env
   ```

   Default values:

   ```
   NODE_ENV=production
   APP_ENV=local
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=user
   DB_PASSWORD=password
   DB_NAME=ecommerce
   ```

4. **Start the application in development mode**:

   ```bash
   npm run start:dev
   ```

   The API is available at `http://localhost:3000/api/v1/products`.
   OpenAPI docs are available at `http://localhost:3000/docs`.

## Validation Scenarios

### Scenario 1: Create a Product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget Pro",
    "productToken": "550e8400-e29b-41d4-a716-446655440000",
    "price": 29.99,
    "stock": 100
  }'
```

**Expected**: `201 Created` with complete product including `id`, `createdAt`, `updatedAt`. See [API contracts](contracts/api.md#post-apiv1products) for full response schema.

### Scenario 2: Create Product with Validation Error

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "productToken": "not-a-uuid",
    "price": -5,
    "stock": -1
  }'
```

**Expected**: `400 Bad Request` with an array of validation error messages.

### Scenario 3: Create Duplicate Product (Conflict)

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Widget",
    "productToken": "550e8400-e29b-41d4-a716-446655440000",
    "price": 10.00,
    "stock": 50
  }'
```

**Expected**: `409 Conflict` with message indicating the productToken already exists.

### Scenario 4: List Products with Pagination

```bash
curl http://localhost:3000/api/v1/products?page=1&limit=10
```

**Expected**: `200 OK` with `products` array, `totalItems`, `currentPage`, `totalPages`, and `limit`. See [API contracts](contracts/api.md#get-apiv1products) for response schema.

### Scenario 5: Get Product by ID

```bash
curl http://localhost:3000/api/v1/products/1
```

**Expected**: `200 OK` with complete product details. See [API contracts](contracts/api.md#get-apiv1productsid) for response schema.

### Scenario 6: Update Product Stock

```bash
curl -X PUT http://localhost:3000/api/v1/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'
```

**Expected**: `200 OK` with updated product showing new stock value and updated `updatedAt`.

### Scenario 7: Soft-Delete a Product

```bash
curl -X DELETE http://localhost:3000/api/v1/products/1
```

**Expected**: `204 No Content` with empty body.

### Scenario 8: Verify Soft-Delete Behavior

```bash
# Try to retrieve the deleted product
curl http://localhost:3000/api/v1/products/1
```

**Expected**: `404 Not Found`.

```bash
# Delete again (idempotent)
curl -X DELETE http://localhost:3000/api/v1/products/1
```

**Expected**: `204 No Content` (idempotent).

## Running Tests

```bash
# Run all tests (unit + e2e)
npm run test

# Run only unit tests
npm run test:unit

# Run only e2e tests (requires Docker for testcontainers)
npm run test:e2e

# Type checking
npm run typecheck

# Lint
npm run lint

# Format check
npm run format
```

**Note**: E2E tests use testcontainers to automatically spin up a MySQL container. Docker must be running.
