"use client";

import type { Path } from "react-hook-form";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useController, useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { SelectCategory } from "../transaction-category/select-category";

type CategoryInputProps<P extends Path<SplitFormValues>> = React.ComponentProps<
  typeof SelectCategory
> & {
  name: P;
  className?: string;
};

export function CategoryInput<P extends Path<SplitFormValues>>({
  className,
  name,
  ...props
}: CategoryInputProps<P>) {
  const [isFocused, setIsFocused] = useState(false);

  const { control } = useFormContext();
  const {
    field: { value, onChange, onBlur },
  } = useController({
    name,
    control,
  });

  const isPlaceholder = !value && !isFocused;

  return (
    <div className="relative h-6 w-full font-mono">
      <SelectCategory
        selected={value as string}
        onChange={(value) => {
          onChange(value.slug, { shouldValidate: true });
          setIsFocused(false);
          onBlur();
        }}
        className={cn(
          className,
          isPlaceholder && "opacity-0",
          "h-6 w-full justify-start border-0 border-b border-transparent !bg-transparent p-0 text-xs text-ellipsis focus:border-border [&>svg]:size-3",
        )}
        align="end"
        {...props}
      />

      {isPlaceholder && (
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]" />
        </div>
      )}
    </div>
  );
}
