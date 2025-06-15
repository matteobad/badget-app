"use client";

import React, { useRef } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod/v4";

const FormSchema = z.object({
  query: z.string(),
});

export function SearchInstitutions({ query }: { query?: string }) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleInputChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    200,
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: standardSchemaResolver(FormSchema),
    defaultValues: {
      query: query,
    },
  });

  return (
    <Form {...form}>
      <form
        ref={formRef}
        autoFocus={true}
        action="/banking/accounts/"
        className="flex w-full items-center space-x-2"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Revolut"
                  {...field}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <LoadingIcon />
    </Form>
  );
}

function LoadingIcon() {
  const { pending } = useFormStatus();

  return pending ? (
    <div
      data-pending={pending ? "" : undefined}
      className="absolute top-1/2 right-3 -translate-y-1/2"
    >
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  ) : null;
}
