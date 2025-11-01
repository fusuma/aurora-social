# Epic Execution Plan: Aurora Social Platform

**Generated:** 2025-11-01 (Sonnet 4.5)
**Agent:** story-sequencer
**Total Stories:** 17
**Estimated Duration:** 68-85 hours
**Critical Path:** 51 hours

---

## Epic Overview

**Project:** Aurora Social - Municipal Social Assistance Platform
**Total Epics:** 3
**Total Stories:** 17

### Epic Distribution

| Epic | Title | Stories | Est. Hours | Status |
|------|-------|---------|------------|--------|
| Epic 1 | Foundation/Infrastructure | 6 (1.1-1.6) | 28-35h | Not Started |
| Epic 2 | Citizen Data Management | 7 (2.1-2.7) | 32-40h | Not Started |
| Epic 3 | Reports and Analytics | 4 (3.1-3.4) | 8-10h | Not Started |

---

## Story Summary

| Status | Count | Stories |
|--------|-------|---------|
| Not Started | 17 | All stories |
| Ready | 3 | 1.1, 1.2, 2.1 |
| Blocked | 14 | All others (dependencies) |
| Complete | 0 | None |

**Total:** 17 stories

---

## Dependency Graph

```text
EPIC 1: Foundation/Infrastructure
├── 1.1 (Technical Foundation) [NO DEPS]
│   ├── 1.2 (Login Screen) [depends: 1.1]
│   │   └── 1.3 (RBAC + Route Protection) [depends: 1.2]
│   │       ├── 1.4 (User Management View) [depends: 1.3]
│   │       ├── 1.5 (Invite User) [depends: 1.4]
│   │       └── 1.6 (Deactivate User) [depends: 1.4, 1.5]
│   └── 2.1 (Citizen Data Model) [parallel with 1.2] [depends: 1.1]

EPIC 2: Citizen Data Management
├── 2.1 (Data Model) [depends: 1.1]
│   ├── 2.2 (Search Screen) [depends: 1.3, 2.1]
│   │   ├── 2.3 (Profile View) [depends: 2.2]
│   │   │   ├── 2.4 (Profile Create/Edit) [depends: 2.3]
│   │   │   ├── 2.5 (Atendimento Modal) [depends: 2.3]
│   │   │   └── 2.6 (Attachments) [depends: 2.3]
│   │   └── 2.4 (Profile Create/Edit) [also from 2.2]
│   └── 2.7 (CSV Import) [depends: 1.3, 2.1, 2.4]

EPIC 3: Reports and Analytics
├── 3.1 (Reports API Foundation) [depends: 1.3, 2.1, 2.5]
│   ├── 3.2 (RMA Report Page) [depends: 3.1]
│   │   └── 3.3 (PDF/Excel Export) [depends: 3.2]
│   └── 3.4 (Dashboard) [depends: 3.1]
```

---

## Execution Sequence

### Batch 1: Foundation Layer (3 stories, can parallelize 2)

**Estimated Time:** 12-15 hours
**Prerequisites:** None
**Parallel Execution:** YES (1.2 and 2.1 after 1.1)

#### Story 1.1: Technical Foundation (Enabler)

- **Story ID:** story-1.1
- **Title:** Configuração da Fundação Técnica
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.1.md`
- **Status:** Not Started
- **Dependencies:** None
- **Blocks:** 1.2, 2.1, 1.3, 2.2, etc. (blocks EVERYTHING)
- **Estimated Time:** 6-8 hours
- **Complexity:** HIGH
- **Priority:** CRITICAL
- **Acceptance Criteria:** 6 ACs
- **Tasks:** 5 major tasks (Next.js setup, Vercel, Postgres, Auth.js, Testing)
- **Ready to Start:** YES

**Key Deliverables:**
- Next.js 15 + App Router initialized
- Vercel deployment working
- Postgres + Prisma with User/Municipality models
- Auth.js configured with Email provider
- Testing infrastructure (Vitest + Playwright)
- Multi-tenant foundation (tenantId in User table)

---

#### Story 1.2: Login Screen (PARALLEL with 2.1 after 1.1)

- **Story ID:** story-1.2
- **Title:** Implementação da Tela de Login
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.2.md`
- **Status:** Not Started
- **Dependencies:** 1.1 (Auth.js configuration)
- **Blocks:** 1.3 (RBAC)
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 5 ACs
- **Tasks:** 5 tasks (login page, form, Auth.js integration, email provider, session)
- **Ready to Start:** NO (blocked by 1.1)

**Key Deliverables:**
- Public login page route
- Email magic link authentication
- Session management
- Error handling
- WCAG AA compliant UI

---

#### Story 2.1: Citizen Data Model (PARALLEL with 1.2 after 1.1)

