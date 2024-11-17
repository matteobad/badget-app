"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { SquareActivityIcon, SquareUserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { addSavingsAccountFormSchema } from "~/lib/validators";

type AddSavingsAccountFormValues = z.infer<typeof addSavingsAccountFormSchema>;

export default function Intro() {
  const router = useRouter();

  const form = useForm<z.output<typeof addSavingsAccountFormSchema>>({
    resolver: zodResolver(addSavingsAccountFormSchema),
    defaultValues: {
      type: "emergency",
    },
  });

  function onSubmit(data: AddSavingsAccountFormValues) {
    router.push(`/savings?step=create-${data.type}`);
  }

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
        variants={{
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="mx-5 flex flex-col items-center space-y-6 text-center sm:mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, type: "spring" },
            },
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormMessage />
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid max-w-md grid-cols-2 gap-4 pt-2"
                    >
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem
                              value="emergency"
                              className="sr-only"
                            />
                          </FormControl>
                          <div className="flex flex-col items-center gap-2 rounded-md border-2 border-muted p-4 hover:border-accent">
                            <SquareActivityIcon className="h-6 w-6" />
                            <span className="block w-full p-2 text-center font-normal">
                              Emergency Fund
                            </span>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem
                              value="pension"
                              className="sr-only"
                            />
                          </FormControl>
                          <div className="flex flex-col items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground">
                            <SquareUserIcon className="h-6 w-6" />
                            <span className="block w-full p-2 text-center font-normal">
                              Pension Fund
                            </span>
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />

              <Button type="submit" className="capitalize">
                Add {form.getValues().type} fund
              </Button>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
