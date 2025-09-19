"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const DEFAULT_SPLITS = [
  {
    note: "",
    category: "",
    amount: 0,
  },
  {
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
  id: z.uuid().optional(),
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
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...(data ?? {}),
        splits: data.splits?.length > 0 ? data.splits : DEFAULT_SPLITS,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <FormProvider {...form}>{children}</FormProvider>;
}
