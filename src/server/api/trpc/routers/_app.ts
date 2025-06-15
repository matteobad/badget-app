import { checkHealth } from "~/server/services/health-service";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "../init";
import { categoryRouter } from "./category";
import { dashboardRouter } from "./dashboard";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  category: categoryRouter,
  health: publicProcedure.query(async () => {
    try {
      await checkHealth();
      return { status: "ok" };
    } catch (error) {
      return { status: "error", error };
    }
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export type infer of procedures
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.todo.getAll();
 */
export const createCaller = createCallerFactory(appRouter);
