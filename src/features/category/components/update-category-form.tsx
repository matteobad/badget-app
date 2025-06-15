import type { dynamicIconImports } from "lucide-react/dynamic";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CategoryPicker } from "~/components/forms/category-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { ChevronsUpDown, CircleDashedIcon, Loader2Icon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useAction } from "next-safe-action/hooks";
import { HslColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod/v4";

import { updateCategoryAction } from "../server/actions";
import { CategoryUpdateSchema } from "../utils/schemas";

export default function UpdateCategoryForm({
  categories,
  category,
  onComplete,
  className,
}: {
  categories: DB_CategoryType[];
  category: DB_CategoryType;
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const { execute, isExecuting, reset } = useAction(updateCategoryAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      toast.success(data?.message);
      reset();
      onComplete();
    },
  });

  const form = useForm<z.infer<typeof CategoryUpdateSchema>>({
    resolver: standardSchemaResolver(CategoryUpdateSchema),
    defaultValues: {
      ...category,
      description: category.description ?? undefined,
    },
  });

  const icons: Array<keyof typeof dynamicIconImports> = [
    "hand-coins",
    "airplay",
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("mt-8 flex h-full flex-col", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid w-full grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Nome categoria</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder=""
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    onChange={(event) => {
                      field.onChange(event);
                      form.setValue(
                        "slug",
                        event.target.value.replaceAll(" ", "_").toLowerCase(),
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sottocategoria di</FormLabel>
                <CategoryPicker
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                  options={categories.filter((c) => c.id !== category.id)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Descrizione (opzionale)</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="multiple">
          <AccordionItem value="icon">
            <AccordionTrigger className="text-sm">Icona</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel className="sr-only">Icona</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                <div className="flex items-center gap-2">
                                  <DynamicIcon
                                    size={16}
                                    name={
                                      icons.find(
                                        (icon) => icon === field.value,
                                      ) ?? "circle-dashed"
                                    }
                                  />
                                  {icons.find((icon) => icon === field.value) ??
                                    "circle-dashed"}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <CircleDashedIcon />
                                  Select icon
                                </div>
                              )}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search framework..." />
                            <CommandList>
                              <CommandEmpty>No icon found.</CommandEmpty>
                              <CommandGroup>
                                {icons.map((icon) => (
                                  <CommandItem
                                    className="gap-2"
                                    value={icon}
                                    key={icon}
                                    onSelect={() => {
                                      form.setValue("icon", icon);
                                    }}
                                  >
                                    <DynamicIcon size={16} name={icon} />
                                    {icon}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="color">
            <AccordionTrigger className="text-sm">Colore</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="col-span-2 flex w-full flex-col">
                      <FormLabel className="sr-only">Colore</FormLabel>
                      <FormControl>
                        <HslColorPicker
                          className="w-full!"
                          {...field}
                          onChange={({ h, s, l }) => {
                            form.setValue("color", `${h} ${s}% ${l}%`);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button className="w-full" type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Modifico categoria...
              </>
            ) : (
              "Modifica categoria"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
