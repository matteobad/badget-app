"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgetPassword } from "~/shared/helpers/better-auth/auth-client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import { SubmitButton } from "../submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const forgotPasswordSchema = z.object({
  email: z
    .email({ message: "Invalid type" }) // checks if the input given by the user is email
    .min(1, { message: "Email is required" }), // checks if the email field is empty or not
});

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      // Call the authClient's forgetPassword method, passing the email and a redirect URL.
      await forgetPassword(
        {
          email: values.email, // Email to which the reset password link should be sent.
          redirectTo: "/reset-password", // URL to redirect the user after resetting the password.
        },
        {
          // Lifecycle hooks to handle different stages of the request.
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            toast.success("Reset password link has been sent");
          },
          onError: (ctx) => {
            console.error(ctx.error.message);
            toast.error(ctx.error.message);
          },
        },
      );
    } catch (error) {
      // catch the error
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  type="email"
                  placeholder="example@gmail.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isSubmitting={loading} className="w-full">
          Submit
        </SubmitButton>
      </form>
    </Form>
  );
};
