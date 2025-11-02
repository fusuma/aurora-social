# Multi-Tenant Isolation Usage Guide

## Overview

Story 2.1 implements automatic tenant isolation via Prisma middleware. All database operations on citizen data models (Familia, Individuo, Atendimento, Anexo) are automatically scoped to the current tenant context.

## Models with Tenant Isolation

- `Familia`
- `Individuo`
- `ComposicaoFamiliar` (via relations)
- `Atendimento`
- `Anexo`
- `User`

## Basic Usage

### Setting Tenant Context

```typescript
import { withTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

// In API route or server component
async function handler(req: Request) {
  const session = await getServerSession();
  const tenantId = session.user.tenantId;
  const userId = session.user.id;

  return withTenantContext(tenantId, async () => {
    // All database operations within this callback are automatically
    // filtered by tenantId
    const individuos = await prisma.individuo.findMany();
    // Returns only individuos for this tenant

    return individuos;
  }, userId);
}
```

### Auto-Injection on Create

```typescript
// tenantId is automatically injected - NO need to specify it
const novoIndividuo = await prisma.individuo.create({
  data: {
    nomeCompleto: "João Silva",
    cpf: "123.456.789-00",
    dataNascimento: new Date("1990-01-01"),
    sexo: "MASCULINO",
    // tenantId and createdBy are injected automatically
  },
});
```

### Auto-Filtering on Queries

```typescript
// ALL queries are automatically filtered by current tenantId
const individuos = await prisma.individuo.findMany({
  where: {
    nomeCompleto: { contains: "Silva" },
    // tenantId filter is added automatically by middleware
  },
});

// Even direct lookups are filtered
const individuo = await prisma.individuo.findUnique({
  where: { id: "some-id" },
  // Returns null if individuo belongs to different tenant
});
```

### Server Actions Example

```typescript
"use server";

import { withTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function criarFamilia(data: FamiliaInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  return withTenantContext(
    session.user.tenantId,
    async () => {
      const familia = await prisma.familia.create({
        data: {
          endereco: data.endereco,
          rendaFamiliarTotal: data.rendaFamiliarTotal,
          responsavelFamiliarId: data.responsavelId,
          // tenantId auto-injected
          // createdBy auto-injected (from userId)
        },
      });

      return familia;
    },
    session.user.id
  );
}
```

### API Route Example (Next.js 15 App Router)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { withTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const individuos = await withTenantContext(
    session.user.tenantId,
    async () => {
      return prisma.individuo.findMany({
        include: {
          familias: true,
          atendimentos: {
            orderBy: { data: "desc" },
            take: 5,
          },
        },
      });
    }
  );

  return NextResponse.json(individuos);
}
```

## Security Features

### Fail-Safe Design

```typescript
// ❌ This will throw an error - tenant context required
await prisma.individuo.findMany();
// Error: Multi-tenant violation: findMany on Individuo requires tenant context

// ✅ This is safe - tenant context provided
await withTenantContext(tenantId, async () => {
  return prisma.individuo.findMany();
});
```

### Cross-Tenant Access Prevention

```typescript
// User from Tenant A tries to access data
await withTenantContext("tenant-a-id", async () => {
  // This returns null even if the ID exists in Tenant B
  const individuo = await prisma.individuo.findUnique({
    where: { id: "tenant-b-individuo-id" },
  });
  // individuo === null (filtered by middleware)
});
```

## Audit Trail

For models with `createdBy` field (Familia, Individuo):

```typescript
await withTenantContext(
  tenantId,
  async () => {
    const individuo = await prisma.individuo.create({
      data: {
        // ... individuo data
        // createdBy is auto-populated with userId
      },
    });

    console.log(individuo.createdBy); // "user-123"
  },
  "user-123" // userId passed here
);
```

## CadÚnico Compatibility

The Individuo and Familia models use field names compatible with federal Cadastro Único standards:

```typescript
const individuo = await prisma.individuo.create({
  data: {
    nomeCompleto: "Maria Santos", // CadÚnico field
    cpf: "987.654.321-00", // CadÚnico field
    dataNascimento: new Date("1985-05-15"),
    sexo: "FEMININO",
    nomeMae: "Ana Santos", // CadÚnico field
    nis: "12345678901", // CadÚnico NIS number
    rg: "12.345.678-9",
    tituloEleitor: "1234 5678 9012",
    carteiraTrabalho: "1234567",
  },
});
```

## Performance Considerations

### Indexes

All tenant-isolated models have composite indexes on `tenantId + frequently queried fields`:

- `Familia`: `tenantId + responsavelFamiliarId`
- `Individuo`: `tenantId + nomeCompleto`, `tenantId + cpf` (unique)
- `Atendimento`: `tenantId + data`, `tenantId + individuoId`
- `Anexo`: `tenantId`

### Query Optimization

```typescript
// ✅ Efficient - uses composite index
const individuos = await prisma.individuo.findMany({
  where: {
    nomeCompleto: { contains: "Silva" },
    // tenantId added automatically - uses index
  },
});

// ✅ Efficient - uses unique constraint
const individuo = await prisma.individuo.findUnique({
  where: {
    tenantId_cpf: {
      tenantId: "tenant-id", // Auto-injected by middleware
      cpf: "123.456.789-00",
    },
  },
});
```

## Testing

For unit tests, use the tenant context wrapper:

```typescript
import { withTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

describe("Individuo CRUD", () => {
  it("should create individuo with tenant isolation", async () => {
    await withTenantContext("test-tenant-id", async () => {
      const individuo = await prisma.individuo.create({
        data: {
          // ... test data
        },
      });

      expect(individuo.tenantId).toBe("test-tenant-id");
    });
  });
});
```

## Migration Notes

The migration file `20251101035715_add_citizen_data_models/migration.sql` includes:

1. All citizen data models (Familia, Individuo, ComposicaoFamiliar, Atendimento, Anexo)
2. Enums (Sexo, Parentesco, TipoDemanda)
3. Foreign key constraints with cascade rules
4. Composite indexes for performance
5. Unique constraints (tenantId + cpf)

To apply migration when Vercel Postgres is provisioned:

```bash
npx prisma migrate deploy
```

## References

- Story 2.1: Citizen Data Model
- NFR2: Multi-tenant data isolation
- NFR10: CadÚnico compatibility
- FR1: Família and Indivíduo management
- FR3: Atendimento tracking
