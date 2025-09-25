"use client";

import { useRouter } from "next/navigation";
import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { cn } from "~/lib/utils";
import { chatTitleArtifact } from "~/server/domain/ai/artifacts/chat-title";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "../ui/button";
import { TextEffect } from "../ui/text-effect";
import { ChatHistory } from "./chat-history";
import { NewChat } from "./new-chat";

export function ChatHeader() {
  const router = useRouter();
  const { isHome } = useChatInterface();
  const { data } = useArtifact(chatTitleArtifact);

  if (isHome) {
    return null;
  }

  return (
    <div className="relative z-10 flex w-full justify-between bg-background px-6 py-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/overview")}
        >
          <ArrowLeftIcon size={16} />
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center justify-center transition-all duration-300 ease-in-out",
        )}
      >
        {data && (
          <TextEffect
            per="char"
            preset="fade"
            speedReveal={3}
            speedSegment={2}
            className="font-regular truncate text-sm"
          >
            {data.title}
          </TextEffect>
        )}
      </div>

      <div className="flex items-center space-x-4 transition-all duration-300 ease-in-out">
        <NewChat />
        <ChatHistory />
      </div>
    </div>
  );
}
