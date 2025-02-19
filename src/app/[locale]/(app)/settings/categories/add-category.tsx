"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, CircleDashedIcon, Loader2Icon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useAction } from "next-safe-action/hooks";
import { useQueryState } from "nuqs";
import { HslColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { CategoryInsertSchema } from "~/lib/validators";
import { createCategoryAction } from "~/server/actions";
import { type DB_CategoryType } from "~/server/db/schema/categories";

function AddCategoryForm({
  categories,
  onComplete,
  className,
}: {
  categories: DB_CategoryType[];
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const { execute, isExecuting, reset } = useAction(createCategoryAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione creata!");
      reset();
      onComplete();
    },
  });

  const form = useForm<z.infer<typeof CategoryInsertSchema>>({
    resolver: zodResolver(CategoryInsertSchema),
    defaultValues: {
      color: "",
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
        className={cn("flex h-full flex-col gap-6", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid w-full grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
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
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Categoria padre (optional)</FormLabel>
                <CategoryPicker
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                  options={categories}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="attchament">
            <AccordionTrigger>Personalizza</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>Icona</FormLabel>
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
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="col-span-2 flex w-full flex-col">
                      <FormLabel>Colore</FormLabel>
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
                Creo categoria...
              </>
            ) : (
              "Aggiungi categoria"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AddCategoryDrawerDialog({
  categories,
}: {
  categories: DB_CategoryType[];
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useQueryState("add");

  console.log(open);

  const handleClose = () => {
    void setOpen(null);
  };

  if (isMobile) {
    return (
      <Drawer open={open !== null} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Crea una nuova categoria</DrawerTitle>
            <DrawerDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </DrawerDescription>
          </DrawerHeader>
          <AddCategoryForm
            className="px-4"
            categories={categories}
            onComplete={handleClose}
          />
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" asChild>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Crea una nuova categoria</SheetTitle>
            <SheetDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </SheetDescription>
          </SheetHeader>
          <AddCategoryForm categories={categories} onComplete={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
