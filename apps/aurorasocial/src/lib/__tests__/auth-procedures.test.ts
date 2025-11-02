import { describe, it, expect } from "vitest";
import {
  enforceGestorRole,
  enforceAuthenticated,
  isGestor,
  isTecnico,
  getTenantId,
  getUserId,
  UnauthorizedError,
  ForbiddenError,
  type AuthContext,
} from "@/server/auth-procedures";

describe("Auth Procedures", () => {
  const mockGestorContext: AuthContext = {
    session: {
      user: {
        id: "user-123",
        tenantId: "tenant-123",
        role: "GESTOR",
        email: "gestor@example.com",
        name: "Test Gestor",
      },
    },
  };

  const mockTecnicoContext: AuthContext = {
    session: {
      user: {
        id: "user-456",
        tenantId: "tenant-123",
        role: "TECNICO",
        email: "tecnico@example.com",
        name: "Test Tecnico",
      },
    },
  };

  const mockUnauthenticatedContext: AuthContext = {
    session: null,
  };

  describe("enforceAuthenticated", () => {
    it("should allow authenticated GESTOR user", () => {
      expect(() => enforceAuthenticated(mockGestorContext)).not.toThrow();
    });

    it("should allow authenticated TECNICO user", () => {
      expect(() => enforceAuthenticated(mockTecnicoContext)).not.toThrow();
    });

    it("should throw UnauthorizedError for unauthenticated user", () => {
      expect(() => enforceAuthenticated(mockUnauthenticatedContext)).toThrow(UnauthorizedError);
    });
  });

  describe("enforceGestorRole", () => {
    it("should allow GESTOR user", () => {
      expect(() => enforceGestorRole(mockGestorContext)).not.toThrow();
    });

    it("should throw ForbiddenError for TECNICO user", () => {
      expect(() => enforceGestorRole(mockTecnicoContext)).toThrow(ForbiddenError);
    });

    it("should throw UnauthorizedError for unauthenticated user", () => {
      expect(() => enforceGestorRole(mockUnauthenticatedContext)).toThrow(UnauthorizedError);
    });
  });

  describe("isGestor", () => {
    it("should return true for GESTOR user", () => {
      expect(isGestor(mockGestorContext)).toBe(true);
    });

    it("should return false for TECNICO user", () => {
      expect(isGestor(mockTecnicoContext)).toBe(false);
    });

    it("should return false for unauthenticated user", () => {
      expect(isGestor(mockUnauthenticatedContext)).toBe(false);
    });
  });

  describe("isTecnico", () => {
    it("should return false for GESTOR user", () => {
      expect(isTecnico(mockGestorContext)).toBe(false);
    });

    it("should return true for TECNICO user", () => {
      expect(isTecnico(mockTecnicoContext)).toBe(true);
    });

    it("should return false for unauthenticated user", () => {
      expect(isTecnico(mockUnauthenticatedContext)).toBe(false);
    });
  });

  describe("getTenantId", () => {
    it("should return tenant ID for GESTOR user", () => {
      expect(getTenantId(mockGestorContext)).toBe("tenant-123");
    });

    it("should return tenant ID for TECNICO user", () => {
      expect(getTenantId(mockTecnicoContext)).toBe("tenant-123");
    });

    it("should throw UnauthorizedError for unauthenticated user", () => {
      expect(() => getTenantId(mockUnauthenticatedContext)).toThrow(UnauthorizedError);
    });
  });

  describe("getUserId", () => {
    it("should return user ID for GESTOR user", () => {
      expect(getUserId(mockGestorContext)).toBe("user-123");
    });

    it("should return user ID for TECNICO user", () => {
      expect(getUserId(mockTecnicoContext)).toBe("user-456");
    });

    it("should throw UnauthorizedError for unauthenticated user", () => {
      expect(() => getUserId(mockUnauthenticatedContext)).toThrow(UnauthorizedError);
    });
  });
});
