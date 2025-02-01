import type { FileRouter } from "uploadthing/next";
import { tasks } from "@trigger.dev/sdk/v3";
import { createUploadthing } from "uploadthing/next";

import type { csvValidator } from "~/trigger/csv";

const f = createUploadthing();

export const ourFileRouter = {
  csvUploader: f({ "text/csv": { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      // Trigger the handleCSVUpload task with the uploaded file
      // This will start the CSV processing and return the necessary handle
      // So the client can subscribe to updates using `useRealtimeRun`
      const handle = await tasks.trigger<typeof csvValidator>(
        "csv-validator",
        file,
      );

      return handle;
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
