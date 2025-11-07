"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTRPC } from "~/shared/helpers/trpc/client";

const formSchema = z.object({
  invites: z.array(
    z.object({
      email: z.email(),
      role: z.enum(["admin", "owner", "member"]),
    }),
  ),
});

type InviteFormProps = {
  onSuccess?: () => void;
  skippable?: boolean;
};

export function InviteForm({ onSuccess, skippable = true }: InviteFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createInvitationMutation = useMutation(
    trpc.space.createInvitation.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.space.listInvitations.queryKey(),
        });

        // Show appropriate feedback based on results
        if (data.status === "pending") {
          toast.success("Invites sent", {
            description: `${data.sent} invite${data.sent > 1 ? "s" : ""} sent successfully`,
          });
        }

        onSuccess?.();
      },
    }),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invites: [
        {
          email: "",
          role: "member",
        },
      ],
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createInvitationMutation.mutate(
      data.invites.filter((invite) => invite.email !== ""),
    );
  });

  const { fields, append } = useFieldArray({
    name: "invites",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {fields.map((field, index) => (
          <div
            className="flex items-center justify-between mt-3 space-x-4"
            key={index.toString()}
          >
            <FormField
              control={form.control}
              key={field.id}
              name={`invites.${index}.email`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="jane@example.com"
                      type="email"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`invites.${index}.role`}
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          variant="outline"
          type="button"
          className="mt-4 border-none bg-[#F2F1EF] text-[11px] dark:bg-[#1D1D1D]"
          onClick={() => append({ email: "", role: "member" })}
        >
          Add more
        </Button>

        <div className="border-t-[1px] pt-4 mt-8 items-center justify-between">
          <div>
            {Object.values(form.formState.errors).length > 0 && (
              <span className="text-sm text-destructive">
                Please complete the fields above.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {skippable ? (
              <Link href="/">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-normal"
                >
                  Skip this step
                </Button>
              </Link>
            ) : (
              <div />
            )}

            <SubmitButton
              type="submit"
              isSubmitting={createInvitationMutation.isPending}
              disabled={createInvitationMutation.isPending}
            >
              Send invites
            </SubmitButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
