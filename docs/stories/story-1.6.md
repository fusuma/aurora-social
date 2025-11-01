# Story 1.6: Desativar Usuário (Técnico)

Status: Approved

## Story

As a "Gestor Público",
I want to deactivate (or remove) a "Técnico's" account,
so that, in case of termination, they immediately lose access to sensitive data (LGPD).

## Acceptance Criteria

1. In the user list (Story 1.4), there must be an option (e.g., "Deactivate" or "Remove" button) for each user.
2. When deactivated, the user must no longer be able to log in (Story 1.2).
3. The user's session (if active) must be invalidated immediately or on next interaction.
4. The user's historical data (e.g., who registered an atendimento) must be preserved (referential integrity).

## Tasks / Subtasks

- [ ] Task 1: Add deactivate action to user list (AC: #1)
  - [ ] Add deactivate button to UserList component
  - [ ] Add confirmation dialog
  - [ ] Implement optimistic UI update
  - [ ] Handle different user states (ACTIVE, INACTIVE, PENDING)

- [ ] Task 2: Create tRPC deactivate procedure (AC: #2, #4)
  - [ ] Add `users.deactivate()` mutation to users router
  - [ ] Use `gestorProcedure` guard (GESTOR only)
  - [ ] Update user status to INACTIVE
  - [ ] Preserve user record (soft delete)
  - [ ] Prevent self-deactivation
  - [ ] Add audit log entry

- [ ] Task 3: Prevent login for inactive users (AC: #2)
  - [ ] Update Auth.js signIn callback
  - [ ] Check user status before allowing login
  - [ ] Return false for INACTIVE users
  - [ ] Display appropriate error message

- [ ] Task 4: Implement session invalidation (AC: #3)
  - [ ] Delete user's active sessions on deactivation
  - [ ] Clear session tokens from database
  - [ ] Force logout on next request (middleware check)

- [ ] Task 5: Verify data integrity (AC: #4)
  - [ ] Test that historical atendimentos preserve userId
  - [ ] Ensure audit logs remain intact
  - [ ] Verify no cascade deletes on user deactivation
  - [ ] Add test for referential integrity

- [ ] Task 6: Add reactivate functionality (bonus)
  - [ ] Create `users.reactivate()` mutation
  - [ ] Add reactivate button for INACTIVE users
  - [ ] Restore user access
  - [ ] Send reactivation email notification

## Dev Notes

### Architecture Patterns and Constraints

- **Soft Delete**: User status set to INACTIVE (not deleted from database)
- **LGPD Compliance**: Immediate access revocation for terminated employees
- **Audit Trail**: All deactivation actions logged with timestamp and actor
- **Referential Integrity**: User records preserved for historical data
- **Session Security**: Active sessions invalidated to prevent lingering access

### Component Structure

```
/src/components/modules/users/
├── UserList.tsx                # Updated with deactivate button
├── DeactivateUserDialog.tsx    # Confirmation dialog
└── UserActionMenu.tsx          # Dropdown menu for user actions
```

### tRPC Mutation Implementation

```typescript
// src/server/routers/users.ts
export const usersRouter = router({
  deactivate: gestorProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Prevent self-deactivation
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot deactivate your own account',
        })
      }

      // Verify user belongs to same tenant
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.tenantId,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Update user status to INACTIVE
      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          status: 'INACTIVE',
        },
      })

      // Delete active sessions
      await ctx.prisma.session.deleteMany({
        where: { userId: input.userId },
      })

      // Create audit log entry
      await ctx.prisma.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.session.user.id,
          action: 'DEACTIVATE_USER',
          entityType: 'User',
          entityId: input.userId,
          changes: {
            status: { from: user.status, to: 'INACTIVE' },
          },
        },
      })

      return updatedUser
    }),

  reactivate: gestorProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.tenantId,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          status: 'ACTIVE',
        },
      })

      // Create audit log entry
      await ctx.prisma.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.session.user.id,
          action: 'REACTIVATE_USER',
          entityType: 'User',
          entityId: input.userId,
          changes: {
            status: { from: user.status, to: 'ACTIVE' },
          },
        },
      })

      return updatedUser
    }),
})
```

### Auth.js Configuration Update

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  // ... existing config
  callbacks: {
    async signIn({ user }) {
      // Block inactive users from logging in
      if (user.status === 'INACTIVE') {
        return false // Blocks login
      }
      return true
    },
    // ... other callbacks
  },
}
```

### Confirmation Dialog Pattern

```typescript
// src/components/modules/users/DeactivateUserDialog.tsx
'use client'

import { AlertDialog } from '@/components/ui/alert-dialog'
import { trpc } from '@/lib/trpc/client'

export function DeactivateUserDialog({ user, open, onOpenChange }) {
  const utils = trpc.useContext()
  const mutation = trpc.users.deactivate.useMutation({
    onSuccess: () => {
      toast.success(`${user.name} foi desativado`)
      utils.users.list.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar usuário?</AlertDialogTitle>
          <AlertDialogDescription>
            {user.name} ({user.email}) perderá acesso imediatamente.
            Esta ação pode ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate({ userId: user.id })}
            disabled={mutation.isLoading}
          >
            Desativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### References

- [Source: docs/solution-architecture.md#17.3-data-protection-lgpd-compliance]
- [Source: docs/solution-architecture.md#3.1-database-schema]
- [Source: docs/prd.md#épico-1-história-1.6]

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
