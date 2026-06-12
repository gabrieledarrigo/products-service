# Feature Specification: Product CRUD API

**Feature Branch**: `001-product-crud-api`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "products-service is a RESTful CRUD API for managing products in an e-commerce platform, exposing endpoints for creating, listing, retrieving, updating stock, and soft-deleting products."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a New Product (Priority: P1)

As a client of the e-commerce platform, I want to create a new product so that it becomes available in the product catalog.

**Why this priority**: Product creation is the foundational operation — without it, no other operations (listing, retrieving, updating, deleting) are possible.

**Independent Test**: Can be fully tested by sending a POST request with valid product data and verifying the product is persisted and returned with all fields populated.

**Acceptance Scenarios**:

1. **Given** a valid product payload with name, productToken (UUID v4), price, and stock, **When** the client sends a POST request to `/products`, **Then** the system returns a `201 Created` response with the complete product including `id`, `createdAt`, and `updatedAt` timestamps.
2. **Given** a product payload missing the required `name` field, **When** the client sends a POST request to `/products`, **Then** the system returns a `400 Bad Request` response with an error message.
3. **Given** a product payload with an empty `name` field, **When** the client sends a POST request to `/products`, **Then** the system returns a `400 Bad Request` response.
4. **Given** a product payload with a negative `price`, **When** the client sends a POST request to `/products`, **Then** the system returns a `400 Bad Request` response.
5. **Given** a product payload with a negative `stock` value, **When** the client sends a POST request to `/products`, **Then** the system returns a `400 Bad Request` response.
6. **Given** a product payload with an invalid `productToken` (not UUID v4), **When** the client sends a POST request to `/products`, **Then** the system returns a `400 Bad Request` response.
7. **Given** a product with a specific `productToken` already exists, **When** the client sends a POST request with the same `productToken`, **Then** the system returns a `409 Conflict` response.

---

### User Story 2 - List Products with Pagination (Priority: P1)

As a client of the e-commerce platform, I want to retrieve a paginated list of products so that I can browse the product catalog efficiently.

**Why this priority**: Listing products is the primary read operation and essential for any catalog browsing functionality.

**Independent Test**: Can be fully tested by creating several products, then requesting pages of products and verifying correct pagination metadata.

**Acceptance Scenarios**:

1. **Given** multiple products exist, **When** the client sends a GET request to `/products` without pagination parameters, **Then** the system returns the first page with up to 20 products, along with `totalItems`, `currentPage`, `totalPages`, and `limit` metadata.
2. **Given** multiple products exist, **When** the client sends a GET request to `/products?page=2&limit=5`, **Then** the system returns the second page with up to 5 products and correct pagination metadata.
3. **Given** no products exist, **When** the client sends a GET request to `/products`, **Then** the system returns a `200 OK` response with an empty `products` array and `totalItems` of 0.
4. **Given** products exist, **When** the client sends a GET request with `page` exceeding total pages, **Then** the system returns a `200 OK` response with an empty `products` array.
5. **Given** the client sends `limit=0` or `limit=-1`, **When** the request is processed, **Then** the system returns a `400 Bad Request` response.
6. **Given** the client sends `limit=101` (exceeding maximum), **When** the request is processed, **Then** the system returns a `400 Bad Request` response.
7. **Given** the client sends `page=0` or `page=-1`, **When** the request is processed, **Then** the system returns a `400 Bad Request` response.
8. **Given** some products have been soft-deleted, **When** the client sends a GET request to `/products`, **Then** the soft-deleted products are excluded from the results and from `totalItems`.

---

### User Story 3 - Retrieve a Single Product (Priority: P2)

As a client of the e-commerce platform, I want to retrieve a specific product by its ID so that I can view its details.

**Why this priority**: Retrieving individual product details is essential for product detail pages but depends on products existing first.

**Independent Test**: Can be fully tested by creating a product and then retrieving it by ID, verifying all fields are returned correctly.

**Acceptance Scenarios**:

1. **Given** a product with a specific `id` exists, **When** the client sends a GET request to `/products/:id`, **Then** the system returns a `200 OK` response with the complete product details.
2. **Given** no product exists with the specified `id`, **When** the client sends a GET request to `/products/:id`, **Then** the system returns a `404 Not Found` response.
3. **Given** a product with the specified `id` has been soft-deleted, **When** the client sends a GET request to `/products/:id`, **Then** the system returns a `404 Not Found` response.

---

### User Story 4 - Update Product Stock (Priority: P2)

As a client of the e-commerce platform, I want to update the stock quantity of a product so that inventory levels remain accurate.

**Why this priority**: Stock management is a core business operation but is secondary to product creation and retrieval.

**Independent Test**: Can be fully tested by creating a product, updating its stock, and verifying the new stock value is returned.

**Acceptance Scenarios**:

1. **Given** a product with a specific `id` exists, **When** the client sends a PUT request to `/products/:id/stock` with a valid `stock` value, **Then** the system returns a `200 OK` response with the updated product, and the `updatedAt` timestamp reflects the change.
2. **Given** a product exists, **When** the client sends a PUT request with a negative `stock` value, **Then** the system returns a `400 Bad Request` response.
3. **Given** a product exists, **When** the client sends a PUT request without the `stock` field, **Then** the system returns a `400 Bad Request` response.
4. **Given** no product exists with the specified `id`, **When** the client sends a PUT request to `/products/:id/stock`, **Then** the system returns a `404 Not Found` response.
5. **Given** a product with the specified `id` has been soft-deleted, **When** the client sends a PUT request to `/products/:id/stock`, **Then** the system returns a `404 Not Found` response.

