# Story 1.3: Estabelecimento de Papéis (Roles) e Proteção de Rotas

Status: Approved

## Story

As an Architect/Developer,
I want to implement Role-Based Access Control (RBAC) in the user session (Auth.js),
so that the system can distinguish between "Técnico" and "Gestor" and protect routes.

## Acceptance Criteria

1. The User data model (in Vercel Postgres) must include a "role" field (e.g., 'GESTOR', 'TECNICO').
2. The Auth.js session must include the user's "role".
3. Administrative routes/screens (e.g., "User Management Page") must be protected, allowing access only to users with the 'GESTOR' role.
4. A 'TECNICO' user attempting to access a 'GESTOR' route must be blocked/redirected.

## Tasks / Subtasks

- [ ] Task 1: Update User model with role field (AC: #1)
  - [ ] Add `role` enum to Prisma schema (GESTOR, TECNICO)
  - [ ] Create migration for role field
  - [ ] Set default role to TECNICO
  - [ ] Update existing seed data

- [ ] Task 2: Include role in Auth.js session (AC: #2)
  - [ ] Update Auth.js session callback
  - [ ] Add role to session user object
  - [ ] Update TypeScript types for session
  - [ ] Test session role inclusion

- [ ] Task 3: Create middleware for route protection (AC: #3, #4)
  - [ ] Create `/middleware.ts` for Next.js middleware
  - [ ] Implement session validation
  - [ ] Add role-based route protection logic
  - [ ] Configure matcher for protected routes

- [ ] Task 4: Implement layout-level role guards (AC: #3, #4)
  - [ ] Create `app/(auth)/(gestor)/layout.tsx` with role check
  - [ ] Implement `<AccessDenied />` component
  - [ ] Add redirect logic for unauthorized access
  - [ ] Test TÉCNICO blocking on GESTOR routes

- [ ] Task 5: Create tRPC procedure guards (AC: #3)
  - [ ] Create `gestorProcedure` middleware
  - [ ] Create `tecnicoProcedure` middleware
  - [ ] Implement FORBIDDEN error handling
  - [ ] Apply guards to appropriate routers

## Dev Notes

### Architecture Patterns and Constraints

- **RBAC**: Two-tier role model (TÉCNICO operational, GESTOR strategic)
- **Middleware**: Next.js Edge middleware for session validation
- **Protection Layers**: Middleware + Layout + tRPC guards (defense in depth)
- **Error Handling**: Clear access denied messages and redirects

### Role Permission Matrix

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

### Middleware Implementation

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject tenantId into headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', session.user.tenantId)
  requestHeaders.set('x-user-role', session.user.role)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

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

### Layout-Level Protection

```typescript
// app/(auth)/(gestor)/layout.tsx
export default async function GestorLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (session.user.role !== 'GESTOR') {
    return <AccessDenied />
  }

  return <GestorNav>{children}</GestorNav>
}
```

### tRPC Procedure Guards

```typescript
// src/server/trpc.ts
const gestorProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.role !== 'GESTOR') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})

const tecnicoProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next()
})
```

### References

- [Source: docs/solution-architecture.md#5.4-role-based-access-control]
- [Source: docs/solution-architecture.md#2.3-page-routing-and-navigation]
- [Source: docs/prd.md#épico-1-história-1.3]

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
