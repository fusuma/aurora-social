import { describe, it, expect } from "vitest";

describe("Example Unit Test", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify string equality", () => {
    const greeting = "Hello, Aurora Social";
    expect(greeting).toContain("Aurora");
  });

  it("should check array operations", () => {
    const roles = ["GESTOR", "TECNICO"];
    expect(roles).toHaveLength(2);
    expect(roles).toContain("GESTOR");
  });
});
