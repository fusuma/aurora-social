/**
 * Root tRPC Router
 *
 * Aggregates all sub-routers into the main application router
 */

import { router } from "../trpc";
import { usersRouter } from "./users";
import { citizensRouter } from "./citizens";

export const appRouter = router({
  users: usersRouter,
  citizens: citizensRouter,
});

export type AppRouter = typeof appRouter;
