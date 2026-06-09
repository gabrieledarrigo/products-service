<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial creation)
  Modified principles: N/A (initial)
  Added sections:
    - Core Principles (6 principles)
    - Architecture Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
      (Constitution Check section is dynamically resolved)
    - .specify/templates/spec-template.md ✅ no changes needed
      (generic template, compatible with all principles)
    - .specify/templates/tasks-template.md ✅ no changes needed
      (generic template, compatible with all principles)
  Follow-up TODOs: none
-->

# Products Service Constitution

## Core Principles

### I. Simplicity

This is a simple CRUD microservice. The codebase MUST remain clean,
simple, and easy to understand at all times.

- No over-engineering and no unnecessary abstractions
- Prefer straightforward implementations over clever solutions
- Every added layer or indirection MUST be justified by a concrete need
- YAGNI: do not build features or infrastructure speculatively

### II. Type Safety

Strict typing MUST be enforced across the entire codebase.

- All function signatures, parameters, and return types MUST be
  explicitly typed
- Use types to ensure compile-time safety and to serve as
  living documentation
- Avoid `any`, untyped generics, or loose type assertions
- Type definitions MUST accurately represent the domain model

### III. Test-First Development

TDD with the red-green-refactor cycle is mandatory for all
production code.

- Tests MUST be written before implementation
- Tests MUST fail (red) before writing production code
- Write the minimal code to make tests pass (green), then refactor
- Unit tests MUST cover service-layer business logic
- Integration tests MUST cover the entire HTTP request/response
  lifecycle
- No production code merges without corresponding test coverage

### IV. Explicit Error Handling

The service MUST return meaningful HTTP status codes and error
messages. Internal details MUST never leak to clients.

- Use appropriate HTTP status codes (400, 404, 409, 422, 500, etc.)
- Return structured, human-readable error messages
- Never expose stack traces, internal errors, or implementation
  details in API responses
- Validate request payloads at the API boundary (controllers)
- Handle business logic validation in the service layer
- All error paths MUST be tested

### V. Convention Over Configuration

Follow the framework's established conventions and patterns.

- Use dependency injection exclusively for wiring components
- Controllers MUST be thin: receive request, delegate to service,
  return response
- All business logic MUST live in the service layer
- Follow the framework's module and provider conventions
- Do not introduce custom patterns when the framework provides
  a standard approach

### VI. Documentation

API documentation MUST be comprehensive, accurate, and maintained
alongside the code.

- Generate API documentation from code annotations/decorators
- Document all endpoints with descriptions, parameters, and examples
- Document all request/response schemas including validation rules
- Document all error responses with status codes and error formats
- Documentation MUST be updated in the same commit as code changes
- Undocumented endpoints MUST NOT be merged

## Architecture Constraints

- **Layered architecture**: Controller → Service → Repository
  (when persistence is involved)
- **Single responsibility**: each module owns one domain concept
- **No cross-service calls**: this microservice operates on its own
  bounded context
- **DTOs at boundaries**: use dedicated DTOs for request/response
  payloads; do not expose internal entities directly
- **Dependency injection**: all dependencies MUST be injected, never
  instantiated directly within consuming classes

## Development Workflow

- **Branch-based development**: all work happens on feature branches
- **TDD cycle**: write failing test → implement → refactor → commit
- **Small commits**: each commit SHOULD represent one logical change
- **Code review**: all changes require review before merge
- **CI gate**: tests and linting MUST pass before merge is allowed

## Governance

This constitution is the authoritative source of development
principles for the products-service. All code contributions,
reviews, and architectural decisions MUST comply with these
principles.

- Amendments require documentation of the change, rationale, and
  impact assessment
- Version follows semantic versioning: MAJOR for principle
  removals/redefinitions, MINOR for additions/expansions, PATCH
  for clarifications
- Compliance is verified during code review; reviewers MUST
  reference relevant principles when requesting changes

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
