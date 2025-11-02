"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface EmailInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ error, label = "Email", className = "", ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="text-red-600 ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <input
          ref={ref}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={hasError}
          aria-describedby={hasError ? "email-error" : undefined}
          className={`
            block w-full rounded-md border px-4 py-3 text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-2
            transition-colors
            ${
              hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-600"
            }
            ${className}
          `}
          {...props}
        />
        {hasError && (
          <p id="email-error" className="mt-2 text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";