- **Story ID:** story-2.1
- **Title:** Modelagem de Dados do Cidadão (Enabler)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.1.md`
- **Status:** Not Started
- **Dependencies:** 1.1 (Prisma foundation)
- **Blocks:** 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** CRITICAL (enabler)
- **Acceptance Criteria:** 5 ACs
- **Tasks:** 7 tasks (Prisma models, migrations, indexes, middleware)
- **Ready to Start:** NO (blocked by 1.1)

**Key Deliverables:**
- Familia, Individuo, Atendimento, Anexo, ComposicaoFamiliar models
- CadÚnico-compatible schema
- Multi-tenant isolation (tenantId)
- Prisma middleware for auto-filtering
- Database migrations

---

### Batch 2: Authentication & Authorization (1 story)

**Estimated Time:** 4-5 hours
**Prerequisites:** Batch 1 complete (1.1, 1.2)
**Parallel Execution:** NO

#### Story 1.3: RBAC + Route Protection

- **Story ID:** story-1.3
- **Title:** Estabelecimento de Papéis (Roles) e Proteção de Rotas
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.3.md`
- **Status:** Not Started
- **Dependencies:** 1.1 (Prisma), 1.2 (Auth.js session)
- **Blocks:** 1.4, 1.5, 1.6, 2.2, 2.7, 3.1, 3.2, 3.4
- **Estimated Time:** 4-5 hours
- **Complexity:** MEDIUM
- **Priority:** CRITICAL (security foundation)
- **Acceptance Criteria:** 4 ACs
- **Tasks:** 5 tasks (role field, session update, middleware, layout guards, tRPC guards)
- **Ready to Start:** NO (blocked by 1.1, 1.2)

**Key Deliverables:**
- Role enum (GESTOR, TECNICO) in User model
- Role in Auth.js session
- Next.js middleware for route protection
- Layout-level RBAC guards
- tRPC procedure guards (gestorProcedure, tecnicoProcedure)

---

### Batch 3: User Management (3 stories)

**Estimated Time:** 8-10 hours
**Prerequisites:** Batch 2 complete (1.3)
**Parallel Execution:** NO (sequential: 1.4 → 1.5 → 1.6)

#### Story 1.4: User Management View

- **Story ID:** story-1.4
- **Title:** Visualização da Página de Gestão de Usuários
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.4.md`
- **Status:** Not Started
- **Dependencies:** 1.3 (RBAC)
- **Blocks:** 1.5, 1.6
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 5 ACs
- **Tasks:** 5 tasks (page route, tRPC router, table component, UI, badges)
- **Ready to Start:** NO (blocked by 1.3)

**Key Deliverables:**
- GESTOR-only user management page
- tRPC users.list() with tenant filtering
- User table with TanStack Table
- Status and role badges
- WCAG AA compliant

---

#### Story 1.5: Invite User

- **Story ID:** story-1.5
- **Title:** Convidar Novo Usuário (Técnico)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.5.md`
- **Status:** Not Started
- **Dependencies:** 1.4 (user management page)
- **Blocks:** 1.6
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** MEDIUM
- **Acceptance Criteria:** 4 ACs
- **Tasks:** 5 tasks (modal, validation, tRPC invite, email, UI updates)
- **Ready to Start:** NO (blocked by 1.4)

**Key Deliverables:**
- InviteUserModal component
- Form validation with Zod
- tRPC users.invite() mutation
- React Email template for invitations
- Auto-assign tenantId

---

#### Story 1.6: Deactivate User

- **Story ID:** story-1.6
- **Title:** Desativar Usuário (Técnico)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.6.md`
- **Status:** Not Started
- **Dependencies:** 1.4 (user list), 1.5 (user creation flow)
- **Blocks:** None
- **Estimated Time:** 2-3 hours
- **Complexity:** MEDIUM
- **Priority:** MEDIUM
- **Acceptance Criteria:** 4 ACs
- **Tasks:** 6 tasks (deactivate button, tRPC mutation, login prevention, session invalidation, data integrity, reactivate)
- **Ready to Start:** NO (blocked by 1.4, 1.5)

**Key Deliverables:**
- Deactivate user functionality
- Soft delete (status=INACTIVE)
- Session invalidation
- Auth.js login blocking
- Audit logging
- Reactivate functionality (bonus)

---

### Batch 4: Citizen Search & Profile View (2 stories)

**Estimated Time:** 6-8 hours
**Prerequisites:** Batch 2 complete (1.3), 2.1 complete
**Parallel Execution:** NO (sequential: 2.2 → 2.3)

#### Story 2.2: Citizen Search Screen

- **Story ID:** story-2.2
- **Title:** Implementação da Tela de Pesquisa de Cidadão
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.2.md`
- **Status:** Not Started
- **Dependencies:** 1.3 (RBAC), 2.1 (Individuo/Familia models)
- **Blocks:** 2.3, 2.4
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 7 tasks (page, search form, tRPC, results list, empty state, WCAG, tenant isolation)
- **Ready to Start:** NO (blocked by 1.3, 2.1)

**Key Deliverables:**
- TECNICO-accessible search page
- Debounced search input (300ms)
- Fuzzy search (case-insensitive, accent-insensitive)
- tRPC citizens.search() with tenant filtering
- Pagination (20 per page)
- Link to profile view and "Create New" button

---

#### Story 2.3: Profile View Screen

- **Story ID:** story-2.3
- **Title:** Implementação da Tela de Visualização de Perfil
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.3.md`
- **Status:** Not Started
- **Dependencies:** 2.2 (search navigation)
- **Blocks:** 2.4, 2.5, 2.6
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 6 ACs
- **Tasks:** 8 tasks (dynamic route, data fetching, components, action buttons, responsive, WCAG)
- **Ready to Start:** NO (blocked by 2.2)

**Key Deliverables:**
- Dynamic profile view page
- ProfileOverview component (CadÚnico data)
- AtendimentoHistoryList component
- AttachmentList component
- Action buttons (Register Visit, Add Attachment, Edit Profile)
- Responsive design
- WCAG AA compliant

---

### Batch 5: Profile Management & Atendimentos (3 stories, can parallelize 2.5 and 2.6)

**Estimated Time:** 8-10 hours
**Prerequisites:** 2.3 complete
**Parallel Execution:** YES (2.5 and 2.6 after 2.4)

#### Story 2.4: Profile Create/Edit

- **Story ID:** story-2.4
- **Title:** Criação e Edição de Perfil de Cidadão
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.4.md`
- **Status:** Not Started
- **Dependencies:** 2.2 (create button), 2.3 (edit button)
- **Blocks:** 2.5, 2.6, 2.7
- **Estimated Time:** 4-5 hours
- **Complexity:** HIGH
- **Priority:** HIGH
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 8 tasks (page, form, CPF validation, family composition, edit mode, audit log, tRPC, tenant isolation)
- **Ready to Start:** NO (blocked by 2.2, 2.3)

