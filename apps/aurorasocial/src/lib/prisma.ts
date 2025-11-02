import { PrismaClient } from "@prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "./tenant-context";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Models that require tenant isolation
const TENANT_ISOLATED_MODELS = ["Familia", "Individuo", "Atendimento", "Anexo", "User"] as const;

// Models that have createdBy field for audit trail
const AUDITABLE_MODELS = ["Familia", "Individuo"] as const;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Middleware for automatic tenant isolation and audit trail
prisma.$use(async (params, next) => {
  // Skip middleware for non-tenant-isolated models
  if (!TENANT_ISOLATED_MODELS.includes(params.model as never)) {
    return next(params);
  }

  try {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    // Auto-inject tenantId on create
    if (params.action === "create") {
      params.args.data = {
        ...params.args.data,
        tenantId,
      };

      // Auto-inject createdBy for auditable models
      if (
        userId &&
        AUDITABLE_MODELS.includes(params.model as never) &&
        !params.args.data.createdBy
      ) {
        params.args.data.createdBy = userId;
      }
    }

    // Auto-inject tenantId on createMany
    if (params.action === "createMany") {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((item: Record<string, unknown>) => ({
          ...item,
          tenantId,
          ...(userId && AUDITABLE_MODELS.includes(params.model as never) && !item.createdBy
            ? { createdBy: userId }
            : {}),
        }));
      } else {
        params.args.data = {
          ...params.args.data,
          tenantId,
        };
      }
    }

    // Auto-filter by tenantId on queries
    const queryActions = [
      "findMany",
      "findFirst",
      "findUnique",
      "count",
      "aggregate",
      "groupBy",
      "update",
      "updateMany",
      "delete",
      "deleteMany",
      "upsert",
    ];

    if (queryActions.includes(params.action)) {
      if (!params.args.where) {
        params.args.where = {};
      }
      params.args.where.tenantId = tenantId;
    }

    return next(params);
  } catch (error) {
    // If tenant context is not set, throw error (fail-safe)
    if (error instanceof Error && error.message.includes("Tenant context")) {
      throw new Error(
        `Multi-tenant violation: ${params.action} on ${params.model} requires tenant context`
      );
    }
    throw error;
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
