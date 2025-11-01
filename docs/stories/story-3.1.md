# Story 3.1: Fundação de API para Relatórios (Enabler)

Status: Approved

## Story

As an Architect/Developer,
I want to create the API endpoints (API Routes) and optimized SQL queries to aggregate atendimentos (FR3) and profiles (FR1) data,
so that data can be efficiently consumed by the "Reports Generation Page" and "Dashboard" without causing slowdown (NFR3).

## Acceptance Criteria

1. Specific API endpoints (API Routes) are created (e.g., `/api/reports/rma`, `/api/reports/dashboard-metrics`).
2. API endpoints (AC 1) **must accept parameters** for filtering when appropriate (e.g., `month`, `year` for RMA).
3. SQL queries (Vercel Postgres) are optimized for aggregation (e.g., using `COUNT`, `GROUP BY`) and **must not** do `SELECT *` on transaction tables (like 'Atendimentos'), to protect system performance (NFR3).
4. Queries **mandatorily** filter by `tenantId` (passed via Auth.js session) (NFR2, NFR5).
5. Endpoints are protected and accessible only by the 'GESTOR' role (NFR4).
6. The dashboard query (FR6) is designed to be executed with cache or at intervals (as per FR6 ACs).
7. **Integration Tests** must be created to prove that aggregation logic (AC 3) is correct, that `tenantId` filtering (AC 4) is infallible, and that role protection (AC 5) works (NFR4).

## Tasks / Subtasks

- [ ] Create reporting tRPC router
- [ ] Implement dashboard.metrics() query with caching
- [ ] Implement rma.generate() query with date filtering
- [ ] Add tenant and role-based access controls
- [ ] Optimize SQL queries (no SELECT *)
- [ ] Create integration tests for all endpoints
- [ ] Test cache invalidation logic
- [ ] Performance test with large datasets

## References

- [Source: docs/prd.md#épico-3-história-3.1]
- [Source: docs/solution-architecture.md#6.4-caching-strategy]
