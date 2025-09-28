"use client";

import { useWidgetParams } from "~/hooks/use-widget-params";
import { LayoutGridIcon } from "lucide-react";

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
        void setParams({ isEditing: !isEditing });
      }}
      type="button"
    >
      <span>{isEditing ? "Save" : "Customize"}</span>
      <LayoutGridIcon size={16} className="text-muted-foreground" />
    </Button>
  );
}
