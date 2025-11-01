# Solution Architecture Document

**Project:** AuroraSocial
**Date:** 2025-10-31
**Author:** Fusuma

## Executive Summary

AuroraSocial is a multi-tenant SaaS platform for Brazilian municipal social assistance management. Target: 50 municipalities in 24 months. Architecture: Next.js 15 modular monolith on Vercel serverless infrastructure with Postgres multi-tenancy (row-level isolation via `tenantId`). Two-tier user model (TÉCNICO operational users, GESTOR strategic managers). Core capabilities: citizen profile management (CadÚnico-compatible), assistance visit recording, file storage (Vercel Blob), dashboard analytics, official report generation (RMA - PDF/Excel export), bulk CSV import for onboarding.

**Compliance**: LGPD (Brazilian data protection) + SUAS (federal social assistance standards). **SLA**: 99.9% uptime. **Scale**: Designed for 50-500 municipalities with horizontal scaling via Vercel's serverless model.

---

## 1. Technology Stack and Decisions

### 1.1 Technology and Library Decision Table

| Category | Technology | Version | Justification |
|---|---|---|---|
| **Framework** | Next.js | 15.0.3 | App Router with RSC, SSR, API Routes collocated, Vercel-optimized |
| **Language** | TypeScript | 5.3.3 | Type safety, tooling, team productivity |
| **Runtime** | Node.js | 20.x LTS | Vercel Functions runtime |
| **Database** | Vercel Postgres | Neon-based | Serverless Postgres, auto-scaling, Vercel-native |
| **ORM** | Prisma | 5.7.1 | Type-safe queries, migrations, schema introspection |
| **Authentication** | Auth.js (NextAuth.js) | 5.0.0-beta.4 | Session management, RBAC, extensible providers |
| **File Storage** | Vercel Blob | Latest | Serverless object storage, CDN-backed, Vercel-native |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first, performance, UX spec alignment |
| **UI Components** | shadcn/ui + Radix UI | Latest | Accessible (WCAG AA), customizable, no deps |
| **Icons** | Lucide React | 0.294.0 | Lightweight, tree-shakable, consistent |
| **State Management** | Zustand | 4.4.7 | Lightweight (<1KB), minimal boilerplate, React-native |
| **Server State** | TanStack Query (React Query) | 5.17.0 | Caching, invalidation, optimistic updates |
| **Forms** | React Hook Form | 7.49.2 | Performance, minimal re-renders |
| **Validation** | Zod | 3.22.4 | Type-safe schemas, runtime validation, Prisma integration |
| **Data Tables** | TanStack Table | 8.11.2 | Headless, sorting, filtering, pagination |
| **Charts** | Recharts | 2.10.3 | Declarative, responsive, dashboard visualizations |
| **API Layer** | tRPC | 10.45.0 | End-to-end type safety, no code generation |
| **Email** | Resend | 2.1.0 | Modern API, React Email templates, deliverability |
| **Email Templates** | React Email | 2.0.0 | Type-safe email components, preview mode |
| **PDF Generation** | @react-pdf/renderer | 3.1.14 | React components → PDF, declarative |
| **Excel Export** | xlsx | 0.18.5 | XLSX generation, formula support |
| **CSV Parsing** | csv-parse | 5.5.3 | Streaming parser, RFC 4180 compliant |
| **Date/Time** | date-fns | 3.0.6 | Lightweight, tree-shakable, i18n-ready (pt-BR) |
| **Error Tracking** | Sentry | 7.92.0 | Error monitoring, performance tracking, alerts |
| **Testing (Unit)** | Vitest | 1.0.4 | Fast, Vite-powered, Jest-compatible |
| **Testing (E2E)** | Playwright | 1.40.1 | Multi-browser, reliable, visual testing |
| **Linting** | ESLint | 8.56.0 | Code quality, Next.js config |
| **Formatting** | Prettier | 3.1.1 | Consistent style, auto-formatting |
| **Type Checking** | TypeScript ESLint | 6.17.0 | Strict type checking, no implicit any |

---

## 2. Application Architecture

### 2.1 Architecture Pattern

**Modular Monolith (Serverless)**

- Single Next.js application deployed to Vercel
- Domain-driven module organization (`/src/modules/*`)
- Stateless Vercel Functions (API Routes)
- Horizontal auto-scaling (Vercel handles)
- No shared in-memory state

**Rationale**: MVP scope (3 epics, 15 stories) doesn't justify microservices complexity. Modular structure allows future service extraction if needed. Serverless eliminates infrastructure management (NFR1: 100% cloud-hosted).

**Module Boundaries**:
- `auth` - Authentication, session, tenant context middleware
- `users` - Team management, user CRUD, invitations
- `citizens` - Profile management, search, CadÚnico mapping
- `atendimentos` - Assistance visit recording
- `attachments` - File upload/download (Vercel Blob)
- `import` - Bulk CSV import
- `reporting` - Dashboard, RMA generation, export

### 2.2 Server-Side Rendering Strategy

**Hybrid SSR + RSC (React Server Components)**

- **Server Components (default)**: Static rendering where possible (login, public pages)
- **Dynamic SSR**: User-specific pages (profile, dashboard) render per-request with tenant context
- **Client Components**: Interactive UI (modals, forms, real-time updates)
- **Streaming**: Large data sets (search results, reports) use Suspense boundaries

**Cache Strategy**:
- Static pages: CDN cache (public, login)
- Dynamic pages: No cache headers (tenant-specific data)
- Dashboard metrics: In-memory cache per function instance (60min TTL)

### 2.3 Page Routing and Navigation

**App Router Structure**:

```
/app
├── (public)/
│   └── login/page.tsx              # Public login page
├── (auth)/                          # Auth-protected group
│   ├── layout.tsx                   # Auth middleware, tenant context
│   ├── (tecnico)/                   # TÉCNICO role routes
│   │   ├── pesquisar/page.tsx      # Search landing page
│   │   ├── perfil/[id]/page.tsx    # Profile view (dynamic)
│   │   └── novo/page.tsx            # New profile form
│   └── (gestor)/                    # GESTOR role routes (inherits tecnico)
│       ├── dashboard/page.tsx      # Dashboard landing
│       ├── relatorios/page.tsx     # Reports page
│       └── equipe/page.tsx         # Team management
└── api/
    └── trpc/[trpc]/route.ts        # tRPC API handler
```

**Middleware**:
- `/middleware.ts`: Session validation, tenant context injection, role-based route protection

**Navigation Components**:
- TÉCNICO: `<TecnicoNav />` - Search + User Menu
- GESTOR: `<GestorNav />` - Dashboard + Search + Reports + Team + User Menu
- Mobile: Hamburger menu + bottom nav bar

### 2.4 Data Fetching Approach

**Pattern: Server Components fetch → Client Components interact**

