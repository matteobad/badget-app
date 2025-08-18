import { user as user_table } from "~/server/db/schema/auth";
import { createUpdateSchema } from "drizzle-zod";

export const updateUserSchema = createUpdateSchema(user_table);
