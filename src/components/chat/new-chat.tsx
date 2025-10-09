"use client";

import { generateId } from "ai";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

export function NewChat() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push(`/${generateId()}`);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleNewChat}>
      <PlusIcon size={16} />
    </Button>
  );
}
