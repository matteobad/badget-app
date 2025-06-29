import type { getTagsSchema } from "~/shared/validators/tag.schema";
import type z from "zod/v4";

import { getTagsQuery } from "../domain/tag/queries";

export async function getTags(
  input: z.infer<typeof getTagsSchema>,
  userId: string,
) {
  return await getTagsQuery(input, userId);
}
