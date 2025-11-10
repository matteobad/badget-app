"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CategoryBadge } from "./category-badge";
import { SelectCategory } from "./select-category";

type Selected = {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  slug: string;
  children?: Selected[];
};

type Props = {
  selected?: Selected;
  onChange: (selected: Selected) => void;
};

export function InlineSelectCategory({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (category: Selected) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full text-left hover:opacity-70 transition-opacity text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {selected && selected.slug !== "uncategorized" ? (
            <CategoryBadge
              category={{
                name: selected?.name ?? "uncategorized",
                color: selected?.color ?? null,
                icon: selected?.icon ?? null,
              }}
            />
          ) : (
            "Seleziona categoria..."
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        side="bottom"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-[286px] h-[270px]">
          <SelectCategory
            headless
            selected={selected?.slug}
            onChange={handleSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
