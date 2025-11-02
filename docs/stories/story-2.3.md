# Story 2.3: Implementação da Tela de Visualização de Perfil

Status: Approved

## Story

As a "Técnico de Referência",
When clicking on a search result (Story 2.2), I want to see the "Profile View Screen" with the citizen's complete history,
so that I have full context before the visit (FR1).

## Acceptance Criteria

1. The "Profile View Screen" is displayed when selecting a search result.
2. The screen displays the main registration data (e.g., Full Name, CPF, Birth Date, Address) of the individual/family (based on CadÚnico) prominently.
3. The screen contains a visible "Visit History" section that displays a *summary list* of recent visits (e.g., Date, Demand Type, Técnico).
4. The screen contains a visible "Attachments" section that displays a *list* of attached files (e.g., File Name, Upload Date).
5. The screen must contain clear and prominent action buttons: "Register Visit" (for Story 2.5), "Add Attachment" (for Story 2.6), and "Edit Profile" (for Story 2.4).
6. The interface meets WCAG AA and is "clean and professional".

## Tasks / Subtasks

- [ ] Create profile view page with dynamic route
- [ ] Fetch profile data with atendimentos and anexos
- [ ] Implement ProfileOverview component
- [ ] Create AtendimentoHistoryList component
- [ ] Create AttachmentList component
- [ ] Add action buttons (Register, Upload, Edit)
- [ ] Implement responsive tabs/sections
- [ ] Ensure WCAG AA compliance

## References

- [Source: docs/prd.md#épico-2-história-2.3]
