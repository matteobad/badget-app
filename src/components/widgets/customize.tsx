"use client";

import { useWidgetParams } from "~/hooks/use-widget-params";
import { CheckIcon, LayoutGridIcon } from "lucide-react";

import { Button } from "../ui/button";

export function Customize() {
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
      <span>{isEditing ? "Save" : "Customize"}</span>
      {isEditing ? (
        <CheckIcon size={16} className="text-muted-foreground" />
      ) : (
        <LayoutGridIcon size={16} className="text-muted-foreground" />
      )}
    </Button>
  );
}
