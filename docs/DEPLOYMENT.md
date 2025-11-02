# 🚀 Aurora Social - Production Deployment Guide

## Prerequisites

- Vercel account with Pro plan (for Vercel Postgres)
- GitHub repository connected to Vercel
- Domain name (optional, Vercel provides `.vercel.app` subdomain)
- Resend account for email delivery
- Node.js 20+ (for local testing)

---

## Step 1: Vercel Project Setup

### 1.1 Connect Repository to Vercel

```bash
# Install Vercel CLI (optional but recommended)
npm i -g vercel

# Login to Vercel
vercel login

# Link your repository (from project root)
cd apps/aurorasocial
vercel link
```

**Or via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `apps/aurorasocial` as root directory
4. Framework preset: Next.js
5. Don't deploy yet - configure environment variables first

---

## Step 2: Provision Vercel Postgres

### 2.1 Create Database

1. In Vercel Dashboard → Storage → Create Database
2. Select **Postgres**
3. Database name: `aurora-social-prod`
4. Region: Choose closest to your users (e.g., `sao1` for Brazil)
5. Click **Create**

### 2.2 Connect Database to Project

1. Vercel will auto-populate these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

2. ✅ **Verify** in Settings → Environment Variables

---

## Step 3: Configure Environment Variables

### 3.1 Authentication (Auth.js)

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Production URL (update after first deployment)
NEXTAUTH_URL=https://your-domain.vercel.app

# Generate a secure secret (run this locally):
# openssl rand -base64 32
NEXTAUTH_SECRET=<your-generated-secret-here>
```

### 3.2 Email Provider (Resend)

1. Go to https://resend.com → Sign up
2. Create API Key → Copy it
3. Add to Vercel:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com  # Use verified domain in Resend
```

**Note:** Resend requires domain verification for production. For testing, use `onboarding@resend.dev`.

### 3.3 File Storage (Vercel Blob)

1. Vercel Dashboard → Storage → Create Blob Store
2. Store name: `aurora-social-files`
3. Region: Same as database
4. Connect to project
5. Auto-populates: `BLOB_READ_WRITE_TOKEN`

### 3.4 Environment Variables Summary

Verify you have all these configured:

- ✅ `POSTGRES_PRISMA_URL` (auto from Vercel Postgres)
- ✅ `POSTGRES_URL_NON_POOLING` (auto from Vercel Postgres)
- ✅ `NEXTAUTH_URL` (your production URL)
- ✅ `NEXTAUTH_SECRET` (generated secret)
- ✅ `RESEND_API_KEY` (from Resend dashboard)
- ✅ `EMAIL_FROM` (verified sender email)
- ✅ `BLOB_READ_WRITE_TOKEN` (auto from Vercel Blob)

---

## Step 4: Database Migration

### 4.1 Run Migrations on Production Database

**Option A: Via Vercel CLI (Recommended)**

```bash
# Install dependencies locally
cd apps/aurorasocial
npm install --legacy-peer-deps

# Pull production environment variables
vercel env pull .env.production

# Run migration against production DB
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Option B: Via Vercel Project Settings**

1. Settings → General → Build & Development Settings
2. Build Command: `npx prisma migrate deploy && npm run build`
3. First deployment will run migrations automatically

### 4.2 Verify Migration

```bash
# Connect to production database (from Vercel Dashboard)
# Or use Prisma Studio locally:
npx prisma studio --schema=./prisma/schema.prisma
```

Expected tables:
- `Municipality`
- `User`
- `Account`, `Session`, `VerificationToken` (Auth.js)
- `Familia`, `Individuo`, `ComposicaoFamiliar`
- `Atendimento`
- `Anexo`

---

## Step 5: Initial Data Setup

### 5.1 Create First Municipality (Tenant)

```bash
# Connect to database via Prisma Studio or SQL client
# Insert first municipality:

INSERT INTO "Municipality" (id, name, cnpj, "createdAt")
VALUES (
  'cm123456',  -- Generate with: cuid() or use any unique ID
  'Prefeitura Municipal de São Paulo',
  '12.345.678/0001-90',  -- Replace with real CNPJ
  NOW()
);
```

### 5.2 Create First GESTOR User

```bash
# Insert first user (GESTOR role):

INSERT INTO "User" (id, "tenantId", email, name, role, status, "createdAt")
VALUES (
  'cu123456',  -- Generate with: cuid()
  'cm123456',  -- Match Municipality ID from above
  'gestor@yourdomain.com',  -- Admin email
  'Gestor Principal',
  'GESTOR',
  'ACTIVE',
  NOW()
);
```

**Alternative: Use Prisma Seed Script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const municipality = await prisma.municipality.create({
    data: {
      name: 'Prefeitura Municipal de São Paulo',
      cnpj: '12.345.678/0001-90',
    },
  })

  await prisma.user.create({
    data: {
      tenantId: municipality.id,
      email: 'gestor@yourdomain.com',
      name: 'Gestor Principal',
      role: 'GESTOR',
      status: 'ACTIVE',
    },
  })

  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run: `npx prisma db seed`

---

## Step 6: Deploy to Production

### 6.1 Deploy

```bash
# Via CLI:
vercel --prod

