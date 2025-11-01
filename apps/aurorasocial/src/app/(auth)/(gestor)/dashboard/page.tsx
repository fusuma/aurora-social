/**
 * Dashboard Page (GESTOR-only)
 *
 * Story 3.4: Implementação do Dashboard Gerencial
 *
 * Displays management dashboard with:
 * - Key metrics (Total Atendimentos, Families, Individuals)
 * - Monthly trend chart (last 12 months)
 * - Demand type distribution chart
 * - Last updated timestamp
 * - Manual refresh button
 * - Loading and error states
 * - 1-hour cache from API (Story 3.1)
 * - WCAG AA accessibility
 *
 * AC1: Dashboard is default screen for GESTOR role
 * AC2: Displays cards with key metrics
 * AC3: Shows last update timestamp
 * AC4: Data query respects cache trade-off (not real-time)
 * AC5: WCAG AA compliance
 * AC6: Data filtered by tenantId (enforced by API)
 * AC7: User-friendly error messages
 */

import { DashboardContent } from "./DashboardContent";

export default function DashboardPage() {
  return <DashboardContent />;
}
