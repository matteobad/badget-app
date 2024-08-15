"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDashedIcon, Loader2 } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { insertCategorySchema } from "~/lib/validators";
import { insertCategoryAction } from "~/server/actions/insert-category-action";
import { CategoryType } from "~/server/db/schema/enum";
import Icon from "../icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CATEGORY_ICONS = ["link"] as const;

export function AddCategoryModal() {
  const [step, setStep] = useQueryState("step", parseAsString);

  const isOpen = step === "insert";

  const onClose = () => {
    void setStep(null);
  };

  const { execute, status } = useAction(insertCategoryAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      void setStep(null);
      toast.error("Categoria creata!", {
        duration: 3500,
      });
    },
  });

  const form = useForm<z.infer<typeof insertCategorySchema>>({
    resolver: zodResolver(insertCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: CategoryType.CATEGORY_BUDGETS,
      icon: "circle-dashed",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xs"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crea una categoria</DialogTitle>
          <DialogDescription>
            Crea una nuova categoria per tracciare meglio le tue spese
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(execute)}
            className="scrollbar-hide relative overflow-auto"
          >
            <div className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icona</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild className="flex">
                          <Button variant="outline" size="icon">
                            <Icon
                              name={
                                field.value as keyof typeof dynamicIconImports
                              }
                              className="h-4 w-4"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Icone
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Seleziona l&apos;icona che meglio rappresenta la
                                tua categoria
                              </p>
                            </div>
                            <div className="grid gap-4">
                              {CATEGORY_ICONS.map((icon) => {
                                return (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => form.setValue("icon", icon)}
                                  >
                                    <Icon name={icon} className="h-4 w-4" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Holidays" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CategoryType).map((type, index) => {
                        return (
                          <SelectItem value={type} key={index}>
                            {type}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="bg-background pt-6">
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? (
                  <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
