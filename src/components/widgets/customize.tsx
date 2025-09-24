"use client";

import {
  Grid2X2PlusIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
} from "lucide-react";

import { Button } from "../ui/button";

export function Customize() {
  return (
    <Button variant="outline" className="space-x-2">
      <span>Customize</span>
      <LayoutGridIcon size={16} className="text-[#666]" />
    </Button>
  );
}
