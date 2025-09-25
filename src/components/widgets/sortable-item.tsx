import type React from "react";
import { useSortable } from "@dnd-kit/react/sortable";

interface Props {
  id: string;
  index: number;
  children: React.ReactNode;
}

export function SortableItem({ id, index, children }: Props) {
  const sortable = useSortable({
    id,
    index,
  });

  return (
    <div ref={sortable.ref} data-id={index}>
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