```typescript
// Server Component (app/perfil/[id]/page.tsx)
async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await prisma.individuo.findUnique({
    where: { id: params.id, tenantId: getTenantId() }
  })
  return <ProfileView profile={profile} />
}

// Client Component with mutations
'use client'
function AtendimentoModal() {
  const utils = trpc.useContext()
  const mutation = trpc.atendimentos.create.useMutation({
    onSuccess: () => utils.atendimentos.list.invalidate()
  })
  // ...
}
```

**Data Loading**:
- **Server fetches**: Initial page data (Prisma queries)
- **tRPC mutations**: Form submissions, CRUD operations
- **TanStack Query**: Client-side caching, optimistic updates
- **Suspense**: Streaming for slow queries (reports, bulk imports)

---

## 3. Data Architecture

### 3.1 Database Schema

**Multi-Tenancy Model**: Shared database, row-level isolation via `tenantId` column.

**Core Tables**:

```prisma
model Municipality {
  id        String   @id @default(cuid())
  name      String
  cnpj      String   @unique // Brazilian tax ID
  createdAt DateTime @default(now())

  users     User[]
  familias  Familia[]
  individuos Individuo[]
}

model User {
  id             String   @id @default(cuid())
  tenantId       String   // Municipality FK
  email          String   @unique
  name           String
  role           Role     @default(TECNICO) // GESTOR | TECNICO
  status         UserStatus @default(ACTIVE) // ACTIVE | INACTIVE
  createdAt      DateTime @default(now())
  invitedBy      String?  // User FK who invited

  tenant         Municipality @relation(fields: [tenantId], references: [id])
  atendimentos   Atendimento[]

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

model Familia {
  id                    String   @id @default(cuid())
  tenantId              String
  responsavelFamiliarId String   // Individuo FK
  endereco              String
  rendaFamiliarTotal    Decimal?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  createdBy             String   // User FK

  tenant                Municipality @relation(fields: [tenantId], references: [id])
  responsavel           Individuo @relation("ResponsavelFamiliar", fields: [responsavelFamiliarId], references: [id])
  membros               ComposicaoFamiliar[]
  anexos                Anexo[]

  @@index([tenantId])
  @@index([tenantId, responsavelFamiliarId])
}

model Individuo {
  id                String   @id @default(cuid())
  tenantId          String
  nomeCompleto      String
  cpf               String   // Masked in UI, unique per tenant
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
  createdBy         String   // User FK

  tenant            Municipality @relation(fields: [tenantId], references: [id])
  familiasResponsavel Familia[] @relation("ResponsavelFamiliar")
  familias          ComposicaoFamiliar[]
  atendimentos      Atendimento[]
  anexos            Anexo[]

  @@unique([tenantId, cpf]) // Prevent duplicate CPF per tenant
  @@index([tenantId])
  @@index([tenantId, nomeCompleto])
}

enum Sexo {
  MASCULINO
  FEMININO
  OUTRO
}

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

model Atendimento {
  id              String   @id @default(cuid())
  tenantId        String
  individuoId     String
  userId          String   // Técnico who recorded
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

model AuditLog {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  action    String   // CREATE, UPDATE, DELETE
  entityType String  // Familia, Individuo, User
  entityId  String
  changes   Json     // Before/after snapshot
  timestamp DateTime @default(now())

  @@index([tenantId, timestamp])
  @@index([tenantId, entityType, entityId])
}
```

### 3.2 Data Models and Relationships

**Entity Relationships**:

```
Municipality (1) ─┬─ (N) User
                   ├─ (N) Familia
                   └─ (N) Individuo

Familia (1) ─┬─ (N) ComposicaoFamiliar ─ (1) Individuo
              ├─ (1) Responsavel (Individuo)
              └─ (N) Anexo

Individuo (1) ─┬─ (N) Atendimento ─ (1) User (Técnico)
                ├─ (N) ComposicaoFamiliar
                └─ (N) Anexo

User (1) ─┬─ (N) Atendimento (recorded by)
           └─ (N) AuditLog
```

**Multi-Tenancy Enforcement**:
- All queries include `WHERE tenantId = ?` (Prisma middleware)
- Foreign keys validated within tenant scope
- Cascade deletes respect tenant boundaries

### 3.3 Data Migrations Strategy

**Prisma Migrate**:

```bash
# Development
npx prisma migrate dev --name init_schema

# Production (Vercel Postgres)
npx prisma migrate deploy
```

**Migration Workflow**:
1. Update `schema.prisma`
2. Generate migration: `prisma migrate dev`
3. Review SQL in `prisma/migrations/`
4. Commit migration files
5. Vercel auto-runs `prisma migrate deploy` on build

**Seed Data** (development):
```typescript
// prisma/seed.ts
- Sample municipality
- Test users (GESTOR + TÉCNICO)
- Sample families/individuals
```

**Backup Strategy**:
- Vercel Postgres: Daily automated backups (7-day retention)
- Explicit backups before major migrations
- Point-in-time recovery (PITR) via Neon console

---

## 4. API Design

### 4.1 API Structure

**tRPC Architecture** (End-to-End Type Safety)

```typescript
// src/server/trpc.ts
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession(authOptions)
  const tenantId = session?.user?.tenantId

  return {
    session,
    tenantId,
    prisma, // Auto-filtered by tenantId middleware
  }
}

// src/server/routers/_app.ts
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  citizens: citizensRouter,
  atendimentos: atendimentosRouter,
  attachments: attachmentsRouter,
  reporting: reportingRouter,
  import: importRouter,
})

export type AppRouter = typeof appRouter
```

**Client Usage**:

```typescript
// src/lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()
```

### 4.2 API Routes

**Core Routers**:

#### **Auth Router** (`auth.router.ts`)
```typescript
- auth.session.get() → Current user + tenant
- auth.session.validate() → Check session validity
```

#### **Users Router** (`users.router.ts`)
```typescript
- users.list() → List all users (tenant-scoped)
- users.invite({ email, role }) → Create invitation
- users.deactivate({ userId }) → Deactivate user
- users.reactivate({ userId }) → Reactivate user
```

#### **Citizens Router** (`citizens.router.ts`)
```typescript
- citizens.search({ query }) → Search individuals/families
- citizens.profile.get({ id }) → Get full profile
- citizens.profile.create({ data }) → Create new profile
- citizens.profile.update({ id, data }) → Update profile
- citizens.family.create({ data }) → Create family
- citizens.family.addMember({ familiaId, individuoId, parentesco })
```

#### **Atendimentos Router** (`atendimentos.router.ts`)
```typescript
- atendimentos.list({ individuoId }) → List atendimentos
- atendimentos.create({ individuoId, tipoDemanda, ... })
- atendimentos.stats() → Aggregated stats for dashboard
```

#### **Attachments Router** (`attachments.router.ts`)
```typescript
- attachments.upload.getSignedUrl() → Get Vercel Blob upload URL
- attachments.list({ individuoId?, familiaId? })
- attachments.delete({ id })
```

#### **Reporting Router** (`reporting.router.ts`)
```typescript
- reporting.dashboard.metrics() → KPI metrics (cached)
- reporting.rma.generate({ month, year }) → RMA data
- reporting.rma.exportPdf({ month, year }) → PDF blob
- reporting.rma.exportExcel({ month, year }) → XLSX blob
```

