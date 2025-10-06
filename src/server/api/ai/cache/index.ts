import { createCached } from "@ai-sdk-tools/cache";
import { env } from "~/env";

export const cached = createCached({
  debug: env.NODE_ENV === "development",
});
