# Manual Integration Tests for Reporting Router

**Story:** 3.1 - Fundação de API para Relatórios

**Status:** Implementation Complete, Manual Testing Required

## Test Coverage (AC7)

This document outlines manual integration tests that verify:
- **AC3:** SQL aggregation logic correctness
- **AC4:** TenantId filtering infallibility
- **AC5:** GESTOR-only role protection

## Why Manual Testing?

Automated integration tests for this router require importing the full tRPC app router, which brings Next.js/NextAuth dependencies that conflict with Vitest's jsdom environment. Manual testing via Playwright or tRPC DevTools is recommended.

## Manual Test Cases

### 1. Dashboard Metrics - Basic Aggregation (AC3)

**Setup:**
1. Ensure test database has data for Tenant A:
   - 5 atendimentos (3 CADASTRO_UNICO, 2 BENEFICIO_EVENTUAL)
   - 2 famílias
   - 3 indivíduos
2. Login as GESTOR for Tenant A

**Test:**
```typescript
// Via tRPC DevTools or Playwright
const metrics = await trpc.reporting.dashboard.metrics.query();

expect(metrics.totalAtendimentos).toBe(5);
expect(metrics.totalFamilias).toBe(2);
expect(metrics.totalIndividuos).toBe(3);

const cadastroUnico = metrics.atendimentosPorTipoDemanda.find(
  t => t.tipoDemanda === 'CADASTRO_UNICO'
);
expect(cadastroUnico.count).toBe(3);
```

**Expected Result:** Metrics match database counts exactly

---

### 2. Dashboard Metrics - Tenant Isolation (AC4)

**Setup:**
1. Create 2 tenants:
   - Tenant A: 5 atendimentos
   - Tenant B: 3 atendimentos
2. Login as GESTOR for Tenant A

**Test:**
```typescript
const metrics = await trpc.reporting.dashboard.metrics.query();

expect(metrics.totalAtendimentos).toBe(5); // NOT 8
```

**Expected Result:** Only Tenant A data returned, no cross-tenant leakage

---

### 3. Dashboard Metrics - GESTOR-only Access (AC5)

**Setup:**
1. Login as TECNICO user

**Test:**
```typescript
await expect(
  trpc.reporting.dashboard.metrics.query()
).rejects.toThrow(/FORBIDDEN/);
```

**Expected Result:** FORBIDDEN error, TECNICO cannot access

---

### 4. Dashboard Metrics - Unauthenticated Rejection (AC5)

**Setup:**
1. Logout (no session)

**Test:**
```typescript
await expect(
  trpc.reporting.dashboard.metrics.query()
).rejects.toThrow(/UNAUTHORIZED/);
```

**Expected Result:** UNAUTHORIZED error

---

### 5. Dashboard Metrics - Cache Behavior (AC6)

**Setup:**
1. Login as GESTOR for Tenant A
2. Call metrics endpoint twice within 1 hour

**Test:**
```typescript
const firstCall = await trpc.reporting.dashboard.metrics.query();
await delay(100); // 100ms delay
const secondCall = await trpc.reporting.dashboard.metrics.query();

const timeDiff = Math.abs(
  secondCall.ultimaAtualizacao.getTime() - firstCall.ultimaAtualizacao.getTime()
);
expect(timeDiff).toBeLessThan(1000); // Same timestamp (cached)
```

**Expected Result:** Second call returns cached data (same timestamp)

---

### 6. RMA Report - Date Filtering (AC2)

**Setup:**
1. Tenant A has atendimentos in:
   - November 2025: 3 atendimentos
   - October 2025: 2 atendimentos
2. Login as GESTOR for Tenant A

**Test:**
```typescript
const novRMA = await trpc.reporting.rma.generate.query({
  mes: 11,
  ano: 2025
});

expect(novRMA.totalAtendimentos).toBe(3); // Only November data

const octRMA = await trpc.reporting.rma.generate.query({
  mes: 10,
  ano: 2025
});

expect(octRMA.totalAtendimentos).toBe(2); // Only October data
```

**Expected Result:** Correct month filtering, no cross-month data

---

### 7. RMA Report - Aggregation Correctness (AC3)

**Setup:**
1. November 2025 Tenant A data:
   - Day 5: 1 atendimento (CADASTRO_UNICO)
   - Day 10: 1 atendimento (BENEFICIO_EVENTUAL)
   - Day 15: 1 atendimento (CADASTRO_UNICO)
   - 2 distinct individuos, 1 familia

