import type { Context } from "~/server/api/rest/init";
import { OpenAPIHono } from "@hono/zod-openapi";
import { routers } from "~/server/api/rest/routers/_app";
import { handle } from "hono/vercel";

const app = new OpenAPIHono<Context>().basePath("/api/rest");

app.route("/", routers);

export const GET = handle(app);
export const POST = handle(app);
