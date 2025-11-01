import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/modules/auth/LoginForm";
import { signIn } from "next-auth/react";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with email input and submit button", () => {
    render(<LoginForm />);

    expect(screen.getByText("Acesse o AuroraSocial")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Link de Acesso/i })).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("O email é obrigatório")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText("Digite um email válido")).toBeInTheDocument();
    });
  });

  it("calls signIn with correct email when form is submitted", async () => {
    (signIn as any).mockResolvedValue({ error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("email", {
        email: "test@example.com",
        callbackUrl: "/",
        redirect: false,
      });
    });
  });

  it("shows success screen after successful email submission", async () => {
    (signIn as any).mockResolvedValue({ error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Verifique seu Email")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("shows error message when signIn fails", async () => {
    (signIn as any).mockResolvedValue({ error: "Configuration" });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro de configuração do sistema/i)).toBeInTheDocument();
    });
  });

  it("normalizes email to lowercase and trims whitespace", async () => {
    (signIn as any).mockResolvedValue({ error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });

    fireEvent.change(emailInput, { target: { value: "  TEST@EXAMPLE.COM  " } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("email", {
        email: "test@example.com",
        callbackUrl: "/",
        redirect: false,
      });
    });
  });

  it("is accessible with proper ARIA attributes", () => {
    render(<LoginForm error="Test error" />);

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveAttribute("aria-required", "true");
    expect(emailInput).toHaveAttribute("aria-invalid", "false");

    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toHaveTextContent("Test error");
  });

  it("disables submit button while loading", async () => {
    (signIn as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar Link de Acesso/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Enviando...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Verifique seu Email")).toBeInTheDocument();
    });
  });
});
