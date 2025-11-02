# Story 2.7: Implementação da Importação de Dados (Should Have)

Status: Approved

## Story

As a "Gestor Público",
I want to have a way to import existing registrations (e.g., via CSV) (NFR11),
so that my team doesn't have to retype thousands of profiles during onboarding.

## Acceptance Criteria

1. The "Gestor Público" must have access to an interface (e.g., a section in the "User Management Page") that allows them to upload a CSV file.
2. The system must provide a **template CSV file (template)** for download, ensuring the user knows which columns are needed for mapping with the CadÚnico model (NFR10) (Story 2.1).
3. **Security:** All imported records are **mandatorily** associated with the municipality's `tenantId` (NFR2) of the (Gestor) performing the upload.
4. The import **must validate** data (e.g., CPF) against existing records. If duplicates or formatting errors are found, the import must fail safely.
5. If the import fails (AC 4), the system must provide a clear error report (e.g., "Line 5: Duplicate CPF").
6. If the import is successful, the system must display a success message (e.g., "1,500 families successfully imported").

## Tasks / Subtasks

- [ ] Create import page for GESTOR role
- [ ] Generate CSV template file
- [ ] Implement CSV upload and parsing (csv-parse library)
- [ ] Create validation logic (CPF, required fields)
- [ ] Implement bulk insert with transaction
- [ ] Generate error report for failed imports
- [ ] Show progress indicator during import
- [ ] Test with large datasets (>1000 records)

## References

- [Source: docs/prd.md#épico-2-história-2.7]
- [Source: docs/prd.md#nfr11-importação-em-lote]
