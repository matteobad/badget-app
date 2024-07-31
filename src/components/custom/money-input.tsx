"use client";

import { useReducer } from "react";
import { EuroIcon, XIcon } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input"; // Shandcn UI Input

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
};

// Brazilian currency config
const moneyFormatter = Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function MoneyInput(props: TextInputProps) {
  const initialValue = props.form.getValues()[props.name]
    ? moneyFormatter.format(props.form.getValues()[props.name])
    : "";

  const [value, setValue] = useReducer((_: any, next: string) => {
    const digits = next.replace(/\D/g, "");
    return moneyFormatter.format(Number(digits) / 100);
  }, initialValue);

  function handleChange(realChangeFn: Function, formattedValue: string) {
    const digits = formattedValue.replace(/\D/g, "");
    const realValue = Number(digits) / 100;
    realChangeFn(realValue.toPrecision(2));
  }

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value;
        const _change = field.onChange;

        return (
          <FormItem>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder={props.placeholder}
                  type="text"
                  {...field}
                  onChange={(ev) => {
                    setValue(ev.target.value);
                    handleChange(_change, ev.target.value);
                  }}
                  value={value}
                />
                <Button
                  type="button"
                  onClick={() => setValue("")}
                  className={cn(
                    "absolute right-10 top-2 h-6 w-6 rounded-full",
                    { hidden: !field.value },
                  )}
                  variant="ghost"
                  size="icon"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
                <EuroIcon className="absolute right-3 top-3 h-4 w-4" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
