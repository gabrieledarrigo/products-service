# Products Service

[![CI](https://github.com/gabrieledarrigo/products-service/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrieledarrigo/products-service/actions/workflows/ci.yml)

> A RESTful CRUD API for managing products in an e-commerce platform.

## Quickstart

Install the project dependencies:

```bash
npm install
```

Run the MySQL database using Docker Compose:

```bash
docker compose up -d
```

Copy the `.env.example` file to `.env` and adjust the database connection settings if necessary:

```bash
cp .env.example .env
```

Run the application in development mode:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000/api/v1/products`.

OpenAPI documentation is available at `http://localhost:3000/docs`.

To run tests:

```bash
npm test
```

The test suite includes unit and e2e tests covering all API endpoints and error scenarios.  
E2E tests use [testcontainers](https://node.testcontainers.org/) to spin up a real MySQL database for integration testing.

## API Usage

### Create a product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Widget", "productToken": "550e8400-e29b-41d4-a716-446655440000", "price": 19.99, "stock": 100}'
```

Response (`201 Created`):

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget",
  "price": 19.99,
  "stock": 100,
  "createdAt": "2026-06-13T10:00:00.000Z",
  "updatedAt": "2026-06-13T10:00:00.000Z"
}
```

### List products (paginated)

```bash
curl http://localhost:3000/api/v1/products?page=1&limit=10
```

Response (`200 OK`):

```json
{
  "products": [
    {
      "id": 1,
      "productToken": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Widget",
      "price": 19.99,
      "stock": 100,
      "createdAt": "2026-06-13T10:00:00.000Z",
      "updatedAt": "2026-06-13T10:00:00.000Z"
    }
  ],
  "totalItems": 1,
  "currentPage": 1,
  "totalPages": 1,
  "limit": 10
}
```

### Get a product

```bash
curl http://localhost:3000/api/v1/products/1
```

Response (`200 OK`):

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget",
  "price": 19.99,
  "stock": 100,
  "createdAt": "2026-06-13T10:00:00.000Z",
  "updatedAt": "2026-06-13T10:00:00.000Z"
}
```

### Update product stock

```bash
curl -X PUT http://localhost:3000/api/v1/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'
```

Response (`200 OK`):

```json
{
  "id": 1,
  "productToken": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget",
  "price": 19.99,
  "stock": 50,
  "createdAt": "2026-06-13T10:00:00.000Z",
  "updatedAt": "2026-06-13T10:05:00.000Z"
}
```

### Delete a product

```bash
curl -X DELETE http://localhost:3000/api/v1/products/1
```

Response: `204 No Content`

For the full interactive API documentation, see the [Swagger UI](http://localhost:3000/docs).

## How the project was built

The project was built applying specification-driven development (SDD) with [Spec Kit](https://github.com/github/spec-kit).  

[SDD.md](./SDD.md) reports the prompts I wrote to drive each phase of development.  

- [Constitution](./SDD.md#Constitution) reports the principles I decided to apply for the development of the project, especially focusing on simplicity, type safety, and convention over configuration
- [Specification](./SDD.md#Specification) defines the specs I used to instruct the model with `/speckit.specify`. Read it to understand the design decisions I made in terms of API design, data model, and validation
- [Plan](./SDD.md#Plan) reports the project structure and the technical decisions I made to create the implementation plan with `/speckit.plan` and the subsequent implementation steps with `/speckit.tasks`
