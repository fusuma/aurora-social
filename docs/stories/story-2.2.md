# Story 2.2: Implementação da Tela de Pesquisa de Cidadão

Status: Approved

## Story

As a "Técnico de Referência",
I want a simple "Search Screen" to search for families or individuals by name or CPF (FR1),
so that I can quickly find the profile I need to serve.

## Acceptance Criteria

1. The "Citizen/Family Search Screen" exists and is accessible after login for the 'TECNICO' role.
2. The user can enter a search term (e.g., partial name, full name, CPF). The search must be *fast* and *forgiving* (e.g., ignore accents or capitalization).
3. Search results are displayed in a clear list, showing minimum information for identification (e.g., Full Name, CPF, Birth Date).
4. **Security:** The search must return **only** results from the logged-in user's `tenantId` (municipality) (NFR2, NFR5).
5. The interface meets WCAG AA standards.
6. Clicking a search result should navigate the user **directly** to the "Profile View Screen" (Story 2.3) for that citizen/family.
7. If the search returns no results, the system should display a clear message (e.g., "No profile found") and a link/button to "Create New Profile" (Story 2.4).

## Tasks / Subtasks

- [ ] Create search page route and layout
- [ ] Implement search form with debounced input
- [ ] Create tRPC citizens.search procedure with fuzzy matching
- [ ] Implement search results list component
- [ ] Add empty state with "Create New Profile" link
- [ ] Ensure WCAG AA compliance
- [ ] Test tenant isolation in search queries

## Dev Notes

- Use TanStack Query for search result caching
- Implement fuzzy search (ignore accents, case-insensitive)
- Debounce search input (300ms)
- Paginate results (20 per page)
- Index: tenantId + nomeCompleto for performance

## References

- [Source: docs/prd.md#épico-2-história-2.2]
- [Source: docs/solution-architecture.md#4.2-api-routes]