**Test:**
```typescript
const rma = await trpc.reporting.rma.generate.query({
  mes: 11,
  ano: 2025
});

expect(rma.totalAtendimentos).toBe(3);
expect(rma.atendimentosPorDia).toContainEqual({ dia: 5, count: 1 });
expect(rma.atendimentosPorDia).toContainEqual({ dia: 10, count: 1 });
expect(rma.atendimentosPorDia).toContainEqual({ dia: 15, count: 1 });

const cadastroUnico = rma.atendimentosPorTipoDemanda.find(
  t => t.tipoDemanda === 'CADASTRO_UNICO'
);
expect(cadastroUnico.count).toBe(2);

expect(rma.totalIndividuosAtendidos).toBe(2);
expect(rma.totalFamiliasAtendidas).toBe(1);
```

**Expected Result:** All aggregations accurate, no full records returned

---

### 8. RMA Report - Tenant Isolation (AC4)

**Setup:**
1. November 2025:
   - Tenant A: 3 atendimentos (2 CADASTRO_UNICO, 1 BENEFICIO_EVENTUAL)
   - Tenant B: 2 atendimentos (2 BPC)
2. Login as GESTOR for Tenant A

**Test:**
```typescript
const rma = await trpc.reporting.rma.generate.query({
  mes: 11,
  ano: 2025
});

expect(rma.totalAtendimentos).toBe(3); // NOT 5

const bpc = rma.atendimentosPorTipoDemanda.find(
  t => t.tipoDemanda === 'BPC'
);
expect(bpc).toBeUndefined(); // Tenant A has no BPC
```

**Expected Result:** No Tenant B data leaked

---

### 9. RMA Report - GESTOR-only Access (AC5)

**Setup:**
1. Login as TECNICO user

**Test:**
```typescript
await expect(
  trpc.reporting.rma.generate.query({ mes: 11, ano: 2025 })
).rejects.toThrow(/FORBIDDEN/);
```

**Expected Result:** FORBIDDEN error

---

### 10. RMA Report - Future Date Rejection

**Setup:**
1. Login as GESTOR

**Test:**
```typescript
const futureYear = new Date().getFullYear() + 1;

await expect(
  trpc.reporting.rma.generate.query({ mes: 1, ano: futureYear })
).rejects.toThrow(/futuro/);
```

**Expected Result:** BAD_REQUEST error with "futuro" message

---

### 11. SQL Optimization - No SELECT * (AC3)

**Setup:**
1. Enable SQL query logging in Prisma
2. Login as GESTOR

**Test:**
```typescript
await trpc.reporting.dashboard.metrics.query();
await trpc.reporting.rma.generate.query({ mes: 11, ano: 2025 });
```

**Manual Verification:**
- Review SQL logs
- Confirm all queries use `COUNT(*)`, `COUNT(DISTINCT ...)`, `GROUP BY`
- Confirm NO queries use `SELECT * FROM Atendimento`
- Confirm all queries include `WHERE tenantId = ?`

**Expected Result:** All queries optimized for aggregation only

---

## Test Execution Checklist

- [ ] Dashboard Metrics - Basic Aggregation (AC3)
- [ ] Dashboard Metrics - Tenant Isolation (AC4)
- [ ] Dashboard Metrics - GESTOR-only Access (AC5)
- [ ] Dashboard Metrics - Unauthenticated Rejection (AC5)
- [ ] Dashboard Metrics - Cache Behavior (AC6)
- [ ] RMA Report - Date Filtering (AC2)
- [ ] RMA Report - Aggregation Correctness (AC3)
- [ ] RMA Report - Tenant Isolation (AC4)
- [ ] RMA Report - GESTOR-only Access (AC5)
- [ ] RMA Report - Future Date Rejection
- [ ] SQL Optimization - No SELECT * (AC3)

## Notes

- All tenant isolation tests must pass to satisfy AC4
- All role protection tests must pass to satisfy AC5
- SQL query inspection confirms AC3 (no SELECT *, only aggregations)
- These tests can be automated with Playwright E2E tests (post-MVP)

## Future Work

- Convert these manual tests to automated Playwright E2E tests
- Add performance benchmarks for large datasets (>10,000 atendimentos)
- Test cache invalidation edge cases