**Key Deliverables:**
- Profile creation page
- CadÚnico-compatible form
- CPF duplicate validation
- Family composition multi-step form
- Edit mode with audit logging
- tRPC citizens.create() and citizens.update()
- Auto-assign tenantId and userId

---

#### Story 2.5: Atendimento Modal (PARALLEL with 2.6 after 2.4)

- **Story ID:** story-2.5
- **Title:** Registro de Atendimento (Modal)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.5.md`
- **Status:** Not Started
- **Dependencies:** 2.3 (profile view), 2.4 (profile data exists)
- **Blocks:** 3.1
- **Estimated Time:** 2-3 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 5 ACs
- **Tasks:** 7 tasks (modal, form, TipoDemanda select, tRPC mutation, auto-populate, invalidation, testing)
- **Ready to Start:** NO (blocked by 2.3, 2.4)

**Key Deliverables:**
- AtendimentoModal component
- Atendimento form (demand type, referral, social assessment)
- tRPC atendimentos.create()
- Auto-populate date/time and userId
- Update profile view history list
- Auto-assign tenantId

---

#### Story 2.6: Attachments (PARALLEL with 2.5 after 2.4)

- **Story ID:** story-2.6
- **Title:** Gestão de Anexos (Upload e Visualização)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.6.md`
- **Status:** Not Started
- **Dependencies:** 2.3 (profile view), 2.4 (profile data exists)
- **Blocks:** None
- **Estimated Time:** 2-3 hours
- **Complexity:** MEDIUM
- **Priority:** MEDIUM
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 8 tasks (upload component, Vercel Blob, validation, list, secure download, delete, audit, tenant isolation)
- **Ready to Start:** NO (blocked by 2.3, 2.4)

**Key Deliverables:**
- FileUploadZone component
- Vercel Blob integration
- File validation (type: .jpg, .png, .pdf; size: 10MB)
- AttachmentList component
- Signed URLs for secure download
- Delete functionality with audit logging
- Tenant isolation on file access

---

### Batch 6: CSV Import (1 story)

**Estimated Time:** 4-5 hours
**Prerequisites:** 1.3, 2.1, 2.4 complete
**Parallel Execution:** NO

#### Story 2.7: CSV Import

- **Story ID:** story-2.7
- **Title:** Implementação da Importação de Dados
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.7.md`
- **Status:** Not Started
- **Dependencies:** 1.3 (RBAC), 2.1 (data model), 2.4 (validation logic)
- **Blocks:** None
- **Estimated Time:** 4-5 hours
- **Complexity:** HIGH
- **Priority:** MEDIUM (Should Have)
- **Acceptance Criteria:** 6 ACs
- **Tasks:** 8 tasks (import page, CSV template, upload/parsing, validation, bulk insert, error report, progress, testing)
- **Ready to Start:** NO (blocked by 1.3, 2.1, 2.4)

**Key Deliverables:**
- GESTOR-only import page
- Downloadable CSV template (CadÚnico fields)
- CSV parsing (csv-parse library)
- Validation (CPF uniqueness, required fields)
- Bulk insert with transaction
- Error report for failed imports
- Progress indicator
- Auto-assign tenantId

---

### Batch 7: Reports Foundation (1 story)

**Estimated Time:** 3-4 hours
**Prerequisites:** 1.3, 2.1, 2.5 complete
**Parallel Execution:** NO

#### Story 3.1: Reports API Foundation (Enabler)

- **Story ID:** story-3.1
- **Title:** Fundação de API para Relatórios (Enabler)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.1.md`
- **Status:** Not Started
- **Dependencies:** 1.3 (RBAC), 2.1 (data model), 2.5 (atendimentos data)
- **Blocks:** 3.2, 3.3, 3.4
- **Estimated Time:** 3-4 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH (enabler)
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 8 tasks (tRPC router, dashboard metrics, RMA query, access controls, SQL optimization, integration tests, caching, performance testing)
- **Ready to Start:** NO (blocked by 1.3, 2.1, 2.5)

**Key Deliverables:**
- tRPC reporting router
- dashboard.metrics() with caching (1-hour TTL)
- rma.generate() with date filtering
- GESTOR-only access (gestorProcedure)
- Optimized SQL (no SELECT *)
- Tenant filtering
- Integration tests
- Cache strategy

---

### Batch 8: Reports UI & Dashboard (3 stories, can parallelize 3.3 and 3.4)

**Estimated Time:** 5-6 hours
**Prerequisites:** 3.1 complete
**Parallel Execution:** PARTIAL (3.3 after 3.2, but 3.4 can parallel with 3.2)

#### Story 3.2: RMA Report Page

