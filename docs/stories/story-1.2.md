# Story 1.2: Implementação da Tela de Login

Status: Approved

## Story

As a User (Técnico or Gestor),
I want to log in to the system using my email and password,
so that I can securely access the platform (NFR4).

## Acceptance Criteria

1. The "Login Screen" must be accessible.
2. Login must be implemented using the Auth.js configuration (Story 1.1).
3. Given valid email/password credentials, the user is authenticated and redirected to the platform.
4. Given invalid email/password credentials, a clear error message is displayed.
5. The interface must be "clean and professional" and meet WCAG AA standards.

## Tasks / Subtasks

- [ ] Task 1: Create public login page (AC: #1)
  - [ ] Create `app/(public)/login/page.tsx`
  - [ ] Set up public layout without authentication requirements
  - [ ] Configure route accessibility

- [ ] Task 2: Implement login form component (AC: #2, #3, #4)
  - [ ] Create login form with email input
  - [ ] Integrate Auth.js email provider
  - [ ] Implement authentication flow
  - [ ] Add error handling and validation
  - [ ] Display clear error messages for invalid credentials
  - [ ] Handle successful authentication and redirect

- [ ] Task 3: Apply UI/UX requirements (AC: #5)
  - [ ] Implement clean, professional design using Tailwind CSS
  - [ ] Ensure WCAG AA compliance
  - [ ] Add proper ARIA labels and roles
  - [ ] Test keyboard navigation
  - [ ] Verify color contrast ratios

- [ ] Task 4: Configure email provider (AC: #2)
  - [ ] Set up Resend SMTP configuration
  - [ ] Configure email templates (magic link)
  - [ ] Test email delivery

- [ ] Task 5: Implement session handling (AC: #3)
  - [ ] Configure session cookies (httpOnly, secure, sameSite)
  - [ ] Implement post-login redirection logic
  - [ ] Set up role-based default redirects (TÉCNICO → /pesquisar, GESTOR → /dashboard)

## Dev Notes

### Architecture Patterns and Constraints

- **Authentication**: Email magic link (password-less) via Auth.js
- **Session**: Database sessions with 30-day expiration (rolling)
- **Security**: httpOnly cookies, HTTPS only, sameSite: lax
- **Email**: Resend for transactional emails
- **UI**: shadcn/ui components + Tailwind CSS
- **Accessibility**: WCAG 2.1 Level AA compliance required

### Component Structure

```
/src/app/(public)/
├── login/
│   └── page.tsx           # Login page (Server Component)
/src/components/modules/auth/
├── LoginForm.tsx          # Client component (form interactions)
├── EmailInput.tsx         # Email input with validation
└── MagicLinkSent.tsx      # Success state component
```

### Auth.js Configuration

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
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

### Email Template

Use React Email for magic link template:
```tsx
// src/emails/magic-link.tsx
import { Html, Button, Text, Container } from '@react-email/components'

export function MagicLinkEmail({ url }) {
  return (
    <Html>
      <Container>
        <Text>Olá!</Text>
        <Text>Clique no botão abaixo para fazer login no AuroraSocial.</Text>
        <Button href={url}>Fazer Login</Button>
        <Text>Este link expira em 24 horas.</Text>
      </Container>
    </Html>
  )
}
```

### References

- [Source: docs/solution-architecture.md#5-authentication-and-authorization]
- [Source: docs/solution-architecture.md#7.4-accessibility]
- [Source: docs/ux-specification.md#login-authentication]
- [Source: docs/prd.md#épico-1-história-1.2]

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
