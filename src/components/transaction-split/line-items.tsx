"use client";

import { useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useFieldArray, useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { Button } from "../ui/button";
import { AmountInput } from "./amount-input";
import { CategoryInput } from "./category-input";
import { DescriptionInput } from "./description-input";

export function LineItems() {
  const { control, watch, getFieldState, setValue } =
    useFormContext<SplitFormValues>();

  const transactionAmount = watch("transaction.amount");
  const currentSplits = watch("splits");

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "splits",
  });

  const autoCompleteSplits = useCallback(() => {
    // Check which splits are touched using React Hook Form state
    const touchedSplits = currentSplits.map((_, index) => {
      const fieldState = getFieldState(`splits.${index}.amount`);
      return fieldState.isTouched;
    });

    const cleanSplits = currentSplits.filter(
      (_, index) => !touchedSplits[index],
    );

    // Serve almeno uno split "libero"
    if (cleanSplits.length === 0) return;

    if (cleanSplits.length === 0) return;

    // Somma dei touched in centesimi
    const touchedAmountCents = Math.round(
      currentSplits
        .filter((_, index) => touchedSplits[index])
        .reduce((sum, split) => sum + Number(split.amount || 0), 0) * 100,
    );

    const transactionCents = Math.round(Number(transactionAmount) * 100);
    const remainingCents = transactionCents - touchedAmountCents;

    if (remainingCents === 0) {
      // Non c'è nulla da distribuire → metto 0 su tutti i clean
      cleanSplits.forEach((split) => {
        const idx = currentSplits.findIndex((s) => s.id === split.id);
        if (idx !== -1) {
          setValue(`splits.${idx}.amount`, 0, {
            shouldValidate: true,
            shouldDirty: false,
            shouldTouch: false,
          });
        }
      });
      return;
    }

    // Distribuzione con supporto a valori negativi
    const sign = remainingCents < 0 ? -1 : 1;
    const absRemaining = Math.abs(remainingCents);

    const base = Math.floor(absRemaining / cleanSplits.length);
    const remainder = absRemaining % cleanSplits.length;

    cleanSplits.forEach((split, idx) => {
      const cents = base + (idx < remainder ? 1 : 0);
      const signedCents = sign * cents;
      const amount = (signedCents / 100).toFixed(2);

      const cleanSplitIndex = currentSplits.findIndex((s) => s.id === split.id);
      if (cleanSplitIndex === -1) return;

      setValue(`splits.${cleanSplitIndex}.amount`, Number(amount), {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    });
  }, [currentSplits, transactionAmount, getFieldState, setValue]);

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
            handleBlur={autoCompleteSplits}
            isReorderable={fields.length > 1}
          />
        ))}
      </Reorder.Group>

      <button
        type="button"
        onClick={() =>
          append({
            id: nanoid(),
            note: "",
            category: "",
            amount: 0,
          })
        }
        className="flex w-fit cursor-pointer items-center space-x-2 font-mono text-xs text-muted-foreground"
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
  handleBlur,
  isReorderable,
  item,
}: {
  index: number;
  handleRemove: (index: number) => void;
  handleBlur: () => void;
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
        <CategoryInput name={`splits.${index}.category`} />
      </div>

      <div className="text-right">
        <AmountInput
          name={`splits.${index}.amount`}
          className="text-right"
          handleBlur={() => handleBlur()}
        />
      </div>

      {index > 1 && (
        <Button
          type="button"
          onClick={() => handleRemove(index)}
          className="absolute -top-[4px] -right-9 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
          variant="ghost"
        >
          <XIcon />
        </Button>
      )}
    </Reorder.Item>
  );
}