- **Story ID:** story-3.2
- **Title:** Implementação da Página de Geração de Relatórios (RMA)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.2.md`
- **Status:** Not Started
- **Dependencies:** 3.1 (reports API)
- **Blocks:** 3.3
- **Estimated Time:** 2-3 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 8 tasks (page route, selectors, preview component, loading states, formatting, export buttons, error handling, WCAG)
- **Ready to Start:** NO (blocked by 3.1)

**Key Deliverables:**
- GESTOR-only reports page
- Report type and period selectors
- RmaReportPreview component
- Loading indicators
- Correct RMA formatting
- Export buttons (PDF/Excel)
- Error handling
- WCAG AA compliant

---

#### Story 3.3: PDF/Excel Export

- **Story ID:** story-3.3
- **Title:** Exportação de Relatórios (PDF e Excel)
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.3.md`
- **Status:** Not Started
- **Dependencies:** 3.2 (report page with export buttons)
- **Blocks:** None
- **Estimated Time:** 2-3 hours
- **Complexity:** MEDIUM
- **Priority:** HIGH
- **Acceptance Criteria:** 6 ACs
- **Tasks:** 8 tasks (PDF export, Excel export, tRPC procedures, loading states, filenames, tenant isolation, error handling, large dataset testing)
- **Ready to Start:** NO (blocked by 3.2)

**Key Deliverables:**
- PDF export (@react-pdf/renderer)
- Excel export (xlsx library)
- tRPC export procedures
- Descriptive filenames (RMA_Outubro_2025.pdf)
- Tenant isolation
- Loading indicators
- Error handling

---

#### Story 3.4: Dashboard (CAN PARALLEL with 3.2)

- **Story ID:** story-3.4
- **Title:** Implementação do Dashboard Gerencial
- **File Path:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.4.md`
- **Status:** Not Started
- **Dependencies:** 3.1 (dashboard metrics API)
- **Blocks:** None
- **Estimated Time:** 1-2 hours
- **Complexity:** LOW
- **Priority:** MEDIUM (Should Have)
- **Acceptance Criteria:** 7 ACs
- **Tasks:** 9 tasks (page route, KPI cards, metrics query, totals, timestamp, refresh button, loading/error states, WCAG, cache testing)
- **Ready to Start:** NO (blocked by 3.1)

**Key Deliverables:**
- GESTOR default dashboard page
- DashboardKpiCard components
- Total atendimentos, families, individuals
- "Last updated" timestamp
- Manual refresh button
- Cached data (1-hour TTL)
- Loading and error states
- WCAG AA compliant

---

## Critical Path Analysis

**Longest Dependency Chain:**
1.1 → 1.2 → 1.3 → 2.2 → 2.3 → 2.4 → 2.5 → 3.1 → 3.2 → 3.3

**Critical Path Duration:** 51 hours (minimum, assuming no issues)

**Bottleneck Stories:**
- 1.1 (blocks everything)
- 1.3 (blocks all protected features)
- 2.1 (blocks all citizen features)
- 2.3 (blocks profile management)
- 3.1 (blocks all reports)

---

## Parallel Execution Opportunities

### Parallel Batch 1 (after 1.1 complete)
- **Stories:** 1.2, 2.1
- **Time Savings:** 3-4 hours (sequential: 6-8h, parallel: 3-4h)

### Parallel Batch 5 (after 2.4 complete)
- **Stories:** 2.5, 2.6
- **Time Savings:** 2-3 hours (sequential: 4-6h, parallel: 2-3h)

### Parallel Batch 8 (after 3.1 complete)
- **Stories:** 3.2, 3.4 (then 3.3 after 3.2)
- **Time Savings:** 1-2 hours (sequential: 5-6h, parallel: 4-5h)

**Total Time Savings with Parallel Execution:** 6-9 hours (12%)

**Sequential Execution:** 68-85 hours
**Optimal Parallel Execution:** 62-76 hours

---

## Risks & Issues

### Critical Issues

- **No Circular Dependencies Detected** ✅

### High-Priority Warnings

1. **Story 1.1 is SPOF (Single Point of Failure)**
   - All 16 other stories depend on it (directly or indirectly)
   - If 1.1 fails, entire project is blocked
   - **Mitigation:** Allocate experienced dev, thorough testing, incremental validation

2. **Story 2.1 (Data Model) is Critical Enabler**
   - 10 stories depend on this schema
   - Schema changes after migration are costly
   - **Mitigation:** Comprehensive schema review before migration, validation against CadÚnico requirements

3. **Multi-Tenant Security (tenantId) is Cross-Cutting**
   - Every story must implement tenant isolation
   - Failure in any story creates data leak risk
   - **Mitigation:** Prisma middleware (auto-filter), mandatory testing, code review checklist

4. **Auth.js Session Dependencies**
   - Stories 1.2, 1.3, and all subsequent stories depend on session working correctly
   - Session bugs impact all features
   - **Mitigation:** Thorough testing in 1.2, integration tests for session propagation

### Medium-Priority Warnings

1. **Vercel Blob Integration (2.6)**
   - External service dependency
   - Potential for upload failures, storage limits
   - **Mitigation:** Error handling, fallback messages, monitoring

2. **CSV Import Performance (2.7)**
   - Large datasets (>1000 records) could timeout
   - **Mitigation:** Batch processing, background jobs (if needed), progress indicators

3. **Report Generation Performance (3.1, 3.2, 3.3)**
   - Aggregation queries could be slow with large datasets
   - **Mitigation:** Optimized SQL, indexing, caching, pagination

4. **WCAG AA Compliance**
   - Required for all UI stories (1.2, 1.4, 2.2, 2.3, 3.2, 3.4)
   - Can be overlooked in fast implementation
   - **Mitigation:** Accessibility checklist, automated testing (axe-core), manual review

---

## Story Details

### Story 1.1: Configuração da Fundação Técnica (Enabler)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.1.md`
**Status:** Not Started
**Acceptance Criteria:** 6 ACs
**Tasks:** 5 major tasks
**Estimated Complexity:** HIGH
**Estimated Time:** 6-8 hours

