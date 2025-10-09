"use client";

import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { ForwardIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChatInterface } from "~/hooks/use-chat-interface";
import type { CommandSuggestion } from "~/lib/stores/chat";
import { useChatStore } from "~/lib/stores/chat";
import { cn } from "~/lib/utils";

import { AnimatedSizeContainer } from "../ui/animated-size-component";

export function CommandMenu() {
  const commandListRef = useRef<HTMLDivElement>(null);
  const {
    filteredCommands,
    selectedCommandIndex,
    showCommands,
    resetCommandState,
    setInput,
  } = useChatStore();

  const { sendMessage } = useChatActions();
  const chatId = useChatId();
  const { setChatId } = useChatInterface();

  const handleCommandExecution = (command: CommandSuggestion) => {
    if (!chatId) return;

    setChatId(chatId);

    void sendMessage({
      role: "user",
      parts: [{ type: "text", text: command.title }],
      metadata: {
        toolCall: {
          toolName: command.toolName,
          toolParams: command.toolParams,
        },
      },
    });

    setInput("");
    resetCommandState();
  };

  // Scroll selected command into view
  useEffect(() => {
    if (commandListRef.current && showCommands) {
      const selectedElement = commandListRef.current.querySelector(
        `[data-index="${selectedCommandIndex}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedCommandIndex, showCommands]);

  if (!showCommands || filteredCommands.length === 0) return null;

  return (
    <div
      ref={commandListRef}
      className="absolute right-0 bottom-full left-0 z-30 mb-2 w-full"
    >
      <AnimatedSizeContainer
        height
        className="max-h-80 overflow-y-auto bg-[#f7f7f7]/85 backdrop-blur-lg dark:bg-[#171717]/85"
        transition={{
          type: "spring",
          duration: 0.2,
          bounce: 0.1,
          ease: "easeOut",
        }}
        style={{
          transformOrigin: "bottom center",
        }}
      >
        <div className="p-2">
          {filteredCommands.map((command, index) => {
            const isActive = selectedCommandIndex === index;
            return (
              <div
                key={`${command.command}-${index}`}
                className={cn(
                  "group flex cursor-pointer items-center justify-between px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-black/5 dark:bg-white/5"
                    : "hover:bg-black/5 dark:hover:bg-white/5",
                )}
                onClick={() => handleCommandExecution(command)}
                data-index={index}
              >
                <div>
                  <span className="ml-2 text-[#666]">{command.title}</span>
                </div>
                {isActive && (
                  <span className="material-icons-outlined text-sm text-gray-600 opacity-50 group-hover:text-black group-hover:opacity-100 dark:text-gray-400 dark:group-hover:text-white">
                    <ForwardIcon />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </AnimatedSizeContainer>
    </div>
  );
}
