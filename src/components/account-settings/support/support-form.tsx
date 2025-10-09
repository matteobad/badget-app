"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useUserQuery } from "~/hooks/use-user";
import { submitFeedbackAction } from "~/server/actions";
import { sendSupportSchema } from "~/shared/validators/support.schema";

export function SupportForm() {
  const { data: user } = useUserQuery();

  const form = useForm<z.infer<typeof sendSupportSchema>>({
    resolver: zodResolver(sendSupportSchema),
    defaultValues: {
      email: user?.email,
      fullName: user?.name,
      subject: undefined,
      type: undefined,
      priority: undefined,
      message: undefined,
    },
  });

  const { isExecuting, execute } = useAction(submitFeedbackAction, {
    onSuccess: () => {
      toast.success("Support ticket sent.");
      form.reset();
    },
    onError: () => {
      toast.error("Something went wrong please try again.");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(execute)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summary of the problem you have"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Accounts">Accounts</SelectItem>
                    <SelectItem value="Transactions">Transactions</SelectItem>
                    <SelectItem value="Categories">Categories</SelectItem>
                    <SelectItem value="Tags">Tags</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Severity</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
                  className="min-h-[150px] resize-none"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton isSubmitting={isExecuting} disabled={isExecuting}>
          Submit
        </SubmitButton>
      </form>
    </Form>
  );
}
