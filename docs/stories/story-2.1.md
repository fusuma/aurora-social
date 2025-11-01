# Story 2.1: Modelagem de Dados do Cidadão (Enabler)

Status: Approved

## Story

As an Architect/Developer,
I want to define and migrate the Vercel Postgres schemas for 'Família', 'Indivíduo' (FR1), and 'Atendimento' (FR3),
so that they align with the CadÚnico model (NFR10) and implement isolation by `tenantId` (NFR2).

## Acceptance Criteria

1. Database migrations (Vercel Postgres) for tables 'Família', 'Indivíduo', 'Atendimento', **'Anexo'** (FR2), and **'ComposicaoFamiliar'** (to link Individuals to Families) are created.
2. All tables contain a `tenantId` field (data isolation) (NFR2).
3. The structure of the 'Família' and 'Indivíduo' tables reflects key fields and definitions from Cadastro Único (as per FR1 ACs) (NFR10).
4. Foreign keys (e.g., 'Atendimento' belongs to 'Indivíduo', 'Anexo' belongs to 'Indivíduo' or 'Família', 'ComposicaoFamiliar' links 'Indivíduo' and 'Família') are established to ensure referential integrity.
5. The 'Anexo' table must include fields for Vercel Blob URL, file type, size, `tenantId`, and upload metadata (user, date) (NFR5, NFR9).

## Tasks / Subtasks