#### **Import Router** (`import.router.ts`)
```typescript
- import.csv.validate({ fileUrl }) → Validate CSV structure
- import.csv.process({ fileUrl }) → Bulk insert (background)
- import.csv.status({ jobId }) → Check import progress
```

### 4.3 Form Actions and Mutations

**Pattern**: Client components use `useMutation` hooks

```typescript
// Example: Register Atendimento
const mutation = trpc.atendimentos.create.useMutation({
  onSuccess: () => {
    toast.success('Atendimento registrado')
    utils.atendimentos.list.invalidate()
    closeModal()
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

const onSubmit = (data) => {
  mutation.mutate({
    individuoId: profile.id,
    tipoDemanda: data.tipoDemanda,
    encaminhamento: data.encaminhamento,
    parecerSocial: data.parecerSocial,
  })
}
```

**Optimistic Updates**:
```typescript
// Immediate UI feedback
const mutation = trpc.citizens.profile.update.useMutation({
  onMutate: async (newData) => {
    await utils.citizens.profile.get.cancel()
    const previousData = utils.citizens.profile.get.getData()
    utils.citizens.profile.get.setData(newData)
    return { previousData }
  },
  onError: (err, newData, context) => {
    utils.citizens.profile.get.setData(context.previousData)
  },
})
```

---

## 5. Authentication and Authorization

### 5.1 Auth Strategy

**Auth.js (NextAuth.js v5)** with Email Provider

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER, // Resend SMTP
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.tenantId = user.tenantId
      session.user.role = user.role
      return session
    },
    async signIn({ user }) {
      // Check if user is active
      if (user.status === 'INACTIVE') {
        return false
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
```

**Email Login Flow**:
1. User enters email → Email with magic link sent (Resend)
2. User clicks link → Token validated → Session created
3. Session cookie stored (httpOnly, secure, sameSite: lax)

**Email Templates** (React Email):
```typescript
// src/emails/user-invitation.tsx
import { Html, Button, Text, Container } from '@react-email/components'

export function UserInvitationEmail({ invitedBy, municipio, role, magicLink }) {
  return (
    <Html>
      <Container>
        <Text>Olá!</Text>
        <Text>{invitedBy} convidou você para o AuroraSocial de {municipio}.</Text>
        <Text>Sua função: {role === 'GESTOR' ? 'Gestor' : 'Técnico'}</Text>
        <Button href={magicLink}>Aceitar Convite</Button>
      </Container>
    </Html>
  )
}
```

**Templates**:
- `user-invitation.tsx` - New user invitation
- `magic-link.tsx` - Login magic link
- `password-reset.tsx` - Password reset (future)

### 5.2 Session Management

**Session Storage**: Database sessions (via Prisma adapter)

```typescript
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Session Expiration**: 30 days (rolling), idle timeout: 2 hours (client-side warning at 1:58)

**Tenant Context Injection**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession({ req: request })

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject tenantId into headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', session.user.tenantId)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}
```

### 5.3 Protected Routes

**Middleware Protection**:

```typescript
export const config = {
  matcher: [
    '/pesquisar/:path*',
    '/perfil/:path*',
    '/dashboard/:path*',
    '/relatorios/:path*',
    '/equipe/:path*',
    '/api/trpc/:path*',
  ],
}
```

**Layout-Level Protection**:
```typescript
// app/(auth)/layout.tsx
export default async function AuthLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <TenantProvider tenantId={session.user.tenantId}>{children}</TenantProvider>
}
```

### 5.4 Role-Based Access Control

**Role Enforcement**:

```typescript
// app/(gestor)/layout.tsx
export default async function GestorLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (session.user.role !== 'GESTOR') {
    return <AccessDenied />
  }

  return <GestorNav>{children}</GestorNav>
}
```

**tRPC Procedure Guards**:

```typescript
const gestorProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.role !== 'GESTOR') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})

export const usersRouter = router({
  invite: gestorProcedure
    .input(z.object({ email: z.string().email(), role: z.enum(['GESTOR', 'TECNICO']) }))
    .mutation(async ({ input, ctx }) => {
      // Only GESTORs can invite
    }),
})
```

**Permission Matrix**:

| Feature | TÉCNICO | GESTOR |
|---|---|---|
| Search citizens | ✅ | ✅ |
| View profiles | ✅ | ✅ |
| Create/edit profiles | ✅ | ✅ |
| Register atendimentos | ✅ | ✅ |
| Upload attachments | ✅ | ✅ |
| View dashboard | ❌ | ✅ |
| Generate reports | ❌ | ✅ |
| Manage team | ❌ | ✅ |
| Bulk import | ❌ | ✅ |

---

## 6. State Management

### 6.1 Server State

**TanStack Query (React Query)** for server data caching

```typescript
// src/lib/trpc/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

**Cache Keys** (auto-managed by tRPC):
```typescript
['citizens', 'profile', 'get', { id: '123' }]
['atendimentos', 'list', { individuoId: '123' }]
['reporting', 'dashboard', 'metrics']
```

**Invalidation Strategy**:
```typescript
// After mutation, invalidate related queries
const mutation = trpc.citizens.profile.update.useMutation({
  onSuccess: () => {
    utils.citizens.profile.get.invalidate({ id: profileId })
    utils.citizens.search.invalidate() // Refresh search results
  },
})
```

### 6.2 Client State

**Zustand** for lightweight client state

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  // Modal state
  isAtendimentoModalOpen: boolean
  openAtendimentoModal: (individuoId: string) => void
  closeAtendimentoModal: () => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Sidebar
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isAtendimentoModalOpen: false,
  openAtendimentoModal: (individuoId) => set({ isAtendimentoModalOpen: true, currentIndividuoId: individuoId }),
  closeAtendimentoModal: () => set({ isAtendimentoModalOpen: false }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
```

**Usage**:
```typescript
function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore()
  return <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
}
```

### 6.3 Form State

**React Hook Form + Zod**

```typescript
// Example: Atendimento form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const atendimentoSchema = z.object({
  tipoDemanda: z.enum(['BENEFICIO_EVENTUAL', 'CADASTRO_UNICO', ...]),
  encaminhamento: z.string().min(10, 'Mínimo 10 caracteres'),
  parecerSocial: z.string().min(20, 'Mínimo 20 caracteres'),
})

