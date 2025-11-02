import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Prisma Client Integration", () => {
  it("should initialize Prisma client", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
  });

  it("should have User model available", () => {
    expect(prisma.user).toBeDefined();
  });

  it("should have Municipality model available", () => {
    expect(prisma.municipality).toBeDefined();
  });
});
