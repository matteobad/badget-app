import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_ufwotkeqqmsmzqaszwoc",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 60,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/server/jobs/tasks"],
  build: {
    extensions: [
      syncVercelEnvVars({
        // A personal access token created in your Vercel account settings
        // Used to authenticate API requests to Vercel
        // Generate at: https://vercel.com/account/tokens
        vercelAccessToken: process.env.VERCEL_ACCESS_TOKEN,
        // The unique identifier of your Vercel project
        // Found in Project Settings > General > Project ID
        projectId: process.env.VERCEL_PROJECT_ID,
      }),
    ],
  },
});
