# Story 2.6: Gestão de Anexos (Upload e Visualização)

Status: Approved

## Story

As a "Técnico de Referência",
While viewing a profile (Story 2.3), I want to be able to attach files (FR2) (e.g., photos, PDFs) and see existing attachments,
so that I can digitize the history of "paper files".

## Acceptance Criteria

1. The "Attachments" section on the Profile Screen allows file upload.
2. Upload is handled by Vercel Blob and file metadata (URL, name, size, type, `tenantId`, `userId`) is saved in the 'Anexo' table of Vercel Postgres.
3. Upload enforces strict type (`.jpg`, `.png`, `.pdf`) and size (e.g., 10MB) validations (as per FR2 and NFR9 ACs).
4. Upload rejects invalid files with clear, user-friendly error messages (as per FR2 ACs).
5. The "Attachments" section on the Profile Screen lists attached files (pulling from 'Anexo' table), displaying useful metadata (e.g., name, date, who uploaded).
6. Clicking to view/download a listed attachment should verify user permission (NFR4) and use a secure URL (e.g., signed) for Vercel Blob, ensuring only users from the correct `tenantId` can access the file (NFR5).
7. The user should be able to delete an attachment (with confirmation), which removes the record from the 'Anexo' table and the file from Vercel Blob (or archives it), logging the action in an audit log (FR2 and NFR5 ACs).

## Tasks / Subtasks

- [ ] Create FileUploadZone component
- [ ] Implement Vercel Blob upload flow
- [ ] Add file type and size validation
- [ ] Create AttachmentList component
- [ ] Implement secure download with signed URLs
- [ ] Add delete attachment functionality
- [ ] Create audit log entries
- [ ] Test tenant isolation on file access

## References

- [Source: docs/prd.md#épico-2-história-2.6]
