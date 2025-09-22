import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createCallerFactory, createTRPCRouter } from "../init";
import { assetRouter } from "./asset";
import { bankAccountRouter } from "./bank-account";
import { bankConnectionRouter } from "./bank-connection";
import { budgetRouter } from "./budget";
import { documentsRouter } from "./document";
import { documentTagsRouter } from "./document-tag";
import { institutionRouter } from "./institution";
import { metricsRouter } from "./metrics";
import { organizationRouter } from "./organization";
import { preferencesRouter } from "./preferences";
import { searchRouter } from "./search";
import { tagRouter } from "./tag";
import { transactionRouter } from "./transaction";
import { transactionAttachmentRouter } from "./transaction-attachment";
import { transactionCategoryRouter } from "./transaction-category";
import { transactionTagRouter } from "./transaction-tag";
import { userRouter } from "./user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  organization: organizationRouter,
  metrics: metricsRouter,
  asset: assetRouter,
  institution: institutionRouter,
  bankConnection: bankConnectionRouter,
  bankAccount: bankAccountRouter,
  documents: documentsRouter,
  documentTags: documentTagsRouter,
  tag: tagRouter,
  preferences: preferencesRouter,
  budget: budgetRouter,
  transaction: transactionRouter,
  transactionAttachment: transactionAttachmentRouter,
  transactionCategory: transactionCategoryRouter,
  transactionTag: transactionTagRouter,
  search: searchRouter,
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
