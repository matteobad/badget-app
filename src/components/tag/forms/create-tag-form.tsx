"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { SubmitButton } from "~/components/submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useTagParams } from "~/hooks/use-tag-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createTagSchema } from "~/shared/validators/tag.schema";

export default function CreateTagForm() {
  const { setParams } = useTagParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createTagMutation = useMutation(
    trpc.tag.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey(),
        });
        form.reset();
        toast.success("Tag created");
        void setParams({ createTag: null });
      },
    }),
  );

  const form = useForm<z.infer<typeof createTagSchema>>({
    resolver: standardSchemaResolver(createTagSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof createTagSchema>) => {
    createTagMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="bg-background"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          isSubmitting={createTagMutation.isPending}
          className="w-full"
        >
          Create
        </SubmitButton>
      </form>
    </Form>
  );
}