function AtendimentoForm() {
  const form = useForm({
    resolver: zodResolver(atendimentoSchema),
    defaultValues: {
      tipoDemanda: 'ORIENTACAO_SOCIAL',
      encaminhamento: '',
      parecerSocial: '',
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <form onSubmit={onSubmit}>
      <Select {...form.register('tipoDemanda')} />
      <Textarea {...form.register('encaminhamento')} />
      <Button type="submit" disabled={form.formState.isSubmitting}>Salvar</Button>
    </form>
  )
}
```

**Auto-Save (Drafts)**:
```typescript
// Local storage persistence
useEffect(() => {
  const subscription = form.watch((value) => {
    localStorage.setItem('atendimento-draft', JSON.stringify(value))
  })
  return () => subscription.unsubscribe()
}, [form.watch])

// Restore on mount
useEffect(() => {
  const draft = localStorage.getItem('atendimento-draft')
  if (draft) form.reset(JSON.parse(draft))
}, [])
```

### 6.4 Caching Strategy

**Multi-Layer Caching**:

1. **CDN Cache** (Vercel Edge)
   - Static assets: 1 year
   - Public pages (login): 1 hour
   - API responses: No cache (tenant-specific)

2. **Server-Side Cache** (In-Memory)
   ```typescript
   // src/lib/cache.ts
   const cache = new Map<string, { data: any; expires: number }>()

   export function cached<T>(key: string, fn: () => Promise<T>, ttl = 3600000) {
     const entry = cache.get(key)
     if (entry && entry.expires > Date.now()) {
       return entry.data as T
     }
     const data = await fn()
     cache.set(key, { data, expires: Date.now() + ttl })
     return data
   }
   ```

   **Usage** (Dashboard metrics):
   ```typescript
   export async function getDashboardMetrics(tenantId: string) {
     return cached(
       `dashboard:metrics:${tenantId}`,
       async () => {
         const [totalAtendimentos, totalFamilias] = await Promise.all([
           prisma.atendimento.count({ where: { tenantId } }),
           prisma.familia.count({ where: { tenantId } }),
         ])
         return { totalAtendimentos, totalFamilias }
       },
       3600000 // 1 hour TTL
     )
   }
   ```

3. **Client-Side Cache** (React Query)
   - Default: 5min stale time
   - Dashboard: 1 hour (manual refresh available)
   - Search results: 2 minutes
   - Profile data: 5 minutes

**Cache Invalidation**:
- Mutations trigger targeted invalidation
- Dashboard: Manual refresh button + hourly auto-refetch
- Search: Invalidated on profile create/update/delete

---

## 7. UI/UX Architecture

### 7.1 Component Structure

**Three-Tier Organization**:

```
/src/components
├── /ui/                         # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── modal.tsx
│   ├── table.tsx
│   └── ...
├── /shared/                     # Composite shared components
│   ├── SearchBar.tsx
│   ├── ProfileCard.tsx
│   ├── DataTable.tsx
│   ├── FileUpload.tsx
│   └── EmptyState.tsx
└── /modules/                    # Feature-specific components
    ├── /citizens
    │   ├── CitizenSearchResults.tsx
    │   ├── ProfileOverview.tsx
    │   ├── FamilyCompositionForm.tsx
    │   └── CpfValidator.tsx
    ├── /atendimentos
    │   ├── AtendimentoModal.tsx
    │   ├── AtendimentoHistoryList.tsx
    │   └── TipoDemandaSelect.tsx
    ├── /reporting
    │   ├── DashboardKpiCard.tsx
    │   ├── RmaReportPreview.tsx
    │   └── ExportButtons.tsx
    └── /attachments
        ├── FileUploadZone.tsx
        ├── AttachmentList.tsx
        └── FilePreview.tsx
```

**Component Patterns**:

- **Server Components** (default): Static/cached rendering
- **Client Components** (`'use client'`): Interactive elements
- **Composition**: `<ProfileView>` embeds `<AtendimentoModal>`, `<AttachmentList>`
- **Slots**: Layout-level slots for role-specific navigation

### 7.2 Styling Approach

**Tailwind CSS** + **Design Tokens**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#F9FAFB',
          // ... full scale
        },
        neutral: {
          50: '#F9FAFB',
          // ... per UX spec
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // 8px base grid
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

**CSS Variables** (for dynamic theming):
```css
:root {
  --primary: 217 91% 60%; /* HSL for shadcn/ui */
  --radius: 0.5rem;
}
```

**Usage**:
```tsx
<button className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2">
  Salvar
</button>
```

### 7.3 Responsive Design

**Breakpoints** (Tailwind defaults):
```
sm:  640px  (tablet)
md:  768px  (tablet landscape)
lg:  1024px (desktop)
xl:  1280px (large desktop)
```

**Mobile-First Patterns**:

- **Navigation**: Hamburger menu + bottom nav bar (< md)
- **Tables**: Card layout on mobile, full table on desktop
- **Modals**: Full-screen on mobile, centered on desktop
- **Dashboard**: Stacked cards (mobile) → 2×2 grid (tablet) → 4-column (desktop)

**Example**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard title="Total Atendimentos" value={1243} />
  {/* ... */}
</div>
```

### 7.4 Accessibility

**WCAG 2.1 Level AA Compliance** (NFR requirement)

- **Color Contrast**: All text/UI meets 4.5:1 (7:1 for body text)
- **Keyboard Navigation**: All interactive elements tabbable, visible focus rings
- **Screen Readers**: ARIA labels, roles, live regions
- **Form Validation**: `aria-invalid`, `aria-describedby` for errors
- **Skip Links**: "Pular para conteúdo principal" (hidden, focus-visible)
- **Landmarks**: `<nav>`, `<main>`, `<aside>` with `aria-label`

**shadcn/ui Benefits**: Built on Radix UI (accessible primitives)

**Testing**:
- Lighthouse (score ≥95)
- axe DevTools (0 violations)
- Manual keyboard nav + screen reader (NVDA, JAWS, VoiceOver)

---

## 8. Performance Optimization

### 8.1 SSR Caching

**Vercel Edge Caching**:
- Public pages: `Cache-Control: public, s-maxage=3600, stale-while-revalidate`
- Dynamic pages: `Cache-Control: private, no-cache`

**React Server Components**: Automatic partial pre-rendering (PPR) in Next.js 15

### 8.2 Static Generation

**Static Pages**:
- `/login` (public)
- Error pages (404, 403, 500)

**No Static Generation** for tenant-specific pages (data varies per user)

### 8.3 Image Optimization

**Next.js `<Image>` Component**:

```tsx
import Image from 'next/image'

<Image
  src={profilePhotoUrl}
  alt="Foto do cidadão"
  width={96}
  height={96}
  className="rounded-full"
  loading="lazy"
/>
```

**Vercel Image Optimization**: Automatic WebP/AVIF conversion, responsive sizing

### 8.4 Code Splitting

**Automatic** (Next.js App Router):
- Route-based splitting (each page = separate bundle)
- Shared components chunked

**Manual Optimization**:

```typescript
// Dynamic import for heavy modals
const ReportModal = dynamic(() => import('@/components/reporting/ReportModal'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-side only
})
```

**Bundle Analysis**:
```bash
ANALYZE=true npm run build
```

**Target**: < 200KB initial JS bundle, < 500KB total page weight

---

## 9. SEO and Meta Tags

### 9.1 Meta Tag Strategy

**Layout-Level Metadata**:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'AuroraSocial - Gestão de Assistência Social',
    template: '%s | AuroraSocial',
  },
  description: 'Plataforma SaaS para gestão municipal de assistência social no Brasil',
  keywords: ['assistência social', 'SUAS', 'CadÚnico', 'gestão pública'],
  authors: [{ name: 'AuroraSocial' }],
  robots: 'noindex, nofollow', // SaaS app, not for public indexing
}
```

**Page-Level**:
```typescript
// app/(gestor)/dashboard/page.tsx
export const metadata = {
  title: 'Dashboard',
}
```

### 9.2 Sitemap

**Not Applicable** - SaaS application (private, authenticated content)

### 9.3 Structured Data

**Not Applicable** - No public SEO requirements

---

## 10. Deployment Architecture

### 10.1 Hosting Platform

**Vercel** (specified in PRD)

**Infrastructure**:
- **Compute**: Vercel Functions (serverless Node.js 20)
- **Database**: Vercel Postgres (Neon-based, auto-scaling)
- **Storage**: Vercel Blob (S3-compatible, CDN-backed)
- **CDN**: Vercel Edge Network (global)

**Regions**:
- Primary: São Paulo (GRU1) - lowest latency for Brazilian users
- Failover: US East (IAD1)

### 10.2 CDN Strategy

**Vercel Edge Network**:
- Static assets: Immutable, 1-year cache
- Images: On-demand optimization, global cache
- API responses: No caching (tenant-specific)

### 10.3 Edge Functions

**Middleware** (Edge Runtime):

```typescript
// middleware.ts (runs on Edge)
export const config = {
  matcher: ['/api/:path*', '/(auth)/:path*'],
  runtime: 'edge',
}

