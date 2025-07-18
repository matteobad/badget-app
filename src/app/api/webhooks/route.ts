// import { headers } from "next/headers";
// import { type WebhookEvent } from "@clerk/nextjs/server";
// import { env } from "~/env";
// import { deleteUser, upsertUser } from "~/server/db/mutations/users-mutations";
// import { Webhook } from "svix";

// // @see: https://clerk.com/docs/webhooks/sync-data
// export async function POST(req: Request) {
//   const SIGNING_SECRET = env.SIGNING_SECRET;

//   if (!SIGNING_SECRET) {
//     throw new Error(
//       "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local",
//     );
//   }

//   // Create new Svix instance with secret
//   const wh = new Webhook(SIGNING_SECRET);

//   // Get headers
//   const headerPayload = await headers();
//   const svix_id = headerPayload.get("svix-id");
//   const svix_timestamp = headerPayload.get("svix-timestamp");
//   const svix_signature = headerPayload.get("svix-signature");

//   // If there are no headers, error out
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response("Error: Missing Svix headers", {
//       status: 400,
//     });
//   }

//   // Get body
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   const payload = await req.json();
//   const body = JSON.stringify(payload);

//   let evt: WebhookEvent;

//   // Verify payload with headers
//   try {
//     evt = wh.verify(body, {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error("Error: Could not verify webhook:", err);
//     return new Response("Error: Verification error", {
//       status: 400,
//     });
//   }

//   // Do something with payload
//   // For this guide, log payload to console
//   const { id } = evt.data;
//   const eventType = evt.type;
//   console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
//   console.log("Webhook payload:", body);

//   switch (evt.type) {
//     case "user.created":
//       await upsertUser(evt.data);
//       break;
//     case "user.updated":
//       await upsertUser(evt.data);
//       break;
//     case "user.deleted":
//       await deleteUser(evt.data);
//       break;
//     // TODO: map other event to handle complete sync with Clerk
//   }

//   return new Response("Webhook received", { status: 200 });
// }
