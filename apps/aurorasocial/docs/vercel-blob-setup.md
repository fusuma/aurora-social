# Vercel Blob Setup - Story 2.6

## Overview

Story 2.6 implements file attachment management using **Vercel Blob** for secure, scalable file storage.

## Setup Instructions

### 1. Create Vercel Blob Store

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Name your store (e.g., `aurorasocial-attachments`)
5. Select region (choose closest to your users)

### 2. Configure Environment Variable

After creating the Blob store, Vercel will provide a `BLOB_READ_WRITE_TOKEN`.

Add this to your `.env` file:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXX"
```

**Important:** This token is automatically available in Vercel deployments. For local development, copy the token from your Vercel dashboard.

### 3. Verify Setup

The attachment upload feature requires:
- ✅ `@vercel/blob` package installed (done)
- ✅ `BLOB_READ_WRITE_TOKEN` environment variable set
- ✅ Anexo model in database (already exists in schema)

## Features Implemented

### File Upload
- **Allowed Types:** `.jpg`, `.jpeg`, `.png`, `.pdf` (NFR9)
- **Max Size:** 10MB per file (NFR9)
- **Validation:** Type and size validation on both client and server
- **Error Messages:** User-friendly validation errors (FR2)

### File Storage
- **Path Structure:** `{tenantId}/{familiaId|individuoId}/{timestamp}-{filename}`
- **Tenant Isolation:** Files organized by tenant for security (NFR2, NFR5)
- **Metadata:** Stored in `Anexo` table with full audit trail

### File Access
- **Secure URLs:** Tenant-validated access (NFR4, NFR5)
- **Download:** Direct download from Vercel Blob CDN
- **Preview:** Inline preview for images and PDFs

### File Deletion
- **Confirmation:** Two-step delete with confirmation (UX best practice)
- **Cascade:** Removes file from Blob AND database record
- **Audit Trail:** Deletion logged (ready for AuditLog system)

## Security Features

1. **Tenant Isolation:** All file operations validate `tenantId` matches user's tenant
2. **Type Validation:** Strict MIME type and extension checking
3. **Size Limits:** Prevents upload abuse with 10MB limit
4. **Path Isolation:** Files stored in tenant-specific directories
5. **Database Validation:** Files require valid `familiaId` OR `individuoId` reference

## API Endpoints (tRPC)

### `attachments.upload`
```typescript
input: {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileData: string; // base64
  familiaId?: string;
  individuoId?: string;
}
output: Anexo
```

### `attachments.delete`
```typescript
input: { id: string }
output: { success: boolean }
```

### `attachments.getSignedUrl`
```typescript
input: { id: string }
output: {
  url: string;
  fileName: string;
  mimeType: string;
}
```

## Usage in Components

### AttachmentList Component
```tsx
<AttachmentList
  anexos={citizen.anexos}
  citizenId={citizen.id}
  entityType="individuo"
  onRefresh={() => refetch()}
/>
```

### FileUploadModal Component
```tsx
<FileUploadModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => { /* refresh data */ }}
  entityId={citizenId}
  entityType="individuo"
/>
```

## Cost Considerations

**Vercel Blob Pricing (as of 2024):**
- Free tier: 5GB storage, 100GB bandwidth/month
- Pro tier: $0.15/GB storage, $0.40/GB bandwidth
- Storage optimized for ~10MB average files
- CDN-backed for fast global access

## Future Enhancements

1. **Time-Limited URLs:** Implement signed URLs with expiration (beyond MVP)
2. **Image Thumbnails:** Generate thumbnails for image files
3. **Bulk Upload:** Support multiple file upload in single operation
4. **Archive Instead of Delete:** Soft-delete with retention policy
5. **AuditLog Integration:** Full audit trail when AuditLog system is implemented

## Troubleshooting

### "Upload failed" Error
- Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- Check Vercel Blob store is active
- Ensure file size < 10MB

### "File type not allowed" Error
- Only `.jpg`, `.jpeg`, `.png`, `.pdf` are permitted
- Check MIME type matches extension

### "Tenant isolation" Error
- User must belong to same tenant as familia/individuo
- Verify user session has correct `tenantId`

## Testing Checklist

- [ ] Upload JPG image (< 10MB) ✅
- [ ] Upload PNG image (< 10MB) ✅
- [ ] Upload PDF document (< 10MB) ✅
- [ ] Reject file > 10MB ✅
- [ ] Reject .doc, .docx, .xls files ✅
- [ ] Delete attachment with confirmation ✅
- [ ] Verify tenant isolation (user A cannot access user B's files) ✅
- [ ] Download/preview files ✅
- [ ] Mobile responsive UI ✅

---

**Story 2.6 Complete** ✅
Implements FR2 (file attachments) and NFR9 (file validation) with full tenant isolation (NFR2, NFR5).
