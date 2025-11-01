# Story 1.5: Convidar Novo Usuário (Técnico)

Status: Approved

## Story

As a "Gestor Público",
I want to invite a new "Técnico" to the platform by entering their email and setting their role,
so that my team can start using the system.

## Acceptance Criteria

1. On the "User Management Page", there must be a button/form "Invite User".
2. The Gestor must be able to enter an email and select the role (e.g., 'TECNICO').
3. Upon submission, a new user record is created and an invitation email (or password setup) is sent.
4. The new user is automatically associated with the Gestor's municipality (Tenant).

## Tasks / Subtasks

- [ ] Task 1: Create invite user modal component (AC: #1, #2)
  - [ ] Create `InviteUserModal.tsx` component
  - [ ] Add "Convidar Usuário" button to user management page
  - [ ] Implement modal open/close state
  - [ ] Create form with email and role fields

- [ ] Task 2: Implement form validation (AC: #2)
  - [ ] Create Zod schema for invitation
  - [ ] Validate email format
  - [ ] Validate role selection (GESTOR or TECNICO)
  - [ ] Integrate React Hook Form
  - [ ] Display validation errors

- [ ] Task 3: Create tRPC invite procedure (AC: #3, #4)
  - [ ] Add `users.invite()` mutation to users router
  - [ ] Use `gestorProcedure` guard (GESTOR only)
  - [ ] Validate email uniqueness
  - [ ] Create user record with PENDING status
  - [ ] Auto-assign tenantId from session
  - [ ] Generate magic link token

- [ ] Task 4: Implement invitation email (AC: #3)
  - [ ] Create `user-invitation.tsx` React Email template
  - [ ] Include inviter name and municipality
  - [ ] Include role information
  - [ ] Add magic link button
  - [ ] Integrate Resend API
  - [ ] Handle email sending errors

- [ ] Task 5: Update UI after successful invitation (AC: #3)
  - [ ] Invalidate users list query
  - [ ] Close modal
  - [ ] Show success toast message
  - [ ] Handle error states (duplicate email, send failure)

## Dev Notes

### Architecture Patterns and Constraints

- **Email Provider**: Resend for transactional emails
- **Email Templates**: React Email for type-safe templates
- **Validation**: Zod schemas for input validation
- **State Management**: TanStack Query for cache invalidation
- **User Status**: New users created with PENDING status until first login

### Component Structure

```
/src/components/modules/users/
├── InviteUserModal.tsx         # Modal with form
├── InviteUserForm.tsx          # Form component
└── UserInvitationSuccess.tsx   # Success confirmation
/src/emails/
└── user-invitation.tsx         # React Email template
```

### tRPC Mutation Implementation

```typescript
// src/server/routers/users.ts
import { z } from 'zod'
import { sendEmail } from '@/modules/users/email'

export const usersRouter = router({
  invite: gestorProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(['GESTOR', 'TECNICO']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      // Create new user
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.email.split('@')[0], // Temporary name
          role: input.role,
          status: 'PENDING',
          tenantId: ctx.tenantId,
          invitedBy: ctx.session.user.id,
        },
      })

      // Send invitation email
      await sendEmail({
        to: user.email,
        subject: 'Convite para AuroraSocial',
        template: 'user-invitation',
        data: {
          invitedBy: ctx.session.user.name,
          municipio: ctx.session.user.tenant.name,
          role: input.role,
          magicLink: generateMagicLink(user.id),
        },
      })

      return user
    }),
})
```

### React Email Template

```tsx
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
        <Text>Este link expira em 7 dias.</Text>
      </Container>
    </Html>
  )
}
```

### Form Validation Schema

```typescript
// src/lib/validators.ts
import { z } from 'zod'

export const inviteUserSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  role: z.enum(['GESTOR', 'TECNICO'], {
    errorMap: () => ({ message: 'Selecione um papel válido' }),
  }),
})
```

### References

- [Source: docs/solution-architecture.md#5.1-auth-strategy]
- [Source: docs/solution-architecture.md#11.4-third-party-integrations]
- [Source: docs/prd.md#épico-1-história-1.5]

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
