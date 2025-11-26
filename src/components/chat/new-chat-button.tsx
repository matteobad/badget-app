"use client";

import { useChatActions } from "@ai-sdk-tools/store";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function NewChatButton() {
  const router = useRouter();
  const { reset } = useChatActions();

  const handleNewChat = () => {
    reset();
    router.push("/");
  };

  return (
    <Button
      type="button"
      onClick={handleNewChat}
      variant="outline"
      size="icon"
      title="New chat"
    >
      <PlusIcon size={16} />
    </Button>
  );
}
