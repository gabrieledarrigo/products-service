# Research: Product CRUD API

**Date**: 2026-06-12 | **Feature**: [spec.md](spec.md)

## Overview

All technical decisions were provided explicitly in the feature description. No NEEDS CLARIFICATION items were identified in the Technical Context. This research documents the rationale for each technology choice and best practices to follow during implementation.

## Technology Decisions

### 1. Sequelize Paranoid Mode for Soft Deletes

**Decision**: Use Sequelize's built-in `paranoid: true` option on the Product model.

**Rationale**: Sequelize's paranoid mode automatically manages the `deletedAt` timestamp, excludes soft-deleted records from default queries, and provides `destroy()` / `restore()` methods out of the box. This eliminates the need for custom soft-delete logic in the service layer.

**Alternatives considered**:

- Manual `deletedAt` column management with custom scopes — rejected because paranoid mode provides this natively with less code.
- Hard deletes with an audit table — rejected because the spec explicitly requires soft-delete behavior.

**Best practices**:

- Use `paranoid: true` in the `@Table` decorator options
- For the idempotent DELETE endpoint, catch `NotFoundException` when the product doesn't exist and still return 204
- The unique index on `productToken` applies across all records including soft-deleted ones, since paranoid mode does not affect unique constraints

### 2. Sequelize Sync vs Migrations

**Decision**: Use Sequelize's `synchronize: true` (auto-sync) for schema management.

**Rationale**: The spec explicitly states "Migrations are configured in NestJS with synchronization enabled." For a greenfield microservice with a single model, auto-sync simplifies development without migration overhead.

**Alternatives considered**:

- Manual migrations with sequelize-cli — rejected for initial development as it adds overhead for a single-table schema. Can be introduced later when schema changes become non-trivial.

**Best practices**:

- Set `sync: { alter: true }` or `synchronize: true` in the SequelizeModule configuration
- Be aware that auto-sync should be reconsidered for production environments with data that cannot be lost

### 3. class-validator with ValidationPipe

**Decision**: Use class-validator decorators on request DTOs with a globally-configured ValidationPipe.

**Rationale**: NestJS's ValidationPipe integrates natively with class-validator and class-transformer, providing declarative validation at the API boundary. The `whitelist: true` option strips unknown properties, and `transform: true` auto-converts query string parameters to their typed equivalents.

**Alternatives considered**:

- Manual validation in controllers — rejected as it violates the convention-over-configuration principle and creates boilerplate.
- Joi/Zod schemas — rejected because class-validator is the NestJS convention and integrates with the Swagger CLI plugin for automatic documentation.

**Best practices**:

- Configure ValidationPipe globally in `main.ts` with `whitelist: true` and `transform: true`
- Use definite assignment assertion (`!`) on request DTO properties since they are populated by the framework
- Use `@IsNotEmpty()`, `@IsString()`, `@IsUUID('4')`, `@IsNumber()`, `@Min(0)`, `@IsInt()` decorators
- For decimal price validation, use `@IsNumber({ maxDecimalPlaces: 4 })` with `@Min(0)`

### 4. NestJS URI Versioning

**Decision**: Use URI versioning with prefix `api` and default version `1`, resulting in `/api/v1/products`.

**Rationale**: URI versioning is the most explicit and RESTful versioning strategy. NestJS supports it natively via `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`.

**Alternatives considered**:

- Header-based versioning — rejected as less discoverable and harder to test manually.
- No versioning — rejected because the spec explicitly requires `/api/v1/` prefix.

**Best practices**:

- Set `app.setGlobalPrefix('api')` before `app.enableVersioning()`
- Set `defaultVersion: '1'` so all controllers inherit version 1 by default

### 5. testcontainers for E2E Tests

**Decision**: Use @testcontainers/mysql to spin up a real MySQL container for e2e tests.

**Rationale**: Testing against a real database ensures ORM queries, constraints (unique index on productToken), and SQL behavior (paranoid soft-deletes) work correctly. SQLite substitution would miss MySQL-specific behaviors like decimal precision handling.

**Alternatives considered**:

- SQLite in-memory database — rejected because Sequelize dialect differences could mask MySQL-specific bugs (e.g., decimal handling, unique constraint error codes).
- Shared test database — rejected because it breaks test isolation.

**Best practices**:

- Start the MySQL container once per test suite (in `beforeAll`), not per test
- Truncate the `products` table in `afterEach` to maintain test isolation
- Use `GenericContainer` or `MySqlContainer` from `@testcontainers/mysql`
- Set a reasonable startup timeout for CI environments

### 6. nestjs-pino for Structured Logging

**Decision**: Use nestjs-pino for JSON-formatted structured logging.

**Rationale**: Pino is a high-performance JSON logger. nestjs-pino integrates it as NestJS middleware, automatically logging all HTTP requests with method, URL, status code, and response time.

**Alternatives considered**:

- Winston — rejected because pino is faster and nestjs-pino provides tighter NestJS integration.
- Console.log — rejected because unstructured logs are unsuitable for production observability.

**Best practices**:

- Configure log level based on `APP_ENV`: `debug` for local, `log` for production
- Disable `debug` level in production as specified
- Use `LoggerModule.forRoot()` in AppModule

### 7. @nestjs/swagger CLI Plugin

**Decision**: Use the NestJS Swagger CLI plugin for automatic OpenAPI documentation generation from TypeScript types.

**Rationale**: The CLI plugin uses TypeScript reflection to automatically generate Swagger decorators, reducing boilerplate. Controllers and DTOs do not need explicit `@ApiProperty()` decorators in most cases.

**Alternatives considered**:

- Manual `@ApiProperty()` decorators on all DTOs — rejected because the CLI plugin automates this and the spec explicitly states "Controllers and DTOs must not be decorated if not necessary."

**Best practices**:

- Enable the plugin in `nest-cli.json` under `compilerOptions.plugins`
- Configure `"@nestjs/swagger"` plugin with `introspectComments: true` to pick up JSDoc comments
- Expose docs at `/docs` and JSON at `/docs-json` (NestJS default path with `.json` suffix is `/docs-json`)
- Set up SwaggerModule in `main.ts` with title, description, and version

## Idempotent DELETE Implementation

**Decision**: The DELETE endpoint catches all "not found" scenarios and returns 204 regardless.

**Rationale**: The spec states the endpoint is idempotent — deleting a non-existent or already-deleted product always returns 204. This means the service layer should attempt to find and soft-delete the product, but treat "not found" as a success case rather than an error.

**Implementation approach**:

- Use Sequelize's `destroy()` which returns the number of affected rows
- If 0 rows affected (product doesn't exist or already deleted), still return 204
- No need to check existence first — just attempt the delete and return 204 unconditionally