export function middleware(request: NextRequest) {
  // Session validation (lightweight)
  // Tenant context injection
  // A/B testing (future)
}
```

**Edge API Routes** (future optimization):
- Read-heavy endpoints (search, profile view) can move to Edge for lower latency

### 10.4 Environment Configuration

**Environment Variables**:

```bash
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..." # For migrations

# Auth
NEXTAUTH_URL="https://app.aurorasocial.com.br"
NEXTAUTH_SECRET="..."
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@aurorasocial.com.br"

# Storage
BLOB_READ_WRITE_TOKEN="..."

# Email (Resend)
RESEND_API_KEY="..."

# Monitoring
SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."

# Feature Flags (future)
ENABLE_BULK_IMPORT="true"
```

**Environments**:
- **Development**: Local (`.env.local`)
- **Preview**: Vercel preview deployments (per PR)
- **Production**: Vercel production (main branch)

---

## 11. Component and Integration Overview

### 11.1 Major Modules

**Module Architecture** (Domain-Driven):

| Module | Responsibility | Dependencies |
|---|---|---|
| **auth** | Session, RBAC, middleware | Auth.js, Prisma |
| **users** | Team management, invitations | Resend (email), Prisma |
| **citizens** | Profile CRUD, search, CadÚnico | Prisma, Zod |
| **atendimentos** | Visit recording, history | Prisma |
| **attachments** | File upload/download | Vercel Blob, Prisma |
| **import** | CSV parsing, bulk insert | csv-parse, Prisma |
| **reporting** | Dashboard, RMA, exports | @react-pdf/renderer, xlsx, Prisma |

### 11.2 Page Structure

**Route-to-Module Mapping**:

| Route | Component | Modules Used |
|---|---|---|
| `/login` | `app/(public)/login/page.tsx` | auth |
| `/pesquisar` | `app/(tecnico)/pesquisar/page.tsx` | citizens |
| `/perfil/[id]` | `app/(tecnico)/perfil/[id]/page.tsx` | citizens, atendimentos, attachments |
| `/dashboard` | `app/(gestor)/dashboard/page.tsx` | reporting |
| `/relatorios` | `app/(gestor)/relatorios/page.tsx` | reporting |
| `/equipe` | `app/(gestor)/equipe/page.tsx` | users |

### 11.3 Shared Components

**Cross-Module Components** (`/src/components/shared`):

- **SearchBar**: Forgiving search (ignore accents, partial match)
- **ProfileCard**: Citizen summary card (search results, lists)
- **DataTable**: Generic table with sorting/pagination (TanStack Table)
- **FileUpload**: Drag-and-drop upload zone (Vercel Blob)
- **EmptyState**: No data placeholder
- **LoadingState**: Skeleton screens
- **Toast**: Notification system (sonner)

### 11.4 Third-Party Integrations

| Service | Purpose | Integration Point |
|---|---|---|
| **Vercel Postgres** | Primary database | Prisma ORM |
| **Vercel Blob** | File storage | `@vercel/blob` SDK |
| **Auth.js** | Authentication | Session provider, middleware |
| **Resend** | Transactional email | User invitations |
| **Sentry** | Error tracking | SDK init in `app/layout.tsx` |
| **TanStack Query** | Server state caching | tRPC integration |

**Future Integrations** (post-MVP):
- **CadÚnico API**: Federal registry sync
- **Stripe**: Municipality subscriptions
- **WhatsApp Business API**: Notifications

---

## 12. Architecture Decision Records

### ADR-001: Next.js App Router (RSC) over Pages Router

**Decision**: Use Next.js 15 App Router with React Server Components

**Rationale**:
- Server Components: Reduce client JS bundle (faster initial load)
- Streaming: Progressive rendering for slow queries (reports)
- Colocation: API routes + pages in same directory structure
- Future-proof: Pages Router in maintenance mode

**Trade-offs**:
- Learning curve (RSC paradigm)
- Some libraries incompatible with Server Components (need `'use client'`)

---

### ADR-002: Shared Database Multi-Tenancy over Separate Databases

**Decision**: Single Postgres database with `tenantId` column isolation

**Rationale**:
- Cost-effective: One database instance for 50-500 municipalities
- Operational simplicity: Single migration path, one backup strategy
- Performance: Postgres scales to millions of rows with proper indexing
- Vercel Postgres pricing: Shared database = lower cost

**Trade-offs**:
- Risk: Application-layer bug could leak tenant data (mitigated by Prisma middleware, tests)
- Less isolation than separate databases
- Query complexity: Always filter by tenantId

**Why not separate databases?**
- Cost: 50 databases = 50× connection pooling overhead
- Complexity: 50× migrations, backups, monitoring

---

### ADR-003: tRPC over REST for API Layer

**Decision**: tRPC for type-safe API communication

**Rationale**:
- End-to-end type safety: Frontend/backend share types (no OpenAPI codegen)
- DX: Autocomplete, refactoring, compile-time errors
- Next.js integration: Works seamlessly with App Router
- Performance: RPC-style (no over-fetching like GraphQL)

**Trade-offs**:
- TypeScript-only (not a concern for this project)
- Less suitable for public APIs (future: add REST layer if needed)

---

### ADR-004: Prisma ORM over Raw SQL

**Decision**: Prisma for database access

**Rationale**:
- Type safety: Generated types from schema
- Migrations: Declarative schema changes
- Multi-tenancy: Middleware for automatic tenantId filtering
- DX: Intuitive API, great tooling

**Trade-offs**:
- Slight overhead vs. raw SQL (acceptable for CRUD-heavy app)
- Complex queries may require raw SQL (use `prisma.$queryRaw` when needed)

---

### ADR-005: Zustand over Redux/Context for Client State

**Decision**: Zustand for lightweight client state

**Rationale**:
- Bundle size: <1KB vs. 3KB (Redux Toolkit)
- Simplicity: No boilerplate (actions, reducers, dispatch)
- Performance: Selective subscriptions (no Context re-render issues)
- Use case fit: Simple UI state (modals, sidebar)

**Trade-offs**:
- Less ecosystem than Redux (not needed for this app)

---

### ADR-006: In-Memory Cache over Redis for Dashboard Metrics

**Decision**: Per-function-instance in-memory cache (1-hour TTL)

**Rationale**:
- Cost: Redis adds infrastructure cost
- Serverless: Vercel Functions are ephemeral (cache recreates per cold start)
- Access pattern: Dashboard metrics change infrequently (hourly refresh acceptable)
- Simplicity: No external service to manage

**Trade-offs**:
- Cache invalidation: Can't invalidate across all function instances (acceptable for hourly data)
- Cold starts: Cache rebuilt per instance

**When to reconsider**: If >500 municipalities (global cache needed)

---

### ADR-007: @react-pdf/renderer over Puppeteer for PDF Generation

**Decision**: @react-pdf/renderer for RMA reports

**Rationale**:
- Declarative: React components → PDF
- Bundle size: Lightweight vs. full Chromium (~300MB)
- Vercel: Puppeteer requires separate deployment (Headless Chrome)
- Performance: Faster generation

**Trade-offs**:
- Styling limitations: No full CSS (subset only)
- Complex layouts: Harder than HTML/CSS

**When to reconsider**: If reports need pixel-perfect HTML rendering

---

## 13. Implementation Guidance

### 13.1 Development Workflow

**Local Development**:

```bash
# 1. Clone repo
git clone <repo-url>
cd aurorasocial