**Dependencies:** None

**Blocks:**
- 1.2 (Login Screen)
- 1.3 (RBAC)
- 2.1 (Citizen Data Model)
- All subsequent stories (indirectly)

**Description:**
Initialize Next.js 15 project with App Router, connect to Vercel (deployment), Vercel Postgres (database), Auth.js (authentication), and set up testing infrastructure. Establish multi-tenant foundation with tenantId in User table.

**Key Files to Create:**
- `package.json` (Next.js, Prisma, Auth.js, Vitest, Playwright)
- `prisma/schema.prisma` (User, Municipality models)
- `src/app/layout.tsx`
- `src/lib/auth.ts` (Auth.js config)
- `middleware.ts` (session validation)
- `vitest.config.ts`, `playwright.config.ts`

---

### Story 1.2: Implementação da Tela de Login

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.2.md`
**Status:** Not Started
**Acceptance Criteria:** 5 ACs
**Tasks:** 5 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.1 (Auth.js configuration)

**Blocks:**
- 1.3 (RBAC)

**Description:**
Create public login page with email magic link authentication. Integrate Auth.js email provider, handle authentication flow, session management, and redirect logic based on user role.

**Key Files to Create:**
- `src/app/(public)/login/page.tsx`
- `src/components/modules/auth/LoginForm.tsx`
- `src/emails/magic-link.tsx` (React Email template)
- `src/lib/auth.ts` (session callbacks)

---

### Story 1.3: Estabelecimento de Papéis (Roles) e Proteção de Rotas

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.3.md`
**Status:** Not Started
**Acceptance Criteria:** 4 ACs
**Tasks:** 5 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 4-5 hours

**Dependencies:**
- 1.1 (Prisma User model)
- 1.2 (Auth.js session)

**Blocks:**
- 1.4 (User Management View)
- 2.2 (Search Screen - needs TECNICO access)
- 2.7 (CSV Import - needs GESTOR access)
- 3.1, 3.2, 3.4 (Reports - needs GESTOR access)

**Description:**
Implement RBAC with GESTOR and TECNICO roles. Add role to User model, include in Auth.js session, create Next.js middleware for route protection, implement layout-level guards, and create tRPC procedure guards.

**Key Files to Create:**
- `prisma/migrations/XXX_add_role.sql`
- `middleware.ts` (RBAC checks)
- `src/app/(auth)/(gestor)/layout.tsx`
- `src/server/trpc.ts` (gestorProcedure, tecnicoProcedure)

---

### Story 1.4: Visualização da Página de Gestão de Usuários

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.4.md`
**Status:** Not Started
**Acceptance Criteria:** 5 ACs
**Tasks:** 5 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.3 (RBAC - GESTOR-only access)

**Blocks:**
- 1.5 (Invite User)
- 1.6 (Deactivate User)

**Description:**
Create GESTOR-only user management page that displays list of all users in the municipality (tenant-filtered). Use TanStack Table for data display with status and role badges.

**Key Files to Create:**
- `src/app/(auth)/(gestor)/equipe/page.tsx`
- `src/server/routers/users.ts` (users.list procedure)
- `src/components/modules/users/UserList.tsx`
- `src/components/modules/users/UserStatusBadge.tsx`
- `src/components/modules/users/UserRoleBadge.tsx`

---

### Story 1.5: Convidar Novo Usuário (Técnico)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.5.md`
**Status:** Not Started
**Acceptance Criteria:** 4 ACs
**Tasks:** 5 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.4 (User Management Page - where invite button lives)

**Blocks:**
- 1.6 (Deactivate User - needs users to deactivate)

**Description:**
Add invite user functionality to user management page. Create modal with form (email, role), validate input, create user record with PENDING status, send invitation email with magic link, auto-assign tenantId.

**Key Files to Create:**
- `src/components/modules/users/InviteUserModal.tsx`
- `src/server/routers/users.ts` (users.invite mutation)
- `src/emails/user-invitation.tsx`
- `src/lib/validators.ts` (inviteUserSchema)

---

### Story 1.6: Desativar Usuário (Técnico)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-1.6.md`
**Status:** Not Started
**Acceptance Criteria:** 4 ACs
**Tasks:** 6 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

**Dependencies:**
- 1.4 (User Management Page - where deactivate button lives)
- 1.5 (User creation flow - understanding user lifecycle)

**Blocks:** None

**Description:**
Implement soft delete for users (status=INACTIVE). Add deactivate button to user list, create confirmation dialog, update user status, invalidate sessions, prevent login for inactive users, preserve historical data, add audit logging, include reactivate functionality.

**Key Files to Create:**
- `src/components/modules/users/DeactivateUserDialog.tsx`
- `src/server/routers/users.ts` (users.deactivate, users.reactivate mutations)
- `src/lib/auth.ts` (signIn callback - block inactive users)

---

### Story 2.1: Modelagem de Dados do Cidadão (Enabler)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.1.md`
**Status:** Not Started
**Acceptance Criteria:** 5 ACs
**Tasks:** 7 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.1 (Prisma foundation)

**Blocks:**
- 2.2 (Search Screen)
- 2.3 (Profile View)
- 2.4 (Profile Create/Edit)
- 2.5 (Atendimento Modal)
- 2.6 (Attachments)
- 2.7 (CSV Import)
- 3.1 (Reports API)

