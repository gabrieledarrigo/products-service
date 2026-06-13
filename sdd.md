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

### `POST /api/v1/products`

Create a new product. The client must provide a JSON payload with the following properties:

- `name`: `string`, required, non-empty
- `productToken`: `string`, required, UUID v4
- `price`: `decimal`, decimal(10, 4), non negative
- `stock`: `integer`, a non negative integer

The endpoint returns:

- `201 Created` status code with the created product in the response body. The response body has the same properties as described above, including `id`, `createdAt` and `updatedAt` timestamps.
- `400 Bad Request` if the request payload is invalid or missing required fields.
- `409 Conflict` if a product with the same `productToken` already exists.

### `GET /api/v1/products`

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

### `GET /api/v1/products/:id`

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

### `PUT /api/v1/products/:id/stock`

Updates the stock quantity of the product with the specified `id`. The client must provide a JSON payload with the following property:

- `stock`: `integer`, required, non-negative

The endpoint returns:

- `200 OK` status code with the updated product in the response body.
- `400 Bad Request` if the request payload is invalid or missing required fields.
- `404 Not Found` if the product with the specified `id` does not exist or has been soft-deleted.

### `DELETE /api/v1/products/:id`

Soft-deletes the product with the specified `id`. The endpoint is idempotent: deleting a product or an already deleted product returns always `204 No Content` status code.

## Plan

The service is implemented with Typescript, NestJS, Sequelize, MySQL, docker compose for local development, Jest for testing and Swagger for API documentation.

### Dependencies

- `typescript`: for type safety and development.
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/sequelize`: NestJS framework dependencies
- `sequelize`, `sequelize-typescript`: Sequelize ORM for MySQL
- `mysql2`: MySQL driver for Sequelize
- `class-validator`, `class-transformer`: for request payload validation
- `jest`, `@nestjs/testing`, `supertest`, `testcontainers`, `@testcontainers/mysql`: for unit and end-to-end testing
- `@nestjs-pino`@ for logging in JSON format
- `@nestjs/swagger`: for API documentation generation
- `prettier`, `eslint`: for code formatting and linting
- `husky`, `lint-staged`: for pre-commit hooks to run linting and formatting checks

### Structure

The project uses the NestJS layered architecture consisting in a single module called `ProductsModule` with the following structure:

```src/
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.model.ts
│   ├── products.module.ts
│   ├── dtos/
│   │   ├── products.request.dto.ts
│   │   ├── products.response.dto.ts
│   └── ...
├── main.ts
├── app.module.ts
├── ...
```

## Database and data model

The database is MySQL and Sequelize is used as the ORM. Docker compose is used to manage the MySQL database in a containerized environment for the local development and testing.

The `Products` model is defined as a Sequelize model with the following properties:

- `id`: `integer`, auto-incremented unique identifier for each product
- `productToken`: `string`, a UUID v4 token for the product
- `name`: `string`, required, non-empty name of the product
- `price`: `decimal`, decimal(10, 4), non negative, representing the price of the product
- `stock`: `integer`, a non negative integer representing the available stock quantity of the product
- `createdAt`: `timestamp`, the timestamp when the product was created
- `updatedAt`: `timestamp`, the timestamp when the product was last updated
- `deletedAt`: `timestamp`, the timestamp when the product was soft-deleted (null if not deleted)

The following indexes are applied to the `products` table:

- Unique index on `productToken` to ensure uniqueness and optimize lookups by product token.

Configure the Sequelize model to use soft deletes by enabling the `paranoid` option, to automatically set the `deletedAt` timestamp when a product is deleted instead of permanently removing it from the database.
Migrations are configured in NestJS with `synchronization` enabled.

## DTOs and Validation

Request DTOs use `class-validator` decorators to enforce validation rules on incoming request payloads. Request DTOS don't provide a constructor, and every mandatory property is marked with the `!` operator to indicate that it will be initialized by the framework during validation.

All DTO properties (both request and response) MUST be declared `readonly`. DTOs are immutable data carriers — once populated by the framework (request DTOs) or the mapping constructor (response DTOs), their properties must not be reassigned.

Response DTOs are simple classes with a constructor that receives the domain model and maps its properties to the response format. This approach ensures that the response structure is consistent and decoupled from the internal domain model, allowing for flexibility in how data is presented to clients.

These are the DTOs used in the service:

- `CreateProductRequestDto`: for the `POST /api/v1/products` endpoint, with validation rules for each property.
- `UpdateProductStockRequestDto`: for the `PUT /api/v1/products/:id/stock` endpoint, with validation rules for the `stock` property.
- `ProductResponseDto`: for the response of all endpoints, mapping the domain model to the response format.

For pagination in the `GET /api/v1/products` endpoint, a `PaginationResponseDto` is used to structure the paginated response, including the list of products and pagination metadata with the following properties:

- `products`: an array of `ProductResponseDto` objects
- `totalItems`: `integer`, total number of products
- `currentPage`: `integer`, current page number
- `totalPages`: `integer`, total number of pages
- `limit`: `integer`, number of products per page

For query parameters validation in the `GET /api/v1/products` endpoint, a `GetProductsQueryDto` is used with validation rules for the `page` and `limit` query parameters.

Validation is applied globally with the `ValidationPipe` with the following configuration:

- `whitelist: true` to strip any properties that are not defined in the DTOs
- `transform: true` to automatically transform payloads to the expected types defined in the DTOs

`ValidationPipe` is applied globally in the `main.ts` file.

## Versioning

The application API endpoints are versioned using URI versioning through Nest.js enableVersioning method in the `main.ts` file. The default version is set to `1`. The default API prefix is set to `api`.

## Configuration

The application uses `dotenv` to manage environment variables for database connection and other configurations. The `.env` file defines the following variables.

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

The application reads the configuration using the `@nestjs/config` module and provides it to the Sequelize configuration in the `app.module.ts` file.

`NODE_ENV` is always set to production. `APP_ENV` is used to discriminate between these environments:

- `local`: for local development with docker compose
- `development`: for development deployment
- `production`: for production deployment

## Error Handling

Errors are exposed to clients by using NestJS's built-in HTTP exceptions.
Explicit error handling is implemented in the service layer; for example, when creating a product, check if a product with the same `productToken` already exists and throw a `ConflictException` if it does. When updating stock or deleting a product, check if the product exists and is not soft-deleted before performing the operation, throwing a `NotFoundException` if it doesn't exist.

## Logging

The application uses `nestjs-pino` for structured JSON logging.
All requests are logged with method, URL, status code, and response time. All errors are logged with their stack trace for debugging purposes, but stack traces are not exposed to clients in error responses.
Log levels:

- `error`
- `warn`
- `log`
- `debug` Disabled in the production environment

## Testing

Testing are written with Jest and `@nestjs/testing`. Jest is configured to clean, reset and restore mocks between each test globally. Every test file is named with the `.spec.ts` suffix and is located in the same directory as the file it tests.

Tests follow a clear _arrange_, _act_, _assert_ structure. Test structure uses one `describe` block per method with multiple `it` blocks for different test cases. Jest globals (`describe`, `it`, `expect`, `beforeAll`, `beforeEach`, `afterAll`, `afterEach`, `jest`) must be explicitly imported from `@jest/globals` instead of relying on ambient global types:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
```

