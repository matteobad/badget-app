"use client";

import type { Path } from "react-hook-form";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useController, useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { Input } from "../ui/input";

type DescriptionInputProps<P extends Path<SplitFormValues>> =
  React.ComponentProps<typeof Input> & {
    name: P;
    className?: string;
  };

export function DescriptionInput<P extends Path<SplitFormValues>>({
  className,
  name,
  ...props
}: DescriptionInputProps<P>) {
  const [isFocused, setIsFocused] = useState(false);

  const { control } = useFormContext<SplitFormValues>();

  const {
    field: { value, onChange, onBlur },
  } = useController({
    name,
    control,
  });

  const isPlaceholder = !value && !isFocused;

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        value={value as string}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value, { shouldValidate: true });
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        {...props}
        className={cn(
          className,
          isPlaceholder && "opacity-0",
          "h-6 border-0 border-b border-transparent !bg-transparent p-0 text-xs shadow-none focus:border-border",
        )}
      />

      {isPlaceholder && (
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]" />
        </div>
      )}
    </div>
  );
}
