/**
 * UserStatusBadge Component
 *
 * Displays user status with semantic colors:
 * - ACTIVE: Green
 * - INACTIVE: Red
 * - PENDING: Yellow
 */

import { UserStatus } from "@prisma/client";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const statusConfig = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  INACTIVE: {
    label: "Inativo",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
} as const;

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
