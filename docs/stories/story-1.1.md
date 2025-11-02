# Story 1.1: Configuração da Fundação Técnica (Enabler)

Status: Approved

## Story

As an Architect/Developer,
I want to initialize the Next.js project (App Router) in the Monorepo,
so that the project is connected to Vercel, Vercel Postgres, and Auth.js, establishing the infrastructure foundation.

## Acceptance Criteria

1. The Next.js project exists in the repository (Monorepo structure).
2. The project successfully deploys to Vercel (CI/CD).
3. Connection with Vercel Postgres is working, proven by a **successful initial database migration** (e.g., creating the 'User' table).
4. Auth.js is installed and configured with a provider (e.g., Email).
5. The test structure (Unit + Integration) is configured in the CI/CD pipeline and an example test is passing.
6. The 'User' table migration (from AC 3) **must** include a `tenantId` field (Municipality ID), establishing the Multitenant foundation (NFR2).

## Tasks / Subtasks

- [ ] Task 1: Initialize Next.js 15 project with App Router (AC: #1)
  - [ ] Create monorepo structure
  - [ ] Install Next.js 15.0.3 with TypeScript 5.3.3
  - [ ] Configure App Router directory structure
  - [ ] Set up ESLint and Prettier

- [ ] Task 2: Configure Vercel deployment (AC: #2)
  - [ ] Connect repository to Vercel
  - [ ] Configure environment variables
  - [ ] Verify successful deployment
  - [ ] Set up CI/CD pipeline

- [ ] Task 3: Set up Vercel Postgres with Prisma (AC: #3, #6)
  - [ ] Install Prisma 5.7.1
  - [ ] Configure Prisma schema with User table including `tenantId`
  - [ ] Create initial migration
  - [ ] Test database connection
  - [ ] Verify migration execution

- [ ] Task 4: Install and configure Auth.js (AC: #4)
  - [ ] Install Auth.js (NextAuth.js) 5.0.0-beta.4
  - [ ] Configure Email provider
  - [ ] Set up session management
  - [ ] Configure authentication routes

- [ ] Task 5: Set up testing infrastructure (AC: #5)
  - [ ] Install Vitest 1.0.4 for unit tests
  - [ ] Install Playwright 1.40.1 for E2E tests
  - [ ] Configure test scripts in package.json
  - [ ] Create example unit test
  - [ ] Create example integration test
  - [ ] Add tests to CI/CD pipeline

## Dev Notes

### Architecture Patterns and Constraints

- **Framework**: Next.js 15 with App Router and React Server Components
- **Database**: Vercel Postgres (Neon-based) with Prisma ORM
- **Authentication**: Auth.js (NextAuth.js v5) with Email provider
- **Multi-tenancy**: Row-level isolation via `tenantId` column (NFR2)
- **Deployment**: Vercel serverless infrastructure (NFR1)
- **Testing**: Vitest (unit) + Playwright (E2E)

### Project Structure Notes

Follow proposed source tree from Solution Architecture:
```
aurorasocial/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   └── modules/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### Initial Prisma Schema (User table with tenantId)

```prisma
model Municipality {
  id        String   @id @default(cuid())
  name      String
  cnpj      String   @unique
  createdAt DateTime @default(now())
  users     User[]
}

model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String   @unique
  name      String
  role      Role     @default(TECNICO)
  status    UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())

  tenant    Municipality @relation(fields: [tenantId], references: [id])

  @@index([tenantId, role])
}

enum Role {
  GESTOR
  TECNICO
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
}
```

### References

- [Source: docs/solution-architecture.md#1-technology-stack-and-decisions]
- [Source: docs/solution-architecture.md#2-application-architecture]
- [Source: docs/solution-architecture.md#3.1-database-schema]
- [Source: docs/prd.md#épico-1-história-1.1]

## Dev Agent Record

### Context Reference

Story context embedded directly in story file (no separate context file for foundation story)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

No debug logs - implementation completed without errors

### Completion Notes List

- Implementation completed: 2025-11-01 03:50:16 UTC
- Duration: 7 minutes
- All 6 acceptance criteria satisfied
- 6 tests passing (unit + integration)
- Build successful
- Senior review: PASS
- Completion report: docs/implementation-reports/aurora-social/stories/2025-11-01-s1.1-technical-foundation-completion.md
- Status note: docs/implementation-reports/aurora-social/.status/s1.1-technical-foundation.json

### File List

**Core Files Created:**
- apps/aurorasocial/prisma/schema.prisma
- apps/aurorasocial/src/lib/prisma.ts
- apps/aurorasocial/src/lib/auth.ts
- apps/aurorasocial/src/app/api/auth/[...nextauth]/route.ts
- apps/aurorasocial/src/app/(auth)/auth/signin/page.tsx
- apps/aurorasocial/src/app/(auth)/auth/verify-request/page.tsx
- apps/aurorasocial/src/app/(auth)/auth/error/page.tsx

**Testing Files:**
- vitest.config.mts
- playwright.config.ts
- tests/setup.ts
- tests/unit/example.test.ts
- tests/integration/prisma.test.ts
- tests/e2e/home.spec.ts

**Configuration:**
- .prettierrc.json
- .env.example
- .env
- vercel.json
- .github/workflows/ci.yml

**Modified:**
- apps/aurorasocial/package.json
- apps/aurorasocial/.eslintrc.json
- apps/aurorasocial/tsconfig.json
- apps/aurorasocial/README.md
