import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { checkHealth } from "~/server/services/health-service";
import { secureHeaders } from "hono/secure-headers";

import { protectedMiddleware } from "../init";
import { budgetRouter } from "./budget";

const routers = new OpenAPIHono();

routers.use(secureHeaders());
// routers.use("*", authMiddleware());
routers.use(...protectedMiddleware);

routers.doc("/openapi", {
  openapi: "3.1.0",
  info: {
    version: "0.0.1",
    title: "GELLIFY API",
    description: "Description",
    contact: {
      name: "Midday Support",
      email: "engineer@midday.ai",
      url: "https://midday.ai",
    },
    license: {
      name: "AGPL-3.0 license",
      url: "https://github.com/midday-ai/midday/blob/main/LICENSE",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/rest/",
      description: "Production API",
    },
  ],
  security: [
    {
      token: [],
    },
  ],
});

routers.get(
  "/scalar",
  Scalar({ url: "/api/rest/openapi", pageTitle: "GELLIFY API" }),
);

routers.get("/health", async (c) => {
  try {
    await checkHealth();
    return c.json({ status: "ok" }, 200);
  } catch (error) {
    return c.json({ status: "error", error }, 500);
  }
});

routers.route("/budgets", budgetRouter);

export { routers };
