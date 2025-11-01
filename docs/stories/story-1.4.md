# Story 1.4: Visualização da Página de Gestão de Usuários

Status: Approved

## Story

As a "Gestor Público",
I want to navigate to the "User Management Page" and see a list of all users (Técnicos and Gestores) from my municipality,
so that I can audit who has access to the system.

## Acceptance Criteria

1. The page must be accessible (e.g., through a "Team" link in the menu), but only for the 'GESTOR' role (Story 1.3).
2. The page must display a table or list of users.
3. The list must show essential information (e.g., Name, Email, Role).
4. **Security:** The query must display **only** users associated with the same municipality (Tenant) as the Gestor (NFR2, NFR5).
5. The interface meets WCAG AA standards.

## Tasks / Subtasks

- [ ] Task 1: Create user management page route (AC: #1)
  - [ ] Create `app/(auth)/(gestor)/equipe/page.tsx`
  - [ ] Verify role protection (GESTOR only)
  - [ ] Add "Equipe" link to GESTOR navigation

- [ ] Task 2: Create tRPC users router (AC: #2, #3, #4)
  - [ ] Create `src/server/routers/users.ts`
  - [ ] Implement `users.list()` procedure with `gestorProcedure` guard
  - [ ] Add tenantId filtering to Prisma query
  - [ ] Return user data (id, name, email, role, status, createdAt)

- [ ] Task 3: Implement user list component (AC: #2, #3)
  - [ ] Create `UserList.tsx` component
  - [ ] Use TanStack Table for data table
  - [ ] Display columns: Name, Email, Role, Status
  - [ ] Add loading and empty states

- [ ] Task 4: Apply UI/UX requirements (AC: #5)
  - [ ] Implement clean table design with Tailwind CSS
  - [ ] Ensure WCAG AA compliance
  - [ ] Add proper ARIA labels and roles
  - [ ] Test keyboard navigation
  - [ ] Implement responsive design (card layout on mobile)

- [ ] Task 5: Add role and status badges (AC: #3)
  - [ ] Create `UserStatusBadge.tsx` component
  - [ ] Create `UserRoleBadge.tsx` component
  - [ ] Apply semantic colors (ACTIVE=green, INACTIVE=red, GESTOR=blue, TÉCNICO=gray)

## Dev Notes

### Architecture Patterns and Constraints

- **Route Protection**: GESTOR-only access via layout guard
- **Multi-tenancy**: All queries filtered by tenantId (automatic via Prisma middleware)
- **Data Table**: TanStack Table for sorting, filtering, pagination
- **UI Components**: shadcn/ui table primitives + custom badges
- **Accessibility**: WCAG 2.1 Level AA compliance

### Component Structure

```
/src/app/(auth)/(gestor)/equipe/
├── page.tsx                    # Server Component (data fetching)
/src/components/modules/users/
├── UserList.tsx                # Client Component (table)
├── UserStatusBadge.tsx         # Status indicator
└── UserRoleBadge.tsx           # Role indicator
```

### tRPC Router Implementation

```typescript
// src/server/routers/users.ts
import { gestorProcedure, router } from '../trpc'
import { z } from 'zod'

export const usersRouter = router({
  list: gestorProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        tenantId: ctx.tenantId, // Automatic tenant isolation
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users
  }),
})
```

### User List Component Pattern

```typescript
// src/components/modules/users/UserList.tsx
'use client'

import { trpc } from '@/lib/trpc/client'
import { DataTable } from '@/components/shared/DataTable'
import { UserStatusBadge } from './UserStatusBadge'
import { UserRoleBadge } from './UserRoleBadge'

export function UserList() {
  const { data: users, isLoading } = trpc.users.list.useQuery()

  const columns = [
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Papel',
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
  ]

  if (isLoading) return <LoadingState />
  if (!users?.length) return <EmptyState message="Nenhum usuário encontrado" />

  return <DataTable columns={columns} data={users} />
}
```

### References

- [Source: docs/solution-architecture.md#4.2-api-routes]
- [Source: docs/solution-architecture.md#7.1-component-structure]
- [Source: docs/prd.md#épico-1-história-1.4]

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
