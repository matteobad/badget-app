"use client";

import { CheckIcon, LayoutGridIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useScopedI18n } from "~/shared/locales/client";

import { Button } from "../ui/button";
import { useIsCustomizing, useWidgetActions } from "./widget-provider";

export function Customize() {
  const tHeader = useScopedI18n("widgets.header");

  const pathname = usePathname();
  const isCustomizing = useIsCustomizing();
  const { setIsCustomizing } = useWidgetActions();

  const isOnRootPath = pathname === "/overview" || pathname === "";

  if (!isOnRootPath) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="hidden md:flex space-x-2"
      onClick={() => setIsCustomizing(!isCustomizing)}
      type="button"
    >
      <span>{isCustomizing ? tHeader("save") : tHeader("customize")}</span>
      {isCustomizing ? (
        <CheckIcon size={16} className="text-muted-foreground" />
      ) : (
        <LayoutGridIcon size={16} className="text-muted-foreground" />
      )}
    </Button>
  );
}