**Description:**
Define and migrate Prisma schema for citizen data: Familia, Individuo, Atendimento, Anexo, ComposicaoFamiliar. Align with CadÚnico model, implement multi-tenant isolation, add indexes for performance, create Prisma middleware for auto-filtering.

**Key Files to Create:**
- `prisma/schema.prisma` (5 new models + enums)
- `prisma/migrations/XXX_citizen_data.sql`
- `src/lib/prisma.ts` (tenant isolation middleware)

---

### Story 2.2: Implementação da Tela de Pesquisa de Cidadão

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.2.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 7 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.3 (RBAC - TECNICO access)
- 2.1 (Individuo/Familia models)

**Blocks:**
- 2.3 (Profile View - navigation from search)
- 2.4 (Profile Create - "Create New" button)

**Description:**
Create citizen search screen for TECNICO role. Implement debounced search input with fuzzy matching (case-insensitive, accent-insensitive), display results in paginated list, show empty state with "Create New Profile" link, navigate to profile view on result click.

**Key Files to Create:**
- `src/app/(auth)/pesquisar/page.tsx`
- `src/server/routers/citizens.ts` (citizens.search procedure)
- `src/components/modules/citizens/SearchForm.tsx`
- `src/components/modules/citizens/SearchResults.tsx`

---

### Story 2.3: Implementação da Tela de Visualização de Perfil

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.3.md`
**Status:** Not Started
**Acceptance Criteria:** 6 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 2.2 (Search Screen - navigation)

**Blocks:**
- 2.4 (Profile Create/Edit - "Edit Profile" button)
- 2.5 (Atendimento Modal - "Register Visit" button)
- 2.6 (Attachments - "Add Attachment" button)

**Description:**
Create profile view screen displaying citizen's complete information, visit history, and attachments. Include CadÚnico data overview, atendimento summary list, attachment list, and action buttons for registering visits, uploading attachments, and editing profile.

**Key Files to Create:**
- `src/app/(auth)/perfil/[id]/page.tsx`
- `src/server/routers/citizens.ts` (citizens.getById procedure)
- `src/components/modules/citizens/ProfileOverview.tsx`
- `src/components/modules/atendimentos/AtendimentoHistoryList.tsx`
- `src/components/modules/attachments/AttachmentList.tsx`

---

### Story 2.4: Criação e Edição de Perfil de Cidadão

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.4.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** HIGH
**Estimated Time:** 4-5 hours

**Dependencies:**
- 2.2 (Search Screen - "Create New" button)
- 2.3 (Profile View - "Edit Profile" button)

**Blocks:**
- 2.5 (Atendimento Modal - needs profile data)
- 2.6 (Attachments - needs profile data)
- 2.7 (CSV Import - validation logic)

**Description:**
Implement profile creation and editing forms with CadÚnico fields. Add CPF duplicate validation, multi-step family composition form, edit mode with audit logging, create tRPC mutations for create/update, auto-assign tenantId and userId.

**Key Files to Create:**
- `src/app/(auth)/perfil/novo/page.tsx`
- `src/server/routers/citizens.ts` (citizens.create, citizens.update mutations)
- `src/components/modules/citizens/ProfileForm.tsx`
- `src/components/modules/citizens/FamilyCompositionForm.tsx`
- `src/lib/validators.ts` (citizen schemas)

---

### Story 2.5: Registro de Atendimento (Modal)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.5.md`
**Status:** Not Started
**Acceptance Criteria:** 5 ACs
**Tasks:** 7 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

**Dependencies:**
- 2.3 (Profile View - where "Register Visit" button lives)
- 2.4 (Profile Create - need profile data to create atendimento)

**Blocks:**
- 3.1 (Reports API - needs atendimento data)

**Description:**
Create modal for registering atendimentos from profile view. Implement form with demand type, referral, social assessment fields. Auto-populate date/time and userId. Save with tenantId and individuoId. Update profile view history list on success.

**Key Files to Create:**
- `src/components/modules/atendimentos/AtendimentoModal.tsx`
- `src/server/routers/atendimentos.ts` (atendimentos.create mutation)
- `src/lib/validators.ts` (atendimento schema)

---

### Story 2.6: Gestão de Anexos (Upload e Visualização)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.6.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

**Dependencies:**
- 2.3 (Profile View - where "Add Attachment" button lives)
- 2.4 (Profile Create - need profile data for attachments)

**Blocks:** None

**Description:**
Implement file upload to Vercel Blob with metadata storage in Anexo table. Add file validation (type: .jpg, .png, .pdf; size: 10MB), display attachment list, implement secure download with signed URLs, add delete functionality with audit logging, enforce tenant isolation.

**Key Files to Create:**
- `src/components/modules/attachments/FileUploadZone.tsx`
- `src/server/routers/attachments.ts` (upload, download, delete procedures)
- `src/lib/vercel-blob.ts` (Blob integration)

---

