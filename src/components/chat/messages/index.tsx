"use client";

import { Fragment } from "react";
import { useChatMessages, useChatStatus } from "@ai-sdk-tools/store";
import { useUserQuery } from "~/hooks/use-user";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
  ThinkingMessage,
} from "../message";
import { Response } from "../response";
import { WebSearchSources } from "../web-search-sources";
import { MessageActions } from "./messages-actions";

export function Messages() {
  const messages = useChatMessages();
  const status = useChatStatus();
  const { data: user } = useUserQuery();

  return (
    <div className="relative mx-auto size-full h-[calc(100vh-86px)] w-full pb-28">
      <div className="flex h-full w-full flex-col">
        <Conversation className="h-full w-full">
          <ConversationContent className="mx-auto mb-40 max-w-[770px] px-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "data-canvas":
                      return null; // Canvas content is rendered in sidebar

                    case "text":
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>

                            {message.role === "user" && user && (
                              <MessageAvatar
                                src={user.image!}
                                name={user.name}
                              />
                            )}
                          </Message>

                          {message.role === "assistant" &&
                            message.parts.filter(
                              (part) => part.type === "source-url",
                            ).length > 0 && (
                              <WebSearchSources
                                sources={message.parts.filter(
                                  (part) => part.type === "source-url",
                                )}
                              />
                            )}

                          {message.role === "assistant" &&
                            status !== "streaming" && (
                              <MessageActions
                                messageContent={part.text}
                                messageId={message.id}
                              />
                            )}
                        </Fragment>
                      );

                    default: {
                      if (part.type.startsWith("tool-")) {
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response>
                                  {(part as any)?.output?.text}
                                </Response>
                              </MessageContent>
                            </Message>
                          </Fragment>
                        );
                      }

                      return null;
                    }
                  }
                })}
              </div>
            ))}

            {status === "submitted" && <ThinkingMessage />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
    </div>
  );
}
