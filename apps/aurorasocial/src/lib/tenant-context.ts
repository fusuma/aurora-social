import { AsyncLocalStorage } from "async_hooks";

/**
 * Tenant Context Management
 * Provides tenant isolation via AsyncLocalStorage for multi-tenant queries
 */

interface TenantContext {
  tenantId: string;
  userId?: string;
}

const tenantContextStore = new AsyncLocalStorage<TenantContext>();

/**
 * Get current tenant ID from async context
 * @throws Error if tenant context not found
 */
export function getCurrentTenantId(): string {
  const context = tenantContextStore.getStore();
  if (!context?.tenantId) {
    throw new Error(
      "Tenant context not found. Ensure setTenantContext is called before database operations."
    );
  }
  return context.tenantId;
}

/**
 * Get current user ID from async context (optional)
 */
export function getCurrentUserId(): string | undefined {
  const context = tenantContextStore.getStore();
  return context?.userId;
}

/**
 * Set tenant context for current async execution
 * @param tenantId - The tenant/municipality ID
 * @param userId - Optional user ID for audit trails
 * @param callback - Async function to execute with tenant context
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: () => Promise<T>,
  userId?: string
): Promise<T> {
  return tenantContextStore.run({ tenantId, userId }, callback);
}

/**
 * Get full tenant context (for debugging/logging)
 */
export function getTenantContext(): TenantContext | undefined {
  return tenantContextStore.getStore();
}
