import { Role, UserStatus } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      tenantId?: string;
      role?: Role;
      status?: UserStatus;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    tenantId?: string;
    role?: Role;
    status?: UserStatus;
  }
}
