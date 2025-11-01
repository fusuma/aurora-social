# Story 2.5: Registro de Atendimento (Modal)

Status: Approved

## Story

As a "Técnico de Referência",
While viewing a profile (Story 2.3), I want to click "Register Visit" and fill out a form (Modal) (FR3),
so that I can quickly register the demand without losing context.

## Acceptance Criteria

1. A "Register Visit" button is visible on the Profile Screen.
2. When clicked, a form in **Modal (or integrated section)** is displayed.
3. The form contains the fields (demand type, referral, social assessment), is pre-filled with current date/time, and does not require re-typing (as per FR3 ACs).
4. Upon saving, the modal closes and the new visit appears (or is added) to the "Visit History" of the Profile Screen (FR3/AC4).
5. The saved visit record is **permanently** associated with the logged-in `userId` (Técnico) and correct `tenantId` (NFR2) (as per FR3 and NFR5 ACs).

## Tasks / Subtasks

- [ ] Create AtendimentoModal component
- [ ] Implement atendimento form with React Hook Form + Zod
- [ ] Add TipoDemanda select dropdown
- [ ] Create tRPC atendimentos.create mutation
- [ ] Auto-populate date/time and user
- [ ] Invalidate atendimentos list on success
- [ ] Test tenant and user association

## References

- [Source: docs/prd.md#épico-2-história-2.5]
