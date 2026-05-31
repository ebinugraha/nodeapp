import { credentialsRouter } from "@/features/credentials/server/routers";
import { exectutionRouter } from "@/features/executions/server/routers";
import { settingsRouter } from "@/features/settings/server/routers";
import { templatesRouter } from "@/features/templates/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: exectutionRouter,
  settings: settingsRouter,
  templates: templatesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
