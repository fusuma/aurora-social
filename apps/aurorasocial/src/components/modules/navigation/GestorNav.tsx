/**
 * GestorNav Component
 *
 * Navigation menu for GESTOR users
 * Includes links to:
 * - Dashboard
 * - Team Management (Equipe)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/equipe", label: "Equipe" },
  { href: "/relatorios", label: "Relatórios" },
];

export function GestorNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-gray-200 bg-white"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-8">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-blue-600"
            aria-label="Aurora Social - Página inicial"
          >
            Aurora Social
          </Link>

          <div className="flex gap-1" role="menubar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