# 2. Install dependencies
npm install

# 3. Setup database (local Postgres or Vercel Postgres)
cp .env.example .env.local
# Edit DATABASE_URL

# 4. Run migrations
npx prisma migrate dev

# 5. Seed data (optional)
npx prisma db seed

# 6. Start dev server
npm run dev
```

**Branch Strategy**:
- `main` → Production (auto-deploy to Vercel)
- `develop` → Staging (auto-deploy to Vercel preview)
- Feature branches: `feature/epic-2-story-3-profile-view`

**PR Workflow**:
1. Create feature branch
2. Implement + tests
3. Open PR → Vercel preview deployment created
4. Code review + QA on preview
5. Merge → Auto-deploy to staging/production

### 13.2 File Organization

```
/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes
│   │   ├── (auth)/             # Protected routes
│   │   │   ├── (tecnico)/
│   │   │   └── (gestor)/
│   │   ├── api/
│   │   │   └── trpc/[trpc]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── shared/             # Reusable composites
│   │   └── modules/            # Feature-specific
│   ├── modules/                # Domain logic
│   │   ├── auth/
│   │   ├── users/
│   │   ├── citizens/
│   │   ├── atendimentos/
│   │   ├── attachments/
│   │   ├── import/
│   │   └── reporting/
│   ├── server/
│   │   ├── trpc.ts             # tRPC context
│   │   └── routers/            # tRPC routers
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # Auth.js config
│   │   ├── trpc/               # tRPC client setup
│   │   ├── utils.ts            # Helpers
│   │   └── validators.ts       # Zod schemas
│   ├── stores/                 # Zustand stores
│   └── types/                  # Shared TypeScript types
├── public/
│   ├── fonts/
│   └── images/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .eslintrc.json
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.js
```

### 13.3 Naming Conventions

**Files**:
- Components: PascalCase (`ProfileCard.tsx`)
- Utilities: camelCase (`formatCpf.ts`)
- API routes: kebab-case (`get-profile.ts`)

**Database**:
- Tables: PascalCase (`Individuo`, `ComposicaoFamiliar`)
- Columns: camelCase (`nomeCompleto`, `dataNascimento`)

**TypeScript**:
- Interfaces: `I` prefix (`IUser`) or noun (`User`)
- Types: PascalCase (`Role`, `TipoDemanda`)
- Enums: PascalCase keys (`Sexo.MASCULINO`)

**tRPC**:
- Routers: noun plural (`citizens`, `atendimentos`)
- Procedures: verb (`create`, `list`, `update`)

### 13.4 Best Practices

**Security**:
- ✅ Always filter by `tenantId` (Prisma middleware enforces)
- ✅ Validate file uploads (type, size) before Blob upload
- ✅ Sanitize user input (Zod schemas)
- ✅ Use `httpOnly` cookies for sessions
- ✅ CSP headers for XSS protection

**Performance**:
- ✅ Use Server Components by default (`'use client'` only when needed)
- ✅ Lazy load modals/heavy components
- ✅ Index database queries (composite indexes on `tenantId + otherColumn`)
- ✅ Paginate large lists (search results, atendimento history)

**Accessibility**:
- ✅ Use semantic HTML (`<nav>`, `<main>`, `<aside>`)
- ✅ Add ARIA labels to icon-only buttons
- ✅ Test with keyboard navigation
- ✅ Test with screen reader

**Code Quality**:
- ✅ Run ESLint + Prettier on save
- ✅ Write unit tests for business logic
- ✅ Write integration tests for API routes
- ✅ Write E2E tests for critical flows (login, register atendimento)

---

## 14. Proposed Source Tree

```
aurorasocial/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, test, build
│       └── deploy.yml          # Vercel deploy (auto)
├── prisma/
│   ├── schema.prisma           # Full schema (above)
│   ├── migrations/
│   │   └── 20250101000000_init/
│   │       └── migration.sql
│   └── seed.ts                 # Municipality + test users
├── public/
│   ├── fonts/
│   │   ├── Inter-Regular.woff2
│   │   └── JetBrainsMono-Regular.woff2
│   └── images/
│       └── logo.svg
├── src/
│   ├── emails/                 # React Email templates
│   │   ├── user-invitation.tsx # User invitation email
│   │   ├── magic-link.tsx      # Login magic link email
│   │   └── components/         # Shared email components
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # Email login form
│   │   │   └── layout.tsx      # Public layout (minimal)
│   │   ├── (auth)/             # Protected group
│   │   │   ├── layout.tsx      # Auth middleware, tenant provider
│   │   │   ├── (tecnico)/
│   │   │   │   ├── pesquisar/
│   │   │   │   │   └── page.tsx # Search landing (TÉCNICO default)
│   │   │   │   ├── perfil/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Profile view (tabs)
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx # Create profile form
│   │   │   │   └── layout.tsx  # TÉCNICO nav
│   │   │   └── (gestor)/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx # Dashboard (GESTOR default)
│   │   │       ├── relatorios/
│   │   │       │   └── page.tsx # RMA generation
│   │   │       ├── equipe/
│   │   │       │   └── page.tsx # User management
│   │   │       └── layout.tsx  # GESTOR nav (extends TÉCNICO)
│   │   ├── api/
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/
│   │   │   │       └── route.ts # tRPC handler
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts # Auth.js API routes
│   │   ├── layout.tsx          # Root layout (providers)
│   │   ├── globals.css         # Tailwind imports
│   │   └── not-found.tsx       # 404 page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (40+ components)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (generated via shadcn CLI)
│   │   ├── shared/
│   │   │   ├── SearchBar.tsx   # Forgiving search input
│   │   │   ├── ProfileCard.tsx # Citizen summary card
│   │   │   ├── DataTable.tsx   # Generic table wrapper
│   │   │   ├── FileUpload.tsx  # Drag-and-drop upload
│   │   │   ├── EmptyState.tsx  # No data placeholder
│   │   │   ├── LoadingState.tsx # Skeleton screens
│   │   │   └── NavBar.tsx      # Top navigation
│   │   └── modules/
│   │       ├── citizens/
│   │       │   ├── CitizenSearchResults.tsx
│   │       │   ├── ProfileOverview.tsx
│   │       │   ├── ProfileTabs.tsx
│   │       │   ├── FamilyCompositionForm.tsx
│   │       │   └── CpfValidator.tsx
│   │       ├── atendimentos/
│   │       │   ├── AtendimentoModal.tsx
│   │       │   ├── AtendimentoHistoryList.tsx
│   │       │   ├── AtendimentoForm.tsx
│   │       │   └── TipoDemandaSelect.tsx
│   │       ├── attachments/
│   │       │   ├── FileUploadZone.tsx
│   │       │   ├── AttachmentList.tsx
│   │       │   └── FilePreview.tsx
│   │       ├── reporting/
│   │       │   ├── DashboardKpiCard.tsx
│   │       │   ├── AtendimentosChart.tsx
│   │       │   ├── RmaReportPreview.tsx
│   │       │   └── ExportButtons.tsx
│   │       └── users/
│   │           ├── UserList.tsx
│   │           ├── InviteUserModal.tsx
│   │           └── UserStatusBadge.tsx
│   ├── modules/                # Domain logic (server-side)
│   │   ├── auth/
│   │   │   ├── middleware.ts   # Tenant context injection
│   │   │   └── rbac.ts         # Role checks
│   │   ├── users/
│   │   │   ├── service.ts      # User CRUD logic
│   │   │   └── email.ts        # Invitation emails (Resend)
│   │   ├── citizens/
│   │   │   ├── service.ts      # Profile CRUD
│   │   │   ├── search.ts       # Search logic (fuzzy match)
│   │   │   └── cadunico.ts     # CadÚnico mapping
│   │   ├── atendimentos/
│   │   │   └── service.ts      # Atendimento CRUD
│   │   ├── attachments/
│   │   │   └── blob.ts         # Vercel Blob integration
│   │   ├── import/
│   │   │   ├── csv-parser.ts   # CSV parsing + validation
│   │   │   └── bulk-insert.ts  # Batch Prisma inserts
│   │   └── reporting/
│   │       ├── dashboard.ts    # Metrics aggregation
│   │       ├── rma-generator.ts # RMA data fetch
│   │       ├── pdf-export.ts   # @react-pdf/renderer
│   │       └── excel-export.ts # xlsx library
│   ├── server/
│   │   ├── trpc.ts             # tRPC context + middleware
│   │   └── routers/
│   │       ├── _app.ts         # Root router
│   │       ├── auth.ts         # Auth router
│   │       ├── users.ts        # Users router
│   │       ├── citizens.ts     # Citizens router
│   │       ├── atendimentos.ts # Atendimentos router
│   │       ├── attachments.ts  # Attachments router
│   │       ├── import.ts       # Import router
│   │       └── reporting.ts    # Reporting router
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # Auth.js config
│   │   ├── trpc/
│   │   │   ├── client.ts       # tRPC React client
│   │   │   └── server.ts       # tRPC server client
│   │   ├── cache.ts            # In-memory cache utility
│   │   ├── utils.ts            # General helpers
│   │   ├── validators.ts       # Zod schemas (shared)
│   │   └── formatters.ts       # CPF mask, date formatting (pt-BR)
│   ├── stores/
│   │   └── ui-store.ts         # Zustand UI state
│   └── types/
│       ├── database.ts         # Prisma type re-exports
│       └── api.ts              # tRPC type utilities
├── tests/
│   ├── unit/
│   │   ├── citizens.service.test.ts
│   │   ├── cpf-validator.test.ts
│   │   └── cadunico-mapper.test.ts
│   ├── integration/
│   │   ├── citizens.router.test.ts
│   │   ├── atendimentos.router.test.ts
│   │   └── auth.test.ts
│   └── e2e/
│       ├── login.spec.ts       # Playwright
│       ├── search-profile.spec.ts
│       └── register-atendimento.spec.ts
├── .env.example                # Template env vars
├── .env.local                  # Local dev (gitignored)
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── middleware.ts               # Next.js middleware (Edge)
├── next.config.js              # Next.js config
├── package.json
├── tailwind.config.ts          # Tailwind + shadcn config
├── tsconfig.json               # TypeScript config
├── vitest.config.ts            # Vitest config
└── playwright.config.ts        # Playwright config
```

**Critical Folders**:

- **`/src/modules`**: Domain-driven business logic (Epic 1, 2, 3 → corresponding modules). Each module is self-contained (service logic, types). Called by tRPC routers.

- **`/src/server/routers`**: tRPC API layer. Thin routing layer that delegates to `/src/modules` services. Each router maps to domain module.

- **`/prisma`**: Single source of truth for database schema. Migrations are versioned. Seed data for local development.

---

## 15. Testing Strategy

### 15.1 Unit Tests

**Framework**: Vitest

**Scope**: Business logic, utilities, validators

**Examples**:
```typescript
// tests/unit/cpf-validator.test.ts
import { validateCpf } from '@/lib/validators'

