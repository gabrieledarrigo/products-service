# API Contracts: Product CRUD API

**Date**: 2026-06-12 | **Base URL**: `/api/v1`

## Endpoints

### POST /api/v1/products

Create a new product.

**Request**:

```json
{
  "name": "Widget Pro",
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "price": 29.99,
  "stock": 100
}
```

**Responses**:

`201 Created`:

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget Pro",
  "price": 29.99,
  "stock": 100,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T10:00:00.000Z"
}
```

`400 Bad Request` (validation error):

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "name must be a string"],
  "error": "Bad Request"
}
```

`409 Conflict` (duplicate productToken):

```json
{
  "statusCode": 409,
  "message": "Product with this productToken already exists",
  "error": "Conflict"
}
```

---

### GET /api/v1/products

List products with pagination.

**Query Parameters**:

| Parameter | Type    | Default | Min | Max |
| --------- | ------- | ------- | --- | --- |
| `page`    | integer | 1       | 1   | —   |
| `limit`   | integer | 20      | 1   | 100 |

**Responses**:

`200 OK`:

```json
{
  "products": [
    {
      "id": 1,
      "productToken": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Widget Pro",
      "price": 29.99,
      "stock": 100,
      "createdAt": "2026-06-12T10:00:00.000Z",
      "updatedAt": "2026-06-12T10:00:00.000Z"
    }
  ],
  "totalItems": 1,
  "currentPage": 1,
  "totalPages": 1,
  "limit": 20
}
```

`200 OK` (empty):

```json
{
  "products": [],
  "totalItems": 0,
  "currentPage": 1,
  "totalPages": 0,
  "limit": 20
}
```

`400 Bad Request` (invalid pagination):

```json
{
  "statusCode": 400,
  "message": ["limit must not be greater than 100"],
  "error": "Bad Request"
}
```

---

### GET /api/v1/products/:id

Retrieve a single product by ID.

**Path Parameters**:

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Product ID  |

**Responses**:

`200 OK`:

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget Pro",
  "price": 29.99,
  "stock": 100,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T10:00:00.000Z"
}
```

`404 Not Found`:

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

---

### PUT /api/v1/products/:id/stock

Update the stock quantity of a product.

**Path Parameters**:

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Product ID  |

**Request**:

```json
{
  "stock": 50
}
```

**Responses**:

`200 OK`:

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget Pro",
  "price": 29.99,
  "stock": 50,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T12:30:00.000Z"
}
```

`400 Bad Request`:

```json
{
  "statusCode": 400,
  "message": ["stock must not be less than 0"],
  "error": "Bad Request"
}
```

`404 Not Found`:

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

---

### DELETE /api/v1/products/:id

Soft-delete a product. Idempotent — always returns 204.

**Path Parameters**:

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Product ID  |

**Responses**:

`204 No Content`: No response body.

## Common Error Format

All error responses follow the NestJS standard error format:

```json
{
  "statusCode": <number>,
  "message": <string | string[]>,
  "error": <string>
}
```

- `statusCode`: HTTP status code
- `message`: Human-readable error description. Array for validation errors (one message per field violation), string for business logic errors.
- `error`: HTTP status text (e.g., "Bad Request", "Not Found", "Conflict")
