/**
 * Root tRPC Router
 *
 * Aggregates all sub-routers into the main application router
 */

import { router } from "../trpc";
import { usersRouter } from "./users";
import { citizensRouter } from "./citizens";
import { attachmentsRouter } from "./attachments";
import { importRouter } from "./import";
import { reportingRouter } from "./reporting";

export const appRouter = router({
  users: usersRouter,
  citizens: citizensRouter,
  attachments: attachmentsRouter,
  import: importRouter,
  reporting: reportingRouter,
});

export type AppRouter = typeof appRouter;
