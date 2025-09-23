"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSpaceMutation, useSpaceQuery } from "~/hooks/use-space";
import { useForm } from "react-hook-form";
import z from "zod";

import { CountrySelector } from "../country-selector";
import { SubmitButton } from "../submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

const formSchema = z.object({
  countryCode: z.string().min(2).max(32),
});

export function SpaceCountry() {
  const { data } = useSpaceQuery();
  const updateSpaceMutation = useSpaceMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: data?.countryCode ?? "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    updateSpaceMutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Space country</CardTitle>
            <CardDescription>
              This is your space&apos;s country of origin.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <FormControl>
                    <CountrySelector
                      defaultValue={field.value ?? ""}
                      onSelect={(code, name) => {
                        field.onChange(name);
                        form.setValue("countryCode", code);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <SubmitButton
              isSubmitting={updateSpaceMutation.isPending}
              disabled={updateSpaceMutation.isPending}
            >
              Save
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
