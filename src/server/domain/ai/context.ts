import type { ChatUserContext } from "~/server/cache/chat-cache";
import type { DBClient } from "~/server/db";
import { createTypedContext } from "@ai-sdk-tools/artifacts";

import type { BaseContext } from "@ai-sdk-tools/artifacts";

interface ChatContext extends BaseContext {
  db: DBClient;
  user: ChatUserContext;
}

export const { setContext, getContext } = createTypedContext<ChatContext>();
