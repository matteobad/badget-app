import type { FileRouter } from "uploadthing/next";
import { tasks } from "@trigger.dev/sdk/v3";
import { createUploadthing } from "uploadthing/next";
import { z } from "zod";

import { CSVMappingSchema } from "~/utils/schemas";

const f = createUploadthing();

export const ourFileRouter = {
  csvUploader: f({ "text/csv": { maxFileSize: "4MB" } })
    .input(
      z.object({
        mapping: CSVMappingSchema,
        accountId: z.string(),
        // TODO: handle in the future -> inverted: z.boolean()
      }),
    )
    .middleware(({ input }) => {
      return { mapping: input.mapping };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const handle = await tasks.trigger("csv-validator", {
        file,
        mapping: metadata.mapping,
      });
      return handle;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
