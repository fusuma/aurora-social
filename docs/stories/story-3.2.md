# Story 3.2: Implementação da Página de Geração de Relatórios (RMA)

Status: Approved

## Story

As a "Gestora Pública",
I want to access the "Reports Generation Page", select a period (Month/Year), and generate the Monthly Assistance Report (RMA),
so that I can fulfill my compliance obligations (SUAS) and see visit data.

## Acceptance Criteria

1. The "Reports Generation Page" is accessible (GESTOR only).
2. The interface allows the user to select the report type (RMA) and period (Month/Year) (as per FR4 ACs).
3. When generating, the page calls the API (Story 3.1). **While the report is being generated**, the screen must display a clear loading indicator (e.g., "Generating report...").
4. The displayed data is correct... according to the RMA layout. The totals and data displayed on screen must be **identical** to what will be exported (data integrity).
5. The page displays clear buttons for "Export to PDF" and "Export to Excel" (for Story 3.3).
6. The interface meets WCAG AA and the "Clear Governance" vision.
7. If the API (Story 3.1) returns an error (e.g., query failure), the interface must display a user-friendly error message (e.g., "Could not generate report at this time. Please try again.") (NFR7).

## Tasks / Subtasks

- [ ] Create reports page route (GESTOR only)
- [ ] Implement report type and period selectors
- [ ] Create RmaReportPreview component
- [ ] Add loading states during generation
- [ ] Display report data with correct formatting
- [ ] Add Export PDF and Excel buttons
- [ ] Implement error handling
- [ ] Ensure WCAG AA compliance

## References

- [Source: docs/prd.md#épico-3-história-3.2]
