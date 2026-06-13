# Tasks: Product CRUD API

**Input**: Design documents from `specs/001-product-crud-api/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Required by constitution (Principle III: Test-First Development). Unit tests for service layer, e2e tests for HTTP lifecycle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Tests co-located with source files (`.spec.ts` suffix)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and development environment

- [x] T001 Initialize NestJS project with TypeScript and install all production and dev dependencies per plan.md
- [x] T002 [P] Configure tsconfig.json with strict mode enabled
- [x] T003 [P] Configure ESLint and Prettier with project rules
- [x] T004 [P] Create docker-compose.yml with MySQL service for local development and testing
- [x] T005 [P] Create .env and .env.example with environment variables (NODE_ENV, APP_ENV, PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
- [x] T006 [P] Configure nest-cli.json with @nestjs/swagger CLI plugin and introspectComments option
- [x] T007 [P] Configure husky and lint-staged for pre-commit linting and formatting checks
- [x] T008 [P] Configure Jest with clearMocks, resetMocks, restoreMocks, and npm scripts (test, test:unit, test:e2e, test:watch) in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create AppModule with ConfigModule (.env loading) and SequelizeModule.forRoot (MySQL, synchronize: true) in src/app.module.ts
- [x] T010 Configure main.ts bootstrap with global ValidationPipe (whitelist, transform), URI versioning (prefix: api, defaultVersion: 1), SwaggerModule (/docs, /docs-json), and nestjs-pino logger in src/main.ts
- [x] T011 [P] Create Product Sequelize model with all fields, paranoid: true, timestamps: true, and unique index on productToken in src/products/products.model.ts
- [x] T012 [P] Create createMock test utility (PartialDeep type + createMock function) in src/test-utils/create-mock.ts
- [x] T013 Create ProductResponseDto with constructor mapping from Product model in src/products/dtos/products.response.dto.ts
- [x] T014 Create PaginationResponseDto with products array, totalItems, currentPage, totalPages, and limit in src/products/dtos/products.response.dto.ts
- [x] T015 Create ProductsService skeleton class with injected Product model in src/products/products.service.ts
- [x] T016 Create ProductsController skeleton class with injected ProductsService in src/products/products.controller.ts
- [x] T017 Create ProductsModule wiring ProductsController, ProductsService, and SequelizeModule.forFeature([Product]) in src/products/products.module.ts
- [x] T018 [P] Setup e2e test file with testcontainers MySQL bootstrap (beforeAll), NestJS app initialization, and table truncation (afterEach) in e2e/products.spec.ts
- [x] T019 [P] Setup unit test file with mocked Product model using createMock and NestJS Test.createTestingModule in src/products/products.service.spec.ts
- [x] T020 [P] Configure GitHub Actions CI workflow (install, build, test, lint, format) in .github/workflows/ci.yml

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Create a New Product (Priority: P1) 🎯 MVP

**Goal**: Clients can create a product with name, productToken, price, and stock and receive a complete product representation

**Independent Test**: POST a valid product payload and verify 201 response with all fields; POST invalid payloads and verify 400; POST duplicate productToken and verify 409

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Write unit tests for ProductsService.create: valid creation, duplicate productToken (ConflictException) in src/products/products.service.spec.ts
- [x] T022 [P] [US1] Write e2e tests for POST /api/v1/products: valid creation (201), missing fields (400), empty name (400), negative price (400), price exceeding decimal(10,4) max (400), negative stock (400), invalid UUID (400), duplicate productToken (409) in e2e/products.spec.ts

### Implementation for User Story 1

- [x] T023 [P] [US1] Create CreateProductRequestDto with @IsString, @IsNotEmpty, @IsUUID('4'), @IsNumber({maxDecimalPlaces:4}), @Min(0), @Max(999999.9999), @IsInt decorators in src/products/dtos/products.request.dto.ts
- [x] T024 [US1] Implement create method in ProductsService: persist product, catch unique constraint violation and throw ConflictException in src/products/products.service.ts
- [x] T025 [US1] Implement POST /products endpoint in ProductsController: accept CreateProductRequestDto body, delegate to service, return 201 with ProductResponseDto in src/products/products.controller.ts

**Checkpoint**: User Story 1 is fully functional — product creation works end-to-end with validation and conflict detection

---

## Phase 4: User Story 2 — List Products with Pagination (Priority: P1)

**Goal**: Clients can retrieve a paginated list of active products with configurable page and limit parameters

**Independent Test**: Create multiple products, request pages with various page/limit values, verify pagination metadata and soft-deleted exclusion

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T026 [P] [US2] Write unit tests for ProductsService.findAll: returns paginated results, correct totalItems/totalPages, default page/limit, empty results in src/products/products.service.spec.ts
- [x] T027 [P] [US2] Write e2e tests for GET /api/v1/products: default pagination (200), custom page/limit (200), empty list (200), page exceeding total (200 empty), invalid limit (400), invalid page (400), excludes soft-deleted (200) in e2e/products.spec.ts

### Implementation for User Story 2

- [x] T028 [P] [US2] Create GetProductsQueryDto with @IsOptional, @IsInt, @Min(1), @Max(100), @Type(() => Number) decorators and defaults (page=1, limit=20) in src/products/dtos/products.request.dto.ts
- [x] T029 [US2] Implement findAll method in ProductsService with findAndCountAll, offset/limit calculation, and PaginationResponseDto mapping in src/products/products.service.ts
- [x] T030 [US2] Implement GET /products endpoint in ProductsController: accept GetProductsQueryDto query params, delegate to service, return 200 with PaginationResponseDto in src/products/products.controller.ts

**Checkpoint**: User Stories 1 AND 2 are functional — clients can create and list products with pagination

---

## Phase 5: User Story 3 — Retrieve a Single Product (Priority: P2)

**Goal**: Clients can retrieve a specific product by its ID

**Independent Test**: Create a product, retrieve it by ID and verify all fields; request non-existent ID and verify 404; request soft-deleted product and verify 404

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T031 [P] [US3] Write unit tests for ProductsService.findOne: product found, product not found (NotFoundException), soft-deleted product (NotFoundException) in src/products/products.service.spec.ts
- [x] T032 [P] [US3] Write e2e tests for GET /api/v1/products/:id: existing product (200), non-existent product (404), soft-deleted product (404), invalid id format e.g. string (400) in e2e/products.spec.ts

### Implementation for User Story 3

- [x] T033 [US3] Implement findOne method in ProductsService: find by primary key, throw NotFoundException if not found in src/products/products.service.ts
- [x] T034 [US3] Implement GET /products/:id endpoint in ProductsController: accept id param with ParseIntPipe, delegate to service, return 200 with ProductResponseDto in src/products/products.controller.ts

**Checkpoint**: User Stories 1, 2, AND 3 are functional — full read path for products is complete

---

## Phase 6: User Story 4 — Update Product Stock (Priority: P2)

**Goal**: Clients can update the stock quantity of an existing active product

**Independent Test**: Create a product, update stock, verify new stock value and updatedAt change; attempt on non-existent/soft-deleted product and verify 404; send invalid stock and verify 400

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T035 [P] [US4] Write unit tests for ProductsService.updateStock: successful update with updatedAt change, product not found (NotFoundException), soft-deleted product (NotFoundException) in src/products/products.service.spec.ts
- [x] T036 [P] [US4] Write e2e tests for PUT /api/v1/products/:id/stock: valid update (200), stock=0 boundary value (200), negative stock (400), missing stock field (400), non-existent product (404), soft-deleted product (404), invalid id format e.g. string (400) in e2e/products.spec.ts

### Implementation for User Story 4

- [x] T037 [P] [US4] Create UpdateProductStockRequestDto with @IsInt, @Min(0) decorators for stock field in src/products/dtos/products.request.dto.ts
- [x] T038 [US4] Implement updateStock method in ProductsService: find product, update stock, save, return updated product in src/products/products.service.ts
- [x] T039 [US4] Implement PUT /products/:id/stock endpoint in ProductsController: accept id param with ParseIntPipe and UpdateProductStockRequestDto body, delegate to service, return 200 with ProductResponseDto in src/products/products.controller.ts

**Checkpoint**: User Stories 1-4 are functional — full CRUD minus delete is complete

---

## Phase 7: User Story 5 — Soft-Delete a Product (Priority: P3)

**Goal**: Clients can soft-delete a product; the operation is idempotent (always returns 204)

**Independent Test**: Create a product, delete it (204), verify it no longer appears in listing or by-ID retrieval; delete again (204 idempotent); delete non-existent (204 idempotent)

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T040 [P] [US5] Write unit tests for ProductsService.remove: successful soft-delete, already-deleted product (idempotent 204), non-existent product (idempotent 204) in src/products/products.service.spec.ts
- [ ] T041 [P] [US5] Write e2e tests for DELETE /api/v1/products/:id: existing product (204), already-deleted product (204), non-existent product (204), invalid id format e.g. string (400), verify product excluded from GET after delete in e2e/products.spec.ts

### Implementation for User Story 5

- [ ] T042 [US5] Implement remove method in ProductsService: attempt destroy, return void regardless of affected rows (idempotent) in src/products/products.service.ts
- [ ] T043 [US5] Implement DELETE /products/:id endpoint in ProductsController: accept id param with ParseIntPipe, delegate to service, return 204 No Content in src/products/products.controller.ts

**Checkpoint**: All 5 user stories are functional — full CRUD with soft-delete is complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final quality checks

- [ ] T044 [P] Add JSDoc comments to all classes and public methods in src/products/ and src/app.module.ts
- [ ] T045 [P] Verify OpenAPI documentation is generated correctly at /docs and /docs-json endpoints
- [ ] T046 Run quickstart.md validation scenarios against running application to verify all endpoints
- [ ] T047 [P] Verify test coverage: confirm every functional requirement (FR-001 through FR-019) has at least one corresponding test case across unit and e2e test files (SC-008)
- [ ] T048 [P] Final typecheck (npm run typecheck), lint (npm run lint), and format (npm run format) pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories should proceed in priority order: P1 (US1, US2) → P2 (US3, US4) → P3 (US5)
  - Within same priority, stories can potentially be parallelized (different service/controller methods)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — independent of US1 (different endpoint)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — independent of other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — independent of other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) — independent of other stories

### Within Each User Story (TDD Cycle)

1. Tests MUST be written FIRST and MUST FAIL before implementation
2. Unit test and e2e test can be written in parallel (different files)
3. Request DTO creation can be parallel with test writing (different files)
4. Service implementation depends on: unit tests written + DTO created
5. Controller implementation depends on: e2e tests written + service implemented
6. Story complete when all tests pass

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T008)
- Foundational: T011, T012, T018, T019, T020 are independent and can run in parallel
- Within each story: unit tests [P] and e2e tests [P] can be written simultaneously
- Within each story: DTO creation [P] can happen while tests are written
- US1 and US2 (both P1) can be parallelized — different endpoints, different DTOs
- US3 and US4 (both P2) can be parallelized — different endpoints, different DTOs

---

## Parallel Example: User Story 1

```text
Time →
─────────────────────────────────────────────────────────
Worker A: T021 (unit tests) ──→ T024 (service impl) ──→
Worker B: T022 (e2e tests)  ──→ T025 (controller impl)
Worker C: T023 (DTO)        ──→
─────────────────────────────────────────────────────────
Gate: T024 depends on T021 + T023
Gate: T025 depends on T022 + T024
```

## Implementation Strategy

**MVP Scope**: User Story 1 (Create a New Product) — after completing Phase 1 + Phase 2 + Phase 3, the service can create products with full validation, conflict detection, and persistence.

**Incremental Delivery**:

1. Phase 1-2: Project skeleton with database, logging, docs infrastructure
2. Phase 3 (US1): MVP — product creation
3. Phase 4 (US2): Add listing with pagination
4. Phase 5 (US3): Add single product retrieval
5. Phase 6 (US4): Add stock management
6. Phase 7 (US5): Add soft-delete lifecycle
7. Phase 8: Polish, documentation, final validation
