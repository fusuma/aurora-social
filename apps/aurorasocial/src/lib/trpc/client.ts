/**
 * tRPC Client Configuration
 *
 * Provides type-safe client for making tRPC calls from React components
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();
