/**
 * UserRoleBadge Component
 *
 * Displays user role with semantic colors:
 * - GESTOR: Blue
 * - TECNICO: Gray
 */

import { Role } from "@prisma/client";

interface UserRoleBadgeProps {
  role: Role;
}

const roleConfig = {
  GESTOR: {
    label: "Gestor",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  TECNICO: {
    label: "Técnico",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
} as const;

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      role="status"
      aria-label={`Papel: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