### Story 2.7: Implementação da Importação de Dados

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-2.7.md`
**Status:** Not Started
**Acceptance Criteria:** 6 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** HIGH
**Estimated Time:** 4-5 hours

**Dependencies:**
- 1.3 (RBAC - GESTOR-only access)
- 2.1 (Citizen data model)
- 2.4 (Validation logic for CPF, required fields)

**Blocks:** None

**Description:**
Create GESTOR-only CSV import page for bulk citizen data import. Provide CSV template download, implement parsing with validation (CPF uniqueness, required fields), bulk insert with transaction, generate error reports for failed imports, show progress indicator, test with large datasets (>1000 records).

**Key Files to Create:**
- `src/app/(auth)/(gestor)/importar/page.tsx`
- `src/server/routers/import.ts` (import.upload, import.validate procedures)
- `public/templates/import-template.csv`
- `src/lib/csv-parser.ts`

---

### Story 3.1: Fundação de API para Relatórios (Enabler)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.1.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 3-4 hours

**Dependencies:**
- 1.3 (RBAC - GESTOR-only access)
- 2.1 (Citizen data model)
- 2.5 (Atendimento data - need data to aggregate)

**Blocks:**
- 3.2 (RMA Report Page)
- 3.3 (PDF/Excel Export)
- 3.4 (Dashboard)

**Description:**
Create tRPC reporting router with optimized aggregation queries for RMA and dashboard metrics. Implement caching (1-hour TTL), GESTOR-only access controls, tenant filtering, date filtering for RMA, optimized SQL (no SELECT *), integration tests.

**Key Files to Create:**
- `src/server/routers/reporting.ts` (dashboard.metrics, rma.generate procedures)
- `src/lib/cache.ts` (caching utilities)
- `tests/integration/reporting.test.ts`

---

### Story 3.2: Implementação da Página de Geração de Relatórios (RMA)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.2.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

**Dependencies:**
- 3.1 (Reports API)

**Blocks:**
- 3.3 (PDF/Excel Export - needs report page)

**Description:**
Create GESTOR-only reports page with report type and period selectors. Display RMA report preview with correct formatting, loading indicators, export buttons (PDF/Excel), error handling. Ensure WCAG AA compliance.

**Key Files to Create:**
- `src/app/(auth)/(gestor)/relatorios/page.tsx`
- `src/components/modules/reporting/RmaReportPreview.tsx`
- `src/components/modules/reporting/ReportFilters.tsx`

---

### Story 3.3: Exportação de Relatórios (PDF e Excel)

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.3.md`
**Status:** Not Started
**Acceptance Criteria:** 6 ACs
**Tasks:** 8 tasks
**Estimated Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

**Dependencies:**
- 3.2 (RMA Report Page - where export buttons live)

**Blocks:** None

**Description:**
Implement PDF export with @react-pdf/renderer and Excel export with xlsx library. Create tRPC export procedures, generate descriptive filenames, enforce tenant isolation, add loading indicators, error handling, test with large datasets.

**Key Files to Create:**
- `src/server/routers/reporting.ts` (exportPdf, exportExcel procedures)
- `src/lib/pdf-generator.tsx` (React PDF templates)
- `src/lib/excel-generator.ts` (xlsx generation)

---

### Story 3.4: Implementação do Dashboard Gerencial

**File:** `/Users/fusuma/dev/AuroraSocial/docs/stories/story-3.4.md`
**Status:** Not Started
**Acceptance Criteria:** 7 ACs
**Tasks:** 9 tasks
**Estimated Complexity:** LOW
**Estimated Time:** 1-2 hours

**Dependencies:**
- 3.1 (Dashboard metrics API)

**Blocks:** None

**Description:**
Create GESTOR default dashboard page with KPI cards displaying total atendimentos, families, individuals. Show "Last updated" timestamp, manual refresh button, cached data (1-hour TTL), loading and error states. Ensure WCAG AA compliance.

**Key Files to Create:**
- `src/app/(auth)/(gestor)/dashboard/page.tsx`
- `src/components/modules/dashboard/DashboardKpiCard.tsx`
- `src/components/modules/dashboard/MetricsOverview.tsx`

---

## Execution Instructions for Orchestrator

### Phase 1: Foundation (Batch 1)

1. **Execute Story 1.1 First (CRITICAL)**
   - Spawn dev agent for Story 1.1
   - Wait for completion + review
   - Verify: Next.js working, Vercel deployed, Postgres connected, Auth.js configured, tests passing
   - Commit Story 1.1

2. **Execute Batch 1 Parallel (Stories 1.2 and 2.1)**
   - Option A: Sequential (1.2 then 2.1) - 6-8 hours
   - Option B: Parallel (1.2 || 2.1) - 3-4 hours ⭐ RECOMMENDED
   - Wait for both to complete + review
   - Commit Story 1.2, then Story 2.1

### Phase 2: Security Layer (Batch 2)

3. **Execute Story 1.3 (RBAC)**
   - Spawn dev agent for Story 1.3
   - Wait for completion + review
   - Verify: Role in User model, role in session, middleware working, layout guards working
   - Commit Story 1.3

### Phase 3: User Management (Batch 3)

4. **Execute Stories 1.4 → 1.5 → 1.6 (Sequential)**
   - Story 1.4: User Management View
   - Story 1.5: Invite User
   - Story 1.6: Deactivate User
   - Wait for each to complete + review before starting next
   - Commit each story separately

### Phase 4: Citizen Search & View (Batch 4)

5. **Execute Stories 2.2 → 2.3 (Sequential)**
   - Story 2.2: Search Screen
   - Story 2.3: Profile View
   - Wait for each to complete + review
   - Commit each story separately

### Phase 5: Profile Management (Batch 5)

6. **Execute Story 2.4 First**
   - Story 2.4: Profile Create/Edit
   - Wait for completion + review
   - Commit Story 2.4

7. **Execute Batch 5 Parallel (Stories 2.5 and 2.6)**
   - Option A: Sequential (2.5 then 2.6) - 4-6 hours
   - Option B: Parallel (2.5 || 2.6) - 2-3 hours ⭐ RECOMMENDED
   - Wait for both to complete + review
   - Commit Story 2.5, then Story 2.6

### Phase 6: CSV Import (Batch 6)