---

### User Story 5 - Soft-Delete a Product (Priority: P3)

As a client of the e-commerce platform, I want to soft-delete a product so that it is removed from active listings while preserving the data for historical purposes.

**Why this priority**: Deletion is a less frequent operation and is dependent on the other CRUD operations working correctly.

**Independent Test**: Can be fully tested by creating a product, deleting it, and verifying it no longer appears in listings or by-ID retrieval.

**Acceptance Scenarios**:

1. **Given** a product with a specific `id` exists, **When** the client sends a DELETE request to `/products/:id`, **Then** the system returns a `204 No Content` response, and the product's `deletedAt` field is set.
2. **Given** a product with the specified `id` has already been soft-deleted, **When** the client sends a DELETE request to `/products/:id`, **Then** the system returns a `204 No Content` response (idempotent behavior).
3. **Given** no product exists with the specified `id`, **When** the client sends a DELETE request to `/products/:id`, **Then** the system returns a `204 No Content` response (idempotent behavior).

---

### Edge Cases

- What happens when the `id` path parameter is not a valid integer (e.g., a string)? The system returns a `400 Bad Request` response.
- What happens when the `price` exceeds the `decimal(10, 4)` precision limit? The system returns a `400 Bad Request` response.
- What happens when concurrent requests attempt to create products with the same `productToken`? The system ensures uniqueness at the database level and returns `409 Conflict` for the duplicate.
- What happens when the request body contains unexpected additional fields? The system ignores unknown fields and processes only the expected ones.
- What happens when the `stock` is updated to 0? The system accepts this as a valid non-negative value.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow clients to create a product by providing a name, productToken, price, and stock.
- **FR-002**: System MUST auto-generate `id`, `createdAt`, and `updatedAt` fields upon product creation.
- **FR-003**: System MUST enforce uniqueness of `productToken` across all products (including soft-deleted ones).
- **FR-004**: System MUST validate that `name` is a non-empty string on product creation.
- **FR-005**: System MUST validate that `productToken` is a valid UUID v4 on product creation.
- **FR-006**: System MUST validate that `price` is a non-negative decimal with precision up to `decimal(10, 4)`.
- **FR-007**: System MUST validate that `stock` is a non-negative integer.
- **FR-008**: System MUST return paginated product listings with configurable `page` and `limit` parameters.
- **FR-009**: System MUST default pagination to page 1 and limit 20 when parameters are not provided.
- **FR-010**: System MUST enforce pagination limits: `page` minimum 1, `limit` minimum 1 and maximum 100.
- **FR-011**: System MUST return pagination metadata (`totalItems`, `currentPage`, `totalPages`, `limit`) alongside the product list.
- **FR-012**: System MUST exclude soft-deleted products from list and single-product retrieval responses.
- **FR-013**: System MUST allow retrieval of a single product by its `id`.
- **FR-014**: System MUST allow updating only the `stock` quantity of a product via a dedicated endpoint.
- **FR-015**: System MUST update the `updatedAt` timestamp when a product's stock is modified.
- **FR-016**: System MUST support soft-deletion of products by setting the `deletedAt` timestamp.
- **FR-017**: System MUST implement idempotent soft-deletion — deleting a non-existent or already-deleted product returns `204 No Content`.
- **FR-018**: System MUST return appropriate HTTP status codes: `201` for creation, `200` for retrieval and updates, `204` for deletion, `400` for validation errors, `404` for not found, `409` for conflicts.
- **FR-019**: System MUST return structured, human-readable error messages for validation failures without exposing internal details.

### Key Entities

- **Product**: Represents an item in the e-commerce catalog. Key attributes: `id` (auto-incremented identifier), `productToken` (unique UUID v4), `name` (display name), `price` (unit price with 4 decimal places), `stock` (available quantity), `createdAt`/`updatedAt`/`deletedAt` (lifecycle timestamps). A product is considered active when `deletedAt` is null.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Clients can create a product with all required fields and receive a complete product representation in under 1 second.
- **SC-002**: Clients can retrieve a paginated list of up to 100 products in a single request with correct pagination metadata.
- **SC-003**: Clients can retrieve any individual product by ID in under 500 milliseconds.
- **SC-004**: Clients can update a product's stock and see the change reflected immediately in subsequent retrievals.
- **SC-005**: Soft-deleted products are completely hidden from all listing and retrieval operations.
- **SC-006**: All invalid requests receive clear, actionable error messages that help the client correct the issue.
- **SC-007**: The delete operation is fully idempotent — repeated deletions of the same product always succeed silently.
- **SC-008**: 100% of functional requirements have corresponding automated tests.

## Assumptions

- The service operates as a standalone microservice within a larger e-commerce platform; it does not depend on other services at runtime.
- Authentication and authorization are handled externally (e.g., by an API gateway) and are out of scope for this service.
- The `productToken` is generated by the client, not by the service — the service only validates its format and uniqueness.
- Soft-deleted products retain their `productToken` uniqueness constraint (a new product cannot reuse a soft-deleted product's token).
- The service uses a relational database for persistence; the specific database engine is an implementation detail.
- There is no requirement for full-text search, filtering, or sorting of products beyond pagination in the initial scope.
- The service does not need to support bulk operations (batch create, update, or delete) in the initial scope.
- Decimal precision of `(10, 4)` for price means up to 6 digits before the decimal point and 4 digits after.
