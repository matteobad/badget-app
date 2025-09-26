import type { ChatUserContext } from "~/server/chat-cache";
import type { DBClient } from "~/server/db";
import { createTypedContext } from "@ai-sdk-tools/artifacts";

import type { BaseContext } from "@ai-sdk-tools/artifacts";

interface ChatContext extends BaseContext {
  db: DBClient;
  user: ChatUserContext;
}

export const { setContext, getContext } = createTypedContext<ChatContext>();
