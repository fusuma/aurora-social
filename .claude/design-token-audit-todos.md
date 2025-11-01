# Design Token Audit - Task List

## Phase 1: Pattern Discovery
- [ ] Scan for hex colors (#) in src/
- [ ] Scan for RGB/RGBA patterns in src/
- [ ] Scan for HSL/HSLA patterns in src/
- [ ] Scan for named colors (red, blue, white, etc.) in src/
- [ ] Scan for Tailwind color utilities in src/

## Phase 2: Component Analysis
- [ ] Audit atoms/ directory for hardcoded colors
- [ ] Audit molecules/ directory for hardcoded colors
- [ ] Audit organisms/ directory for hardcoded colors
- [ ] Audit pages/ directory for hardcoded colors
- [ ] Audit templates/ directory for hardcoded colors

## Phase 3: Token Opportunities
- [ ] Analyze primitives.css token availability
- [ ] Map hardcoded colors to available tokens
- [ ] Identify missing tokens needed
- [ ] Recommend Tailwind utility replacements

## Phase 4: Report Generation
- [ ] Compile findings into comprehensive report
- [ ] Categorize by priority (high/medium/low)
- [ ] Estimate remediation effort
- [ ] Save to docs/audits/design-tokens-audit-2025-10-24.md

## Expected Artifacts
- docs/audits/design-tokens-audit-2025-10-24.md (main report)
- docs/audits/design-tokens-audit-2025-10-24-data.json (raw data)
