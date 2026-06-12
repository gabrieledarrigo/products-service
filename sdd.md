# SDD

## Constitution

This application is a microservice called "products-service" for an e-commerce platform.
These are the core principles guiding the development of the service:

1. Simplicity. This is a simple CRUD microservice. No over-engineering, no unnecessary abstractions. Keep the codebase clean and easy to understand.

2. Type Safety. Strict typing across the entire codebase. Use types to ensure runtime safety and for documentation.

3. Test-First Development. TDD with red-green-refactor. Unit tests for service logic, integration tests for the entire HTTP lifecycle.

4. Explicit Error Handling. Meaningful HTTP status codes and error messages. Never expose internal errors or stack traces to clients. Validate at the API boundary the request payloads, but also handle business logic validation in the service layer.

5. Convention Over Configuration. Follow the framework conventions. Use dependency injection exclusively. Incapsulate the minimal business logic in the service layer, keeping controllers thin.

6. Documentation. Generate and maintain comprehensive API documentation. Document all endpoints, request/response schemas, and error responses. Keep documentation up to date with code changes.

## Specification

"products-service" is a RESTful CRUD API for managing products in an e-commerce platform.
The service manage products with the following properties:

- `id`: `integer`, auto-incremented unique identifier for each product
- `productToken`: `string`, a UUID v4 token for the product
- `name`: `string`, required, non-empty name of the product
- `price`: `decimal`, decimal(10, 4), non negative, representing the price of the product
- `stock`: `integer`, a non negative integer representing the available stock quantity of the product
- `createdAt`: `timestamp`, the timestamp when the product was created
- `updatedAt`: `timestamp`, the timestamp when the product was last updated
- `deletedAt`: `timestamp`, the timestamp when the product was soft-deleted (null if not deleted)

The API exposes the following endpoints:

### `POST /products`

Create a new product. The client must provide a JSON payload with the following properties:

- `name`: `string`, required, non-empty
- `productToken`: `string`, required, UUID v4
- `price`: `decimal`, decimal(10, 4), non negative
- `stock`: `integer`, a non negative integer

The endpoint returns:

- `201 Created` status code with the created product in the response body. The response body has the same properties as described above, including `id`, `createdAt` and `updatedAt` timestamps.
- `400 Bad Request` if the request payload is invalid or missing required fields.
- `409 Conflict` if a product with the same `productToken` already exists.

### `GET /products`

Returns a list of all products.

The endpoint supports pagination through the following query parameters:

- `page`: `integer`, optional, default is 1, minimum 1, representing the page number to retrieve
- `limit`: `integer`, optional, default is 20, minimum 1, maximum 100, representing the number of products to return per page

The endpoint returns a paginated response with the following properties:

- `products`: an array of product objects, including `id`, `productToken`, `name`, `price`, `stock`, `createdAt` and `updatedAt` timestamps
- `totalItems`: `integer`, total number of products
- `currentPage`: `integer`, current page number
- `totalPages`: `integer`, total number of pages
- `limit`: `integer`, number of products per page

If there are no products, the endpoint returns an empty `products` array with a `200 OK` status code.

### `GET /products/:id`

Returns the product with the specified `id`.

The endpoint returns a JSON object with the following properties:

- `id`: `integer`
- `productToken`: `string`
- `name`: `string`
- `price`: `decimal`
- `stock`: `integer`
- `createdAt`: `timestamp`
- `updatedAt`: `timestamp`

If the product with the specified `id` does not exist or has been soft-deleted, the endpoint returns a `404 Not Found` status code.

### `PUT /products/:id/stock`

Updates the stock quantity of the product with the specified `id`. The client must provide a JSON payload with the following property:

- `stock`: `integer`, required, non-negative

The endpoint returns:

- `200 OK` status code with the updated product in the response body.
- `400 Bad Request` if the request payload is invalid or missing required fields.
- `404 Not Found` if the product with the specified `id` does not exist or has been soft-deleted.

### `DELETE /products/:id`

Soft-deletes the product with the specified `id`. The endpoint is idempotent: deleting a product or an already deleted product returns always `204 No Content` status code.
