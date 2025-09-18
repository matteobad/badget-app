"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { Button } from "../ui/button";
import { AmountInput } from "./amount-input";
import { DescriptionInput } from "./description-input";

export function LineItems() {
  const { control } = useFormContext<SplitFormValues>();

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "splits",
  });

  const reorderList = (newFields: typeof fields) => {
    const firstDiffIndex = fields.findIndex(
      (field, index) => field.id !== newFields[index]?.id,
    );

    if (firstDiffIndex !== -1) {
      const newIndex = newFields.findIndex(
        (field) => field.id === fields[firstDiffIndex]?.id,
      );

      if (newIndex !== -1) {
        swap(firstDiffIndex, newIndex);
      }
    }
  };

  const handleRemove = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 grid grid-cols-[1.5fr_30%_15%] items-end gap-4 font-mono text-xs text-muted-foreground">
        <span>Description</span>

        <span>Category</span>

        <span className="text-right">Amount</span>
      </div>

      <Reorder.Group
        axis="y"
        values={fields}
        onReorder={reorderList}
        className="!m-0"
      >
        {fields.map((field, index) => (
          <LineItemRow
            key={field.id}
            item={field}
            index={index}
            handleRemove={handleRemove}
            isReorderable={fields.length > 1}
          />
        ))}
      </Reorder.Group>

      <button
        type="button"
        onClick={() =>
          append({
            note: "",
            category: "uncategorized",
            amount: 0,
          })
        }
        className="flex cursor-pointer items-center space-x-2 font-mono text-xs text-muted-foreground"
      >
        <PlusIcon className="size-3.5" />
        <span className="text-xs">Add item</span>
      </button>
    </div>
  );
}

function LineItemRow({
  index,
  handleRemove,
  isReorderable,
  item,
}: {
  index: number;
  handleRemove: (index: number) => void;
  isReorderable: boolean;
  item: SplitFormValues["splits"][number];
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      className={`group relative mb-2 grid w-full grid-cols-[1.5fr_30%_15%] items-start gap-4`}
      value={item}
      dragListener={false}
      dragControls={controls}
    >
      {isReorderable && (
        <Button
          type="button"
          className="absolute -top-[4px] -left-9 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
          onPointerDown={(e) => controls.start(e)}
          variant="ghost"
        >
          <GripVerticalIcon className="size-4 text-muted-foreground" />
        </Button>
      )}

      <DescriptionInput name={`splits.${index}.note`} />

      <div className="flex items-center gap-2">
        <AmountInput name={`splits.${index}.amount`} />
      </div>

      <div className="text-right">
        <AmountInput name={`splits.${index}.amount`} className="text-right" />
      </div>

      {index > 1 && (
        <Button
          type="button"
          onClick={() => handleRemove(index)}
          className="absolute -top-[4px] -right-9 text-[#878787] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
          variant="ghost"
        >
          <XIcon />
        </Button>
      )}
    </Reorder.Item>
  );
}
