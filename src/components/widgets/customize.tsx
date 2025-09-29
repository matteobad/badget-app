"use client";

import { useWidgetParams } from "~/hooks/use-widget-params";
import { useScopedI18n } from "~/shared/locales/client";
import { CheckIcon, LayoutGridIcon } from "lucide-react";

import { Button } from "../ui/button";

export function Customize() {
  const tHeader = useScopedI18n("widgets.header");

  const { params, setParams } = useWidgetParams();

  const isEditing = !!params.isEditing;

  return (
    <Button
      variant="outline"
      className="space-x-2"
      onClick={(e) => {
        e.preventDefault();
        void setParams({ isEditing: isEditing ? null : true });
      }}
      type="button"
    >
      <span>{isEditing ? tHeader("save") : tHeader("customize")}</span>
      {isEditing ? (
        <CheckIcon size={16} className="text-muted-foreground" />
      ) : (
        <LayoutGridIcon size={16} className="text-muted-foreground" />
      )}
    </Button>
  );
}
