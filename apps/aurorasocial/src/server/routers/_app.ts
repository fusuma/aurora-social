/**
 * Root tRPC Router
 *
 * Aggregates all sub-routers into the main application router
 */

import { router } from "../trpc";
import { usersRouter } from "./users";

export const appRouter = router({
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