describe('validateCpf', () => {
  it('accepts valid CPF', () => {
    expect(validateCpf('123.456.789-09')).toBe(true)
  })

  it('rejects invalid CPF', () => {
    expect(validateCpf('000.000.000-00')).toBe(false)
  })
})
```

**Coverage Target**: 80% for `/src/lib` and `/src/modules`

### 15.2 Integration Tests

**Framework**: Vitest + tRPC test client

**Scope**: API routes, database interactions

**Examples**:
```typescript
// tests/integration/citizens.router.test.ts
import { createInnerTRPCContext } from '@/server/trpc'
import { appRouter } from '@/server/routers/_app'

describe('citizens router', () => {
  it('creates profile with valid data', async () => {
    const ctx = await createInnerTRPCContext({ session: mockSession })
    const caller = appRouter.createCaller(ctx)

    const profile = await caller.citizens.profile.create({
      nomeCompleto: 'João Silva',
      cpf: '123.456.789-09',
      dataNascimento: new Date('1980-01-01'),
      sexo: 'MASCULINO',
    })

    expect(profile.id).toBeDefined()
    expect(profile.tenantId).toBe(mockSession.user.tenantId)
  })

  it('prevents duplicate CPF within tenant', async () => {
    // ...
  })
})
```

**Coverage Target**: 90% for `/src/server/routers`

### 15.3 E2E Tests

**Framework**: Playwright

**Scope**: Critical user flows

**Tests**:
1. Login flow (email magic link)
2. Search citizen → View profile
3. Register atendimento (modal flow)
4. Generate RMA report → Export PDF
5. Invite user → Email sent
6. Bulk import CSV → Validate + import

**Example**:
```typescript
// tests/e2e/search-profile.spec.ts
import { test, expect } from '@playwright/test'

