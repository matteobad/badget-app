"use client";

import { useRef } from "react";
import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { useChatActions, useChatId, useChatStatus } from "@ai-sdk-tools/store";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { useChatStore } from "~/lib/stores/chat";
import { cn } from "~/lib/utils";

import type { PromptInputMessage } from "../ui/prompt-input";
import { SuggestedActionsButton } from "../suggested-actions-button";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "../ui/prompt-input";
import { CommandMenu } from "./command-menu";
import { FollowupQuestions } from "./followup-questions";
import { RecordButton } from "./record-button";
import { WebSearchButton } from "./web-search-button";

export function ChatInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const status = useChatStatus();
  const { sendMessage } = useChatActions();
  const chatId = useChatId();
  const { setChatId } = useChatInterface();
  const { current } = useArtifacts({
    exclude: ["chat-title", "followup-questions"],
  });
  const isCanvasVisible = !!current;

  const {
    input,
    isWebSearch,
    isUploading,
    isRecording,
    isProcessing,
    showCommands,
    selectedCommandIndex,
    filteredCommands,
    setInput,
    setIsUploading,
    handleInputChange,
    handleKeyDown,
    resetCommandState,
  } = useChatStore();

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    let processedFiles = message.files;

    // Convert blob URLs to data URLs for server compatibility
    if (message.files && message.files.length > 0) {
      setIsUploading(true);
      try {
        processedFiles = await Promise.all(
          message.files.map(async (file) => {
            // If it's a blob URL, convert to data URL
            if (file.url.startsWith("blob:")) {
              const response = await fetch(file.url);
              const blob = await response.blob();

              // Convert blob to data URL
              const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });

              return {
                ...file,
                url: dataUrl,
              };
            }

            // Return file as-is if not a blob URL
            return file;
          }),
        );
      } catch (error) {
        console.error("Failed to process files:", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Set chat ID to ensure proper URL routing
    if (chatId) {
      setChatId(chatId);
    }

    void sendMessage({
      text: message.text ?? "Sent with attachments",
      files: processedFiles,
      metadata: {
        webSearch: isWebSearch,
      },
    });

    setInput("");
    resetCommandState();
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-[70px] z-20 px-6 transition-all duration-300 ease-in-out",
          isCanvasVisible ? "right-[603px]" : "right-0",
        )}
      >
        <div className="relative mx-auto w-full max-w-[770px] pt-2">
          <FollowupQuestions />

          {/* Command Suggestions Menu */}
          <CommandMenu />

          <PromptInput onSubmit={handleSubmit} globalDrop multiple>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                ref={textareaRef}
                autoFocus
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // Handle Enter key for commands
                  if (e.key === "Enter" && showCommands) {
                    e.preventDefault();
                    const selectedCommand =
                      filteredCommands[selectedCommandIndex];
                    if (selectedCommand) {
                      // Execute command through the store
                      if (!chatId) return;

                      setChatId(chatId);

                      void sendMessage({
                        role: "user",
                        parts: [{ type: "text", text: selectedCommand.title }],
                        metadata: {
                          toolCall: {
                            toolName: selectedCommand.toolName,
                            toolParams: selectedCommand.toolParams,
                          },
                        },
                      });

                      setInput("");
                      resetCommandState();
                    }
                    return;
                  }

                  // Handle Enter key for normal messages
                  if (e.key === "Enter" && !showCommands) {
                    e.preventDefault();
                    if (input.trim()) {
                      // Set chat ID to ensure proper URL routing
                      if (chatId) {
                        setChatId(chatId);
                      }

                      void sendMessage({
                        text: input,
                        files: [],
                        metadata: {
                          webSearch: isWebSearch,
                        },
                      });

                      setInput("");
                      resetCommandState();
                    }
                    return;
                  }

                  // Handle other keys normally
                  handleKeyDown(e);
                }}
                value={input}
                placeholder={isWebSearch ? "Search the web" : "Ask anything"}
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionAddAttachments />
                <SuggestedActionsButton />
                <WebSearchButton />
              </PromptInputTools>

              <PromptInputTools>
                <RecordButton size={16} />
                <PromptInputSubmit
                  disabled={
                    (!input && !status) ||
                    isUploading ||
                    isRecording ||
                    isProcessing
                  }
                  status={status}
                />
              </PromptInputTools>
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