8. **Execute Story 2.7**
   - Story 2.7: CSV Import
   - Wait for completion + review
   - Commit Story 2.7

### Phase 7: Reports Foundation (Batch 7)

9. **Execute Story 3.1 (Reports API)**
   - Story 3.1: Reports API Foundation
   - Wait for completion + review
   - Verify: tRPC router working, caching working, integration tests passing
   - Commit Story 3.1

### Phase 8: Reports UI & Dashboard (Batch 8)

10. **Execute Batch 8 Mixed**
    - Start Story 3.2 (RMA Report Page)
    - SIMULTANEOUSLY start Story 3.4 (Dashboard) - both depend only on 3.1
    - Wait for both 3.2 and 3.4 to complete + review
    - Commit Story 3.2, then Story 3.4
    - THEN start Story 3.3 (PDF/Excel Export) - depends on 3.2
    - Wait for 3.3 to complete + review
    - Commit Story 3.3

### Phase 9: Epic Completion

11. **All Stories Complete → Create PR**
    - Verify all 17 stories committed
    - Generate epic summary from status notes
    - Create PR with comprehensive description
    - Return PR URL to user

---

## Timeline Projection

**Assumptions:**
- 8 working hours/day
- Developer working at steady pace
- No major blockers
- Optimal parallel execution

### Week 1 (5 days, 40 hours)

**Day 1 (8 hours):**
- Morning: Story 1.1 (Foundation) - 6-8h
- Status: 1 story complete

**Day 2 (8 hours):**
- Morning: Story 1.2 (Login) - 3-4h
- Afternoon: Story 2.1 (Data Model) - 3-4h (parallel with 1.2 in real execution)
- Status: 3 stories complete

**Day 3 (8 hours):**
- Morning: Story 1.3 (RBAC) - 4-5h
- Afternoon: Story 1.4 (User Management) - 3-4h
- Status: 5 stories complete

**Day 4 (8 hours):**
- Morning: Story 1.5 (Invite User) - 3-4h
- Afternoon: Story 1.6 (Deactivate User) - 2-3h, Story 2.2 (Search) - 3-4h (start)
- Status: 7 stories complete, 1 in progress

**Day 5 (8 hours):**
- Morning: Story 2.2 (Search) - finish - 1h
- Morning/Afternoon: Story 2.3 (Profile View) - 3-4h
- Afternoon: Story 2.4 (Profile Create/Edit) - 4-5h (start)
- Status: 8 stories complete, 1 in progress

### Week 2 (5 days, 40 hours)

**Day 6 (8 hours):**
- Morning: Story 2.4 (Profile Create/Edit) - finish - 2h
- Morning/Afternoon: Story 2.5 (Atendimento) + Story 2.6 (Attachments) - 2-3h each (parallel)
- Afternoon: Story 2.7 (CSV Import) - 4-5h (start)
- Status: 11 stories complete, 1 in progress

**Day 7 (8 hours):**
- Morning: Story 2.7 (CSV Import) - finish - 2h
- Morning/Afternoon: Story 3.1 (Reports API) - 3-4h
- Afternoon: Story 3.2 (RMA Page) - 2-3h (start)
- Status: 13 stories complete, 1 in progress

**Day 8 (8 hours):**
- Morning: Story 3.2 (RMA Page) - finish - 1h
- Morning: Story 3.4 (Dashboard) - 1-2h (parallel with 3.2 in real execution)
- Afternoon: Story 3.3 (Export) - 2-3h
- Afternoon: Testing, bug fixes, polish - 3-4h
- Status: 17 stories complete

**Day 9-10 (16 hours):**
- Integration testing across all epics
- Bug fixes and polish
- Documentation updates
- PR creation and description
- Final review

**Total Duration:** 8-10 days (62-76 hours of development + 16 hours testing/polish)

---

## Success Criteria

### Epic 1 Success Criteria
- ✅ Next.js 15 deployed to Vercel
- ✅ Authentication working (email magic link)
- ✅ RBAC implemented (GESTOR, TECNICO)
- ✅ User management complete (view, invite, deactivate)
- ✅ All Epic 1 tests passing

### Epic 2 Success Criteria
- ✅ Citizen data model migrated
- ✅ Search working with fuzzy matching
- ✅ Profile view displaying complete data
- ✅ Profile create/edit working
- ✅ Atendimento registration working
- ✅ File attachments working (Vercel Blob)
- ✅ CSV import working with validation
- ✅ Multi-tenant isolation verified (all queries)
- ✅ All Epic 2 tests passing

### Epic 3 Success Criteria
- ✅ Reports API working with caching
- ✅ RMA report generation working
- ✅ PDF export working
- ✅ Excel export working
- ✅ Dashboard displaying metrics
- ✅ All Epic 3 tests passing

### Overall Success Criteria
- ✅ All 17 stories committed
- ✅ All acceptance criteria met
- ✅ All tests passing (unit + integration + E2E)
- ✅ WCAG AA compliance verified
- ✅ Multi-tenant security verified (no data leaks)
- ✅ Performance acceptable (page load <2s)
- ✅ No critical bugs
- ✅ PR created and ready for review

---

**Story Sequencer Analysis Complete** ✅

**Next Steps for Orchestrator:**
1. Read `.execution-plan.json` (~8KB lightweight file)
2. Create TodoWrite list from execution sequence
3. Start with Story 1.1 (spawn dev agent)
4. Follow execution instructions batch by batch
5. Track progress via status notes
6. Use parallel execution where recommended
7. Create PR after all stories complete

**Estimated Project Completion:** 8-10 working days (optimal execution)
