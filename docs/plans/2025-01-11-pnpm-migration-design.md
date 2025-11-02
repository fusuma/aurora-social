# pnpm Migration Design - Aurora Social

**Date:** 2025-01-11
**Status:** Approved
**Author:** Architecture Team

## Executive Summary

Aurora Social will migrate from npm to pnpm to support medium-term monorepo expansion (3-5 packages). The migration follows a "prepare infrastructure first" approach: establish proper monorepo structure, then switch package managers. This ensures architectural soundness before tooling changes.

**Timeline:** 3-4 weeks
**Approach:** Phased migration with rollback plan
**Risk Level:** Medium (mitigated with testing and gradual rollout)

---

## Motivation

**Primary Driver:** Monorepo management for planned expansion to 3-5 packages within 6 months

**Secondary Benefits:**
- 2-3x faster install speeds (especially CI/CD)
- 40-60% disk space reduction
- Stricter dependency management (prevents phantom dependencies)
- Native Vercel support (auto-detection)

**Current State:**
- Single app: `apps/aurorasocial/`
- Using npm with `--legacy-peer-deps` (React 19 RC)
- Deployed on Vercel with GitHub Actions CI/CD

---

## Impact Assessment

### Positive Impacts

| Impact | Benefit | Measurement |
|--------|---------|-------------|
| **Install Speed** | 2-3x faster than npm | CI/CD pipeline time reduction |
| **Disk Space** | 40-60% reduction | Local `.pnpm-store` vs `node_modules` size |
| **Monorepo Support** | Native workspace management | Simplified multi-package development |
| **Dependency Safety** | Strict resolution, no phantom deps | Zero unexpected runtime errors |
| **Vercel Integration** | Zero-config auto-detection | No deployment changes needed |

### Breaking Changes & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **React 19 RC compatibility** | Peer dependency warnings | Use `shamefully-hoist=true` in `.npmrc` |
| **CI/CD updates required** | Pipeline failures | Test on feature branch first |
| **Team learning curve** | Temporary productivity loss | Migration guide + team training |
| **Lock file conflicts** | Active PR disruption | Coordinate during low activity period |
| **Hoisting differences** | Runtime behavior changes | Full test suite validation |

### Timeline

- **Phase 1:** Monorepo structure (1-2 weeks)
- **Phase 2:** pnpm migration (1 week)
- **Phase 3:** CI/CD & deployment validation (1 week)
- **Total:** 3-4 weeks with buffer

---

## Monorepo Architecture

### Target Structure

```
AuroraSocial/
├── pnpm-workspace.yaml           # Workspace definition
├── package.json                   # Root package.json (scripts, shared devDeps)
├── .npmrc                         # pnpm configuration
├── apps/
│   ├── web/                       # Main Aurora Social app (renamed from aurorasocial)
│   ├── admin/                     # Future: Separate admin portal
│   └── mobile/                    # Future: React Native app
├── packages/
│   ├── ui/                        # Shared UI components (design system)
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── database/                  # Prisma schema, migrations, client
│   │   ├── package.json
│   │   ├── prisma/
│   │   └── src/
│   ├── api/                       # tRPC routers, procedures, types
│   │   ├── package.json
│   │   └── src/
│   ├── auth/                      # Auth.js configuration, utilities
│   │   ├── package.json
│   │   └── src/
│   └── config/                    # Shared configs (TypeScript, ESLint, Tailwind)
│       ├── eslint-config/
│       ├── tsconfig/
│       └── tailwind-config/
├── docs/                          # Existing documentation
└── tools/                         # Build scripts, generators
```

### Package Dependency Graph

```
apps/web
  ├─> @aurora/ui (UI components)
  ├─> @aurora/database (Prisma client)
  ├─> @aurora/api (tRPC routers)
  └─> @aurora/auth (Auth.js)

@aurora/api
  └─> @aurora/database (for data access)

@aurora/ui
  └─> (no internal dependencies - foundational)

@aurora/database
  └─> (no internal dependencies - foundational)

@aurora/auth
  └─> @aurora/database (user lookup)
```

### Package Naming Convention

