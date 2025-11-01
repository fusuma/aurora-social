# Story 3.3: Exportação de Relatórios (PDF e Excel)

Status: Approved

## Story

As a "Gestora Pública",
I want to click the "Export to PDF" and "Export to Excel" buttons on the report page (Story 3.2),
so that I can download files for archiving, printing, or data analysis.

## Acceptance Criteria

1. Clicking "Export to PDF" should call a backend API (API Route in Story 3.1) to generate and download a formatted `.pdf` (as per FR5 ACs).
2. Clicking "Export to Excel" should call a backend API (API Route in Story 3.1) to generate and download a `.xlsx` with raw data (as per FR5 ACs).
3. **Security:** Both generated files must contain **only** data from the Gestor's `tenantId` (NFR2, NFR5).
4. **While the file is being generated** (AC 1, AC 2), the interface must display a clear loading indicator (e.g., "Preparing your file...").
5. The downloaded file must have a descriptive filename (e.g., `RMA_Outubro_2025.pdf` or `RMA_Outubro_2025.xlsx`).
6. If file generation fails (e.g., API error), the interface must display a user-friendly error message (e.g., "Could not generate file.") (NFR7).

## Tasks / Subtasks

- [ ] Implement PDF export with @react-pdf/renderer
- [ ] Implement Excel export with xlsx library
- [ ] Create tRPC export procedures
- [ ] Add loading states during export
- [ ] Generate descriptive filenames
- [ ] Verify tenant isolation in exports
- [ ] Add error handling
- [ ] Test with large datasets

## References

- [Source: docs/prd.md#épico-3-história-3.3]
- [Source: docs/solution-architecture.md#adr-007-react-pdf-vs-puppeteer]