# Or push to main branch (auto-deploys if connected to GitHub)
git push origin main
```

### 6.2 Verify Deployment

1. Check build logs in Vercel Dashboard
2. Visit your deployment URL
3. Expected: Login page at `/login`

---

## Step 7: Post-Deployment Configuration

### 7.1 Configure Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add custom domain: `aurorasocial.yourdomain.com`
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable
5. Redeploy

### 7.2 Email Domain Verification (Resend)

1. Resend Dashboard → Domains → Add Domain
2. Add DNS records (MX, TXT, DKIM)
3. Verify domain
4. Update `EMAIL_FROM` to use verified domain
5. Redeploy

### 7.3 First Login Test

1. Go to `/login`
2. Enter GESTOR email (from Step 5.2)
3. Check email for magic link
4. Click link → Should redirect to `/dashboard`
5. ✅ Success! You're logged in as GESTOR

---

## Step 8: Create Additional Users

### 8.1 Via UI (Recommended)

1. Login as GESTOR
2. Navigate to `/equipe` (User Management)
3. Click "Convidar Usuário"
4. Enter email and select role (TÉCNICO or GESTOR)
5. User receives invitation email with magic link

### 8.2 Via Database (Bulk Import)

Use the CSV import feature:
1. Login as GESTOR
2. Navigate to `/importar`
3. Download CSV template
4. Fill with user data
5. Upload CSV

---

## Step 9: Monitoring & Maintenance

### 9.1 Vercel Analytics

- Enabled by default
- View in Vercel Dashboard → Analytics
- Tracks: Page views, performance, errors

### 9.2 Error Monitoring (Optional)

**Integrate Sentry:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add `SENTRY_DSN` to environment variables.

### 9.3 Database Backups

Vercel Postgres includes:
- Automatic daily backups (7-day retention on Pro)
- Point-in-time recovery

**Manual backup:**
```bash
# Via Vercel CLI
vercel postgres backup create aurora-social-prod
```

---

## Step 10: Security Checklist

Before going live:

- [ ] ✅ `NEXTAUTH_SECRET` is unique and secure (32+ chars)
- [ ] ✅ All environment variables are production values (not defaults)
- [ ] ✅ Resend domain is verified (not using `onboarding@resend.dev`)
- [ ] ✅ Database migrations are applied successfully
- [ ] ✅ First GESTOR user is created and can login
- [ ] ✅ Email magic links are working
- [ ] ✅ HTTPS is enabled (automatic on Vercel)
- [ ] ✅ CORS is configured (not needed - same origin)
- [ ] ✅ Rate limiting is considered (implement if needed)
- [ ] ✅ Content Security Policy headers (configure in `next.config.js` if needed)

---

## Troubleshooting

### Issue: "NEXTAUTH_URL mismatch"

**Solution:**
```bash
# Update NEXTAUTH_URL to match your deployment URL
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

Redeploy after updating.

### Issue: "Prisma Client not generated"

**Solution:**
```bash
# Add postinstall script to package.json:
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: "Email not sending"

**Solution:**
1. Check `RESEND_API_KEY` is correct
2. Verify domain in Resend dashboard
3. Check Resend logs for errors
4. Ensure `EMAIL_FROM` matches verified domain

### Issue: "Database connection failed"

**Solution:**
1. Verify Vercel Postgres is provisioned
2. Check environment variables are linked to project
3. Ensure `POSTGRES_PRISMA_URL` is set (not just `POSTGRES_URL`)

---

## Performance Optimization

### Enable Edge Functions (Optional)

For faster response times, especially in Brazil:

```typescript
// src/app/api/trpc/[trpc]/route.ts
export const runtime = 'edge' // Enable Edge Runtime
```

**Note:** Prisma doesn't support Edge Runtime yet. Use Node.js runtime for database queries.

### Configure ISR (Incremental Static Regeneration)

For dashboard caching:

```typescript
// src/app/(auth)/(gestor)/dashboard/page.tsx
export const revalidate = 3600 // Revalidate every hour
```

---

## Scaling Considerations

### Database

- Vercel Postgres Pro: Up to 256 MB storage
- For larger municipalities: Upgrade to **Enterprise** or migrate to **Neon** directly

### File Storage

- Vercel Blob: 100 GB included (Pro plan)
- Monitor usage in Vercel Dashboard → Storage

### Compute

- Vercel automatically scales serverless functions
- Monitor function duration in Analytics
- Optimize slow endpoints (>3s response time)

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Auth.js Docs:** https://authjs.dev
- **Resend Docs:** https://resend.com/docs

---

## Quick Reference

### Useful Commands

```bash
# View deployment logs
vercel logs <deployment-url>

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Check build locally
npm run build && npm start
```

### Important URLs

- **Production:** `https://your-domain.vercel.app`
- **Login:** `https://your-domain.vercel.app/login`
- **Dashboard:** `https://your-domain.vercel.app/dashboard` (GESTOR)
- **Search:** `https://your-domain.vercel.app/pesquisar` (TÉCNICO/GESTOR)

---

**🎉 Deployment Complete!** Your Aurora Social platform is now live and ready to serve municipal social assistance operations.
