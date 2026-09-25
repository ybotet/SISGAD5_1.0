# Contributing to SISGAD5

Thank you for your interest in contributing to SISGAD5! This document outlines how to contribute.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Releases](#releases)

## Code of Conduct
- Be respectful and constructive.
- Assume good intentions.
- Help others learn and grow.

## Getting Started

```bash
git clone https://github.com/ybotet/SISGAD5_1.0.git
cd SISGAD5_1.0
cp backend-users/.env.example backend-users/.env
cp backend-mp/.env.example backend-mp/.env
cp backend-materiales-go/.env.example backend-materiales-go/.env
docker compose up -d
```

## Project Structure

See [ESTRUCTURA.md](./ESTRUCTURA.md) for the full project structure.

| Component | Path | Description |
|-----------|------|-------------|
| Frontend | `./frontend/` | React 18 + Vite + TS |
| API Gateway | `./api-gateway/` | Node.js + Express |
| Users Service | `./backend-users/` | Node.js + Sequelize |
| MP Service | `./backend-mp/` | Node.js + Sequelize + Zod |
| Materials Service | `./backend-materiales-go/` | Go + Gin + GORM |
| Monitoring | `./monitoring/` | Prometheus, Grafana, Loki |
| Scripts | `./scripts/` | Automation utilities |
| E2E Tests | `./tests/e2e/` | Integration tests |

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/descriptive-name
   ```

2. Make your changes following the coding standards below.

3. Run tests:
   ```bash
   make test-all
   ```

4. Commit using Conventional Commits:
   ```
   feat: add user role management
   fix: resolve deadlock in stock validation
   docs: update API reference
   ```

5. Push and create a Pull Request.

## Coding Standards

### Node.js Services
- **Linting:** ESLint + Prettier
- **Style:** camelCase for variables, PascalCase for classes
- **Validation:** Zod schemas for all request bodies
- **Structure:** `controllers → services → repositories → models`

### Go Service
- **Linting:** golangci-lint
- **Style:** snake_case for variables, PascalCase for exported
- **Architecture:** Domain → Application → Infrastructure → Presentation
- **Imports:** Standard lib → external → local

### Frontend
- **Linting:** ESLint + Prettier
- **Style:** camelCase for JS, kebab-case for CSS classes
- **Components:** Reusable, typed props
- **State:** Zustand or Context API

## Testing

| Type | Command | Coverage Target |
|------|---------|-----------------|
| Unit (JS) | `npm test` | 70% |
| Unit (Go) | `go test ./...` | 85% |
| Integration | `make test-integration` | - |
| E2E | `npm run test:e2e` | - |
| Load | `make test-load` | - |

All tests must pass before merging.

## Pull Requests

1. Ensure all tests pass (CI will check)
2. Update documentation if needed (`docs/` folder)
3. Follow the [PR template](./.github/PULL_REQUEST_TEMPLATE.md)
4. Get at least 1 review from a maintainer
5. Ensure CI status is green

## Releases

Releases are managed by maintainers. Use Semantic Versioning (SemVer).

See [CHANGELOG.md](./CHANGELOG.md) for details.

## Questions?

Open an issue or contact the team.