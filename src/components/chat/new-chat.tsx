"use client";

import { useRouter } from "next/navigation";
import { generateId } from "ai";
import { PlusIcon } from "lucide-react";

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