For mocking objects, instead of casting, use the following utility:

```typescript
export type PartialDeep<T> = T extends object
  ? T extends Array<infer U>
    ? Array<PartialDeep<U>>
    : { [K in keyof T]?: PartialDeep<T[K]> }
  : T;

export function createMock<T extends object>(values?: PartialDeep<T>): T {
  return (values ?? {}) as T;
}
```

Unit tests are written for the service layer. End-to-end tests to cover the entire HTTP lifecycle using `supertest` with `INestApplication` and are written for the controller layer. For end-to-end tests, `testcontainers` must be used to spin up a MySQL container for testing against a real database instance. The testing database must be properly cleaned between tests to maintain test isolation by truncating the `products` table after each test.

## Documentation

### JSDoc Comments

All classes and methods must be documented with JSDoc comments, including descriptions of parameters, eventual errors, and return values.

### OpenAPI Documentation

The application exposes OpenAPI documentation with Swagger using the `@nestjs/swagger` module through the `/api/docs` endpoint. The `/api/docs.json` endpoint exposes the documentation in JSON format.

Controllers and DTOs must not be decorated if not necessary, since the `@nestjs/swagger` CLI plugin use Typescript reflection to generate the documentation dinamically:

https://docs.nestjs.com/openapi/cli-plugin#using-the-cli-plugin

## Development

The application is developed with a test-first approach, following the TDD cycle of red-green-refactor. All tests must pass before merging any code changes.

The repository should be configured with a pre-commit hook using `husky` and `lint-staged` to run linting and formatting checks before allowing commits.

### Commands

- `npm run typecheck`: checks the TypeScript types.
- `npm run build`: builds the application for production.
- `npm run test`: runs all tests
- `npm run test:unit`: runs all unit tests
- `npm run test:e2e`: runs all end-to-end tests
- `npm run test:watch`: runs tests in watch mode.
- `npm run lint`: runs ESLint to check for linting errors.
- `npm run format`: runs Prettier to check for code formatting issues.
- `npm run start:dev`: starts the application in development mode with hot-reloading.

### CI/CD

The application is built on every commit to the remote repository with a dedicated GitHub Action workflow. The workflow:

- Install dependencies
- Builds the application
- Runs all tests
- Lints the codebase with ESLint
- Check the code formatting with Prettier