test('search and view citizen profile', async ({ page }) => {
  await page.goto('/login')
  // ... login flow

  await page.goto('/pesquisar')
  await page.fill('[name="search"]', 'João Silva')
  await page.waitForSelector('text=João Silva Santos')
  await page.click('text=João Silva Santos')

  await expect(page).toHaveURL(/\/perfil\/[a-z0-9]+/)
  await expect(page.locator('h1')).toContainText('João Silva Santos')
  await expect(page.locator('text=CPF')).toBeVisible()
})
```

**Coverage Target**: 100% for user stories (Epic 1-3)

### 15.4 Coverage Goals

| Test Type | Target | Rationale |
|---|---|---|
| Unit | 80% | Core logic, utilities |
| Integration | 90% | API routes, DB interactions |
| E2E | 100% stories | All user stories tested end-to-end |

**CI/CD**: Tests run on every PR (GitHub Actions)

---

## 16. DevOps and CI/CD

**Deployment**: Vercel (auto-deploy from GitHub)

**Environments**:
- **Development**: Local (`npm run dev`)
- **Preview**: Vercel preview (per PR)
- **Production**: Vercel production (main branch)

**CI/CD Pipeline** (GitHub Actions):

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - run: npm run build
```

**Vercel Auto-Deploy**:
- Push to `main` → Production deployment
- Open PR → Preview deployment (unique URL)
- Migrations run automatically (`prisma migrate deploy`)

**Monitoring**:
- Sentry: Error tracking, performance monitoring
- Vercel Analytics: Page load times, Core Web Vitals
- Vercel Logs: Function logs (stdout/stderr)

**Alerts**:
- Sentry: Critical errors → Slack/email
- Vercel: Failed deployments → Email

---

## 17. Security

### 17.1 Multi-Tenancy Security

**Tenant Isolation**:
- All DB queries filtered by `tenantId` (Prisma middleware)
- Session includes `tenantId` (validated on every request)
- Cross-tenant access blocked at middleware layer

**Testing**:
- Integration tests verify tenant isolation
- E2E tests verify no cross-tenant data leakage

### 17.2 Authentication Security

**Session Security**:
- `httpOnly` cookies (no JS access)
- `secure` flag (HTTPS only)
- `sameSite: lax` (CSRF protection)
- 30-day expiration (rolling)

**Password-less**: Email magic links (no password storage, no credential stuffing)

### 17.3 Data Protection (LGPD Compliance)

**Encryption**:
- At rest: Vercel Postgres (AES-256)
- In transit: TLS 1.3 (Vercel enforces HTTPS)

**Audit Logs**:
- All profile edits logged (`AuditLog` table)
- User actions tracked (who, what, when)

**Data Minimization**:
- CPF masked in UI (`***.***.123-45`)
- Sensitive fields (NIS, RG) only visible to GESTOR

**Right to Deletion**:
- Soft delete: `status = 'INACTIVE'` (preserve referential integrity)
- Hard delete: Admin tool (future) for LGPD requests

### 17.4 File Upload Security

**Validation**:
- Allowed types: `.jpg`, `.png`, `.pdf` (MIME type + extension check)
- Max size: 10MB
- Virus scanning: Vercel Blob (built-in)

**Access Control**:
- Signed URLs (Vercel Blob) with 1-hour expiration
- tRPC middleware validates tenant access before generating signed URL

### 17.5 Input Validation

**Zod Schemas**: All inputs validated (tRPC + React Hook Form)

**SQL Injection**: Prisma (parameterized queries, no raw SQL interpolation)

**XSS Protection**: React (auto-escapes), CSP headers

### 17.6 Rate Limiting

**Future Implementation** (post-MVP):
- Vercel Edge Middleware: Rate limit by IP (100 req/min)
- tRPC middleware: Rate limit by user (1000 req/hour)

### 17.7 Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
          },
        ],
      },
    ]
  },
}
```

---

## Specialist Sections

### Testing Specialist (Inline)

**Test Data Management**: Use Prisma seeding for deterministic test data. Each test suite creates isolated tenant data.

**Visual Regression**: Playwright screenshots for key screens (dashboard, profile view). Store in `/tests/screenshots/baseline`.

**Accessibility Testing**: axe-core integration in Playwright tests. Fail CI if WCAG AA violations detected.

### DevOps Specialist (Inline)

**Database Backups**: Vercel Postgres automated daily backups (7-day retention). Manual backups before migrations via Neon console.

**Secrets Management**: Vercel environment variables (encrypted at rest). Rotate secrets quarterly (DATABASE_URL, NEXTAUTH_SECRET, API keys).

**Rollback Strategy**:

**Application Rollback** (Vercel):
1. Navigate to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." → "Redeploy"
4. Instant rollback (< 30 seconds)

**Database Migration Rollback** (Prisma):

**Scenario 1: Failed migration (not yet applied to production)**
```bash
# Mark migration as failed/rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Fix migration SQL
# Re-run migration
npx prisma migrate dev
```

**Scenario 2: Applied migration causing issues**
```bash
# 1. Create compensating migration (reverses changes)
# Example: If migration added column, create migration to drop it
npx prisma migrate dev --name rollback_<original_migration>

# 2. Deploy compensating migration
npx prisma migrate deploy

# 3. Rollback application code
# (Vercel redeploy previous version)
```

**Scenario 3: Critical data loss risk**
```bash
# 1. Stop all deployments (disable auto-deploy on Vercel)
# 2. Restore database from backup (Neon console)
#    - Select backup timestamp (before migration)
#    - Restore to new instance
# 3. Update DATABASE_URL to restored instance
# 4. Redeploy application (previous version)
# 5. Verify data integrity
# 6. Update DNS/connection strings if needed
```

**Best Practices**:
- Always test migrations on staging first
- Take manual backup before major schema changes
- Keep migration SQL reviewable (avoid auto-generated destructive changes)
- Document rollback plan in PR description

### Security Specialist (Inline)

**Penetration Testing**: Annual third-party pentest (LGPD requirement for sensitive data).

**Dependency Scanning**: Dependabot (GitHub) for npm package vulnerabilities. Auto-merge non-breaking security patches.

**Incident Response**: Sentry alerts → On-call engineer notified (PagerDuty integration). Playbook: Isolate tenant, investigate audit logs, notify users (24-hour window per LGPD).

---

_Generated using BMad Method Solution Architecture workflow v6.0_
