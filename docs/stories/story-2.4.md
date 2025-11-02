# Story 2.4: Criação e Edição de Perfil de Cidadão

Status: Approved

## Story

As a "Técnico de Referência",
I want to be able to create a new Family/Individual profile (FR1) (or edit an existing one),
so that I can register new users or correct information in the system.

## Acceptance Criteria

1. The "Profile View Screen" (or a dedicated route) must have "Edit" functionality.
2. There must be a "Create New Profile" button (likely on the Search Screen).
3. The creation/editing forms must be based on CadÚnico key fields and definitions (NFR10) (e.g., Family Responsible, family composition, income, etc.), as per FR1 ACs.
4. When creating a new "Individual", the system **must** check for CPF duplication (as per FR1 ACs) and display a clear warning if the CPF already exists.
5. Created profiles are saved with the correct `tenantId` (NFR2) and the `userId` (Técnico) who created the record (for audit NFR5).
6. The "Family" creation form must allow the user (Técnico) to **associate** existing "Individuals" or create new "Individuals" as members of that family (implementing the 'ComposicaoFamiliar' table from Story 2.1).
7. The "Edit" functionality (AC 1) must log an audit trail of which fields were changed, by whom, and when (as per FR1 and NFR5 ACs).

## Tasks / Subtasks

- [ ] Create profile creation page route
- [ ] Implement profile form with CadÚnico fields
- [ ] Add CPF duplicate validation
- [ ] Create family composition multi-step form
- [ ] Implement edit mode functionality
- [ ] Add audit log on update
- [ ] Create tRPC mutations (create, update)
- [ ] Test multi-tenant isolation

## References

- [Source: docs/prd.md#épico-2-história-2.4]
