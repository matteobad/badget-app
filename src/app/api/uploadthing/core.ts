import type { FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { db } from "~/server/db";
import { attachment_table } from "~/server/db/schema/transactions";

const f = createUploadthing();

export const ourFileRouter = {
  attachmentUploader: f(["image", "pdf"])
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await auth();

      // If you throw, the user will not be able to upload
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      const inserted = await db
        .insert(attachment_table)
        .values({
          fileName: file.name,
          fileKey: file.key,
          fileUrl: file.ufsUrl,
          fileType: file.type,
          fileSize: file.size,
          userId: metadata.userId,
        })
        .returning();

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { attachments: JSON.stringify(inserted) };
    }),
  csvUploader: f({ "text/csv": { maxFileSize: "4MB" } })
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await auth();

      // If you throw, the user will not be able to upload
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      await db.insert(attachment_table).values({
        fileName: file.name,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
        fileType: file.type,
        fileSize: file.size,
        userId: metadata.userId,
      });

      return;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
