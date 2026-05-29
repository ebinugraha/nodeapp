import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { credentialsRouter } from "@/features/credentials/server/routers";
import { exectutionRouter } from "@/features/executions/server/routers";
import { settingsRouter } from "@/features/settings/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: exectutionRouter,
  settings: settingsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
