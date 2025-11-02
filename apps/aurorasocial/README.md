# Aurora Social

Aurora Social is a multi-tenant social assistance management system for Brazilian municipalities, built with Next.js 15, Vercel Postgres, and Auth.js.

## Tech Stack

- **Framework**: Next.js 15.0.3 with App Router
- **Language**: TypeScript 5.3+
- **Database**: Vercel Postgres (Neon) with Prisma ORM 5.7.1
- **Authentication**: Auth.js (NextAuth.js v5) with Email provider
- **Testing**: Vitest 1.0.4 (unit/integration) + Playwright 1.40.1 (E2E)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Architecture

### Multi-tenancy

The application implements row-level multi-tenancy through a `tenantId` field in the User table, enabling municipality-level data isolation.

### Database Schema

Key models:
- **Municipality**: Represents a municipality/tenant
- **User**: Application users with tenant association
- **Account/Session**: Auth.js authentication tables

See `prisma/schema.prisma` for the complete schema.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local development) or Vercel Postgres (production)

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env

# Configure your database connection in .env
# POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, etc.

# Generate Prisma client
npx prisma generate

# Run database migrations (when ready)
npx prisma migrate dev
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Project Structure

```
apps/aurorasocial/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth pages (grouped route)
│   │   ├── (public)/         # Public pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # Auth.js configuration
│   │   └── prisma.ts        # Prisma client
│   └── modules/             # Feature modules
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
└── package.json
```

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - Email provider credentials
3. Deploy

The CI/CD pipeline runs automatically on push to main/develop branches.

## Environment Variables

See `.env.example` for required environment variables.

Key variables:
- **Database**: Vercel Postgres connection strings
- **Auth.js**: NextAuth configuration
- **Email**: SMTP settings for email authentication

## License

Private - Aurora Social Project
