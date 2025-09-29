"use client";

import type { UIChatMessage } from "~/server/domain/ai/types";
import { useMemo } from "react";
import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { AIDevtools } from "@ai-sdk-tools/devtools";
import { useChat } from "@ai-sdk-tools/store";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { cn } from "~/lib/utils";
import { DefaultChatTransport, generateId } from "ai";

import type { Geo } from "@vercel/functions";
import { Canvas } from "../canvas/canvas";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";

type Props = {
  id?: string | null;
  geo?: Geo;
};

export function ChatInterface({ id, geo }: Props) {
  const { current } = useArtifacts({
    exclude: ["chat-title", "followup-questions"],
  });
  const isCanvasVisible = !!current;
  const { isHome, isChatPage, chatId: routeChatId } = useChatInterface();

  // Use provided id, or get from route, or generate new one
  const providedId = id ?? routeChatId;

  // Generate a consistent chat ID - use provided ID or generate one
  const chatId = useMemo(() => providedId ?? generateId(), [providedId]);

  useChat<UIChatMessage>({
    id: chatId,
    enableBatching: true,
    experimental_throttle: 50,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            id: chatId,
            message: messages[messages.length - 1],
            country: geo?.country,
            city: geo?.city,
            timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
      },
    }),
  });

  return (
    <div className="relative z-10 h-full w-full overflow-hidden">
      <div
        className={cn(
          "relative h-full w-full transition-all duration-300 ease-in-out",
          isHome && "h-[calc(100vh-648px)]",
          isChatPage && "h-[calc(100vh-88px)]",
          isCanvasVisible && "pr-[603px]",
        )}
      >
        <ChatHeader />

        <div className="relative w-full">
          <Messages />
          <ChatInput />
        </div>
      </div>

      <Canvas />

      {process.env.NODE_ENV === "development" && (
        <AIDevtools
          config={{
            streamCapture: {
              enabled: true,
              endpoint: "/api/chat",
              autoConnect: true,
            },
          }}
        />
      )}
    </div>
  );
}
