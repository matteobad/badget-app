"use client";

import { LayoutGridIcon } from "lucide-react";

import { Button } from "../ui/button";

type Props = {
  isCustomizing: boolean;
  onToggle: () => void;
};

export function Customize({ isCustomizing, onToggle }: Props) {
  return (
    <Button variant="outline" className="space-x-2" onClick={onToggle}>
      <span>{isCustomizing ? "Save" : "Customize"}</span>
      <LayoutGridIcon size={16} className="text-[#666]" />
    </Button>
  );
}