- [ ] Task 1: Design Prisma schema for citizen data models (AC: #1, #2, #3)
  - [ ] Define Familia model with CadÚnico fields
  - [ ] Define Individuo model with CadÚnico fields
  - [ ] Define ComposicaoFamiliar junction table
  - [ ] Add tenantId to all models
  - [ ] Add created/updated timestamps and audit fields

- [ ] Task 2: Design Atendimento model (AC: #1, #2, #4)
  - [ ] Define Atendimento model structure
  - [ ] Add TipoDemanda enum
  - [ ] Link to Individuo via foreign key
  - [ ] Link to User (Técnico) via foreign key
  - [ ] Add tenantId for isolation

- [ ] Task 3: Design Anexo model (AC: #1, #2, #4, #5)
  - [ ] Define Anexo model with Vercel Blob fields
  - [ ] Add polymorphic relations (familiaId, individuoId)
  - [ ] Include file metadata (size, type, URL)
  - [ ] Add upload audit fields (uploadedBy, uploadedAt)
  - [ ] Add tenantId for isolation

- [ ] Task 4: Add enums and supporting types (AC: #3)
  - [ ] Create Sexo enum (MASCULINO, FEMININO, OUTRO)
  - [ ] Create Parentesco enum (RESPONSAVEL, CONJUGE, FILHO, etc.)
  - [ ] Create TipoDemanda enum (BENEFICIO_EVENTUAL, CADASTRO_UNICO, etc.)

- [ ] Task 5: Configure indexes for performance (AC: #2, #4)
  - [ ] Add composite indexes on tenantId + frequently queried fields
  - [ ] Index tenantId + cpf (unique constraint)
  - [ ] Index tenantId + nomeCompleto (search)
  - [ ] Index tenantId + data (atendimento queries)

- [ ] Task 6: Create and test migrations (AC: #1, #4)
  - [ ] Generate Prisma migration
  - [ ] Review generated SQL
  - [ ] Test migration on development database
  - [ ] Verify foreign key constraints
  - [ ] Verify unique constraints

- [ ] Task 7: Configure Prisma middleware for tenant isolation (AC: #2)
  - [ ] Implement automatic tenantId filtering
  - [ ] Add middleware to inject tenantId on create
  - [ ] Test multi-tenant isolation

## Dev Notes

### Architecture Patterns and Constraints

- **CadÚnico Compatibility**: Field names and structure must match federal Cadastro Único standards (NFR10)
- **Multi-tenancy**: Row-level isolation via tenantId in all tables (NFR2)
- **Audit Trail**: Track who created/modified records and when (NFR5, LGPD)
- **Referential Integrity**: Cascade rules to preserve historical data
- **Performance**: Composite indexes on tenantId + query fields

### Complete Prisma Schema

```prisma
// Familia Model
model Familia {
  id                    String   @id @default(cuid())
  tenantId              String
  responsavelFamiliarId String
  endereco              String
  rendaFamiliarTotal    Decimal?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  createdBy             String

  tenant                Municipality @relation(fields: [tenantId], references: [id])
  responsavel           Individuo @relation("ResponsavelFamiliar", fields: [responsavelFamiliarId], references: [id])
  membros               ComposicaoFamiliar[]
  anexos                Anexo[]

  @@index([tenantId])
  @@index([tenantId, responsavelFamiliarId])
}

// Individuo Model (CadÚnico compatible)
model Individuo {
  id                String   @id @default(cuid())
  tenantId          String
  nomeCompleto      String
  cpf               String
  dataNascimento    Date
  sexo              Sexo
  nomeMae           String?
  nis               String?  // CadÚnico NIS number

  // CadÚnico fields
  rg                String?
  tituloEleitor     String?
  carteiraTrabalho  String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String

  tenant            Municipality @relation(fields: [tenantId], references: [id])
  familiasResponsavel Familia[] @relation("ResponsavelFamiliar")
  familias          ComposicaoFamiliar[]
  atendimentos      Atendimento[]
  anexos            Anexo[]

  @@unique([tenantId, cpf])
  @@index([tenantId])
  @@index([tenantId, nomeCompleto])
}

enum Sexo {
  MASCULINO
  FEMININO
  OUTRO
}

// ComposicaoFamiliar (Junction Table)
model ComposicaoFamiliar {
  id           String   @id @default(cuid())
  familiaId    String
  individuoId  String
  parentesco   Parentesco

  familia      Familia @relation(fields: [familiaId], references: [id], onDelete: Cascade)
  individuo    Individuo @relation(fields: [individuoId], references: [id], onDelete: Cascade)

  @@unique([familiaId, individuoId])
}

enum Parentesco {
  RESPONSAVEL
  CONJUGE
  FILHO
  ENTEADO
  NETO
  PAI_MAE
  SOGRO_SOGRA
  IRMAO_IRMA
  GENRO_NORA
  OUTRO
}

// Atendimento Model
model Atendimento {
  id              String   @id @default(cuid())
  tenantId        String
  individuoId     String
  userId          String
  data            DateTime @default(now())
  tipoDemanda     TipoDemanda
  encaminhamento  String   @db.Text
  parecerSocial   String   @db.Text

  individuo       Individuo @relation(fields: [individuoId], references: [id], onDelete: Cascade)
  usuario         User @relation(fields: [userId], references: [id])

  @@index([tenantId, data])
  @@index([tenantId, individuoId])
}

enum TipoDemanda {
  BENEFICIO_EVENTUAL
  CADASTRO_UNICO
  BPC
  BOLSA_FAMILIA
  ORIENTACAO_SOCIAL
  ENCAMINHAMENTO_SAUDE
  ENCAMINHAMENTO_EDUCACAO
  VIOLACAO_DIREITOS
  OUTRO
}

// Anexo Model (File Attachments)
model Anexo {
  id          String   @id @default(cuid())
  tenantId    String
  blobUrl     String   // Vercel Blob URL
  fileName    String
  fileSize    Int      // Bytes
  mimeType    String   // image/jpeg, application/pdf
  uploadedAt  DateTime @default(now())
  uploadedBy  String   // User FK

  // Polymorphic relations
  familiaId   String?
  individuoId String?

  familia     Familia? @relation(fields: [familiaId], references: [id], onDelete: Cascade)
  individuo   Individuo? @relation(fields: [individuoId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}
```

### Prisma Middleware for Tenant Isolation

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

// Middleware to auto-inject tenantId
prisma.$use(async (params, next) => {
  // Get tenantId from context (set by middleware)
  const tenantId = getCurrentTenantId()

  if (!tenantId) {
    throw new Error('Tenant context not found')
  }

  // Auto-inject tenantId on create
  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      tenantId,
    }
  }

  // Auto-filter by tenantId on queries
  if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'delete'].includes(params.action)) {
    params.args.where = {
      ...params.args.where,
      tenantId,
    }
  }

  return next(params)
})
```

### References

- [Source: docs/solution-architecture.md#3.1-database-schema]
- [Source: docs/solution-architecture.md#3.2-data-models-and-relationships]
- [Source: docs/prd.md#nfr10-modelo-de-dados-compatível-com-cadúnico]
- [Source: docs/prd.md#épico-2-história-2.1]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
