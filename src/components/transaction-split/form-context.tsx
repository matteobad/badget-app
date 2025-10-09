"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";

const DEFAULT_SPLITS = [
  {
    id: nanoid(),
    note: "",
    category: "",
    amount: 0,
  },
  {
    id: nanoid(),
    note: "",
    category: "",
    amount: 0,
  },
];

export const transactionSchema = z.object({
  id: z.uuid(),
  date: z.iso.date(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  logoUrl: z.string().nullable(),
});

export const lineItemSchema = z.object({
  id: z.string(),
  note: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  amount: z.number(),
});

export const splitFormSchema = z.object({
  subtotal: z.number().nullable().optional(),
  remaining: z.number(),
  transaction: transactionSchema,
  splits: z.array(lineItemSchema).min(2),
});

export type SplitFormValues = z.infer<typeof splitFormSchema>;

type FormContextProps = {
  children: React.ReactNode;
  data?: RouterOutput["transaction"]["getSplits"];
};

export function FormContext({ children, data }: FormContextProps) {
  const form = useForm<z.infer<typeof splitFormSchema>>({
    resolver: zodResolver(splitFormSchema),
    defaultValues: {
      splits: DEFAULT_SPLITS,
    },
    // mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...(data ?? {}),
        splits: data.splits?.length > 0 ? data.splits : DEFAULT_SPLITS,
      });
    }
  }, [form, data]);

  return <FormProvider {...form}>{children}</FormProvider>;
}
