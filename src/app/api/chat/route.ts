import type { ChatMessageMetadata } from "~/server/domain/ai/types";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { db } from "~/server/db";
import { chatTitleArtifact } from "~/server/domain/ai/artifacts/chat-title";
import { setContext } from "~/server/domain/ai/context";
import { generateSystemPrompt } from "~/server/domain/ai/generate-system-prompt";
import {
  extractTextContent,
  generateTitle,
  hasEnoughContent,
} from "~/server/domain/ai/generate-title";
import {
  getChatById,
  saveChat,
  saveChatMessage,
} from "~/server/domain/ai/queries";
import { createToolRegistry } from "~/server/domain/ai/tool-types";
import { formatToolCallTitle } from "~/server/domain/ai/utils/format-tool-call-title";
import { getUserContext } from "~/server/domain/ai/utils/get-user-context";
import { shouldForceStop } from "~/server/domain/ai/utils/streaming-utils";
import { auth } from "~/shared/helpers/better-auth/auth";
import { chatRequestSchema } from "~/shared/validators/chat.schema";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
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
    const messageMetadata = message.metadata as ChatMessageMetadata;
    const isToolCallMessage = messageMetadata?.toolCall;

    const isWebSearchMessage = messageMetadata?.webSearch;

    const previousMessagesList = previousMessages?.messages || [];
    const allMessagesForValidation = [...previousMessagesList, message];

    // Check if any message has blob URLs or data URLs (which would cause validateUIMessages to fail)
    const hasUnsupportedUrls = allMessagesForValidation.some((msg) =>
      msg.parts?.some(
        (part: any) =>
          part.type === "file" &&
          typeof part.url === "string" &&
          (part.url.startsWith("blob:") || part.url.startsWith("data:")),
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
    const allMessages = [...(previousMessages?.messages || []), message];
    const shouldGenerateTitle = needsTitle && hasEnoughContent(allMessages);

    if (shouldGenerateTitle) {
      try {
        let messageContent: string;

        if (isToolCallMessage) {
          const { toolName } = messageMetadata.toolCall!;
          // Generate a descriptive title for tool calls using registry metadata
          messageContent = formatToolCallTitle(toolName);
        } else {
          // Use combined text from all messages for better context
          messageContent = extractTextContent(allMessages);
        }

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
              // @ts-ignore
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
                // @ts-ignore
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

          const result = streamText({
            model: google("gemini-2.5-flash"),
            system: generateSystemPrompt(
              userContext,
              isToolCallMessage,
              isWebSearchMessage,
            ),
            messages: convertToModelMessages(originalMessages),
            temperature: 0.7,
            stopWhen: (step) => {
              // Stop if we've reached 10 steps (original condition)
              if (stepCountIs(10)(step)) {
                return true;
              }

              // Force stop if any tool has completed its full streaming response
              return shouldForceStop(step);
            },
            experimental_transform: smoothStream({ chunking: "word" }),
            tools: createToolRegistry(),
            onError: (error) => {
              console.error(error);
            },
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