- **Scope:** `@aurora/*` for all internal packages
- **Apps:** No scope prefix (e.g., `web`, `admin`)
- **Packages:** Scoped (e.g., `@aurora/ui`, `@aurora/database`)

### Workspace Configuration

**`pnpm-workspace.yaml`:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  # Exclude build outputs
  - '!**/node_modules'
  - '!**/.next'
  - '!**/dist'
```

**Root `package.json`:**

```json
{
  "name": "aurora-social-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --recursive --filter=!web build && pnpm --filter web build",
    "test": "pnpm --recursive test",
    "lint": "pnpm --recursive lint",
    "clean": "pnpm --recursive exec rm -rf node_modules .next dist"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint": "^8",
    "prettier": "^3.6.2",
    "typescript": "^5"
  }
}
```

---

## Migration Implementation Plan

### Phase 1: Prepare Monorepo Structure (Week 1-2)

#### Step 1.1: Create Workspace Configuration

```bash
# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml <<EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Keep existing app running (no disruption yet)
```

**Verification:** File exists, valid YAML syntax

#### Step 1.2: Extract @aurora/database Package

**Goal:** Move Prisma schema and client to shared package

```bash
# Create package structure
mkdir -p packages/database/src packages/database/prisma

# Move Prisma files
mv apps/aurorasocial/prisma/* packages/database/prisma/

# Create package.json
cat > packages/database/package.json <<EOF
{
  "name": "@aurora/database",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1"
  },
  "devDependencies": {
    "prisma": "^5.7.1"
  }
}
EOF

# Create index.ts (export Prisma client)
cat > packages/database/src/index.ts <<EOF
export * from '@prisma/client'
export { prisma } from './client'
EOF

# Move client singleton
mv apps/aurorasocial/src/lib/prisma.ts packages/database/src/client.ts

# Update apps/aurorasocial/package.json
# Add dependency: "@aurora/database": "workspace:*"

# Update imports in apps/aurorasocial/src
# Change: import { prisma } from '@/lib/prisma'
# To: import { prisma } from '@aurora/database'
```

**Verification:**
- `npm run build` succeeds in `apps/aurorasocial`
- Tests pass
- Prisma client accessible via `@aurora/database`

#### Step 1.3: Extract @aurora/ui Package

**Goal:** Create shared UI component library

```bash
# Create package
mkdir -p packages/ui/src/components

# Create package.json
cat > packages/ui/package.json <<EOF
{
  "name": "@aurora/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106"
  },
  "devDependencies": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
EOF

# Move shared components (start with foundational ones)
# Example: Button, Input, Modal base components
mv apps/aurorasocial/src/components/ui/* packages/ui/src/components/

# Create index.ts (barrel export)
cat > packages/ui/src/index.ts <<EOF
export * from './components/Button'
export * from './components/Input'
// ... other exports
EOF

# Update apps/aurorasocial imports
# Change: import { Button } from '@/components/ui/Button'
# To: import { Button } from '@aurora/ui'
```

**Verification:**
- TypeScript compiles without errors
- Components render correctly in main app
- No import errors

**Note:** Initially move only truly shared components. App-specific components stay in `apps/web`.

### Phase 2: pnpm Migration (Week 3)

#### Step 2.1: Install pnpm Globally

```bash
# Install pnpm
npm install -g pnpm@latest

# Verify installation
pnpm --version  # Should be 8.x or 9.x
```

#### Step 2.2: Create pnpm Configuration

**`.npmrc` (root):**

```ini
# React 19 RC compatibility (mimics npm flat structure)
shamefully-hoist=true

# Peer dependency handling
strict-peer-dependencies=false
auto-install-peers=true

# Store location (optional, defaults to ~/.pnpm-store)
# store-dir=./.pnpm-store

# Lockfile settings
lockfile=true
prefer-frozen-lockfile=false

# Network settings
fetch-retries=3
fetch-timeout=60000

# Logging
loglevel=info
```

**Why `shamefully-hoist=true`?**
- React 19 RC has peer dependency conflicts
- This flag hoists all dependencies to root (like npm)
- Can be removed once React 19 is stable

#### Step 2.3: Generate pnpm Lockfile

```bash
# Import existing package-lock.json
pnpm import

# This creates pnpm-lock.yaml from package-lock.json
# Preserves exact versions from npm

# Verify lockfile created
ls -lh pnpm-lock.yaml

# Clean npm artifacts
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Install with pnpm
pnpm install

# Verify installation
pnpm list --depth=0
```

**Expected Output:**
- `pnpm-lock.yaml` created (~500KB)
- `.pnpm-store/` created (global content-addressable storage)
- `node_modules/` structure different (symlinks instead of copies)

#### Step 2.4: Update Package Scripts

**No changes needed!** pnpm supports `npm run` syntax.

**Optional improvements:**

```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "clean": "pnpm -r exec rm -rf node_modules"
  }
}
```

**Flags explained:**
- `--filter <package>` - Run command in specific package
- `-r` or `--recursive` - Run in all workspace packages
- `exec` - Execute shell command in each package

#### Step 2.5: Verify Build & Tests

```bash
# Build all packages
pnpm -r build

# Run all tests
pnpm test:all

# Start dev server
pnpm dev

# Verify at http://localhost:3000
```

**Validation Checklist:**
- [ ] Build succeeds without errors
- [ ] All 40 tests pass
- [ ] Dev server starts correctly
- [ ] Login flow works
- [ ] Dashboard loads
- [ ] No console errors

### Phase 3: CI/CD Updates (Week 4)

#### Step 3.1: Update GitHub Actions

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Setup pnpm BEFORE Node.js
      - uses: pnpm/action-setup@v2
        with:
          version: 8  # Pin to specific major version

      # Setup Node.js with pnpm cache
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # Install dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Generate Prisma client
      - name: Generate Prisma client
        run: pnpm --filter @aurora/database generate

      # Build packages
      - name: Build packages
        run: pnpm -r build

      # Run tests
      - name: Run unit tests
        run: pnpm test

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          # Add test environment variables
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

**Key Changes:**
1. Add `pnpm/action-setup` before Node setup
2. Change cache from `npm` to `pnpm`
3. Use `pnpm install --frozen-lockfile` (CI best practice)
4. Update all `npm run` to `pnpm`

#### Step 3.2: Update Vercel Configuration

**Good news:** Vercel auto-detects pnpm! No changes needed.

**Verification:**
1. Push to feature branch
2. Check Vercel deployment logs
3. Look for: `Detected pnpm-lock.yaml`
4. Verify build succeeds

**Optional: Add `vercel.json` for explicit config:**

```json
{
  "buildCommand": "pnpm -r build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

#### Step 3.3: Test Full Pipeline

```bash
# 1. Create feature branch
git checkout -b feat/pnpm-migration

# 2. Commit changes
git add .
git commit -m "feat: migrate to pnpm for monorepo support"

# 3. Push to GitHub
git push origin feat/pnpm-migration

# 4. Create PR and watch CI

# 5. Verify Vercel preview deployment

# 6. Merge to main after validation
```

**Success Criteria:**
- [ ] GitHub Actions pipeline passes
- [ ] Vercel preview deploys successfully
- [ ] Preview environment works (manual smoke test)
- [ ] No runtime errors in logs
- [ ] Production deployment succeeds

---

## Risk Mitigation Strategy

### Risk 1: React 19 RC + pnpm Compatibility Issues

**Probability:** Medium
**Impact:** High (blocks deployment)

**Mitigation:**
1. Use `shamefully-hoist=true` in `.npmrc`
2. Test thoroughly in preview environment
3. Keep React 19 RC packages pinned to exact versions

**Fallback:**
- If issues persist, downgrade to React 18 stable
- Or wait for React 19 stable release (Q1 2025)

**Detection:**
- Build errors mentioning peer dependencies
- Runtime errors about missing modules
- Type errors from React types

### Risk 2: CI/CD Pipeline Failures

**Probability:** Medium
**Impact:** Medium (delays deployment)

**Mitigation:**
1. Test pipeline on feature branch first
2. Keep npm workflow as backup in separate file
3. Monitor first 5-10 CI runs closely

**Fallback:**
- Clear GitHub Actions cache
- Rebuild with `--no-frozen-lockfile` if lockfile corrupted
- Temporarily use npm workflow

**Detection:**
- Failed GitHub Actions runs
- Dependency resolution errors in logs
- Cache restore failures

### Risk 3: Vercel Deployment Breaks

**Probability:** Low
**Impact:** High (production downtime)

**Mitigation:**
1. Deploy to preview environment first
2. Full smoke test on preview URL
3. Monitor deployment logs for warnings

**Fallback:**
- Vercel instant rollback to previous deployment
- Revert commit and redeploy with npm

**Detection:**
- Build failures in Vercel dashboard
- 500 errors on preview URL
- Missing environment variables

### Risk 4: Team Productivity Loss

**Probability:** High
**Impact:** Low (temporary)

**Mitigation:**
1. Create migration guide (common commands)
2. Hold team sync before migration
3. Pair program first pnpm setup

**Fallback:**
- Developers can still use npm commands locally (pnpm is superset)
- Provide command cheat sheet

**Common Commands Reference:**

| npm | pnpm | Notes |
|-----|------|-------|
| `npm install` | `pnpm install` | Install all dependencies |
| `npm install <pkg>` | `pnpm add <pkg>` | Add dependency |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` | Add dev dependency |
| `npm run dev` | `pnpm dev` | Run script (both work) |
| `npm run build` | `pnpm build` | Run script (both work) |
| `npm ci` | `pnpm install --frozen-lockfile` | CI install |
| `npm list` | `pnpm list` | List dependencies |

### Risk 5: Lock File Conflicts in Active PRs

**Probability:** High
**Impact:** Medium (merge conflicts)

**Mitigation:**
1. Coordinate migration during low PR activity
2. Announce timeline in team channel 48h ahead
3. Merge all active PRs before migration

**Fallback:**
- Developers rebase and regenerate lock files:
  ```bash
  git rebase main
  rm pnpm-lock.yaml
  pnpm install
  git add pnpm-lock.yaml
  git rebase --continue
  ```

**Communication Template:**

```
📢 pnpm Migration Notice

When: [Date/Time]
Impact: All active PRs will need lock file regeneration
Action Required:
1. Merge your PRs before [Date], OR
2. Rebase after migration and run `pnpm install`

Questions? Reply in thread.
```

---

## Rollback Strategy

### Emergency Rollback Procedure

If critical issues arise within first 7 days:

```bash
# 1. Revert migration commit
git revert <migration-commit-sha>

# 2. Clean pnpm artifacts
rm -rf node_modules pnpm-lock.yaml .pnpm-store
rm -rf apps/*/node_modules packages/*/node_modules
rm -rf .npmrc

# 3. Restore npm
npm install --legacy-peer-deps

# 4. Verify build
npm run build
npm test:all

# 5. Commit rollback
git commit -m "Rollback to npm due to [specific issue]"

# 6. Push and deploy
git push origin main
```

### Rollback Triggers

Execute rollback if:
- **Critical:** Production runtime errors in first 24h
- **Critical:** Build failures blocking deployments
- **High:** More than 3 team members blocked for >4 hours
- **High:** Vercel deployment success rate <80%
- **Medium:** Test failures >10% increase

### Post-Rollback Actions

1. **Document failure reason** in `docs/decisions/pnpm-rollback.md`
2. **Create GitHub issue** with reproduction steps
3. **Research resolution** before retry
4. **Plan retry** only after issue resolved

---

## Success Metrics

### Quantitative Metrics

| Metric | Baseline (npm) | Target (pnpm) | Measurement |
|--------|----------------|---------------|-------------|
| **CI Install Time** | ~90s | <30s (3x faster) | GitHub Actions logs |
| **Local Install Time** | ~45s | <15s (3x faster) | `time pnpm install` |
| **Disk Usage** | ~800MB | <400MB (50% reduction) | `du -sh node_modules` |
| **Build Time** | ~2m | ~2m (no change expected) | Build logs |
| **Test Pass Rate** | 100% (40/40) | 100% (40/40) | Test output |

### Qualitative Metrics

- [ ] All tests passing (40/40 from original implementation)
- [ ] Successful production deployment
- [ ] Zero runtime errors in first 48 hours
- [ ] Team can run `pnpm dev` without issues
- [ ] No increase in support requests
- [ ] Positive team feedback on developer experience

### Monitoring Period

**Week 1:** Daily monitoring
- Check error logs 2x per day
- Review deployment metrics
- Monitor team Slack for issues

**Week 2-4:** Regular monitoring
- Weekly error log review
- Weekly deployment success rate check
- Bi-weekly team check-in

**Month 2+:** Baseline established
- Monthly performance review
- Adjust `.npmrc` settings if needed
- Remove `shamefully-hoist` after React 19 stable

---

## Future Expansion Plan

### Phase 4: Extract Remaining Packages (Month 2-3)

**@aurora/api:**
- Move tRPC routers from `apps/web/src/server/routers`
- Create `packages/api/src/routers`
- Share across web/admin/mobile apps

**@aurora/auth:**
- Move Auth.js configuration
- Create reusable auth utilities
- Share session management logic

**@aurora/config:**
- Extract TypeScript config
- Extract ESLint config
- Extract Tailwind config
- Share across all packages

### Phase 5: Add Second App (Month 4-6)

**apps/admin:**
- Separate admin portal for GESTOR users
- Reuses `@aurora/ui`, `@aurora/database`, `@aurora/api`
- Independent deployment to Vercel

**Benefits:**
- Separate concerns (public-facing vs admin)
- Independent scaling
- Faster builds (only rebuild changed app)

### Phase 6: Mobile App (Month 6+)

**apps/mobile:**
- React Native app
- Reuses `@aurora/api` (tRPC client)
- Shares business logic
- Native UI (not `@aurora/ui`)

---

## Team Training Plan

### Pre-Migration Training (Week before migration)

**1. Team Sync Meeting (30 min):**
- Explain why pnpm (monorepo readiness)
- Show new structure
- Demo common commands
- Answer questions

**2. Documentation:**
- Publish migration guide in wiki
- Create command cheat sheet
- Record demo video (optional)

**3. Pair Programming:**
- Pair with each developer on first `pnpm install`
- Walk through workspace commands
- Troubleshoot together

### Post-Migration Support (First week)

**Daily Stand-up Check:**
- "Any pnpm blockers?"
- Share solutions in Slack

**Office Hours:**
- 30min daily for first week
- Drop-in support for issues

**Feedback Collection:**
- Survey after week 1
- Adjust docs based on feedback

---

## References

- [pnpm Documentation](https://pnpm.io/)
- [pnpm Workspaces Guide](https://pnpm.io/workspaces)
- [Vercel pnpm Support](https://vercel.com/docs/deployments/configure-a-build#package-managers)
- [GitHub Actions pnpm Setup](https://github.com/pnpm/action-setup)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

---

## Appendix: Command Reference

### Workspace Commands

```bash
# Run command in specific package
pnpm --filter <package-name> <command>
pnpm --filter web dev
pnpm --filter @aurora/database generate

# Run command in all packages
pnpm -r <command>
pnpm -r build
pnpm -r test

# Add dependency to specific package
pnpm --filter <package-name> add <dependency>
pnpm --filter web add lodash
pnpm --filter @aurora/ui add -D @types/react

# Add workspace dependency
pnpm --filter web add @aurora/ui@workspace:*

# List all packages
pnpm list --depth=0

# Execute shell command in all packages
pnpm -r exec <command>
pnpm -r exec rm -rf dist
```

### Common Troubleshooting

**Issue: "ERR_PNPM_NO_MATCHING_VERSION"**
```bash
# Solution: Update pnpm
pnpm self-update
```

**Issue: "Peer dependency warnings"**
```bash
# Solution: Already handled in .npmrc
# If persists, add specific package to shamefully-hoist
```

**Issue: "Cannot find module"**
```bash
# Solution: Regenerate lockfile
rm pnpm-lock.yaml
pnpm install
```

**Issue: "Build fails after migration"**
```bash
# Solution: Clean and rebuild
pnpm -r exec rm -rf node_modules dist .next
pnpm install
pnpm -r build
```

---

**End of Migration Design Document**

*Next Steps: Review with team → Schedule migration → Execute Phase 1*
