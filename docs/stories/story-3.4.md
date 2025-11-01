# Story 3.4: Implementação do Dashboard Gerencial (Should Have)

Status: Approved

## Story

As a "Gestora Pública",
I want to see the "Management Dashboard" as my initial screen (or easily accessible),
so that I can have a quick view (Clear Governance) of my operation's key metrics (FR6).

## Acceptance Criteria

1. The "Management Dashboard" is the default screen for the 'GESTOR' role (or is 1 click away) (as per FR6 ACs).
2. The screen displays "cards" with key metrics (Total Visits, Total Families, etc.) (as per FR6 ACs). **While data is being loaded (or updated) for the first time**, a clear loading indicator must be displayed.
3. The screen clearly displays the date/time of "Last update" of data (as per FR6 ACs).
4. The dashboard data query respects the trade-off of not being real-time (as per FR6 ACs).
5. The interface meets WCAG AA and is "intuitive".
6. **Security:** Data (metrics) displayed on the dashboard must be based **exclusively** on data from the logged-in Gestor's `tenantId` (as per Story 3.1 and FR6 ACs).
7. If the API (Story 3.1) returns an error when fetching dashboard data, the interface must display a user-friendly error message (e.g., "Could not load metrics at this time.") (NFR7).

## Tasks / Subtasks

- [ ] Create dashboard page route (GESTOR default)
- [ ] Implement DashboardKpiCard components
- [ ] Create dashboard metrics query with caching
- [ ] Display total atendimentos, families, individuals
- [ ] Add "Last updated" timestamp
- [ ] Implement manual refresh button
- [ ] Add loading and error states
- [ ] Ensure WCAG AA compliance
- [ ] Test cache behavior (1-hour TTL)

## References

- [Source: docs/prd.md#épico-3-história-3.4]
- [Source: docs/solution-architecture.md#6.4-caching-strategy]
