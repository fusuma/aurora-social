# Design Token Audit Task

## Objective
Audit /Users/fusuma/dev/carespace-ui/src directory for hardcoded colors and design token opportunities.

## Scope

### 1. Find Hardcoded Colors
- Hex colors: #fff, #000000, #1a2b3c, etc.
- RGB/RGBA: rgb(), rgba()
- HSL/HSLA: hsl(), hsla()
- Named colors: red, blue, white, black, etc.
- Tailwind color utilities not using design tokens

### 2. Design Token Opportunities
- Where CSS custom properties from src/styles/tokens/primitives.css should be used
- Components that could use design system tokens
- Places where Tailwind utilities could replace custom CSS
- Ant Design theme customizations needing design tokens

### 3. Categorization
- High priority: atoms/, molecules/, organisms/
- Medium priority: pages/, templates/
- Low priority: One-off styles, legacy code

### 4. Report Requirements
Location: docs/audits/design-tokens-audit-2025-10-24.md

Include:
- Executive summary with total counts
- Breakdown by file type and component level
- Specific file paths with line numbers
- Recommended design token replacements
- Priority ranking for remediation
- Estimated effort (hours) for fixes

## Methodology
1. Use Grep to find color patterns
2. Categorize by directory structure
3. Analyze each file for token opportunities
4. Generate comprehensive report
