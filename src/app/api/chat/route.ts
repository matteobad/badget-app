import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { setContext } from "~/server/api/ai/context";
import { generateTitle } from "~/server/api/ai/generate-title";
import { generateSystemPrompt, mainAgent } from "~/server/api/ai/main-agent";
import { extractTextContent } from "~/server/api/ai/utils/extract-text-content";
import { getUserContext } from "~/server/api/ai/utils/get-user-context";
import { hasEnoughContent } from "~/server/api/ai/utils/has-enough-content";
import { suggestedActionsCache } from "~/server/cache/suggested-actions-cache";
import { db } from "~/server/db";
import {
  getChatById,
  saveChat,
  saveChatMessage,
} from "~/server/domain/chat/queries";
import { auth } from "~/shared/helpers/better-auth/auth";
import { chatTitleArtifact } from "~/shared/validators/artifacts/chat-title";
import { chatRequestSchema } from "~/shared/validators/chat.schema";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  validateUIMessages,
} from "ai";
import { HTTPException } from "hono/http-exception";

const MAX_MESSAGES_IN_CONTEXT = 20;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // If no session exists, return a 401 and render unauthorized.tsx
  if (!session) {
    unauthorized();
  }

  // Parse and validate the request body manually
  const body = await req.json();
  const validationResult = chatRequestSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { success: false, error: validationResult.error },
      { status: 400 },
    );
  }

  const { message, id, country, city, timezone } = validationResult.data;
  const organizationId = session.user.defaultOrganizationId;
  const userId = session.user.id;

  try {
    const [userContext, previousMessages] = await Promise.all([
      getUserContext({
        db,
        userId,
        organizationId,
        country,
        city,
        timezone,
      }),
      getChatById(db, id, organizationId),
    ]);

    // Check if this is a forced tool call message
    const messageMetadata = message.metadata;
    const isToolCallMessage = messageMetadata?.toolCall;

    // Track suggested action usage if this is a tool call from suggested actions
    if (isToolCallMessage && messageMetadata?.toolCall) {
      const { toolName } = messageMetadata.toolCall;

      // Map tool names to suggested action IDs
      // This is a simple mapping - you might want to make this more sophisticated
      const toolNameToActionId: Record<string, string> = {
        getBurnRate: "burn-rate", // Could be multiple actions that use this tool
        getBurnRateAnalysis: "health-report",
        getTransactions: "latest-transactions",
      };

      // Try to find matching action ID for this tool
      // For now, we'll use a heuristic based on the tool name
      const possibleActionId = toolNameToActionId[toolName];
      if (possibleActionId) {
        // Increment usage asynchronously (don't block the response)
        suggestedActionsCache
          .incrementUsage(organizationId, userId, possibleActionId)
          .catch((error) => {
            console.error({
              msg: "Failed to track suggested action usage",
              userId,
              organizationId,
              toolName,
              actionId: possibleActionId,
              error: error instanceof Error ? error.message : String(error),
            });
          });
      }
    }

    const isWebSearchMessage = messageMetadata?.webSearch;

    const previousMessagesList = previousMessages?.messages ?? [];
    const allMessagesForValidation = [...previousMessagesList, message];

    // Check if any message has blob URLs or data URLs (which would cause validateUIMessages to fail)
    const hasUnsupportedUrls = allMessagesForValidation.some((msg) =>
      msg.parts?.some(
        (part: any) =>
          part.type === "file" &&
          typeof part.url === "string" &&
          (part.url.startsWith("blob:") ?? part.url.startsWith("data:")),
      ),
    );

    let validatedMessages: typeof allMessagesForValidation;
    if (hasUnsupportedUrls) {
      // Skip validation for messages with blob URLs or data URLs to avoid download errors
      // The AI SDK will handle the files appropriately during processing
      validatedMessages = allMessagesForValidation;
    } else {
      // Validate messages to ensure they're properly formatted
      validatedMessages = await validateUIMessages({
        messages: allMessagesForValidation,
      });
    }

    // Use only the last MAX_MESSAGES_IN_CONTEXT messages for context
    const originalMessages = validatedMessages.slice(-MAX_MESSAGES_IN_CONTEXT);

    // Check if we need a title (no existing title)
    const needsTitle = !previousMessages?.title;

    // Variable to store generated title for saving with chat
    let generatedTitle: string | null = null;

    // Generate title if conversation has enough combined content
    const allMessages = [...(previousMessages?.messages ?? []), message];
    const shouldGenerateTitle = needsTitle && hasEnoughContent(allMessages);

    if (shouldGenerateTitle) {
      try {
        const messageContent = extractTextContent(allMessages);

        // Use combined text from all messages for better context
        generatedTitle = await generateTitle({
          message: messageContent,
          organizationName: userContext.organizationName,
          fullName: userContext.fullName,
          country: userContext.country,
          baseCurrency: userContext.baseCurrency,
          city: userContext.city,
          timezone: userContext.timezone,
        });

        console.info({
          msg: "Chat title generated",
          chatId: id,
          title: generatedTitle,
          userId,
          organizationId,
        });
      } catch (error) {
        console.error("Failed to generate chat title", { chatId: id }, error);
      }
    }

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages,
        onFinish: async ({ isContinuation, responseMessage }) => {
          if (isContinuation) {
            // If this is a continuation, save/update the chat with title if generated
            await saveChat(db, {
              chatId: id,
              organizationId,
              userId,
              title: generatedTitle,
            });

            // Only save the new AI response message
            await saveChatMessage(db, {
              chatId: id,
              organizationId,
              userId,
              message: responseMessage,
            });
          } else {
            // If this is a new conversation, create the chat with title if generated
            await saveChat(db, {
              chatId: id,
              organizationId,
              userId,
              title: generatedTitle, // Generate title if first message has enough content
            });

            // Save user message
            const userMessage = originalMessages[originalMessages.length - 1];
            if (userMessage) {
              await saveChatMessage(db, {
                chatId: id,
                organizationId,
                userId,
                message: userMessage,
              });
            }

            // Save AI response
            await saveChatMessage(db, {
              chatId: id,
              organizationId,
              userId,
              // @ts-ignore
              message: responseMessage,
            });
          }
        },
        execute: ({ writer }) => {
          setContext({
            db,
            user: userContext,
            writer,
          });

          // Generate chat title artifact if we have a title
          if (generatedTitle) {
            const titleStream = chatTitleArtifact.stream({
              title: generatedTitle,
            });

            titleStream.complete();
          }

          // Generate system prompt with context
          const systemPrompt = generateSystemPrompt(
            userContext,
            isToolCallMessage,
            isWebSearchMessage,
          );

          // Stream result
          const result = mainAgent.stream({
            system: systemPrompt,
            messages: convertToModelMessages(originalMessages),
          });

          result.consumeStream();

          writer.merge(
            result.toUIMessageStream({
              sendStart: false,
              sendSources: true,
              sendReasoning: true,
            }),
          );
        },
      }),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof HTTPException) {
      throw error;
    }

    return NextResponse.json(
      {
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
