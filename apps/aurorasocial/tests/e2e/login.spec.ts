import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("has correct page title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/Login.*AuroraSocial/);
    await expect(page.getByRole("heading", { name: "Acesse o AuroraSocial" })).toBeVisible();
  });

  test("displays email input with proper labels", async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required");
  });

  test("shows validation error for empty email submission", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });
    await submitButton.click();

    await expect(page.getByText("O email é obrigatório")).toBeVisible();
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    await expect(page.getByText("Digite um email válido")).toBeVisible();
  });

  test("accepts valid email format", async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);
    await emailInput.fill("test@example.com");
    await emailInput.blur();

    // Should NOT show validation error
    await expect(page.getByText("Digite um email válido")).not.toBeVisible();
  });

  test("keyboard navigation works correctly", async ({ page }) => {
    await page.keyboard.press("Tab");
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeFocused();

    await emailInput.fill("test@example.com");
    await page.keyboard.press("Tab");

    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });
    await expect(submitButton).toBeFocused();

    // Submit with Enter key
    await page.keyboard.press("Enter");
  });

  test("has proper ARIA attributes for accessibility", async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);

    await expect(emailInput).toHaveAttribute("aria-required", "true");
    await expect(emailInput).toHaveAttribute("aria-invalid", "false");

    // Trigger error
    await emailInput.fill("invalid");
    await emailInput.blur();

    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
  });

  test("submit button shows loading state", async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);
    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });

    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Should show loading state
    await expect(page.getByText("Enviando...")).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("meets color contrast requirements", async ({ page }) => {
    // Basic visual regression test for WCAG AA compliance
    // In a real implementation, you would use axe-playwright or similar
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });
    await expect(submitButton).toHaveCSS("background-color", "rgb(37, 99, 235)"); // blue-600
    await expect(submitButton).toHaveCSS("color", "rgb(255, 255, 255)"); // white
  });

  test("responsive design - mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    const heading = page.getByRole("heading", { name: "Acesse o AuroraSocial" });
    await expect(heading).toBeVisible();

    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });
    await expect(submitButton).toBeVisible();
  });

  test("responsive design - tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    const heading = page.getByRole("heading", { name: "Acesse o AuroraSocial" });
    await expect(heading).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Enviar Link de Acesso/i });
    await expect(submitButton).toBeVisible();
  });

  test("handles error parameter from URL", async ({ page }) => {
    await page.goto("/login?error=Configuration");

    await expect(page.getByText(/Erro de configuração do sistema/i)).toBeVisible();
  });

  test("handles callbackUrl parameter", async ({ page }) => {
    await page.goto("/login?callbackUrl=/dashboard");

    // Verify the page loads correctly
    await expect(page.getByRole("heading", { name: "Acesse o AuroraSocial" })).toBeVisible();
  });
});
